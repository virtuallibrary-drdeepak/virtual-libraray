/**
 * OTP-related types and enums
 */

import { Document, Model } from 'mongoose';

/**
 * OTP identifier type enum
 */
export enum OTPIdentifierType {
  PHONE = 'phone',
  EMAIL = 'email',
}

/**
 * OTP purpose enum
 */
export enum OTPPurpose {
  LOGIN = 'login',
  PHONE_VERIFICATION = 'phone-verification',
  EMAIL_VERIFICATION = 'email-verification',
  PASSWORD_RESET = 'password-reset',
}

/**
 * Interface for OTP document
 */
export interface IOTP extends Document {
  // User Identification
  identifier: string; // Phone number or email
  identifierType: OTPIdentifierType;
  userId?: import('mongoose').Types.ObjectId;
  
  // OTP Details
  otpHash: string; // Bcrypt hashed OTP for security
  expiresAt: Date; // OTP expiration time (5 minutes)
  
  // Verification Status
  isVerified: boolean;
  verifiedAt?: Date;
  attempts: number; // Number of verification attempts
  maxAttempts: number; // Maximum allowed attempts
  
  // Rate Limiting & Security
  ipAddress?: string;
  userAgent?: string;
  
  // Purpose
  purpose: OTPPurpose;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Methods
  isExpired(): boolean;
  canAttempt(): boolean;
  incrementAttempts(): void;
}

/**
 * Interface for OTP Model with static methods
 */
export interface IOTPModel extends Model<IOTP> {
  findLatestOTP(identifier: string, purpose?: OTPPurpose): Promise<IOTP | null>;
  countRecentOTPs(identifier: string, minutes?: number): Promise<number>;
  isRateLimited(identifier: string, maxRequests?: number, windowMinutes?: number): Promise<boolean>;
}

