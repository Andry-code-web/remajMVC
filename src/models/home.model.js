const db = require('../config/database');

class Home {
  static async getAll({ limit, offset }) {
    try {
      const [rows] = await db.query(
        `SELECT DISTINCT
            r.*,
            i.id AS imagen_id,
            i.imagenes_inmueble
          FROM
            remates r
          LEFT JOIN
            img_inmuebles i ON r.id = i.remates_id
          GROUP BY r.id
          ORDER BY r.id
          LIMIT ${limit} OFFSET ${offset}`
      );
      return rows;
    } catch (error) {
      console.error('Error en Home.getAll:', error);
      throw error;
    }
  }

  static async getRemateDetails(id) {
    const [remateRows] = await db.execute(`SELECT * FROM detalles WHERE remates_id = ?`, [id]);
    const [inmueblesRows] = await db.execute(`SELECT * FROM inmuebles WHERE remates_id = ?`, [id]);
    const [cronogramaRows] = await db.execute(`SELECT * FROM cronograma WHERE remates_id = ?`, [id]);
    const [seguimientoRows] = await db.execute(`SELECT * FROM seguimiento WHERE remates_id = ?`, [id]);
    const [anexosRows] = await db.execute(`SELECT * FROM anexos WHERE remates_id = ?`, [id]);

    return {
      detalles: remateRows[0],
      inmuebles: inmueblesRows,
      cronograma: cronogramaRows,
      seguimiento: seguimientoRows[0],
      anexos: anexosRows || [] // Asegúrate de que siempre sea un array
    };
  }

  static async getAnexos(id) {
    const [anexosRows] = await db.execute(`
      SELECT * FROM anexos WHERE remates_id = ?`, [id]);
    return anexosRows;
  }

  static async getFiltro(filtro) {
    // Consulta base para obtener resultados
    let query = `
      SELECT
        r.id,
        r.ubicacion,
        r.precios,
        r.categoria,
        r.estado,
        i.partida_registral,
        (SELECT imagenes_inmueble FROM img_inmuebles WHERE remates_id = r.id LIMIT 1) as imagen
      FROM
        remates r
      LEFT JOIN
        inmuebles i
      ON
        r.id = i.remates_id
      WHERE 1=1`;

    // Consulta para contar total de registros
    let countQuery = `
      SELECT COUNT(DISTINCT r.id) as total
      FROM remates r
      LEFT JOIN inmuebles i
      ON r.id = i.remates_id
      LEFT JOIN img_inmuebles img
      ON r.id = img.remates_id
      WHERE 1=1`;

    const valores = [];
    const countValores = [];

    // Agregar condiciones de filtro
    if (filtro.id) {
      query += " AND r.id = ?";
      countQuery += " AND r.id = ?";
      valores.push(filtro.id);
      countValores.push(filtro.id);
    }

    if (filtro.ubicacion) {
      query += " AND r.ubicacion LIKE ?";
      countQuery += " AND r.ubicacion LIKE ?";
      valores.push(`%${filtro.ubicacion}%`);
      countValores.push(`%${filtro.ubicacion}%`);
    }

    if (filtro.precio) {
      query += " AND r.precios >= ?";
      countQuery += " AND r.precios >= ?";
      valores.push(filtro.precio);
      countValores.push(filtro.precio);
    }

    if (filtro.partida_registral) {
      query += " AND i.partida_registral LIKE ?";
      countQuery += " AND i.partida_registral LIKE ?";
      valores.push(`%${filtro.partida_registral}%`);
      countValores.push(`%${filtro.partida_registral}%`);
    }

    if (filtro.categoria) {
      query += " AND r.categoria LIKE ?";
      countQuery += " AND r.categoria LIKE ?";
      valores.push(`%${filtro.categoria}%`);
      countValores.push(`%${filtro.categoria}%`);
    }

    // Agregar agrupación por ID de remate para manejar múltiples imágenes
    query += ' GROUP BY r.id';

    // Agregar paginación
    query += ` LIMIT ${filtro.limit} OFFSET ${filtro.offset}`;

    try {
      const [remates] = await db.query(query, valores);
      const [[{ total }]] = await db.query(countQuery, countValores);

      return { remates, total };
    } catch (error) {
      console.error("Error al filtrar remates:", error);
      throw error;
    }
  }
}

module.exports = Home;
