document.addEventListener('DOMContentLoaded', function() {
    const socket = io();
    const auctionId = document.querySelector('#auction-detail').dataset.auctionId;
    
    // Join auction room
    socket.emit('join-auction', auctionId);
    
    // Bid form handling
    const bidForm = document.getElementById('bidForm');
    if (bidForm) {
        bidForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const amount = document.getElementById('bidAmount').value;
            
            socket.emit('bid', {
                auctionId: auctionId,
                amount: parseFloat(amount)
            });
        });
    }
    
    // Listen for new bids
    socket.on('new-bid', function(data) {
        const bidsList = document.getElementById('bids-list');
        const newBid = document.createElement('div');
        newBid.className = 'bid-item';
        newBid.innerHTML = `
            <strong>Nueva oferta:</strong> S/. ${data.amount.toLocaleString()}
            <small class="text-muted">hace un momento</small>
        `;
        bidsList.prepend(newBid);
        
        // Update current bid display
        document.getElementById('current-bid').textContent = 
            `S/. ${data.amount.toLocaleString()}`;
    });
    
    // Chat functionality
    const chatForm = document.getElementById('chatForm');
    const chatMessages = document.getElementById('chatMessages');
    
    if (chatForm) {
        chatForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const messageInput = document.getElementById('messageInput');
            
            socket.emit('chat-message', {
                auctionId: auctionId,
                message: messageInput.value
            });
            
            messageInput.value = '';
        });
    }
    
    socket.on('chat-message', function(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message';
        messageDiv.innerHTML = `
            <strong>${data.user}:</strong> ${data.message}
            <small class="text-muted">hace un momento</small>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
});