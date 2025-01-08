const jwt = require("jsonwebtoken");
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
  updateRemate,
  updateSeguimiento,
  updateDetalles,
  updateInmuebles,
  updateCronograma,
} = require("../models/admin.model");

// Vista administrador
exports.getloginadmin = async (req, res) => {
  try {
    res.render("admin/login");
  } catch (error) {
    res.status(500).render("error", { error: error.message });
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
          expiresIn: "1h",
        }
      );

      // Almacenar el token en una cookie
      res.cookie("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 3600000, // 1 hora
      });

      // Establecer el ID del usuario en la sesión
      req.session.userId = usuario.id;

      res.redirect("/admin/index");
    } else {
      req.flash("error", "Datos incorrectos");
      res.redirect("/admin/login");
    }
  } catch (error) {
    console.error("Error al iniciar sesión:", error);
    res.status(500).send("Error al iniciar sesión");
  }
};

// Lógica para logout
exports.logoutAdmin = (req, res) => {
  res.clearCookie("auth_token");
  res.redirect("/admin/login");
};

// Obtener todos los remates
exports.getAlladmin = async (req, res) => {
  try {
    const remates = await getAllRemates();
    const img_inmuebles = await getImagenesInmuebles();

    // Verifica que las imágenes se asocien correctamente a los remates
    const rematesConImagenes = remates.map((remate) => {
      const imagen = img_inmuebles.find((img) => img.remates_id === remate.id);
      return {
        ...remate,
        imagen: imagen ? imagen.imagenes_inmueble : null,
      };
    });
    res.render("admin/index", { remates: rematesConImagenes });
  } catch (error) {
    console.error("Error fetching remates:", error);
    res.status(500).send("Error al cargar los datos");
  }
};

// Crear un nuevo remate
exports.crearRemate = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: "Usuario no autenticado" });
    }

    const IDadministrador = req.user.id;

    // Extract all form data
    const {
      // Remate basic info
      ubicacion, precios, descripcion, categoria, N_banos, N_habitacion,
      pisina, patio, cocina, cochera, balcon, jardin, pisos, comedor,
      sala_start, studio, lavanderia, fecha_remate, hora_remate, estado,

      // Seguimiento data
      expediente, distrito_judicial, especialidad, instancia,
      organo_juridiccional, nro_convocatoria, fecha_registro,
      procesado_por, reanudado, fase_convocatoria, estado_convocatoria,

      // Detalles data
      juez, especialista, materia, resolucion, fecha_resolucion,
      archivo, tipo_cambio, tasacion, precio_base, incremento_ofertas,
      arancel, oblaje, n_inscritos,

      // Inmuebles data
      partida_registral, tipo_inmueble, direccion, carga_ogravamen,
      porcentaje_rematar,

      // Cronograma data
      actividad, fecha_actividad, fecha_fin,
    } = req.body;

    // Create remate
    const remateId = await createRemate([
      ubicacion,
      precios,
      descripcion,
      categoria,
      N_banos,
      N_habitacion,
      pisina,
      patio,
      cocina,
      cochera,
      balcon,
      jardin,
      pisos,
      comedor,
      sala_start,
      studio,
      lavanderia,
      new Date(), // fecha_activacion
      hora_remate, // hora_activacion
      fecha_remate,
      hora_remate,
      IDadministrador,
      null, // ganador
      0, // like_count
      null, // monto_venta
      estado
    ]);

    // Create seguimiento
    await createSeguimiento([
      expediente || "SIN EXPEDIENTE",
      distrito_judicial || "NO DEFINIDO",
      especialidad || "NO DEFINIDO",
      instancia || "NO DEFINIDO",
      organo_juridiccional || "NO DEFINIDO",
      nro_convocatoria || "NO APLICA",
      fecha_registro || new Date(), // O un valor válido
      estado_convocatoria || "PENDIENTE",
      fase_convocatoria || "INICIAL",
      procesado_por || "DESCONOCIDO",
      reanudado || "NO",
      remateId
    ]);

    // Create detalles
    await createDetalles([
      expediente,
      distrito_judicial,
      organo_juridiccional,
      instancia,
      juez,
      especialista,
      materia,
      resolucion,
      fecha_resolucion,
      archivo,
      nro_convocatoria,
      tipo_cambio,
      tasacion,
      precio_base,
      incremento_ofertas,
      arancel,
      oblaje,
      descripcion,
      n_inscritos,
      remateId
    ]);

    // Create inmuebles
    await createInmuebles([
      partida_registral,
      tipo_inmueble,
      direccion,
      carga_ogravamen,
      porcentaje_rematar,
      remateId
    ]);

    // Create cronograma
    await createCronograma([
      actividad,
      fecha_actividad,
      fecha_fin,
      remateId
    ]);

    // Process images and anexo
    if (req.files && req.files["photo"]) {
      const imagenes = req.files["photo"].map(file => [
        file.buffer,
        remateId
      ]);
      await agregarImagenes(imagenes);
    }

    if (anexo_url) {
      await agregarAnexoUrl(anexo_url, remateId);
    }

    res.status(200).json({ success: true, message: "Remate creado exitosamente" });
  } catch (error) {
    console.error("Error al crear el remate:", error);
    res.status(500).json({
      success: false,
      message: "Error al crear el remate",
      error: error.message
    });
  }
};

