const db = require('../config/database');

class Home {
    static async getAll() {
        const [row] = await db.execute('SELECT * FROM remates');
        return row;
    }
}


module.exports = Home;