class BidHandler {
    constructor(socketHandler, currentBid) {
      this.socketHandler = socketHandler;
      this.currentBid = currentBid;
      this.setupListeners();
    }
  
    setupListeners() {
      this.socketHandler.on('bid-accepted', (data) => {
        this.currentBid = data.amount;
        this.updateBidDisplay(data.amount);
      });
  
      this.socketHandler.on('bid-rejected', (data) => {
        Swal.fire({
          title: 'Error',
          text: data.message,
          icon: 'error'
        });
      });
    }
  
    submitBid(amount, auctionId, userId) {
      if (amount <= this.currentBid) {
        Swal.fire({
          title: 'Error',
          text: 'La oferta debe ser mayor que la oferta actual',
          icon: 'error'
        });
        return;
      }
  
      this.socketHandler.emit('submit-bid', {
        amount,
        auctionId,
        userId,
        timestamp: new Date().toISOString()
      });
    }
  
    updateBidDisplay(amount) {
      const bidDisplay = document.getElementById('current-bid');
      if (bidDisplay) {
        bidDisplay.textContent = `Oferta Actual: S/. ${amount.toLocaleString()}`;
      }
    }
  }
  
  export default BidHandler;