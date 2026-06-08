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

    const { lat, lng, type } = await req.json();
    
    if (!lat || !lng || !type) {
      return NextResponse.json({ error: 'Missing location or type' }, { status: 400 });
    }

    await connectDB();

    const userId = (session.user as any).id;
    
    // Rate limit: max 3 SOS per minute per user
    const key = `sos:ratelimit:${userId}`;
    const count = await redis.incr(key);
    if (count === 1) await redis.expire(key, 60);
    if (count > 3) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

    const trackToken = crypto.randomUUID();
    const alert = await Alert.create({
      studentId: userId,
      lat,
      lng,
      type,
      trackToken
    });

    // Cache location in Redis (6 hour TTL)
    await redis.set(`location:${trackToken}`, JSON.stringify({ lat, lng }), { ex: 21600 });

    const botUrl = process.env.WA_BOT_URL || 'http://localhost:3001';

    // Broadcast to all students
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
          message: `🚨 CAMPUS ALERT\nIncident: ${type}\nTime: ${new Date().toLocaleTimeString('en-US')}\n⚠️ Avoid the area. Security notified.`
        })
      }).catch(e => console.error('Broadcast failed', e));
    }

    // Notify personal emergency contacts
    const contacts = await EmergencyContact.find({ studentId: userId });
    if (contacts.length > 0) {
      fetch(`${botUrl}/notify-contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contacts,
          studentName: session.user.name,
          alertId: trackToken,
          incidentType: type
        })
      }).catch(e => console.error('Contact notification failed', e));
    }

    // Notify WS Server
    fetch(`${botUrl}/ws/broadcast-alert`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        alert: {
          ...alert.toObject(),
          studentId: { name: session.user.name }
        }
      })
    }).catch(e => console.error('WS broadcast failed', e));

    return NextResponse.json({ alertId: alert._id, trackToken }, { status: 201 });
  } catch (error: any) {
    console.error('Trigger SOS Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
