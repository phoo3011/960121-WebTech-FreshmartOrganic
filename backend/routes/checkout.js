const express = require('express');
const router = express.Router();

const OrderService = require('../services/orderService');
const ProductService = require('../services/productService');
const auth = require('../middleware/auth');
const { validateBody, Joi } = require('../middleware/validate');
const { checkoutLimiter } = require('../middleware/rateLimit');

/**
 * POST /api/checkout
 * Inserts an order into store.db using SQLite.
 */
const checkoutSchema = Joi.object({
    product_id: Joi.number().integer().positive().required(),
    productId: Joi.number().integer().positive(),
    quantity: Joi.number().integer().positive().required(),
});

router.post('/checkout', checkoutLimiter, auth, validateBody(checkoutSchema), async (req, res) => {
    try {
        // userId comes from auth middleware
        const userId = Number(req.user && req.user.id);
        const productId = Number(req.body.product_id ?? req.body.productId);
        const quantity = Number(req.body.quantity);
        const idempotencyKey = req.header('Idempotency-Key') || null;

        // Server-side compute of totalPrice
        const product = await ProductService.getProductById(productId);
        const totalPrice = product ? Number((product.price * quantity).toFixed(2)) : NaN;

        const errors = {};

        if (!Number.isInteger(userId) || userId <= 0) {
            errors.user_id = 'authenticated user required.';
        }

        if (!Number.isInteger(productId) || productId <= 0) {
            errors.product_id = 'product_id must be a positive integer.';
        }

        if (!Number.isInteger(quantity) || quantity <= 0) {
            errors.quantity = 'quantity must be a positive integer.';
        }

        if (!Number.isFinite(totalPrice) || totalPrice < 0) {
            errors.total_price = 'total_price must be a valid non-negative number.';
        }

        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Order validation failed.',
                errors,
            });
        }

        const savedOrder = await OrderService.createOrder({
            userId,
            productId,
            quantity,
            totalPrice,
            idempotencyKey,
        });

        return res.status(201).json({
            success: true,
            message: 'Order saved successfully.',
            orderId: savedOrder.id,
            data: {
                user_id: userId,
                product_id: productId,
                quantity,
                total_price: totalPrice,
            },
        });
    } catch (error) {
        console.error('[Checkout Error]:', error.message);

        return res.status(500).json({
            success: false,
            message: 'Failed to save the order in store.db.',
            errors: {
                database: 'SQLite could not save the order. Please try again.',
            },
        });
    }
});

module.exports = router;
