import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import Student from '@/models/Student';
import { connectDB } from '@/lib/mongodb';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const role = (session.user as any).role;
    if (role !== 'admin' && role !== 'guard') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { message } = await req.json();
    if (!message) {
      return NextResponse.json({ error: 'Message required' }, { status: 400 });
    }

    await connectDB();

    const students = await Student.find(
      { campusId: 'futminna', whatsapp: { $exists: true } },
      'whatsapp'
    );
    const numbers = students.map((s: any) => s.whatsapp).filter(Boolean);

    const botUrl = process.env.WA_BOT_URL || 'http://localhost:3001';

    if (numbers.length > 0) {
      await fetch(`${botUrl}/broadcast`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ numbers, message })
      });
    }

    return NextResponse.json({ success: true, sent: numbers.length }, { status: 200 });
  } catch (error: any) {
    console.error('Broadcast Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
