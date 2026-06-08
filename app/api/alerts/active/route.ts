import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Alert from '@/models/Alert';
import Student from '@/models/Student'; // ensures the ref resolves

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const activeAlerts = await Alert.find({ status: 'ACTIVE' })
      .populate('studentId', 'name studentId whatsapp')
      .sort({ createdAt: -1 });

    return NextResponse.json({ alerts: activeAlerts }, { status: 200 });
  } catch (error: any) {
    console.error('Fetch Active Alerts Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
