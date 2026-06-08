import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  password?: string;
  studentId: string;
  campusId: string;
  role: 'student' | 'guard' | 'admin';
  whatsapp?: string;
  createdAt: Date;
}

const StudentSchema: Schema = new Schema({
  name:       { type: String, required: true },
  email:      { type: String, unique: true, required: true },
  password:   { type: String, required: true },
  studentId:  { type: String, unique: true, required: true },
  campusId:   { type: String, default: 'futminna' },
  role:       { type: String, enum: ['student', 'guard', 'admin'], default: 'student' },
  whatsapp:   { type: String },
  createdAt:  { type: Date, default: Date.now }
});

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
