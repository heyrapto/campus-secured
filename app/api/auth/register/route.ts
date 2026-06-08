import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/mongodb';
import Student from '@/models/Student';
import EmergencyContact from '@/models/EmergencyContact';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password, studentId, whatsapp, contacts } = await req.json();

    if (!name || !email || !password || !studentId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    await connectDB();

    const existingStudent = await Student.findOne({ $or: [{ email }, { studentId }] });
    if (existingStudent) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const student = await Student.create({
      name,
      email,
      password: hashedPassword,
      studentId,
      whatsapp,
    });

    if (contacts && Array.isArray(contacts)) {
      for (const contact of contacts) {
        if (contact.name && contact.phone) {
          await EmergencyContact.create({
            studentId: student._id,
            name: contact.name,
            phone: contact.phone,
            whatsapp: contact.whatsapp,
            relationship: contact.relationship,
          });
        }
      }
    }

    return NextResponse.json({ message: 'Registration successful' }, { status: 201 });
  } catch (error: any) {
    console.error('Registration Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
