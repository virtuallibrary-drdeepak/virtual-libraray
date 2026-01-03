/**
 * Admin API - Get Payment Statistics
 * Returns all payments with user details
 */

import { NextApiRequest, NextApiResponse } from 'next';
import { sendSuccess, sendError } from '@/utils/response';
import { HTTP_STATUS } from '@/config/constants';
import { verifyUserAuth } from '@/utils/auth';
import connectDB from '@/lib/mongodb';
import { Payment, User } from '@/models';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return sendError(res, 'Method not allowed', HTTP_STATUS.METHOD_NOT_ALLOWED);
  }

  try {
    await connectDB();

    // Verify admin authentication
    const authData = verifyUserAuth(req);
    if (!authData) {
      return sendError(res, 'Unauthorized', HTTP_STATUS.UNAUTHORIZED);
    }

    // Get user and verify admin role
    const user = await User.findById(authData.userId);
    if (!user || user.role !== 'admin') {
      return sendError(res, 'Admin access required', HTTP_STATUS.FORBIDDEN);
    }

    // Get query parameters for pagination and filtering
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const skip = (page - 1) * limit;
    const startDate = req.query.startDate as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    // Build query filter
    const query: any = {};
    
    // Date filter
    if (startDate) {
      query.createdAt = { $gte: new Date(startDate) };
    }

    // Status filter
    if (status && status !== 'all') {
      if (status === 'abandoned') {
        // Abandoned = all non-success payments (failed, pending, stuck, created)
        query.status = { $ne: 'success' };
      } else {
        query.status = status;
      }
    }

    // Search filter (name, email, phone, razorpay IDs)
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
        { razorpayOrderId: { $regex: search, $options: 'i' } },
        { razorpayPaymentId: { $regex: search, $options: 'i' } },
      ];
    }

    // Fetch payments with user details
    const payments = await Payment.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Build base query for stats (without status filter for accurate counts)
    const baseQuery: any = {};
    if (startDate) {
      baseQuery.createdAt = { $gte: new Date(startDate) };
    }
    if (search) {
      baseQuery.$or = query.$or; // Use same search criteria
    }

    // Get total count with current filter
    const totalPayments = await Payment.countDocuments(query);
    
    // Get stats with base query (ignoring status filter for button counts)
    const successfulPayments = await Payment.countDocuments({ 
      ...baseQuery, 
      status: 'success' 
    });
    const abandonedPayments = await Payment.countDocuments({
      ...baseQuery,
      status: { $ne: 'success' }
    });
    const totalRevenue = await Payment.aggregate([
      { $match: { ...baseQuery, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);

    // Get user details for each payment if userId exists
    const paymentsWithUsers = await Promise.all(
      payments.map(async (payment: any) => {
        let userDetails = null;
        if (payment.userId) {
          const paymentUser = await User.findById(payment.userId).lean();
          if (paymentUser) {
            userDetails = {
              id: paymentUser._id,
              name: paymentUser.name,
              email: paymentUser.email,
              phone: paymentUser.phone,
            };
          }
        }

        return {
          id: payment._id,
          amount: payment.amount,
          currency: payment.currency,
          status: payment.status,
          razorpayOrderId: payment.razorpayOrderId,
          razorpayPaymentId: payment.razorpayPaymentId,
          name: payment.name,
          email: payment.email,
          phone: payment.phone,
          examType: payment.examType,
          couponCode: payment.couponCode,
          discountPercentage: payment.discountPercentage,
          createdAt: payment.createdAt,
          paidAt: payment.paidAt,
          user: userDetails, // Linked user account if exists
        };
      })
    );

    return sendSuccess(
      res,
      {
        payments: paymentsWithUsers,
        stats: {
          total: successfulPayments + abandonedPayments, // Total based on actual counts
          successful: successfulPayments,
          abandoned: abandonedPayments,
          totalRevenue: totalRevenue[0]?.total || 0,
        },
        pagination: {
          page,
          limit,
          total: totalPayments,
          pages: Math.ceil(totalPayments / limit),
        },
      },
      HTTP_STATUS.OK
    );
  } catch (error: any) {
    console.error('Admin Payments API Error:', error);
    return sendError(
      res,
      'Failed to fetch payments',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

