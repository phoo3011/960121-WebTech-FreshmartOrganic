/**
 * Global Error Handling Middleware
 * Catches and formats all application errors
 */

const errorHandler = (error, req, res, next) => {
  const status = error.status || 500;
  const message = error.message || 'Internal Server Error';

  console.error(`[${new Date().toISOString()}] Error:`, error);

  res.status(status).json({
    success: false,
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    },
  });
};

module.exports = errorHandler;
