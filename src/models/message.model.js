const db = require('../config/database');

class Message {
  static async create(messageData) {
    const [result] = await db.execute(
      'INSERT INTO mensajes (usuarios_id, remates_id, ofertas_subasta, monto) VALUES (?, ?, ?, ?)',
      [
        messageData.userId,
        messageData.auctionId,
        messageData.message,
        messageData.amount || null
      ]
    );
    return result.insertId;
  }

  static async getLastMessages(auctionId, limit = 50) {
    const [rows] = await db.execute(
      `SELECT m.*, u.nombres_apellidos 
       FROM mensajes m 
       JOIN usuarios u ON m.usuarios_id = u.id 
       WHERE m.remates_id = ? 
       ORDER BY m.id DESC 
       LIMIT ?`,
      [auctionId, limit]
    );
    return rows.reverse();
  }
}

module.exports = Message;