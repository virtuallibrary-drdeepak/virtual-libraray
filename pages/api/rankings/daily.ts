/**
 * Daily Ranking API
 * GET /api/rankings/daily?date=YYYY-MM-DD&limit=100
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { AttendanceService } from '@/services/attendance.service';
import { RankingService } from '@/services/ranking.service';
import { sendSuccess, sendError } from '@/utils/response';
import { HTTP_STATUS, RANKING } from '@/config/constants';
import { ApiResponse, RankingEntry } from '@/types/api.types';

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
    const { date: dateStr, limit: limitStr, search } = req.query;

    // Default to today if no date provided
    const date = dateStr
      ? new Date(dateStr as string)
      : new Date();

    // Validate date
    if (isNaN(date.getTime())) {
      return sendError(
        res,
        'Invalid date format. Use YYYY-MM-DD',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Parse limit
    const limit = limitStr
      ? parseInt(limitStr as string)
      : RANKING.DEFAULT_LIMIT;

    // Get daily ranking
    const ranking = await AttendanceService.getDailyRanking(date);

    if (!ranking) {
      return sendError(
        res,
        `No ranking data found for ${date.toISOString().split('T')[0]}`,
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Apply filters
    let filteredRankings = ranking.rankings;
    
    if (search) {
      filteredRankings = RankingService.filterRankings(filteredRankings, {
        searchQuery: search as string,
      });
    }

    // Apply limit
    filteredRankings = filteredRankings.slice(0, limit);

    // Get statistics
    const statistics = RankingService.getRankingStatistics(ranking.rankings);

    // Format response
    const response = {
      date: ranking.date.toISOString().split('T')[0],
      rankings: filteredRankings.map(r => ({
        rank: r.rank,
        fullName: r.fullName,
        firstName: r.firstName,
        lastName: r.lastName,
        email: r.email,
        totalDuration: r.totalDuration,
        totalDurationFormatted: r.totalDurationFormatted,
        sessionCount: r.sessionCount,
      })),
      totalParticipants: ranking.totalParticipants,
      computedAt: ranking.computedAt.toISOString(),
      statistics,
    };

    return sendSuccess(res, response, HTTP_STATUS.OK);
  } catch (error: any) {
    console.error('Daily ranking error:', error);
    return sendError(
      res,
      error.message || 'Failed to fetch daily ranking',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

