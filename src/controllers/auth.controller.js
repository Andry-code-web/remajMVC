const User = require("../models/user.model");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
require("dotenv").config();

// Registro
exports.register_vista = async (req, res) => {
  try {
    res.render("layouts/auth", {
      content: "auth/register",
    });
  } catch (error) {
    console.error("No se encontró la vista: ", error);
    res
      .status(500)
      .render("error", { message: "Error al cargar la página de registro" });
  }
};

exports.register = async (req, res) => {
  try {
    const {
      nombre_apellidos,
      correo,
      usuario,
      contrasena,
      terminos_condiciones,
    } = req.body;

    if (!nombre_apellidos || !correo || !usuario || !contrasena) {
      return res
        .status(400)
        .json({ message: "Todos los campos son requeridos." });
    }

    if (!terminos_condiciones) {
      return res
        .status(400)
        .json({ message: "Debe aceptar los términos y condiciones." });
    }

    const existingUser = await User.findByUsername(usuario);
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "El nombre de usuario ya está en uso." });
    }

    const userId = await User.create(req.body);

    res.status(201).json({ message: "Registro exitoso" });
  } catch (error) {
    console.error("Error en el registro:", error);
    res
      .status(500)
      .json({ message: "Error en el registro", error: error.message });
  }
};

//Login
exports.login_vista = async (req, res) => {
  try {
    if (req.cookies.auth_token) {
      return res.redirect("/");
    }
    res.render("layouts/auth", {
      content: "auth/login",
    });
  } catch (error) {
    console.error("Error al cargar la vista de login:", error);
    res
      .status(500)
      .render("error", { message: "Error al cargar la página de login" });
  }
};

exports.login = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res
        .status(400)
        .json({ message: "Usuario y contraseña son requeridos." });
    }

    const user = await User.findByUsername(usuario);
    if (!user) {
      return res.status(401).json({ message: "Usuario no encontrado." });
    }

    const isMatch = await bcryptjs.compare(contrasena, user.contrasena);
    if (!isMatch) {
      return res.status(401).json({ message: "Contraseña incorrecta." });
    }

    // Guardar usuario en la sesión
    req.session.user = {
      id: user.id,
      usuario: user.usuario,
    };

    console.log("Usuario guardado en la sesión:", req.session.user);

    res.redirect("/");
  } catch (error) {
    console.error("Error en el login:", error);
    res
      .status(500)
      .json({ message: "Error en el login.", error: error.message });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect("/");
    }
    res.clearCookie("connect.sid");
    res.redirect("/");
  });
};

// Recuperar contraseña
exports.forgotPassword_vista = async (req, res) => {
  try {
    res.render("layouts/auth", {
      content: "auth/recuContra",
    });
  } catch (error) {
    console.error("Error al cargar la vista de recuperación:", error);
    res
      .status(500)
      .render("error", {
        message: "Error al cargar la página de recuperación",
      });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No existe una cuenta con este correo electrónico."
      });
    }

    res.json({
      success: true,
      message: "Email verificado correctamente.",
    });
  } catch (error) {
    console.error("Error en recuperación de contraseña:", error);
    res.status(500).json({
      success: false,
      message: "Error al procesar la solicitud."
    });
  }
};

// Controlador para restablecer la contraseña
exports.resetPassword = async (req, res) => {
  try {
    const { email, password, confirmPassword } = req.body;
    
    console.log('Datos recibidos:', { email, password: '***', confirmPassword: '***' });

    if (!email || !password || !confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Todos los campos son obligatorios." 
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ 
        success: false,
        message: "Las contraseñas no coinciden." 
      });
    }

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: "Usuario no encontrado." 
      });
    }

    const hashedPassword = await bcryptjs.hash(password, 10);
    const updated = await User.updatePassword(user.id, hashedPassword);

    if (!updated) {
      return res.status(500).json({ 
        success: false,
        message: "Error al actualizar la contraseña." 
      });
    }

    res.json({ 
      success: true, 
      message: "Contraseña restablecida con éxito." 
    });
  } catch (error) {
    console.error("Error al restablecer contraseña:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al procesar la solicitud." 
    });
  }
};

// Controlador para Editar Usuario
// Controlador para Editar Usuario
exports.editUser_vista = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect("/auth/login");
    }

    const usuario = req.params.usuario || req.session.user.usuario;
    const user = await User.findByUsername(usuario);
    if (!user) {
      return res.redirect("/auth/login");
    }
    res.render("layouts/auth", {
      content: "auth/editUsuario",
      userData: user,
      usuario,
    });
  } catch (error) {
    console.error("Error al cargar la vista de edición:", error);
    res
      .status(500)
      .render("error", { message: "Error al cargar la página de edición" });
  }
};

// Actualizar Usuario
exports.updateUser = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ 
        success: false,
        message: "No autorizado" 
      });
    }

    const { usuario, correo, confirmar_correo, celular } = req.body;

    // Validar datos
    if (!usuario || !correo || !confirmar_correo || !celular) {
      return res.status(400).json({ 
        success: false,
        message: "Todos los campos son requeridos." 
      });
    }

    if (correo !== confirmar_correo) {
      return res.status(400).json({ 
        success: false,
        message: "Los correos electrónicos no coinciden." 
      });
    }

    // Validar teléfono
    const phoneRegex = /^9\d{8}$/;
    if (!phoneRegex.test(celular)) {
      return res.status(400).json({ 
        success: false,
        message: "El número de teléfono debe comenzar con 9 y tener 9 dígitos." 
      });
    }

    try {
      // Actualizar usuario
      await User.update(req.session.user.id, {
        usuario,
        correo,
        celular,
      });

      // Actualizar la sesión con los nuevos datos
      req.session.user = {
        ...req.session.user,
        usuario,
        correo,
        celular,
      };

      res.json({
        success: true,
        message: "Perfil actualizado correctamente",
      });
    } catch (error) {
      if (error.message.includes('correo electrónico ya está en uso')) {
        return res.status(400).json({ 
          success: false,
          message: "El correo electrónico ya está registrado." 
        });
      }
      if (error.message.includes('nombre de usuario ya está en uso')) {
        return res.status(400).json({ 
          success: false,
          message: "El nombre de usuario ya está en uso." 
        });
      }
      throw error;
    }
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ 
      success: false,
      message: "Error al actualizar el perfil." 
    });
  }
};