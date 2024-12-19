const db = require('../config/database')
const bcrypt = require('bcryptjs');

class User_admin {
    static async create(adminData) {
        const hashedPassword = await bcrypt.hash(adminData.contrasena, 10);
        const [result] = await db.execute(
            'INSERT INTO  administradores (nombre, correo, constrasena) vALUE (?, ?, ?)',
            [adminData.nombre, adminData.correo, hashedPassword]
        );
        return result.insertId;
    }
    static async findById(id) {
        const [rows] = await db.execute(
            'SELECT * FROM administradores WHER id = ?',
            [id]
        );
        return rows[0];
    }
    static async findAll() {
        const [rows] = await db.execute(
            'SELECT * FROM administradores');
        return rows;
    }
    static async update(adminData) {
        const hashedPassword = adminData.contrasena ? await bcrypt.hash(adminData.contrasena, 10) : null;
        await db.execute(
            'UPDATE administradores SET nombre = ?, correo = ?, contrasena = COALESCE(?, contrasena) WHERE id = ?',
            [adminData.nombre, adminData.correo, hashedPassword, adminData.id]
        );
    }
    static async delete(id) {
        await db.execute(
            'DELETE FROM administradores WHERE id = ?',
            [id]
        );
    }
    static async findByEmail(correo) {
        const [rows] = await db.execute(
            'SELECT * FROM admisntradoes WHERE correo = ?',
            [correo]
        );
        return rows[0];
    }
    static async validPassword(corre, contrasena) {
        const admin = await this.findByEmail(correo);
        if (admin) {
            const validPassword = await bcrypt.compare(contrasena, admin.contrasena);
            return validPassword;
        }
        return false;
    }
}

module.exports = UserAdmin;