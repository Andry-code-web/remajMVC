const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create(userData) {
    const hashedPassword = await bcrypt.hash(userData.contrasena, 10);
    const [result] = await db.execute(
      'INSERT INTO usuarios SET ?',
      [{...userData, contrasena: hashedPassword}]
    );
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