const db = require('../config/database');

class Live {
    static async getAll() {
        const query = "SELECT * FROM remajud.remates WHERE estado = 'en_curso'";
        return await db.execute(query).then(([rows]) => rows);
    }

    static async getImagenesInmuebles() {
        const query = `
        SELECT
            id, 
            imagenes_inmueble, 
            remates_id
        FROM img_inmuebles`;
        const [rows] = await db.query(query);

        // Convertir imágenes
        return rows.map(img => ({
            ...img,
            imagenes_inmueble: img.imagenes_inmueble?.toString('base64') || null
        }));
    }

    static async getById(id) {
        const query = "SELECT * FROM remajud.remates WHERE id = ?";
        const [rows] = await db.execute(query, [id]);
        if (!rows.length) {
            throw new Error(`No se encontró la subasta con ID ${id}`);
        }
        return rows[0];
    }

    static async getInmueblesByAuctionId(auctionId) {
        const query = `
            SELECT partida_registral, tipo_inmueble, direccion, carga_y_gravamen, 
                   porcentaje_rematar, imagenes_inmueble 
            FROM img_inmuebles WHERE remates_id = ?`;
        const [rows] = await db.query(query, [auctionId]);
        return rows.map(row => ({
            ...row,
            imagenes_inmueble: row.imagenes_inmueble?.toString('base64') || null
        }));
    }

    static async getCronogramaByAuctionId(auctionId) {
        const query = `
            SELECT nombre_fase AS nombre, fecha_inicio, fecha_fin 
            FROM cronograma_remates 
            WHERE remates_id = ? ORDER BY fecha_inicio ASC`;
        return await db.query(query, [auctionId]).then(([rows]) => rows);
    }
}

module.exports = Live;
