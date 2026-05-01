/**
 * Configuration file for the backend
 */

const path = require('path');

module.exports = {
  // Server configuration
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // File paths
  DATA_DIR: path.join(__dirname, '../../data'),
  PRODUCTS_FILE: path.join(__dirname, '../../data/products.json'),

  // CORS configuration
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:3000',

  // API configuration
  API_PREFIX: '/api',
};
