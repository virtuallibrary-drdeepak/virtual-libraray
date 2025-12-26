/**
 * Attendance Record Model
 * Stores raw attendance data from Google Meet
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAttendanceEntry {
  firstName: string;
  lastName: string;
  email?: string;
  duration: number; // in minutes
  timeJoined: Date;
  timeExited: Date;
}

export interface IAttendanceRecord extends Document {
  date: Date;
  entries: IAttendanceEntry[];
  fileName: string;
  fileType: 'pdf' | 'xlsx';
  uploadedAt: Date;
  processedAt?: Date;
  status: 'pending' | 'processed' | 'failed';
  errorMessage?: string;
}

const AttendanceEntrySchema = new Schema<IAttendanceEntry>(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: false, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true },
    duration: { type: Number, required: true, min: 0 },
    timeJoined: { type: Date, required: true },
    timeExited: { type: Date, required: true },
  },
  { _id: false }
);

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    date: { type: Date, required: true, index: true },
    entries: { type: [AttendanceEntrySchema], required: true },
    fileName: { type: String, required: true },
    fileType: { type: String, enum: ['pdf', 'xlsx'], required: true },
    uploadedAt: { type: Date, default: Date.now },
    processedAt: { type: Date },
    status: {
      type: String,
      enum: ['pending', 'processed', 'failed'],
      default: 'pending',
    },
    errorMessage: { type: String },
  },
  { timestamps: true }
);

// Compound index for efficient date-based queries
AttendanceRecordSchema.index({ date: 1, status: 1 });

// Prevent duplicate uploads for same date and file
AttendanceRecordSchema.index({ date: 1, fileName: 1 }, { unique: true });

const AttendanceRecord: Model<IAttendanceRecord> =
  mongoose.models.AttendanceRecord ||
  mongoose.model<IAttendanceRecord>('AttendanceRecord', AttendanceRecordSchema);

export default AttendanceRecord;

