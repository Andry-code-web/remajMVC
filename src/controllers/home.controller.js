const Home = require('../models/home.model');

exports.getAllRemates = async (req, res) => {
    try {
        const rematesData = await Home.getAll();

        // Agrupamos las imágenes por remate, tomando solo la primera imagen
        const remates = rematesData.reduce((acc, row) => {
            if (!acc[row.id]) {
                acc[row.id] = {
                    ...row,
                    imagen: row.imagenes_inmueble || null // Guardar la primera imagen encontrada
                };
            }
            return acc;
        }, {});

        res.render('layouts/main', {
            content: 'home/index',
            remates: Object.values(remates)
        });
    } catch (error) {
        res.status(500).render('error', { error: error.message });
    }
};

exports.getFiltarRemates = async (req, res) => {
    try {
        const { categoria, ubicacion, departamento, precio_min, precio_max } = req.query;

        const rematesFiltrados = await Home.getFiltrarBanner({
            categoria,
            ubicacion,
            departamento,
            montoMin: precio_min,
            montoMax: precio_max
        });

        if (rematesFiltrados.length === 0) {
            return res.status(404).render('error', {
                message: 'No se encontraron remates con esos filtros'
            });
        }

        res.render('remates/index', {
            remates: rematesFiltrados
        });
    } catch (error) {
        console.error('Error al obtener los remates filtrados:', error);
        res.status(500).render('error', { message: 'Error al filtrar los remates' });
    }
};
