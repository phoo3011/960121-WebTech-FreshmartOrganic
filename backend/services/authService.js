/**
 * Authentication Service
 * Handles user lookup, password verification, and token creation.
 */

const crypto = require('crypto');
const fs = require('fs');
const config = require('../config/config');

class AuthService {
  static async getUsers() {
    const fileContents = await fs.promises.readFile(config.AUTH_USERS_FILE, 'utf-8');
    return JSON.parse(fileContents);
  }

  static async findUserByEmail(email) {
    const normalizedEmail = String(email).trim().toLowerCase();
    const users = await this.getUsers();
    return users.find((user) => String(user.username).trim().toLowerCase() === normalizedEmail) || null;
  }

  static verifyPassword(password, passwordHash) {
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