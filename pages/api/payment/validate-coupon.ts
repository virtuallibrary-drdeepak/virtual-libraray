import type { NextApiRequest, NextApiResponse } from 'next';
import connectDB from '@/lib/mongodb';
import Coupon from '@/models/Coupon';
import { apiResponse, apiError } from '@/utils/response';
import { PRICING } from '@/config/constants';

/**
 * API Handler: Validate Coupon Code
 * POST /api/payment/validate-coupon
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return apiError(res, 'Method not allowed', 405);
  }

  try {
    // Extract coupon code from request body
    const { code } = req.body;

    // Validation
    if (!code || typeof code !== 'string') {
      return apiError(res, 'Coupon code is required', 400);
    }

    // Connect to database
    await connectDB();

    // Find and validate coupon
    const result = await Coupon.findAndValidate(code);

    if (!result.valid) {
      return apiError(res, result.message || 'Invalid coupon code', 400);
    }

    const coupon = result.coupon!;

    // Calculate discounted amount
    const originalAmount = PRICING.MEMBERSHIP_FEE;
    const discountedAmount = coupon.applyDiscount(originalAmount);
    const discountAmount = originalAmount - discountedAmount;

    // Return coupon details
    return apiResponse(res, 'Coupon is valid', {
      code: coupon.code,
      discountPercentage: coupon.discountPercentage,
      originalAmount,
      discountAmount,
      discountedAmount,
      expiryDate: coupon.expiryDate,
    });
  } catch (error: any) {
    console.error('Error validating coupon:', error);
    return apiError(res, 'Failed to validate coupon', 500);
  }
}

