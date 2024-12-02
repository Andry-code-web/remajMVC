const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auction.controller');
const auth = require('../middleware/auth');

router.get('/', auctionController.getAllAuctions);
router.get('/:id', auth, auctionController.getAuctionDetails);

router.get('/mapa', auctionController.getAllAuctions);

module.exports = router;