document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'))
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });

    // Like functionality
    const likeButtons = document.querySelectorAll('.like-button');
    likeButtons.forEach(button => {
        button.addEventListener('click', async function(e) {
            e.preventDefault();
            const auctionId = this.dataset.auctionId;
            try {
                const response = await fetch(`/api/auctions/${auctionId}/like`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.ok) {
                    this.classList.toggle('liked');
                    const countElement = this.querySelector('.like-count');
                    const currentCount = parseInt(countElement.textContent);
                    countElement.textContent = this.classList.contains('liked') ? 
                        currentCount + 1 : currentCount - 1;
                }
            } catch (error) {
                console.error('Error:', error);
            }
        });
    });
});