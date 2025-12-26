/**
 * Ranking Range API
 * GET /api/rankings/range?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD&limit=100
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { AttendanceService } from '@/services/attendance.service';
import { sendSuccess, sendError } from '@/utils/response';
import { HTTP_STATUS, RANKING } from '@/config/constants';
import { ApiResponse } from '@/types/api.types';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) {
  // Only allow GET method
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return sendError(
      res,
      `Method ${req.method} not allowed`,
      HTTP_STATUS.METHOD_NOT_ALLOWED
    );
  }

  try {
    // Get query parameters
    const { startDate: startDateStr, endDate: endDateStr, limit: limitStr } = req.query;

    // Validate required parameters
    if (!startDateStr || !endDateStr) {
      return sendError(
        res,
        'Both startDate and endDate are required (YYYY-MM-DD format)',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Parse dates
    const startDate = new Date(startDateStr as string);
    const endDate = new Date(endDateStr as string);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return sendError(
        res,
        'Invalid date format. Use YYYY-MM-DD',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate date range
    if (startDate > endDate) {
      return sendError(
        res,
        'startDate must be before or equal to endDate',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Parse limit
    const limit = limitStr
      ? parseInt(limitStr as string)
      : RANKING.DEFAULT_LIMIT;

    // Get rankings in range
    const rankings = await AttendanceService.getRankingsInRange(startDate, endDate);

    if (rankings.length === 0) {
      return sendError(
        res,
        `No ranking data found between ${startDateStr} and ${endDateStr}`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Format response
    const response = {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      totalDays: rankings.length,
      rankings: rankings.map(ranking => ({
        date: ranking.date.toISOString().split('T')[0],
        totalParticipants: ranking.totalParticipants,
        computedAt: ranking.computedAt.toISOString(),
        topRankings: ranking.rankings.slice(0, limit).map(r => ({
          rank: r.rank,
          fullName: r.fullName,
          firstName: r.firstName,
          lastName: r.lastName,
          email: r.email,
          totalDuration: r.totalDuration,
          totalDurationFormatted: r.totalDurationFormatted,
          sessionCount: r.sessionCount,
        })),
      })),
    };

    return sendSuccess(res, response, HTTP_STATUS.OK);
  } catch (error: any) {
    console.error('Range ranking error:', error);
    return sendError(
      res,
      error.message || 'Failed to fetch rankings in range',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

