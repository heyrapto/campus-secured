import mongoose, { Schema, Document } from 'mongoose';

export interface IAlert extends Document {
  studentId?: mongoose.Types.ObjectId;
  reporterId?: mongoose.Types.ObjectId;
  campusId: string;
  type: 'ROBBERY' | 'MEDICAL' | 'KIDNAP' | 'HARASSMENT' | 'ACCIDENT' | 'FIRE' | 'THEFT' | 'OTHER';
  status: 'ACTIVE' | 'RESOLVED' | 'CANCELLED';
  lat: number;
  lng: number;
  trackToken: string;
  landmark?: string;
  description?: string;
  resolvedAt?: Date;
  createdAt: Date;
}

const AlertSchema: Schema = new Schema({
  studentId:  { type: Schema.Types.ObjectId, ref: 'Student', required: false },
  reporterId: { type: Schema.Types.ObjectId, ref: 'Student', required: false },
  campusId:   { type: String, default: 'futminna' },
  type:       { type: String, enum: ['ROBBERY', 'MEDICAL', 'KIDNAP', 'HARASSMENT', 'ACCIDENT', 'FIRE', 'THEFT', 'OTHER'], required: true },
  status:     { type: String, enum: ['ACTIVE', 'RESOLVED', 'CANCELLED'], default: 'ACTIVE' },
  lat:        { type: Number, required: true },
  lng:        { type: Number, required: true },
  trackToken: { type: String, unique: true },
  landmark:   { type: String },
  description:{ type: String },
  resolvedAt: { type: Date },
  createdAt:  { type: Date, default: Date.now }
});

AlertSchema.index({ campusId: 1, status: 1 });
AlertSchema.index({ createdAt: -1 });

export default mongoose.models.Alert || mongoose.model<IAlert>('Alert', AlertSchema);
