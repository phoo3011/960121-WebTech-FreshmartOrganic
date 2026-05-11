# FreshMart Organic

FreshMart Organic is a full-stack e-commerce project built with Express, SQLite, and a static HTML/CSS/JavaScript frontend. The backend is organized around a clear separation of concerns so the application is easier to maintain, test, and extend.

## Architecture Summary

The application uses a layered backend architecture:

Frontend pages → Express routes → Controllers → Services → Repositories → SQLite

### What each layer does

- Frontend pages handle the user interface, cart, checkout, login, and product browsing.
- Routes expose API endpoints and map HTTP requests to controllers.
- Controllers handle request and response flow.
- Services contain business logic and validation-friendly application rules.
- Repositories isolate database access and SQL queries.
- SQLite stores products, users, and orders in a local database file.

This structure keeps HTTP concerns, business rules, and persistence logic separate, which is useful for testing and future scaling.

## Project Structure

```text
960121-WebTech-FreshmartOrganic/
├── backend/
│   ├── server.js
│   ├── config/
│   │   ├── config.js
│   │   └── database.js
│   ├── controllers/
│   ├── middleware/
│   ├── repositories/
│   ├── routes/
│   └── services/
├── css/
├── data/
├── img/
├── js/
├── libs/
├── .env.example
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env` and fill in the values you want to keep local.

```bash
PORT=5000
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
JWT_SECRET=replace_with_a_long_random_secret
DB_PATH=./store.db
```

### Why this matters

- `.env` stays on your machine and is ignored by Git.
- `.env.example` documents the required configuration without exposing secrets.
- `JWT_SECRET` should always be long, random, and never committed.

## Local Setup

1. Install dependencies with `npm install`.
2. Create your local `.env` file from `.env.example`.
3. Start the app with `npm start`.

## Backend Design

The backend follows a controller-service-repository pattern:

- Routes define endpoints such as `/api/products`, `/api/checkout`, and `/api/auth`.
- Controllers coordinate request handling.
- Services implement business logic.
- Repositories talk directly to SQLite.

This makes the codebase easier to reason about than putting SQL and request handling in the same file.

## Data Layer

SQLite is used for local persistence. The database is initialized from the backend configuration and seeded from the JSON data files when needed. This keeps the project easy to run locally while still using a real relational database.

## Example API Areas

- Products: browse and search catalog items.
- Authentication: register and log in users.
- Checkout: create and store orders.
- Health check: confirm the backend is running.

## Why This Project Is Good for Employers

- Clear separation of concerns.
- Environment-based configuration.
- Real database integration with SQLite.
- Modular backend structure that is easy to extend.
- Static frontend and API backend working together as a full-stack application.

## Future Improvements

- Add automated tests for controllers, services, and repositories.
- Replace file-based seeding with migration scripts.
- Add input validation and stronger authentication flows.
- Add API documentation with OpenAPI or Swagger.
- Add deployment instructions for production hosting.

## Notes

- Keep `.env` out of version control.
- Commit only `.env.example` and other non-sensitive configuration templates.
- If you change the database location, update `DB_PATH` in `.env`.