/**
 * Health Service
 * Business logic for health check operations
 */

import connectDB from '@/lib/mongodb';
import { HealthCheckData } from '@/types/api.types';
import { DB_STATUS } from '@/config/constants';

export class HealthService {
  /**
   * Check database connection status
   * @returns Health check data with database status
   */
  static async checkDatabase(): Promise<HealthCheckData> {
    try {
      const mongoose = await connectDB();
      const readyState = mongoose.connection.readyState;
      const isConnected = readyState === DB_STATUS.CONNECTED;
      
      return {
        status: isConnected ? 'healthy' : 'unhealthy',
        database: {
          connected: isConnected,
          name: mongoose.connection.name,
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error: any) {
      return {
        status: 'unhealthy',
        database: {
          connected: false,
          error: error.message || 'Database connection failed',
        },
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get detailed system health information
   * @returns Extended health data
   */
  static async getSystemHealth() {
    const dbHealth = await this.checkDatabase();
    
    return {
      ...dbHealth,
      uptime: process.uptime(),
      memory: {
        used: Math.round((process.memoryUsage().heapUsed / 1024 / 1024) * 100) / 100,
        total: Math.round((process.memoryUsage().heapTotal / 1024 / 1024) * 100) / 100,
      },
      environment: process.env.NODE_ENV || 'development',
    };
  }
}

