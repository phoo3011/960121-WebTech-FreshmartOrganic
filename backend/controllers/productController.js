/**
 * Product Controller Layer
 * Handles HTTP requests and responses for products
 */

const ProductService = require('../services/productService');

class ProductController {
  /**
   * GET /api/products - Retrieve all products
   * Supports optional query parameters: page, limit, category, search
   */
  static async getAllProducts(req, res, next) {
    try {
      const { page, limit, category, search } = req.query;

      // If category filter is provided
      if (category) {
        const products = await ProductService.getProductsByCategory(category);
        return res.status(200).json({
          success: true,
          data: products,
          message: `Retrieved ${products.length} products in category: ${category}`,
        });
      }

      // If search query is provided
      if (search) {
        const products = await ProductService.searchProducts(search);
        return res.status(200).json({
          success: true,
          data: products,
          message: `Found ${products.length} products matching: ${search}`,
        });
      }

      // If pagination is requested
      if (page || limit) {
        const pageNum = parseInt(page) || 1;
        const limitNum = parseInt(limit) || 10;
        const result = await ProductService.getPaginatedProducts(pageNum, limitNum);
        return res.status(200).json({
          success: true,
          ...result,
          message: 'Products retrieved successfully with pagination',
        });
      }

      // Default: return all products
      const products = await ProductService.getAllProducts();
      res.status(200).json({
        success: true,
        data: products,
        count: products.length,
        message: 'All products retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id - Retrieve a single product by ID
   */
  static async getProductById(req, res, next) {
    try {
      const { id } = req.params;

      // Validate ID
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid product ID provided',
        });
      }

      const product = await ProductService.getProductById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product with ID ${id} not found`,
        });
      }

      res.status(200).json({
        success: true,
        data: product,
        message: 'Product retrieved successfully',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/category/:name - Retrieve products by category
   */
  static async getProductsByCategory(req, res, next) {
    try {
      const { name } = req.params;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Category name is required',
        });
      }

      const products = await ProductService.getProductsByCategory(name);

      res.status(200).json({
        success: true,
        data: products,
        count: products.length,
        message: `Products in category "${name}" retrieved successfully`,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/search/:query - Search products
   */
  static async searchProducts(req, res, next) {
    try {
      const { query } = req.params;

      if (!query) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required',
        });
      }

      const products = await ProductService.searchProducts(query);

      res.status(200).json({
        success: true,
        data: products,
        count: products.length,
        message: `Search results for "${query}"`,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProductController;
