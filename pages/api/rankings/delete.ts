/**
 * Delete Ranking API
 * DELETE /api/rankings/delete?date=YYYY-MM-DD
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { AttendanceService } from '@/services/attendance.service';
import { sendSuccess, sendError } from '@/utils/response';
import { HTTP_STATUS } from '@/config/constants';
import { ApiResponse } from '@/types/api.types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow DELETE method
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return sendError(
      res,
      `Method ${req.method} not allowed`,
      HTTP_STATUS.METHOD_NOT_ALLOWED
    );
  }

  try {
    // Get query parameters
    const { date: dateStr } = req.query;

    // Validate date parameter
    if (!dateStr || typeof dateStr !== 'string') {
      return sendError(
        res,
        'Date is required (YYYY-MM-DD format)',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Parse and validate date
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      return sendError(
        res,
        'Invalid date format. Use YYYY-MM-DD',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Check if data exists before deleting
    const existingRanking = await AttendanceService.getDailyRanking(date);
    const existingRecord = await AttendanceService.getAttendanceRecord(date);

    if (!existingRanking && !existingRecord) {
      return sendError(
        res,
        `No data found for ${dateStr}`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Delete the data
    await AttendanceService.deleteByDate(date);

    // Return success response
    return sendSuccess(
      res,
      {
        date: dateStr,
        message: 'Data deleted successfully',
        deleted: {
          attendanceRecord: !!existingRecord,
          dailyRanking: !!existingRanking,
        },
      },
      HTTP_STATUS.OK
    );
  } catch (error: any) {
    console.error('Delete error:', error);
    return sendError(
      res,
      error.message || 'Failed to delete data',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

