import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyAuth } from '@/utils/auth';
import { sendError, sendSuccess } from '@/utils/response';
import { HTTP_STATUS } from '@/config/constants';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return sendError(
      res,
      `Method ${req.method} not allowed`,
      HTTP_STATUS.METHOD_NOT_ALLOWED
    );
  }

  const user = verifyAuth(req);

  if (!user) {
    return sendError(
      res,
      'Not authenticated',
      HTTP_STATUS.UNAUTHORIZED
    );
  }

  return sendSuccess(
    res,
    {
      authenticated: true,
      email: user.email,
    },
    HTTP_STATUS.OK
  );
}

