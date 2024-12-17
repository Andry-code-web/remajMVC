// Genera las tarjetas de subastas dinámicamente y las inserta en la cuadrícula
function generateAuctionCards() {
    const auctionGrid = document.getElementById('auction-grid'); // Contenedor de tarjetas
    auctionGrid.innerHTML = ''; // Limpiar contenido previo para evitar duplicados

    // Iterar sobre los datos de las subastas para crear tarjetas
    auctionData.forEach(auction => {
        const card = document.createElement('div'); // Crear elemento div para la tarjeta
        card.className = 'auction-card'; // Asignar clase CSS para estilo

        // Contenido HTML dinámico de la tarjeta
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
            <button class="btn btn-description" onclick="openModal('details', ${auction.id})">
                Descripción
            </button>
        </div>
        `;
        auctionGrid.appendChild(card); // Agregar la tarjeta al contenedor
    });

    updateCountdown(); // Actualizar la cuenta regresiva al generar las tarjetas
}

// Abrir modal para mostrar detalles de una subasta
function openModal(type, id) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const auction = auctionData.find(a => a.id === id);

    if (!auction) return;

    // Verifica si el tipo es 'remate' o 'seguimiento' y muestra la información correspondiente
    if (type === 'remate') {
        modalBody.innerHTML = `
            <div class="modal-header">
                <button class="modal-btn" onclick="showInmuebles(${auction.id})">Inmuebles</button>
                <button class="modal-btn" onclick="showCronograma(${auction.id})">Cronograma</button>
            </div>
            <h3>Información del Remate</h3>
            <p><strong>Convocatoria:</strong> ${auction.convocatoria}</p>
            <p><strong>Tipo Cambio:</strong> ${auction.tipo_cambio}</p>
            <p><strong>Tasación:</strong> ${auction.tasacion}</p>
            <p><strong>Precio Base:</strong> ${auction.precio_base}</p>
            <p><strong>Incremento entre ofertas:</strong> ${auction.incremento_ofertas}</p>
            <p><strong>Arancel:</strong> ${auction.arancel}</p>
            <p><strong>Oblaje:</strong> ${auction.oblaje}</p>
            <p><strong>Descripción:</strong> ${auction.descripcion}</p>
            <p><strong>N° Inscritos:</strong> ${auction.numero_inscritos}</p>
        `;
    } else if (type === 'seguimiento') {
        modalBody.innerHTML = `
            <div class="expediente">
                <h3>🔴 DETALLE DE EXPEDIENTE</h3>
                <p><strong>N° Expediente:</strong> ${auction.expediente}</p>
                <p><strong>Distrito judicial:</strong> ${auction.distrito_judicial}</p>
                <p><strong>Instancia:</strong> ${auction.instancia}</p>
                <p><strong>Especialidad:</strong> ${auction.especialidad}</p>
            </div>
            <div class="seguimiento">
                <h3>📋 DETALLE DE SEGUIMIENTO</h3>
                <p><strong>N° Convocatoria:</strong> ${auction.convocatoria}</p>
                <p><strong>Fecha de registro:</strong> ${auction.fecha_registro}</p>
                <p><strong>Procesado por:</strong> ${auction.procesado_por}</p>
                <p><strong>Fase convocatoria:</strong> ${auction.fase_convocatoria}</p>
                <p><strong>Estado convocatoria:</strong> ${auction.estado_convocatoria}</p>
                <p><strong>¿Reanudado?:</strong> ${auction.reanudado ? 'Sí' : 'No'}</p>
            </div>
        `;
    }

    // Muestra el modal
    modal.style.display = 'block';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

function showInmuebles(auctionId) {
    const auction = auctionData.find(a => a.id === auctionId);

    if (!auction) return;

    const modalBody = document.getElementById('modal-body');

    // Mantener los botones de navegación visibles
    modalBody.innerHTML = `
        <div class="modal-header">
            <button class="modal-btn" onclick="showInmuebles(${auction.id})">Inmuebles</button>
            <button class="modal-btn" onclick="showCronograma(${auction.id})">Cronograma</button>
        </div>
        <div class="inmueble-details">
            <h3>Detalles del Inmueble</h3>
            <p><strong>Partida Registral:</strong> ${auction.partida_registral}</p>
            <p><strong>Tipo de Inmueble:</strong> ${auction.tipo_inmueble}</p>
            <p><strong>Dirección:</strong> ${auction.direccion}</p>
            <p><strong>Carga/Gravamen:</strong> ${auction.carga_ogravamen}</p>
            <p><strong>Porcentaje a Rematar:</strong> ${auction.porcentaje_rematar}%</p>
            <div class="images">
                ${auction.imagenes && auction.imagenes.length > 0 ? auction.imagenes.map(img => `<img src="data:image/png;base64,${img}" alt="Inmueble">`).join('') : 'No hay imágenes disponibles'}
            </div>
        </div>
    `;
}

function showCronograma(auctionId) {
    const auction = auctionData.find(a => a.id === auctionId);

    if (!auction) return;

    const modalBody = document.getElementById('modal-body');

    // Mantener los botones de navegación visibles
    modalBody.innerHTML = `
        <div class="modal-header">
            <button class="modal-btn" onclick="showInmuebles(${auction.id})">Inmuebles</button>
            <button class="modal-btn" onclick="showCronograma(${auction.id})">Cronograma</button>
        </div>
        <div class="cronograma">
            <h3>Cronograma</h3>
            <table>
                <thead>
                    <tr>
                        <th>N°</th>
                        <th>FASE</th>
                        <th>FECHA INICIO</th>
                        <th>FECHA FIN</th>
                    </tr>
                </thead>
                <tbody>
                    ${auction.cronograma && auction.cronograma.length > 0 ? auction.cronograma.map((fase, index) => `
                        <tr>
                            <td>${index + 1}</td>
                            <td>${fase.nombre}</td>
                            <td>${fase.fecha_inicio}</td>
                            <td>${fase.fecha_fin}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="4">No hay fases disponibles.</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
}

function updateCountdown() {
    const countdownElements = document.querySelectorAll('.countdown');

    countdownElements.forEach(element => {
        const id = parseInt(element.getAttribute('data-id'));
        const auction = auctionData.find(a => a.id === id);
        const countdownText = element.querySelector('.countdown-text');

        if (auction && auction.endTime) {
            const now = new Date();
            const endTime = new Date(auction.endTime);
            const distance = endTime - now;

            if (distance > 0) {
                const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                const seconds = Math.floor((distance % (1000 * 60)) / 1000);

                countdownText.textContent = `Cierra en ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
            } else {
                countdownText.textContent = 'Subasta finalizada';
            }
        }
    });
}

// Event listeners para el modal
window.onclick = function(event) {
    const modal = document.getElementById('modal');
    if (event.target == modal) {
        closeModal();
    }
};

// Función para descargar el PDF
function downloadPDF(auctionId) {
    const pdfUrl = 'ruta_del_pdf/aviso.pdf'; // Aquí se pondrá la ruta del PDF real

    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'aviso.pdf'; // Nombre del archivo descargado
    link.click(); // Inicia la descarga
}

// Hacer las funciones disponibles globalmente
window.openModal = openModal;
window.closeModal = closeModal;
