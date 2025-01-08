const db = require('../config/database');

class Home {
  static async getAll(page, limit) {
    // Validar que page y limit sean números válidos, con valores predeterminados si no lo son
    page = Number.isInteger(page) && page > 0 ? page : 1;
    limit = Number.isInteger(limit) && limit > 0 ? limit : 10;
  
    // Calcular el OFFSET
    const offset = (page - 1) * limit;
  
    // Ejecutar la consulta con los parámetros LIMIT y OFFSET
    const [rows] = await db.execute(`
      SELECT
        r.*,
        i.id AS imagen_id,
        i.imagenes_inmueble
      FROM
        remates r
      LEFT JOIN
        img_inmuebles i ON r.id = i.remates_id
      LIMIT ? OFFSET ?
    `, [limit, offset]);  // Asegúrate de pasar los valores de limit y offset correctamente
  
    return rows;
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
    let query = `
      SELECT 
        r.id, 
        r.ubicacion, 
        r.precios, 
        r.categoria, 
        i.partida_registral
      FROM 
        remates r
      LEFT JOIN 
        inmuebles i 
      ON 
        r.id = i.remates_id
      WHERE 1=1`; // Para facilitar la concatenación de condiciones
  
    const valores = [];
  
    if (filtro.id) {
      query += " AND r.id = ?";
      valores.push(filtro.id);
    }
  
    if (filtro.ubicacion) {
      query += " AND r.ubicacion LIKE ?";
      valores.push(`%${filtro.ubicacion}%`);
    }
  
    if (filtro.precio) {
      query += " AND r.precios >= ?";
      valores.push(filtro.precio);
    }
  
    if (filtro.partida_registral) {
      query += " AND i.partida_registral LIKE ?";
      valores.push(`%${filtro.partida_registral}%`);
    }
  
    if (filtro.categoria) {
      query += " AND r.categoria LIKE ?";
      valores.push(`%${filtro.categoria}%`);
    }
  
    try {
      const [remates] = await db.query(query, valores);
      return remates;
    } catch (error) {
      console.error("Error al filtrar remates:", error);
      throw error;
    }
  }
  
  
  
}

module.exports = Home;
