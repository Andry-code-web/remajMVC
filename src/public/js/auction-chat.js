class AuctionChat {
  constructor(auctionId, userId, currentBid) {
    this.auctionId = auctionId;
    this.userId = userId;
    this.currentBid = currentBid;
    this.socket = io();
    
    this.initializeSocket();
    this.initializeEventListeners();
  }

  initializeSocket() {
    this.socket.emit('join', {
      room: `auction-${this.auctionId}`,
      userId: this.userId
    });
    
    this.socket.on('bid-accepted', (data) => {
      this.updateCurrentBid(data.amount);
      this.addBidMessage(data);
    });
    
    this.socket.on('chat-message', (data) => {
      this.addChatMessage(data);
    });
  }

  initializeEventListeners() {
    const bidForm = document.getElementById('bid-form');
    const quickBidForm = document.getElementById('quick-bid-form');
    const messageForm = document.getElementById('message-form');

    if (bidForm) {
      bidForm.addEventListener('submit', (e) => this.handleBid(e));
    }

    if (quickBidForm) {
      quickBidForm.addEventListener('submit', (e) => this.handleQuickBid(e));
    }

    if (messageForm) {
      messageForm.addEventListener('submit', (e) => this.handleMessage(e));
    }
  }

  updateCurrentBid(amount) {
    const bidDisplay = document.getElementById('current-bid');
    if (bidDisplay) {
      bidDisplay.textContent = `Oferta Actual: S/. ${amount.toLocaleString()}`;
    }
    this.currentBid = amount;
  }

  addBidMessage(data) {
    const messages = document.getElementById('chat-messages');
    if (messages) {
      const message = document.createElement('div');
      message.className = 'chat-message bid-message';
      message.textContent = `Nueva oferta: S/. ${data.amount.toLocaleString()}`;
      messages.appendChild(message);
      messages.scrollTop = messages.scrollHeight;
    }
  }

  addChatMessage(data) {
    const messages = document.getElementById('chat-messages');
    if (messages) {
      const message = document.createElement('div');
      message.className = `chat-message ${data.userId === this.userId ? 'own-message' : ''}`;
      message.innerHTML = `
        <div class="message-header">
          <span class="username">${data.username}</span>
          <span class="time">${this.formatTime(new Date(data.timestamp))}</span>
        </div>
        <div class="message-content">${data.message}</div>
      `;
      messages.appendChild(message);
      messages.scrollTop = messages.scrollHeight;
    }
  }

  formatTime(date) {
    return date.toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  async handleBid(e) {
    e.preventDefault();
    const amount = parseInt(document.getElementById('bid-amount').value);
    
    if (amount <= this.currentBid) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'La oferta debe ser mayor que el precio actual'
      });
      return;
    }

    try {
      const response = await fetch(`/auctions/${this.auctionId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al realizar la oferta');
      }

      this.socket.emit('submit-bid', {
        auctionId: this.auctionId,
        userId: this.userId,
        amount,
        timestamp: new Date().toISOString()
      });

      document.getElementById('bid-amount').value = '';
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  }

  async handleQuickBid(e) {
    e.preventDefault();
    const amount = this.currentBid + 1000;
    
    try {
      const response = await fetch(`/auctions/${this.auctionId}/bid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al realizar la oferta rápida');
      }

      this.socket.emit('submit-bid', {
        auctionId: this.auctionId,
        userId: this.userId,
        amount,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  }

  async handleMessage(e) {
    e.preventDefault();
    const input = document.getElementById('message-input');
    const message = input.value.trim();
    
    if (!message) return;
    
    try {
      const response = await fetch(`/auctions/${this.auctionId}/message`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Error al enviar el mensaje');
      }

      this.socket.emit('chat-message', {
        auctionId: this.auctionId,
        userId: this.userId,
        message,
        timestamp: new Date().toISOString()
      });
      
      input.value = '';
    } catch (error) {
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.message
      });
    }
  }
}

export default AuctionChat;