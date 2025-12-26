import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Payment, { PaymentStatus } from '@/models/Payment';
import { apiResponse, apiError } from '@/utils/response';

/**
 * API Handler: Payment Statistics
 * GET /api/payment/stats
 * 
 * Returns aggregated payment statistics for dashboard
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return apiError(res, 'Method not allowed', 405);
  }

  try {
    // Connect to database
    await connectDB();

    // Get counts by status
    const statusCounts = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    // Get counts by exam type
    const examTypeCounts = await Payment.aggregate([
      {
        $match: { status: PaymentStatus.SUCCESS },
      },
      {
        $group: {
          _id: '$examType',
          count: { $sum: 1 },
        },
      },
    ]);

    // Get recent successful payments
    const recentPayments = await Payment.find({ status: PaymentStatus.SUCCESS })
      .sort({ paidAt: -1 })
      .limit(10)
      .select('name email amount paidAt examType')
      .lean();

    // Calculate total revenue
    const totalRevenue = await Payment.aggregate([
      {
        $match: { status: PaymentStatus.SUCCESS },
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
        },
      },
    ]);

    // Format statistics
    const stats = {
      byStatus: statusCounts.reduce((acc, item) => {
        acc[item._id] = {
          count: item.count,
          totalAmount: item.totalAmount / 100, // Convert from paise to rupees
        };
        return acc;
      }, {} as Record<string, any>),
      byExamType: examTypeCounts.reduce((acc, item) => {
        acc[item._id || 'general'] = item.count;
        return acc;
      }, {} as Record<string, number>),
      totalRevenue: totalRevenue[0]?.total / 100 || 0, // Convert from paise to rupees
      recentPayments: recentPayments.map(p => ({
        ...p,
        amount: p.amount / 100, // Convert from paise to rupees
      })),
    };

    return apiResponse(res, 'Statistics retrieved successfully', stats);
  } catch (error: any) {
    console.error('Error fetching payment statistics:', error);
    return apiError(res, 'Failed to fetch statistics', 500);
  }
}

