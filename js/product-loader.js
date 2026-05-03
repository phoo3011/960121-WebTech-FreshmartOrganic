// ============================================================================
// LOGIC FLOW:
// 1. Trigger  : User clicks category OR page loads
// 2. Request  : Browser sends GET /api/products?category=xxx
// 3. Processing: Express server filters (Gatekeeper pattern)
// 4. Response : Server returns { success, data, count }
// 5. Render   : renderUI(data) injects product cards into the DOM
// ============================================================================

// Track the current category filter state
window._currentCategory = null;

function requestProducts() {
    cleanupLegacyProducts();
    removeDuplicatePaginationBars();

    const containers = getRenderTargets();

    if (!containers.length) {
        return;
    }

    console.log('Initiating product request from REST API...');
    // Fetch from REST API instead of static JSON file
    fetchProductData();
    // Attach category filter event listeners to sidebar links
    attachCategoryFilterListeners();
}

/**
 * Fetches product data from the REST API endpoint.
 * Replaces the previous static JSON fetch with dynamic API calls.
 * 
 * @param {string} [category] - Optional category filter parameter
 */
async function fetchProductData(category = null) {
    try {
        // Build the API endpoint URL with optional category parameter
        const apiEndpoint = 'http://localhost:5000/api/products';
        const url = category 
            ? `${apiEndpoint}?category=${encodeURIComponent(category)}`
            : apiEndpoint;

        console.log(`Fetching products from: ${url}`);
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`REST API Error. Status: ${response.status}`);
        }

        const apiResponse = await response.json();

        // API Response Format (Gatekeeper pattern):
        // { success: true, data: [...products], count: N }
        if (!apiResponse.success) {
            throw new Error(apiResponse.message || 'API returned unsuccessful response');
        }

        // Extract product data from response.data field
        const productList = apiResponse.data || [];
        window._allProducts = productList;
        window._currentCategory = category;

        console.log(`Successfully loaded ${productList.length} products`);
        renderUI(productList);

        // If cart helpers are available, render the header dropdown to reflect product load
        if (typeof renderCartDropdown === 'function') {
            try { renderCartDropdown(); } catch (e) { /* ignore */ }
        }
    } catch (error) {
        console.error('REST API Data Flow Interrupted:', error);
        handleError(error);
    }
}

/**
 * Attaches event listeners to category filter links in the sidebar.
 * When a user clicks a category, it prevents default navigation and
 * instead calls the API with the selected category filter.
 */
function attachCategoryFilterListeners() {
    const categoryLinks = document.querySelectorAll('.category-title');

    categoryLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            // Prevent page reload (Gatekeeper pattern - stop default behavior)
            e.preventDefault();

            // Extract category name from link text
            const categoryName = link.textContent.trim();
            
            console.log(`Category filter clicked: ${categoryName}`);

            // Fetch products filtered by this category
            fetchProductData(categoryName);
        });
    });
}

function renderUI(data) {
    const gridContainer = document.querySelector('#product-container, #product-grid-container');
    const listContainer = document.querySelector('#product-list-container');

    if (gridContainer) {
        gridContainer.innerHTML = '';
    }

    if (listContainer) {
        listContainer.innerHTML = '';
    }

    data.forEach((item) => {
        if (gridContainer) {
            gridContainer.insertAdjacentHTML('beforeend', buildGridCard(item));
        }

        if (listContainer) {
            listContainer.insertAdjacentHTML('beforeend', buildListCard(item));
        }
    });

    updateProductCount(data.length);
    updatePaginationSummary(data.length);
    console.log('UI successfully rendered with', data.length, 'items.');
}

function buildGridCard(item) {
    const price = Number(item.price);
    const salePrice = Number.isFinite(price) ? price.toFixed(2) : '0.00';
    const basePrice = Number.isFinite(price) ? (price + 1).toFixed(2) : '0.00';

    return `
        <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
            <div class="product-item">
                <div class="product-image">
                    <a href="product-detail-left-sidebar.html">
                        <img class="img-responsive" src="${item.image || item.image_url || ''}" alt="${item.name}">
                    </a>
                </div>
                <div class="product-title">
                    <a href="product-detail-left-sidebar.html">${item.name}</a>
                </div>
                <div class="product-price">
                    <span class="sale-price">$${salePrice}</span>
                    <span class="base-price">$${basePrice}</span>
                </div>
                <div class="product-buttons">
                    <a class="add-to-cart" data-id="${item.id}" href="#"><i class="fa fa-shopping-basket" aria-hidden="true"></i></a>
                    <a class="add-wishlist" href="#"><i class="fa fa-heart" aria-hidden="true"></i></a>
                    <a class="quickview" href="#"><i class="fa fa-eye" aria-hidden="true"></i></a>
                </div>
            </div>
        </div>
    `;
}

