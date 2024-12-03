import NetworkAnimation from "./network.js";
document.addEventListener("DOMContentLoaded", () => {
  const canvas = document.getElementById("particleCanvas");
  const networkAnimation = new NetworkAnimation(canvas);
  const secciones = document.querySelectorAll(".seccion");
  const botonesSiguiente = document.querySelectorAll(".siguiente");
  const botonesAnterior = document.querySelectorAll(".anterior");
  const body = document.body;
  const fixedTitles = document.querySelector(".fixed-titles");
  const progressIndicator = document.querySelector(".progress-indicator");
  const progressLine = document.querySelector(".progress-active-line");
  const progressDot = document.querySelector(".progress-active-dot");
  const progressDots = document.querySelectorAll(".progress-dot");
  let currentIndex = 0;
  const updateProgress = (index) => {
    const totalSections = secciones.length;
    const progress = (index / (totalSections - 1)) * 100;
    
    progressLine.style.height = `${progress}%`;
    progressDot.style.top = `${progress}%`;
    
    progressDots.forEach((dot, i) => {
      const dotProgress = (i / (totalSections - 1)) * 100;
      if (dotProgress <= progress) {
        dot.classList.add("active");
      } else {
        dot.classList.remove("active");
      }
    });
  };
  const updateColors = (index) => {
    if (index === 1) {
      fixedTitles.style.color = "#000000";
      document.documentElement.style.setProperty('--glow-color', '#000000');
    } else {
      fixedTitles.style.color = "";
      document.documentElement.style.setProperty('--glow-color', '#FFE5D0');
    }
  };
  const animateTransition = (index) => {
    secciones[currentIndex].classList.remove("active");
    currentIndex = index;
    if (currentIndex < secciones.length) {
      const nextSection = secciones[currentIndex];
      nextSection.classList.add("active");
      
      updateColors(currentIndex);
      updateProgress(currentIndex);
      const subtitle = nextSection.querySelector(".subtitle");
      subtitle.style.animation = "none";
      subtitle.offsetHeight;
      subtitle.style.animation = "glitchAnimation 0.5s ease-out forwards";
    }
  };
  const isFormValid = (form) => {
    const inputs = form.querySelectorAll("input[required], select[required]");
    let isValid = true;
    form.querySelectorAll(".error-message").forEach((msg) => msg.remove());
    inputs.forEach((input) => {
      if (input.value.trim() === "") {
        isValid = false;
        const errorMessage = document.createElement("p");
        errorMessage.classList.add("error-message");
        errorMessage.textContent = "Este campo es obligatorio.";
        if (!input.nextElementSibling || !input.nextElementSibling.classList.contains("error-message")) {
          input.insertAdjacentElement("afterend", errorMessage);
        }
      }
      if (input.name === "fecha_nacimiento") {
        const fechaNacimiento = new Date(input.value);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
        const mes = hoy.getMonth() - fechaNacimiento.getMonth();
        
        if (edad < 18 || (edad === 18 && mes < 0) || (edad === 18 && mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
          isValid = false;
          const errorMessage = document.createElement("p");
          errorMessage.classList.add("error-message");
          errorMessage.textContent = "Debes ser mayor de 18 años.";
          if (!input.nextElementSibling || !input.nextElementSibling.classList.contains("error-message")) {
            input.insertAdjacentElement("afterend", errorMessage);
          }
        }
      }
    });
    return isValid;
  };
  botonesSiguiente.forEach((boton) => {
    boton.addEventListener("click", () => {
      const currentForm = secciones[currentIndex].querySelector("form");
      if (currentForm && isFormValid(currentForm)) {
        if (currentIndex < secciones.length - 1) {
          animateTransition(currentIndex + 1);
        }
      }
    });
  });
  botonesAnterior.forEach((boton) => {
    boton.addEventListener("click", () => {
      if (currentIndex > 0) {
        animateTransition(currentIndex - 1);
      }
    });
  });
  // Inicializar la primera sección
  secciones[currentIndex].classList.add("active");
  updateColors(currentIndex);
  updateProgress(currentIndex);
});