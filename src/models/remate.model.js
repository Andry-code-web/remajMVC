const db = require('../config/database');

class Property {
  static async fetchAll() {
    const [rows, fields] = await db.execute('SELECT * FROM properties');
    return rows;
  }
}

module.exports = Property;
