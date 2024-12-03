class ChatHandler {
    constructor(socketHandler) {
      this.socketHandler = socketHandler;
      this.messageContainer = document.getElementById('chat-messages');
      this.setupListeners();
    }
  
    setupListeners() {
      this.socketHandler.on('chat-message', (data) => {
        this.addMessage(data);
      });
  
      this.socketHandler.on('bid-alert', (data) => {
        this.addBidAlert(data);
      });
    }
  
    sendMessage(message, auctionId, userId) {
      if (!message.trim()) return;
  
      this.socketHandler.emit('chat-message', {
        message,
        auctionId,
        userId,
        timestamp: new Date().toISOString()
      });
    }
  
    addMessage(data) {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${data.isCurrentUser ? 'sent' : 'received'}`;
      
      messageDiv.innerHTML = `
        <div class="message-header">
          <span class="username">${data.username}</span>
          <span class="time">${this.formatTime(new Date(data.timestamp))}</span>
        </div>
        <div class="message-content">${data.message}</div>
      `;
  
      this.messageContainer.appendChild(messageDiv);
      this.scrollToBottom();
    }
  
    addBidAlert(data) {
      const alertDiv = document.createElement('div');
      alertDiv.className = 'bid-alert';
      alertDiv.innerHTML = `
        <strong>${data.username}</strong> realizó una oferta de S/. ${data.amount.toLocaleString()}
      `;
      
      this.messageContainer.appendChild(alertDiv);
      this.scrollToBottom();
    }
  
    formatTime(date) {
      return date.toLocaleTimeString('es-PE', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  
    scrollToBottom() {
      this.messageContainer.scrollTop = this.messageContainer.scrollHeight;
    }
  }
  
  export default ChatHandler;