// Datos de ejemplo (simulando datos de una base de datos)
const auctionData = [
    {
        id: 1,
        image: "/img/xd.jpg",
        title: "CAMION MITSUBISHI FUSO FM",
        subtitle: "PLACA ALB830 AÑO 2015",
        location: "LURIN",
        views: 247,
        status: "Sobre cerrado",
        details: {
            general: [
                { icon: "🚛", label: "Marca", value: "Mitsubishi" },
                { icon: "📝", label: "Modelo", value: "Fuso FM" },
                { icon: "📅", label: "Año", value: "2015" },
                { icon: "🔢", label: "Placa", value: "ALB830" }
            ],
            technical: [
                { icon: "⚙️", label: "Motor", value: "6D16" },
                { icon: "⛽", label: "Combustible", value: "Diesel" },
                { icon: "🔄", label: "Transmisión", value: "Manual" },
                { icon: "⚖️", label: "Peso Bruto", value: "12000 kg" }
            ],
            documentation: [
                { icon: "📋", label: "SOAT", value: "Vigente" },
                { icon: "🔍", label: "Revisión Técnica", value: "Vigente" }
            ]
        },
        gallery: ["/img/xd.jpg", "/img/xd.jpg", "/img/xd.jpg", "/img/xd.jpg"]
    },
    {
        id: 1,
        image: "/img/xd.jpg",
        title: "CAMION MITSUBISHI FUSO FM",
        subtitle: "PLACA ALB830 AÑO 2015",
        location: "LURIN",
        views: 247,
        status: "Sobre cerrado",
        details: {
            general: [
                { icon: "🚛", label: "Marca", value: "Mitsubishi" },
                { icon: "📝", label: "Modelo", value: "Fuso FM" },
                { icon: "📅", label: "Año", value: "2015" },
                { icon: "🔢", label: "Placa", value: "ALB830" }
            ],
            technical: [
                { icon: "⚙️", label: "Motor", value: "6D16" },
                { icon: "⛽", label: "Combustible", value: "Diesel" },
                { icon: "🔄", label: "Transmisión", value: "Manual" },
                { icon: "⚖️", label: "Peso Bruto", value: "12000 kg" }
            ],
            documentation: [
                { icon: "📋", label: "SOAT", value: "Vigente" },
                { icon: "🔍", label: "Revisión Técnica", value: "Vigente" }
            ]
        },
        gallery: ["/img/xd.jpg", "/img/xd.jpg", "/img/xd.jpg", "/img/xd.jpg"]
    },
    {
        id: 1,
        image: "/img/xd.jpg",
        title: "CAMION MITSUBISHI FUSO FM",
        subtitle: "PLACA ALB830 AÑO 2015",
        location: "LURIN",
        views: 247,
        status: "Sobre cerrado",
        details: {
            general: [
                { icon: "🚛", label: "Marca", value: "Mitsubishi" },
                { icon: "📝", label: "Modelo", value: "Fuso FM" },
                { icon: "📅", label: "Año", value: "2015" },
                { icon: "🔢", label: "Placa", value: "ALB830" }
            ],
            technical: [
                { icon: "⚙️", label: "Motor", value: "6D16" },
                { icon: "⛽", label: "Combustible", value: "Diesel" },
                { icon: "🔄", label: "Transmisión", value: "Manual" },
                { icon: "⚖️", label: "Peso Bruto", value: "12000 kg" }
            ],
            documentation: [
                { icon: "📋", label: "SOAT", value: "Vigente" },
                { icon: "🔍", label: "Revisión Técnica", value: "Vigente" }
            ]
        },
        gallery: ["/img/xd.jpg", "/img/xd.jpg", "/img/xd.jpg", "/img/xd.jpg"]
    },
    {
        id: 1,
        image: "/img/xd.jpg",
        title: "CAMION MITSUBISHI FUSO FM",
        subtitle: "PLACA ALB830 AÑO 2015",
        location: "LURIN",
        views: 247,
        status: "Sobre cerrado",
        details: {
            general: [
                { icon: "🚛", label: "Marca", value: "Mitsubishi" },
                { icon: "📝", label: "Modelo", value: "Fuso FM" },
                { icon: "📅", label: "Año", value: "2015" },
                { icon: "🔢", label: "Placa", value: "ALB830" }
            ],
            technical: [
                { icon: "⚙️", label: "Motor", value: "6D16" },
                { icon: "⛽", label: "Combustible", value: "Diesel" },
                { icon: "🔄", label: "Transmisión", value: "Manual" },
                { icon: "⚖️", label: "Peso Bruto", value: "12000 kg" }
            ],
            documentation: [
                { icon: "📋", label: "SOAT", value: "Vigente" },
                { icon: "🔍", label: "Revisión Técnica", value: "Vigente" }
            ]
        },
        
        gallery: ["/img/xd.jpg", "/img/xd.jpg", "/img/xd.jpg", "/img/xd.jpg"]
    },
    {
        id: 1,
        image: "/img/xd.jpg",
        title: "CAMION MITSUBISHI FUSO FM",
        subtitle: "PLACA ALB830 AÑO 2015",
        location: "LURIN",
        views: 247,
        status: "Sobre cerrado",
        details: {
            general: [
                { icon: "🚛", label: "Marca", value: "Mitsubishi" },
                { icon: "📝", label: "Modelo", value: "Fuso FM" },
                { icon: "📅", label: "Año", value: "2015" },
                { icon: "🔢", label: "Placa", value: "ALB830" }
            ],
            technical: [
                { icon: "⚙️", label: "Motor", value: "6D16" },
                { icon: "⛽", label: "Combustible", value: "Diesel" },
                { icon: "🔄", label: "Transmisión", value: "Manual" },
                { icon: "⚖️", label: "Peso Bruto", value: "12000 kg" }
            ],
            documentation: [
                { icon: "📋", label: "SOAT", value: "Vigente" },
                { icon: "🔍", label: "Revisión Técnica", value: "Vigente" }
            ]
        },
        gallery: ["/img/xd.jpg", "/img/xd.jpg", "/img/xd.jpg", "/img/xd.jpg"]
    }
    // Puedes agregar más objetos de subasta aquí
];

