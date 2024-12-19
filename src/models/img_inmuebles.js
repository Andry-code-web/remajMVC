const db = require('../config/database');

class img_inmuebles{
    static async create(userData){
        const [result] = await db.execute(
            'INSERT INTO imagenes_inmuebles (inmuebles_id, url, descripcion, fecha_subida) VALUES (?, ?, ?, ?)',
            [imageData.inmueble_id, imageData.url, imageData.descripcion, new Date()]
        );
        return result.insertId;
    }
    static async findById(id){
        const [rows] = await db.execute(
            'SELECT * FROM imagenes_inmuebles WHERE id = ?',
            [id]
        );
        return rows[0];
    }
    static async findAllByInmuebleId(inmueble_id){
        const [rows] = await db.execute(
            'SELECT * FROM imagenes_inmuebles WHERE inmuebles_id = ?',
            [inmueble_id]
        );
        return rows;
    }
    static async update(imageData){
        await db.execute(
            'UPDATE imagenes_inmuebles SET url = ?, descripcion = ? WHERE id = ?',
            [imageData.url, imageData.descripcion, imageData.id]
        );
    }
    static async delete(id){
        await db.execute(
            'DELETE FROM imgenes_inmuebles WHERE id = ?',
            [id]
        );
    }
}

module.exports = img_inmuebles;