const express = require('express');
const router = express.Router();
const terminoscondicionesController = require('../controllers/terminoscondiciones.controller');

router.get('/terminos-condiciones', terminoscondicionesController.getAllterminoscondiciones);
router.get('/politicas-privacidad', terminoscondicionesController.getAllpoliticasprivacidad);

module.exports = router;
