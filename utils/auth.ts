import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';
import * as cookie from 'cookie';

const JWT_SECRET = process.env.JWT_SECRET;
const ADMIN_TOKEN_NAME = 'admin_token';
const USER_TOKEN_NAME = 'user_token';

export interface JWTPayload {
  email: string;
  iat: number;
  exp: number;
}

export interface UserJWTPayload {
  userId: string;
  identifier: string; // email or phone
  iat: number;
  exp: number;
}

/**
 * Hash a password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compare a plain text password with a hashed password
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error: any) {
    console.error('Password verification error:', error.message);
    return false;
  }
}

/**
 * Generate a JWT token for authenticated user
 */
export function generateToken(email: string): string {
  return jwt.sign(
    { email },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Set admin authentication cookie in response
 */
export function setAuthCookie(res: NextApiResponse, token: string): void {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(ADMIN_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
  );
}

/**
 * Clear admin authentication cookie
 */
export function clearAuthCookie(res: NextApiResponse): void {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(ADMIN_TOKEN_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
  );
}

/**
 * Get admin token from request cookies
 */
export function getTokenFromRequest(req: NextApiRequest): string | null {
  const cookies = cookie.parse(req.headers.cookie || '');
  return cookies[ADMIN_TOKEN_NAME] || null;
}

/**
 * Generate a JWT token for authenticated user (not admin)
 */
export function generateUserToken(userId: string, identifier: string): string {
  return jwt.sign(
    { userId, identifier },
    JWT_SECRET,
    { expiresIn: '7d' } // Token expires in 7 days
  );
}

/**
 * Verify and decode a user JWT token
 */
export function verifyUserToken(token: string): UserJWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as UserJWTPayload;
  } catch (error) {
    return null;
  }
}

/**
 * Set user authentication cookie in response
 */
export function setUserAuthCookie(res: NextApiResponse, token: string): void {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(USER_TOKEN_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    })
  );
}

/**
 * Clear user authentication cookie
 */
export function clearUserAuthCookie(res: NextApiResponse): void {
  res.setHeader(
    'Set-Cookie',
    cookie.serialize(USER_TOKEN_NAME, '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    })
  );
}

/**
 * Get user token from request cookies
 */
export function getUserTokenFromRequest(req: NextApiRequest): string | null {
  const cookies = cookie.parse(req.headers.cookie || '');
  return cookies[USER_TOKEN_NAME] || null;
}

/**
 * Middleware to verify if user is authenticated
 * Returns the decoded token if valid, null otherwise
 */
export function verifyUserAuth(req: NextApiRequest): UserJWTPayload | null {
  const token = getUserTokenFromRequest(req);
  if (!token) return null;
  return verifyUserToken(token);
}

/**
 * Middleware to verify if user is authenticated
 * Returns the decoded token if valid, null otherwise
 */
export function verifyAuth(req: NextApiRequest): JWTPayload | null {
  const token = getTokenFromRequest(req);
  if (!token) return null;
  return verifyToken(token);
}

/**
 * Check if provided credentials match admin credentials from env
 */
export async function verifyAdminCredentials(
  email: string,
  password: string
): Promise<boolean> {
  const adminEmail = process.env.ADMIN_EMAIL;
  let adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;
  const adminPasswordHashBase64 = process.env.ADMIN_PASSWORD_HASH_BASE64;

  // If base64 encoded hash is provided, decode it
  if (adminPasswordHashBase64 && !adminPasswordHash) {
    adminPasswordHash = Buffer.from(adminPasswordHashBase64, 'base64').toString('utf8');
  }

  if (!adminEmail || !adminPasswordHash) {
    console.error('Admin credentials not configured in environment variables');
    return false;
  }

  if (email !== adminEmail) {
    return false;
  }

  return verifyPassword(password, adminPasswordHash);
}

