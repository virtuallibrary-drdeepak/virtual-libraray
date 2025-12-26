import type { NextApiRequest, NextApiResponse } from 'next';
import { clearAuthCookie } from '@/utils/auth';
import { sendSuccess } from '@/utils/response';
import { HTTP_STATUS } from '@/config/constants';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(HTTP_STATUS.METHOD_NOT_ALLOWED).json({
      success: false,
      message: `Method ${req.method} not allowed`,
    });
  }

  // Clear the auth cookie
  clearAuthCookie(res);

  return sendSuccess(
    res,
    { message: 'Logout successful' },
    HTTP_STATUS.OK
  );
}

