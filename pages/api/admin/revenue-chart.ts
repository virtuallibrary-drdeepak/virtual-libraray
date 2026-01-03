/**
 * Admin API - Get Revenue Chart Data
 * Returns time-series revenue data for visualization
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

    // Get date range from query (default to last 30 days)
    const range = (req.query.range as string) || '30days';
    
    let startDate = new Date();
    let groupByFormat = '%Y-%m-%d'; // Daily by default
    
    switch (range) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(startDate.getDate() - 90);
        groupByFormat = '%Y-%m-%d';
        break;
      case '1year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        groupByFormat = '%Y-%m';
        break;
      case 'lifetime':
        startDate = new Date(2024, 0, 1); // Start from Jan 2024
        groupByFormat = '%Y-%m';
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Get revenue data grouped by date
    const revenueData = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          paidAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: groupByFormat, date: '$paidAt' }
          },
          revenue: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Get total revenue for current period
    const currentRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          paidAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 }
        }
      }
    ]);

    // Get previous period for comparison
    const periodDays = Math.ceil((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const previousStartDate = new Date(startDate);
    previousStartDate.setDate(previousStartDate.getDate() - periodDays);
    
    const previousRevenue = await Payment.aggregate([
      {
        $match: {
          status: 'success',
          paidAt: { $gte: previousStartDate, $lt: startDate }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ]);

    // Calculate growth percentage
    const current = currentRevenue[0]?.total || 0;
    const previous = previousRevenue[0]?.total || 0;
    
    // Calculate growth, but cap at reasonable values
    let growth = 0;
    if (previous === 0 && current > 0) {
      growth = null; // No previous data, show as "New" in UI
    } else if (previous > 0) {
      growth = ((current - previous) / previous) * 100;
      // Cap extreme percentages for display
      if (growth > 999) growth = 999;
      if (growth < -999) growth = -999;
    }

    return sendSuccess(
      res,
      {
        totalRevenue: current,
        previousRevenue: previous,
        growthPercentage: growth !== null ? Math.round(growth * 10) / 10 : null,
        transactionCount: currentRevenue[0]?.count || 0,
        chartData: revenueData.map(item => ({
          date: item._id,
          revenue: item.revenue,
          count: item.count
        }))
      },
      HTTP_STATUS.OK
    );
  } catch (error: any) {
    console.error('Revenue Chart API Error:', error);
    return sendError(
      res,
      'Failed to fetch revenue data',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}

