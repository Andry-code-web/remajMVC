const db = require('../config/database');

class Like {
    static async create(likeData) {
        const [result] = await db.execute(
            'INSERT INTO like (usuario_id, entidad_id, tipo_entidad) VALUES (?, ?, ?)',
            [likeData.usuario_id, likeData.entidad_id, likeData.tipo_entidad]
        );
        return result.insertId;
    }
    static async findByUserAndEntity(usuario_id, entidad_id, tipo_entidad) {
        const [rows] = await db.execute(
            'SELECT * FROM likes WHERE usuario_id = ? AND entidad_id = ? AND tipo_entidad = ?',
            [usuario_id, entidad_id, tipo_entidad]
        );
        return rows[0];
    }
    static async findAllByEntity(entidad_id, tipo_entidad) {
        const [rows] = await db.execute(
            'SELECT *FROM likes WHERE entidad_id = ? AND tipo_entidad = ?',
            [entidad_id, tipo_entidad]
        );
        return rows;
    }
    static async delete(likeData) {
        await db.execute(
            'DELETE FROM likes WHERe usuario_id = ? ANd entidad_id = ? AND tipo_entidad = ?',
            [usuario_id, entidad_id, tipo_entidad]
        );
    }
}

module.exports = Like;
