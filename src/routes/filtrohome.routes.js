const express = require('express');
const router = express.Router();
const filtroHomeController = require('../controllers/filtrohome.controller');

router.get('/', filtroHomeController.getFiltarRemates);

module.exports = router;
