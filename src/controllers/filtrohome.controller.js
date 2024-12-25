const FiltroHome = require('../models/filtrohome.model');

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
