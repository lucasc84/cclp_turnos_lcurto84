document.addEventListener('DOMContentLoaded', () => {
  const turno = JSON.parse(localStorage.getItem('turnoConfirmado'));
  const contenedor = document.getElementById('detalleTurno');

  if (!turno) {
    contenedor.innerHTML = '<p>No hay datos de turno para mostrar.</p>';
    return;
  }

  const { DateTime } = luxon;
  const fechaFormateada = DateTime.fromISO(turno.fecha).setLocale('es').toLocaleString(DateTime.DATE_HUGE);

  contenedor.innerHTML = `
    <p><strong>Nombre:</strong> ${turno.nombre}</p>
    <p><strong>DNI:</strong> ${turno.dni}</p>
    <p><strong>Teléfono:</strong> ${turno.telefono}</p>
    <p><strong>Dirección:</strong> ${turno.direccion}</p>
    <p><strong>Email:</strong> ${turno.email}</p>
    <p><strong>Sucursal:</strong> ${turno.sucursal}</p>
    <p><strong>Fecha:</strong> ${fechaFormateada}</p>
    <p><strong>Hora:</strong> ${turno.horario}</p>
  `;
});
