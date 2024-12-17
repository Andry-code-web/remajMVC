const db = require('../config/database');

class Live {
    static async getAll() {
        const query = "SELECT * FROM remajud.remates WHERE estado = 'en_curso'";
        try {
            const [rows] = await db.execute(query); 
            return rows; 
        } catch (error) {
            throw new Error('Error al obtener las subastas en curso: ' + error.message);
        }
    }

    static async getImagenesInmuebles() {
        const query = `
        SELECT
            i.id AS id,
            i.imagenes_inmueble,
            i.remates_id
        FROM img_inmuebles i
        `; 
        try {   
            const [img_inmuebles] = await db.query(query); 

            img_inmuebles.forEach(img => {
                if (img.imagenes_inmueble) {
                    img.imagenes_inmueble = img.imagenes_inmueble.toString('base64'); 
                }
            });
            return img_inmuebles; 
        } catch (error) {
            // Lanzar un error si ocurre algo durante la consulta
            throw new Error('Error al obtener las imágenes de inmuebles: ' + error.message);
        }
    }

    static async getById(id) {
        const query = "SELECT * FROM remajud.remates WHERE id = ?";
        try {
            const [rows] = await db.execute(query, [id]); 
            if (rows.length === 0) {
                throw new Error('No se encontró la subasta con el ID proporcionado');
            }
            return rows[0]; 
        } catch (error) {
            
            throw new Error('Error al obtener la subasta por ID: ' + error.message);
        }
    }
}

module.exports = Live;
