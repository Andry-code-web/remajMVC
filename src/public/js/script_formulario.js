import NetworkAnimation from "./network.js";

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
        if (index === 1) { // Sección específica (ubicación)
            fixedTitles.style.color = "#000000";
            navbar.style.color = "#000000";
            document.documentElement.style.setProperty('--glow-color', '#000000');
        } else {
            fixedTitles.style.color = "";
            navbar.style.color = "#FFE5D0";
            document.documentElement.style.setProperty('--glow-color', '#FFE5D0');
        }
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

            const subtitle = nextSection.querySelector(".subtitle");
            if (subtitle) {
                subtitle.style.animation = "none";
                subtitle.offsetHeight; // Forzar el reflujo para reiniciar la animación
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
});
