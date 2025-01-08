const filtrohomeModel = require('../models/filtrohome.model'); // Asegúrate de la ruta correcta

async function filtrarRemates(req, res) {
    const { remates_id, expediente, precio_base, distrito_judicial } = req.query;

    // Validamos que los parámetros existan
    if (!remates_id || !expediente || !precio_base || !distrito_judicial) {
        return res.status(400).send('Faltan parámetros para filtrar');
    }

    const params = {
        remates_id: remates_id,
        expediente: expediente,
        precio_base: precio_base,
        distrito_judicial: distrito_judicial
    };

    try {
        const results = await filtrohomeModel.obtenerFiltrados(params);
        res.render('remates', { remates: results }); // Renderizar la vista con los resultados
    } catch (err) {
        console.error('Error al filtrar remates:', err);
        res.status(500).send('Error al filtrar remates');
    }
}

module.exports = { filtrarRemates };


/* const FiltroHome = require('../models/filtrohome.model');

exports.getFiltarRemates = async (req, res) => {
    try {
        const { categoria, ubicacion, precio_min, precio_max } = req.query;

        const rematesFiltrados = await FiltroHome.getFiltrarBanner({
            categoria,
            ubicacion, // Asegúrate de que este parámetro se llame 'ubicacion'
            montoMin: precio_min,
            montoMax: precio_max
        });
        // Agrupamos las imágenes por remate, tomando solo la primera imagen
        const remates = rematesFiltrados.reduce((acc, row) => {
            if (!acc[row.id]) {
                acc[row.id] = {
                    ...row,
                    imagen: row.imagenes_inmueble || null // Guardar la primera imagen encontrada
                };
            }
            return acc;
        }, {});

        res.render('remates/index', {
            remates: Object.values(remates)
        });
    } catch (error) {
        console.error('Error al obtener los remates filtrados:', error);
        res.status(500).render('error', { message: 'Error al filtrar los remates' });
    }
};
 */