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

}

module.exports = FiltroHome;
 */