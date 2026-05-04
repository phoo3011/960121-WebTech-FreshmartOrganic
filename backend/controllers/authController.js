/**
 * Authentication Controller
 * Handles login requests for the mock auth dataset.
 */

const AuthService = require('../services/authService');
const config = require('../config/config');

class AuthController {
  static async login(req, res) {
    try {
      const { email, username, password } = req.body;
      const loginName = email || username;

      if (!loginName || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
      }

      const user = await AuthService.findUserByEmail(loginName);

      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const isPasswordValid = AuthService.verifyPassword(password, user.passwordHash);

      if (!isPasswordValid) {
        return res.status(401).json({ error: 'Invalid credentials.' });
      }

      const token = AuthService.signToken(
        { email: user.username, firstName: user.firstName },
        config.JWT_SECRET,
        60 * 60
      );

      return res.status(200).json({
        message: 'Authentication successful',
        token,
        user: {
          firstName: user.firstName,
          email: user.username,
          registrationDate: user.registrationDate,
        },
      });
    } catch (error) {
      console.error('[Auth Error]', error);
      return res.status(500).json({ error: 'An internal server error occurred.' });
    }
  }
}

module.exports = AuthController;