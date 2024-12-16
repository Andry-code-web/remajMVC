const db = require('../config/database');

class Live {
    // Método para obtener todas las subastas que están "en curso"
    static async getAll() {
        const query = "SELECT * FROM remajud.remates WHERE estado = 'en_curso'";
        try {
            const [rows] = await db.execute(query); // Ejecutar consulta
            return rows; // Retornar los resultados
        } catch (error) {
            // Lanzar un error si ocurre algo durante la consulta
            throw new Error('Error al obtener las subastas en curso: ' + error.message);
        }
    }

    // Método para obtener las imágenes de los inmuebles
    static async getImagenesInmuebles() {
        const query = `
        SELECT
            i.id AS id,
            i.imagenes_inmueble,
            i.remates_id
        FROM img_inmuebles i
        `; // Consulta para obtener imágenes relacionadas con subastas
        try {
            const [img_inmuebles] = await db.query(query); // Ejecutar consulta

            // Convertir las imágenes a formato Base64 para ser utilizadas en el frontend
            img_inmuebles.forEach(img => {
                if (img.imagenes_inmueble) {
                    img.imagenes_inmueble = img.imagenes_inmueble.toString('base64'); // Conversión
                }
            });
            return img_inmuebles; // Retornar las imágenes procesadas
        } catch (error) {
            // Lanzar un error si ocurre algo durante la consulta
            throw new Error('Error al obtener las imágenes de inmuebles: ' + error.message);
        }
    }

    // Método para obtener una subasta específica por su ID
    static async getById(id) {
        const query = "SELECT * FROM remajud.remates WHERE id = ?";
        try {
            const [rows] = await db.execute(query, [id]); // Ejecutar consulta con el parámetro ID
            if (rows.length === 0) {
                // Lanzar un error si no se encuentra la subasta
                throw new Error('No se encontró la subasta con el ID proporcionado');
            }
            return rows[0]; // Retornar el primer resultado
        } catch (error) {
            // Lanzar un error si ocurre algo durante la consulta
            throw new Error('Error al obtener la subasta por ID: ' + error.message);
        }
    }
}

// Exportar la clase para que pueda ser utilizada en otros archivos
module.exports = Live;
