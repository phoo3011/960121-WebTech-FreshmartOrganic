const express = require('express');
const router = express.Router();

const OrderService = require('../services/orderService');

/**
 * POST /api/checkout
 * Inserts an order into store.db using SQLite.
 */
router.post('/checkout', async (req, res) => {
    try {
        const userId = Number(req.body.user_id ?? req.body.userId);
        const productId = Number(req.body.product_id ?? req.body.productId);
        const quantity = Number(req.body.quantity);
        const totalPrice = Number(req.body.total_price ?? req.body.totalPrice);

        const errors = {};

        if (!Number.isInteger(userId) || userId <= 0) {
            errors.user_id = 'user_id must be a positive integer.';
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
