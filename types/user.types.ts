/**
 * User-related types and enums
 */

import mongoose, { Document, Model } from 'mongoose';

/**
 * User status enum
 */
export enum UserStatus {
  PENDING = 'pending', // Just created, not verified
  ACTIVE = 'active', // Verified and active
  SUSPENDED = 'suspended', // Temporarily suspended
  DELETED = 'deleted', // Soft deleted
}

/**
 * Registration source enum
 */
export enum RegistrationSource {
  WEB = 'web',
  MOBILE = 'mobile',
  REFERRAL = 'referral',
  ADMIN = 'admin',
}

/**
 * User role enum
 */
export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

/**
 * Exam type
 */
export type ExamType = 'neet-pg' | 'other-exams';

/**
 * Interface for User document
 */
export interface IUser extends Document {
  // Authentication (flexible for email OR phone OR both)
  phone?: string;
  phoneVerified: boolean;
  phoneVerifiedAt?: Date;
  
  email?: string;
  emailVerified: boolean;
  emailVerifiedAt?: Date;
  
  // Profile
  name: string;
  profilePicture?: string;
  
  // Role & Permissions
  role: UserRole;
  
  // Exam & Preferences
  examType?: ExamType;
  targetYear?: number;
  
  // Status & Tracking
  status: UserStatus;
  registrationSource: RegistrationSource;
  
  // Streak & Engagement (for future features)
  currentStreak: number;
  longestStreak: number;
  lastActiveDate?: Date;
  totalPoints: number;
  
  // Subscription/Payment
  isPremium: boolean;
  premiumExpiresAt?: Date;
  paymentIds: mongoose.Types.ObjectId[];
  
  // Security & Login
  lastLoginAt?: Date;
  lastLoginIp?: string;
  loginCount: number;
  isBlocked: boolean;
  blockedReason?: string;
  blockedUntil?: Date;
  
  // Metadata
  metadata?: Record<string, any>;
  
  // Timestamps
  createdAt: Date;
  updatedAt: Date;
  
  // Instance methods
  isCurrentlyBlocked(): boolean;
  isPremiumActive(): boolean;
  getPrimaryIdentifier(): string;
}

/**
 * Interface for User Model with static methods
 */
export interface IUserModel extends Model<IUser> {
  findByIdentifier(identifier: string): Promise<IUser | null>;
}

