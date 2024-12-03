const db = require('../config/database');

class oferta {
    static async create(offerData) {
        const [result] = await db.execute(
            'INSERT INTO ofertas (titulo, descripcion, precio, fecha_inicio, fecha_fin) VALUES (?, ?, ?, ?, ?)',
            [offerData.titulo, offerData.descripcion, offerData.precio, offerData.fecha_inicio, offerData.fecha_fin]
        );
        return result.insertId;
    }

    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM ofertas WHERE id = ?',
            [id]
        );
        return rows[0];
    }

    static async findAll() {
        const [rows] = await db.execute('SELECT * FROM ofertas');
        return rows;
    }

    static async update(offerData) {
        await db.execute(
            'UPDATE ofertas SET titulo = ?, descripcion = ?, precio = ?, fecha_inicio = ?, fecha_fin = ? WHERE id = ?',
            [offerData.titulo, offerData.descripcion, offerData.precio, offerData.fecha_inicio, offerData.fecha_fin, offerData.id]
        );
    }

    static async delete(id) {
        await db.execute(
            'DELETE FROM ofertas WHERE id = ?',
            [id]
        );
    }
}
module.exports = oferta;