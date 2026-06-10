import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'guard')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, actionType } = await req.json();

    if (!userId || !actionType) {
      return NextResponse.json({ error: 'Missing userId or actionType' }, { status: 400 });
    }

    await connectDB();
    const user = await Student.findById(userId);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    switch (actionType) {
      case 'FLAG_FALSE_ALARM':
        user.falseAlarms = (user.falseAlarms || 0) + 1;
        break;
      case 'SUSPEND':
        user.status = 'suspended';
        break;
      case 'ACTIVATE':
        user.status = 'active';
        break;
      default:
        return NextResponse.json({ error: 'Invalid action type' }, { status: 400 });
    }

    await user.save();
    return NextResponse.json({ success: true, user });
  } catch (error) {
    console.error('Error performing user action:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
