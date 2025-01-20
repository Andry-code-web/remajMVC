const db = require('../config/database');
const bcryptjs = require('bcryptjs');

class User {
  static async create(userData) {
    // Generar la contraseña encriptada con 10 rondas de salt
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(userData.contrasena, salt);

    // Obtener la fecha y hora actuales
    const now = new Date();
    const fechaRegistro = now.toISOString().split('T')[0]; // Fecha en formato YYYY-MM-DD
    const horaRegistro = now.toTimeString().split(' ')[0]; // Hora en formato HH:mm:ss

    // Query con columnas explícitas
    const sql = `
      INSERT INTO usuarios (
        nombres_apellidos, dni, correo, confirmar_correo, fecha_nacimiento, 
        sexo, estado_civil, celular, departamento, provincia, distrito, 
        direccion, usuario, contrasena, terminos_condiciones, fecha_registro, hora_registro
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const terminosCondiciones = userData.terminos_condiciones ? 1 : 0; // Convertir true/false a 1/0

    const values = [
      userData.nombre_apellidos || null,
      userData.dni || null,
      userData.correo || null,
      userData.confirmar_correo || null,
      userData.fecha_nacimiento || null,
      userData.sexo || null,
      userData.estado_civil || null,
      userData.celular || null,
      userData.departamento || null,
      userData.provincia || null,
      userData.distrito || null,
      userData.direccion || null,
      userData.usuario || null,
      hashedPassword,
      terminosCondiciones,
      fechaRegistro, // Fecha actual
      horaRegistro   // Hora actual
    ];
    
    console.log("Datos recibidos:", userData);
    console.log("Contraseña hasheada:", hashedPassword);

    // Ejecutar el query
    const [result] = await db.execute(sql, values);
    return result.insertId;
}


  static async findByUsername(usuario) {
    const [rows] = await db.execute('SELECT * FROM usuarios WHERE usuario = ?', [usuario]);
    return rows[0];
  }
}


module.exports = User;