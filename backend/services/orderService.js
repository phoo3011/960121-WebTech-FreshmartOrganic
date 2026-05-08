/**
 * Order Service Layer
 * Business Logic: Handles order operations and validation
 * Data access delegated to OrderRepository
 */

const OrderRepository = require('../repositories/orderRepository');

class OrderService {
  /**
   * Create a new order
   * @param {Object} orderData - Order data { userId, productId, quantity, totalPrice }
   * @returns {Promise<Object>} Created order object
   */
  static async createOrder(orderData) {
    try {
      return await OrderRepository.create(orderData);
    } catch (error) {
      console.error('Error creating order:', error.message);
      throw new Error('Failed to create order');
    }
  }

  /**
   * Get order by ID
   * @param {number} orderId - Order ID
   * @returns {Promise<Object|null>} Order object or null if not found
   */
  static async getOrderById(orderId) {
    try {
      return await OrderRepository.findById(orderId);
    } catch (error) {
      console.error('Error fetching order:', error.message);
      throw new Error('Failed to fetch order');
    }
  }

  /**
   * Get all orders for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} User's orders
   */
  static async getUserOrders(userId) {
    try {
      return await OrderRepository.findByUserId(userId);
    } catch (error) {
      console.error('Error fetching user orders:', error.message);
      throw new Error('Failed to fetch user orders');
    }
  }

  /**
   * Get all orders (admin)
   * @returns {Promise<Array>} All orders
   */
  static async getAllOrders() {
    try {
      return await OrderRepository.findAll();
    } catch (error) {
      console.error('Error fetching all orders:', error.message);
      throw new Error('Failed to fetch all orders');
    }
  }

  /**
   * Delete an order
   * @param {number} orderId - Order ID
   * @returns {Promise<void>}
   */
  static async deleteOrder(orderId) {
    try {
      return await OrderRepository.delete(orderId);
    } catch (error) {
      console.error('Error deleting order:', error.message);
      throw new Error('Failed to delete order');
    }
  }
}

module.exports = OrderService;