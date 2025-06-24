/*Script principal para la gestión de turnos.*/

/* se establece el evento DOMContentLoaded para asegurar que el DOM esté completamente cargado antes de ejecutar el script. */
document.addEventListener("DOMContentLoaded", () => {

  // --- CARGA DE FERIADOS DESDE API Y FILTRO DE DÍAS HÁBILES ---

  let feriados = [];

  // Se define la fecha actual y la fecha máxima (30 días hacia adelante)
  const hoy = new Date();
  const maxFecha = new Date();
  maxFecha.setDate(hoy.getDate() + 30); // crea una ventana de 30 días hacia adelante
  // o sea tenemos la fecha de inicioi (hoy) una final (30 días desde hoy)

  // Se define una función para verificar si un día es hábil (sabado o domingo no los feriados)
  function esDiaHabil(fecha) {
    const dia = fecha.getDay(); // 0 domingo, 6 sábado
    if (dia === 0 || dia === 6) return false;
    const formato = fecha.toISOString().split("T")[0];
    return !feriados.includes(formato);
  }

  // Se define una función para obtener los feriados desde la API
  // Si falla la carga, se usa un fallback local con algunos feriados comunes.
  // La función devuelve una promesa que se resuelve cuando los feriados están cargados
  // y se formatean en el formato YYYY-MM-DD.
  // Esto permite que el resto del script espere a que los feriados estén disponibles antes de continuar.
  function obtenerFeriados() {
    const anio = new Date().getFullYear();
    const URL_FERIADOS_BIN = 'https://api.jsonbin.io/v3/b/685451d58561e97a50275ef2';
    const API_KEY = '$2a$10$ABM3K8iF7DB3oCbwdnJTFOWHRzeRt6iMZ130laFA6kuuq5fihw7Xa';
    return fetch(`https://corsproxy.io/?https://nolaborables.com.ar/api/v2/feriados/${anio}`)
      .then((res) => res.json())
      .then((data) => {
        feriados = data.map((f) => {
          const mes = String(f.mes).padStart(2, "0");
          const dia = String(f.dia).padStart(2, "0");
          return `${anio}-${mes}-${dia}`;
        });
        // Guarda los feriados en el bin de jsonbin.io
        fetch(URL_FERIADOS_BIN, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "X-Master-Key": API_KEY
          },
          body: JSON.stringify(feriados)
        });
      })
      .catch(() => {
        // Si falla la API, intenta leer el backup de jsonbin.io
        fetch(URL_FERIADOS_BIN, {
          headers: { "X-Master-Key": API_KEY }
        })
          .then(res => res.json())
          .then(data => {
            feriados = data.record || [];
          })
          .catch(() => {
            // Si también falla, usa la lista local de feriados.json
            fetch('js/feriados.json')
              .then(res => res.json())
              .then(data => { feriados = data; })
              .catch(() => {
                // Si todo falla, deja el array vacío
                feriados = [];
              });
          });
      });
  }

  obtenerFeriados().then(() => {
    let sucursalesData = [];
    const sucursalSelect = document.getElementById("sucursal");
    const horarioSelect = document.getElementById("horario");
    const direccionDiv = document.getElementById("direccionSucursal");
    const fechaInput = document.getElementById("fecha");
    let fechaSeleccionada = null;
    let sucursalSeleccionada = null;

    // --- FLATPICKR PARA FECHA ---
    flatpickr(fechaInput, {
      dateFormat: "Y-m-d",
      minDate: new Date(),
      maxDate: new Date().fp_incr(30),
      disable: [
        function (date) {
          // Bloquear sábados, domingos y feriados
          const dia = date.getDay();
          const formato = date.toISOString().split("T")[0];
          return dia === 0 || dia === 6 || feriados.includes(formato);
        },
      ],
      onChange: function (selectedDates, dateStr) {
        fechaSeleccionada = dateStr;
        actualizarHorarios();
      },
    });

    // URLs y API Key de jsonbin.io
    const URL_SUCURSALES =
      "https://api.jsonbin.io/v3/b/68544e568960c979a5acfb7d";
    const URL_TURNOS = "https://api.jsonbin.io/v3/b/6854507a8a456b7966b139ee";
    const API_KEY =
      "$2a$10$ABM3K8iF7DB3oCbwdnJTFOWHRzeRt6iMZ130laFA6kuuq5fihw7Xa";

    // --- FUNCIONES AUXILIARES PARA TURNOS EN JSONBIN ---
    async function getTurnosConfirmados() {
      const res = await fetch(URL_TURNOS, {
        headers: { "X-Master-Key": API_KEY },
      });
      const data = await res.json();
      return data.record;
    }
    async function setTurnosConfirmados(turnos) {
      await fetch(URL_TURNOS, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-Master-Key": API_KEY,
        },
        body: JSON.stringify(turnos),
      });
    }

    // --- CARGA DE SUCURSALES DESDE JSONBIN ---
    fetch(URL_SUCURSALES, {
      headers: { "X-Master-Key": API_KEY },
    })
      .then((response) => response.json())
      .then((data) => {
        const sucursalesData = data.record;
        const sucursalSelect = document.getElementById("sucursal");
        sucursalSelect.innerHTML =
          '<option value="">Seleccione una sucursal</option>';
        sucursalesData.forEach((suc) => {
          const option = document.createElement("option");
          option.value = suc.nombre;
          option.textContent = suc.nombre.replace("Sucursal ", "");
          option.setAttribute("data-direccion", suc.direccion);
          option.setAttribute("data-telefonos", suc.telefonos);
          option.setAttribute("data-id", suc.id);
          sucursalSelect.appendChild(option);
        });
        // Guardar en variable global para uso posterior
        window.sucursalesData = sucursalesData;
      })
      .catch(() => {
        Toastify({
          text: "No se pudieron cargar las sucursales.",
          duration: 4000,
          backgroundColor: "#ff0000",
        }).showToast();
      });

    sucursalSelect.addEventListener("change", function () {
      const selected = sucursalSelect.options[sucursalSelect.selectedIndex];
      const direccion = selected.getAttribute("data-direccion");
      const telefonos = selected.getAttribute("data-telefonos");
      const sucursalId = selected.getAttribute("data-id");
      sucursalSeleccionada = selected.value;
      if (direccion) {
        direccionDiv.innerHTML = `<span class="direccion">Dirección: ${direccion}</span><span class="separador-dir-tel"></span><span class="telefono">Teléfonos: ${telefonos}</span>`;
        direccionDiv.style.display = "block";
      } else {
        direccionDiv.textContent = "";
        direccionDiv.style.display = "none";
      }
      actualizarHorarios();
    });

    // --- ACTUALIZAR HORARIOS DISPONIBLES SEGÚN FECHA Y SUCURSAL ---
    async function actualizarHorarios() {
      const horarioSelect = document.getElementById("horario");
      horarioSelect.disabled = true;
      horarioSelect.classList.add("loading");
      horarioSelect.innerHTML =
        '<option value="">Cargando horarios...</option>';
      const sucursalSeleccionada = document.getElementById("sucursal").value;
      const fechaSeleccionada = document.getElementById("fecha").value;
      if (!sucursalSeleccionada || !fechaSeleccionada) {
        horarioSelect.disabled = false;
        horarioSelect.classList.remove("loading");
        horarioSelect.innerHTML = '<option value="">Seleccione un horario</option>';
        return;
      }
      const suc = window.sucursalesData.find(
        (s) => s.nombre === sucursalSeleccionada
      );
      if (!suc || !suc.horarios) {
        horarioSelect.disabled = false;
        horarioSelect.classList.remove("loading");
        horarioSelect.innerHTML = '<option value="">Sin horarios disponibles</option>';
        return;
      }
      const turnosTomados = (await getTurnosConfirmados()).filter(
        (t) =>
          t.sucursal === sucursalSeleccionada && t.fecha === fechaSeleccionada
      );
      const horariosOcupados = turnosTomados.map((t) => t.horario);
      horarioSelect.innerHTML = '<option value="">Seleccione un horario</option>';
      suc.horarios.forEach((hora) => {
        const option = document.createElement("option");
        option.value = hora;
        option.textContent = hora;
        if (horariosOcupados.includes(hora)) {
          option.disabled = true;
          option.textContent += " (No disponible)";
        }
        horarioSelect.appendChild(option);
      });
      horarioSelect.disabled = false;
      horarioSelect.classList.remove("loading");
    }

    // --- VALIDACIÓN DE DNI Y ALTA DE TURNO ---
    const turnoForm = document.getElementById("turnoForm");
    turnoForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const datos = {
        nombre: document.getElementById("nombre").value.trim(),
        apellido: document.getElementById("apellido").value.trim(),
        dni: document.getElementById("dni").value.replace(/\D/g, ""),
        telefono: document.getElementById("telefono").value.replace(/\D/g, ""),
        email: document.getElementById("email").value.trim(),
        sucursal: document.getElementById("sucursal").value,
        fecha: document.getElementById("fecha").value,
        horario: document.getElementById("horario").value,
      };

      // Validaciones adicionales
      let errorMsg = "";
      // DNI: solo números, 7-9 dígitos
      if (!/^\d{7,9}$/.test(datos.dni)) {
        errorMsg = "El DNI debe contener solo números (7 a 9 dígitos).";
        document.getElementById("dni").classList.add("input-error");
      } else {
        document.getElementById("dni").classList.remove("input-error");
      }
      // Teléfono: solo números, 8-15 dígitos
      if (!/^\d{8,15}$/.test(datos.telefono)) {
        errorMsg = "El teléfono debe contener solo números (8 a 15 dígitos).";
        document.getElementById("telefono").classList.add("input-error");
      } else {
        document.getElementById("telefono").classList.remove("input-error");
      }
      // Email: sintaxis básica
      if (!/^\S+@\S+\.\S+$/.test(datos.email)) {
        errorMsg = "El email no tiene un formato válido.";
        document.getElementById("email").classList.add("input-error");
      } else {
        document.getElementById("email").classList.remove("input-error");
      }
      // Validación de nombre y apellido
      if (!datos.nombre || datos.nombre.length < 2) {
        errorMsg = "El nombre debe tener al menos 2 caracteres.";
        document.getElementById("nombre").classList.add("input-error");
      } else {
        document.getElementById("nombre").classList.remove("input-error");
      }
      if (!datos.apellido || datos.apellido.length < 2) {
        errorMsg = "El apellido debe tener al menos 2 caracteres.";
        document.getElementById("apellido").classList.add("input-error");
      } else {
        document.getElementById("apellido").classList.remove("input-error");
      }
      if (errorMsg) {
        Toastify({
          text: errorMsg,
          duration: 3500,
          backgroundColor: "#ff0000",
        }).showToast();
        return;
      }

      // Validar si la fecha es hábil
      const fechaSeleccionada = new Date(datos.fecha);
      if (!esDiaHabil(fechaSeleccionada)) {
        Toastify({
          text: "La fecha seleccionada no es hábil.",
          duration: 3000,
          backgroundColor: "#ff0000",
        }).showToast();
        return;
      }
      // Validar si el DNI ya tiene un turno pendiente (solo futuro)
      const turnosDni = (await getTurnosConfirmados()).filter(
        (t) => t.dni === datos.dni
      );
      const hoyStr = new Date().toISOString().split("T")[0];
      const turnosPendientes = turnosDni.filter((t) => t.fecha >= hoyStr);
      if (turnosPendientes.length > 0) {
        const t = turnosPendientes[0];
        Swal.fire({
          title: "Ya tienes un turno pendiente",
          html: `<p><strong>Sucursal:</strong> ${t.sucursal}</p>
                 <p><strong>Fecha:</strong> ${t.fecha}</p>
                 <p><strong>Hora:</strong> ${t.horario}</p>
                 <p><strong>ID:</strong> ${t.id}</p>`,
          icon: "info",
          showCancelButton: true,
          confirmButtonText: "Aceptar",
          cancelButtonText: "Cancelar este turno",
        }).then(async (result) => {
          if (result.dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
              title: "¿Seguro que deseas cancelar tu turno?",
              icon: "warning",
              showCancelButton: true,
              confirmButtonText: "Sí, cancelar",
              cancelButtonText: "No",
            }).then(async (r2) => {
              if (r2.isConfirmed) {
                const turnos = await getTurnosConfirmados();
                const nuevosTurnos = turnos.filter((tt) => tt.id !== t.id);
                await setTurnosConfirmados(nuevosTurnos);
                Swal.fire(
                  "Turno cancelado",
                  "Tu turno fue cancelado correctamente.",
                  "success"
                );
              }
            });
          }
        });
        return;
      }
      // Si no tiene turno pendiente, continuar con el flujo normal
      Swal.fire({
        title: "¿Confirmar turno?",
        html: `
          <p><strong>Sucursal:</strong> ${datos.sucursal.replace(/^Sucursal /i, '')}</p>
          <p><strong>Fecha:</strong> ${datos.fecha}</p>
          <p><strong>Hora:</strong> ${datos.horario}</p>
        `,
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "Sí, confirmar",
        cancelButtonText: "Cancelar",
      }).then(async (result) => {
        if (result.isConfirmed) {
          const idTurno =
            Math.random().toString(16).slice(2, 6) +
            Date.now().toString(16).slice(-4);
          datos.id = idTurno;

          // Agregar dirección y teléfonos de la sucursal seleccionada al objeto de datos
          const selected = document.getElementById("sucursal").options[document.getElementById("sucursal").selectedIndex];
          datos.direccionSucursal = selected.getAttribute("data-direccion") || '';
          datos.telefonoSucursal = selected.getAttribute("data-telefonos") || '';

          const win = window.open("constancia.html", "_blank");
          const turnos = await getTurnosConfirmados();
          turnos.push(datos);
          await setTurnosConfirmados(turnos);
          localStorage.setItem("turnoConfirmado", JSON.stringify(datos));
          Toastify({
            text: "¡Turno confirmado!",
            duration: 3000,
            backgroundColor: "#28a745",
          }).showToast();
          turnoForm.reset();
          if (win) win.location.reload();
        }
      });
    });

    // --- CONSULTA Y CANCELACIÓN DE TURNO POR ID ---
    const formConsulta = document.getElementById("formConsultaTurno");
    const resultadoDiv = document.getElementById("resultadoConsulta");
    if (formConsulta) {
      formConsulta.addEventListener("submit", async function (e) {
        e.preventDefault();
        const valor = document.getElementById("idConsulta").value.trim();
        if (!valor) return;
        resultadoDiv.innerHTML = "Buscando...";
        const turnos = await getTurnosConfirmados();
        let turno = turnos.find((t) => t.id === valor);
        if (!turno) {
          // Si no se encuentra por ID, buscar por DNI (último turno futuro)
          const hoyStr = new Date().toISOString().split("T")[0];
          const turnosDni = turnos.filter((t) => t.dni === valor && t.fecha >= hoyStr);
          if (turnosDni.length > 0) {
            turno = turnosDni[0];
          }
        }
        if (!turno) {
          resultadoDiv.innerHTML =
            '<p style="color:red">No se encontró ningún turno con ese ID o DNI.</p>';
          return;
        }
        resultadoDiv.innerHTML = `
          <div style="text-align:left; margin: 10px auto; max-width: 350px;">
            <p><strong>ID:</strong> ${turno.id}</p>
            <p><strong>Nombre:</strong> ${turno.nombre}</p>
            <p><strong>DNI:</strong> ${turno.dni}</p>
            <p><strong>Sucursal:</strong> ${turno.sucursal}</p>
            <p><strong>Fecha:</strong> ${turno.fecha}</p>
            <p><strong>Horario:</strong> ${turno.horario}</p>
            <button id="btnCancelarTurno" style="background:#e32724;color:#fff;padding:8px 16px;border:none;border-radius:4px;cursor:pointer;">Cancelar Turno</button>
          </div>
        `;
        document.getElementById("btnCancelarTurno").onclick =
          async function () {
            if (
              confirm(
                "¿Seguro que deseas cancelar este turno? Esta acción no se puede deshacer."
              )
            ) {
              const nuevosTurnos = turnos.filter((t) => t.id !== turno.id);
              await setTurnosConfirmados(nuevosTurnos);
              resultadoDiv.innerHTML =
                '<p style="color:green">El turno fue cancelado correctamente.</p>';
            }
          };
      });
    }
  }); // fin obtenerFeriados
});
