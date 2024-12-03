import SocketHandler from './socket-handler.js';
import BidHandler from './bid-handler.js';
import ChatHandler from './chat-handler.js';
import TimerHandler from './timer-handler.js';

class AuctionChat {
  constructor(auctionId, userId, currentBid) {
    this.auctionId = auctionId;
    this.userId = userId;
    this.currentBid = currentBid;
    
    this.socketHandler = new SocketHandler(io());
    this.bidHandler = new BidHandler(this.socketHandler, currentBid);
    this.chatHandler = new ChatHandler(this.socketHandler);
    this.timerHandler = new TimerHandler(this.socketHandler);
    
    this.setupEventListeners();
    this.joinAuction();
  }

  joinAuction() {
    this.socketHandler.join({
      room: `auction-${this.auctionId}`,
      userId: this.userId
    });
  }

  setupEventListeners() {
    const bidForm = document.getElementById('bid-form');
    const quickBidForm = document.getElementById('quick-bid-form');
    const messageForm = document.getElementById('message-form');

    if (bidForm) {
      bidForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const bidInput = document.getElementById('bid-amount');
        const amount = parseFloat(bidInput.value);
        
        this.bidHandler.submitBid(amount, this.auctionId, this.userId);
        bidInput.value = '';
      });
    }

    if (quickBidForm) {
      quickBidForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const quickAmount = this.currentBid + 1000;
        this.bidHandler.submitBid(quickAmount, this.auctionId, this.userId);
      });
    }

    if (messageForm) {
      messageForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const messageInput = document.getElementById('message-input');
        const message = messageInput.value.trim();
        
        this.chatHandler.sendMessage(message, this.auctionId, this.userId);
        messageInput.value = '';
      });
    }
  }
}

export default AuctionChat;