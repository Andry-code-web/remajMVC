const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');

router.get('/', homeController.getAllRemates);
router.get('/remate/:id', homeController.getRemateDetails);
router.get('/anexos/:id', homeController.getAnexos);
router.post('/filtrar', homeController.getFiltrarRemate);
router.get('/filtrarG', homeController.getFiltrarRemateG);



module.exports = router;