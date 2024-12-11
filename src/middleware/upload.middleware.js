const multer = require("multer");

// Configuración para almacenar archivos como buffers
const storage = multer.memoryStorage();
const upload = multer({ storage });

module.exports = upload;