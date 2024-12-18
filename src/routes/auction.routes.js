const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auction.controller');
const { isAuthenticated } = require('../middleware/auth.middleware');

router.get('/:id', auctionController.getAuctionDetails);
router.post('/:id/bid', isAuthenticated, auctionController.submitBid);
router.post('/:id/message', isAuthenticated, auctionController.submitMessage);
router.post('/:id/join', auctionController.joinAuction);
router.post('/check-opportunities', isAuthenticated, auctionController.checkOpportunities);

module.exports = router;
