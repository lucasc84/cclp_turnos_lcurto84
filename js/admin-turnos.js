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
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;">Sin resultados</td></tr>';
      return;
    }
    tbody.innerHTML = filtrados.map(t => `
      <tr>
        <td>${t.nombre}</td>
        <td>${t.apellido || ''}</td>
        <td>${t.dni}</td>
        <td>${(t.sucursal || '').replace(/^Sucursal /i, '')}</td>
        <td>${t.fecha}</td>
        <td>${t.horario}</td>
        <td>${t.email}</td>
        <td>${t.telefono}</td>
        <td>${t.id || ''}</td>
      </tr>
    `).join('');
  }

  function cargarSucursales() {
    const select = document.getElementById('filtroSucursal');
    const unicas = [...new Set(turnos.map(t => t.sucursal))];
    select.innerHTML = '<option value="">Todas</option>' + unicas.map(s => `<option value="${s}">${s}</option>`).join('');
  }

  fetch(URL_TURNOS, { headers: { 'X-Master-Key': API_KEY } })
    .then(res => res.json())
    .then(data => {
      turnos = data.record || [];
      renderTabla();
      cargarSucursales();
    });

  document.getElementById('filtroSucursal').addEventListener('change', renderTabla);
  document.getElementById('buscador').addEventListener('input', renderTabla);
  document.querySelectorAll('#tablaTurnos th[data-sort]').forEach(th => {
    th.addEventListener('click', function() {
      const key = th.getAttribute('data-sort');
      if (sortKey === key) sortAsc = !sortAsc;
      else { sortKey = key; sortAsc = true; }
      renderTabla();
    });
  });
  // --- ORDENAR EN MOBILE ---
  const btnOrdenarMobile = document.getElementById('btnOrdenarMobile');
  const btnAscDescMobile = document.getElementById('btnAscDescMobile');
  const menuOrdenarMobile = document.getElementById('menuOrdenarMobile');
  if (btnOrdenarMobile && menuOrdenarMobile) {
    btnOrdenarMobile.addEventListener('click', function() {
      menuOrdenarMobile.classList.toggle('oculto');
    });
    menuOrdenarMobile.querySelectorAll('button[data-sort]').forEach(btn => {
      btn.addEventListener('click', function() {
        sortKey = btn.getAttribute('data-sort');
        sortAsc = true;
        renderTabla();
        menuOrdenarMobile.classList.add('oculto');
      });
    });
    // Cerrar menú si se hace click fuera
    document.addEventListener('click', function(e) {
      if (!menuOrdenarMobile.contains(e.target) && e.target !== btnOrdenarMobile) {
        menuOrdenarMobile.classList.add('oculto');
      }
    });
  }
  if (btnAscDescMobile) {
    btnAscDescMobile.addEventListener('click', function() {
      sortAsc = !sortAsc;
      renderTabla();
      btnAscDescMobile.classList.toggle('desc', !sortAsc);
    });
  }
});
