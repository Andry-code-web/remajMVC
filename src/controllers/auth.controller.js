const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

// Registro
exports.register_vista = async (req, res) => {
  try {
    res.render('layouts/auth', {
      content: 'auth/register'
    });
  } catch (error) {
    console.error('No se encontró la vista: ', error);
    res.status(500).render('error', { message: 'Error al cargar la página de registro' });
  }
};

exports.register = async (req, res) => {
  try {
    const { nombre_apellidos, correo, usuario, contrasena, terminos_condiciones } = req.body;

    if (!nombre_apellidos || !correo || !usuario || !contrasena) {
      return res.status(400).json({ message: "Todos los campos son requeridos." });
    }

    if (!terminos_condiciones) {
      return res.status(400).json({ message: "Debe aceptar los términos y condiciones." });
    }

    const existingUser = await User.findByUsername(usuario);
    if (existingUser) {
      return res.status(400).json({ message: "El nombre de usuario ya está en uso." });
    }

    
    const userId = await User.create(req.body);

    res.status(201).json({ message: "Registro exitoso" });
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ message: "Error en el registro", error: error.message });
  }
};

//Login
exports.login_vista = async (req, res) => {
  try {
    if (req.cookies.auth_token) {
      return res.redirect('/');
    }
    res.render('layouts/auth', {
      content: 'auth/login'
    });
  } catch (error) {
    console.error('Error al cargar la vista de login:', error);
    res.status(500).render('error', { message: 'Error al cargar la página de login' });
  }
};

exports.login = async (req, res) => {
  try {
    const { usuario, contrasena } = req.body;

    if (!usuario || !contrasena) {
      return res.status(400).json({ message: "Usuario y contraseña son requeridos." });
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

    res.redirect('/');
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error en el login.", error: error.message });
  }
};



exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.redirect('/');
    }
    res.clearCookie('connect.sid'); 
    res.redirect('/');
  });
};


// Recuperar contraseña
exports.forgotPassword_vista = async (req, res) => {
  try {
    res.render('layouts/auth', {
      content: 'auth/recuContra'
    });
  } catch (error) {
    console.error('Error al cargar la vista de recuperación:', error);
    res.status(500).render('error', { message: 'Error al cargar la página de recuperación' });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(404).json({ message: "No existe una cuenta con este correo electrónico." });
    }

    const resetToken = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '1h' }
    );

    // Actualizar usuario con el token
    await User.updateResetToken(user.id, resetToken);

    res.json({
      success: true,
      message: "Se han enviado las instrucciones a tu correo electrónico."
    });

  } catch (error) {
    console.error("Error en recuperación de contraseña:", error);
    res.status(500).json({ message: "Error al procesar la solicitud." });
  }
};


// Editar Usuario
// Editar Usuario
exports.editUser_vista = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.redirect('/auth/login');
    }

    const usuario = req.params.usuario || req.session.user.usuario;
    const user = await User.findByUsername(usuario);
    if (!user) {
      return res.redirect('/auth/login');
    }
    res.render('layouts/auth', {
      content: 'auth/editUsuario',
      userData: user,
      usuario
    });
  } catch (error) {
    console.error('Error al cargar la vista de edición:', error);
    res.status(500).render('error', { message: 'Error al cargar la página de edición' });
  }
};

exports.updateUser = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "No autorizado" });
    }

    const { 
      usuario,
      correo, 
      confirmar_correo,
      celular,
    } = req.body;

    // Validar datos
    if (!nombre_apellidos || !correo) {
      return res.status(400).json({ message: "Nombre y correo son requeridos." });
    }

    // Actualizar usuario
    await User.update(req.session.user.id, {
      usuario,
      correo,
      confirmar_correo,
      celular,
    });

    res.json({ 
      success: true, 
      message: "Perfil actualizado correctamente" 
    });

  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    res.status(500).json({ message: "Error al actualizar el perfil." });
  }
};