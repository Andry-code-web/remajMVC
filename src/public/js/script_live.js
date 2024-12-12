// Simulación de datos de la base de datos
const auctionData = [
    {
        id: 1,
        title: 'MG New MG 5 - 2023',
        image: '/img/casa.png',
        company: 'SANTANDER CONSUMER',
        reference: 'L01143_SL01_V01',
        auctionType: 'Dinámica',
        views: 28,
        location: 'LIMA',
        currentBid: 4050.00,
        description: 'Este es un automóvil MG New MG 5 del año 2023. Está en excelentes condiciones y tiene bajo kilometraje.',
        photos: ['/img/casa.png', '/img/oficina.png', '/img/casa.png'],
        endTime: new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas desde ahora
    },
];

function generateAuctionCards() {
    const auctionGrid = document.getElementById('auction-grid');
    auctionGrid.innerHTML = ''; 

    auctionData.forEach(auction => {
        const card = document.createElement('div');
        card.className = 'auction-card';
        card.innerHTML = `
            <div class="auction-image-container">
                <img src="${auction.image}" alt="${auction.title}" class="auction-image">
                <div class="countdown" data-id="${auction.id}">
                    <span class="countdown-icon">⏱</span>
                    <span class="countdown-text">Cargando...</span>
                </div>
            </div>
            <div class="auction-content">
                <h3 class="title">${auction.title}</h3>
                <p class="vehicle-type">${auction.auctionType}</p>
                <div class="company-info">
                    <span>Empresa: ${auction.company}</span>
                </div>
                <div class="details">
                    <div class="detail-item">
                        <span class="detail-icon">📄</span>
                        <span>${auction.reference}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">🔄</span>
                        <span>${auction.auctionType}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-icon">👁</span>
                        <span>${auction.views}</span>
                    </div>
                </div>
                <div class="location-info">
                    <div class="location-item">
                        <span class="location-icon">📍</span>
                        <span>${auction.location}</span>
                    </div>
                    <div class="location-item">
                        <span class="company-icon">🏢</span>
                        <span>${auction.company}</span>
                    </div>
                </div>
                <div class="buttons">
                    <button class="btn btn-description" onclick="openModal('details', ${auction.id})">Descripción</button>
                    <button class="btn btn-photos" onclick="openModal('gallery', ${auction.id})">Fotos</button>
                </div>
                <div class="bid-info">
                    <span class="bid-label">Oferta Más Alta xd</span>
                    <span class="bid-amount">USD$ ${auction.currentBid.toFixed(2)}</span>
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
            <h2>${auction.title}</h2>
            <p>${auction.description}</p>
            <p>Referencia: ${auction.reference}</p>
            <p>Tipo de subasta: ${auction.auctionType}</p>
            <p>Ubicación: ${auction.location}</p>
            <p>Empresa: ${auction.company}</p>
            <p>Oferta actual: USD$ ${auction.currentBid.toFixed(2)}</p>
        `;
    } else if (type === 'gallery') {
        let currentPhotoIndex = 0;
        modalBody.innerHTML = `
            <div class="gallery-container">
                <img src="${auction.photos[currentPhotoIndex]}" alt="${auction.title}" class="gallery-image">
                <button class="gallery-nav prev" onclick="changePhoto(-1, ${id})">&#10094;</button>
                <button class="gallery-nav next" onclick="changePhoto(1, ${id})">&#10095;</button>
            </div>
        `;
    }

    modal.style.display = 'block';
}

function changePhoto(direction, id) {
    const auction = auctionData.find(a => a.id === id);
    if (!auction) return;

    let currentPhotoIndex = auction.photos.findIndex(photo => photo === document.querySelector('.gallery-image').src);
    currentPhotoIndex += direction;
    if (currentPhotoIndex < 0) currentPhotoIndex = auction.photos.length - 1;
    if (currentPhotoIndex >= auction.photos.length) currentPhotoIndex = 0;
    document.querySelector('.gallery-image').src = auction.photos[currentPhotoIndex];
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
}