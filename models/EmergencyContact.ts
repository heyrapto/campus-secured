import mongoose, { Schema, Document } from 'mongoose';

export interface IEmergencyContact extends Document {
  studentId: mongoose.Types.ObjectId;
  name: string;
  phone: string;
  whatsapp?: string;
  relationship?: string;
}

const ContactSchema: Schema = new Schema({
  studentId:    { type: Schema.Types.ObjectId, ref: 'Student', required: true },
  name:         { type: String, required: true },
  phone:        { type: String, required: true },
  whatsapp:     { type: String },
  relationship: { type: String },
});

export default mongoose.models.EmergencyContact || mongoose.model<IEmergencyContact>('EmergencyContact', ContactSchema);
