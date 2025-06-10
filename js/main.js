/*Script principal para la gestión de turnos.*/



// Espera a que el DOM esté completamente cargado antes de ejecutar la lógica principal.
document.addEventListener('DOMContentLoaded', () => {

  // --- CARGA DINÁMICA DE HORARIOS ---
  // Se obtienen los horarios disponibles desde un archivo JSON externo usando fetch.
  // Los horarios se agregan como opciones al select del formulario.
  // Si ocurre un error en la carga, se muestra un mensaje visual con Toastify.
  const horarioSelect = document.getElementById('horario');
  fetch('js/turnos.json')
    .then(response => response.json())
    .then(data => {
      data.forEach(turno => {
        const option = document.createElement('option');
        option.value = turno.hora;
        option.textContent = turno.hora;
        horarioSelect.appendChild(option);
      });
    })
    .catch(error => {
      Toastify({
        text: "No se pudieron cargar los horarios.",
        duration: 4000,
        backgroundColor: "#ff0000"
      }).showToast();
    });

  // --- GESTIÓN DEL FORMULARIO DE TURNOS ---
  // Se captura el evento submit del formulario para validar y procesar los datos ingresados.
  // Si algún campo está vacío, se muestra una alerta visual y se detiene el proceso.
  // Si todo está correcto, se solicita confirmación al usuario mediante SweetAlert2.
  // Al confirmar, se guarda el turno en localStorage y se notifica el éxito con Toastify.
  // Finalmente, se abre una nueva ventana con la constancia del turno.
  const turnoForm = document.getElementById('turnoForm');
  turnoForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // --- CAPTURA Y VALIDACIÓN DE DATOS ---
    // Se obtienen los valores de todos los campos del formulario.
    // Se realiza una validación básica para asegurar que no haya campos vacíos.
    const datos = {
      nombre: document.getElementById('nombre').value,
      dni: document.getElementById('dni').value,
      telefono: document.getElementById('telefono').value,
      direccion: document.getElementById('direccion').value,
      email: document.getElementById('email').value,
      sucursal: document.getElementById('sucursal').value,
      fecha: document.getElementById('fecha').value,
      horario: document.getElementById('horario').value
    };

    if (Object.values(datos).includes("")) {
      Toastify({
        text: "Por favor, completá todos los campos.",
        duration: 3000,
        backgroundColor: "#ff0000"
      }).showToast();
      return;
    }

    // --- CONFIRMACIÓN Y ALMACENAMIENTO DEL TURNO ---
    // Se utiliza SweetAlert2 para confirmar la acción del usuario.
    // Si el usuario confirma, se guarda el turno en localStorage y se muestra una notificación de éxito.
    // Luego, se abre la constancia en una nueva pestaña.
    Swal.fire({
      title: '¿Confirmar turno?',
      html: `
        <p><strong>Sucursal:</strong> ${datos.sucursal}</p>
        <p><strong>Fecha:</strong> ${datos.fecha}</p>
        <p><strong>Hora:</strong> ${datos.horario}</p>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sí, confirmar',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.setItem('turnoConfirmado', JSON.stringify(datos));

        Toastify({
          text: "¡Turno confirmado!",
          duration: 3000,
          backgroundColor: "#28a745"
        }).showToast();

        // Limpiar el formulario tras la confirmación del turno
        turnoForm.reset();

        setTimeout(() => {
          window.open("constancia.html", "_blank");
        }, 1500);
      }
    });
  });
});