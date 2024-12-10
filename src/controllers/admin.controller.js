const {
  getAllRemates,
  getImagenesInmuebles,
  createRemate,
  agregarImagenes,
  agregarAnexos,
  deleteRemate,
} = require('../models/admin.model');

// Obtener todos los remates
exports.getAlladmin = async (req, res) => {
  try {
    const remates = await getAllRemates();
    const img_inmuebles = await getImagenesInmuebles();

    // Verifica que las imágenes se asocien correctamente a los remates
    const rematesConImagenes = remates.map(remate => {
      const imagen = img_inmuebles.find(img => img.remates_id === remate.id);
      console.log(imagen); // Verifica que la imagen esté siendo encontrada
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
exports.crearRemate = async (req, res) => {
  try {
    // Extraer datos del formulario
    const {
      ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera,
      balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado
    } = req.body;

    // Crear un nuevo remate en la base de datos
    const remateId = await createRemate([
      ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera,
      balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado, 1
    ]);

    // Procesar imágenes y anexos
    if (req.files["photo"]) {
      const imagenes = req.files["photo"].map((file) => [file.buffer, remateId]);
      await agregarImagenes(imagenes);
    }

    if (req.files["anexos"]) {
      const anexos = req.files["anexos"].map((file) => [file.buffer, remateId]);
      await agregarAnexos(anexos);
    }

    res.status(200).json({ message: "Remate creado exitosamente" });
  } catch (error) {
    console.error("Error al crear el remate:", error);
    res.status(500).json({ message: "Hubo un problema al crear el remate" });
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
