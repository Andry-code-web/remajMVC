const db = require('../config/database');
const { getImagenesInmuebles } = require('../models/admin.model');

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

        // Convierte las imágenes a base64
        rows.forEach(row => {
            if (row.imagenes_inmueble) {
                row.imagenes_inmueble = row.imagenes_inmueble.toString('base64');
            }
        });

        return rows;
    }
    
    static async getFiltrarBanner({ categoria, ubicacion, departamento, montoMin, montoMax }) {
        const img_inmuebles = await getImagenesInmuebles();
        try {
            let query = 'SELECT * FROM remates WHERE 1=1';
            const params = [];

            if (categoria) {
                query += ' AND categoria = ?';
                params.push(categoria);
            }

            if (ubicacion) {
                query += ' AND ubicacion = ?';
                params.push(ubicacion);
            }

            if (departamento) {
                query += ' AND departamento = ?';
                params.push(departamento);
            }

            if (montoMin || montoMax) {
                if (montoMin) {
                    query += ' AND precios >= ?';
                    params.push(montoMin);
                }
                if (montoMax) {
                    query += ' AND precios <= ?';
                    params.push(montoMax);
                }
            }

            const [rows] = await db.execute(query, params);

            // Asocia las imágenes con los remates filtrados
            rows.forEach(remate => {
                const img = img_inmuebles.find(img => img.remates_id === remate.id);
                if (img) {
                    remate.imagen = img.imagenes_inmueble;
                }
            });

            return rows;
        } catch (error) {
            console.error('Error al filtrar los remates:', error);
            throw error;
        }
    }
}

module.exports = Home;
