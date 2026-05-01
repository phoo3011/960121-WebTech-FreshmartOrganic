// Initialize the cart as an array
// Each item: { id, name, price, quantity }
let cart = [];

// Master product list - will be populated from the loaded JSON data
// window._allProducts is set by product-loader.js after fetching data/products.json
let allProducts = [];

// ==================== EVENT DELEGATION ====================

// Use document-level event delegation for clicks (add-to-cart, remove-from-cart, quantity adjustments)
document.addEventListener('click', handleDocumentClick);

/**
 * Unified document click handler for add-to-cart, remove, and quantity adjust actions.
 */
function handleDocumentClick(event) {
  const addBtn = event.target.closest('.add-to-cart');
  if (addBtn) {
    let productId = addBtn.dataset.id;
    // Fallback: try to infer product by title/name when data-id is missing
    if (!productId) {
      const productItem = addBtn.closest('.product-item');
      const titleEl = productItem ? productItem.querySelector('.product-title a, .product-name a') : null;
      const name = titleEl ? titleEl.textContent.trim() : null;
      if (name && window._allProducts && window._allProducts.length) {
        const matched = window._allProducts.find(p => p.name && p.name.trim() === name);
        if (matched) productId = matched.id;
      }
    }
    if (productId) addToCart(productId);
    event.preventDefault();
    return;
  }

  const removeBtn = event.target.closest('.cart-remove, .remove');
  if (removeBtn) {
    const productId = removeBtn.dataset.id;
    if (productId) {
      removeFromCart(productId);
    } else {
      const row = removeBtn.closest('tr');
      const rowProductId = row && row.dataset ? row.dataset.id : null;
      if (rowProductId) removeFromCart(rowProductId);
    }
    event.preventDefault();
    return;
  }

  // Handle quantity adjustment buttons (+ and -)
  const adjustBtn = event.target.closest('.adjust-btn');
  if (adjustBtn) {
    const productId = adjustBtn.dataset.id;
    if (productId) {
      const isPlus = adjustBtn.classList.contains('plus');
      const isMinus = adjustBtn.classList.contains('minus');
      const qtyInput = adjustBtn.closest('.input-group')?.querySelector('.qty-input');
      
      if (qtyInput) {
        let newQty = Number(qtyInput.value) || 1;
        if (isPlus) newQty += 1;
        if (isMinus) newQty = Math.max(1, newQty - 1);
        
        qtyInput.value = newQty;
        updateCartItemQuantity(productId, newQty);
      }
    }
    event.preventDefault();
    return;
  }

  // Handle direct qty input change
  const qtyInput = event.target.closest('.qty-input');
  if (qtyInput && event.type === 'change') {
    const productId = qtyInput.dataset.id;
    const newQty = Number(qtyInput.value) || 1;
    if (productId && newQty > 0) {
      updateCartItemQuantity(productId, newQty);
    }
    event.preventDefault();
    return;
  }
}

// ==================== CART MANAGEMENT ====================

/**
 * Adds a product to the shopping cart or increments its quantity if it already exists.
 * @param {number|string} productID - The unique identifier of the product.
 */
function addToCart(productID) {
  // Sync with window._allProducts if it's been loaded
  if (window._allProducts && window._allProducts.length > 0) {
    allProducts = window._allProducts;
  }

  // 1. Check if the product is already in the cart
  const existingCartItem = cart.find(item => item.id == productID);

  if (existingCartItem) {
    // 2. If it exists, increment the quantity
    existingCartItem.quantity += 1;
    console.log(`Increased quantity of ${existingCartItem.name} to ${existingCartItem.quantity}`);
  } else {
    // 3. Find the product in the master product list
    const productToAdd = allProducts.find(product => product.id == productID);

    if (productToAdd) {
      // 4. Add a copy of the product to the cart with quantity of 1
      cart.push({ ...productToAdd, quantity: 1 });
      console.log(`Added ${productToAdd.name} to the cart`);
    } else {
      console.error(`Error: Product with ID ${productID} not found.`);
      return;
    }
  }

  // 5. Persist the updated cart state
  saveToLocalStorage();

  // 6. Update the UI to reflect the changes
  updateCartUI();
  renderCartDropdown();
}

/**
 * Removes a product from the cart by ID.
 * @param {number|string} productID - The unique identifier of the product to remove.
 */
function removeFromCart(productID) {
  cart = cart.filter(item => item.id != productID);
  console.log(`Removed product ID ${productID} from cart.`);
  
  saveToLocalStorage();
  updateCartUI();
  renderCartDropdown();
}

/**
 * Updates the quantity of a product in the cart.
 * @param {number|string} productID - The unique identifier of the product.
 * @param {number} newQuantity - The new quantity (use 0 or negative to remove).
 */
function updateCartItemQuantity(productID, newQuantity) {
  const cartItem = cart.find(item => item.id == productID);
  
  if (cartItem) {
    if (newQuantity <= 0) {
      removeFromCart(productID);
    } else {
      cartItem.quantity = newQuantity;
      console.log(`Updated quantity of product ID ${productID} to ${newQuantity}.`);
      saveToLocalStorage();
      updateCartUI();
      renderCartDropdown();
    }
  } else {
    console.error(`Product ID ${productID} not found in cart.`);
  }
}

/**
 * Clears all items from the cart.
 */
function clearCart() {
  cart = [];
  console.log("Cart cleared.");
  
  saveToLocalStorage();
  updateCartUI();
  renderCartDropdown();
}

// ==================== LOCAL STORAGE ====================

/**
 * Saves the current cart to Local Storage.
 */
function saveToLocalStorage() {
  localStorage.setItem('shoppingCart', JSON.stringify(cart));
  console.log("Cart saved to Local Storage.");
}

