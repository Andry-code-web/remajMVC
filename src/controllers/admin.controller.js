const jwt = require('jsonwebtoken');
const {
  getAllRemates,
  getImagenesInmuebles,
  createRemate,
  agregarImagenes,
  agregarAnexos,
  deleteRemate,
  getUsuarioAdmin,
  getRemateById,
  updateRemate
} = require('../models/admin.model');

// Vista administrador
exports.getloginadmin = async (req, res) => {
  try {
    res.render('admin/login');
  } catch (error) {
    res.status(500).render('error', { error: error.message });
  }
};

// Lógica para el login
exports.loginAdmin = async (req, res) => {
  const { correo, contrasena } = req.body;

  try {
    const usuario = await getUsuarioAdmin(correo, contrasena);

    if (usuario) {
      // Generar token JWT
      const token = jwt.sign({ id: usuario.id, correo: usuario.correo }, process.env.JWT_SECRET, {
        expiresIn: '1h'
      });

      // Almacenar el token en una cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 3600000 // 1 hora
      });

      res.redirect('/admin/index');
    } else {
      req.flash('error', 'Datos incorrectos');
      res.redirect('/admin/login');
    }
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).send('Error al iniciar sesión');
  }
};

// Lógica para logout
exports.logoutAdmin = (req, res) => {
  res.clearCookie('auth_token');
  res.redirect('/admin/login');
};

// Obtener todos los remates
exports.getAlladmin = async (req, res) => {
  try {
    const remates = await getAllRemates();
    const img_inmuebles = await getImagenesInmuebles();

    // Verifica que las imágenes se asocien correctamente a los remates
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

// Obtener los datos de un remate para editar
exports.getRemateForEdit = async (req, res) => {
  try {
    const remateId = req.params.id;
    const remate = await getRemateById(remateId);
    res.json(remate);
  } catch (error) {
    console.error('Error al obtener los datos del remate:', error);
    res.status(500).json({ error: 'Error al obtener los datos del remate' });
  }
};

// Guardar los cambios de un remate
exports.updateRemate = async (req, res) => {
  try {
    const remateId = req.params.id;
    const {
      ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera,
      balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado
    } = req.body;

    // Actualizar el remate en la base de datos
    await updateRemate(remateId, [
      ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera,
      balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado
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

    res.status(200).json({ success: true, message: "Remate actualizado exitosamente" });
  } catch (error) {
    console.error("Error al actualizar el remate:", error);
    res.status(500).json({ success: false, message: "Hubo un problema al actualizar el remate", error: error.message });
  }
};
