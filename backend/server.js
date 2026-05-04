/**
 * Express Server Entry Point
 * Sets up the application, middleware, and routes
 */

const express = require('express');
const path = require('path');
const config = require('./config/config');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const errorHandler = require('./middleware/errorHandler');

const app = express();

// ==================== MIDDLEWARE ====================

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.CORS_ORIGIN);
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.originalUrl}`);
  next();
});

// Serve static files from the frontend root
app.use(express.static(path.join(__dirname, '..')));

// ==================== API ROUTES ====================

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// Product API routes
app.use(`${config.API_PREFIX}/products`, productRoutes);

// Authentication API routes
app.use(config.API_PREFIX, authRoutes);

// ==================== 404 HANDLER ====================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl,
  });
});

// ==================== ERROR HANDLER ====================

app.use(errorHandler);

// ==================== SERVER STARTUP ====================

const startServer = () => {
  app.listen(config.PORT, () => {
    console.log(`
    ====================================
    Freshmart Organic
    Environment: ${config.NODE_ENV}
    Port: ${config.PORT}
    URL: http://localhost:${config.PORT}
    ====================================
    `);
  });
};

// Start server if this is the main module
if (require.main === module) {
  startServer();
}

module.exports = app;
