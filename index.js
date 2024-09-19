function logout() {
    localStorage.removeItem('user');
    window.location.href = 'index.html';
}



// Archivo script.js

const casas = document.querySelectorAll('path'); // Selecciona todas las "casas" en el SVG
let isAdmin = false; // Variable que simula si el usuario es administrador o no

// Cargar el estado guardado desde localStorage cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    try {
        casas.forEach((casa, index) => {
            const estadoGuardado = localStorage.getItem(`casa_${index}`);
            const bloqueada = localStorage.getItem(`bloqueada_${index}`);

            if (estadoGuardado) {
                casa.classList.remove('disponible', 'vendido', 'reservado');
                casa.classList.add(estadoGuardado);
                casa.setAttribute('data-status', estadoGuardado);
            }

            if (bloqueada === 'true') {
                casa.setAttribute('data-bloqueada', 'true'); // Marca la casa como bloqueada
            }
        });
        actualizarContadores();
    } catch (error) {
        console.error('Error al cargar el estado de las casas:', error);
        alert('Ha ocurrido un error al cargar la página. Revisa la consola para más detalles.');
    }
});




// Función para manejar los clics en cada casa
casas.forEach((casa, index) => {

    casa.addEventListener('click', () => {

        try {
            // Verifica si la casa está bloqueada y el estado es 'vendido'
            if (casa.getAttribute('data-bloqueada') === 'true' && !isAdmin) {
                alert('Esta casa está bloqueada y solo un administrador puede cambiar su estado.');
                return; // Sale de la función si la casa está bloqueada
            }

            // Cambiar el estado de la casa según su clase actual
            if (casa.classList.contains('disponible')) {
                casa.classList.remove('disponible');
                casa.classList.add('reservado');
                casa.setAttribute('data-status', 'reservado');
            } else if (casa.classList.contains('reservado')) {
                casa.classList.remove('reservado');
                casa.classList.add('vendido');
                casa.setAttribute('data-status', 'vendido');

                // Bloquear la casa después de cambiar su estado a 'vendido'
                casa.setAttribute('data-bloqueada', 'true');
                localStorage.setItem(`bloqueada_${index}`, 'true');
            } else if (casa.classList.contains('vendido')) {
                if (isAdmin) {
                    casa.classList.remove('vendido');
                    casa.classList.add('disponible');
                    casa.setAttribute('data-status', 'disponible');

                    // Desbloquear la casa si está en modo admin
                    casa.removeAttribute('data-bloqueada');
                    localStorage.removeItem(`bloqueada_${index}`);
                }
            }

            // Guardar el estado en localStorage
            localStorage.setItem(`casa_${index}`, casa.getAttribute('data-status'));

            actualizarContadores();
        } catch (error) {
            console.error('Error al manejar el clic en la casa:', error);
            alert('Ha ocurrido un error al procesar la acción. Revisa la consola para más detalles.');
        }
    });
});

// Función para desbloquear todas las casas (solo para administradores)
function desbloquearCasas() {
    if (isAdmin) {
        casas.forEach((casa, index) => {
            casa.removeAttribute('data-bloqueada');
            localStorage.removeItem(`bloqueada_${index}`);
        });
        alert('Todas las casas han sido desbloqueadas.');
    } else {
        alert('No tienes permiso para realizar esta acción.');
    }
}

// Función para actualizar los contadores según el estado actual de las casas
function actualizarContadores() {
    const vendidas = document.querySelectorAll('.vendido').length;
    const disponibles = document.querySelectorAll('.disponible').length;
    const reservadas = document.querySelectorAll('.reservado').length;

    const vendidasElement = document.getElementById('vendidas');
    const disponiblesElement = document.getElementById('disponibles');
    const reservadasElement = document.getElementById('reservadas');

    if (vendidasElement) {
        vendidasElement.innerText = vendidas;
    }
    if (disponiblesElement) {
        disponiblesElement.innerText = disponibles;
    }
    if (reservadasElement) {
        reservadasElement.innerText = reservadas;
    }
}

// Función para generar el PDF
function generarPDF() {
    const resumen = `
        Casas disponibles: ${document.getElementById('disponibles').innerText}\n
        Casas reservadas: ${document.getElementById('reservadas').innerText}\n
        Casas vendidas: ${document.getElementById('vendidas').innerText}\n
    `;

    const svgElement = document.getElementById('planoSVG');
    html2canvas(svgElement).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const { jsPDF } = window.jspdf;
        const pdf = new jsPDF();
        pdf.addImage(imgData, 'PNG', 10, 10, 180, 160);
        pdf.text(resumen, 10, 180);
        pdf.save('resumen-plano.pdf');
    });
}






function aprobarDesbloqueo(idCasa) {
    // Obtener la solicitud actual y cambiar el estado
    let solicitud = JSON.parse(localStorage.getItem('solicitudDesbloqueo'));
    solicitud.estado = 'aprobada';

    // Actualizar en localStorage
    localStorage.setItem('solicitudDesbloqueo', JSON.stringify(solicitud));

    alert('Casa desbloqueada.');
    // Aquí podrías desbloquear la casa en la interfaz del vendedor o realizar otra acción
}




// Función para cambiar a modo administrador
function toggleAdmin() {
    isAdmin = !isAdmin;
    if (isAdmin) {
        alert('Modo administrador activado. Ahora puedes desbloquear casas.');
    } else {
        alert('Modo administrador desactivado.');
    }
}
