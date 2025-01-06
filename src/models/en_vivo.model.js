const db = require('../config/database');

class EnVivo {
    static async getAll() {
        const query = "SELECT * FROM remajud.remates WHERE estado = 'en_curso'";
        return await db.execute(query).then(([rows]) => rows);
    }

    static async getImagenesInmuebles() {
        const [rows] = await db.execute(`
            SELECT id, TO_BASE64(imagenes_inmueble) AS imagenes_inmueble, remates_id 
            FROM img_inmuebles
        `);
        return rows;
    }




    static async getSeguimiento(remates_id) {
        const query = `SELECT * FROM remajud.seguimiento WHERE remates_id = ?`;

        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }



    static async getDetalles(remates_id) {
        const query = " SELECT * FROM remajud.detalles WHERE remates_id = ?";
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }


    static async getInmuebles(remates_id) {
        const query = " SELECT * FROM remajud.inmuebles WHERE remates_id = ?";
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    /* ARREGLASR POR ID IMG  */

   /*  static async getImagenesInmueblesById(remates_id) {
        const [rows] = await db.execute(`
            SELECT id, TO_BASE64(imagenes_inmueble) AS imagenes_inmueble, remates_id 
            FROM img_inmuebles
        `);
        return rows;
    }
 */
/* ------ */


    static async getCronograma(remates_id) {
        const query = " SELECT * FROM remajud.cronograma WHERE remates_id = ?";
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }



    static async getPdf(remates_id) {
        const query = `
        SELECT aviso_pdf FROM remates WHERE id = ?`; // Asegúrate que el nombre de la columna sea correcto
        const [rows] = await db.execute(query, [remates_id]);
        return rows[0];
    }
}
module.exports = EnVivo;