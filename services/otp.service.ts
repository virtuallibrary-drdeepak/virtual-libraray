/**
 * OTP Service
 * Handles OTP generation, sending, verification, and validation
 * Designed to support multiple channels (email, SMS, WhatsApp)
 */

import bcrypt from 'bcryptjs';
import { OTP, User, OTPIdentifierType, OTPPurpose, UserStatus } from '@/models';
import { sendOTPViaEmail } from '@/lib/email-provider';
import connectDB from '@/lib/mongodb';

/**
 * OTP Configuration
 */
export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  MAX_ATTEMPTS: 5,
  RATE_LIMIT: {
    MAX_REQUESTS: 3,
    WINDOW_MINUTES: 10,
  },
  RESEND_COOLDOWN_SECONDS: 60,
};

/**
 * Generate a random numeric OTP
 */
function generateOTP(length: number = OTP_CONFIG.LENGTH): string {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * digits.length)];
  }
  return otp;
}

/**
 * Hash OTP using bcrypt
 */
async function hashOTP(otp: string): Promise<string> {
  return bcrypt.hash(otp, 10);
}

/**
 * Verify OTP against hash
 */
async function verifyOTPHash(otp: string, hash: string): Promise<boolean> {
  return bcrypt.compare(otp, hash);
}

/**
 * Determine identifier type (email or phone)
 */
export function getIdentifierType(identifier: string): OTPIdentifierType {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(identifier) ? OTPIdentifierType.EMAIL : OTPIdentifierType.PHONE;
}

/**
 * Normalize identifier (lowercase email, remove spaces)
 */
function normalizeIdentifier(identifier: string): string {
  return identifier.trim().toLowerCase();
}

/**
 * Send OTP Result Interface
 */
export interface SendOTPResult {
  success: boolean;
  message: string;
  expiresIn?: number; // seconds
  canResendAt?: Date;
  error?: string;
}

/**
 * Verify OTP Result Interface
 */
export interface VerifyOTPResult {
  success: boolean;
  message: string;
  user?: any;
  token?: string;
  error?: string;
  attemptsLeft?: number;
}

/**
 * Send OTP to user via appropriate channel
 * Supports both email and phone (phone will be enabled later)
 */
export async function sendOTP(
  identifier: string,
  purpose: OTPPurpose = OTPPurpose.LOGIN,
  ipAddress?: string,
  userAgent?: string
): Promise<SendOTPResult> {
  try {
    await connectDB();

    const normalizedIdentifier = normalizeIdentifier(identifier);
    const identifierType = getIdentifierType(normalizedIdentifier);

    // Check if identifier type is supported
    if (identifierType === OTPIdentifierType.PHONE) {
      return {
        success: false,
        message: 'Phone OTP is not available yet. Please use email for now.',
        error: 'PHONE_NOT_SUPPORTED',
      };
    }

    // Rate limiting check
    const isRateLimited = await OTP.isRateLimited(
      normalizedIdentifier,
      OTP_CONFIG.RATE_LIMIT.MAX_REQUESTS,
      OTP_CONFIG.RATE_LIMIT.WINDOW_MINUTES
    );

    if (isRateLimited) {
      return {
        success: false,
        message: `Too many requests. Please try again after ${OTP_CONFIG.RATE_LIMIT.WINDOW_MINUTES} minutes.`,
        error: 'RATE_LIMITED',
      };
    }

    // Check resend cooldown (at least 60 seconds between requests)
    const recentOTP = await OTP.findOne({
      identifier: normalizedIdentifier,
      createdAt: { $gte: new Date(Date.now() - OTP_CONFIG.RESEND_COOLDOWN_SECONDS * 1000) },
    }).sort({ createdAt: -1 });

    if (recentOTP) {
      const canResendAt = new Date(
        recentOTP.createdAt.getTime() + OTP_CONFIG.RESEND_COOLDOWN_SECONDS * 1000
      );
      return {
        success: false,
        message: `Please wait ${OTP_CONFIG.RESEND_COOLDOWN_SECONDS} seconds before requesting a new OTP.`,
        canResendAt,
        error: 'COOLDOWN_ACTIVE',
      };
    }

    // Generate OTP
    const otp = generateOTP();
    const otpHash = await hashOTP(otp);
    const expiresAt = new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES * 60 * 1000);

    // Check if user exists
    let user = await User.findByIdentifier(normalizedIdentifier);
    let userName = user?.name;

    // Create OTP record
    const otpRecord = await OTP.create({
      identifier: normalizedIdentifier,
      identifierType,
      userId: user?._id,
      otpHash,
      expiresAt,
      purpose,
      ipAddress,
      userAgent,
      attempts: 0,
      maxAttempts: OTP_CONFIG.MAX_ATTEMPTS,
    });

    // Send OTP via appropriate channel
    let sendResult;
    if (identifierType === OTPIdentifierType.EMAIL) {
      sendResult = await sendOTPViaEmail(normalizedIdentifier, otp, userName);
    } else {
      // Phone - will be implemented later
      // sendResult = await sendOTPViaSMS(normalizedIdentifier, otp);
      return {
        success: false,
        message: 'SMS OTP is not yet implemented.',
        error: 'SMS_NOT_IMPLEMENTED',
      };
    }

    if (!sendResult.success) {
      // Clean up OTP record if sending failed
      await OTP.findByIdAndDelete(otpRecord._id);
      return {
        success: false,
        message: 'Failed to send OTP. Please try again.',
        error: sendResult.error || 'SEND_FAILED',
      };
    }

    return {
      success: true,
      message: `OTP sent successfully to ${identifierType === OTPIdentifierType.EMAIL ? 'your email' : 'your phone'}.`,
      expiresIn: OTP_CONFIG.EXPIRY_MINUTES * 60,
    };
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    return {
      success: false,
      message: 'Failed to send OTP. Please try again later.',
      error: error.message || 'INTERNAL_ERROR',
    };
  }
}

