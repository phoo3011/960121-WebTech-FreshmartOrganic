/**
 * User Repository
 * Data Access Layer for user-related database operations
 * Provides abstraction between services and the database
 */

const { all, dbReady, get, run } = require('../config/database');

class UserRepository {
  /**
   * Get all users from the database
   * @returns {Promise<Array>} All users
   */
  static async findAll() {
    try {
      await dbReady;
      return all(
        'SELECT id, first_name AS firstName, username, password_hash AS passwordHash, registration_date AS registrationDate FROM users ORDER BY id ASC'
      );
    } catch (error) {
      console.error('[UserRepository] Error finding all users:', error.message);
      throw new Error('Failed to retrieve users from database');
    }
  }

  /**
   * Find a user by email (username field)
   * @param {string} email - Email to search for
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findByEmail(email) {
    try {
      const normalizedEmail = String(email).trim().toLowerCase();
      await dbReady;

      return get(
        'SELECT id, first_name AS firstName, username, password_hash AS passwordHash, registration_date AS registrationDate FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1',
        [normalizedEmail]
      );
    } catch (error) {
      console.error('[UserRepository] Error finding user by email:', error.message);
      throw new Error('Failed to find user by email');
    }
  }

  /**
   * Find a user by ID
   * @param {number} userId - User ID
   * @returns {Promise<Object|null>} User object or null if not found
   */
  static async findById(userId) {
    try {
      await dbReady;
      return get(
        'SELECT id, first_name AS firstName, username, password_hash AS passwordHash, registration_date AS registrationDate FROM users WHERE id = ? LIMIT 1',
        [userId]
      );
    } catch (error) {
      console.error('[UserRepository] Error finding user by ID:', error.message);
      throw new Error('Failed to find user by ID');
    }
  }

  /**
   * Create a new user in the database
   * @param {Object} userData - User data { firstName, email, passwordHash, registrationDate }
   * @returns {Promise<Object>} Created user with ID
   */
  static async create(userData) {
    try {
      const { firstName, email, passwordHash, registrationDate } = userData;

      if (!firstName || !email || !passwordHash || !registrationDate) {
        throw new Error('Missing required user fields: firstName, email, passwordHash, registrationDate');
      }

      await dbReady;
      const result = await run(
        'INSERT INTO users (first_name, username, password_hash, registration_date) VALUES (?, ?, ?, ?)',
        [firstName, email, passwordHash, registrationDate]
      );

      return {
        id: result.lastID,
        firstName,
        username: email,
        passwordHash,
        registrationDate,
      };
    } catch (error) {
      console.error('[UserRepository] Error creating user:', error.message);
      throw new Error('Failed to create user in database');
    }
  }

  /**
   * Update a user in the database
   * @param {number} userId - User ID
   * @param {Object} userData - Partial user data to update
   * @returns {Promise<void>}
   */
  static async update(userId, userData) {
    try {
      await dbReady;

      const updates = [];
      const values = [];

      if (userData.firstName !== undefined) {
        updates.push('first_name = ?');
        values.push(userData.firstName);
      }

      if (userData.email !== undefined) {
        updates.push('username = ?');
        values.push(userData.email);
      }

      if (userData.passwordHash !== undefined) {
        updates.push('password_hash = ?');
        values.push(userData.passwordHash);
      }

      if (updates.length === 0) {
        return; // Nothing to update
      }

      values.push(userId);

      await run(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    } catch (error) {
      console.error('[UserRepository] Error updating user:', error.message);
      throw new Error('Failed to update user in database');
    }
  }

  /**
   * Check if email exists in the database
   * @param {string} email - Email to check
   * @returns {Promise<boolean>} True if email exists
   */
  static async emailExists(email) {
    try {
      const user = await this.findByEmail(email);
      return user !== null && user !== undefined;
    } catch (error) {
      console.error('[UserRepository] Error checking email existence:', error.message);
      throw new Error('Failed to check email existence');
    }
  }
}

module.exports = UserRepository;
