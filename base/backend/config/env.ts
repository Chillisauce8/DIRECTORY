/**
 * Environment configuration with type safety and default values
 * This file centralizes access to all environment variables used in the application
 */

// Define the structure for our environment configuration
interface EnvConfig {
  // Server configuration
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  HOST: string;
  
  // MongoDB configuration
  MONGO_URI: string;
  MONGO_DB_NAME: string;
  MONGO_POOL_SIZE: number;
  MONGO_CONNECT_TIMEOUT_MS: number;
  
  // Authentication configuration
  JWT_SECRET: string;
  JWT_ACCESS_EXPIRATION: string;
  JWT_REFRESH_EXPIRATION: string;
  
  // Cors configuration
  CORS_ORIGIN: string;
  
  // API configuration
  API_PREFIX: string;
}

// Load and validate environment variables with sensible defaults
export const env: EnvConfig = {
  // Server configuration
  NODE_ENV: (process.env.NODE_ENV as EnvConfig['NODE_ENV']) || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  HOST: process.env.HOST || 'localhost',
  
  // MongoDB configuration
  MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017',
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || 'app_database',
  MONGO_POOL_SIZE: parseInt(process.env.MONGO_POOL_SIZE || '10', 10),
  MONGO_CONNECT_TIMEOUT_MS: parseInt(process.env.MONGO_CONNECT_TIMEOUT_MS || '10000', 10),
  
  // Authentication configuration
  JWT_SECRET: process.env.JWT_SECRET || 'super-secret-key-change-in-production',
  JWT_ACCESS_EXPIRATION: process.env.JWT_ACCESS_EXPIRATION || '15m',
  JWT_REFRESH_EXPIRATION: process.env.JWT_REFRESH_EXPIRATION || '7d',
  
  // Cors configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || '*',
  
  // API configuration
  API_PREFIX: process.env.API_PREFIX || '/api/v1',
};

// Add runtime checks for critical configuration variables
if (env.NODE_ENV === 'production') {
  if (env.JWT_SECRET === 'super-secret-key-change-in-production') {
    console.warn('WARNING: Using default JWT secret in production environment!');
  }
  
  if (env.MONGO_URI === 'mongodb://localhost:27017') {
    console.warn('WARNING: Using default MongoDB URI in production environment!');
  }
}

export default env;
