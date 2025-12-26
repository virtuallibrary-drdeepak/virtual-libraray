/**
 * Health Check API
 * GET /api/healthcheck - Check database and system health
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { HealthService } from '@/services/health.service';
import { sendError } from '@/utils/response';
import { HealthCheckData, ApiResponse } from '@/types/api.types';
import { HTTP_STATUS } from '@/config/constants';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<HealthCheckData | ApiResponse>
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
    // Delegate to service layer
    const healthData = await HealthService.checkDatabase();

    // Determine status code based on health
    const statusCode =
      healthData.status === 'healthy'
        ? HTTP_STATUS.OK
        : HTTP_STATUS.SERVICE_UNAVAILABLE;

    return res.status(statusCode).json(healthData);
  } catch (error: any) {
    return sendError(
      res,
      error.message || 'Health check failed',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}
