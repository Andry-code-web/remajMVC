const db = require('../config/database');

class Home {
    static async getAll() {
        const [rows] = await db.execute(`
            SELECT
                r.*,
                i.id AS imagen_id,
                i.imagenes_inmueble
            FROM
                remates r
            LEFT JOIN
                img_inmuebles i ON r.id = i.remates_id
        `);
        return rows;
    }

    static async getRemateDetails(id) {
        const [remateRows] = await db.execute(`
            SELECT * FROM remates WHERE id = ?`, [id]);
        const [inmueblesRows] = await db.execute(`
            SELECT * FROM inmuebles WHERE remates_id = ?`, [id]);
        const [cronogramaRows] = await db.execute(`
            SELECT * FROM cronograma WHERE remates_id = ?`, [id]);
        const [seguimientoRows] = await db.execute(`
            SELECT * FROM seguimiento WHERE remates_id = ?`, [id]);

        return {
            remate: remateRows[0],
            inmuebles: inmueblesRows,
            cronograma: cronogramaRows,
            seguimiento: seguimientoRows[0] // Asumimos que solo hay un registro de seguimiento por remate
        };
    }
}

module.exports = Home;
 