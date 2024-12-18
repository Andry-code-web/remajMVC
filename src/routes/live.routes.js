// live.routes.js
const express = require('express');
const router = express.Router();
const liveController = require('../controllers/live.controller');

router.get('/', liveController.getAllLive);
router.get('/', liveController.getInmueblesByAuctionId);
router.get('/', liveController.getCronogramaByAuctionId);

module.exports = router;
