// Escucha el evento cuando el DOM ha cargado completamente
document.addEventListener("DOMContentLoaded", () => {
  console.log('DOM cargado completamente');
  
  // Configura la lógica de los botones
  setupButtons();
  
  // Configura la funcionalidad de las tabs (pestañas)
  setupTabs();
  
  // Configura los listeners de eventos para los modales
  setupModalListeners();
});

// Función para configurar los botones
function setupButtons() {
  console.log('Configurando botones');
  
  // Selecciona el contenedor de propiedades (puede contener botones de acciones)
  const propertyContainer = document.querySelector(".property-container");

  // Agrega un listener de clic al contenedor
  propertyContainer?.addEventListener("click", (e) => {
      const target = e.target; // Elemento clickeado
      console.log('Click en container, elemento:', target);

      // Si se hace clic en un enlace de tipo Seguimiento
      if (target.closest('a[href*="/seguimiento/"]')) {
          console.log('Click en botón de Seguimiento');
          e.preventDefault(); // Previene el comportamiento predeterminado del enlace
          
          // Extrae el ID de la URL y redirige a la página correspondiente
          const id = target.closest('a').href.split('/').pop();
          window.location.href = `/en_vivo/seguimiento/${id}`;
      }

      // Si se hace clic en un enlace de tipo Detalles
      if (target.closest('a[href*="/detalles/"]')) {
          console.log('Click en botón de Detalles');
          e.preventDefault();
          
          const id = target.closest('a').href.split('/').pop();
          window.location.href = `/en_vivo/detalles/${id}`;
      }

      // Si se hace clic en un enlace para descargar un PDF
      if (target.closest('a[href*="/pdf/"]')) {
          console.log('Click en botón de PDF');
          e.preventDefault();
          
          const id = target.closest('a').href.split('/').pop();
          window.location.href = `/en_vivo/pdf/${id}`;
      }
  });
}

// Función para configurar las tabs (pestañas)
function setupTabs() {
  console.log('Configurando tabs');
  
  // Selecciona todos los elementos con la clase 'nav-link' (botones de pestañas)
  const tabButtons = document.querySelectorAll(".nav-link");
  
  // Agrega un listener de clic a cada botón
  tabButtons.forEach(button => {
      button.addEventListener("click", (e) => {
          e.preventDefault(); // Previene el comportamiento predeterminado del enlace
          console.log('Click en tab:', button.id);
          
          // Obtiene el ID de la subasta desde el atributo de datos del modal
          const auctionId = button.closest('.modal').dataset.auctionId;
          // Obtiene el tipo de tab eliminando '-tab' del ID del botón
          const tabType = button.id.replace('-tab', '');
          
          // Carga el contenido correspondiente para la pestaña
          loadTabContent(tabType, auctionId);
      });
  });
}

// Función para cargar contenido dinámico en las tabs
async function loadTabContent(tabType, auctionId) {
  console.log(`Cargando contenido para tab ${tabType}, subasta ${auctionId}`);
  try {
      // Hace una solicitud al servidor para obtener el contenido del tab
      const response = await fetch(`/en_vivo/${tabType}/${auctionId}`);
      
      // Verifica si la respuesta es válida
      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      
      // Obtiene el contenido como texto y lo inserta en la tab correspondiente
      const data = await response.text();
      document.querySelector(`#${tabType}`).innerHTML = data;
      
      console.log(`Contenido de ${tabType} cargado exitosamente`);
  } catch (error) {
      // Maneja errores durante la carga del contenido
      console.error(`Error al cargar contenido de ${tabType}:`, error);
  }
}

// Función para configurar eventos relacionados con los modales
function setupModalListeners() {
  console.log('Configurando listeners de modales');
  
  // Selecciona todos los modales
  const modals = document.querySelectorAll('.modal');
  
  // Agrega eventos para cuando se abren o cierran los modales
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
  console.error('Error:', message); // Imprime el error en la consola
  alert(message); // Muestra un mensaje de alerta al usuario
}
