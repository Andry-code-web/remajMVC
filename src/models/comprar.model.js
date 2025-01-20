const db = require('../config/database');
 
const quierocomprar = async (data) => {
    const { tipo_cliente, nombre, apellido, telefono, correo_electronico, departamento, ciudad, productos_interes } = data;
    const query = `
        INSERT INTO usuarios_comprar (tipo_cliente, nombre, apellido, telefono, correo_electronico, departamento, ciudad, productos_interes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `;
    await db.execute(query, [tipo_cliente, nombre, apellido, telefono, correo_electronico, departamento, ciudad, productos_interes]);
};

module.exports = {
    quierocomprar,
}