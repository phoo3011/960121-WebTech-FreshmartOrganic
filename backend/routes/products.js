/**
 * Product Routes
 * Defines all endpoints related to products
 */

const express = require('express');
const ProductController = require('../controllers/productController');

const router = express.Router();

// Main product routes
router.get('/', ProductController.getAllProducts);
// Category and search routes
router.get('/category/:name', ProductController.getProductsByCategory);
router.get('/search/:query', ProductController.searchProducts);
router.get('/:id', ProductController.getProductById);

module.exports = router;
