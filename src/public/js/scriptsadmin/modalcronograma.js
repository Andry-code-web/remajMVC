// Funciones del modal
function abrirModalcronograma(remateId) {
  // Crear y añadir el overlay
  const overlay = document.createElement('div');
  overlay.className = 'overlay_sistema_remates';
  document.body.appendChild(overlay);
  
  // Mostrar el modal y establecer el ID del remate
  const modal = document.getElementById('tarjetaCronograma');
  const remateIdInput = document.getElementById('remate_id');
  remateIdInput.value = remateId;
  modal.style.display = 'block';
}

 // Llenar el campo ID REMATE con el ID del remate
 identificadorRemateAsociado.value = remateId;


 

 