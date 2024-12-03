const express = require('express');
const router = express.Router();
const homeContraller = require('../controllers/home.controller');

router.get('/', homeContraller.getAllRemates);


module.exports = router;