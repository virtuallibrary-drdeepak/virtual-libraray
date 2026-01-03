/**
 * Authentication-related types
 */

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  userId: string;
  email?: string;
  phone?: string;
  role?: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

/**
 * User data returned to frontend (Data Transfer Object)
 */
export interface UserDTO {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  isPremium: boolean;
  role: 'user' | 'admin';
  examType?: string;
  currentStreak: number;
  longestStreak: number;
  totalPoints: number;
  lastActiveDate?: string;
  profilePicture?: string;
  createdAt: string;
}

/**
 * Alias for User (used in components for consistency)
 */
export type User = UserDTO;

/**
 * Login response
 */
export interface LoginResponse {
  success: boolean;
  message: string;
  user?: UserDTO;
  token?: string;
}

/**
 * OTP send response
 */
export interface OTPSendResponse {
  success: boolean;
  message: string;
  expiresIn?: number;
  cooldownSeconds?: number;
}

