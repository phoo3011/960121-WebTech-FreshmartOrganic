function requestProducts() {
    cleanupLegacyProducts();
    removeDuplicatePaginationBars();

    const containers = getRenderTargets();

    if (!containers.length) {
        return;
    }

    console.log('Initiating product request...');
    fetchProductData('data/products.json');
}

async function fetchProductData(path) {
    try {
        const response = await fetch(path);

        if (!response.ok) {
            throw new Error(`Failed to reach data source. Status: ${response.status}`);
        }

        const productList = await response.json();
        renderUI(productList);
    } catch (error) {
        console.error('Data Flow Interrupted:', error);
        handleError(error);
    }
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
                    <a class="add-to-cart" href="#"><i class="fa fa-shopping-basket" aria-hidden="true"></i></a>
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
                            <a class="add-to-cart" href="#"><i class="fa fa-shopping-basket" aria-hidden="true"></i><span>Add To Cart</span></a>
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
                        <form action="#" class="pull-right">
                            <div class="select">
                                <select class="form-control" aria-label="Relevance">
                                    <option value="">Relevance</option>
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

function handleError(err) {
    const container = document.querySelector('#product-container');

    if (!container) {
        return;
    }

    container.innerHTML = `<p class="error">Error loading organic products: ${err.message}</p>`;
}

document.addEventListener('DOMContentLoaded', requestProducts);
