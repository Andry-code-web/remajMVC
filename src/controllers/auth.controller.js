const User = require('../models/user.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();  // Cargar las variables de entorno

exports.register_vista = async (req, res) => {
  try {
    res.render('layouts/main', {
      content: 'auth/register'
    });
  } catch (error) {
    console.error('No se encontró la vista: ', error);
  }
};

exports.register = async (req, res) => {
  try {
    const { nombre_apellidos, email, contrasena } = req.body;

    if (!contrasena) {
      return res.status(400).json({ message: "La contraseña es requerida." });
    }

    // Encriptar la contraseña
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // Crear al usuario
    const userData = { ...req.body, contrasena: hashedPassword };
    const userId = await User.create(userData);

    // Verificar que JWT_SECRET está definido
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET no está definido");
    }

    const token = jwt.sign({ id: userId }, secret, { expiresIn: '1h' });
    res.status(201).json({ message: "Registro exitoso", token });
  } catch (error) {
    console.error("Error en el registro:", error);

    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ message: "El correo o usuario ya está registrado." });
    }

    res.status(500).json({ message: "Error en el registro", error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { correo, contrasena } = req.body;
    const user = await User.findByEmail(correo);

    if (!user || !await bcrypt.compare(contrasena, user.contrasena)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Verificar que JWT_SECRET está definido
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET no está definido");
    }

    const token = jwt.sign({ id: user.id }, secret, { expiresIn: '1h' });
    res.json({ token });
  } catch (error) {
    console.error('Error en el login:', error);
    res.status(500).json({ error: error.message });
  }
};