/**
 * Verify OTP and authenticate user
 */
export async function verifyOTP(
  identifier: string,
  otp: string,
  ipAddress?: string,
  name?: string
): Promise<VerifyOTPResult> {
  try {
    await connectDB();

    const normalizedIdentifier = normalizeIdentifier(identifier);
    const identifierType = getIdentifierType(normalizedIdentifier);

    // Find the latest valid OTP
    const otpRecord = await OTP.findLatestOTP(normalizedIdentifier);

    if (!otpRecord) {
      return {
        success: false,
        message: 'OTP not found or expired. Please request a new one.',
        error: 'OTP_NOT_FOUND',
      };
    }

    // Check if OTP is expired
    if (otpRecord.isExpired()) {
      return {
        success: false,
        message: 'OTP has expired. Please request a new one.',
        error: 'OTP_EXPIRED',
      };
    }

    // Check if max attempts exceeded
    if (!otpRecord.canAttempt()) {
      return {
        success: false,
        message: 'Maximum verification attempts exceeded. Please request a new OTP.',
        error: 'MAX_ATTEMPTS_EXCEEDED',
        attemptsLeft: 0,
      };
    }

    // Verify OTP
    const isValid = await verifyOTPHash(otp, otpRecord.otpHash);

    if (!isValid) {
      // Increment attempt counter
      await otpRecord.incrementAttempts();
      const attemptsLeft = otpRecord.maxAttempts - otpRecord.attempts - 1;

      return {
        success: false,
        message: `Invalid OTP. ${attemptsLeft} attempt${attemptsLeft !== 1 ? 's' : ''} remaining.`,
        error: 'INVALID_OTP',
        attemptsLeft,
      };
    }

    // OTP is valid - Mark as verified
    otpRecord.isVerified = true;
    otpRecord.verifiedAt = new Date();
    await otpRecord.save();

    // Find or create user
    let user = await User.findByIdentifier(normalizedIdentifier);

    if (!user) {
      // Create new user only if doesn't exist
      const userData: any = {
        name: name || 'User',
        status: UserStatus.ACTIVE,
        loginCount: 0,
        currentStreak: 0,
        longestStreak: 0,
        totalPoints: 0,
        isPremium: false,
        isBlocked: false,
        paymentIds: [],
      };

      if (identifierType === OTPIdentifierType.EMAIL) {
        userData.email = normalizedIdentifier;
        userData.emailVerified = true;
        userData.emailVerifiedAt = new Date();
        userData.phoneVerified = false;
      } else {
        userData.phone = normalizedIdentifier;
        userData.phoneVerified = true;
        userData.phoneVerifiedAt = new Date();
        userData.emailVerified = false;
      }

      // Create user (User.create can return array or single doc depending on input)
      const createdUsers = await User.create([userData]);
      user = createdUsers[0];
      
      console.log('✅ New user created:', user.email || user.phone);
    } else {
      // User already exists - just update verification status if needed
      console.log('✅ Existing user found:', user.email || user.phone);
      
      let needsSave = false;

      if (identifierType === OTPIdentifierType.EMAIL && !user.emailVerified) {
        user.emailVerified = true;
        user.emailVerifiedAt = new Date();
        needsSave = true;
      } else if (identifierType === OTPIdentifierType.PHONE && !user.phoneVerified) {
        user.phoneVerified = true;
        user.phoneVerifiedAt = new Date();
        needsSave = true;
      }

      // Update status to active if pending
      if (user.status === UserStatus.PENDING) {
        user.status = UserStatus.ACTIVE;
        needsSave = true;
      }

      // Update login tracking
      user.lastLoginAt = new Date();
      user.lastLoginIp = ipAddress;
      user.loginCount += 1;
      user.lastActiveDate = new Date();

      // Save only if there are changes
      await user.save();
      
      console.log('✅ User login tracked:', user.loginCount, 'logins');
    }

    // Link OTP to user if not already linked
    if (!otpRecord.userId) {
      otpRecord.userId = user._id;
      await otpRecord.save();
    }

    return {
      success: true,
      message: 'OTP verified successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        isPremium: user.isPremiumActive(),
        examType: user.examType,
        currentStreak: user.currentStreak,
      },
    };
  } catch (error: any) {
    console.error('Verify OTP Error:', error);
    return {
      success: false,
      message: 'Failed to verify OTP. Please try again.',
      error: error.message || 'INTERNAL_ERROR',
    };
  }
}

/**
 * Resend OTP (same as sendOTP but with better messaging)
 */
export async function resendOTP(
  identifier: string,
  purpose: OTPPurpose = OTPPurpose.LOGIN,
  ipAddress?: string,
  userAgent?: string
): Promise<SendOTPResult> {
  return sendOTP(identifier, purpose, ipAddress, userAgent);
}

/**
 * Clean up expired OTPs (for maintenance)
 */
export async function cleanupExpiredOTPs(): Promise<number> {
  try {
    await connectDB();
    const result = await OTP.deleteMany({
      expiresAt: { $lt: new Date() },
    });
    return result.deletedCount || 0;
  } catch (error: any) {
    console.error('Cleanup Expired OTPs Error:', error);
    return 0;
  }
}

