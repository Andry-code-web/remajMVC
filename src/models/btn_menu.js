const db = require('../config/database');
const bcrypt = require('bcryptjs');

class Btn_menu {
    static async create(btn_menuData) {
        const hashedPassword = await bcrypt.hash(btn_menuData.contrasena, 10);
        const [result] = await db.execute(
            'INSERT INTO usuarios SET ?',
            [{ ...btn_menuData, contrasena: hashedPassword }]
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
    static async validatePassword(correo, contrasena) {
        const user = await this.findByEmail(correo);
        if (user) {
            const validPassword = await bcrypt.compare(contrasena, user.contrasena);
            return validPassword;
        }
        return false;
 }
}

module.exports = Btn_menu