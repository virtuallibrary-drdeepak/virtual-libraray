import mongoose, { Schema, Document, Model } from 'mongoose';

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
 * Interface for Payment document
 */
export interface IPayment extends Document {
  // User details
  name: string;
  email: string;
  phone: string;
  
  // Razorpay details
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  razorpaySignature?: string;
  
  // Payment details
  amount: number; // in paise (₹1999 = 199900 paise)
  currency: string;
  status: PaymentStatus;
  
  // Additional tracking
  examType?: string; // 'neet-pg' or 'other-exams'
  failureReason?: string;
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  paidAt?: Date;
}

/**
 * Payment Schema
 */
const PaymentSchema: Schema = new Schema(
  {
    // User details
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    
    // Razorpay details
    razorpayOrderId: {
      type: String,
      required: [true, 'Razorpay order ID is required'],
      unique: true,
    },
    razorpayPaymentId: {
      type: String,
      index: true,
      sparse: true,
    },
    razorpaySignature: {
      type: String,
      sparse: true,
    },
    
    // Payment details
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
    },
    currency: {
      type: String,
      required: [true, 'Currency is required'],
      default: 'INR',
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.CREATED,
      required: true,
    },
    
    // Additional tracking
    examType: {
      type: String,
      enum: ['neet-pg', 'other-exams'],
    },
    failureReason: {
      type: String,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    
    // Timestamps
    paidAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for better query performance
 * Note: razorpayOrderId has unique index from field definition
 * Note: razorpayPaymentId has sparse index from field definition
 */
PaymentSchema.index({ email: 1, status: 1 });
PaymentSchema.index({ createdAt: -1 });

/**
 * Payment Model
 */
const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>('Payment', PaymentSchema);

export default Payment;

