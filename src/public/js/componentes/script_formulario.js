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

    // Actualizar colores de la barra de progreso según la sección activa
    const updateColors = (index) => {
        const progressElements = [
            progressIndicator,
            progressLine,
            progressDot,
            ...progressDots
        ];

        if (index === 1) {
            // Sección 2 (Ubicación) - Negro fosforescente
            progressElements.forEach((element) => {
                element.style.background = colors.glowBlack;
                element.style.boxShadow = `0 0 5px ${colors.glowBlack}, 0 0 10px ${colors.glowBlack}, 0 0 15px ${colors.glowBlack}`;
            });
            fixedTitles.style.color = colors.glowBlack;
            navbar && (navbar.style.color = colors.glowBlack);
        } else if (index === 0) {
            // Primera sección - Blanco
            progressElements.forEach((element) => {
                element.style.background = colors.white;
                element.style.boxShadow = `0 0 5px ${colors.white}, 0 0 10px ${colors.white}, 0 0 15px ${colors.white}`;
            });
            fixedTitles.style.color = colors.white;
            navbar && (navbar.style.color = colors.white);
        } else {
            // Otras secciones - Colores originales
            progressElements.forEach((element) => {
                element.style.background = colors.glowColor;
                element.style.boxShadow = `0 0 5px ${colors.glowColor}, 0 0 10px ${colors.glowColor}, 0 0 15px ${colors.glowColor}`;
            });
            fixedTitles.style.color = colors.primaryColor;
            navbar && (navbar.style.color = colors.primaryColor);
        }
    };

    // Cambiar fondo según la sección activa
    const changeBackgroundColor = (index) => {
        secciones.forEach((seccion, i) => {
            if (i === index) {
                seccion.style.backgroundColor = i === 1 ? colors.bgLight : colors.bgDark;
            }
        });
    };

    // Transiciones entre secciones
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
                subtitle.offsetHeight; // Forzar reflujo para reiniciar la animación
                subtitle.style.animation = "glitchAnimation 0.5s ease-out forwards";
            }
        }
    };

    // Validación de formularios
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

    // Manejo de navegación entre secciones
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

    // Inicializar
    secciones[currentIndex].classList.add("active");
    updateColors(currentIndex);
    updateProgress(currentIndex);
    changeBackgroundColor(currentIndex);
});
