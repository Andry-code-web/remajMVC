const db = require('../config/database');

class EnVivo {
    static async getAll() {
        const query = "SELECT * FROM remajud.remates WHERE estado = 'en_curso'";
        return await db.execute(query).then(([rows]) => rows);
    }

    static async getImagenesInmuebles() {
        const query = `
        SELECT id, imagenes_inmueble, remates_id FROM img_inmuebles`;
        const [rows] = await db.query(query);
        return rows.map(img => ({
            ...img,
            imagenes_inmueble: img.imagenes_inmueble?.toString('base64') || null
        }));
    }

    static async getInmuebles(remates_id) {
        const query = `
        SELECT * FROM inmuebles WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    static async getCronograma(remates_id) {
        const query = `
        SELECT * FROM cronograma WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    static async getDetalles(remates_id) {
        const query = `
        SELECT * FROM detalles WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    static async getSeguimiento(remates_id) {
        const query = `
        SELECT * FROM seguimientos WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    static async getTrackingDetails(remates_id) {
        const query = `
        SELECT 
            d.expediente AS n_expediente,
            d.distrito_judicial,
            d.instancia,
            d.especialista,
            c.actividad AS n_convocatoria,
            c.fecha_actividad AS fecha_registro,
            r.descripcion AS procesado_por,
            r.estado AS estado_convocatoria,
            CASE 
                WHEN c.actividad = 'Reanudación' THEN 'Sí'
                ELSE 'No'
            END AS reanudado
        FROM 
            detalles d
        JOIN 
            remates r ON d.remates_id = r.id
        LEFT JOIN 
            cronograma c ON r.id = c.remates_id
        WHERE 
            d.remates_id = ?`;

        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }
}

module.exports = EnVivo;