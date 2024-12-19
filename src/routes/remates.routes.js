const express = require('express');
const router = express.Router();
const rematesController = require('../controllers/remate.controller');

router.get('/index',rematesController. getAllremates);

module.exports = router;