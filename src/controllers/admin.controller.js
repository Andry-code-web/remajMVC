const jwt = require('jsonwebtoken');
const {
  getAllRemates,
  getImagenesInmuebles,
  createRemate,
  createSeguimiento,
  createDetalles,
  createInmuebles,
  createCronograma,
  agregarImagenes,
  agregarAnexoUrl,
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

      // Establecer el ID del usuario en la sesión
      req.session.userId = usuario.id;

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
    // Verifica que req.session.userId esté definido
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const {
      ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera,
      balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado, tamaño_propiedad, anexo_url,
      expediente, distrito_judicial, instancia, organo_jurisdiccional, especialidad, nro_convocatoria, fecha_registro, estado_convocatoria, fase_convocatoria, procesado_por, reanudado,
      partida_registral, tipo_inmueble, direccion, carga_ogravamen, porcentaje_rematar,
      actividad, fecha_actividad, fecha_fin,
      expediente_detalle, distrito_vocal, organo_jurisdiccional_detalle, instancia_detalle, juez, especialidad_detalle, materia, resolucion, fch_resolucion, archivo, nro_convocatoria_detalle, tipo_cambio, tasacion, precio_base, incremento_ofertas, arancel, objeto, descripcion_detalle, n_inscritos
    } = req.body;

    // Crear un nuevo remate en la base de datos
    const remateId = await createRemate([
      ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera,
      balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado, tamaño_propiedad,
      req.user.id // Aquí agregamos usuario_admin_id
    ]);

    // Crear un nuevo seguimiento en la base de datos
    await createSeguimiento([
      expediente, distrito_judicial, instancia, organo_jurisdiccional, especialidad, nro_convocatoria, fecha_registro, estado_convocatoria, fase_convocatoria, procesado_por, reanudado, remateId
    ]);

    // Crear un nuevo inmueble en la base de datos
    await createInmuebles([
      partida_registral, tipo_inmueble, direccion, carga_ogravamen, porcentaje_rematar, remateId
    ]);

    // Crear un nuevo cronograma en la base de datos
    await createCronograma([
      actividad, fecha_actividad, fecha_fin, remateId
    ]);

    // Crear un nuevo detalle en la base de datos
    await createDetalles([
      expediente_detalle, distrito_vocal, organo_jurisdiccional_detalle, instancia_detalle, juez, especialidad_detalle, materia, resolucion, fch_resolucion, archivo, nro_convocatoria_detalle, tipo_cambio, tasacion, precio_base, incremento_ofertas, arancel, objeto, descripcion_detalle, n_inscritos, remateId
    ]);

    // Procesar imágenes
    if (req.files["photo"]) {
      const imagenes = req.files["photo"].map((file) => [file.buffer, remateId]);
      await agregarImagenes(imagenes);
    }

    // Procesar la URL del anexo
    if (anexo_url) {
      await agregarAnexoUrl(anexo_url, remateId);
    }

    res.status(200).json({ message: "Remate creado exitosamente" });
  } catch (error) {
    console.error("Error al crear el remate:", error);
    res.status(500).json({ message: "Hubo un problema al crear el remate" });
  }
};


// Actualizar un remate existente
exports.updateRemate = async (req, res) => {
  try {
    const remateId = req.params.id;
    const {
      ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera,
      balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado, tamaño_propiedad
    } = req.body;

    const success = await updateRemate(remateId, [
      ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera,
      balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado, tamaño_propiedad
    ]);

    if (success) {
      // Procesar la URL del anexo
      if (req.body.anexo_url) {
        const anexoUrl = req.body.anexo_url;
        await agregarAnexoUrl(anexoUrl, remateId);
      }

      res.json({ success: true, message: 'Remate actualizado correctamente' });
    } else {
      res.status(404).json({ success: false, error: 'Remate no encontrado' });
    }
  } catch (error) {
    console.error("Error al actualizar el remate:", error);
    res.status(500).json({ message: "Hubo un problema al actualizar el remate", error: error.message });
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
