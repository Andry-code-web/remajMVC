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
  const queryCronograma = 'DELETE FROM cronograma WHERE remates_id = ?';
  const querySeguimiento = 'DELETE FROM seguimiento WHERE remates_id = ?';
  const queryLikes = 'DELETE FROM likes WHERE remates_id = ?'; // Eliminar registros en likes
  const queryRemate = 'DELETE FROM remates WHERE id = ?';

  try {
    await db.query(queryMensajes, [remateId]);
    await db.query(queryAnexos, [remateId]);
    await db.query(queryImagenes, [remateId]);
    await db.query(queryCronograma, [remateId]);
    await db.query(querySeguimiento, [remateId]); // Eliminar registros en seguimiento
    await db.query(queryLikes, [remateId]); // Eliminar registros en likes
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
const createCronograma = async (remates_id, nombre, fecha_inicio, fecha_fin) => {
  const query = `
    INSERT INTO cronograma (remates_id, nombre, fecha_inicio, fecha_fin)
    VALUES (?, ?, ?, ?)
  `;
  try {
    await db.query(query, [remates_id, nombre, fecha_inicio, fecha_fin]);
  } catch (error) {
    throw new Error('Error al guardar el cronograma: ' + error.message);
  }
};

// Función para obtener el cronograma de la base de datos
const getCronograma = async (remates_id) => {
  const query = `
    SELECT nombre FROM cronograma WHERE remates_id = ? ORDER BY fecha_inicio ASC
  `;
  try {
    const [rows] = await db.query(query, [remates_id]);
    return rows.map(row => row.nombre);
  } catch (error) {
    throw new Error('Error al obtener el cronograma: ' + error.message);
  }
};


/* CLIENTES */

const getClientes = async () => {
  const query = `SELECT * FROM usuarios`;

  const [clientes] = await db.query(query);
  return clientes;

}



const getResumenClientes = async () => {
  const query = `
      SELECT 
        COUNT(*) AS totalClientes,
        SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) AS clientesActivos,
        SUM(CASE WHEN MONTH(fecha_activacion) = MONTH(NOW()) AND YEAR(fecha_activacion) = YEAR(NOW()) THEN 1 ELSE 0 END) AS clientesNuevos
      FROM remates;
    `;
  const [rows] = await db.query(query);
  return rows[0];
}

const getCatalogoClientes = async () => {
  const query = `
      SELECT 
        r.id,
        r.ubicacion,
        r.precios,
        r.fecha_remate,
        r.descripcion,
        r.categoria,
        i.img_inmuebles_id,
        d.tasacion,
        d.precio_base,
        d.incremento_ofertas,
        d.n_inscritos
      FROM remates r
      LEFT JOIN inmuebles i ON r.id = i.remates_id
      LEFT JOIN detalles d ON r.id = d.remates_id
      WHERE r.estado = 'activo';
    `;
  const [rows] = await db.query(query);
  return rows;
}

/* seguimiento */

const createSeguimiento = async (datosSeguimiento) => {
  const query = `
    INSERT INTO seguimiento (expediente, distrito_judicial, instancia especialidad, nro_convocatoria, fecha_registro, procesado_por, reanudado, fase_convocatoria, estado_convocatoria, remates_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const [result] = await db.query(query, datosSeguimiento);
  return result.insertId;
};


// Función para insertar un nuevo inmueble
const insertInmueble = async (datosInmueble) => {
  const [partida_registral, tipo_inmueble, direccion, carga_ogravamen, porcentaje_rematar, remate_id] = datosInmueble;

  const query = `
    INSERT INTO inmuebles (partida_registral, tipo_inmueble, direccion, carga_ogravamen, porcentaje_rematar, remates_id)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await db.query(query, [partida_registral, tipo_inmueble, direccion, carga_ogravamen, porcentaje_rematar, remate_id]);
    console.log('Inmueble insertado con ID:', result.insertId);
    return result.insertId;
  } catch (error) {
    throw new Error('Error al insertar el inmueble: ' + error.message);
  }
};





// Función para insertar nuevos detalles de remate
const insertDetalles = async (datosDetalles) => {
  const [
    expediente, distrito_judicial, instancia, juez, especialista,
    materia, resolucion, fecha_resolucion, nro_convocatoria, tipo_cambio, tasacion, precio_base,
    incremento_ofertas, arancel, oblaje, descripcion_de_detalles, archivo, remate_id
  ] = datosDetalles;

  const query = `
    INSERT INTO detalles (expediente, distrito_judicial, instancia, juez,
      especialista, materia, resolucion, fecha_resolucion, nro_convocatoria, tipo_cambio, tasacion,
      precio_base, incremento_ofertas, arancel, oblaje, descripcion_de_detalles, archivo, remates_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await db.query(query, [
      expediente, distrito_judicial, instancia, juez, especialista,
      materia, resolucion, fecha_resolucion, nro_convocatoria, tipo_cambio, tasacion, precio_base,
      incremento_ofertas, arancel, oblaje, descripcion_de_detalles, archivo, remate_id
    ]);
    return result.insertId;
  } catch (error) {
    throw new Error('Error al insertar los detalles: ' + error.message);
  }
};
module.exports = {
  getCronograma,
  getAllRemates,
  getImagenesInmuebles,
  createRemate,
  agregarImagenes,
  agregarAnexoUrl,
  deleteRemate,
  getUsuarioAdmin,
  getRemateById,
  updateRemate,
  createCronograma,
  getClientes,
  getResumenClientes,
  getCatalogoClientes,
  createSeguimiento,
  insertInmueble,
  insertDetalles,
};