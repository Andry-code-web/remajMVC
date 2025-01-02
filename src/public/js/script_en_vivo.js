document.addEventListener('DOMContentLoaded', () => {
    // Manejar la navegación activa en las pestañas
    const currentPath = window.location.pathname;
    const tabs = document.querySelectorAll('.navigation-tabs .tab-link');
    
    tabs.forEach(tab => {
        if (tab.getAttribute('href') === currentPath) {
            tab.classList.add('active');
        }
    });

    // Configurar botones de PDF (redirección directa)
    document.querySelectorAll('a[href*="/pdf/"]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const id = btn.href.split('/').pop();
            window.location.href = `/en_vivo/pdf/${id}`;
        });
    });
});

// Clase Tabs para manejar las pestañas
class Tabs {
  constructor(container) {
      this.container = container;
      this.tabs = container.querySelectorAll('.tab-btn');
      this.panes = container.querySelectorAll('.tab-pane');
      this.setupListeners();
  }

  setupListeners() {
      this.tabs.forEach(tab => {
          tab.addEventListener('click', () => this.switchTab(tab));
      });
  }

  switchTab(selectedTab) {
      // Remover clase activa de todas las tabs
      this.tabs.forEach(tab => tab.classList.remove('active'));
      this.panes.forEach(pane => pane.classList.remove('active'));

      // Activar la tab seleccionada
      selectedTab.classList.add('active');
      const targetId = selectedTab.dataset.tab;
      const targetPane = this.container.querySelector(`#${targetId}`);
      if (targetPane) {
          targetPane.classList.add('active');
      }
  }
}

// Inicialización cuando el DOM está listo
document.addEventListener('DOMContentLoaded', () => {
  // Inicializar modales
  const seguimientoModal = new Modal('modalSeguimiento');
  const detallesModal = new Modal('modalDetalles');
  
  // Configurar botones de seguimiento
  document.querySelectorAll('a[href*="/seguimiento/"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const id = btn.href.split('/').pop();
          try {
              const response = await fetch(`/en_vivo/seguimiento/${id}`);
              if (!response.ok) throw new Error('Error al cargar seguimiento');
              
              const data = await response.text();
              seguimientoModal.setContent(data);
              seguimientoModal.open();
          } catch (error) {
              console.error('Error:', error);
              alert('Error al cargar el seguimiento');
          }
      });
  });

  // Configurar botones de detalles
  document.querySelectorAll('a[href*="/detalles/"]').forEach(btn => {
      btn.addEventListener('click', async (e) => {
          e.preventDefault();
          const id = btn.href.split('/').pop();
          try {
              const response = await fetch(`/en_vivo/detalles/${id}`);
              if (!response.ok) throw new Error('Error al cargar detalles');
              
              const data = await response.text();
              detallesModal.setContent(data);
              
              // Inicializar pestañas
              new Tabs(detallesModal.modal.querySelector('.modal-body'));
              detallesModal.open();
          } catch (error) {
              console.error('Error:', error);
              alert('Error al cargar los detalles');
          }
      });
  });

  // Configurar botones de PDF (redirección directa)
  document.querySelectorAll('a[href*="/pdf/"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
          e.preventDefault();
          const id = btn.href.split('/').pop();
          window.location.href = `/en_vivo/pdf/${id}`;
      });
  });
});