const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');

router.get('/', homeController.getAllRemates);
router.get('/filtrar', homeController.getFiltarRemates); // Cambia a GET

module.exports = router;
