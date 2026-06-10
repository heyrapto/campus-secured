import mongoose, { Schema, Document } from 'mongoose';

export interface IStudent extends Document {
  name: string;
  email: string;
  password?: string;
  studentId: string;
  campusId: string;
  role: 'student' | 'guard' | 'admin';
  whatsapp?: string;
  falseAlarms: number;
  status: 'active' | 'suspended';
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
  falseAlarms:{ type: Number, default: 0 },
  status:     { type: String, enum: ['active', 'suspended'], default: 'active' },
  createdAt:  { type: Date, default: Date.now }
});

export default mongoose.models.Student || mongoose.model<IStudent>('Student', StudentSchema);
