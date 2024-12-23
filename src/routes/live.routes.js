const express = require('express');
const router = express.Router();
const liveController = require('../controllers/live.controller');


router.get("/", liveController.getEnVivo);
router.get("/seguimiento/:id", liveController.getSeguimiento);
router.get("/detalles/:id", liveController.getDetalles);
router.get("inmuebles/:id", liveController.getInmuebles);
router.get("/cronograma/:id", liveController.getCronograma);
router.get('/pdf/:id', liveController.getPdf);
module.exports = router;
