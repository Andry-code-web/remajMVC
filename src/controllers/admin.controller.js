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
  getEstadisticas,
  getResumenClientes,
  getCatalogoClientes,
  createSeguimiento,
  insertInmueble,
  insertDetalles,
} = require('../models/admin.model');
const { query } = require('../config/database');
const db = require('../config/database');

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

exports.obtenerCronograma = async (req, res) => {
  try {
    const { remates_id } = req.query;

    // Validar si remates_id es válido
    if (!remates_id || remates_id === 'null') {
      return res.status(400).json({ message: "El parámetro remates_id es obligatorio" });
    }

    // Obtener el cronograma de la base de datos
    const cronograma = await getCronograma(remates_id);

    res.status(200).json(cronograma);
  } catch (error) {
    console.error("Error al obtener el cronograma:", error);
    res.status(500).json({ message: "Hubo un problema al obtener el cronograma" });
  }
};

/* seguimiento */
exports.createSeguimiento = async (req, res) => {
  const {
    expediente, distrito_judicial, instancia, especialidad, nro_convocatoria,
    fecha_registro, procesado_por, reanudado, fase_convocatoria, estado_convocatoria, remates_id
  } = req.body;

  const datosSeguimiento = [
    expediente || null,
    distrito_judicial || null,
    instancia || null,
    especialidad || null,
    nro_convocatoria || null,
    fecha_registro || null,
    procesado_por || null,
    reanudado || null,
    fase_convocatoria || null,
    estado_convocatoria || null,
    remates_id || null
  ];

  try {
    const query = `
      INSERT INTO seguimiento (expediente, distrito_judicial, instancia, especialidad, nro_convocatoria, fecha_registro, procesado_por, reanudado, fase_convocatoria, estado_convocatoria, remates_id)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const [guardarSeguimiento] = await db.execute(query, datosSeguimiento);
    res.status(201).json({ id: guardarSeguimiento.insertId, message: 'Seguimiento creado exitosamente' });
  } catch (error) {
    console.error('Error al crear el seguimiento:', error);
    res.status(500).json({ error: 'Error al crear el seguimiento' });
  }
};


/* CONTROLLER CLIENTES */
exports.getClientes = async (req, res) => {
  try {
    console.log('Iniciando el controlador getClientes');

    // Obtener los IDs de los remates disponibles
    const queryRemates = `SELECT id FROM remates`;
    const [rows] = await db.query(queryRemates);
    console.log('IDs de remates disponibles:', rows);

    // Extraer los IDs de remates disponibles
    const id_remate = rows.map(row => row.id);

    // Obtener los clientes
    const clientesQuery = `SELECT * FROM usuarios`;
    const [clientes] = await db.query(clientesQuery);
    console.log('Clientes obtenidos:', clientes);

    // Obtener los remates validados por cliente
    for (const cliente of clientes) {
      console.log(`Procesando cliente ID: ${cliente.id}`);
      const [rematesValidados] = await db.query(
        `SELECT remate_id FROM usuario_remate WHERE usuario_id = ? AND validado = 1`,
        [cliente.id]
      );
      cliente.remates_validos = rematesValidados.map(r => r.remate_id) || [];
    }

    console.log('Clientes con remates validados:', clientes);

    // Total de clientes
    const numeroClientes = clientes.length;

    // Estadísticas de nuevos clientes registrados este mes
    const queryEstadisticasMes = `
      SELECT * FROM usuarios 
      WHERE MONTH(fecha_registro) = MONTH(NOW())
      AND YEAR(fecha_registro) = YEAR(NOW())`;
    const [estadisticaMes] = await db.query(queryEstadisticasMes);
    const nuevosClientesES = estadisticaMes.length;

    // Estadísticas por día de la semana del mes actual
    const queryDias = `
      SELECT 
        DAYOFWEEK(fecha_registro) AS dia_semana, 
        COUNT(*) AS total
      FROM usuarios
      WHERE MONTH(fecha_registro) = MONTH(NOW())
      AND YEAR(fecha_registro) = YEAR(NOW())
      GROUP BY dia_semana
      ORDER BY dia_semana;
    `;
    const [registrosPorDia] = await db.query(queryDias);
    console.log('Registros agrupados por día:', registrosPorDia);

    // Estadísticas filtradas por año y mes si se pasan parámetros
    const { anio, mes } = req.query;
    let registrosFiltrados = [];
    let noDataMessage = '';

    if (anio && mes) {
      console.log(`Filtrando estadísticas para el año ${anio} y mes ${mes}`);
      const queryFiltrados = `
        SELECT 
          DAYOFWEEK(fecha_registro) AS dia_semana, 
          COUNT(*) AS total
        FROM usuarios
        WHERE YEAR(fecha_registro) = ? AND MONTH(fecha_registro) = ?
        GROUP BY dia_semana
        ORDER BY dia_semana;
      `;
      const [filtrados] = await db.query(queryFiltrados, [anio, mes]);
      registrosFiltrados = filtrados;
      console.log('Registros filtrados:', registrosFiltrados);

      if (registrosFiltrados.length === 0) {
        noDataMessage = 'No se encontraron datos para el año y mes seleccionados.';
      }
    }

    // Pasar datos a la vista
    res.render('layouts/admin', {
      clientes,
      id_remate,
      numeroClientes,
      estadisticaMes,
      nuevosClientesES,
      registrosPorDia,
      registrosFiltrados,
      noDataMessage,  // Aquí pasas la variable
      anio: anio || null,
      mes: mes || null,
      contet: 'admin/clientesAdmin',
    });
  } catch (error) {
    console.error('Error en getClientes:', error);
    res.status(500).json({ message: 'Error al obtener los clientes.' });
  }
};




exports.validarClienteEnRemate = async (req, res) => {
  try {
    const { clienteId, remateId } = req.body;

    // Verificar si ya existe una validación para este cliente y remate
    const [validacionExistente] = await db.query(
      `SELECT * FROM usuario_remate WHERE usuario_id = ? AND remate_id = ?`,
      [clienteId, remateId]
    );

    if (validacionExistente.length > 0) {
      // Si ya existe, eliminar la validación
      await db.query(
        `DELETE FROM usuario_remate WHERE usuario_id = ? AND remate_id = ?`,
        [clienteId, remateId]
      );
      return res.status(200).json({ message: 'Validación eliminada correctamente.' });
    } else {
      // Si no existe, insertar la validación
      await db.query(
        `INSERT INTO usuario_remate (usuario_id, remate_id, validado, fecha_validacion) VALUES (?, ?, 1, NOW())`,
        [clienteId, remateId]
      );
      return res.status(200).json({ message: 'Cliente validado correctamente en el remate.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error al validar o eliminar la validación del cliente en el remate.' });
  }
};





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


// Controlador para insertar un nuevo inmueble
const checkRemateExists = async (remate_id) => {
  const query = `SELECT id FROM remates WHERE id = ?`;
  const [rows] = await db.query(query, [remate_id]);
  return rows.length > 0;
};

exports.crearInmueble = async (req, res) => {
  const { remate_id, partida_registral, tipo_inmueble, direccion, carga_ogravamen, porcentaje_rematar } = req.body;

  try {
    const exists = await checkRemateExists(remate_id);
    if (!exists) {
      return res.json({ success: false, message: `El remate con ID ${remate_id} no existe.` });
    }

    const datosInmueble = [
      partida_registral || null,
      tipo_inmueble || null,
      direccion || null,
      carga_ogravamen || null,
      porcentaje_rematar || null,
      remate_id || null
    ];

    const newInmuebleId = await insertInmueble(datosInmueble);
    res.json({ success: true, message: 'Inmueble creado exitosamente', inmuebleId: newInmuebleId });
  } catch (error) {
    console.error('Error al crear el inmueble:', error);
    res.json({ success: false, error: error.message });
  }
};




// Controlador para crear nuevos detalles de remate
exports.crearDetalles = async (req, res) => {
  const {
    N_de_partida_registral,
    distrito_judicial,
    distrito,
    gravámenes,
    convocatoria,
    garantía,
    tasacion,
    precio_base,
    incremento_ofertas,
    remate,
    tamano_propiedad,
    n_inscritos,
    descripcion_de_detalles,
    remate_id
  } = req.body;
  console.log('requerido del formulario', req.body.remate_id)
  const datosDetalles = [
    N_de_partida_registral,
    distrito_judicial,
    distrito,
    gravámenes,
    convocatoria,
    garantía,
    tasacion,
    precio_base,
    incremento_ofertas,
    remate,
    tamano_propiedad,
    n_inscritos,
    descripcion_de_detalles,
    remate_id
  ];
  console.log('requerido de detalles', datosDetalles[13]); // Index 13 es el último elemento
  try {
    const detalleId = await insertDetalles(datosDetalles);
    if (detalleId) {
      res.json({ success: true, message: 'Detalles creados exitosamente', detalleId });
    } else {
      res.json({ success: false, message: 'Error al crear los detalles' });
    }
    
  } catch (error) {
    console.error('Error al crear los detalles:', error);
    res.json({ success: false, error: error.message });
  }
};
