document.addEventListener('DOMContentLoaded', function () {
    // Obtener referencias a elementos del DOM
    const tarjetaCronograma = document.getElementById('tarjetaCronograma');
    const tarjetaEdicionCronograma = document.getElementById('tarjetaEdicionCronograma');
    const btnEditar = document.querySelector('.boton_editar_formulario_cronograma');
    const btnCancelarEdicion = document.querySelector('#tarjetaEdicionCronograma .boton_cancelar_formulario_cronograma');
    const btnCancelarRegistro = document.querySelector('#tarjetaCronograma .boton_cancelar_formulario_cronograma');
    const btnGuardarCronograma = document.getElementById('guardarCronogramaBtn');
    const btnGuardarCambios = document.querySelector('#tarjetaEdicionCronograma .boton_guardar_formulario_cronograma');
    const formularioCronograma = document.getElementById('formulario_cronograma_actividades');
    const formularioEdicionCronograma = document.getElementById('formulario_edicion_cronograma');
  
    // Función para abrir el modal de cronograma
    window.abrirModalcronograma = function (remateId) {
      document.getElementById('identificador_remate_asociado').value = remateId;
      tarjetaCronograma.style.display = 'block';
    };
  
    // Función para mostrar el formulario de edición
    function mostrarFormularioEdicion() {
      tarjetaCronograma.style.display = 'none';
      tarjetaEdicionCronograma.style.display = 'block';
    }
  
    // Función para ocultar el formulario de edición
    function ocultarFormularioEdicion() {
      tarjetaEdicionCronograma.style.display = 'none';
      tarjetaCronograma.style.display = 'block';
    }
  
    // Función para ocultar el formulario de registro
    function ocultarFormularioRegistro() {
      tarjetaCronograma.style.display = 'none';
    }
  
    // Función para validar fechas
    function validarFechas(fechaInicio, fechaFin) {
      const inicio = new Date(fechaInicio);
      const fin = new Date(fechaFin);
      return inicio <= fin;
    }
  
    // Función para obtener los cambios del formulario de edición
    function obtenerCambiosEdicion() {
      const cambios = [];
      const fases = ['Publicación e Inscripción', 'Validación de Inscripción', 'Presentación de Ofertas', 'Pago Saldo', 'Validación del Saldo'];
  
      fases.forEach((fase, index) => {
        const fechaInicio = document.querySelector(`#tarjetaEdicionCronograma .seccion_fase:nth-child(${index + 1}) .entrada_fecha:nth-of-type(1)`).value;
        const horaInicio = document.querySelector(`#tarjetaEdicionCronograma .seccion_fase:nth-child(${index + 1}) .entrada_hora:nth-of-type(1)`).value;
        const fechaFin = document.querySelector(`#tarjetaEdicionCronograma .seccion_fase:nth-child(${index + 1}) .entrada_fecha:nth-of-type(2)`).value;
        const horaFin = document.querySelector(`#tarjetaEdicionCronograma .seccion_fase:nth-child(${index + 1}) .entrada_hora:nth-of-type(2)`).value;
  
        cambios.push(`<strong>${fase}</strong><br>
          Inicio: ${fechaInicio} ${horaInicio}<br>
          Fin: ${fechaFin} ${horaFin}<br><br>`);
      });
  
      return cambios.join('');
    }
  
    // Función para guardar cambios del formulario de edición
    function guardarCambiosEdicion(e) {
      e.preventDefault();
      const cambios = obtenerCambiosEdicion();
  
      Swal.fire({
        title: '¿Estás seguro?',
        html: `¿Quieres guardar los siguientes cambios?<br><br>${cambios}`,
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
          // Aquí irían las operaciones para guardar los cambios
          alert('Cambios guardados exitosamente');
          ocultarFormularioEdicion();
        } else if (result.isDenied) {
          // No hacer nada, mantener el formulario de edición abierto
        } else {
          ocultarFormularioEdicion();
        }
      });
    }
  
    // Función para guardar el cronograma inicial
    function guardarCronograma(e) {
      e.preventDefault();
      const fase = document.getElementById('actividad_cronograma').value;
      const idRemate = document.getElementById('identificador_remate_asociado').value;
      const fechaInicio = document.getElementById('fecha_inicio_actividad').value;
      const fechaFin = document.getElementById('fecha_finalizacion_actividad').value;
  
      Swal.fire({
        title: '¿Estás seguro?',
        html: `¿Quieres subir los siguientes cambios?<br><br>
               <strong>Fase:</strong> ${fase}<br>
               <strong>ID Remate:</strong> ${idRemate}<br>
               <strong>Fecha Inicio:</strong> ${fechaInicio}<br>
               <strong>Fecha Fin:</strong> ${fechaFin}`,
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
    if (btnEditar) {
      btnEditar.addEventListener('click', mostrarFormularioEdicion);
    }
    if (btnCancelarEdicion) {
      btnCancelarEdicion.addEventListener('click', ocultarFormularioEdicion);
    }
    if (btnCancelarRegistro) {
      btnCancelarRegistro.addEventListener('click', ocultarFormularioRegistro);
    }
    if (btnGuardarCambios) {
      btnGuardarCambios.addEventListener('click', guardarCambiosEdicion);
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
    if (formularioEdicionCronograma) {
      formularioEdicionCronograma.addEventListener('submit', (e) => e.preventDefault());
    }
  });