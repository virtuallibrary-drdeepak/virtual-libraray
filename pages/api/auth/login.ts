import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAdminCredentials, generateToken, setAuthCookie } from '@/utils/auth';
import { sendError, sendSuccess } from '@/utils/response';
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
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return sendError(
        res,
        'Email and password are required',
        HTTP_STATUS.BAD_REQUEST
      );
    }

    // Verify credentials
    const isValid = await verifyAdminCredentials(email, password);

    if (!isValid) {
      return sendError(
        res,
        'Invalid email or password',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Generate JWT token
    const token = generateToken(email);

    // Set cookie
    setAuthCookie(res, token);

    return sendSuccess(
      res,
      {
        message: 'Login successful',
        email,
      },
      HTTP_STATUS.OK
    );
  } catch (error: any) {
    console.error('Login error:', error);
    return sendError(
      res,
      'Login failed',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

