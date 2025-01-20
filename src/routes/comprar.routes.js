const express = require('express');
const router = express.Router();
const compraVentaController = require('../controllers/compra_venta.controller');

// Ruta para comprar
router.get('/', compraVentaController.getAllcomprar);

// Ruta para vender
router.get('/', compraVentaController.getAllvender);

// Ruta para manejar el envío del formulario de compra
router.post('/quierocomprar', compraVentaController.postComprar);

module.exports = router;
