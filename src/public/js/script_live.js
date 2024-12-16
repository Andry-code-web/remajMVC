function generateAuctionCards() {
    const auctionGrid = document.getElementById('auction-grid');
    auctionGrid.innerHTML = ''; 

    // Iterar sobre los datos de las subastas para crear tarjetas
    auctionData.forEach(auction => {
        const card = document.createElement('div'); // Crear elemento div para la tarjeta
        card.className = 'auction-card'; // Asignar clase CSS para estilo

        card.innerHTML = `
            <div class="auction-image-container">
                <img src="data:image/png;base64,${auction.imagen}" alt="${auction.description}" class="auction-image">
                <div class="countdown" data-id="${auction.id}">
                    <span class="countdown-icon">⏱</span>
                    <span class="countdown-text">Cargando...</span> <!-- Texto inicial -->
                </div>
            </div>
            <div class="auction-content">
                <h3 class="title">${auction.ubicacion}</h3> <!-- Ubicación de la subasta -->
                <p class="description">${auction.description}</p> <!-- Descripción -->
                <p class="price">USD$ ${parseFloat(auction.precios).toFixed(2)}</p> <!-- Precio formateado -->
                <div class="details">
                    <span>Baños: ${auction.N_banos}</span> | <!-- Número de baños -->
                    <span>Habitaciones: ${auction.N_habitacion}</span> <!-- Número de habitaciones -->
                </div>
        <div class="buttons">
            <button class="btn btn-description" onclick="openModal('details', ${auction.id})">
                Descripción
            </button>
            <button class="btn btn-description" onclick="openModal('details', ${auction.id})">
                Detalles
            </button>
            <button class="btn btn-description" onclick="openModal('details', ${auction.id})">
                Descarga
            </button>
        </div>
        `;
        auctionGrid.appendChild(card); 
    });

    updateCountdown(); 
}


// Abrir modal para mostrar detalles de una subasta
function openModal(type, id) {
    const modal = document.getElementById('modal'); // Elemento modal
    const modalBody = document.getElementById('modal-body'); // Contenido del modal
    const auction = auctionData.find(a => a.id === id); // Buscar subasta por ID

    if (!auction) return; // Si no se encuentra, salir

    if (type === 'details') {
        modalBody.innerHTML = `
            <h2>${auction.ubicacion}</h2> <!-- Título con ubicación -->
            <p>${auction.description}</p> <!-- Descripción -->
            <p>Precio: USD$ ${parseFloat(auction.precios).toFixed(2)}</p> <!-- Precio -->
            <p>Baños: ${auction.N_banos}</p> <!-- Baños -->
            <p>Habitaciones: ${auction.N_habitacion}</p> <!-- Habitaciones -->
        `;
    }

    modal.style.display = 'block'; // Mostrar modal
}

// Cerrar el modal
function closeModal() {
    const modal = document.getElementById('modal'); // Elemento modal
    modal.style.display = 'none'; // Ocultar modal
}

// Actualizar la cuenta regresiva para cada subasta
function updateCountdown() {
    const countdownElements = document.querySelectorAll('.countdown'); // Seleccionar contenedores de cuenta regresiva

    countdownElements.forEach(element => {
        const id = parseInt(element.getAttribute('data-id')); // Obtener ID de subasta
        const auction = auctionData.find(a => a.id === id); // Buscar subasta
        const countdownText = element.querySelector('.countdown-text'); // Elemento de texto para cuenta regresiva

        if (auction) {
            const now = new Date(); // Fecha y hora actual
            const distance = auction.endTime - now; // Tiempo restante

            // Calcular horas, minutos y segundos
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);

            // Actualizar texto de la cuenta regresiva
            countdownText.textContent = `Cierra en ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
    });
}

// Inicializar subastas y configurar actualización de cuenta regresiva
document.addEventListener('DOMContentLoaded', () => {
    generateAuctionCards(); // Generar tarjetas al cargar la página
    setInterval(updateCountdown, 1000); // Actualizar cada segundo
});

// Cerrar el modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('modal'); // Elemento modal
    if (event.target == modal) {
        closeModal(); // Cerrar modal si se hace clic fuera
    }
};
