// live.model.js
const db = require('../config/database');

class Live {
    // Obtener todas las subastas
    static async getAll() {
        const query = "SELECT * FROM remajud.remates WHERE estado = 'en_curso'";
        return await db.execute(query).then(([rows]) => rows);
    }

    // Obtener imágenes de inmuebles
    static async getImagenesInmuebles() {
        const query = `
        SELECT
            id, 
            imagenes_inmueble, 
            remates_id
        FROM img_inmuebles`;
        const [rows] = await db.query(query);
        return rows.map(img => ({
            ...img,
            imagenes_inmueble: img.imagenes_inmueble?.toString('base64') || null
        }));
    }

    // Obtener inmuebles de un remate específico
    static async getInmuebles(remates_id) {
        const query = `
        SELECT
            partida_registral,
            tipo_inmueble,
            direccion,
            carga_ogravamen,
            porcentaje_rematar
        FROM inmuebles
        WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    // Obtener cronograma de un remate específico
    static async getCronograma(remates_id) {
        const query = `
        SELECT
            actividad,
            fecha_actividad
        FROM cronograma
        WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    // Obtener detalles de una subasta por ID
    static async getById(id) {
        const query = "SELECT * FROM remajud.remates WHERE id = ?";
        const [rows] = await db.execute(query, [id]);
        if (!rows.length) {
            throw new Error(`No se encontró la subasta con ID ${id}`);
        }
        return rows[0];
    }
}

module.exports = Live;
