const db = require('../config/database');

class Bid {
  static async create(bidData) {
    const [result] = await db.execute(
      'INSERT INTO ofertas (usuarios_id, remates_id, monto_oferta, fecha_subasta, hora_subasta) VALUES (?, ?, ?, ?, ?)',
      [
        bidData.userId,
        bidData.auctionId,
        bidData.amount,
        bidData.timestamp.split(' ')[0],
        bidData.timestamp.split(' ')[1]
      ]
    );
    return result.insertId;
  }

  static async getHighestBid(auctionId) {
    const [rows] = await db.execute(
      'SELECT * FROM ofertas WHERE remates_id = ? ORDER BY monto_oferta DESC LIMIT 1',
      [auctionId]
    );
    return rows[0];
  }

  static async getBidHistory(auctionId) {
    const [rows] = await db.execute(
      `SELECT o.*, u.nombres_apellidos 
       FROM ofertas o 
       JOIN usuarios u ON o.usuarios_id = u.id 
       WHERE o.remates_id = ? 
       ORDER BY o.monto_oferta DESC`,
      [auctionId]
    );
    return rows;
  }
}

module.exports = Bid;