/*Script para mostrar la constancia del turno confirmado.
  - Recupera los datos del turno desde localStorage
  - Formatea la fecha con Luxon
  - Muestra los datos en el DOM
*/

document.addEventListener("DOMContentLoaded", () => {
  // --- RECUPERACIÓN Y VISUALIZACIÓN DE DATOS DEL TURNO ---
  // Se obtiene el turno confirmado desde localStorage.
  // Si no hay datos, se muestra un mensaje informativo.
  // Si existen datos, se formatea la fecha y se muestran todos los detalles en el DOM.
  const turno = JSON.parse(localStorage.getItem("turnoConfirmado"));
  const contenedor = document.getElementById("detalleTurno");

  if (!turno) {
    contenedor.innerHTML = "<p>No hay datos de turno para mostrar.</p>";
    return;
  }

  // --- FORMATEO DE FECHA CON LUXON ---
  const { DateTime } = luxon;
  const fechaFormateada = DateTime.fromISO(turno.fecha)
    .setLocale("es")
    .toLocaleString(DateTime.DATE_HUGE);

  // --- MOSTRAR DATOS EN EL DOM ---
  contenedor.innerHTML = `
    <p><strong>ID de Turno:</strong> ${turno.id ? turno.id : "(sin ID)"}</p>
    <p><strong>Nombre:</strong> ${turno.nombre} ${turno.apellido}</p>
    <p><strong>DNI:</strong> ${turno.dni}</p>
    <p><strong>Teléfono:</strong> ${turno.telefono}</p>
    <p><strong>Email:</strong> ${turno.email}</p>
    <p><strong>Sucursal:</strong> ${(turno.sucursal || '').replace(/^Sucursal /i, '')}</p>
    ${turno.direccionSucursal || turno.telefonoSucursal ? `<p><strong>Dirección:</strong> ${turno.direccionSucursal || '-'}<br><strong>Teléfonos:</strong> ${turno.telefonoSucursal || '-'}</p>` : ''}
    <p><strong>Fecha:</strong> ${fechaFormateada}</p>
    <p><strong>Hora:</strong> ${turno.horario}</p>
  `;
});
