const db = require('../config/database');

class Auction {
  static async getAll() {
    const [rows] = await db.execute(
      'SELECT * FROM remates ORDER BY like_count DESC'
    );
    return rows;
  }

  static async getById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM remates WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async updateStatus(id, estado) {
    await db.execute(
      'UPDATE remates SET estado = ? WHERE id = ?',
      [estado, id]
    );
  }

  static async updatePrice(id, amount) {
    await db.execute(
      'UPDATE remates SET monto_venta = ? WHERE id = ?',
      [amount, id]
    );
  }

  static async addLike(remateId, userId) {
    await db.execute(
      'INSERT INTO likes (usuarios_id, remates_id) VALUES (?, ?)',
      [userId, remateId]
    );
    await db.execute(
      'UPDATE remates SET like_count = like_count + 1 WHERE id = ?',
      [remateId]
    );
  }
}

module.exports = Auction;