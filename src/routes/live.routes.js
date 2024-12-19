// live.routes.js
const express = require('express');
const router = express.Router();
const liveController = require('../controllers/live.controller');

router.get('/', liveController.getAllLive);
router.get('/api/tracking/:id', liveController.getTrackingData);
router.get('/api/details/:id', liveController.getDetailsData);

module.exports = router;
