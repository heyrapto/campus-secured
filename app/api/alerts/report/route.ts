import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Alert from '@/models/Alert';
import Student from '@/models/Student';
import EmergencyContact from '@/models/EmergencyContact';
import { redis } from '@/lib/redis';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { lat, lng, type, description, landmark, targetStudentId } = await req.json();
    
    if (!lat || !lng || !type || !landmark) {
      return NextResponse.json({ error: 'Missing required fields (location, type, or landmark)' }, { status: 400 });
    }

    await connectDB();

    const reporterUserId = (session.user as any).id;
    
    // Rate limit: max 5 reports per minute per reporter
    const key = `report:ratelimit:${reporterUserId}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60);
    if (count > 5) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

    // Look up target student if provided
    let targetStudent = null;
    if (targetStudentId && targetStudentId.trim()) {
      targetStudent = await Student.findOne({ studentId: targetStudentId.trim() });
    }

    const trackToken = crypto.randomUUID();
    const alert = await Alert.create({
      reporterId: reporterUserId,
      studentId: targetStudent ? targetStudent._id : null,
      lat,
      lng,
      type,
      landmark,
      description: description || '',
      trackToken
    });

    // Cache location in Redis (6 hour TTL)
    await redis.set(`location:${trackToken}`, JSON.stringify({ lat, lng }), { ex: 21600 });

    const botUrl = process.env.WA_BOT_URL || 'http://localhost:3001';

    // Build the broadcast message
    const victimText = targetStudent ? `Victim: ${targetStudent.name}` : `Victim: Unknown / Anonymous`;
    const message = `🚨 WITNESS INCIDENT REPORTED\nType: ${type}\nLocation: ${landmark}\n${victimText}\nDescription: ${description || 'No description provided'}\nTime: ${new Date().toLocaleTimeString('en-US')}\n⚠️ Alert level: high. Avoid the area. Security notified.`;

    // Broadcast to all students in FUTMINNA
    const students = await Student.find(
      { campusId: 'futminna', whatsapp: { $exists: true } },
      'whatsapp'
    );
    const numbers = students.map((s: any) => s.whatsapp).filter(Boolean);

    if (numbers.length > 0) {
      fetch(`${botUrl}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          numbers,
          message
        })
      }).catch(e => console.error('Witness broadcast failed', e));
    }

    // Notify personal emergency contacts of the victim (if victim is identified)
    if (targetStudent) {
      const contacts = await EmergencyContact.find({ studentId: targetStudent._id });
      if (contacts.length > 0) {
        fetch(`${botUrl}/notify-contacts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contacts,
            studentName: targetStudent.name,
            alertId: trackToken,
            incidentType: type
          })
        }).catch(e => console.error('Witness victim contacts notification failed', e));
      }
    }

    // Notify WS Server
    fetch(`${botUrl}/ws/broadcast-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alert: {
          ...alert.toObject(),
          studentId: targetStudent ? { name: targetStudent.name } : null
        }
      })
    }).catch(e => console.error('WS broadcast failed', e));

    return NextResponse.json({ alertId: alert._id, trackToken }, { status: 201 });
  } catch (error: any) {
    console.error('Report Nearby Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
