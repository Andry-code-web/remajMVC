// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
    animateCards();
});

// Función principal de inicialización
function initializeApp() {
    const modals = {
        tracking: document.getElementById('trackingModal'),
        details: document.getElementById('detailsModal')
    };

    // Configurar botones principales
    setupButtons(modals);
    
    // Configurar modales
    setupModals(modals);
    
    // Configurar pestañas
    setupTabs();
}

// Configuración de botones con delegación de eventos
function setupButtons(modals) {
    const propertyContainer = document.querySelector('.property-container');
    
    propertyContainer?.addEventListener('click', (e) => {
        const button = e.target.closest('.card-button');
        if (!button) return;

        const action = button.getAttribute('data-action');
        
        if (action === 'tracking') {
            modals.tracking.style.display = 'flex';
        } else if (action === 'open-details') {
            modals.details.style.display = 'flex';
            showTab('detalles');
        } else if (action === 'notice') {
            downloadPDF();
        }
    });
}

// Configuración de modales
function setupModals(modals) {
    // Configurar botones de cierre
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', () => {
            Object.values(modals).forEach(modal => {
                modal.style.display = 'none';
            });
        });
    });

    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', (e) => {
        Object.values(modals).forEach(modal => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

// Configuración de pestañas
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');
            if (tabName) {
                showTab(tabName);
            }
        });
    });
}

// Mostrar pestaña seleccionada
function showTab(tabName) {
    // Ocultar todos los contenidos
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    // Desactivar todos los botones
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
    });

    // Activar pestaña seleccionada
    const selectedContent = document.getElementById(tabName);
    const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);
    
    if (selectedContent) selectedContent.classList.add('active');
    if (selectedButton) selectedButton.classList.add('active');
}

// Función para descargar PDF
function downloadPDF() {
    // Aquí puedes agregar la lógica para descargar el PDF
    alert('La funcionalidad de descarga de PDF estará disponible próximamente');
}

// Animación de las tarjetas
function animateCards() {
    const cards = document.querySelectorAll('.property-card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
    });
}