// Función para generar las tarjetas de subasta
function generateAuctionCards() {
    const auctionGrid = document.getElementById('auction-grid');
    auctionGrid.innerHTML = ''; // Limpiar el contenedor

    auctionData.forEach(auction => {
        const card = document.createElement('div');
        card.className = 'auction-card';
        card.innerHTML = `
            <img src="${auction.image}" alt="${auction.title}" class="auction-image">
            <div class="auction-content">
                <div class="countdown" data-id="${auction.id}">
                    Cargando...
                </div>
                <h2 class="title">${auction.title}</h2>
                <p class="subtitle">${auction.subtitle}</p>
                <div class="details">
                    <span class="detail-item">
                        📍 ${auction.location}
                    </span>
                    <span class="detail-item">
                        👁 ${auction.views} vistas
                    </span>
                    <span class="status-tag">${auction.status}</span>
                </div>
                <div class="buttons">
                    <button class="btn btn-details" onclick="openModal('details', ${auction.id})">Características</button>
                    <button class="btn btn-images" onclick="openModal('gallery', ${auction.id})">Imágenes</button>
                </div>
            </div>
        `;
        auctionGrid.appendChild(card);
    });

    updateCountdown();
}

// Función para abrir modal
function openModal(modalType, auctionId) {
    const modal = document.getElementById(modalType + 'Modal');
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';

    if (modalType === 'details') {
        populateDetailsModal(auctionId);
    } else if (modalType === 'gallery') {
        populateGalleryModal(auctionId);
    }
}

// Función para cerrar modal
function closeModal(modalType) {
    const modal = document.getElementById(modalType + 'Modal');
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

// Cerrar modal al hacer clic fuera del contenido
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
        document.body.style.overflow = 'auto';
    }
}

// Funciones para el slider
let currentSlide = 0;
let totalSlides = 0;

function changeSlide(direction) {
    currentSlide = (currentSlide + direction + totalSlides) % totalSlides;
    updateSlider();
}

function goToSlide(index) {
    currentSlide = index;
    updateSlider();
}

function updateSlider() {
    const sliderContainer = document.getElementById('sliderContainer');
    sliderContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
    updateIndicators();
}

function updateIndicators() {
    const indicators = document.querySelectorAll('.indicator');
    indicators.forEach((indicator, index) => {
        indicator.classList.toggle('active', index === currentSlide);
    });
}

// Función para la cuenta regresiva
function updateCountdown() {
    const countdowns = document.querySelectorAll('.countdown');
    
    countdowns.forEach(countdown => {
        const auctionId = countdown.getAttribute('data-id');
        const now = new Date().getTime();
        const targetTime = now + (20 * 60 * 60 * 1000) + (19 * 60 * 1000) + (17 * 1000);
        
        function update() {
            const currentTime = new Date().getTime();
            const distance = targetTime - currentTime;
            
            const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((distance % (1000 * 60)) / 1000);
            
            const formattedHours = String(hours).padStart(2, '0');
            const formattedMinutes = String(minutes).padStart(2, '0');
            const formattedSeconds = String(seconds).padStart(2, '0');
            
            countdown.textContent = `Cierra en ${formattedHours}:${formattedMinutes}:${formattedSeconds}`;
            
            if (distance < 0) {
                countdown.textContent = 'SUBASTA TERMINADA';
                return;
            }
            
            setTimeout(update, 1000);
        }
        
        update();
    });
}

// Función para poblar el modal de detalles
function populateDetailsModal(auctionId) {
    const auction = auctionData.find(a => a.id === auctionId);
    const detailsContent = document.getElementById('detailsContent');
    detailsContent.innerHTML = '';

    const sections = [
        { title: "Información General", data: auction.details.general },
        { title: "Especificaciones Técnicas", data: auction.details.technical },
        { title: "Estado y Documentación", data: auction.details.documentation }
    ];

    sections.forEach(section => {
        const sectionElement = document.createElement('div');
        sectionElement.className = 'details-section';
        sectionElement.innerHTML = `
            <h3>${section.title}</h3>
            <div class="details-grid">
                ${section.data.map(item => `
                    <div class="detail-item">
                        <i>${item.icon}</i>
                        <div>
                            <div class="detail-label">${item.label}</div>
                            <div class="detail-value">${item.value}</div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
        detailsContent.appendChild(sectionElement);
    });
}

// Función para poblar el modal de galería
function populateGalleryModal(auctionId) {
    const auction = auctionData.find(a => a.id === auctionId);
    const sliderContainer = document.getElementById('sliderContainer');
    const indicatorsContainer = document.getElementById('sliderIndicators');
    
    sliderContainer.innerHTML = '';
    indicatorsContainer.innerHTML = '';
    currentSlide = 0;
    totalSlides = auction.gallery.length;

    auction.gallery.forEach((image, index) => {
        const img = document.createElement('img');
        img.src = image;
        img.alt = `Imagen ${index + 1}`;
        img.className = 'slider-image';
        sliderContainer.appendChild(img);

        const indicator = document.createElement('div');
        indicator.className = `indicator ${index === 0 ? 'active' : ''}`;
        indicator.onclick = () => goToSlide(index);
        indicatorsContainer.appendChild(indicator);
    });

    updateSlider();
}

// Inicializar la página
document.addEventListener('DOMContentLoaded', () => {
    generateAuctionCards();
});