const express = require('express');
const router = express.Router();
const enVivoController = require('../controllers/en_vivo.controller');

// Rutas principales
router.get("/", enVivoController.getEnVivo);
router.get("/seguimiento/:id", enVivoController.getSeguimiento);
router.get("/detalles/:id", enVivoController.getDetalles);
router.get("/inmuebles/:id", enVivoController.getInmuebles);
router.get("/cronograma/:id", enVivoController.getCronograma);
router.get('/pdf/:id', enVivoController.getPdf);

module.exports = router;