import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Payment, { PaymentStatus } from '@/models/Payment';
import { apiResponse, apiError } from '@/utils/response';

/**
 * API Handler: List All Payments
 * GET /api/payment/list
 * 
 * Query parameters:
 * - status: Filter by payment status (created, pending, success, failed, stuck)
 * - limit: Number of records to return (default: 50)
 * - page: Page number for pagination (default: 1)
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

    // Extract query parameters
    const { status, limit = '50', page = '1', examType } = req.query;

    // Build query
    const query: any = {};
    
    if (status && Object.values(PaymentStatus).includes(status as PaymentStatus)) {
      query.status = status;
    }
    
    if (examType && ['neet-pg', 'other-exams'].includes(examType as string)) {
      query.examType = examType;
    }

    // Pagination
    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    // Fetch payments
    const [payments, total] = await Promise.all([
      Payment.find(query)
        .sort({ createdAt: -1 })
        .limit(limitNum)
        .skip(skip)
        .select('-razorpaySignature -__v')
        .lean(),
      Payment.countDocuments(query),
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limitNum);

    return apiResponse(res, 'Payments retrieved successfully', {
      payments,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        totalPages,
        hasMore: pageNum < totalPages,
      },
    });
  } catch (error: any) {
    console.error('Error fetching payments:', error);
    return apiError(res, 'Failed to fetch payments', 500);
  }
}

