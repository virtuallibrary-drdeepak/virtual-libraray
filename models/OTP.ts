import mongoose, { Schema } from 'mongoose';
import { 
  IOTP, 
  IOTPModel, 
  OTPIdentifierType, 
  OTPPurpose 
} from '@/types';

// Re-export for backward compatibility
export type { IOTP, IOTPModel };
export { OTPIdentifierType, OTPPurpose };

/**
 * OTP Schema
 */
const OTPSchema: Schema = new Schema(
  {
    // User Identification
    identifier: {
      type: String,
      required: [true, 'Identifier (email/phone) is required'],
      trim: true,
      lowercase: true, // Normalize email to lowercase
    },
    identifierType: {
      type: String,
      enum: Object.values(OTPIdentifierType),
      required: [true, 'Identifier type is required'],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    
    // OTP Details
    otpHash: {
      type: String,
      required: [true, 'OTP hash is required'],
    },
    expiresAt: {
      type: Date,
      required: [true, 'Expiration time is required'],
      // Note: index is defined in schema.index() with TTL option
    },
    
    // Verification Status
    isVerified: {
      type: Boolean,
      default: false,
      // Note: index is defined in compound indexes below
    },
    verifiedAt: {
      type: Date,
    },
    attempts: {
      type: Number,
      default: 0,
      min: 0,
    },
    maxAttempts: {
      type: Number,
      default: 5,
      required: true,
    },
    
    // Rate Limiting & Security
    ipAddress: {
      type: String,
      trim: true,
    },
    userAgent: {
      type: String,
      trim: true,
    },
    
    // Purpose
    purpose: {
      type: String,
      enum: Object.values(OTPPurpose),
      default: OTPPurpose.LOGIN,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for better query performance
 * Note: userId index is already defined in field definition
 */
// Compound index for finding recent OTPs for an identifier
OTPSchema.index({ identifier: 1, createdAt: -1 });
OTPSchema.index({ identifier: 1, isVerified: 1 });

// TTL Index: Automatically delete documents after they expire (adds 1 hour buffer)
OTPSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 }); // Delete 1 hour after expiry

// Index for cleanup queries
OTPSchema.index({ isVerified: 1, expiresAt: 1 });

/**
 * Instance method: Check if OTP is expired
 */
OTPSchema.methods.isExpired = function(): boolean {
  return new Date() > this.expiresAt;
};

/**
 * Instance method: Check if more attempts are allowed
 */
OTPSchema.methods.canAttempt = function(): boolean {
  return this.attempts < this.maxAttempts && !this.isExpired() && !this.isVerified;
};

/**
 * Instance method: Increment attempt counter
 */
OTPSchema.methods.incrementAttempts = async function(): Promise<void> {
  this.attempts += 1;
  await this.save();
};

/**
 * Static method: Find latest valid OTP for identifier
 */
OTPSchema.statics.findLatestOTP = function(
  identifier: string,
  purpose: OTPPurpose = OTPPurpose.LOGIN
) {
  return this.findOne({
    identifier: identifier.toLowerCase(),
    purpose,
    isVerified: false,
    expiresAt: { $gt: new Date() },
  }).sort({ createdAt: -1 });
};

/**
 * Static method: Count recent OTPs for rate limiting
 */
OTPSchema.statics.countRecentOTPs = function(
  identifier: string,
  minutes: number = 10
): Promise<number> {
  const cutoffTime = new Date(Date.now() - minutes * 60 * 1000);
  return this.countDocuments({
    identifier: identifier.toLowerCase(),
    createdAt: { $gte: cutoffTime },
  });
};

/**
 * Static method: Check if identifier is rate limited
 */
OTPSchema.statics.isRateLimited = async function(
  this: IOTPModel,
  identifier: string,
  maxRequests: number = 3,
  windowMinutes: number = 10
): Promise<boolean> {
  const count = await this.countRecentOTPs(identifier, windowMinutes);
  return count >= maxRequests;
};

/**
 * OTP Model
 */
const OTP: IOTPModel =
  (mongoose.models.OTP as IOTPModel) || mongoose.model<IOTP, IOTPModel>('OTP', OTPSchema);

export default OTP;

