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

        res.render('layouts/remates', { 
            remates,
            remate: 'remates/index'
         });
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
