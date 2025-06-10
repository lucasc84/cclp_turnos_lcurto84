document.addEventListener('DOMContentLoaded', () => {
  const horarioSelect = document.getElementById('horario');

  // Cargar horarios disponibles desde turnos.json
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
      console.error('Error al cargar horarios:', error);
      Toastify({
        text: "No se pudieron cargar los horarios.",
        duration: 4000,
        backgroundColor: "#ff0000"
      }).showToast();
    });

  const turnoForm = document.getElementById('turnoForm');
  turnoForm.addEventListener('submit', (e) => {
    e.preventDefault();

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

    // Validación básica
    if (Object.values(datos).includes("")) {
      Toastify({
        text: "Por favor, completá todos los campos.",
        duration: 3000,
        backgroundColor: "#ff0000"
      }).showToast();
      return;
    }


    // PARTE III - SI TODOS LOS CAMPOS ESTAN COMPLETOS:

    
    // Confirmación con SweetAlert
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

        setTimeout(() => {
          window.open("constancia.html", "_blank");
        }, 1500);
      }
    });
  });
});
