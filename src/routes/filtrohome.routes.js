const express = require('express');
const router = express.Router();
const filtrohomeController = require('../controllers/filtrohome.controller'); // Asegúrate de la ruta correcta

// Ruta para filtrar remates
router.get('/filtrar/remates', filtrohomeController.filtrarRemates);

module.exports = router;


/* const express = require('express');
const router = express.Router();
const filtroHomeController = require('../controllers/filtrohome.controller');

router.get('/', filtroHomeController.getFiltarRemates);

module.exports = router;
 */