// Variables globales
let currentRemateId = null;

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Botón nuevo remate
    document.getElementById('btnNuevoRemate').addEventListener('click', () => {
        currentRemateId = null;
        document.getElementById('modalTitle').textContent = 'Nuevo Remate';
        document.getElementById('modalRemate').style.display = 'block';
        document.getElementById('formRemate').reset();
    });

    // Cerrar modal
    document.querySelector('.close').addEventListener('click', cerrarModal);

    // Form submit
    document.getElementById('formRemate').addEventListener('submit', handleSubmitRemate);

    // Filtros
    document.getElementById('searchRemate').addEventListener('input', filtrarRemates);
    document.getElementById('filterEstado').addEventListener('change', filtrarRemates);
});

// Funciones
function cerrarModal() {
    document.getElementById('modalRemate').style.display = 'none';
}

async function editarRemate(id) {
    try {
        const response = await fetch(`/api/remates/${id}`);
        const remate = await response.json();
        
        currentRemateId = id;
        document.getElementById('modalTitle').textContent = 'Editar Remate';
        
        // Rellenar el formulario con los datos del remate
        const form = document.getElementById('formRemate');
        Object.keys(remate).forEach(key => {
            const input = form.elements[key];
            if (input) {
                input.value = remate[key];
            }
        });

        document.getElementById('modalRemate').style.display = 'block';
    } catch (error) {
        console.error('Error al cargar el remate:', error);
        alert('Error al cargar los datos del remate');
    }
}

async function handleSubmitRemate(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const remateData = Object.fromEntries(formData.entries());
    
    try {
        const url = currentRemateId 
            ? `/api/remates/${currentRemateId}`
            : '/api/remates';
            
        const method = currentRemateId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(remateData),
        });

        if (!response.ok) throw new Error('Error al guardar el remate');

        // Recargar la página para mostrar los cambios
        window.location.reload();
    } catch (error) {
        console.error('Error:', error);
        alert('Error al guardar el remate');
    }
}

function filtrarRemates() {
    const searchTerm = document.getElementById('searchRemate').value.toLowerCase();
    const estadoFilter = document.getElementById('filterEstado').value;
    
    const rows = document.querySelectorAll('.remates-table tbody tr');
    
    rows.forEach(row => {
        const ubicacion = row.cells[1].textContent.toLowerCase();
        const estado = row.cells[3].textContent.toLowerCase();
        
        const matchSearch = ubicacion.includes(searchTerm);
        const matchEstado = !estadoFilter || estado === estadoFilter;
        
        row.style.display = matchSearch && matchEstado ? '' : 'none';
    });
}

async function verDetalles(id) {
    window.location.href = `/admin/remates/${id}/detalles`;
}