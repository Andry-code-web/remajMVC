const jwt = require('jsonwebtoken');
const {
  getCronograma,
  getAllRemates,
  getImagenesInmuebles,
  createRemate,
  agregarImagenes,
  agregarAnexoUrl,
  deleteRemate,
  getUsuarioAdmin,
  getRemateById,
  updateRemate,
  createCronograma, // Nueva función agregada
  getClientes,
  getResumenClientes,
  getCatalogoClientes
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
      const token = jwt.sign(
        { id: usuario.id, correo: usuario.correo },
        process.env.JWT_SECRET,
        {
          expiresIn: '1h'
        }
      );

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
    res.render('layouts/admin', {
      remates: rematesConImagenes,
      contet: 'admin/index',
    });
  } catch (error) {
    console.error('Error fetching remates:', error);
    res.status(500).send('Error al cargar los datos');
  }
};

// Crear un nuevo remate
exports.crearRemate = async (req, res) => {
  try {
    const {
      ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera,
      balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado, tamano_propiedad, anexo_url
    } = req.body;

    // Verifica que req.session.userId esté definido
    if (!req.session.userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    // Crear un nuevo remate en la base de datos
    const remateId = await createRemate([
      ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera,
      balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado, tamano_propiedad,
      req.session.userId // Aquí agregamos usuario_admin_id
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
      balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado, tamano_propiedad
    } = req.body;

    const success = await updateRemate(remateId, [
      ubicacion, precios, descripcion, categoria, N_banos, N_habitacion, pisina, patio, cocina, cochera,
      balcon, jardin, pisos, comedor, sala_start, studio, lavanderia, fecha_remate, hora_remate, estado, tamano_propiedad
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

// Controlador para guardar el cronograma de actividades
exports.guardarCronograma = async (req, res) => {
  try {
    const { remates_id, nombre, fecha_inicio, fecha_fin } = req.body;
    console.log("datos cronograma:", req.body);

    // Verifica que req.session.userId esté definido
    if (!req.session.userId) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    // Guardar el cronograma en la base de datos
    await createCronograma(remates_id, nombre, fecha_inicio, fecha_fin);

    // Actualizar el progreso del botón
    res.status(200).json({ message: "Cronograma guardado exitosamente", fase: nombre });
  } catch (error) {
    console.error("Error al guardar el cronograma:", error);
    res.status(500).json({ message: "Hubo un problema al guardar el cronograma" });
  }
};

// Controlador para obtener el estado actual del cronograma
exports.obtenerCronograma = async (req, res) => {
  try {
    const { remates_id } = req.query;

    // Obtener el cronograma de la base de datos
    const cronograma = await getCronograma(remates_id);

    res.status(200).json(cronograma);
  } catch (error) {
    console.error("Error al obtener el cronograma:", error);
    res.status(500).json({ message: "Hubo un problema al obtener el cronograma" });
  }
};


// Crear seguimiento
exports.createSeguimiento = async (req, res) => {
  const {
    expediente, distrito_judicial, instancia, organo_juridico, especialidad, nro_convocatoria,
    fecha_registro, procesado_por, reanudado, fase_convocatoria, estado_convocatoria, remates_id
  } = req.body;

  const datosSeguimiento = [
    expediente, distrito_judicial, instancia, organo_juridico, especialidad, nro_convocatoria,
    fecha_registro, procesado_por, reanudado, fase_convocatoria, estado_convocatoria, remates_id
  ];

  try {
    const nuevoSeguimientoId = await Seguimiento.createSeguimiento(datosSeguimiento);
    res.status(201).json({ id: nuevoSeguimientoId, message: 'Seguimiento creado exitosamente' });
  } catch (error) {
    console.error('Error al crear el seguimiento:', error);
    res.status(500).json({ message: 'Error al crear el seguimiento' });
  }
};

// Obtener un seguimiento por ID
exports.getSeguimientoById = async (req, res) => {
  const { id } = req.params;
  try {
    const seguimiento = await Seguimiento.getSeguimientoById(id);
    if (!seguimiento) {
      return res.status(404).json({ message: 'Seguimiento no encontrado' });
    }
    res.json(seguimiento);
  } catch (error) {
    console.error('Error al obtener el seguimiento:', error);
    res.status(500).json({ message: 'Error al obtener el seguimiento' });
  }
};

/* CONTROLLER CLIENTES */
exports.getClientes = async (req, res) => {
  try {
    const clientes = await getClientes();
    res.render('layouts/admin', {
      clientes,
      contet: 'admin/clientesAdmin',
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener los clientes.' });
  }
}

exports.obtenerResumen = async (req, res) => {
  try {
    const resumen = await getResumenClientes();
    res.render('layouts/admin', {
      cliente: resumen.clientes, // Accede al arreglo dentro del objeto
      contet: 'admin/clientesAdmin',
    });


  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el resumen de clientes.' });
  }
}


exports.obtenerCatalogo = async (req, res) => {
  try {
    const catalogo = await getCatalogoClientes();
    res.json(catalogo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al obtener el catálogo de clientes.' });
  }
}
