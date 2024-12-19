const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    static async create(userData) {
        const hashedPassword = await bcrypt.hash(userData.contrasena, 10);
        const [result] = await db.execute(
            'INSERT INTO usuario (nombre, correo, contrasena) VALUES (?, ?, ?)',
            [userData.nombre, userData.correo, hashedPassword]
        );
        return result.insertId;
    }
    static async findByEmail(correo) {
        const [rows] = await db.execute(
            'SELECT * FROM usuario WHERE correro = ?',
        );
        return rows[0];
    }
    static async validPassword(correo, contrasena) {
        const user = await this.findByEmail(correo);
        if (user) {
            const validPassword = await bcrypt.compare(contrasena, user.contrasena);
            return validPassword;
        }
        return false;
    }
}

module.exports = User;
