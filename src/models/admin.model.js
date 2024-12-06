require('dotenv').config();

const db = require('../config/database');

// Validación de conexión
(async () => {
    try {
        const connection = await db.getConnection();
        console.log('Conexión a la base de datos exitosa');
        connection.release(); // Libera la conexión de vuelta al db
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error.message);
    }
})();

// Función para obtener todos los remates
const getAllRemates = async () => {
    const query = `
    SELECT
      r.id AS id,
      r.ubicacion,
      r.precios,
      r.descripcion,
      r.categoria,
      r.N_banos,
      r.N_habitacion,
      r.pisina,
      r.patio,
      r.cocina,
      r.cochera,
      r.balcon,
      r.jardin,
      r.pisos,
      r.comedor,
      r.sala_start,
      r.studio,
      r.lavanderia,
      r.fecha_activacion,
      r.fecha_remate,
      r.hora_remate,
      r.usuario_admin_id,
      r.ganador,
      r.like_count,
      r.monto_venta,
      r.estado
    FROM remates r
  `;
    try {
        const [remates] = await db.query(query);
        return remates;
    } catch (error) {
        throw new Error('Error al obtener los remates: ' + error.message);
    }
};

// Función para obtener imágenes de inmuebles
const getImagenesInmuebles = async () => {
    const query = `
    SELECT
      i.id AS id,
      i.imagenes_inmueble,
      i.remates_id
    FROM img_inmuebles i
    `;
    try {
        const [img_inmuebles] = await db.query(query);

        // Convierte el BLOB a Base64 solo si no es nulo
        img_inmuebles.forEach(img => {
            if (img.imagenes_inmueble) {
                img.imagenes_inmueble = img.imagenes_inmueble.toString('base64');
            }
        });
        return img_inmuebles;
    } catch (error) {
        throw new Error('Error al obtener las imágenes de inmuebles: ' + error.message);
    }
};

// Crear un nuevo remate
const createRemate = async (datosRemate) => {
    const query = `
        INSERT INTO remates 
        (ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera, 
         balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado, usuario_admin_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [result] = await db.query(query, datosRemate);
    return result.insertId;
};

const agregarImagenes = async (imagenes) => {
    const query = `
        INSERT INTO img_inmuebles (imagenes_inmueble, remates_id)
        VALUES ?
    `;
    await db.query(query, [imagenes]);
};

const agregarAnexos = async (anexos) => {
    const query = `
        INSERT INTO anexos (papeles_inmuebles, remates_id)
        VALUES ?
    `;
    await db.query(query, [anexos]);
};

// Función para actualizar un remate
const updateRemate = async (remateId, remateData) => {
    const {
        ubicacion, precios, descripcion, categoria,
        N_banos, N_habitacion, pisina, patio,
        cocina, cochera, balcon, jardin, pisos,
        comedor, sala_start, studio, lavanderia,
        fecha_remate, hora_remate, estado
    } = remateData;

    const booleanFields = ['pisina', 'patio', 'cocina', 'cochera', 'balcon', 'jardin', 'comedor', 'sala_start', 'studio', 'lavanderia'];
    const processedFields = booleanFields.reduce((acc, field) => {
        acc[field] = remateData[field] === 'si' ? 'si' : 'no';
        return acc;
    }, {});

    const query = `
    UPDATE remates SET
      ubicacion = ?, precios = ?, descripcion = ?, categoria = ?,
      N_banos = ?, N_habitacion = ?, pisina = ?, patio = ?,
      cocina = ?, cochera = ?, balcon = ?, jardin = ?, pisos = ?,
      comedor = ?, sala_start = ?, studio = ?, lavanderia = ?,
      fecha_remate = ?, hora_remate = ?, estado = ?
    WHERE id = ?
  `;

    const values = [
        ubicacion, precios, descripcion, categoria,
        N_banos, N_habitacion,
        processedFields.pisina, processedFields.patio,
        processedFields.cocina, processedFields.cochera,
        processedFields.balcon, processedFields.jardin,
        pisos,
        processedFields.comedor, processedFields.sala_start,
        processedFields.studio, processedFields.lavanderia,
        fecha_remate, hora_remate, estado,
        remateId
    ];

    try {
        const [result] = await db.query(query, values);
        if (result.affectedRows > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        throw new Error('Error al actualizar el remate: ' + error.message);
    }
};

// Función para eliminar un remate
const deleteRemate = async (remateId) => {
    const query = 'DELETE FROM remates WHERE id = ?';
    try {
        const [result] = await db.query(query, [remateId]);
        if (result.affectedRows > 0) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        throw new Error('Error al eliminar el remate: ' + error.message);
    }
};

// Función para obtener un remate por ID
const getRemateById = async (remateId) => {
    const query = 'SELECT * FROM remates WHERE id = ?';
    try {
        const [remates] = await db.query(query, [remateId]);
        if (remates.length > 0) {
            return remates[0];
        } else {
            return null;
        }
    } catch (error) {
        throw new Error('Error al obtener el remate: ' + error.message);
    }
};

module.exports = {
    getAllRemates,
    getImagenesInmuebles,
    createRemate,
    agregarImagenes,
    agregarAnexos,
    updateRemate,
    deleteRemate,
    getRemateById,
};