function buildListCard(item) {
    const price = Number(item.price);
    const salePrice = Number.isFinite(price) ? price.toFixed(2) : '0.00';
    const basePrice = Number.isFinite(price) ? (price + 1).toFixed(2) : '0.00';

    return `
        <div class="product-item">
            <div class="row">
                <div class="col-lg-4 col-md-4 col-sm-6 col-xs-12">
                    <div class="product-image">
                        <a href="product-detail-left-sidebar.html">
                            <img class="img-responsive" src="${item.image || item.image_url || ''}" alt="${item.name}">
                        </a>
                    </div>
                </div>
                <div class="col-lg-8 col-md-8 col-sm-6 col-xs-12">
                    <div class="product-info">
                        <div class="product-title">
                            <a href="product-detail-left-sidebar.html">${item.name}</a>
                        </div>
                        <div class="product-rating">
                            <div class="star on"></div>
                            <div class="star on"></div>
                            <div class="star on"></div>
                            <div class="star on"></div>
                            <div class="star"></div>
                            <span class="review-count">(${item.status || 'In Stock'})</span>
                        </div>
                        <div class="product-price">
                            <span class="sale-price">$${salePrice}</span>
                            <span class="base-price">$${basePrice}</span>
                        </div>
                        <div class="product-stock">
                            <i class="fa fa-check-square-o" aria-hidden="true"></i>${item.status || 'In Stock'}
                        </div>
                        <div class="product-description">
                            ${item.category || 'Organic product'} from the FreshMart catalog.
                        </div>
                        <div class="product-buttons">
                            <a class="add-to-cart" data-id="${item.id}" href="#"><i class="fa fa-shopping-basket" aria-hidden="true"></i><span>Add To Cart</span></a>
                            <a class="add-wishlist" href="#"><i class="fa fa-heart" aria-hidden="true"></i></a>
                            <a class="quickview" href="#"><i class="fa fa-eye" aria-hidden="true"></i></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function updateProductCount(count) {
    const counter = document.querySelector('#total-products-count');

    if (counter) {
        counter.textContent = `There are ${count} products`;
    }
}

/**
 * Filters an array of products based on a search term and an optional category.
 * Backwards-compatible: if only a search term is provided, it behaves like before.
 *
 * @param {string} searchTerm - The text to search for in the product name.
 * @param {string} [category] - The category to filter by (or 'All' / undefined for no category filter).
 */
function filterProducts(searchTerm, category) {
    const all = Array.isArray(window._allProducts) ? window._allProducts : [];

    const normalizedSearchTerm = (searchTerm || '').toString().toLowerCase().trim();
    const normalizedCategory = (category || 'All').toString().toLowerCase().trim();

    // If no search term and category is 'all', render everything
    if (!normalizedSearchTerm && normalizedCategory === 'all') {
        renderUI(all);
        return;
    }

    const filtered = all.filter((product) => {
        // Category match: pass when category is 'all' or when product category matches exactly (case-insensitive)
        const productCategory = (product.category || '').toString().toLowerCase().trim();
        const matchesCategory = normalizedCategory === 'all' || productCategory === normalizedCategory;

        // Search term match: if empty search term, match everything for the name check
        const productName = (product.name || '').toString().toLowerCase();
        const matchesSearch = !normalizedSearchTerm || productName.includes(normalizedSearchTerm);

        return matchesCategory && matchesSearch;
    });

    renderUI(filtered);
}

function getRenderTargets() {
    return [
        document.querySelector('#product-container'),
        document.querySelector('#product-grid-container'),
        document.querySelector('#product-list-container')
    ].filter(Boolean);
}

function cleanupLegacyProducts() {
    const centerColumn = document.querySelector('#center-column');

    if (!centerColumn) {
        return;
    }

    const productCategoryPage = centerColumn.querySelector('.product-category-page');

    if (!productCategoryPage) {
        return;
    }

    productCategoryPage.innerHTML = `
        <div class="products-bar">
            <div class="row">
                <div class="col-md-6 col-xs-6">
                    <div class="gridlist-toggle" role="tablist">
                        <ul class="nav nav-tabs">
                            <li class="active"><a href="#products-grid" data-toggle="tab" aria-expanded="true"><i class="fa fa-th-large"></i></a></li>
                            <li><a href="#products-list" data-toggle="tab" aria-expanded="false"><i class="fa fa-bars"></i></a></li>
                        </ul>
                    </div>
                    <div class="total-products" id="total-products-count">There are 12 products</div>
                </div>
                <div class="col-md-6 col-xs-6">
                    <div class="filter-bar">
                        <form action="#" class="pull-right search-form">
                            <div class="select">
                                <input id="product-search-input" class="form-control" type="search" placeholder="Search products..." aria-label="Search products">
                            </div>
                        </form>
                        <form action="#" class="pull-right">
                            <div class="select">
                                <select class="form-control" aria-label="Sort By">
                                    <option value="">Sort By</option>
                                    <option value="1">Price: Lowest first</option>
                                    <option value="2">Price: Highest first</option>
                                    <option value="3">Product Name: A to Z</option>
                                    <option value="4">Product Name: Z to A</option>
                                    <option value="5">In stock</option>
                                </select>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
        <div class="tab-content">
            <div class="tab-pane active" id="products-grid">
                <div class="products-block">
                    <div id="product-grid-container" class="row"></div>
                </div>
            </div>
            <div class="tab-pane" id="products-list">
                <div class="products-block layout-5">
                    <div id="product-list-container"></div>
                </div>
            </div>
        </div>
    `;

    const searchInputEl = productCategoryPage.querySelector('#product-search-input');

    if (searchInputEl) {
        searchInputEl.addEventListener('input', (e) => {
            filterProducts(e.target.value);
        });

        searchInputEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
            }
        });
    }

    const leftColumn = document.querySelector('#left-column');
    const row = centerColumn.parentElement;

    if (leftColumn && row && leftColumn.parentElement !== row) {
        row.appendChild(leftColumn);
    }
}

function updatePaginationSummary(count) {
    document.querySelectorAll('.pagination-bar .text').forEach((summary) => {
        summary.textContent = `Showing 1-12 of ${count} item(s)`;
    });
}

function removeDuplicatePaginationBars() {
    const centerColumn = document.querySelector('#center-column');

    if (!centerColumn) {
        return;
    }

    const paginationBars = centerColumn.querySelectorAll('.pagination-bar');

    paginationBars.forEach((bar, index) => {
        if (index > 0) {
            bar.remove();
        }
    });
}

/**
 * Handles API errors by displaying a user-friendly message.
 * Shows error in #product-grid-container for visibility.
 * 
 * @param {Error} err - The error object from fetch or processing
 */
function handleError(err) {
    // Try to display error in product grid container (primary target)
    const gridContainer = document.querySelector('#product-grid-container');
    const legacyContainer = document.querySelector('#product-container');
    const targetContainer = gridContainer || legacyContainer;

    if (!targetContainer) {
        console.error('No container found for error display');
        return;
    }

    // Provide user-friendly error message
    let userMessage = 'Unable to load organic products at this time.';
    
    if (err.message.includes('Failed to fetch')) {
        userMessage = 'Connection error: Unable to reach the product server. Please check your internet connection.';
    } else if (err.message.includes('500')) {
        userMessage = 'Server error (500): The product service encountered an issue. Please try again later.';
    } else if (err.message.includes('404')) {
        userMessage = 'Server error (404): Product service not found. Please contact support.';
    }

    targetContainer.innerHTML = `
        <div style="padding: 20px; text-align: center; color: #d32f2f; background-color: #ffebee; border-radius: 4px; margin: 20px;">
            <p><strong>⚠️ Error Loading Products</strong></p>
            <p>${userMessage}</p>
            <p style="font-size: 12px; color: #999; margin-top: 10px;">Technical details: ${err.message}</p>
        </div>
    `;

    console.error('Product Loading Error:', err);
}

document.addEventListener('DOMContentLoaded', requestProducts);
