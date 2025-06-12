/*Script principal para la gestión de turnos.*/



// Espera a que el DOM esté completamente cargado antes de ejecutar la lógica principal.
document.addEventListener('DOMContentLoaded', () => {

  // --- CARGA DINÁMICA DE SUCURSALES Y HORARIOS ---
  let sucursalesData = [];
  const sucursalSelect = document.getElementById('sucursal');
  const horarioSelect = document.getElementById('horario');
  const direccionDiv = document.getElementById('direccionSucursal');

  // Cargar sucursales desde la API
  fetch('http://localhost:3000/sucursales')
    .then(response => response.json())
    .then(data => {
      sucursalesData = data;
      // Limpiar opciones actuales
      sucursalSelect.innerHTML = '<option value="">Seleccione una sucursal</option>';
      data.forEach(suc => {
        const option = document.createElement('option');
        option.value = suc.nombre;
        option.textContent = suc.nombre.replace('Sucursal ', '');
        option.setAttribute('data-direccion', suc.direccion);
        option.setAttribute('data-telefonos', suc.telefonos);
        option.setAttribute('data-id', suc.id);
        sucursalSelect.appendChild(option);
      });
    })
    .catch(() => {
      Toastify({
        text: "No se pudieron cargar las sucursales.",
        duration: 4000,
        backgroundColor: "#ff0000"
      }).showToast();
    });

  // Al cambiar la sucursal, mostrar dirección y cargar horarios
  sucursalSelect.addEventListener('change', function() {
    const selected = sucursalSelect.options[sucursalSelect.selectedIndex];
    const direccion = selected.getAttribute('data-direccion');
    const telefonos = selected.getAttribute('data-telefonos');
    const sucursalId = selected.getAttribute('data-id');
    if (direccion) {
      direccionDiv.innerHTML = `Dirección: ${direccion}<br>Teléfonos: ${telefonos}`;
      direccionDiv.style.display = 'block';
    } else {
      direccionDiv.textContent = '';
      direccionDiv.style.display = 'none';
    }
    // Cargar horarios de la sucursal seleccionada
    horarioSelect.innerHTML = '<option value="">Seleccione un horario</option>';
    if (sucursalId) {
      const suc = sucursalesData.find(s => s.id == sucursalId);
      if (suc && suc.horarios) {
        suc.horarios.forEach(hora => {
          const option = document.createElement('option');
          option.value = hora;
          option.textContent = hora;
          horarioSelect.appendChild(option);
        });
      }
    }
  });

  // --- GESTIÓN DEL FORMULARIO DE TURNOS ---
  // Se captura el evento submit del formulario para validar y procesar los datos ingresados.
  // Si algún campo está vacío, se muestra una alerta visual y se detiene el proceso.
  // Si todo está correcto, se solicita confirmación al usuario mediante SweetAlert2.
  // Al confirmar, se envía el turno a la API de JSON Server y se notifica el éxito con Toastify.
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

    // --- CONFIRMACIÓN Y ENVÍO DEL TURNO A JSON SERVER ---
    // Se utiliza SweetAlert2 para confirmar la acción del usuario.
    // Si el usuario confirma, se envía el turno a la API de JSON Server y se muestra una notificación de éxito.
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
        // Abrir la ventana antes del fetch para evitar bloqueos
        const win = window.open("constancia.html", "_blank");
        fetch('http://localhost:3000/turnosConfirmados', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(datos)
        })
        .then(response => {
          if (!response.ok) throw new Error('Error al guardar el turno');
          // Guardar también en localStorage para la constancia
          localStorage.setItem('turnoConfirmado', JSON.stringify(datos));
          Toastify({
            text: "¡Turno confirmado!",
            duration: 3000,
            backgroundColor: "#28a745"
          }).showToast();
          turnoForm.reset();
          // Recargar la ventana de la constancia para que lea el localStorage actualizado
          if (win) win.location.reload();
        })
        .catch(() => {
          Toastify({
            text: "No se pudo confirmar el turno.",
            duration: 3000,
            backgroundColor: "#ff0000"
          }).showToast();
        });
      }
    });
  });
});