const express = require('express');
const router = express.Router();
const btn_menuController = require('../controllers/btn_menu.controller');

router.get('/index', btn_menuController.getAllBtn_menu);

module.exports = router;
