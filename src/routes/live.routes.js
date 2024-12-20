const express = require('express');
const router = express.Router();
const liveController = require('../controllers/live.controller');

router.get('/', liveController.getAllLive);

// Ruta para mostrar la subasta
router.get('/subasta/:id', liveController.getSubastaDetails);

// Ruta para mostrar los detalles de la subasta
router.get('/detalles/:id', liveController.getSubastaDetalles);

// Ruta para mostrar el cronograma de la subasta
router.get('/cronograma/:id', liveController.getSubastaCronograma);


module.exports = router;
