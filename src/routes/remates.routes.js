const express = require('express');
const router = express.Router();
const rematesController = require('../controllers/remate.controller');

router.get('/index', rematesController.getAllremates);
// Ruta para obtener todos los remates o filtrados por categoría
router.get('/', rematesController.getAllremates);

// Ruta para obtener un remate específico por ID
router.get('/:id', rematesController.getRemateById);

module.exports = router;