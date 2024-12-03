document.addEventListener('DOMContentLoaded', function() { 
    // Obtener los elementos del DOM 
    const button = document.getElementById('menu_toggle'); 
    const tablero = document.getElementById('tablero'); 
    const textButton = button.querySelector('.text_buton'); 
    const tableroTitulo = document.getElementById('tablero_titulo'); // Título del tablero 
    const flechaRegreso = document.getElementById('flecha_regreso'); // Flecha de regreso 
    const formularioLogin = document.getElementById('formulario_login'); // Formulario de login 
    const subMenu = document.querySelector('.sub_menu'); // Menú secundario (LOGIN, INICIO, etc.) 
    const loginLink = document.getElementById('login_link'); // Enlace LOGIN 
    let isTableroVisible = false;  
    let isDragging = false; 
    let wasDragging = false; // Nueva bandera para diferenciar clic y arrastre 
    let offsetX, offsetY;  
    // Mostrar el formulario de login cuando se hace clic en "LOGIN" 
    loginLink.addEventListener('click', function(e) { 
        e.preventDefault(); // Prevenir el comportamiento predeterminado del enlace 
        // Cambiar el título grande a "INICIO DE SESIÓN" 
        cambiarTitulo('INICIO DE SESIÓN'); 
        // Mostrar el formulario de login 
        formularioLogin.style.display = 'block'; 
        // Ocultar otras partes del tablero si es necesario 
        subMenu.style.display = 'none'; 
        // Mostrar la flecha de regreso 
        flechaRegreso.style.display = 'block'; 
    }); 
    // Función para cambiar el título dinámicamente con clases 
    function cambiarTitulo(nuevoTitulo) {  
        tableroTitulo.classList.remove('inicio_sesion'); // Eliminar la clase si la tiene 
        // Cambiar el texto y agregar la nueva clase 
        tableroTitulo.innerHTML = nuevoTitulo;  
        if (nuevoTitulo === 'INICIO DE SESIÓN') {  
            tableroTitulo.classList.add('inicio_sesion'); // Añadir la clase cuando el título sea 'INICIO DE SESIÓN' 
        } 
    } 
    // Cuando la flecha de regreso se hace clic 
    flechaRegreso.addEventListener('click', function() {  
        
        // Desplazarse suavemente al inicio del tablero 
        tablero.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
        // Ocultar la flecha de regreso después de hacer clic 
        flechaRegreso.style.display = 'none'; 
        // Ocultar el formulario de login 
        formularioLogin.style.display = 'none'; 
        // Volver a mostrar el menú 
        subMenu.style.display = 'block'; 
        // Restaurar el título al original cuando se cierra el formulario 
        tableroTitulo.innerHTML = 'Remajud <br> Subastas'; 
        tableroTitulo.classList.remove('inicio_sesion'); 
    }); 
    // Cuando se comienza a arrastrar el botón 
    button.addEventListener('mousedown', (e) => { 
        isDragging = true; 
        wasDragging = false; 
        offsetX = e.clientX - button.offsetLeft; 
        offsetY = e.clientY - button.offsetTop; 
        button.style.transition = 'none'; 
    }); 
    // Mientras se arrastra el botón 
    document.addEventListener('mousemove', (e) => { 
        if (isDragging) { 
            let newLeft = e.clientX - offsetX; 
            let newTop = e.clientY - offsetY; 
            newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - button.offsetWidth)); 
            newTop = Math.max(0, Math.min(newTop, window.innerHeight - button.offsetHeight)); 
            button.style.left = newLeft + 'px'; 
            button.style.top = newTop + 'px'; 
            wasDragging = true; 
        } 
    }); 
    // Cuando se deja de arrastrar el botón 
    document.addEventListener('mouseup', () => { 
        if (isDragging) { 
            isDragging = false; 
            let closestPosition = allowedPositions[0]; 
            let minDistance = Infinity; 
            allowedPositions.forEach(position => { 
                const distance = Math.sqrt(Math.pow(button.offsetLeft - position.left, 2) + Math.pow(button.offsetTop - position.top, 2)); 
                if (distance < minDistance) { 
                    minDistance = distance; 
                    closestPosition = position; 
                } 
            }); 
            // Ajusta la transición para hacerlo más suave 
            button.style.transition = 'left 1.5s cubic-bezier(0.4, 0.0, 0.2, 1), top 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)'; 
            button.style.left = closestPosition.left + 'px'; 
            button.style.top = closestPosition.top + 'px'; 
        } 
    }); 
    // Mostrar u ocultar el tablero con clic en el botón 
    button.addEventListener('click', function () { 
        if (wasDragging) { 
            wasDragging = false; 
            return; 
        } 
        // Alterna la visibilidad del tablero 
        isTableroVisible = !isTableroVisible; 
        tablero.style.display = isTableroVisible ? 'block' : 'none'; 
        textButton.textContent = isTableroVisible ? 'CLOSE' : 'MENU'; 
        if (isTableroVisible) { 
            positionTablero(); 
        } 
    }); 
    // Posiciona el tablero en función de la posición del botón 
    function positionTablero() { 
        const buttonRect = button.getBoundingClientRect(); 
        const tableroWidth = tablero.offsetWidth; 
        const tableroHeight = tablero.offsetHeight; 
        if (buttonRect.left < window.innerWidth / 3) { 
            tablero.style.left = buttonRect.right + 10 + 'px'; 
            tablero.style.top = buttonRect.top + (buttonRect.height / 2) - (tableroHeight / 2) + 'px'; 
        } else if (buttonRect.left > (window.innerWidth * 2) / 3) { 
            tablero.style.left = buttonRect.left - tableroWidth - 10 + 'px'; 
            tablero.style.top = buttonRect.top + (buttonRect.height / 2) - (tableroHeight / 2) + 'px'; 
        } else { 
            tablero.style.left = buttonRect.left + (buttonRect.width / 2) - (tableroWidth / 2) + 'px'; 
            tablero.style.top = buttonRect.top - tableroHeight - 10 + 'px'; 
        } 
        // Aplica una transición suave 
        tablero.style.transition = 'all 2s ease-in-out'; 
    } 
    // Define las posiciones permitidas para el botón 
    const allowedPositions = [ 
        { left: 20, top: (window.innerHeight - button.offsetHeight) / 2 }, // Lado izquierdo 
        { left: window.innerWidth - button.offsetWidth - 20, top: (window.innerHeight - button.offsetHeight) / 2 }, // Lado derecho 
        { left: (window.innerWidth - button.offsetWidth) / 2, top: window.innerHeight - button.offsetHeight - 30 } // Centro inferior 
    ]; 
    // Posición inicial en el centro inferior 
    let currentPosition = allowedPositions[2]; 
    button.style.left = currentPosition.left + 'px'; 
    button.style.top = currentPosition.top + 'px'; 
    button.style.transition = 'all 1.5s cubic-bezier(0.4, 0.0, 0.2, 1)'; 
    // Actualiza las posiciones permitidas en el redimensionamiento de la ventana 
    window.addEventListener('resize', () => { 
        allowedPositions.forEach(position => { 
            position.left = Math.max(0, Math.min(position.left, window.innerWidth - button.offsetWidth)); 
            position.top = Math.max(0, Math.min(position.top, window.innerHeight - button.offsetHeight)); 
        }); 
        const closestPosition = findClosestPosition(button.offsetLeft, button.offsetTop); 
        button.style.left = closestPosition.left + 'px'; 
        button.style.top = closestPosition.top + 'px'; 
        if (isTableroVisible) { 
            positionTablero(); 
        } 
    }); 
    // Encuentra la posición más cercana entre las posiciones permitidas 
    function findClosestPosition(x, y) { 
        let closestPosition = allowedPositions[0]; 
        let minDistance = Infinity; 
        allowedPositions.forEach(position => { 
            const distance = Math.sqrt(Math.pow(x - position.left, 2) + Math.pow(y - position.top, 2)); 
            if (distance < minDistance) { 
                minDistance = distance; 
                closestPosition = position; 
            } 
        }); 
        return closestPosition; 
    } 
}); 