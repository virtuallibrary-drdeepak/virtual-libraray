/**
 * Recalculate Rankings API
 * POST /api/rankings/recalculate
 * Body: { date?: "YYYY-MM-DD" } — omit date to recalculate all stored days
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { AttendanceService } from '@/services/attendance.service';
import { sendSuccess, sendError } from '@/utils/response';
import { HTTP_STATUS } from '@/config/constants';
import { ApiResponse } from '@/types/api.types';
import { verifyAuth } from '@/utils/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return sendError(
      res,
      `Method ${req.method} not allowed`,
      HTTP_STATUS.METHOD_NOT_ALLOWED
    );
  }

  if (!verifyAuth(req)) {
    return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
  }

  try {
    const dateStr =
      (typeof req.body?.date === 'string' && req.body.date) ||
      (typeof req.query.date === 'string' && req.query.date) ||
      undefined;

    if (dateStr) {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return sendError(
          res,
          'Invalid date format. Use YYYY-MM-DD',
          HTTP_STATUS.BAD_REQUEST
        );
      }

      const ranking = await AttendanceService.recalculateRankingForDate(date);
      if (!ranking) {
        return sendError(
          res,
          `No attendance record found for ${dateStr}`,
          HTTP_STATUS.NOT_FOUND
        );
      }

      return sendSuccess(res, {
        date: dateStr,
        totalParticipants: ranking.totalParticipants,
        computedAt: ranking.computedAt,
        message: 'Rankings recalculated successfully',
      });
    }

    const result = await AttendanceService.recalculateAllRankings();
    return sendSuccess(res, {
      message: 'All rankings recalculated successfully',
      ...result,
    });
  } catch (error: any) {
    console.error('Recalculate error:', error);
    return sendError(
      res,
      error.message || 'Failed to recalculate rankings',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
