const db = require('../config/database');

class EnVivo {
    static async getAll() {
        const query = "SELECT * FROM remajud.remates WHERE estado = 'en_curso'";
        return await db.execute(query).then(([rows]) => rows);
    }

    static async getImagenesInmuebles() {
        const [rows] = await db.execute(`
            SELECT id, TO_BASE64(imagenes_inmueble) AS imagenes_inmueble, remates_id 
            FROM img_inmuebles
        `);
        return rows;
    }






    static async getSeguimiento(remates_id) {
        const query = `
       SELECT 
    d.expediente AS n_expediente,
    d.distrito_judicial,
    d.instancia,
    d.especialidad,
    d.convocatoria,
    d.organo_juridiccional AS organo_juridiccional,
    c.actividad AS fase_convocatoria,
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
    d.remates_id = ?;`

        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }



    static async getDetalles(remates_id) {
        const query = " SELECT * FROM remajud.detalles WHERE remates_id = ?";
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }


    static async getInmuebles(remates_id) {
        const query = " SELECT * FROM remajud.inmuebles WHERE remates_id = ?";
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }


    static async getCronograma(remates_id) {
        const query = " SELECT * FROM remajud.cronograma WHERE remates_id = ?";
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