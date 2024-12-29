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


    static async getSeguimiento(remates_id) {
        const query = `
        SELECT 
            r.id,
            r.descripcion,
            r.estado,
            c.actividad,
            c.fecha_actividad
        FROM remates r
        LEFT JOIN cronograma c ON r.id = c.remates_id
        WHERE r.id = ?`;
        
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }


    
    static async getDetalles(remates_id) {
        const query = " SELECT * FROM remajud.detalles WHERE remates_id = '?'";
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    
    static async getInmuebles(remates_id) {
        const query = " SELECT * FROM remajud.inmuebles WHERE remates_id = '?'";
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }


    static async getCronograma(remates_id) {
        const query = " SELECT * FROM remajud.cronograma WHERE remates_id = '?'";
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }



    static async getPdf(remates_id) {
        const query = `
        SELECT aviso_pdf FROM remates WHERE id = ?`; // Asegúrate que el nombre de la columna sea correcto
        const [rows] = await db.execute(query, [remates_id]);
        return rows[0];
    }
}
module.exports = EnVivo;