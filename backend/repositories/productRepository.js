/**
 * Product Repository
 * Data Access Layer for product-related database operations
 * Provides abstraction between services and the database
 */

const { all, dbReady, get } = require('../config/database');

class ProductRepository {
  /**
   * Get all products from the database
   * @returns {Promise<Array>} All products
   */
  static async findAll() {
    try {
      await dbReady;
      return all(
        'SELECT id, name, category, price, image, status, discount FROM products ORDER BY id ASC'
      );
    } catch (error) {
      console.error('[ProductRepository] Error finding all products:', error.message);
      throw new Error('Failed to retrieve products from database');
    }
  }

  /**
   * Find a product by ID
   * @param {number} productId - Product ID
   * @returns {Promise<Object|null>} Product object or null if not found
   */
  static async findById(productId) {
    try {
      await dbReady;
      return get(
        'SELECT id, name, category, price, image, status, discount FROM products WHERE id = ?',
        [Number(productId)]
      );
    } catch (error) {
      console.error('[ProductRepository] Error finding product by ID:', error.message);
      throw new Error('Failed to find product by ID');
    }
  }

  /**
   * Find products by category
   * @param {string} category - Category name
   * @returns {Promise<Array>} Products in the category
   */
  static async findByCategory(category) {
    try {
      await dbReady;
      return all(
        'SELECT id, name, category, price, image, status, discount FROM products WHERE LOWER(category) = LOWER(?) ORDER BY id ASC',
        [category]
      );
    } catch (error) {
      console.error('[ProductRepository] Error finding products by category:', error.message);
      throw new Error('Failed to find products by category');
    }
  }

  /**
   * Search products by name or category
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Matching products
   */
  static async search(searchTerm) {
    try {
      await dbReady;
      const term = `%${String(searchTerm).trim().toLowerCase()}%`;
      return all(
        'SELECT id, name, category, price, image, status, discount FROM products WHERE LOWER(name) LIKE ? OR LOWER(category) LIKE ? ORDER BY id ASC',
        [term, term]
      );
    } catch (error) {
      console.error('[ProductRepository] Error searching products:', error.message);
      throw new Error('Failed to search products');
    }
  }

  /**
   * Get paginated products
   * @param {number} offset - Number of records to skip
   * @param {number} limit - Number of records to fetch
   * @returns {Promise<Array>} Paginated products
   */
  static async findPaginated(offset, limit) {
    try {
      await dbReady;
      return all(
        'SELECT id, name, category, price, image, status, discount FROM products ORDER BY id ASC LIMIT ? OFFSET ?',
        [limit, offset]
      );
    } catch (error) {
      console.error('[ProductRepository] Error finding paginated products:', error.message);
      throw new Error('Failed to find paginated products');
    }
  }

  /**
   * Get total product count
   * @returns {Promise<number>} Total count of products
   */
  static async getTotal() {
    try {
      await dbReady;
      const result = await get('SELECT COUNT(*) AS totalProducts FROM products');
      return result?.totalProducts || 0;
    } catch (error) {
      console.error('[ProductRepository] Error getting product count:', error.message);
      throw new Error('Failed to get product count');
    }
  }

  /**
   * Get multiple products by IDs
   * @param {Array<number>} productIds - Array of product IDs
   * @returns {Promise<Array>} Products matching the IDs
   */
  static async findByIds(productIds) {
    try {
      if (!Array.isArray(productIds) || productIds.length === 0) {
        return [];
      }

      await dbReady;
      const placeholders = productIds.map(() => '?').join(',');
      return all(
        `SELECT id, name, category, price, image, status, discount FROM products WHERE id IN (${placeholders}) ORDER BY id ASC`,
        productIds
      );
    } catch (error) {
      console.error('[ProductRepository] Error finding products by IDs:', error.message);
      throw new Error('Failed to find products by IDs');
    }
  }
}

module.exports = ProductRepository;
