const db = require('../config/database');

class Anexo{
    static async create(anexoData){
        const [result] = await db.execute(
            'INSERT INTO anexos (entidad_id, tipo_entidad url, descripcion, fecha_subida) VALUES (?, ?, ?, ?)',
            [anexoData.entidad_id, anexoData.tipo_entidad, anexoData.url, anexoData.descripcion, new Date()]
        );
        return result.insertId;
    }
    static async findById(id){
        const [rows] = await db.execute(
            'SELECT * FROM  anexos WHERE id = ?',
            [id]
        );
        return rows[0];
    }
    static async findAllByEntity(entidad_id, tipo_entidad){
        const [rows] = await db.execute(
            'SELECT * FROM anexos WHERE entidad_id = ? AND tipo_entidad = ?',
            [entidad_id, tipo_entidad]
        );
        return rows;
    }
    static async update(anexoData){
        await db.execute(
            'UPDATE anexos SET url = ?, decripcion = ? WHERE id = ?',
            [anexoData.url, anexoData.descripcion, anexoData.id]
        );
    }
    static async delete(id){
        await db.execute(
            'DELETE FROM anexos Where id = ?',
            [id]
        );
    }
}

module.exports = Anexo;
