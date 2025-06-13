/*Script principal para la gestión de turnos.*/

document.addEventListener('DOMContentLoaded', () => {

  // --- CARGA DE FERIADOS DESDE API Y FILTRO DE DÍAS HÁBILES ---
  let feriados = [];
  const hoy = new Date();
  const maxFecha = new Date();
  maxFecha.setDate(hoy.getDate() + 30); // ventana de 30 días hacia adelante

  function esDiaHabil(fecha) {
    const dia = fecha.getDay(); // 0 domingo, 6 sábado
    if (dia === 0 || dia === 6) return false;
    const formato = fecha.toISOString().split("T")[0];
    return !feriados.includes(formato);
  }

  function obtenerFeriados() {
    const anio = new Date().getFullYear();
    return fetch(`https://nolaborables.com.ar/api/v2/feriados/${anio}`)
      .then(res => res.json())
      .then(data => {
        feriados = data.map(f => {
          const mes = String(f.mes).padStart(2, '0');
          const dia = String(f.dia).padStart(2, '0');
          return `${anio}-${mes}-${dia}`;
        });
      })
      .catch(() => {
        console.warn("Fallo la carga de feriados, usando fallback local.");
        feriados = ["2025-01-01", "2025-03-24", "2025-04-02", "2025-05-01", "2025-07-09", "2025-12-25"];
      });
  }

  obtenerFeriados().then(() => {

    let sucursalesData = [];
    const sucursalSelect = document.getElementById('sucursal');
    const horarioSelect = document.getElementById('horario');
    const direccionDiv = document.getElementById('direccionSucursal');
    const fechaInput = document.getElementById('fecha');
    let fechaSeleccionada = null;
    let sucursalSeleccionada = null;

    // --- FLATPICKR PARA FECHA ---
    flatpickr(fechaInput, {
      dateFormat: 'Y-m-d',
      minDate: new Date(),
      maxDate: new Date().fp_incr(30),
      disable: [
        function(date) {
          // Bloquear sábados, domingos y feriados
          const dia = date.getDay();
          const formato = date.toISOString().split('T')[0];
          return (dia === 0 || dia === 6 || feriados.includes(formato));
        }
      ],
      locale: 'es',
      onChange: function(selectedDates, dateStr) {
        fechaSeleccionada = dateStr;
        actualizarHorarios();
      }
    });

    fetch('http://localhost:3000/sucursales')
      .then(response => response.json())
      .then(data => {
        sucursalesData = data;
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

    sucursalSelect.addEventListener('change', function() {
      const selected = sucursalSelect.options[sucursalSelect.selectedIndex];
      const direccion = selected.getAttribute('data-direccion');
      const telefonos = selected.getAttribute('data-telefonos');
      const sucursalId = selected.getAttribute('data-id');
      sucursalSeleccionada = selected.value;
      if (direccion) {
        direccionDiv.innerHTML = `Dirección: ${direccion}<br>Teléfonos: ${telefonos}`;
        direccionDiv.style.display = 'block';
      } else {
        direccionDiv.textContent = '';
        direccionDiv.style.display = 'none';
      }
      actualizarHorarios();
    });

    // --- ACTUALIZAR HORARIOS DISPONIBLES SEGÚN FECHA Y SUCURSAL ---
    function actualizarHorarios() {
      horarioSelect.innerHTML = '<option value="">Seleccione un horario</option>';
      if (!sucursalSeleccionada || !fechaSeleccionada) return;
      const suc = sucursalesData.find(s => s.nombre === sucursalSeleccionada);
      if (!suc || !suc.horarios) return;
      // Consultar turnos ya tomados para esa sucursal y fecha
      fetch(`http://localhost:3000/turnosConfirmados?sucursal=${encodeURIComponent(sucursalSeleccionada)}&fecha=${fechaSeleccionada}`)
        .then(res => res.json())
        .then(turnosTomados => {
          const horariosOcupados = turnosTomados.map(t => t.horario);
          suc.horarios.forEach(hora => {
            const option = document.createElement('option');
            option.value = hora;
            option.textContent = hora;
            if (horariosOcupados.includes(hora)) {
              option.disabled = true;
              option.textContent += ' (No disponible)';
            }
            horarioSelect.appendChild(option);
          });
        });
    }

    const turnoForm = document.getElementById('turnoForm');
    turnoForm.addEventListener('submit', (e) => {
      e.preventDefault();

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

      // Validar si la fecha es hábil
      const fechaSeleccionada = new Date(datos.fecha);
      if (!esDiaHabil(fechaSeleccionada)) {
        Toastify({
          text: "La fecha seleccionada no es hábil.",
          duration: 3000,
          backgroundColor: "#ff0000"
        }).showToast();
        return;
      }

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
            localStorage.setItem('turnoConfirmado', JSON.stringify(datos));
            Toastify({
              text: "¡Turno confirmado!",
              duration: 3000,
              backgroundColor: "#28a745"
            }).showToast();
            turnoForm.reset();
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

  }); // fin obtenerFeriados
});