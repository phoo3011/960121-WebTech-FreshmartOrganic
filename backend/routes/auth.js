/**
 * Authentication Routes
 * Exposes login and registration endpoints for the frontend.
 */

const express = require('express');
const AuthController = require('../controllers/authController');
const RegisterService = require('../services/register');
const { validateBody, Joi } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimit');

const router = express.Router();

/**
 * Handle user registration with server-side validation and secure password hashing.
 * @param {import('express').Request} req - Express request object.
 * @param {import('express').Response} res - Express response object.
 * @returns {Promise<void>}
 */
router.post('/register', async (req, res) => {
	try {
		const result = await RegisterService.registerUser(req.body);
		return res.status(201).json(result);
	} catch (error) {
		const status = error.statusCode || 500;

		return res.status(status).json({
			success: false,
			message: error.message || 'An internal server error occurred.',
		});
	}
});

const loginSchema = Joi.object({
	email: Joi.string().email().allow('', null),
	username: Joi.string().allow('', null),
	password: Joi.string().min(6).required(),
}).or('email', 'username');

router.post('/login', authLimiter, validateBody(loginSchema), AuthController.login);

module.exports = router;