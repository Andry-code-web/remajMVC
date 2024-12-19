const db = require('../config/database');

class Message {
    static async sendMessage(messageData) {
        const [result] = await db.execute(
            'INSERT INTO mensaje (emisor_id, receptor_id, contenido, fecha_envio) VALUES (?, ?, ?, ?)',
            [messageData.emisor_id, messageData.receptor_id, messageData.contenido, new Date()]
        );
        return result.insertId;
    }
    static async getMessagesBetweenUsers(userId1, userId2) {
        const [rows] = await db.execute(
            'SELECT * FROM mensaje WHERE (emisor_id = ? AND receptor_id = ?) OR (emisor_id = ? AND receptor_id = ?) ORDER BY fecha_envio',
            [userId1, userId2, userId2, userId1]
        );
        return rows;

    }
}

module.exports = Message;
