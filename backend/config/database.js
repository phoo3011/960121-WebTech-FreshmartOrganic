const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const config = require('./config');

const databasePath = path.join(__dirname, '../../store.db');

const db = new sqlite3.Database(databasePath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (error) => {
  if (error) {
    console.error('Failed to open SQLite database:', error.message);
    return;
  }

  console.log(`Connected to SQLite database at ${databasePath}`);
});

const run = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function onRun(error) {
    if (error) {
      reject(error);
      return;
    }

    resolve({ lastID: this.lastID, changes: this.changes });
  });
});

const get = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (error, row) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(row);
  });
});

const all = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (error, rows) => {
    if (error) {
      reject(error);
      return;
    }

    resolve(rows);
  });
});

const ensureSchema = async () => {
  await run(
    `
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total_price REAL NOT NULL,
        created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `
  );

  await run(
    `
      CREATE TABLE IF NOT EXISTS products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        image TEXT NOT NULL,
        status TEXT,
        discount TEXT
      )
    `
  );

  await run(
    `
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        first_name TEXT NOT NULL,
        username TEXT NOT NULL UNIQUE,
        password_hash TEXT NOT NULL,
        registration_date TEXT NOT NULL
      )
    `
  );
};

const seedProducts = async () => {
  const row = await get('SELECT COUNT(*) AS count FROM products');

  if (row && row.count > 0) {
    return;
  }

  const fileContents = await fs.promises.readFile(config.PRODUCTS_FILE, 'utf-8');
  const products = JSON.parse(fileContents);

  for (const product of products) {
    await run(
      'INSERT INTO products (id, name, category, price, image, status, discount) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [product.id, product.name, product.category, product.price, product.image, product.status || null, product.discount || null]
    );
  }
};

const seedUsers = async () => {
  const row = await get('SELECT COUNT(*) AS count FROM users');

  if (row && row.count > 0) {
    return;
  }

  const fileContents = await fs.promises.readFile(config.AUTH_USERS_FILE, 'utf-8');
  const users = JSON.parse(fileContents);

  for (const user of users) {
    await run(
      'INSERT INTO users (first_name, username, password_hash, registration_date) VALUES (?, ?, ?, ?)',
      [user.firstName, user.username, user.passwordHash, user.registrationDate || new Date().toISOString()]
    );
  }
};

const dbReady = (async () => {
  try {
    await ensureSchema();
    await seedProducts();
    await seedUsers();
  } catch (error) {
    console.error('Failed to initialize SQLite database:', error.message);
    throw error;
  }
})();

module.exports = {
  db,
  all,
  dbReady,
  get,
  run,
};