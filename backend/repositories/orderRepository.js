/**
 * Order Repository
 * Data Access Layer for order-related database operations
 * Provides abstraction between services and the database
 */

const { all, dbReady, get, run } = require('../config/database');

class OrderRepository {
  /**
   * Create a new order in the database
   * @param {Object} orderData - Order data { userId, productId, quantity, totalPrice }
   * @returns {Promise<Object>} Created order with ID
   */
  static async create(orderData) {
    try {
      const { userId, productId, quantity, totalPrice, idempotencyKey } = orderData;

      if (!userId || !productId || quantity === undefined || totalPrice === undefined) {
        throw new Error('Missing required order fields: userId, productId, quantity, totalPrice');
      }

      await dbReady;

      // Idempotency: if client provides an idempotency key, return existing order
      if (idempotencyKey) {
        const existing = await get('SELECT id, user_id AS userId, product_id AS productId, quantity, total_price AS totalPrice FROM orders WHERE idempotency_key = ?', [idempotencyKey]);
        if (existing) {
          return existing;
        }
      }

      // Begin transaction
      await run('BEGIN TRANSACTION');
      try {
        // Check product and stock
        const product = await get('SELECT id, price, COALESCE(stock, 0) AS stock FROM products WHERE id = ?', [productId]);
        if (!product) throw new Error('Product not found');
        if (product.stock < quantity) throw new Error('Insufficient stock');

        // Decrement stock
        await run('UPDATE products SET stock = stock - ? WHERE id = ?', [quantity, productId]);

        // Insert order with optional idempotency key
        const result = await run(
          'INSERT INTO orders (user_id, product_id, quantity, total_price, idempotency_key) VALUES (?, ?, ?, ?, ?)',
          [userId, productId, quantity, totalPrice, idempotencyKey || null]
        );

        await run('COMMIT');

        return {
          id: result.lastID,
          userId,
          productId,
          quantity,
          totalPrice,
        };
      } catch (err) {
        await run('ROLLBACK');
        throw err;
      }
    } catch (error) {
      console.error('[OrderRepository] Error creating order:', error.message);
      throw new Error('Failed to create order in database');
    }
  }

  /**
   * Find order by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Object|null>} Order object or null if not found
   */
  static async findById(orderId) {
    try {
      await dbReady;
      return get(
        'SELECT id, user_id AS userId, product_id AS productId, quantity, total_price AS totalPrice, created_at AS createdAt FROM orders WHERE id = ?',
        [orderId]
      );
    } catch (error) {
      console.error('[OrderRepository] Error finding order by ID:', error.message);
      throw new Error('Failed to find order by ID');
    }
  }

  /**
   * Find all orders for a specific user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} All orders for the user
   */
  static async findByUserId(userId) {
    try {
      await dbReady;
      return all(
        'SELECT id, user_id AS userId, product_id AS productId, quantity, total_price AS totalPrice, created_at AS createdAt FROM orders WHERE user_id = ? ORDER BY created_at DESC',
        [userId]
      );
    } catch (error) {
      console.error('[OrderRepository] Error finding orders by user ID:', error.message);
      throw new Error('Failed to find orders for user');
    }
  }

  /**
   * Get all orders (admin function)
   * @returns {Promise<Array>} All orders in the system
   */
  static async findAll() {
    try {
      await dbReady;
      return all(
        'SELECT id, user_id AS userId, product_id AS productId, quantity, total_price AS totalPrice, created_at AS createdAt FROM orders ORDER BY created_at DESC'
      );
    } catch (error) {
      console.error('[OrderRepository] Error finding all orders:', error.message);
      throw new Error('Failed to retrieve all orders from database');
    }
  }

  /**
   * Get total order count
   * @returns {Promise<number>} Total count of orders
   */
  static async getTotal() {
    try {
      await dbReady;
      const result = await get('SELECT COUNT(*) AS totalOrders FROM orders');
      return result?.totalOrders || 0;
    } catch (error) {
      console.error('[OrderRepository] Error getting order count:', error.message);
      throw new Error('Failed to get order count');
    }
  }

  /**
   * Get paginated orders
   * @param {number} offset - Number of records to skip
   * @param {number} limit - Number of records to fetch
   * @returns {Promise<Array>} Paginated orders
   */
  static async findPaginated(offset, limit) {
    try {
      await dbReady;
      return all(
        'SELECT id, user_id AS userId, product_id AS productId, quantity, total_price AS totalPrice, created_at AS createdAt FROM orders ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [limit, offset]
      );
    } catch (error) {
      console.error('[OrderRepository] Error finding paginated orders:', error.message);
      throw new Error('Failed to find paginated orders');
    }
  }

  /**
   * Delete an order by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<void>}
   */
  static async delete(orderId) {
    try {
      await dbReady;
      await run('DELETE FROM orders WHERE id = ?', [orderId]);
    } catch (error) {
      console.error('[OrderRepository] Error deleting order:', error.message);
      throw new Error('Failed to delete order');
    }
  }
}

module.exports = OrderRepository;
