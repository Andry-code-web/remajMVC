const db = require('../config/database'); // Conexión a la base de datos

async function obtenerFiltrados(params) {
    const { remates_id, expediente, precio_base, distrito_judicial } = params;

    // Consulta SQL con JOIN entre remates y detalles
    const sql = `
        SELECT *
        FROM remates
        JOIN detalles ON remates.id = detalles.remates_id
        WHERE
            remates.id = ?
            AND detalles.expediente LIKE ?
            AND detalles.precio_base = ?
            AND detalles.distrito_judicial LIKE ?
    `;

    try {
        const [results] = await db.execute(sql, [
            remates_id,
            `%${expediente}%`,
            precio_base,
            `%${distrito_judicial}%`
        ]);
        return results; // Devolver los resultados
    } catch (err) {
        console.error('Error al obtener remates filtrados:', err);
        throw new Error('Error al obtener remates filtrados');
    }
}

module.exports = { obtenerFiltrados };


/* const db = require('../config/database');

class FiltroHome {
    static async getFiltrarBanner({ categoria, ubicacion, montoMin, montoMax }) {
        try {
            let query = `
                SELECT
                    r.*,
                    i.id AS imagen_id,
                    i.imagenes_inmueble
                FROM
                    remates r
                LEFT JOIN
                    img_inmuebles i ON r.id = i.remates_id
                WHERE 1=1
            `;
            const params = [];

            if (categoria) {
                query += ' AND categoria = ?';
                params.push(categoria);
            }

            if (ubicacion) {
                query += ' AND ubicacion = ?'
                params.push(ubicacion);
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

            // Convierte las imágenes a base64
            rows.forEach(row => {
                if (row.imagenes_inmueble) {
                    row.imagenes_inmueble = row.imagenes_inmueble.toString('base64');
                }
            });

            return rows;
        } catch (error) {
            console.error('Error al filtrar los remates:', error);
            throw error;
        }
    }
}

module.exports = FiltroHome;
 */