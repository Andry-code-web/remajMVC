const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcryptjs = require('bcryptjs');
require('dotenv').config();

exports.register_vista = async (req, res) => {
  try {
    res.render('layouts/main', {
      content: 'auth/register'
    });
  } catch (error) {
    console.error('No se encontró la vista: ', error);
    res.status(500).render('error', { message: 'Error al cargar la página de registro' });
  }
};

exports.register = async (req, res) => {
  try {
    const { nombre_apellidos, correo, usuario, contrasena } = req.body;

    if (!nombre_apellidos || !correo || !usuario || !contrasena) {
      return res.status(400).json({ message: "Todos los campos son requeridos." });
    }

    const existingUser = await User.findByUsername(usuario);
    if (existingUser) {
      return res.status(400).json({ message: "El nombre de usuario ya está en uso." });
    }

    const userId = await User.create(req.body);

    // Almacena los datos del usuario en la sesión
    req.session.user = {
      id: userId,
      nombre: nombre_apellidos,
      usuario
    };

    res.status(201).redirect('/');
  } catch (error) {
    console.error("Error en el registro:", error);
    res.status(500).json({ message: "Error en el registro", error: error.message });
  }
};


exports.login_vista = async (req, res) => {
  try {
    if (req.cookies.auth_token) {
      return res.redirect('/');
    }
    res.render('auth/login');
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
    res.clearCookie('connect.sid'); // Si usas el nombre predeterminado de cookie de sesión
    res.redirect('/');
  });
};

