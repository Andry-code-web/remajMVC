const express = require('express');
const router = express.Router();
const loginAdminController = require('../controllers/admin_general.controller');

router.get('/index', loginAdminController.getAllAdminGeneral);

module.exports = router;
