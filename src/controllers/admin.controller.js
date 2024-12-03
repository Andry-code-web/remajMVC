const {
  getAllRemates,
  getImagenesInmuebles,
  createRemate,
  updateRemate,
  deleteRemate,
  getRemateById
} = require('../models/administrador.models');

// Obtener todos los remates
exports.getAlladmin = async (req, res) => {
  try {
    const remates = await getAllRemates();
    const img_inmuebles = await getImagenesInmuebles();

    const rematesConImagenes = remates.map(remate => {
      const imagen = img_inmuebles.find(img => img.remates_id === remate.id);
      return {
        ...remate,
        imagen: imagen ? imagen.imagenes_inmueble : null
      };
    });
  
    res.render('admin/index', { remates: rematesConImagenes });
  } catch (error) {
    console.error('Error fetching remates:', error);
    res.status(500).send('Error al cargar los datos');
  }
};

// Crear un nuevo remate
exports.createRemate = async (req, res) => {
  try {
    const remateData = req.body;
    const imagen = req.file;
    const remateId = await createRemate(remateData, imagen);
    res.json({ success: true, id: remateId });
  } catch (error) {
    console.error('Error al crear remate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Actualizar un remate existente
exports.updateRemate = async (req, res) => {
  try {
    const remateId = req.params.id;
    const remateData = req.body;
    const success = await updateRemate(remateId, remateData);
    if (success) {
      res.json({ success: true, message: 'Remate actualizado correctamente' });
    } else {
      res.status(404).json({ success: false, error: 'Remate no encontrado' });
    }
  } catch (error) {
    console.error('Error al actualizar el remate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};

// Eliminar un remate
exports.deleteRemate = async (req, res) => {
  try {
    const remateId = req.query.deleteId;
    const success = await deleteRemate(remateId);
    if (success) {
      res.json({ success: true });
    } else {
      res.json({ success: false, error: 'Remate no encontrado.' });
    }
  } catch (error) {
    console.error('Error al eliminar el remate:', error);
    res.json({ success: false, error: error.message });
  }
};

// Obtener un remate por ID para editar
exports.getRemateById = async (req, res) => {
  try {
    const remateId = req.params.id;
    const remate = await getRemateById(remateId);
    if (remate) {
      res.json({ success: true, remate });
    } else {
      res.status(404).json({ success: false, error: 'Remate no encontrado' });
    }
  } catch (error) {
    console.error('Error al obtener el remate:', error);
    res.status(500).json({ success: false, error: error.message });
  }
};
