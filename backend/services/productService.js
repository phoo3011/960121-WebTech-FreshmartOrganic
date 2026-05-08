/**
 * Product Service Layer
 * Business Logic: Handles product operations and data transformation
 * Data access delegated to ProductRepository
 */

const ProductRepository = require('../repositories/productRepository');

class ProductService {
  /**
   * Load all products from the repository.
   * @returns {Promise<Array>} Array of product objects
   */
  static async getAllProducts() {
    try {
      const products = await ProductRepository.findAll();
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
      return await ProductRepository.findById(productId);
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
      return await ProductRepository.findByCategory(category);
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
      return await ProductRepository.search(searchTerm);
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
      const safePage = Math.max(parseInt(page, 10) || 1, 1);
      const safeLimit = Math.max(parseInt(limit, 10) || 10, 1);
      const startIndex = (safePage - 1) * safeLimit;

      const paginatedProducts = await ProductRepository.findPaginated(startIndex, safeLimit);
      const totalProducts = await ProductRepository.getTotal();
      const totalPages = Math.ceil(totalProducts / safeLimit);

      return {
        data: paginatedProducts,
        pagination: {
          currentPage: safePage,
          pageSize: safeLimit,
          totalItems: totalProducts,
          totalPages,
          hasNextPage: safePage < totalPages,
          hasPrevPage: safePage > 1,
        },
      };
    } catch (error) {
      console.error('Error fetching paginated products:', error.message);
      throw new Error('Failed to fetch paginated products');
    }
  }
}

module.exports = ProductService;
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
