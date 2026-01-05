/**
 * List All Rankings API
 * GET /api/rankings/list?page=1&limit=10
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { AttendanceService } from '@/services/attendance.service';
import { RankingService } from '@/services/ranking.service';
import { sendSuccess, sendError } from '@/utils/response';
import { HTTP_STATUS } from '@/config/constants';
import { PaginatedResponse } from '@/types/api.types';
import { verifyAuth } from '@/utils/auth';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<PaginatedResponse<any>>
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
    // Check if user is authenticated as admin
    const isAdmin = verifyAuth(req) !== null;

    // Get query parameters
    const { page: pageStr, limit: limitStr } = req.query;

    // Parse pagination parameters
    const page = pageStr ? parseInt(pageStr as string) : 1;
    const limit = limitStr ? parseInt(limitStr as string) : 10;

    // Validate pagination
    if (page < 1 || limit < 1 || limit > 100) {
      return sendError(
        res,
        'Invalid pagination parameters. Page must be >= 1, limit must be between 1 and 100',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Get all rankings with pagination
    const result = await AttendanceService.getAllRankings(page, limit);

    // Format response
    const data = result.rankings.map(ranking => {
      // Filter rankings for non-admin users
      const filteredRankings = isAdmin 
        ? ranking.rankings 
        : RankingService.filterForPublicView(ranking.rankings);
      
      return {
        date: ranking.date.toISOString().split('T')[0],
        totalParticipants: filteredRankings.length,
        computedAt: ranking.computedAt.toISOString(),
        topRanking: filteredRankings[0]
          ? {
              rank: filteredRankings[0].rank,
              fullName: filteredRankings[0].fullName,
              totalDurationFormatted: filteredRankings[0].totalDurationFormatted,
            }
          : null,
      };
    });

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total: result.total,
        pages: result.pages,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('List rankings error:', error);
    return sendError(
      res,
      error.message || 'Failed to fetch rankings list',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

