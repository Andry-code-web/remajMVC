const db = require('../config/database');

    class Live {
        static async getAll() {
            const [row] = await db.execute("SELECT * FROM remajud.remates WHERE estado = 'en_curso'")
            return row
        }
    }
    
module.exports = Live;