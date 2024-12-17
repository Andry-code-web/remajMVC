document.addEventListener('DOMContentLoaded', () => {
    // Inicializar las partículas
    const canvas = document.getElementById('particleCanvas');
    if (canvas) {
        import('./componentes/network.live.js').then(module => {
            const NetworkAnimationL = module.default;
            const networkAnimation = new NetworkAnimationL(canvas);
        }).catch(err => console.error('Error loading particles:', err));
    }

    // Generar las tarjetas de subastas
    generateAuctionCards();
    
    // Iniciar la actualización del contador
    setInterval(updateCountdown, 1000);
});

function generateAuctionCards() {
    const auctionGrid = document.getElementById('auction-grid');
    if (!auctionGrid || !auctionData) {
        console.error('Error: No se encontró el contenedor o los datos de subastas');
        return;
    }

    auctionGrid.innerHTML = '';

    auctionData.forEach((auction, index) => {
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
                    <button class="btn" onclick="openModal('seguimiento', ${auction.id})">
                        Seguimiento
                    </button>
                    <button class="btn" onclick="openModal('remate', ${auction.id})">
                        Detalles
                    </button>
                    <button class="btn" onclick="downloadPDF(${auction.id})">
                        Aviso
                    </button>
                </div>
            </div>
        `;
        
        auctionGrid.appendChild(card);
        
        setTimeout(() => {
            if (index % 2 === 0) {
                card.classList.add('animate-left');
            } else {
                card.classList.add('animate-right');
            }
        }, index * 200);
    });
}

function openModal(type, id) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');
    const auction = auctionData.find(a => a.id === id);

    if (!auction) return;

    if (type === 'remate') {
        modalBody.innerHTML = `
            <div class="modal-header">
                <button class="modal-btn btn-light" onclick="showDetalles(${auction.id})">Detalles</button>
                <button class="modal-btn btn-dark" onclick="showInmuebles(${auction.id})">Inmuebles</button>
                <button class="modal-btn btn-dark" onclick="showCronograma(${auction.id})">Cronograma</button>
            </div>
            <div id="board-content"></div>
        `;
        showDetalles(auction.id);
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
    modal.style.display = 'block';
}

function showDetalles(auctionId) {
    const auction = auctionData.find(a => a.id === auctionId);
    if (!auction) return;

    const boardContent = document.getElementById('board-content');
    boardContent.innerHTML = `
       <div class="details-container">
            <!-- Primera columna -->
            <div class="details-column">
                <div class="detail-row">
                    <strong>Expediente:</strong> ${auction.expediente}
                </div>
                <div class="detail-row">
                    <strong>Distrito Judicial:</strong> ${auction.distrito_judicial}
                </div>
                <div class="detail-row">
                    <strong>Órgano Jurisdiccional:</strong> ${auction.organo_jurisdiccional}
                </div>
                <div class="detail-row">
                    <strong>Instancia:</strong> ${auction.instancia}
                </div>
                <div class="detail-row">
                    <strong>Juez:</strong> ${auction.juez}
                </div>
                <div class="detail-row">
                    <strong>Especialista:</strong> ${auction.especialista}
                </div>
                <div class="detail-row">
                    <strong>Materia:</strong> ${auction.materia}
                </div>
                <div class="detail-row">
                    <strong>Resolución:</strong> ${auction.resolucion}
                </div>
            </div>

            <!-- Segunda columna -->
            <div class="details-column">
                <div class="detail-row">
                    <strong>Archivo:</strong> ${auction.archivo}
                </div>
                <div class="detail-row">
                    <strong>Convocatoria:</strong> ${auction.convocatoria}
                </div>
                <div class="detail-row">
                    <strong>Tasación:</strong> ${auction.tasacion}
                </div>
                <div class="detail-row">
                    <strong>Precio base:</strong> ${auction.precio_base}
                </div>
                <div class="detail-row">
                    <strong>Incremento entre ofertas:</strong> ${auction.incremento_ofertas}
                </div>
                <div class="detail-row">
                    <strong>Arancel:</strong> ${auction.arancel}
                </div>
                <div class="detail-row">
                    <strong>Oblaje:</strong> ${auction.oblaje}
                </div>
                <div class="detail-row">
                    <strong>N° Inscritos:</strong> ${auction.numero_inscritos}
                </div>
            </div>
        </div>
    `;
}

function showInmuebles(auctionId) {
    const auction = auctionData.find(a => a.id === auctionId);
    if (!auction) return;

    const boardContent = document.getElementById('board-content');
    boardContent.innerHTML = `
        <div class="board">
            <div class="board-header">
            </div>
            <div class="board-table">
                <table>
                    <thead>
                        <tr>
                            <th>PARTIDA REGISTRAL</th>
                            <th>TIPO INMUEBLE</th>
                            <th>DIRECCIÓN</th>
                            <th>CARGA Y/O GRAVAMEN</th>
                            <th>PORCENTAJE A REMATAR</th>
                            <th>IMÁGENES</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>${auction.partida_registral}</td>
                            <td>${auction.tipo_inmueble}</td>
                            <td>${auction.direccion}</td>
                            <td>${auction.carga_ogravamen}</td>
                            <td>${auction.porcentaje_rematar}%</td>
                            <td>${auction.imagenes ? auction.imagenes.length : 0}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            ${auction.imagenes && auction.imagenes.length > 0 ? `
                <div class="board-images">
                    ${auction.imagenes.map(img => `
                        <div class="board-image">
                            <img src="data:image/png;base64,${img}" alt="Inmueble">
                        </div>
                    `).join('')}
                </div>
            ` : ''}
        </div>
    `;
}


function showCronograma(auctionId) {
    const auction = auctionData.find(a => a.id === auctionId);
    if (!auction) return;

    const boardContent = document.getElementById('board-content');
    boardContent.innerHTML = `
        <div class="board">
            <div class="board-header">
            </div>
            <div class="board-table">
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
                        ${auction.cronograma && auction.cronograma.length > 0 
                            ? auction.cronograma.map((fase, index) => `
                                <tr>
                                    <td>${index + 1}</td>
                                    <td>${fase.nombre}</td>
                                    <td>${fase.fecha_inicio}</td>
                                    <td>${fase.fecha_fin}</td>
                                </tr>
                            `).join('')
                            : '<tr><td colspan="4">No hay fases disponibles.</td></tr>'
                        }
                    </tbody>
                </table>
            </div>
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

function closeModal() {
    const modal = document.getElementById('modal');
    modal.style.display = 'none';
}

//PDF
function downloadPDF(auctionId) {
    const pdfUrl = 'ruta_del_pdf/aviso.pdf';
    const link = document.createElement('a');
    link.href = pdfUrl;
    link.download = 'aviso.pdf';
    link.click();
}

window.openModal = openModal;
window.closeModal = closeModal;
window.showDetalles = showDetalles;
window.showInmuebles = showInmuebles;
window.showCronograma = showCronograma;
window.downloadPDF = downloadPDF;