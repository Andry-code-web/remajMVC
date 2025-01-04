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

  static async getRemateDetails(id) {
    const [remateRows] = await db.execute(`
      SELECT * FROM detalles WHERE remates_id = ?`, [id]);
    const [inmueblesRows] = await db.execute(`
      SELECT * FROM inmuebles WHERE remates_id = ?`, [id]);
    const [cronogramaRows] = await db.execute(`
      SELECT * FROM cronograma WHERE remates_id = ?`, [id]);
    const [seguimientoRows] = await db.execute(`
      SELECT * FROM seguimiento WHERE remates_id = ?`, [id]);
    const [anexosRows] = await db.execute(`
      SELECT * FROM anexos WHERE remates_id = ?`, [id]);

    return {
      detalles: remateRows[0],
      inmuebles: inmueblesRows,
      cronograma: cronogramaRows,
      seguimiento: seguimientoRows[0], // Asumimos que solo hay un registro de seguimiento por remate
      anexos: anexosRows // Agregamos los anexos
    };
  }

  static async getAnexos(id) {
    const [anexosRows] = await db.execute(`
      SELECT * FROM anexos WHERE remates_id = ?`, [id]);
    return anexosRows;
  }
}

module.exports = Home;
