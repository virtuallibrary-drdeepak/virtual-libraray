/**
 * Payment-related types and enums
 */

import mongoose, { Document } from 'mongoose';

/**
 * Payment status enum
 */
export enum PaymentStatus {
  CREATED = 'created',
  PENDING = 'pending',
  SUCCESS = 'success',
  FAILED = 'failed',
  STUCK = 'stuck',
}

/**
 * Payment DTO (Data Transfer Object) for frontend/API responses
 */
export interface PaymentDTO {
  id: string;
  amount: number;
  currency: string;
  status: string;
  name: string;
  email: string;
  phone: string;
  examType?: string;
  couponCode?: string;
  discountPercentage?: number;
  createdAt: string;
  paidAt?: string;
  user?: {
    id: string;
    name: string;
    email?: string;
    phone?: string;
  };
}

/**
 * Payment statistics for admin dashboard
 */
export interface PaymentStats {
  total: number;
  successful: number;
  abandoned: number;
  totalRevenue: number;
}

/**
 * Revenue chart data
 */
export interface RevenueData {
  totalRevenue: number;
  previousRevenue: number;
  growthPercentage: number | null;
  transactionCount: number;
  chartData: Array<{
    date: string;
    revenue: number;
    count: number;
  }>;
}

/**
 * Interface for Payment document
 */
export interface IPayment extends Document {
  // User reference (link to User model)
  userId?: mongoose.Types.ObjectId;
  
  // User details (kept for backward compatibility)
  name: string;
  email: string;
  phone: string;
  
  // Razorpay details
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  
  // Payment details
  amount: number; // in paise (₹1999 = 199900 paise)
  originalAmount?: number; // in paise - original amount before discount
  currency: string;
  status: PaymentStatus;
  
  // Coupon details
  couponCode?: string;
  discountPercentage?: number;
  discountAmount?: number; // in paise
  
  // Additional tracking
  examType?: string; // 'neet-pg' or 'other-exams'
  failureReason?: string;
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

