const Remate = require('../models/remate.model');

// Controlador para obtener todos los remates
exports.getAllremates = async (req, res) => {
    try {
        const remates = await Remate.getAllRemates();
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
