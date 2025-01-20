document.addEventListener("DOMContentLoaded", () => {
    const secciones = document.querySelectorAll(".seccion");
    const botonesSiguiente = document.querySelectorAll(".siguiente");
    const botonesAnterior = document.querySelectorAll(".anterior");
    const steps = document.querySelectorAll(".step");
    const progressLine = document.querySelector(".progress-line");
    const progressLabel = document.querySelector(".progress-label");
    let currentIndex = 0;

    // Actualizar progreso visual
    const updateProgress = (index) => {
        const progress = (index / (secciones.length - 1)) * 100;
        const labels = ['Registro', 'Ubicación', 'Usuario'];
        
        progressLine.style.setProperty('--progress', `${progress}%`);

        // Actualizar estados de los pasos
        steps.forEach((step, i) => {
            if (i < index) {
                step.classList.add("completed");
                step.classList.remove("active");
            } else if (i === index) {
                step.classList.add("active");
                step.classList.remove("completed");
            } else {
                step.classList.remove("active", "completed");
            }
        });

        // Animar el cambio de etiqueta
        progressLabel.style.opacity = "0";
        progressLabel.style.transform = "translateY(10px)";
        
        setTimeout(() => {
            progressLabel.textContent = labels[index];
            progressLabel.style.opacity = "1";
            progressLabel.style.transform = "translateY(0)";
        }, 300);
    };

    // Función para manejar la transición entre secciones
    const animateTransition = async (newIndex) => {
        secciones[currentIndex].classList.add("dissolve-out");
        await new Promise(resolve => setTimeout(resolve, 500));
        secciones[currentIndex].classList.remove("active", "dissolve-out");
        currentIndex = newIndex;
        secciones[currentIndex].classList.add("active");
        updateProgress(currentIndex);
    };

    // Validaciones
    const validaciones = {
        dni: (value) => {
            if (!/^\d{8}$/.test(value)) {
                return "El DNI debe tener exactamente 8 dígitos";
            }
            if (/^(\d)\1{7}$/.test(value)) {
                return "DNI inválido: no puede contener todos los dígitos iguales";
            }
            if (['12345678', '87654321'].includes(value)) {
                return "DNI inválido: no puede ser una secuencia numérica";
            }
            for (let i = 0; i < value.length - 3; i++) {
                const pattern = value.slice(i, i + 4);
                if (/(\d)\1{3}/.test(pattern)) {
                    return "DNI inválido: no puede contener 4 números iguales consecutivos";
                }
            }
            return "";
        },
        celular: (value) => {
            const phoneRegex = /^9\d{8}$/;
            return phoneRegex.test(value) ? "" : "El número debe comenzar con 9 y tener 9 dígitos en total";
        },
        EMAIL: (value) => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(value) ? "" : "Ingrese un correo electrónico válido";
        },
        confirmar_email: (value, form) => {
            const email = form.querySelector('[name="EMAIL"]').value;
            return value === email ? "" : "Los correos electrónicos no coinciden";
        },
        contrasena: (value) => {
            if (value.length < 8) return "La contraseña debe tener al menos 8 caracteres";
            if (!/[A-Z]/.test(value)) return "La contraseña debe incluir al menos una mayúscula";
            if (!/[a-z]/.test(value)) return "La contraseña debe incluir al menos una minúscula";
            if (!/\d/.test(value)) return "La contraseña debe incluir al menos un número";
            if (!/[!@#$%^&*]/.test(value)) return "La contraseña debe incluir al menos un carácter especial (!@#$%^&*)";
            return "";
        }
    };

    // Generador de alias
    const generarAliasAleatorio = () => {
        const prefijos = ['remajud', 'user', 'member'];
        const adjetivos = ['legal', 'justice', 'law', 'court'];
        const prefijo = prefijos[Math.floor(Math.random() * prefijos.length)];
        const adjetivo = adjetivos[Math.floor(Math.random() * adjetivos.length)];
        let numero = '';
        for (let i = 0; i < 4; i++) {
            numero += Math.floor(Math.random() * 10);
        }
        return `${prefijo}_${adjetivo}${numero}`;
    };

    // Configuración del generador de alias
    const btnGenerarAlias = document.getElementById('generar-alias');
    const aliasContainer = document.getElementById('alias-container');
    const aliasCreado = document.getElementById('alias-creado');
    const inputUsuario = document.getElementById('usuario');
    const btnCopiarAlias = document.getElementById('copiar-alias');

    if (btnGenerarAlias) {
        btnGenerarAlias.addEventListener('click', () => {
            const alias = generarAliasAleatorio();
            aliasCreado.textContent = alias;
            aliasContainer.classList.add('show');
        });
    }

    if (btnCopiarAlias) {
        btnCopiarAlias.addEventListener('click', () => {
            const alias = aliasCreado.textContent;
            navigator.clipboard.writeText(alias).then(() => {
                inputUsuario.value = alias;
                btnCopiarAlias.innerHTML = '<i class="bi bi-clipboard-check-fill"></i>';
                setTimeout(() => {
                    btnCopiarAlias.innerHTML = '<i class="bi bi-clipboard"></i>';
                    aliasContainer.classList.remove('show');
                }, 2000);
            });
        });
    }

    // Validación del formulario
    const isFormValid = (form) => {
        const inputs = form.querySelectorAll("input[required], select[required]");
        let isValid = true;

        form.querySelectorAll(".error-message").forEach((msg) => msg.remove());

        inputs.forEach((input) => {
            let errorMessage = "";

            if (input.value.trim() === "") {
                errorMessage = "Este campo es obligatorio";
            } 
            else if (validaciones[input.name]) {
                errorMessage = validaciones[input.name](input.value, form);
            }

            if (input.name === "fecha_nacimiento" && input.value) {
                const fechaNacimiento = new Date(input.value);
                const hoy = new Date();
                const edad = hoy.getFullYear() - fechaNacimiento.getFullYear();
                const mes = hoy.getMonth() - fechaNacimiento.getMonth();

                if (edad < 18 || (edad === 18 && mes < 0) || (edad === 18 && mes === 0 && hoy.getDate() < fechaNacimiento.getDate())) {
                    errorMessage = "Debes ser mayor de 18 años";
                }
            }

            if (errorMessage) {
                isValid = false;
                const errorElement = document.createElement("p");
                errorElement.classList.add("error-message");
                errorElement.textContent = errorMessage;
                input.insertAdjacentElement("afterend", errorElement);
                input.classList.add("error");
            } else {
                input.classList.remove("error");
            }
        });

        return isValid;
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

    // Inicialización
    secciones[currentIndex].classList.add("active");
    progressLabel.classList.add("show");
    updateProgress(currentIndex);
});