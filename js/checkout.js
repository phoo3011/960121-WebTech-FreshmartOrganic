/**
 * Checkout Handler
 * Manages the checkout process: validation, submission, and cart clearing
 */

/**
 * Main checkout submission function
 * Sends cart, email, and credit card to backend for processing
 * @param {Event} event - The form submission event
 */
async function submitCheckout(event) {
    event.preventDefault();

    // Get form data
    const email = document.getElementById('checkout-email')?.value || '';
    const creditCard = document.getElementById('checkout-cc')?.value?.replace(/\s/g, '') || '';
    
    // Get cart from localStorage (note: cart.js uses 'shoppingCart' as the key)
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

    // Build payload
    const payload = {
        cartItems: cart,
        email: email,
        creditCard: creditCard
    };

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            // The server returned a 400 status. DO NOT clear the cart.
            // Display validation errors next to input fields.
            console.log("Validation Errors:", data.errors);
            displayErrorsInUI(data.errors);
            return;
        }

        // The server returned 200 OK! 
        // Safe to clear the cart and redirect to a thank you page.
        localStorage.removeItem('shoppingCart');
        
        // Update cart display on page
        updateCartDisplay();
        
        // Redirect to thank you page with order ID
        window.location.href = `/thank-you.html?order=${data.orderId}`;

    } catch (err) {
        console.error("Network error:", err);
        displayErrorsInUI({
            network: "Network error occurred. Please check your connection and try again."
        });
    }
}

/**
 * Display validation errors in the UI
 * @param {Object} errors - Object with field names as keys and error messages as values
 */
function displayErrorsInUI(errors) {
    // Clear previous errors
    document.querySelectorAll('.form-error').forEach(el => el.remove());
    document.querySelectorAll('.form-group').forEach(el => el.classList.remove('error'));

    // Display new errors
    if (errors.cartItems) {
        showFieldError('checkout-email', errors.cartItems);
    }
    
    if (errors.email) {
        showFieldError('checkout-email', errors.email);
    }
    
    if (errors.creditCard) {
        showFieldError('checkout-cc', errors.creditCard);
    }

    if (errors.database) {
        showFieldError('checkout-form', errors.database);
    }

    if (errors.network) {
        showFieldError('checkout-form', errors.network);
    }
}

/**
 * Show error message for a specific field
 * @param {string} fieldId - The ID of the input field
 * @param {string} message - The error message
 */
function showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;

    // Mark field as error
    const formGroup = field.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('error');
    }

    // Create and append error message
    const errorEl = document.createElement('div');
    errorEl.className = 'form-error';
    errorEl.style.color = 'red';
    errorEl.style.fontSize = '12px';
    errorEl.style.marginTop = '5px';
    errorEl.textContent = message;
    
    field.parentNode.insertBefore(errorEl, field.nextSibling);
}

/**
 * Update the cart display (usually in cart count badge)
 */
function updateCartDisplay() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const cartCount = document.querySelector('.cart-count');
    if (cartCount) {
        cartCount.textContent = cart.length;
    }
}

/**
 * Format credit card input as it's typed (add spaces every 4 digits)
 * @param {Event} event - The input event
 */
function formatCreditCard(event) {
    let value = event.target.value.replace(/\s/g, '');
    let formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    event.target.value = formattedValue;
}

/**
 * Validate credit card on input
 * @param {Event} event - The input event
 */
function validateCreditCard(event) {
    const value = event.target.value.replace(/\s/g, '');
    const isValid = /^\d{0,16}$/.test(value);
    
    if (!isValid) {
        event.target.value = event.target.value.slice(0, -1);
    }
}

/**
 * Validate email on input
 * @param {Event} event - The input event
 */
function validateEmail(event) {
    const email = event.target.value;
    const isValid = /^[^\s@]*@?[^\s@]*\.?[^\s@]*$/.test(email);
    
    if (!isValid) {
        event.target.value = event.target.value.slice(0, -1);
    }
}

// ==================== INITIALIZATION ====================

/**
 * Initialize checkout page on DOMContentLoaded
 */
document.addEventListener('DOMContentLoaded', function() {
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', submitCheckout);
    }

    // Add input event listeners for formatting and validation
    const emailField = document.getElementById('checkout-email');
    if (emailField) {
        emailField.addEventListener('input', validateEmail);
    }

    const ccField = document.getElementById('checkout-cc');
    if (ccField) {
        ccField.addEventListener('input', formatCreditCard);
        ccField.addEventListener('input', validateCreditCard);
    }

    // Display cart items on checkout page
    displayCheckoutCart();
});

/**
 * Display cart items on checkout page
 */
function displayCheckoutCart() {
    const cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];
    const cartBody = document.getElementById('checkout-cart-items');
    const cartTotal = document.getElementById('checkout-total');
    const sidebarTotal = document.getElementById('checkout-sidebar-total');
    
    if (!cartBody) return;

    cartBody.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        cartBody.innerHTML = '<tr><td colspan="4" style="text-align: center; padding: 20px;">Your cart is empty</td></tr>';
        if (cartTotal) cartTotal.textContent = '$0.00';
        if (sidebarTotal) sidebarTotal.textContent = '$0.00';
        return;
    }

    cart.forEach(item => {
        const itemTotal = (item.price * item.quantity).toFixed(2);
        total += parseFloat(itemTotal);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td class="text-center">$${parseFloat(item.price).toFixed(2)}</td>
            <td class="text-center">${item.quantity}</td>
            <td class="text-center">$${itemTotal}</td>
        `;
        cartBody.appendChild(row);
    });

    if (cartTotal) {
        cartTotal.textContent = '$' + total.toFixed(2);
    }
    
    if (sidebarTotal) {
        sidebarTotal.textContent = '$' + total.toFixed(2);
    }
}
