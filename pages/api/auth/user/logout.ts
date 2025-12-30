/**
 * API: User Logout
 * POST /api/auth/user/logout
 * Logs out the current user by clearing auth cookie
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { clearUserAuthCookie } from '@/utils/auth';
import { sendSuccess, sendError } from '@/utils/response';
import { HTTP_STATUS } from '@/config/constants';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return sendError(
      res,
      `Method ${req.method} not allowed`,
      HTTP_STATUS.METHOD_NOT_ALLOWED
    );
  }

  try {
    // Clear authentication cookie
    clearUserAuthCookie(res);

    return sendSuccess(
      res,
      {
        message: 'Logged out successfully',
      },
      HTTP_STATUS.OK
    );
  } catch (error: any) {
    console.error('Logout Error:', error);
    return sendError(
      res,
      'Logout failed',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

