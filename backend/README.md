# FreshMart Organic - Backend Architecture

## Overview

This backend follows the **Controller-Route-Service (CRS)** pattern, which separates concerns into three distinct layers:

- **Routes**: Define API endpoints
- **Controllers**: Handle HTTP requests/responses and business logic coordination
- **Services**: Contain reusable business logic and data operations

## Project Structure

```
backend/
├── server.js                 # Main Express application entry point
├── config/
│   └── config.js            # Configuration (port, file paths, CORS, etc.)
├── routes/
│   └── products.js          # Product API endpoints
├── controllers/
│   └── productController.js # Product request handlers
├── services/
│   └── productService.js    # Product business logic & data operations
└── middleware/
    └── errorHandler.js      # Global error handling middleware
```

## Architecture Pattern: Controller-Route-Service

### Data Flow

```
HTTP Request
    ↓
[Routes] → Matches endpoint & routes to controller
    ↓
[Controller] → Handles request, calls service, formats response
    ↓
[Service] → Performs business logic, accesses data source (JSON)
    ↓
[Response] → Returns formatted JSON to client
```

## Key Files

### 1. **backend/server.js**
Main Express application file that:
- Initializes the Express app
- Configures middleware (CORS, body-parser, logging)
- Registers routes
- Sets up error handling
- Starts the server on port 5000

```bash
npm start
# or
npm run dev
```

### 2. **backend/config/config.js**
Centralized configuration:
- Port and environment settings
- File paths to JSON data
- CORS origin configuration
- API prefix settings

### 3. **backend/routes/products.js**
Defines all product-related endpoints:
- `GET /api/products` - Get all products (with pagination, search, category filter)
- `GET /api/products/:id` - Get product by ID
- `GET /api/products/category/:name` - Get products by category
- `GET /api/products/search/:query` - Search products

### 4. **backend/controllers/productController.js**
Handles HTTP request/response logic:
- `getAllProducts()` - Returns all products with optional filtering
- `getProductById()` - Returns single product by ID
- `getProductsByCategory()` - Filters by category
- `searchProducts()` - Full-text search functionality

### 5. **backend/services/productService.js**
Contains reusable business logic:
- `getAllProducts()` - Loads all products from JSON
- `getProductById()` - Retrieves specific product
- `getProductsByCategory()` - Category filtering logic
- `searchProducts()` - Search implementation
- `getPaginatedProducts()` - Pagination logic

## API Endpoints

### Get All Products
```bash
GET /api/products
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10)
- `category` - Filter by category
- `search` - Search term

**Example Requests:**
```bash
# All products
curl http://localhost:5000/api/products

# Paginated (page 2, 15 items per page)
curl "http://localhost:5000/api/products?page=2&limit=15"

# By category
curl "http://localhost:5000/api/products?category=Fruits"

# Search
curl "http://localhost:5000/api/products?search=organic"
```

### Get Single Product
```bash
GET /api/products/:id
```

**Example:**
```bash
curl http://localhost:5000/api/products/1
```

### Get by Category
```bash
GET /api/products/category/:name
```

**Example:**
```bash
curl http://localhost:5000/api/products/category/Vegetables
```

### Search Products
```bash
GET /api/products/search/:query
```

**Example:**
```bash
curl http://localhost:5000/api/products/search/apple
```

### Health Check
```bash
GET /api/health
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": [...],
  "count": 10,
  "message": "All products retrieved successfully"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "status": 404,
    "message": "Product with ID 999 not found"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalProducts": 50,
    "itemsPerPage": 10
  },
  "message": "Products retrieved successfully with pagination"
}
```

## Data Source

Products are loaded from `data/products.json`. The JSON file contains product objects with the following structure:

```json
{
  "id": 1,
  "name": "Fresh Organic Carrots",
  "category": "Vegetables",
  "price": 4.50,
  "image": "img/product/1.jpg",
  "status": "In Stock",
  "discount": "10%"
}
```

## Middleware

### CORS Middleware
Allows cross-origin requests from configured origins (default: `http://localhost:3000`)

### Request Logging
Logs all incoming requests with timestamp and method

### Error Handler
Global error handling that catches unhandled promise rejections and formats error responses

## Benefits of This Architecture

1. **Separation of Concerns**: Each layer has a specific responsibility
2. **Reusability**: Services can be used by multiple controllers
3. **Testability**: Each layer can be tested independently
4. **Maintainability**: Easy to locate and modify code
5. **Scalability**: Simple to add new routes, controllers, and services
6. **Error Handling**: Centralized error management

## Future Enhancements

- Add input validation middleware
- Implement database integration (replace JSON file)
- Add authentication/authorization
- Implement caching
- Add rate limiting
- Add comprehensive logging
- Create comprehensive API documentation (Swagger/OpenAPI)
- Add unit and integration tests

## Running the Backend

```bash
# Start the server
npm start

# Check if server is running
curl http://localhost:5000/api/health
```

The server will be available at `http://localhost:5000`
