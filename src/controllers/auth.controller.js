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
    const token = jwt.sign({ id: userId, usuario }, process.env.JWT_SECRET, { expiresIn: '1h' });
    
    res.cookie('auth_token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hora
    });
    
    res.status(201).json({ message: "Registro exitoso", redirect: '/' });
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

    const token = jwt.sign(
      { 
        id: user.id, 
        usuario: user.usuario,
        nombre: user.nombres_apellidos 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: '1h' }
    );

    res.cookie('auth_token', token, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000 // 1 hora
    });

    res.redirect('/');
  } catch (error) {
    console.error("Error en el login:", error);
    res.status(500).json({ message: "Error en el login.", error: error.message });
  }
};

exports.logout = (req, res) => {
  res.clearCookie('auth_token');
  res.redirect('/');
};