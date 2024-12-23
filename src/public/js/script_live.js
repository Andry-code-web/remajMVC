// script_live.js
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
  animateCards();
});

function initializeApp() {
  const modals = {
    tracking: document.getElementById("trackingModal"),
    details: document.getElementById("detailsModal"),
  };

  setupButtons(modals);
  setupModals(modals);
  setupTabs();
}

function setupButtons(modals) {
  const propertyContainer = document.querySelector(".property-container");

  propertyContainer?.addEventListener("click", (e) => {
    const button = e.target.closest(".card-button");
    if (!button) return;

    e.preventDefault();

    const action = button.getAttribute("data-action");

    if (action === "tracking") {
      openModal(modals.tracking);
    } else if (action === "open-details") {
      openModal(modals.details);
      showTab("detalles");
    } else if (action === "notice") {
      downloadPDF();
    }
  });
}

function setupModals(modals) {
  document.querySelectorAll(".close-button").forEach((button) => {
    button.addEventListener("click", () => {
      Object.values(modals).forEach(closeModal);
    });
  });

  window.addEventListener("click", (e) => {
    Object.values(modals).forEach((modal) => {
      if (e.target === modal) {
        closeModal(modal);
      }
    });
  });
}

function openModal(modal) {
  modal.classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeModal(modal) {
  modal.classList.remove("active");
  document.body.style.overflow = "";
}

function setupTabs() {
  const tabButtons = document.querySelectorAll(".tab-button");
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const tabName = button.getAttribute("data-tab");
      if (tabName) {
        showTab(tabName);
      }
    });
  });
}

function showTab(tabName) {
  document.querySelectorAll(".tab-content").forEach((content) => {
    content.classList.remove("active");
  });

  document.querySelectorAll(".tab-button").forEach((button) => {
    button.classList.remove("active");
  });

  const selectedContent = document.getElementById(tabName);
  const selectedButton = document.querySelector(`[data-tab="${tabName}"]`);

  if (selectedContent) selectedContent.classList.add("active");
  if (selectedButton) selectedButton.classList.add("active");
}

function downloadPDF() {
  alert("La funcionalidad de descarga de PDF estará disponible próximamente");
}

function animateCards() {
  const cards = document.querySelectorAll(".property-card");
  cards.forEach((card, index) => {
    card.style.animation = `slideIn 0.3s ease forwards ${index * 0.1}s`;
  });
}