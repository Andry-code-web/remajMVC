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
}

module.exports = Home;
