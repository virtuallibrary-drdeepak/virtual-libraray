/**
 * API: Get Current User
 * GET /api/auth/user/me
 * Returns current authenticated user's information
 */

import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyUserAuth } from '@/utils/auth';
import { User } from '@/models';
import { sendError, sendSuccess } from '@/utils/response';
import { HTTP_STATUS } from '@/config/constants';
import connectDB from '@/lib/mongodb';

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

  try {
    // Verify authentication
    const authData = verifyUserAuth(req);

    if (!authData) {
      return sendError(
        res,
        'Unauthorized. Please login.',
        HTTP_STATUS.UNAUTHORIZED
      );
    }

    // Get user from database
    await connectDB();
    const user = await User.findById(authData.userId);

    if (!user) {
      return sendError(
        res,
        'User not found',
        HTTP_STATUS.NOT_FOUND
      );
    }

    // Check if user is blocked
    if (user.isCurrentlyBlocked()) {
      return sendError(
        res,
        'Your account has been suspended. Please contact support.',
        HTTP_STATUS.FORBIDDEN,
        { reason: user.blockedReason }
      );
    }

    // Return user data
    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
          profilePicture: user.profilePicture,
          examType: user.examType,
          targetYear: user.targetYear,
          isPremium: user.isPremiumActive(),
          premiumExpiresAt: user.premiumExpiresAt,
          currentStreak: user.currentStreak,
          longestStreak: user.longestStreak,
          totalPoints: user.totalPoints,
          lastActiveDate: user.lastActiveDate,
          status: user.status,
          createdAt: user.createdAt,
        },
      },
      HTTP_STATUS.OK
    );
  } catch (error: any) {
    console.error('Get User API Error:', error);
    return sendError(
      res,
      'Failed to fetch user data',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

