const express = require('express');
const router = express.Router();
const compraVentaController = require('../controllers/compra_venta.controller');

// Ruta para comprar
router.get('/', compraVentaController.getAllcomprar);

// Ruta para vender
router.get('/', compraVentaController.getAllvender);

module.exports = router;
