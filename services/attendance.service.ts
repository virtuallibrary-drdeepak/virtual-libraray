/**
 * Attendance Service
 * Handles attendance record storage and retrieval
 */

import connectDB from '@/lib/mongodb';
import AttendanceRecord, { IAttendanceRecord, IAttendanceEntry } from '@/models/AttendanceRecord';
import DailyRanking, { IDailyRanking, IRankingEntry } from '@/models/DailyRanking';
import { FileParserService } from './file-parser.service';
import { RankingService } from './ranking.service';
import { ParsedAttendanceData } from '@/types/ranking.types';

export class AttendanceService {
  /**
   * Upload and process attendance file
   */
  static async uploadAttendance(
    buffer: Buffer,
    date: Date,
    fileName: string,
    fileType: 'pdf' | 'xlsx'
  ): Promise<{
    record: IAttendanceRecord;
    ranking: IDailyRanking;
  }> {
    await connectDB();

    // Parse the file
    let parsedData: ParsedAttendanceData;
    if (fileType === 'xlsx') {
      parsedData = await FileParserService.parseXLSX(buffer);
    } else {
      parsedData = await FileParserService.parsePDF(buffer);
    }

    // Convert parsed entries to attendance entries
    const entries: IAttendanceEntry[] = parsedData.entries.map(entry => ({
      firstName: entry.firstName,
      lastName: entry.lastName,
      email: entry.email,
      duration: entry.duration,
      timeJoined: entry.timeJoined,
      timeExited: entry.timeExited,
    }));

    // Check if record already exists for this date
    const existingRecord = await AttendanceRecord.findOne({ date });
    if (existingRecord) {
      // Update existing record
      existingRecord.entries = entries;
      existingRecord.fileName = fileName;
      existingRecord.fileType = fileType;
      existingRecord.status = 'processed';
      existingRecord.processedAt = new Date();
      await existingRecord.save();

      // Recalculate rankings
      const ranking = await this.calculateAndStoreRanking(existingRecord);
      return { record: existingRecord, ranking };
    }

    // Create new attendance record
    const record = await AttendanceRecord.create({
      date,
      entries,
      fileName,
      fileType,
      status: 'processed',
      processedAt: new Date(),
    });

    // Calculate and store rankings
    const ranking = await this.calculateAndStoreRanking(record);

    return { record, ranking };
  }

  /**
   * Calculate rankings from attendance record and store in database
   */
  static async calculateAndStoreRanking(
    record: IAttendanceRecord
  ): Promise<IDailyRanking> {
    await connectDB();

    // Convert to parsed format for ranking calculation
    const parsedEntries = record.entries.map(entry => ({
      firstName: entry.firstName,
      lastName: entry.lastName,
      email: entry.email,
      duration: entry.duration,
      timeJoined: entry.timeJoined,
      timeExited: entry.timeExited,
    }));

    // Calculate rankings
    const rankings: IRankingEntry[] = RankingService.processAttendanceData(parsedEntries);

    // Check if ranking already exists for this date
    const existingRanking = await DailyRanking.findOne({ date: record.date });
    if (existingRanking) {
      // Update existing ranking
      existingRanking.rankings = rankings;
      existingRanking.totalParticipants = rankings.length;
      existingRanking.computedAt = new Date();
      existingRanking.attendanceRecordId = record._id;
      await existingRanking.save();
      return existingRanking;
    }

    // Create new ranking
    const dailyRanking = await DailyRanking.create({
      date: record.date,
      rankings,
      totalParticipants: rankings.length,
      computedAt: new Date(),
      attendanceRecordId: record._id,
    });

    return dailyRanking;
  }

  /**
   * Get daily ranking by date
   */
  static async getDailyRanking(date: Date): Promise<IDailyRanking | null> {
    await connectDB();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await DailyRanking.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
    });
  }

  /**
   * Get rankings for a date range
   */
  static async getRankingsInRange(
    startDate: Date,
    endDate: Date
  ): Promise<IDailyRanking[]> {
    await connectDB();

    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    return await DailyRanking.find({
      date: { $gte: start, $lte: end },
    }).sort({ date: -1 });
  }

  /**
   * Get all rankings (paginated)
   */
  static async getAllRankings(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    rankings: IDailyRanking[];
    total: number;
    pages: number;
  }> {
    await connectDB();

    const skip = (page - 1) * limit;
    const total = await DailyRanking.countDocuments();
    const rankings = await DailyRanking.find()
      .sort({ date: -1 })
      .skip(skip)
      .limit(limit);

    return {
      rankings,
      total,
      pages: Math.ceil(total / limit),
    };
  }

  /**
   * Get attendance record by date
   */
  static async getAttendanceRecord(date: Date): Promise<IAttendanceRecord | null> {
    await connectDB();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return await AttendanceRecord.findOne({
      date: { $gte: startOfDay, $lte: endOfDay },
    });
  }

  /**
   * Delete attendance and ranking by date
   */
  static async deleteByDate(date: Date): Promise<void> {
    await connectDB();

    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    await AttendanceRecord.deleteOne({
      date: { $gte: startOfDay, $lte: endOfDay },
    });

    await DailyRanking.deleteOne({
      date: { $gte: startOfDay, $lte: endOfDay },
    });
  }
}

