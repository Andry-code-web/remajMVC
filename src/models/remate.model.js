const db = require('../config/database');
const { getImagenesInmuebles } = require('../models/admin.model');

// Validación de conexión
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('Conexión a la base de datos exitosa');
        connection.release(); // Libera la conexión de vuelta al pool
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
    }
})();

// Función para obtener todos los remates
const getAllRemates = async () => {
    const img_inmuebles = await getImagenesInmuebles();
    const query = `
        SELECT
            id, ubicacion, precios, descripcion, categoria, N_banos, N_habitacion,
            pisina, patio, cocina, cochera, balcon, jardin, pisos, comedor, sala_start,
            studio, lavanderia, fecha_remate, hora_remate, estado, tamaño_propiedad
        FROM remates
        ORDER BY id DESC
    `;
    try {
        const [remates] = await db.query(query);
        return remates;
    } catch (error) {
        throw new Error('Error al obtener los remates: ' + error.message);
    }
};

// Función para obtener un remate por ID
const getRemateById = async (remateId) => {
    const query = `
        SELECT
            id, ubicacion, precios, descripcion, categoria, N_banos, N_habitacion,
            pisina, patio, cocina, cochera, balcon, jardin, pisos, comedor, sala_start,
            studio, lavanderia, fecha_remate, hora_remate, estado
        FROM remates
        WHERE id = ?
    `;
    try {
        const [result] = await db.query(query, [remateId]);
        return result[0];
    } catch (error) {
        throw new Error('Error al obtener el remate: ' + error.message);
    }
};

module.exports = {
    getAllRemates,
    getRemateById,
};