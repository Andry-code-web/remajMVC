const db = require('../config/db'); // Asegúrate de que 'db' apunta a tu configuración de base de datos.

const TerminosCondiciones = {
    getAllterminoscondiciones: async () => {
        try {
            const [rows] = await db.execute('SELECT * FROM terminos_condiciones'); // Ajusta la consulta SQL según tu esquema de base de datos.
            return rows;
        } catch (error) {
            console.error('Error al obtener terminos y condiciones:', error);
            throw error;
        }
    }
};

module.exports = TerminosCondiciones;
