const db = require('../config/database');
const bcryptjs = require('bcryptjs');

class User {
  static async create(userData) {
    // Generar la contraseña encriptada con 10 rondas de salt
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(userData.contrasena, salt);

    // Obtener la fecha y hora actuales
    const now = new Date();
    const fechaRegistro = now.toISOString().split("T")[0]; // Fecha en formato YYYY-MM-DD
    const horaRegistro = now.toTimeString().split(" ")[0]; // Hora en formato HH:mm:ss

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
      horaRegistro, // Hora actual
    ];

    console.log("Datos recibidos:", userData);
    console.log("Contraseña hasheada:", hashedPassword);

    // Ejecutar el query
    const [result] = await db.execute(sql, values);
    return result.insertId;
  }

  static async findByUsername(usuario) {
    const [rows] = await db.execute(
      "SELECT * FROM usuarios WHERE usuario = ?",
      [usuario]
    );
    return rows[0];
  }
  
  static async findByEmail(email) {
    const [rows] = await db.execute("SELECT * FROM usuarios WHERE correo = ?", [email]);
    return rows[0];
  }

  /* static async findById(id) {
    const [rows] = await db.execute("SELECT * FROM usuarios WHERE id = ?", [id]);
    return rows[0];
  }
 */
  static async updatePassword(userId, hashedPassword) {
    try {
      await db.execute(
        "UPDATE usuarios SET contrasena = ? WHERE id = ?",
        [hashedPassword, userId]
      );
      return true;
    } catch (error) {
      console.error('Error al actualizar contraseña:', error);
      return false;
    }
  }

  static async findByEmail(email) {
    if (!email) {
      throw new Error("El correo electrónico no puede estar vacío");
    }
  
    const [rows] = await db.execute("SELECT * FROM usuarios WHERE correo = ?", [
      email,
    ]);
    return rows[0];
  }
  

  // aqui va ir model de editar usuario
  static async update(userId, userData) {
    try {
      // Verificar si el correo ya existe para otro usuario
      if (userData.correo) {
        const [existingUser] = await db.execute(
          "SELECT id FROM usuarios WHERE correo = ? AND id != ?",
          [userData.correo, userId]
        );
        if (existingUser.length > 0) {
          throw new Error('El correo electrónico ya está en uso');
        }
      }

      // Verificar si el usuario ya existe para otro usuario
      if (userData.usuario) {
        const [existingUsername] = await db.execute(
          "SELECT id FROM usuarios WHERE usuario = ? AND id != ?",
          [userData.usuario, userId]
        );
        if (existingUsername.length > 0) {
          throw new Error('El nombre de usuario ya está en uso');
        }
      }

      const updateFields = [];
      const values = [];

      if (userData.usuario) {
        updateFields.push('usuario = ?');
        values.push(userData.usuario);
      }
      if (userData.correo) {
        updateFields.push('correo = ?');
        values.push(userData.correo);
      }
      if (userData.confirmar_correocorreo) {
        updateFields.push('confirmar_correo = ?');
        values.push(userData.confirmar_correo);
      }
      if (userData.celular) {
        updateFields.push('celular = ?');
        values.push(userData.celular);
      }

      values.push(userId);

      const sql = `
        UPDATE usuarios 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      const [result] = await db.execute(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      throw error;
    }
  }
}

module.exports = User;