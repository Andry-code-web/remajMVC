const db = require('../config/database');

class EnVivo {
    static async getAll(usuario_id) {
        const query = `
            SELECT 
                r.*, 
                l.usuarios_id AS liked_by_user
            FROM 
                remates r
            INNER JOIN 
                likes l ON r.id = l.remates_id
            WHERE 
                l.usuarios_id = ?
        `;
        const [rows] = await db.execute(query, [usuario_id]);
        return rows;
    }


    static async getImagenesInmuebles() {
        const query = `
            SELECT 
                id,
                remates_id,
                TO_BASE64(imagenes_inmueble) as imagenes_inmueble
            FROM 
                img_inmuebles
            WHERE 
                imagenes_inmueble IS NOT NULL
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    static async getAnexosAll() {
        const query = `
            SELECT 
                id,
                remates_id,
                papeles_inmuebles
            FROM 
                anexos
            WHERE 
                papeles_inmuebles IS NOT NULL
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    // Los demás métodos se mantienen igual...
    static async getSeguimiento(remates_id) {
        const query = `SELECT * FROM remajud.seguimiento WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    static async getDetalles(remates_id) {
        const query = "SELECT * FROM remajud.detalles WHERE remates_id = ?";
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    static async getInmuebles(remates_id) {
        const query = `
            SELECT 
                i.*, 
                TO_BASE64(img.imagenes_inmueble) AS img_inmueble
            FROM 
                remajud.inmuebles AS i
            LEFT JOIN 
                img_inmuebles AS img
            ON 
                i.img_inmuebles_id = img.id
            WHERE 
                i.remates_id = ?
        `;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    static async getImagenInmuebleById(img_inmuebles_id) {
        const query = `
            SELECT 
                id, 
                TO_BASE64(imagenes_inmueble) AS imagenes_inmueble 
            FROM 
                img_inmuebles
            WHERE 
                id = ?
        `;
        const [rows] = await db.execute(query, [img_inmuebles_id]);
        return rows.length ? rows[0] : null;
    }

    static async getCronograma(remateId) {
        const query = `SELECT * FROM remajud.cronograma WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remateId]);
        return rows;
    }
}

module.exports = EnVivo;