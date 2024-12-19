const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10);
    const [result] = await db.execute(
      'INSERT INTO usuarios (nombre, correo, contrasena) VALUES (?, ?, ?)',
      [userData.nombre, userData.correo, hashedPassword]
    );
    return result.insertId;
  }

  static async findById(id) {
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE id = ?',
      [id]
    );
    return rows[0];
  }

  static async findAll() {
    const [rows] = await db.execute('SELECT * FROM usuarios');
    return rows;
  }

  static async update(userData) {
    const hashedPassword = userData.contrasena ? await bcrypt.hash(userData.contrasena, 10) : null;
    await db.execute(
      'UPDATE usuarios SET nombre = ?, correo = ?, contrasena = COALESCE(?, contrasena) WHERE id = ?',
      [userData.nombre, userData.correo, hashedPassword, userData.id]
    );
  }

  static async delete(id) {
    await db.execute(
      'DELETE FROM usuarios WHERE id = ?',
      [id]
    );
  }

  static async findByEmail(correo) {
    const [rows] = await db.execute(
      'SELECT * FROM usuarios WHERE correo = ?',
      [correo]
    );
    return rows[0];
  }

  static async validatePassword(correo, contrasena) {
    const user = await this.findByEmail(correo);
    if (user) {
      const validPassword = await bcrypt.compare(contrasena, user.contrasena);
      return validPassword;
    }
    return false;
  }
}

module.exports = User;
