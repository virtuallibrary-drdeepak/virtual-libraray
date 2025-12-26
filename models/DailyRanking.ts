/**
 * Daily Ranking Model
 * Stores computed daily rankings for Virtual Library
 */

import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRankingEntry {
  rank: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email?: string;
  totalDuration: number; // in minutes
  totalDurationFormatted: string; // "X hr Y min"
  sessionCount: number; // number of join/exit sessions
}

export interface IDailyRanking extends Document {
  date: Date;
  rankings: IRankingEntry[];
  totalParticipants: number;
  computedAt: Date;
  attendanceRecordId: mongoose.Types.ObjectId;
}

const RankingEntrySchema = new Schema<IRankingEntry>(
  {
    rank: { type: Number, required: true, min: 1 },
    fullName: { type: String, required: true, trim: true },
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: false, trim: true, default: '' },
    email: { type: String, trim: true, lowercase: true },
    totalDuration: { type: Number, required: true, min: 0 },
    totalDurationFormatted: { type: String, required: true },
    sessionCount: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const DailyRankingSchema = new Schema<IDailyRanking>(
  {
    date: { type: Date, required: true, unique: true, index: true },
    rankings: { type: [RankingEntrySchema], required: true },
    totalParticipants: { type: Number, required: true, min: 0 },
    computedAt: { type: Date, default: Date.now },
    attendanceRecordId: {
      type: Schema.Types.ObjectId,
      ref: 'AttendanceRecord',
      required: true,
    },
  },
  { timestamps: true }
);

// Index for efficient date range queries
DailyRankingSchema.index({ date: -1 });

const DailyRanking: Model<IDailyRanking> =
  mongoose.models.DailyRanking ||
  mongoose.model<IDailyRanking>('DailyRanking', DailyRankingSchema);

export default DailyRanking;

