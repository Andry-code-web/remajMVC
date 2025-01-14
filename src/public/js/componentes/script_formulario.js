
import NetworkAnimation from "./network.js";

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("particleCanvas");
    const networkAnimation = new NetworkAnimation(canvas);

    // Elementos comunes
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

    // Colores definidos
    const colors = {
        white: '#ffffff',
        black: '#000000'
    };

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

    // Actualizar colores según la sección
const updateColors = (index) => {
    const progressElements = [progressIndicator, progressLine, progressDot, ...progressDots];
    
    if (index === 1) { // Sección de Ubicación
        // Cambiar a negro fosforescente para la barra de progreso
        progressElements.forEach(element => {
            element.style.backgroundColor = colors.black;
            element.style.boxShadow = `0 0 5px ${colors.black}, 0 0 10px ${colors.black}, 0 0 15px ${colors.black}`;
        });
        // Color normal para el título
        fixedTitles.style.color = colors.black;
        fixedTitles.style.textShadow = 'none';
        
        // Cambiar el color del subtítulo a negro
        const subtitleUbicacion = document.querySelector('.seccion2 .subtitle');
        if (subtitleUbicacion) {
            subtitleUbicacion.style.color = colors.black;
        }
    } else { // Sección de Registro y Usuario
        // Cambiar a blanco fosforescente para la barra de progreso
        progressElements.forEach(element => {
            element.style.backgroundColor = colors.white;
            element.style.boxShadow = `0 0 5px ${colors.white}, 0 0 10px ${colors.white}, 0 0 15px ${colors.white}`;
        });
        // Color normal para el título
        fixedTitles.style.color = colors.white;
        fixedTitles.style.textShadow = 'none';
        
        // Restablecer el color del subtítulo a blanco
        const subtitleUbicacion = document.querySelector('.seccion2 .subtitle');
        if (subtitleUbicacion) {
            subtitleUbicacion.style.color = colors.white;
        }
    }
};

    // Cambiar fondo según la sección activa
    const changeBackgroundColor = (index) => {
        secciones.forEach((seccion, i) => {
            if (i === index) {
                seccion.style.backgroundColor = ""; 
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
                subtitle.offsetHeight;
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

    // numero telefonico 
    const isPhoneValid = (phone) => {
        const phoneValue = phone.value.trim();
        const phoneRegex = /^\d{9}$/;
        if (!phoneRegex.test(phoneValue)) {
            const errorMessage = document.createElement("p");
            errorMessage.classList.add("error-message");
            errorMessage.textContent = "Debes ingresar un número de teléfono válido.";
            phone.insertAdjacentElement("afterend", errorMessage);
            return false;
            }
            return true;
            };
    
        
        // dni 
        const isDniValid = (dni) => {
            const dniValue = dni.value.trim();
            const dniRegex = /^\d{8}$/;
            if (!dniRegex.test(dniValue)) {
                const errorMessage = document.createElement("p");
                errorMessage.classList.add("error-message");
                errorMessage.textContent = "Debes ingresar un DNI válido.";
                dni.insertAdjacentElement("afterend", errorMessage);
                return false;
            }
            return true;
            };
        

        
    // Eventos de navegación
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


    
    secciones[currentIndex].classList.add("active");
    updateColors(currentIndex);
    updateProgress(currentIndex);
    changeBackgroundColor(currentIndex);
});