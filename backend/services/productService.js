/**
 * Product Service Layer
 * Handles business logic and data operations for products
 */

const fs = require('fs');
const path = require('path');
const config = require('../config/config');

class ProductService {
  /**
   * Load all products from the JSON file
   * @returns {Promise<Array>} Array of product objects
   */
  static async getAllProducts() {
    try {
      const data = fs.readFileSync(config.PRODUCTS_FILE, 'utf-8');
      const products = JSON.parse(data);
      return products;
    } catch (error) {
      console.error('Error loading products:', error.message);
      throw new Error('Failed to load products from database');
    }
  }

  /**
   * Get a single product by ID
   * @param {number} productId - The product ID
   * @returns {Promise<Object>} Product object or null if not found
   */
  static async getProductById(productId) {
    try {
      const products = await this.getAllProducts();
      const product = products.find(p => p.id === parseInt(productId));
      return product || null;
    } catch (error) {
      console.error('Error fetching product by ID:', error.message);
      throw new Error('Failed to fetch product');
    }
  }

  /**
   * Get products by category
   * @param {string} category - The category name
   * @returns {Promise<Array>} Array of products in the category
   */
  static async getProductsByCategory(category) {
    try {
      const products = await this.getAllProducts();
      return products.filter(p => p.category?.toLowerCase() === category.toLowerCase());
    } catch (error) {
      console.error('Error fetching products by category:', error.message);
      throw new Error('Failed to fetch products by category');
    }
  }

  /**
   * Search products by name or description
   * @param {string} searchTerm - The search term
   * @returns {Promise<Array>} Array of matching products
   */
  static async searchProducts(searchTerm) {
    try {
      const products = await this.getAllProducts();
      const term = searchTerm.toLowerCase();
      return products.filter(
        p => p.name?.toLowerCase().includes(term) || 
             p.category?.toLowerCase().includes(term)
      );
    } catch (error) {
      console.error('Error searching products:', error.message);
      throw new Error('Failed to search products');
    }
  }

  /**
   * Get products with pagination
   * @param {number} page - Page number (default: 1)
   * @param {number} limit - Items per page (default: 10)
   * @returns {Promise<Object>} Paginated results with metadata
   */
  static async getPaginatedProducts(page = 1, limit = 10) {
    try {
      const products = await this.getAllProducts();
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;

      const paginatedProducts = products.slice(startIndex, endIndex);
      const totalProducts = products.length;
      const totalPages = Math.ceil(totalProducts / limit);

      return {
        data: paginatedProducts,
        pagination: {
          currentPage: page,
          totalPages,
          totalProducts,
          itemsPerPage: limit,
        },
      };
    } catch (error) {
      console.error('Error fetching paginated products:', error.message);
      throw new Error('Failed to fetch products');
    }
  }
}

module.exports = ProductService;
