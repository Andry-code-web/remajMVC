document.addEventListener('DOMContentLoaded', function () {
    // Obtener referencias a elementos del DOM
    const tarjetaCronograma = document.getElementById('tarjetaCronograma');
    const btnCancelarRegistro = document.querySelector('#tarjetaCronograma .boton_cancelar_formulario_cronograma');
    const btnGuardarCronograma = document.getElementById('guardarCronogramaBtn');
    const formularioCronograma = document.getElementById('formulario_cronograma_actividades');

    // Función para abrir el modal de cronograma
    window.abrirModalcronograma = function (remateId) {
        document.getElementById('identificador_remate_asociado').value = remateId;
        tarjetaCronograma.style.display = 'block';
    };

    // Función para ocultar el formulario de registro
    function ocultarFormularioRegistro() {
        tarjetaCronograma.style.display = 'none';
    }

    // Función para obtener todos los valores del formulario
    function obtenerValoresFormulario() {
        const valores = [];
        const fases = ['Publicación e Inscripción', 'Validación de Inscripción', 'Presentación de Ofertas', 'Pago Saldo', 'Validación del Saldo'];

        fases.forEach((fase, index) => {
            const fechaInicio = document.querySelector(`#tarjetaCronograma .seccion_fase:nth-child(${index + 1}) .entrada_fecha:nth-of-type(1)`).value;
            const horaInicio = document.querySelector(`#tarjetaCronograma .seccion_fase:nth-child(${index + 1}) .entrada_hora:nth-of-type(1)`).value;
            const fechaFin = document.querySelector(`#tarjetaCronograma .seccion_fase:nth-child(${index + 1}) .entrada_fecha:nth-of-type(2)`).value;
            const horaFin = document.querySelector(`#tarjetaCronograma .seccion_fase:nth-child(${index + 1}) .entrada_hora:nth-of-type(2)`).value;

            valores.push(`<strong>${fase}</strong><br>
                Inicio: ${fechaInicio} ${horaInicio}<br>
                Fin: ${fechaFin} ${horaFin}<br><br>`);
        });

        return valores.join('');
    }

    // Función para guardar el cronograma inicial
    function guardarCronograma(e) {
        e.preventDefault();
        const idRemate = document.getElementById('identificador_remate_asociado').value;
        const valoresFormulario = obtenerValoresFormulario();

        Swal.fire({
            title: '¿Estás seguro?',
            html: `¿Quieres subir los siguientes cambios?<br><br>
                <strong>ID Remate:</strong> ${idRemate}<br><br>
                ${valoresFormulario}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Estoy de acuerdo',
            cancelButtonText: 'Cancelar',
            showDenyButton: true,
            denyButtonText: 'Retroceder',
            denyButtonColor: '#6c757d',
        }).then((result) => {
            if (result.isConfirmed) {
                formularioCronograma.submit();
            } else if (result.isDenied) {
                // No hacer nada, solo cerrar el SweetAlert
            } else {
                ocultarFormularioRegistro();
            }
        });
    }

    // Event Listeners
    if (btnCancelarRegistro) {
        btnCancelarRegistro.addEventListener('click', ocultarFormularioRegistro);
    }
    if (btnGuardarCronograma) {
        btnGuardarCronograma.addEventListener('click', guardarCronograma);
    }

    // Cerrar la tarjeta al hacer clic fuera de ella
    window.addEventListener('click', function (event) {
        if (event.target === tarjetaCronograma) {
            ocultarFormularioRegistro();
        }
    });

    // Prevenir envío de formulario por defecto
    if (formularioCronograma) {
        formularioCronograma.addEventListener('submit', (e) => e.preventDefault());
    }
});
