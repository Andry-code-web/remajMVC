const db = require('../config/database');

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
      r.estado,
      r.tamano_propiedad
    FROM remates r
    ORDER BY r.id DESC
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
  const query = `INSERT INTO remates
(ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera,
 balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado, tamano_propiedad, usuario_admin_id)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

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

const agregarAnexoUrl = async (anexoUrl, remateId) => {
  const query = `
    INSERT INTO anexos (papeles_inmuebles, remates_id)
    VALUES (?, ?)
  `;
  await db.query(query, [anexoUrl, remateId]);
};

// Función para eliminar un remate
const deleteRemate = async (remateId) => {
  const queryMensajes = 'DELETE FROM mensajes WHERE remates_id = ?';
  const queryAnexos = 'DELETE FROM anexos WHERE remates_id = ?';
  const queryImagenes = 'DELETE FROM img_inmuebles WHERE remates_id = ?';
  /* const queryDetalles = 'DELETE FROM detalles WHERE remate_id = ?'; */
  /* const queryInmuebles = 'DELETE FROM inmuebles WHERE remate_id = ?'; */
  const queryCronograma = 'DELETE FROM cronograma WHERE remates_id = ?';
  const queryRemate = 'DELETE FROM remates WHERE id = ?';

  try {
    await db.query(queryMensajes, [remateId]);
    await db.query(queryAnexos, [remateId]);
    await db.query(queryImagenes, [remateId]);
    /* await db.query(queryDetalles, [remateId]);
    await db.query(queryInmuebles, [remateId]); */
    await db.query(queryCronograma, [remateId]);
    const [result] = await db.query(queryRemate, [remateId]);
    return result.affectedRows > 0;
  } catch (error) {
    throw new Error('Error al eliminar el remate: ' + error.message);
  }
};

// Función para obtener un usuario administrador por correo y contraseña
const getUsuarioAdmin = async (correo, contrasena) => {
  const query = 'SELECT * FROM usuario_admin WHERE correo = ? AND contrasena = ?';
  try {
    const [result] = await db.query(query, [correo, contrasena]);
    return result[0];
  } catch (error) {
    throw new Error('Error al obtener el usuario administrador: ' + error.message);
  }
};

// Función para obtener los datos de un remate por ID
const getRemateById = async (remateId) => {
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
      r.fecha_remate,
      r.hora_remate,
      r.estado,
      r.tamano_propiedad
    FROM remates r
    WHERE r.id = ?
  `;
  try {
    const [result] = await db.query(query, [remateId]);
    return result[0];
  } catch (error) {
    throw new Error('Error al obtener los datos del remate: ' + error.message);
  }
};

// Función para actualizar un remate
const updateRemate = async (remateId, datosRemate) => {
  const query = `
    UPDATE remates
    SET ubicacion = ?, precios = ?, descripcion = ?, categoria = ?, N_banos = ?, N_habitacion = ?,
        pisina = ?, patio = ?, cocina = ?, cochera = ?, balcon = ?, jardin = ?, pisos = ?, comedor = ?,
        sala_start = ?, studio = ?, lavanderia = ?, fecha_remate = ?, hora_remate = ?, estado = ?, tamano_propiedad = ?
    WHERE id = ?
  `;
  const [result] = await db.query(query, [...datosRemate, remateId]);
  return result.affectedRows > 0;
};



// Función para crear una entrada en la tabla cronograma
const createCronograma = async (remate_id, nombre, fecha_inicio, fecha_fin) => {
  const query = `
    INSERT INTO cronograma (remates_id, nombre, fecha_inicio, fecha_fin)
    VALUES (?, ?, ?, ?)
  `;
  try {
    await db.query(query, [remate_id, nombre, fecha_inicio, fecha_fin]);
  } catch (error) {
    throw new Error('Error al guardar el cronograma: ' + error.message);
  }
};


module.exports = {
  getAllRemates,
  getImagenesInmuebles,
  createRemate,
  agregarImagenes,
  agregarAnexoUrl,
  deleteRemate,
  getUsuarioAdmin,
  getRemateById,
  updateRemate,
  createCronograma
};
