const express = require('express');
const router = express.Router();

// --- Helper function to save order to database ---
const saveOrderToDatabase = async (orderData) => {
    // Simulating a random database failure for demonstration purposes
    // In production, replace with actual Sequelize/Mongoose/SQL query
    if (Math.random() < 0.1) {
        throw new Error("Database timeout or constraint violation.");
    }
    return { orderId: 'ORD-' + Math.floor(Math.random() * 10000) };
};

/**
 * POST /api/checkout
 * Validates cart, email, and credit card
 * Saves order to database if all validations pass
 */
router.post('/checkout', async (req, res) => {
    try {
        const { cartItems, email, creditCard } = req.body;
        const errors = {}; // Object to accumulate specific field errors

        // 1. Validate Cart Items
        if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
            errors.cartItems = "Your cart is empty or formatted incorrectly.";
        }

        // 2. Validate Email using Regex
        // Standard simple email regex validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
            errors.email = "Please provide a valid email address.";
        }

        // 3. Validate Credit Card (Exactly 16 digits)
        const ccRegex = /^\d{16}$/;
        if (!creditCard || !ccRegex.test(creditCard)) {
            errors.creditCard = "Credit card must be exactly 16 digits.";
        }

        // If any validation errors occurred, return 400 immediately
        if (Object.keys(errors).length > 0) {
            return res.status(400).json({
                success: false,
                message: "Checkout failed due to validation errors.",
                errors: errors // Sends specific error for each failed field
            });
        }

        // 4. Calculate Total
        // Note: In a real app, never trust the client's price. 
        // You should fetch the real prices from your database using the product IDs.
        const orderTotal = cartItems.reduce((total, item) => {
            // Assuming item looks like: { productId: 1, quantity: 2, price: 9.99 }
            return total + (item.price * item.quantity);
        }, 0);

        // 5. Attempt to Save Order
        const orderData = {
            email,
            totalAmount: orderTotal,
            items: cartItems,
            status: 'Processing',
            createdAt: new Date().toISOString()
        };

        const savedOrder = await saveOrderToDatabase(orderData);

        // Log the order (in production, this would be in a database)
        console.log("[Order Created]", savedOrder.orderId, "- Email:", email, "- Total:", orderTotal);

        // If successful, return 200 OK
        // ONLY when the frontend receives this 200 status should it clear the cart
        return res.status(200).json({
            success: true,
            message: "Order placed successfully!",
            orderId: savedOrder.orderId,
            totalCharged: orderTotal
        });

    } catch (error) {
        // Catch any unexpected errors (like database failures)
        console.error("[Checkout Error]:", error.message);
        
        return res.status(400).json({
            success: false,
            message: "Failed to save the order. Please try again.",
            errors: {
                database: "We encountered an issue saving your order. Your card has not been charged."
            }
        });
    }
});

module.exports = router;
