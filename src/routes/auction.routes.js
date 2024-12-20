// routes/auction.routes.js
const express = require('express');
const router = express.Router();
const auctionController = require('../controllers/auction.controller');
const authMiddleware = require('../middleware/auth.middleware');

const app = express();

// Configura setUserLocals globalmente
app.use(authMiddleware.setUserLocals);

router.get('/:id', auctionController.getAuctionDetails);
router.post('/:id/join', authMiddleware.isAuthenticated, auctionController.joinAuction);
router.post('/:id/bid', authMiddleware.isAuthenticated, auctionController.submitBid);
router.post('/:id/message', authMiddleware.isAuthenticated, auctionController.submitMessage);
router.post('/check-opportunities', authMiddleware.isAuthenticated, auctionController.checkOpportunities);
router.get('/:id/top-bids', auctionController.getTopBids);

module.exports = router;
