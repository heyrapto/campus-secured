import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || ((session.user as any).role !== 'admin' && (session.user as any).role !== 'guard')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const users = await Student.find({ role: 'student' }).sort({ createdAt: -1 }).lean();

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
