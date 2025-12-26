/**
 * Database Configuration
 * Centralized database settings
 */

export const dbConfig = {
  uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/virtual-library',
  options: {
    bufferCommands: false,
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
  },
};

