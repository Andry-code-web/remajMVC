function generateAuctionCards() {
    const auctionGrid = document.getElementById('auction-grid');
    auctionGrid.innerHTML = ''; // Limpiar el contenedor antes de regenerar las tarjetas

    auctionData.forEach(auction => {
        const card = document.createElement('div');
        card.className = 'auction-card';
        card.innerHTML = `
            <div class="auction-image-container">
                <img src="data:image/png;base64,${auction.imagen}" alt="${auction.description}" class="auction-image">
                <div class="countdown" data-id="${auction.id}">
                    <span class="countdown-icon">⏱</span>
                    <span class="countdown-text">Cargando...</span>
                </div>
            </div>
            <div class="auction-content">
                <h3 class="title">${auction.ubicacion}</h3>
                <p class="description">${auction.description}</p>
                <p class="price">USD$ ${parseFloat(auction.precios).toFixed(2)}</p>
                <div class="details">
                    <span>Baños: ${auction.N_banos}</span> | 
                    <span>Habitaciones: ${auction.N_habitacion}</span>
                </div>
                <div class="buttons">
                    <button class="btn btn-description" onclick="openModal('details', ${auction.id})">Ver detalles</button>
                </div>
            </div>
        `;
        auctionGrid.appendChild(card);
    });

    updateCountdown();
}

function openModal(type, id) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const auction = auctionData.find(a => a.id === id);

    if (!auction) return;

    if (type === 'details') {
        modalBody.innerHTML = `
            <h2>${auction.ubicacion}</h2>
            <p>${auction.description}</p>
            <p>Precio: USD$ ${parseFloat(auction.precios).toFixed(2)}</p>
            <p>Baños: ${auction.N_banos}</p>
            <p>Habitaciones: ${auction.N_habitacion}</p>
        `;
    }

    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function updateCountdown() {
    const countdownElements = document.querySelectorAll('.countdown');

    countdownElements.forEach(element => {
        const id = parseInt(element.getAttribute('data-id'));
        const auction = auctionData.find(a => a.id === id);
        const countdownText = element.querySelector('.countdown-text');

        if (auction) {
            const now = new Date();
            const distance = auction.endTime - now;

            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            countdownText.textContent = `Cierra en ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    });
}

// Inicializar subastas al cargar la página
document.addEventListener('DOMContentLoaded', () => {
    generateAuctionCards();
    setInterval(updateCountdown, 1000); // Actualizar la cuenta regresiva cada segundo
});

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        closeModal();
    }
};
