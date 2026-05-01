/**
 * Product Routes
 * Defines all endpoints related to products
 */

const express = require('express');
const ProductController = require('../controllers/productController');

const router = express.Router();

// Main product routes
router.get('/', ProductController.getAllProducts);
router.get('/:id', ProductController.getProductById);

// Category and search routes
router.get('/category/:name', ProductController.getProductsByCategory);
router.get('/search/:query', ProductController.searchProducts);

module.exports = router;
