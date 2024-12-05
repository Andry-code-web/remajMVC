const express = require('express');
const router = express.Router();
const erroresController = require('../controllers/error404.controller');

router.get('/error404', erroresController.getAllerrores);

module.exports = router;