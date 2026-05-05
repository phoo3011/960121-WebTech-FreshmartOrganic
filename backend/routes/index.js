/**
 * Central route exports
 * Aggregates all route modules for easy importing
 */

const productRoutes = require('./products');
const checkoutRoutes = require('./checkout');

module.exports = {
  productRoutes,
  checkoutRoutes,
};