/**
 * Loads the shopping cart from Local Storage.
 * Call this when the page initially loads.
 */
function loadCart() {
  const savedCartData = localStorage.getItem('shoppingCart');

  if (savedCartData) {
    try {
      cart = JSON.parse(savedCartData);
      console.log("Cart successfully loaded from Local Storage.", cart);
    } catch (error) {
      console.error("Failed to parse cart data from Local Storage:", error);
      cart = [];
    }
  // Sync with window._allProducts if available
  if (window._allProducts && window._allProducts.length > 0) {
    allProducts = window._allProducts;
  }

  } else {
    console.log("No existing cart found. Starting fresh.");
    cart = [];
  }

  updateCartUI();
  renderCartDropdown();
  
  // If this is the cart page, render the full cart view
  if (document.querySelector('.cart-summary tbody')) {
    renderCartPage();
  }
}

// ==================== UI UPDATES ====================

/**
 * Updates the cart UI (badge count, cart display, total, etc.).
 * Implement this based on your HTML structure.
 */
function updateCartUI() {
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  
  console.log(`Cart: ${cartCount} items | Total: $${cartTotal.toFixed(2)}`);
  
  // Update cart count badge in header
  const cartCountBadge = document.querySelector('.cart-count');
  if (cartCountBadge) {
    cartCountBadge.textContent = cartCount;
  }
  
  // Update cart badge if it exists
  const cartBadge = document.getElementById('cart-badge');
  if (cartBadge) {
    cartBadge.textContent = cartCount;
  }
  
  // Update cart total if it exists
  const cartTotalEl = document.getElementById('cart-total');
  if (cartTotalEl) {
    cartTotalEl.textContent = `$${cartTotal.toFixed(2)}`;
  }
}

/**
 * Renders the cart dropdown (header) using the current `cart` array.
 */
function renderCartDropdown() {
  const container = document.getElementById('cart-dropdown-items');
  const totalEl = document.getElementById('cart-dropdown-total');

  if (!container) return;

  if (!cart || cart.length === 0) {
    container.innerHTML = `<tr><td colspan="3">Your cart is empty.</td></tr>`;
    if (totalEl) totalEl.textContent = '$0.00';
    return;
  }

  container.innerHTML = '';

  cart.forEach(item => {
    const price = Number(item.price) || 0;
    const lineTotal = (price * (item.quantity || 1)).toFixed(2);

    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="product-image">
        <a href="product-detail-left-sidebar.html">
          <img src="${item.image || item.image_url || 'img/product/1.jpg'}" alt="${item.name}" style="width:60px;" />
        </a>
      </td>
      <td>
        <div class="product-name">
          <a href="product-detail-left-sidebar.html">${item.name}</a>
        </div>
        <div>
          ${item.quantity} x <span class="product-price">$${lineTotal}</span>
        </div>
      </td>
      <td class="action">
        <a class="cart-remove" href="#" data-id="${item.id}"><i class="fa fa-trash-o" aria-hidden="true"></i></a>
      </td>
    `;

    container.appendChild(row);
  });

  const total = cart.reduce((sum, it) => sum + (Number(it.price || 0) * (it.quantity || 1)), 0);
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

/**
 * Renders the shopping cart page (product-cart.html) using the current `cart` array.
 */
function renderCartPage() {
  const tableBody = document.querySelector('.cart-summary tbody');
  if (!tableBody) return;

  if (!cart || cart.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-center">Your cart is empty.</td></tr>`;
    updateCartPageTotals();
    return;
  }

  tableBody.innerHTML = '';

  cart.forEach(item => {
    const price = Number(item.price) || 0;
    const itemTotal = (price * (item.quantity || 1)).toFixed(2);
    const productImg = item.image || item.image_url || `img/product/${item.id}.jpg`;

    const row = document.createElement('tr');
    row.dataset.id = item.id;
    row.innerHTML = `
      <td class="product-remove">
        <a title="Remove this item" class="remove" href="#" data-id="${item.id}">
          <i class="fa fa-times"></i>
        </a>
      </td>
      <td>
        <a href="product-detail-left-sidebar.html">
          <img width="80" alt="${item.name}" class="img-responsive" src="${productImg}">
        </a>
      </td>
      <td>
        <a href="product-detail-left-sidebar.html" class="product-name">${item.name}</a>
      </td>
      <td class="text-center">
        $${price.toFixed(2)}
      </td>
      <td>
        <div class="product-quantity">
          <div class="qty">
            <div class="input-group">
              <input type="text" name="qty" value="${item.quantity}" data-min="1" data-id="${item.id}" class="qty-input">
              <span class="adjust-qty">
                <span class="adjust-btn plus" data-id="${item.id}">+</span>
                <span class="adjust-btn minus" data-id="${item.id}">-</span>
              </span>
            </div>
          </div>
        </div>
      </td>
      <td class="text-center">
        $${itemTotal}
      </td>
    `;

    tableBody.appendChild(row);
  });

  updateCartPageTotals();
}

/**
 * Updates the totals section on the cart page.
 */
function updateCartPageTotals() {
  const totalProductsCell = document.querySelector('.cart-total:nth-of-type(1) td:last-child');
  const totalCell = document.querySelector('.cart-total:nth-of-type(3) td:last-child');

  const total = cart.reduce((sum, it) => sum + (Number(it.price || 0) * (it.quantity || 1)), 0);

  if (totalProductsCell) totalProductsCell.textContent = `$${total.toFixed(2)}`;
  if (totalCell) totalCell.textContent = `$${total.toFixed(2)}`;
}

// ==================== INITIALIZATION ====================

// Load cart when the page loads
document.addEventListener('DOMContentLoaded', () => {
  loadCart();
});
