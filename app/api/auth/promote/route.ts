import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';

/**
 * POST /api/auth/promote
 * Promotes a user to a given role (admin | guard).
 * Requires a secret key in the request body matching ADMIN_SECRET env var.
 *
 * Body: { email: string, role: 'admin' | 'guard', secret: string }
 */
export async function POST(req: Request) {
  try {
    const { email, role, secret } = await req.json();

    const adminSecret = process.env.ADMIN_SECRET;
    if (!adminSecret || secret !== adminSecret) {
      return NextResponse.json({ error: 'Invalid secret' }, { status: 403 });
    }

    if (!email || !role) {
      return NextResponse.json({ error: 'Missing email or role' }, { status: 400 });
    }

    if (!['admin', 'guard'].includes(role)) {
      return NextResponse.json({ error: 'Role must be admin or guard' }, { status: 400 });
    }

    await connectDB();

    const user = await Student.findOneAndUpdate(
      { email },
      { role },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: `${user.name} has been promoted to ${role}`,
      user: { name: user.name, email: user.email, role: user.role }
    });
  } catch (error: any) {
    console.error('Promote Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
