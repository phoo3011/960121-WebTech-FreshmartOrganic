/**
 * Logic Flow:
 *
 * 1. Trigger: User submits the registration form on user-register.html
 *
 * 2. Request: Browser sends POST /api/auth/register with { firstName, email, password }
 *
 * 3. Processing (Gatekeeper):
 *
 * - Validate input format (Server-side check)
 *
 * - Check if email already exists in auth_user.json (Prevent duplicates)
 *
 * - Hash password using bcrypt (One-way encryption for security)
 *
 * 4. Data Persistance: Append new user object to auth_user.json
 *
 * 5. Response: Server returns { success: true, message: "..." } with status 201 (Never return the password hash)
 */

const bcrypt = require('bcrypt');
const UserRepository = require('../repositories/userRepository');

class RegisterService {
  /**
   * Load the current user array from the database.
   * @returns {Promise<Array<Object>>} Existing users.
   */
  static async getUsers() {
    return UserRepository.findAll();
  }

  /**
   * Normalize email so duplicate checks are case-insensitive and whitespace-safe.
   * @param {string} email - Raw email input.
   * @returns {string} Normalized email.
   */
  static normalizeEmail(email) {
    return String(email).trim().toLowerCase();
  }

  /**
   * Validate the email format before any database lookup.
   * @param {string} email - Email to validate.
   * @returns {boolean} True when the email format is valid.
   */
  static isValidEmail(email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    return emailPattern.test(String(email).trim());
  }

  /**
   * Enforce the server-side password policy from the contract table.
   * @param {string} password - Password to validate.
   * @returns {{ valid: boolean, message: string }} Validation result.
   */
  static validatePassword(password) {
    const value = String(password || '');

    if (value.length < 8) {
      return { valid: false, message: 'Password must be at least 8 characters long.' };
    }

    if (!/[A-Z]/.test(value)) {
      return { valid: false, message: 'Password must contain at least one uppercase letter.' };
    }

    if (!/[!@#$%^&*]/.test(value)) {
      return { valid: false, message: 'Password must contain at least one special character (!@#$%^&*).' };
    }

    return { valid: true, message: 'Password is valid.' };
  }

  /**
   * Find an existing user by email.
   * @param {Array<Object>} users - User collection.
   * @param {string} email - Email to search for.
   * @returns {Object|null} Matching user or null.
   */
  static findUserByEmail(users, email) {
    const normalizedEmail = this.normalizeEmail(email);

    return users.find((user) => this.normalizeEmail(user.username) === normalizedEmail) || null;
  }

  /**
   * Generate the next auto-increment ID in a dataset that may contain legacy records.
   * @param {Array<Object>} users - Current user collection.
   * @returns {number} Next user ID.
   */
  static getNextUserId(users) {
    if (!Array.isArray(users) || users.length === 0) {
      return 1;
    }

    const numericIds = users
      .map((user) => Number(user.id))
      .filter((id) => Number.isInteger(id) && id > 0);

    return numericIds.length > 0 ? Math.max(...numericIds) + 1 : users.length + 1;
  }

  /**
   * Register a new user with validation, duplicate checking, and bcrypt hashing.
   * @param {{ firstName: string, email: string, password: string }} payload - Registration payload.
   * @returns {Promise<{ success: boolean, message: string, user: Object }>} Safe success response.
   */
  static async registerUser(payload) {
    const firstName = String(payload?.firstName || '').trim();
    const email = this.normalizeEmail(payload?.email);
    const password = String(payload?.password || '');

    if (!firstName || !email || !password) {
      const error = new Error('firstName, email, and password are required.');
      error.statusCode = 400;
      throw error;
    }

    if (!this.isValidEmail(email)) {
      const error = new Error('Email format is invalid.');
      error.statusCode = 400;
      throw error;
    }

    const passwordValidation = this.validatePassword(password);
    if (!passwordValidation.valid) {
      const error = new Error(passwordValidation.message);
      error.statusCode = 400;
      throw error;
    }

    // Delegate to repository to check if email exists
    const emailExists = await UserRepository.emailExists(email);
    if (emailExists) {
      const error = new Error('An account with this email already exists.');
      error.statusCode = 409;
      throw error;
    }

    // Bcrypt is intentionally slow and salted to make password cracking materially harder if the file is exposed.
    const passwordHash = await bcrypt.hash(password, 10);
    const registrationDate = new Date().toISOString();

    // Delegate to repository to create the user
    const newUser = await UserRepository.create({
      firstName,
      email,
      passwordHash,
      registrationDate,
    });

    return {
      success: true,
      message: 'Registration successful. You can now log in.',
      user: {
        id: newUser.id,
        firstName: newUser.firstName,
        email: newUser.username,
        registrationDate: newUser.registrationDate,
      },
    };
  }
}

module.exports = RegisterService;