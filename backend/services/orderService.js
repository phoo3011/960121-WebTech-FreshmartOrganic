const { db, dbReady } = require('../config/database');

const INSERT_ORDER_SQL = 'INSERT INTO orders (user_id, product_id, quantity, total_price) VALUES (?, ?, ?, ?)';

class OrderService {
  static createOrder({ userId, productId, quantity, totalPrice }) {
    return new Promise((resolve, reject) => {
      dbReady
        .then(() => {
          db.run(INSERT_ORDER_SQL, [userId, productId, quantity, totalPrice], function onInsert(error) {
            if (error) {
              reject(error);
              return;
            }

            resolve({
              id: this.lastID,
              userId,
              productId,
              quantity,
              totalPrice,
            });
          });
        })
        .catch(reject);
    });
  }
}

OrderService.INSERT_ORDER_SQL = INSERT_ORDER_SQL;

module.exports = OrderService;