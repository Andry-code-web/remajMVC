document.addEventListener("DOMContentLoaded", () => {
    // Elementos comunes

    const secciones = document.querySelectorAll(".seccion");
    const botonesSiguiente = document.querySelectorAll(".siguiente");
    const botonesAnterior = document.querySelectorAll(".anterior");
    const steps = document.querySelectorAll(".step");
    const progressLine = document.querySelector(".progress-line");
    let currentIndex = 0;

   

    // Actualizar progreso visual
    const updateProgress = (index) => {
        const progress = (index / (secciones.length - 1)) * 100;
        progressLine.style.width = `${progress}%`;

        steps.forEach((step, i) => {
            if (i <= index) {
                step.classList.add("active");
            } else {
                step.classList.remove("active");
            }
        });
    };

    // Función para manejar la transición entre secciones
    const animateTransition = async (newIndex) => {
        // Añadir animación de desintegración
        secciones[currentIndex].classList.add("dissolve");
        
        // Esperar a que termine la animación de desintegración
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Ocultar sección actual
        secciones[currentIndex].classList.remove("active", "dissolve");
        
        // Actualizar índice
        currentIndex = newIndex;
        
        // Mostrar nueva sección con animación de integración
        secciones[currentIndex].classList.add("active");
        
        // Actualizar progreso
        updateProgress(currentIndex);
    };

    // Validaciones de formulario
    const validaciones = {
        celular: (value) => {
            const phoneRegex = /^9\d{8}$/;
            return phoneRegex.test(value) ? "" : "El número debe comenzar con 9 y tener 9 dígitos en total";
        },
        dni: (value) => {
            const dniRegex = /^\d{8}$/;
            return dniRegex.test(value) ? "" : "El DNI debe tener exactamente 8 dígitos";
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
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
            return passwordRegex.test(value) ? "" : 
                "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas, números y caracteres especiales";
        }
    };

    // Validación en tiempo real para la contraseña
    const passwordInput = document.querySelector('input[name="contrasena"]');
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            const prevError = this.nextElementSibling;
            if (prevError && prevError.classList.contains('error-message')) {
                prevError.remove();
            }

            const errorMessage = validaciones.contrasena(this.value);
            if (errorMessage) {
                const errorElement = document.createElement("p");
                errorElement.classList.add("error-message");
                errorElement.textContent = errorMessage;
                this.insertAdjacentElement("afterend", errorElement);
                this.classList.add("error");
            } else {
                this.classList.remove("error");
            }
        });
    }

    // Función de validación del formulario
    const isFormValid = (form) => {
        const inputs = form.querySelectorAll("input[required], select[required]");
        let isValid = true;

        form.querySelectorAll(".error-message").forEach((msg) => msg.remove());

        inputs.forEach((input) => {
            let errorMessage = "";

            if (input.value.trim() === "") {
                errorMessage = "Este campo es obligatorio.";
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
                    errorMessage = "Debes ser mayor de 18 años.";
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



    // Evento de finalización del registro
    document.querySelector(".finalizar").addEventListener("click", async (e) => {
        e.preventDefault();
        
        const form = e.target.closest('form');
        if (!isFormValid(form)) {
            return;
        }

        const datos = {
            nombre_apellidos: document.querySelector("[name='nombre_apellidos']").value.trim(),
            correo: document.querySelector("[name='EMAIL']").value.trim(),
            confirmar_correo: document.querySelector("[name='confirmar_email']").value.trim(),
            estado_civil: document.querySelector("[name='estado_civil']").value,
            fecha_nacimiento: document.querySelector("[name='fecha_nacimiento']").value,
            sexo: document.querySelector("[name='sexo']").value,
            dni: document.querySelector("[name='dni']").value.trim(),
            celular: document.querySelector("[name='celular']").value.trim(),
            departamento: document.querySelector("[name='departamento']").value.trim(),
            provincia: document.querySelector("[name='provincia']").value.trim(),
            distrito: document.querySelector("[name='distrito']").value.trim(),
            direccion: document.querySelector("[name='direccion']").value.trim(),
            usuario: document.querySelector("[name='usuario']").value.trim(),
            contrasena: document.querySelector("[name='contrasena']").value,
            terminos_condiciones: document.querySelector("[name='terminos_condiciones']").checked,
        };

        try {
            const response = await fetch("/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(datos),
            });

            const result = await response.json();

            if (response.ok) {
                await Swal.fire({
                    title: "¡Registro exitoso!",
                    text: "¡Bienvenido a REMAJUD!",
                    icon: "success",
                    confirmButtonText: "Iniciar sesión"
                });
                window.location.href = "/auth/login";
            } else {
                Swal.fire({
                    title: "Error en el registro",
                    text: result.message,
                    icon: "error",
                });
            }
        } catch (error) {
            console.error("Error al enviar el formulario:", error);
            Swal.fire({
                title: "Error interno",
                text: "Hubo un problema al procesar tu registro. Intenta nuevamente.",
                icon: "error",
            });
        }
    });

    //

    // Inicialización
    secciones[currentIndex].classList.add("active");
    updateProgress(currentIndex);
});