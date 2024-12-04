const db = require('../config/database')

class visitas {
    static async create(userData) {
        const [result] = await db.execute(
            'INSERT INTO visitas (usuario_id, lugar, fecha, comentarios) VALUES (?, ?, ?, ?)',
            [visitData.usuario_id, visitData.lugar, visitData.fecha, visitData.comentarios]
        );
        return result.insertId;
    }
    static async findById(id) {
        const [rows] = await db.execute(
            'SLECT * FROM visitas WHERE id = ?',
            [id]
        );
        return rows[0];
    }
    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM visitas');
        return rows;
    }
    static async update(visitData) {
        await db.execute(
            'UPDATE visitas SET lugar = ?, fecha = ?, comentarios = ? WHERE id = ?',
            [visitData.lugar, visitData.fecha, visitData.comentarios, visitData.id]
        );
    }
    static async delete(id) {
        await db.execute(
            'DELETE FROM visitas WHERE id = ?'
            [id]
        );
    }
}

module.exports = visitas;

