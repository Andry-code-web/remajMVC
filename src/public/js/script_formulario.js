import NetworkAnimation from "./network.js";
import { colors } from "./colors.js";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("particleCanvas");
    const networkAnimation = new NetworkAnimation(canvas);

    // Elementos comunes
    const secciones = document.querySelectorAll(".seccion");
    const botonesSiguiente = document.querySelectorAll(".siguiente");
    const botonesAnterior = document.querySelectorAll(".anterior");
    const body = document.body;
    const navbar = document.querySelector(".navbar");
    const fixedTitles = document.querySelector(".fixed-titles");
    const progressIndicator = document.querySelector(".progress-indicator");
    const progressLine = document.querySelector(".progress-active-line");
    const progressDot = document.querySelector(".progress-active-dot");
    const progressDots = document.querySelectorAll(".progress-dot");

    let currentIndex = 0;

    // Actualizar progreso visual
    const updateProgress = (index) => {
        const totalSections = secciones.length;
        const progress = (index / (totalSections - 1)) * 100;

        progressLine.style.height = `${progress}%`;
        progressDot.style.top = `${progress}%`;

        progressDots.forEach((dot, i) => {
            const dotProgress = (i / (totalSections - 1)) * 100;
            dot.classList.toggle("active", dotProgress <= progress);
        });
    };

    // Actualizar colores del título fijo y navbar
    const updateColors = (index) => {
        const currentColor = index === 1 ? colors.glowBlack : colors.glowColor;
        
        // Actualizar colores de la barra de progreso
        document.documentElement.style.setProperty('--progress-color', currentColor);
        document.documentElement.style.setProperty('--progress-shadow', `0 0 5px ${currentColor}, 0 0 10px ${currentColor}, 0 0 15px ${currentColor}`);
        
        // Actualizar colores del título y navbar
        if (index === 1) {
            fixedTitles.style.color = colors.bgDark;
            navbar && (navbar.style.color = colors.bgDark);
        } else {
            fixedTitles.style.color = colors.primaryColor;
            navbar && (navbar.style.color = colors.primaryColor);
        }
    };

    // Cambiar el color de fondo de cada sección
    const changeBackgroundColor = (index) => {
        secciones.forEach((seccion, i) => {
            if (i === index) {
                seccion.style.backgroundColor = i === 1 ? colors.bgLight : colors.bgDark;
            }
        });
    };

    // Animar la transición entre secciones
    const animateTransition = (index) => {
        secciones[currentIndex].classList.remove("active");
        currentIndex = index;

        if (currentIndex < secciones.length) {
            const nextSection = secciones[currentIndex];
            nextSection.classList.add("active");

            updateColors(currentIndex);
            updateProgress(currentIndex);
            changeBackgroundColor(currentIndex);

            const subtitle = nextSection.querySelector(".subtitle");
            if (subtitle) {
                subtitle.style.animation = "none";
                subtitle.offsetHeight;
                subtitle.style.animation = "glitchAnimation 0.5s ease-out forwards";
            }
        }
    };

    // Validación de formularios
    const isFormValid = (form) => {
        const inputs = form.querySelectorAll("input[required], select[required]");
        let isValid = true;

        // Eliminar mensajes de error existentes
        form.querySelectorAll(".error-message").forEach((msg) => msg.remove());

        inputs.forEach((input) => {
            if (input.value.trim() === "") {
                isValid = false;
                const errorMessage = document.createElement("p");
                errorMessage.classList.add("error-message");
                errorMessage.textContent = "Este campo es obligatorio.";
                input.insertAdjacentElement("afterend", errorMessage);
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
                    input.insertAdjacentElement("afterend", errorMessage);
                }
            }
        });

        return isValid;
    };

    // Manejar botones de navegación
    botonesSiguiente.forEach((boton) => {
        boton.addEventListener("click", () => {
            const currentForm = secciones[currentIndex].querySelector("form");
            if (!currentForm || isFormValid(currentForm)) {
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
    changeBackgroundColor(currentIndex);
});