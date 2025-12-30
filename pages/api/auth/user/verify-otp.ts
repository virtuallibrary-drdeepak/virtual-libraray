/**
 * API: Verify OTP
 * POST /api/auth/user/verify-otp
 * Verifies OTP and authenticates user
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyOTP } from '@/services/otp.service';
import { generateUserToken, setUserAuthCookie } from '@/utils/auth';
import { sendError, sendSuccess } from '@/utils/response';
import { HTTP_STATUS } from '@/config/constants';

/**
 * Get client IP address
 */
function getClientIP(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = forwarded
    ? (typeof forwarded === 'string' ? forwarded.split(',')[0] : forwarded[0])
    : req.socket.remoteAddress;
  return ip || 'unknown';
}

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
    const { identifier, otp, name } = req.body;

    // Validate input
    if (!identifier || !otp) {
      return sendError(
        res,
        'Email/phone and OTP are required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return sendError(
        res,
        'OTP must be 6 digits',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Get IP for tracking
    const ipAddress = getClientIP(req);

    // Verify OTP
    const result = await verifyOTP(identifier, otp, ipAddress, name);

    if (!result.success) {
      const statusCode = 
        result.error === 'MAX_ATTEMPTS_EXCEEDED' ? HTTP_STATUS.TOO_MANY_REQUESTS :
        result.error === 'OTP_EXPIRED' ? HTTP_STATUS.BAD_REQUEST :
        HTTP_STATUS.BAD_REQUEST;

      return sendError(res, result.message, statusCode, {
        error: result.error,
        attemptsLeft: result.attemptsLeft,
      });
    }

    // Generate JWT token for the user
    const token = generateUserToken(result.user.id, result.user.email || result.user.phone);

    // Set authentication cookie
    setUserAuthCookie(res, token);

    return sendSuccess(
      res,
      {
        message: result.message,
        user: result.user,
        token, // Also return token for mobile apps
      },
      HTTP_STATUS.OK
    );
  } catch (error: any) {
    console.error('Verify OTP API Error:', error);
    return sendError(
      res,
      'Failed to verify OTP. Please try again.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

