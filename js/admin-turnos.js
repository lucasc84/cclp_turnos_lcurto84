document.addEventListener('DOMContentLoaded', function() {
  const URL_TURNOS = "https://api.jsonbin.io/v3/b/6854507a8a456b7966b139ee";
  const API_KEY = "$2a$10$ABM3K8iF7DB3oCbwdnJTFOWHRzeRt6iMZ130laFA6kuuq5fihw7Xa";
  let turnos = [];
  let sortKey = 'nombre';
  let sortAsc = true;

  function renderTabla() {
    const filtroSucursal = document.getElementById('filtroSucursal').value;
    const buscador = document.getElementById('buscador').value.trim().toLowerCase();
    let filtrados = turnos.filter(t =>
      (!filtroSucursal || t.sucursal === filtroSucursal) &&
      (
        (t.nombre + ' ' + t.apellido).toLowerCase().includes(buscador) ||
        t.dni.toLowerCase().includes(buscador) ||
        t.email.toLowerCase().includes(buscador)
      )
    );
    filtrados.sort((a, b) => {
      let valA, valB;
      if (sortKey === 'apellido') {
        valA = (a.apellido || '').toUpperCase();
        valB = (b.apellido || '').toUpperCase();
      } else {
        valA = (a[sortKey] || '').toUpperCase ? a[sortKey].toUpperCase() : a[sortKey];
        valB = (b[sortKey] || '').toUpperCase ? b[sortKey].toUpperCase() : b[sortKey];
      }
      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
    const tbody = document.querySelector('#tablaTurnos tbody');
    if (filtrados.length === 0) {
      tbody.innerHTML = '<tr><td colspan="9" class="celda-cargando">Sin resultados</td></tr>';
      return;
    }
    tbody.innerHTML = filtrados.map(t => `
      <tr>
        <td data-label="Nombre" title="${t.nombre}">${t.nombre}</td>
        <td data-label="Apellido" title="${t.apellido || ''}">${t.apellido || ''}</td>
        <td data-label="DNI" title="${t.dni}">${t.dni}</td>
        <td data-label="Sucursal" title="${(t.sucursal || '').replace(/^Sucursal /i, '')}">${(t.sucursal || '').replace(/^Sucursal /i, '')}</td>
        <td data-label="Fecha" title="${t.fecha}">${t.fecha}</td>
        <td data-label="Horario" title="${t.horario}">${t.horario}</td>
        <td data-label="Email" title="${t.email}">${t.email}</td>
        <td data-label="Teléfono" title="${t.telefono}">${t.telefono}</td>
        <td data-label="ID" title="${t.id || ''}">${t.id || ''}</td>
      </tr>
    `).join('');
  }

  function cargarSucursales() {
    const select = document.getElementById('filtroSucursal');
    const unicas = [...new Set(turnos.map(t => t.sucursal))];
    select.innerHTML = '<option value="">Todas</option>' + unicas.map(s => `<option value="${s}">${(s || '').replace(/^Sucursal /i, '')}</option>`).join('');
  }

  fetch(URL_TURNOS, { headers: { 'X-Master-Key': API_KEY } })
    .then(res => res.json())
    .then(data => {
      turnos = data.record || [];
      renderTabla();
      cargarSucursales();
    });

  document.getElementById('filtroSucursal').addEventListener('change', renderTablaYOrden);
  document.getElementById('buscador').addEventListener('input', renderTablaYOrden);
  // --- ORDENAR EN MOBILE ---
  const btnOrdenarMobile = document.getElementById('btnOrdenarMobile');
  const btnAscDescMobile = document.getElementById('btnAscDescMobile');
  const menuOrdenarMobile = document.getElementById('menuOrdenarMobile');

  function actualizarOrdenMobile() {
    if (btnOrdenarMobile) {
      let texto = '';
      switch (sortKey) {
        case 'nombre': texto = 'Nombre'; break;
        case 'apellido': texto = 'Apellido'; break;
        case 'dni': texto = 'DNI'; break;
        case 'sucursal': texto = 'Sucursal'; break;
        case 'fecha': texto = 'Fecha'; break;
        case 'horario': texto = 'Horario'; break;
        case 'email': texto = 'Email'; break;
        case 'telefono': texto = 'Teléfono'; break;
        case 'id': texto = 'ID'; break;
      }
      btnOrdenarMobile.innerHTML = `<span>Ordenar por:</span> <strong>${texto}</strong>`;
    }
    if (btnAscDescMobile) {
      const flecha = sortAsc ? '▲' : '▼';
      const texto = sortAsc ? 'Ascendente' : 'Descendente';
      btnAscDescMobile.innerHTML = `<span style="font-size:1.2em;vertical-align:middle;">${flecha}</span> <span style="font-size:0.95em;vertical-align:middle;">${texto}</span>`;
    }
  }

  function renderTablaYOrden() {
    renderTabla();
    actualizarOrdenMobile();
  }

  // Listeners mobile
  if (btnOrdenarMobile && menuOrdenarMobile) {
    btnOrdenarMobile.addEventListener('click', function(e) {
      e.stopPropagation();
      menuOrdenarMobile.classList.toggle('oculto');
    });
    menuOrdenarMobile.querySelectorAll('button[data-sort]').forEach(btn => {
      btn.addEventListener('click', function() {
        sortKey = btn.getAttribute('data-sort');
        sortAsc = true;
        menuOrdenarMobile.classList.add('oculto');
        renderTablaYOrden();
      });
    });
    document.addEventListener('click', function(e) {
      if (!menuOrdenarMobile.contains(e.target) && e.target !== btnOrdenarMobile) {
        menuOrdenarMobile.classList.add('oculto');
      }
    });
  }
  if (btnAscDescMobile) {
    btnAscDescMobile.addEventListener('click', function() {
      sortAsc = !sortAsc;
      renderTablaYOrden();
      btnAscDescMobile.classList.toggle('desc', !sortAsc);
    });
  }

  // Listeners desktop
  document.querySelectorAll('#tablaTurnos th[data-sort]').forEach(th => {
    th.addEventListener('click', function() {
      const key = th.getAttribute('data-sort');
      if (sortKey === key) sortAsc = !sortAsc;
      else { sortKey = key; sortAsc = true; }
      renderTablaYOrden();
    });
  });

  // Inicializar el texto al cargar
  renderTablaYOrden();

  const celdas = document.querySelectorAll('.tabla-admin td');
  celdas.forEach(function (celda) {
    if (celda.textContent.trim().length > 0) {
      celda.setAttribute('title', celda.textContent.trim());
    }
  });
});
