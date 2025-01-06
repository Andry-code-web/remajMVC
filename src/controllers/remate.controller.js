const Remate = require('../models/remate.model');
const { getImagenesInmuebles } = require('../models/admin.model');

// Controlador para obtener todos los remates
exports.getAllremates = async (req, res) => {
    try {
        const remates = await Remate.getAllRemates();
        const imagenes = await getImagenesInmuebles();

        // Asocia las imágenes con los remates
        remates.forEach(remate => {
            const img = imagenes.find(img => img.remates_id === remate.id);
            if (img) {
                remate.imagen = img.imagenes_inmueble;
            }
        });

        res.render('remates/index', { remates });
    } catch (error) {
        console.error('Error al obtener los remates:', error);
        res.status(500).send('Error al cargar los remates');
    }
};

// Controlador para obtener un remate específico por ID
exports.getRemateById = async (req, res) => {
    const remateId = req.params.id;
    try {
        const remate = await Remate.getRemateById(remateId);
        if (remate) {
            res.render('remates/detalle', { remate });
        } else {
            res.status(404).send('Remate no encontrado');
        }
    } catch (error) {
        console.error('Error al obtener el remate:', error);
        res.status(500).send('Error al cargar el remate');
    }
};

// Controlador para obtener remates filtrados por categoría
exports.getAllremates = async (req, res) => {
    const categoria = req.query.categoria;  // Obtenemos el parámetro de categoría de la URL
    try {
        let remates;

        if (categoria) {
            // Si hay categoría, filtramos los remates por categoría
            remates = await Remate.getRematesByCategoria(categoria);
        } else {
            // Si no hay categoría, obtenemos todos los remates
            remates = await Remate.getAllRemates();
        }

        const imagenes = await getImagenesInmuebles();

        // Asocia las imágenes con los remates
        remates.forEach(remate => {
            const img = imagenes.find(img => img.remates_id === remate.id);
            if (img) {
                remate.imagen = img.imagenes_inmueble;
            }
        });

        // Renderiza la vista de remates con los productos filtrados o todos los remates
        res.render('remates/index', { remates, categoria });
    } catch (error) {
        console.error('Error al obtener los remates:', error);
        res.status(500).send('Error al cargar los remates');
    }
};