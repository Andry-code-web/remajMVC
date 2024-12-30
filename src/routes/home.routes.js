const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');
 
router.get('/', homeController.getAllRemates);
router.get('/remate/:id', homeController.getRemateDetails);

module.exports = router;
