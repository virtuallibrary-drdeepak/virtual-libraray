/**
 * API Type Definitions
 * Shared types for API requests and responses
 */

export type ApiResponse<T = any> = {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
};

export type HealthCheckData = {
  status: 'healthy' | 'unhealthy';
  database: {
    connected: boolean;
    name?: string;
    error?: string;
  };
  timestamp: string;
};

export type PaginatedResponse<T> = {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  timestamp: string;
};

// Ranking System Types
export type AttendanceUploadRequest = {
  date: string; // YYYY-MM-DD format
  file: File;
};

export type AttendanceUploadResponse = {
  success: boolean;
  data: {
    recordId: string;
    date: string;
    totalEntries: number;
    status: 'pending' | 'processed' | 'failed';
  };
  timestamp: string;
};

export type RankingEntry = {
  rank: number;
  fullName: string;
  firstName: string;
  lastName: string;
  email?: string;
  totalDuration: number;
  totalDurationFormatted: string;
  sessionCount: number;
};

export type DailyRankingResponse = {
  success: boolean;
  data: {
    date: string;
    rankings: RankingEntry[];
    totalParticipants: number;
    computedAt: string;
  };
  timestamp: string;
};

export type RankingQueryParams = {
  date?: string; // YYYY-MM-DD
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  limit?: number;
  page?: number;
};

