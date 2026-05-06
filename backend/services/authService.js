/**
 * Authentication Service
 * Handles user lookup, password verification, and token creation.
 */

const bcrypt = require('bcrypt');
const crypto = require('crypto');
const { all, dbReady, get } = require('../config/database');

class AuthService {
  static async getUsers() {
    await dbReady;
    return all('SELECT id, first_name AS firstName, username, password_hash AS passwordHash, registration_date AS registrationDate FROM users ORDER BY id ASC');
  }

  static async findUserByEmail(email) {
    const normalizedEmail = String(email).trim().toLowerCase();
    await dbReady;

    return get(
      'SELECT id, first_name AS firstName, username, password_hash AS passwordHash, registration_date AS registrationDate FROM users WHERE LOWER(username) = LOWER(?) LIMIT 1',
      [normalizedEmail]
    );
  }

  static async verifyPassword(password, passwordHash) {
    if (!passwordHash) {
      return false;
    }

    // Preserve backward compatibility for the legacy MD5 dataset while using bcrypt for new registrations.
    if (String(passwordHash).startsWith('$2')) {
      return bcrypt.compare(String(password), passwordHash);
    }

    const submittedHash = crypto.createHash('md5').update(String(password)).digest('hex');
    return submittedHash === passwordHash;
  }

  static base64UrlEncode(value) {
    return Buffer.from(value)
      .toString('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }

  static signToken(payload, secret, expiresInSeconds = 3600) {
    const header = { alg: 'HS256', typ: 'JWT' };
    const issuedAt = Math.floor(Date.now() / 1000);
    const tokenPayload = {
      ...payload,
      iat: issuedAt,
      exp: issuedAt + expiresInSeconds,
    };

    const encodedHeader = this.base64UrlEncode(JSON.stringify(header));
    const encodedPayload = this.base64UrlEncode(JSON.stringify(tokenPayload));
    const signingInput = `${encodedHeader}.${encodedPayload}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signingInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    return `${signingInput}.${signature}`;
  }
}

module.exports = AuthService;