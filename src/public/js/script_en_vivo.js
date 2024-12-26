document.addEventListener("DOMContentLoaded", () => {
  console.log('DOM cargado completamente');
  setupButtons();
  setupTabs();
  setupModalListeners();
});

function setupButtons() {
  console.log('Configurando botones');
  const propertyContainer = document.querySelector(".property-container");

  propertyContainer?.addEventListener("click", (e) => {
      const target = e.target;
      console.log('Click en container, elemento:', target);

      // Botón de Seguimiento
      if (target.closest('a[href*="/seguimiento/"]')) {
          console.log('Click en botón de Seguimiento');
          e.preventDefault();
          const id = target.closest('a').href.split('/').pop();
          window.location.href = `/en_vivo/seguimiento/${id}`;
      }

      // Botón de Detalles
      if (target.closest('a[href*="/detalles/"]')) {
          console.log('Click en botón de Detalles');
          e.preventDefault();
          const id = target.closest('a').href.split('/').pop();
          window.location.href = `/en_vivo/detalles/${id}`;
      }

      // Botón de PDF
      if (target.closest('a[href*="/pdf/"]')) {
          console.log('Click en botón de PDF');
          e.preventDefault();
          const id = target.closest('a').href.split('/').pop();
          window.location.href = `/en_vivo/pdf/${id}`;
      }
  });
}

function setupTabs() {
  console.log('Configurando tabs');
  const tabButtons = document.querySelectorAll(".nav-link");
  
  tabButtons.forEach(button => {
      button.addEventListener("click", (e) => {
          e.preventDefault();
          console.log('Click en tab:', button.id);
          
          const auctionId = button.closest('.modal').dataset.auctionId;
          const tabType = button.id.replace('-tab', '');
          
          loadTabContent(tabType, auctionId);
      });
  });
}

async function loadTabContent(tabType, auctionId) {
  console.log(`Cargando contenido para tab ${tabType}, subasta ${auctionId}`);
  try {
      const response = await fetch(`/en_vivo/${tabType}/${auctionId}`);
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      
      const data = await response.text();
      document.querySelector(`#${tabType}`).innerHTML = data;
      
      console.log(`Contenido de ${tabType} cargado exitosamente`);
  } catch (error) {
      console.error(`Error al cargar contenido de ${tabType}:`, error);
  }
}

function setupModalListeners() {
  console.log('Configurando listeners de modales');
  const modals = document.querySelectorAll('.modal');
  
  modals.forEach(modal => {
      modal.addEventListener('show.bs.modal', (e) => {
          console.log('Abriendo modal:', modal.id);
      });
      
      modal.addEventListener('hidden.bs.modal', (e) => {
          console.log('Cerrando modal:', modal.id);
      });
  });
}

// Función para mostrar errores al usuario
function showError(message) {
  console.error('Error:', message);
  alert(message);
}