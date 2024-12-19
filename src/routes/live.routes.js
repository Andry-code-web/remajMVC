// live.routes.js
const express = require('express');
const router = express.Router();
const liveController = require('../controllers/live.controller');

router.get('/', liveController.getAllLive);
module.exports = router;