// Actualizar un remate existente
exports.updateRemate = async (req, res) => {
  try {
    const remateId = req.params.id;
    const {
      ubicacion,
      precios,
      descripcion,
      categoria,
      N_banos,
      N_habitacion,
      pisina,
      patio,
      cocina,
      cochera,
      balcon,
      jardin,
      pisos,
      comedor,
      sala_start,
      studio,
      lavanderia,
      fecha_remate,
      hora_remate,
      estado,
      tamano_propiedad,
    } = req.body;

    const success = await updateRemate(remateId, [
      ubicacion,
      precios,
      descripcion,
      categoria,
      N_banos,
      N_habitacion,
      pisina,
      patio,
      cocina,
      cochera,
      balcon,
      jardin,
      pisos,
      comedor,
      sala_start,
      studio,
      lavanderia,
      fecha_remate,
      hora_remate,
      estado,
      tamano_propiedad,
    ]);

    if (success) {
      // Procesar la URL del anexo
      if (req.body.anexo_url) {
        const anexoUrl = req.body.anexo_url;
        await agregarAnexoUrl(anexoUrl, remateId);
      }

      res.json({ success: true, message: "Remate actualizado correctamente" });
    } else {
      res.status(404).json({ success: false, error: "Remate no encontrado" });
    }
  } catch (error) {
    console.error("Error al actualizar el remate:", error);
    res.status(500).json({
      message: "Hubo un problema al actualizar el remate",
      error: error.message,
    });
  }
};

// Actualizar seguimiento
exports.updateSeguimiento = async (req, res) => {
  try {
    const remateId = req.params.id;
    const {
      expediente,
      distrito_judicial,
      especialidad,
      instancia,
      organo_juridiccional,
      nro_convocatoria,
      fecha_registro,
      procesado_por,
      reanudado,
      fase_convocatoria,
      estado_convocatoria,
    } = req.body;

    await updateSeguimiento(remateId, [
      expediente,
      distrito_judicial,
      especialidad,
      instancia,
      organo_juridiccional,
      nro_convocatoria,
      fecha_registro,
      procesado_por,
      reanudado,
      fase_convocatoria,
      estado_convocatoria,
    ]);

    res.json({ success: true, message: "Seguimiento actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el seguimiento:", error);
    res.status(500).json({
      message: "Hubo un problema al actualizar el seguimiento",
      error: error.message,
    });
  }
};

// Actualizar detalles
exports.updateDetalles = async (req, res) => {
  try {
    const remateId = req.params.id;
    const {
      expediente,
      distrito_judicial,
      organo_juridiccional,
      instancia,
      juez,
      especialista,
      materia,
      resolucion,
      fecha_resolucion,
      archivo,
      nro_convocatoria,
      tipo_cambio,
      tasacion,
      precio_base,
      incremento_ofertas,
      arancel,
      oblaje,
      descripcion,
      n_inscritos,
    } = req.body;

    await updateDetalles(remateId, [
      expediente,
      distrito_judicial,
      organo_juridiccional,
      instancia,
      juez,
      especialista,
      materia,
      resolucion,
      fecha_resolucion,
      archivo,
      nro_convocatoria,
      tipo_cambio,
      tasacion,
      precio_base,
      incremento_ofertas,
      arancel,
      oblaje,
      descripcion,
      n_inscritos,
    ]);

    res.json({ success: true, message: "Detalles actualizados correctamente" });
  } catch (error) {
    console.error("Error al actualizar los detalles:", error);
    res.status(500).json({
      message: "Hubo un problema al actualizar los detalles",
      error: error.message,
    });
  }
};

// Actualizar inmuebles
exports.updateInmuebles = async (req, res) => {
  try {
    const remateId = req.params.id;
    const {
      partida_registral,
      tipo_inmueble,
      direccion,
      carga_ogravamen,
      porcentaje_rematar,
    } = req.body;

    await updateInmuebles(remateId, [
      partida_registral,
      tipo_inmueble,
      direccion,
      carga_ogravamen,
      porcentaje_rematar,
    ]);

    res.json({ success: true, message: "Inmuebles actualizados correctamente" });
  } catch (error) {
    console.error("Error al actualizar los inmuebles:", error);
    res.status(500).json({
      message: "Hubo un problema al actualizar los inmuebles",
      error: error.message,
    });
  }
};

// Actualizar cronograma
exports.updateCronograma = async (req, res) => {
  try {
    const remateId = req.params.id;
    const {
      actividad,
      fecha_actividad,
      fecha_fin,
    } = req.body;

    await updateCronograma(remateId, [
      actividad,
      fecha_actividad,
      fecha_fin,
    ]);

    res.json({ success: true, message: "Cronograma actualizado correctamente" });
  } catch (error) {
    console.error("Error al actualizar el cronograma:", error);
    res.status(500).json({
      message: "Hubo un problema al actualizar el cronograma",
      error: error.message,
    });
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
      res.json({ success: false, error: "Remate no encontrado." });
    }
  } catch (error) {
    console.error("Error al eliminar el remate:", error);
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
    console.error("Error al obtener los datos del remate:", error);
    res.status(500).json({ error: "Error al obtener los datos del remate" });
  }
};
