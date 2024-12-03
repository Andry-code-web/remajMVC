const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    // Generar la contraseña encriptada
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10);

    // Query con columnas explícitas
    const sql = `
      INSERT INTO usuarios (
        nombres_apellidos, dni, correo, confirmar_correo, fecha_nacimiento, 
        sexo, estado_civil, celular, departamento, provincia, distrito, 
        direccion, usuario, contrasena, terminos_condiciones
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

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
      hashedPassword, // La contraseña es requerida y se genera
      userData.terminos_condiciones ? 1 : 0 // Manejar boolean como entero para MySQL
  ];
  console.log("Datos recibidos:", userData);


    // Ejecutar el query
    const [result] = await db.execute(sql, values);
    return result.insertId;
  }

  static async findByEmail(correo) {
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );
    return rows[0];
  }
}

module.exports = User;