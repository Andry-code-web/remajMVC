const db = require('../config/database');

class EnVivo {
    static async getAll(usuario_id) {
        const query = "SELECT * FROM remajud.likes WHERE usuarios_id = ? ";
        const [rows] = await db.execute(query, [usuario_id]);
        return rows;
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
        const query = `
            SELECT 
                i.*, 
                TO_BASE64(img.imagenes_inmueble) AS img_inmueble
            FROM 
                remajud.inmuebles AS i
            LEFT JOIN 
                img_inmuebles AS img
            ON 
                i.img_inmuebles_id = img.id
            WHERE 
                i.remates_id = ?
        `;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }
    

    static async getImagenInmuebleById(img_inmuebles_id) {
        const query = `
            SELECT 
                id, 
                TO_BASE64(imagenes_inmueble) AS imagenes_inmueble 
            FROM 
                img_inmuebles
            WHERE 
                id = ?
        `;
        const [rows] = await db.execute(query, [img_inmuebles_id]);
        return rows.length ? rows[0] : null;
    }



    static async getCronograma(remateId) {
        const query = `SELECT * FROM remajud.cronograma WHERE remates_id = ?`;

        const [rows] = await db.execute(query, [remateId]);
        return rows;
    }
    



    static async getAnexosAll() {
        const [rows] = await db.execute(`
            SELECT id, papeles_inmuebles, remates_id FROM anexos
        `);
        return rows;
    }
      
}
module.exports = EnVivo;