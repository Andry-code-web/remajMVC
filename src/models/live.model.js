// live.model.js
const db = require('../config/database');

class Live {
    static async getAll() {
        const query = "SELECT * FROM remajud.remates WHERE estado = 'en_curso'";
        return await db.execute(query).then(([rows]) => rows);
    }

    // Obtener imágenes de inmuebles
    static async getImagenesInmuebles() {
        const query = `
        SELECT id, imagenes_inmueble, remates_id FROM img_inmuebles`;
        const [rows] = await db.query(query);
        return rows.map(img => ({
            ...img,
            imagenes_inmueble: img.imagenes_inmueble?.toString('base64') || null
        }));
    }

    // Obtener inmuebles de un remate específico
    static async getInmuebles(remates_id) {
        const query = `
        SELECT * FROM inmuebles WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    // Obtener cronograma de un remate específico
    static async getCronograma(remates_id) {
        const query = `
        SELECT * FROM cronograma WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    // Obtener detalles de un remate específico
    static async getDetalles(remates_id) {
        const query = `
        SELECT * FROM detalles WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }


    // Obtener seguimiento de un remate específico
    static async getSeguimiento(remates_id) {
        const query = `
    SELECT * FROM seguimientos WHERE remates_id = ?`; // Cambiar el nombre de la tabla
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }


}
module.exports = Live;
