document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  setupButtons();
  setupTabs();
}

function setupButtons() {
  const propertyContainer = document.querySelector(".property-container");

  propertyContainer?.addEventListener("click", (e) => {
    const button = e.target.closest(".card-button");
    if (!button) return;

    e.preventDefault();

    const action = button.getAttribute("data-action");

    if (action === "tracking") {
      openModal("trackingModal");
    } else if (action === "open-details") {
      openModal("detailsModal");
      showTab("detalles");
    } else if (action === "notice") {
      downloadPDF();
    }
  });
}

function openModal(modalId) {
  const modal = new bootstrap.Modal(document.getElementById(modalId));
  modal.show();
}

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-bs-target").replace("#", "");
      showTab(tabName);
    });
  });
}

function showTab(tabName) {
  const tabContent = document.getElementById(tabName);
  const tabButton = document.querySelector(`[data-bs-target="#${tabName}"]`);

  if (tabContent && tabButton) {
    document.querySelectorAll(".tab-pane").forEach(pane => pane.classList.remove("show", "active"));
    document.querySelectorAll(".nav-link").forEach(link => link.classList.remove("active"));

    tabContent.classList.add("show", "active");
    tabButton.classList.add("active");
  }
}

function downloadPDF() {
  alert("La funcionalidad de descarga de PDF estará disponible próximamente");
}

// Cerrar modales al hacer clic fuera de ellos
document.addEventListener("click", (e) => {
  if (e.target.classList.contains("modal")) {
    const modalId = e.target.id;
    const modal = bootstrap.Modal.getInstance(document.getElementById(modalId));
    if (modal) {
      modal.hide();
    }
  }
});