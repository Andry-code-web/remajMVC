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

    static async getFiltrarBanner({ categoria, ciudad, departamento, montoMin, montoMax }) {
        try {
            let query = 'SELECT * FROM remates WHERE 1=1';
            const params = [];

            if (categoria) {
                query += ' AND categoria = ?';
                params.push(categoria);
            }

            if (ciudad) {
                query += ' AND ciudad = ?';
                params.push(ciudad);
            }

            if (departamento) {
                query += ' AND departamento = ?';
                params.push(departamento);
            }

            if (montoMin || montoMax) {
                if (montoMin) {
                    query += ' AND precio >= ?';
                    params.push(montoMin);
                }
                if (montoMax) {  // Asegúrate de usar montoMax, no precionmax
                    query += ' AND precio <= ?';
                    params.push(montoMax);
                }
            }

            const [rows] = await db.execute(query, params);
            return rows;
        } catch (error) {
            console.error('Error al filtrar los remates:', error);
            throw error;
        }
    }
}

module.exports = Home;
