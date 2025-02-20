const db = require('../config/database');

class EnVivo {
    static async getAll(usuario_id) {
        const query = `
            SELECT 
                l.id AS like_id,
                l.usuarios_id,
                l.remates_id,
                r.*,
                MIN(i.imagenes_inmueble) AS imagen,
                MIN(a.papeles_inmuebles) AS anexo
            FROM 
                likes l
            INNER JOIN 
                remates r ON l.remates_id = r.id
            LEFT JOIN 
                img_inmuebles i ON r.id = i.remates_id
            LEFT JOIN 
                anexos a ON r.id = a.remates_id
            WHERE 
                l.usuarios_id = ?
            GROUP BY 
                l.id, l.usuarios_id, l.remates_id, r.id
            ORDER BY 
                r.fecha_remate ASC, r.hora_remate ASC;
        `;

        const [rows] = await db.execute(query, [usuario_id]);

        // Convertimos la imagen y el anexo a base64 si existen
        return rows.map(row => ({
            ...row,
            imagen: row.imagen ? row.imagen.toString('base64') : null,
            anexo: row.anexo ? row.anexo.toString('base64') : null
        }));
    }




    

    static async getImagenesInmuebles() {
        const query = `
            SELECT 
                id,
                remates_id,
                imagenes_inmueble
            FROM 
                img_inmuebles
            WHERE 
                imagenes_inmueble IS NOT NULL
        `;
        const [rows] = await db.execute(query);
        return rows.map(row => ({
            ...row,
            imagenes_inmueble: row.imagenes_inmueble ? row.imagenes_inmueble.toString('base64') : null
        }));
    }

    static async getAnexosAll() {
        const query = `
            SELECT 
                id,
                remates_id,
                papeles_inmuebles
            FROM 
                anexos
            WHERE 
                papeles_inmuebles IS NOT NULL
        `;
        const [rows] = await db.execute(query);
        return rows;
    }

    static async getSeguimiento(remates_id) {
        const query = `SELECT * FROM remajud.seguimiento WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remates_id]);
        return rows;
    }

    static async getDetalles(remates_id) {
        // Consulta principal de detalles del remate
        const detallesQuery = "SELECT * FROM remajud.detalles WHERE remates_id = ?";
        const [detalles] = await db.execute(detallesQuery, [remates_id]);
    
        // Consulta de inscritos en el remate (validado o no)
        const inscritosQuery = "SELECT * FROM usuario_remate WHERE remate_id = ?";
        const [inscritos] = await db.execute(inscritosQuery, [remates_id]);
    
        // Filtrar los usuarios validados
        const clin_validados = inscritos.filter(user => user.validado === 1);
        const num_validados = clin_validados.length; // Número de validados
    
        // Agregar información a los detalles
        detalles.forEach(row => {
            row.n_inscritos = inscritos.length;  // Total de inscritos
            row.n_validados = num_validados;    // Solo los validados
            row.inscritos = inscritos;          // Lista de todos los inscritos
        });
    
        return detalles;
    }
    
    

    static async getInmuebles(remates_id) {
        const query = `
            SELECT 
                i.*, 
                img.imagenes_inmueble AS img_inmueble
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
        return rows.map(row => ({
            ...row,
            img_inmueble: row.img_inmueble ? row.img_inmueble.toString('base64') : null
        }));
    }

    static async getImagenInmuebleById(img_inmuebles_id) {
        const query = `
            SELECT 
                id, 
                imagenes_inmueble
            FROM 
                img_inmuebles
            WHERE 
                id = ?
        `;
        const [rows] = await db.execute(query, [img_inmuebles_id]);
        if (rows.length && rows[0].imagenes_inmueble) {
            return {
                ...rows[0],
                imagenes_inmueble: rows[0].imagenes_inmueble.toString('base64')
            };
        }
        return null;
    }

    static async getCronograma(remateId) {
        const query = `SELECT * FROM remajud.cronograma WHERE remates_id = ?`;
        const [rows] = await db.execute(query, [remateId]);
        return rows;
    }
}

module.exports = EnVivo;