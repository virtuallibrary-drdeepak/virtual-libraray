/**
 * API: Send OTP
 * POST /api/auth/user/send-otp
 * Sends OTP to user's email or phone for authentication
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { sendOTP } from '@/services/otp.service';
import { sendError, sendSuccess } from '@/utils/response';
import { HTTP_STATUS } from '@/config/constants';
import { OTPPurpose } from '@/models';

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
    const { identifier, purpose = OTPPurpose.LOGIN } = req.body;

    // Validate input
    if (!identifier) {
      return sendError(
        res,
        'Email or phone number is required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Get IP and User-Agent for security tracking
    const ipAddress = getClientIP(req);
    const userAgent = req.headers['user-agent'] || 'unknown';

    // Send OTP
    const result = await sendOTP(identifier, purpose, ipAddress, userAgent);

    if (!result.success) {
      const statusCode = 
        result.error === 'RATE_LIMITED' ? HTTP_STATUS.TOO_MANY_REQUESTS :
        result.error === 'COOLDOWN_ACTIVE' ? HTTP_STATUS.TOO_MANY_REQUESTS :
        result.error === 'PHONE_NOT_SUPPORTED' ? HTTP_STATUS.BAD_REQUEST :
        HTTP_STATUS.BAD_REQUEST;

      return sendError(res, result.message, statusCode, {
        error: result.error,
        canResendAt: result.canResendAt,
      });
    }

    return sendSuccess(
      res,
      {
        message: result.message,
        expiresIn: result.expiresIn,
      },
      HTTP_STATUS.OK
    );
  } catch (error: any) {
    console.error('Send OTP API Error:', error);
    return sendError(
      res,
      'Failed to send OTP. Please try again.',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

