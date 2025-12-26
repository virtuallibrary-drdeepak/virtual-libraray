/**
 * Response Utilities
 * Standardized API response helpers
 */

import { NextApiResponse } from 'next';
import { ApiResponse } from '@/types/api.types';

export const sendSuccess = <T>(
  res: NextApiResponse<ApiResponse<T>>,
  data: T,
  statusCode = 200
): void => {
  res.status(statusCode).json({
    success: true,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const sendError = (
  res: NextApiResponse<ApiResponse>,
  error: string,
  statusCode = 500
): void => {
  res.status(statusCode).json({
    success: false,
    error,
    timestamp: new Date().toISOString(),
  });
};

// Alias functions for consistency
export const apiResponse = <T>(
  res: NextApiResponse,
  message: string,
  data: T,
  statusCode = 200
): void => {
  res.status(statusCode).json({
    success: true,
    message,
    data,
    timestamp: new Date().toISOString(),
  });
};

export const apiError = (
  res: NextApiResponse,
  message: string,
  statusCode = 500
): void => {
  res.status(statusCode).json({
    success: false,
    message,
    error: message,
    timestamp: new Date().toISOString(),
  });
};

