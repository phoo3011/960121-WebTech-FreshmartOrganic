/**
 * Product Service Layer
 * Handles business logic and data operations for products
 */

const { all, dbReady, get } = require('../config/database');

class ProductService {
  /**
   * Load all products from SQLite.
   * @returns {Promise<Array>} Array of product objects
   */
  static async getAllProducts() {
    try {
      await dbReady;
      const products = await all('SELECT id, name, category, price, image, status, discount FROM products ORDER BY id ASC');
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
      await dbReady;
      return await get('SELECT id, name, category, price, image, status, discount FROM products WHERE id = ?', [Number(productId)]);
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
      await dbReady;
      return await all(
        'SELECT id, name, category, price, image, status, discount FROM products WHERE LOWER(category) = LOWER(?) ORDER BY id ASC',
        [category]
      );
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
      await dbReady;
      const term = `%${String(searchTerm).trim().toLowerCase()}%`;
      return await all(
        'SELECT id, name, category, price, image, status, discount FROM products WHERE LOWER(name) LIKE ? OR LOWER(category) LIKE ? ORDER BY id ASC',
        [term, term]
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
      await dbReady;
      const safePage = Math.max(parseInt(page, 10) || 1, 1);
      const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
      const startIndex = (safePage - 1) * safeLimit;

      const paginatedProducts = await all(
        'SELECT id, name, category, price, image, status, discount FROM products ORDER BY id ASC LIMIT ? OFFSET ?',
        [safeLimit, startIndex]
      );
      const countRow = await get('SELECT COUNT(*) AS totalProducts FROM products');
      const totalProducts = countRow?.totalProducts || 0;
      const totalPages = Math.ceil(totalProducts / safeLimit);

      return {
        data: paginatedProducts,
        pagination: {
          currentPage: safePage,
          totalPages,
          totalProducts,
          itemsPerPage: safeLimit,
        },
      };
    } catch (error) {
      console.error('Error fetching paginated products:', error.message);
      throw new Error('Failed to fetch products');
    }
  }
}

module.exports = ProductService;
