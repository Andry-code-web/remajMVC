const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Admin{
    static async create(adminData){
        const hashedPassword = await bcrypt.hash(adminData.contrasena, 10);
        const  [result] = await db.execute(
            'INSERT INTO administradosres (nombre, corre, contrasena) VALUES (?, ?, ?)',
            [adminData.nombre, adminData.correo, hashedPassword]
        );
        return result.insertId;
    }
    static async findByEmail(corre){
        const [rows] = await db.execute(
            'SELECT * FROM administradores  WHERE correo = ?',
            [correo]
        );
        return rows[0];
    }
    static async validPassword(correo, contrasena){
        const admin = await this.findByEmail(correo);
        if (admin){
            const validPassword = await bcrypt.compare(contrasena, admin.contrasena);
            return validPassword;
        }
        return this.validPassword;
    }
    static async getAllUsers(){
        const [rows] = await db.execute('SELECT * FROM usuarios');
        return rows;
    }
    static async deleteUser(userId){
        await db.execute('DELETE FROM usuarios WHERE id = ?', [userId]);
    }
}

module.exports = Admin;
