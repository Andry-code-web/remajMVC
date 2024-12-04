const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auction.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

router.get('/:id', auctionController.getAuctionDetails);
router.post('/:id/bid', isAuthenticated, auctionController.submitBid);
router.post('/:id/message', isAuthenticated, auctionController.submitMessage);

module.exports = router;