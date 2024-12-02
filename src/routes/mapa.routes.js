const express = require('express');
const router = express.Router();
const mapaController = require('../controllers/mapa.controller');

router.get('/index',mapaController.getAllmapa);

module.exports = router;