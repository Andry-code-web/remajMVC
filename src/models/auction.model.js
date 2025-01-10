// models/auction.model.js
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
      `
      SELECT r.*, ii.imagenes_inmueble
      FROM remates r
      LEFT JOIN img_inmuebles ii ON r.id = ii.remates_id
      WHERE r.id = ?
      `,
      [id]
    );
  
    if (rows.length === 0) return null;
  
    const remate = {
      ...rows[0],
      imagenes: rows
        .filter(row => row.imagenes_inmueble) // Excluir nulos
        .map(row => {
          const base64Image = row.imagenes_inmueble.toString('base64');
          return base64Image;
        })
    };
  
    return remate;
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

  static async getTopBids(auctionId) {
    const [rows] = await db.execute(
      `SELECT MAX(m.monto) AS monto, u.id AS usuarios_id, u.usuario
       FROM mensajes m
       JOIN usuarios u ON m.usuarios_id = u.id
       WHERE m.remates_id = ?
       GROUP BY u.id
       ORDER BY monto DESC
       LIMIT 10`,
      [auctionId]
    );
    return rows;
  }
}

module.exports = Auction;
