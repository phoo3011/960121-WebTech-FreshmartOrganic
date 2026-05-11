/**
 * Configuration file for the backend
 */

const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '../../.env') });

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // File paths
  DATA_DIR: path.join(__dirname, '../../data'),
  PRODUCTS_FILE: path.join(__dirname, '../../data/products.json'),
  AUTH_USERS_FILE: path.join(__dirname, '../../data/auth_user.json'),

  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // API configuration
  API_PREFIX: '/api',

  // Authentication
  JWT_SECRET: process.env.JWT_SECRET || 'freshmart-dev-secret',

  // Database configuration
  DB_PATH: process.env.DB_PATH || path.join(__dirname, '../../store.db'),
};
