/* liard · área D (distribuidor): lógica compartida por las pantallas d-prov-* y m-prov-*.
   Lee data.js (B) + data-prov.js (BP) y el estado compartido (L). Se carga después de app.js y antes de usar window.P. */
(function () {
  const HOY = '2026-10-01';
  const PROV = 'en';
  const BP = window.BP;

  const dias = (a, b = HOY) => Math.round((new Date(a + 'T12:00:00') - new Date(b + 'T12:00:00')) / 86400000);
  const hace = iso => { const d = -dias(iso); return d <= 0 ? 'hoy' : d === 1 ? 'ayer' : `hace ${d} días`; };
  const venceTxt = iso => { const d = dias(iso); return d < 0 ? 'venció el ' + L.fecha(iso) : d === 0 ? 'vence hoy' : d === 1 ? 'vence mañana' : `vence en ${d} días`; };

  // ---- OC de data.js que le llegaron a «en» (Tableros Delta) ----
  function ocShared(id) {
    const peds = L.get('pedidos') || [];
    for (let pi = 0; pi < peds.length; pi++) {
      const oi = peds[pi].ordenes.findIndex(o => o.id === id && o.prov === PROV);
      if (oi >= 0) return { pi, oi, ped: peds[pi], oc: peds[pi].ordenes[oi], path: `pedidos.${pi}.ordenes.${oi}` };
    }
    return null;
  }
  const proyectoDe = ped => { const p = (L.get('proyectos') || []).find(x => x.id === ped.proyecto); return p ? p.n : ''; };

  // Lista unificada de solicitudes de Eléctrica Norte: leads de septiembre y octubre + estado actual.
  function solicitudes() {
    const priv = L.get('x.prov.sol') || {};
    const leads = BP.leadsSep.concat(BP.leadsOct);
    return leads.map(ld => {
      const sh = ocShared(ld.id);
      const otra = BP.otras.find(o => o.id === ld.id);
      const s = { id: ld.id, comp: ld.comp, proyecto: ld.proyecto, enviado: ld.fecha, lineasN: ld.lineas, total: ld.monto, status: ld.estado, vence: null, contra: null, compartida: !!sh };
      if (otra) Object.assign(s, { vence: otra.vence, hora: otra.hora, lineas: otra.lineas, total: otra.total, status: otra.status, respondido: otra.respondido, motivo: otra.motivo });
      if (sh) Object.assign(s, { proyecto: proyectoDe(sh.ped) || s.proyecto, enviado: sh.ped.enviado, total: sh.oc.total, lineasN: sh.oc.lineas, status: sh.oc.status, vence: sh.oc.vence, respondido: sh.oc.respondido, motivo: sh.oc.motivo, contra: sh.oc.contra || null, path: sh.path });
      if (!sh && priv[ld.id]) Object.assign(s, priv[ld.id]);
      if (ld.id === 'OC-2026-031-1') { s.lineas = BP.oc031; s.alternativas = 2; }
      if (!s.vence) s.vence = addDias(s.enviado, 2);
      s.estado = estadoDe(s);
      return s;
    }).sort((a, b) => (b.enviado + (b.hora || '')).localeCompare(a.enviado + (a.hora || '')));
  }
  function addDias(iso, n) { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); }
  function estadoDe(s) {
    if (s.contra && s.contra.estado === 'aceptada') return 'CONFIRMED';
    if (s.contra && s.contra.estado === 'rechazada') return 'REJECTED';
    if (s.status === 'SENT' && s.contra) return 'COUNTER';
    if (s.status === 'SENT' && dias(s.vence) < 0) return 'EXPIRED';
    return s.status;
  }
  const get = id => { const s = solicitudes().find(x => x.id === id); if (s && !s.lineas) s.lineas = generar(s); return s; };

  // Solicitudes viejas sin detalle en los datos: líneas deterministas del catálogo de «en» que suman el total.
  // La última línea («Accesorios de montaje») absorbe la diferencia para que el total cierre con la tarjeta.
  const EXTRAS = [
    { linea: 'x1', mat: 'Riel DIN', spec: '35 mm perforado × 2 m', marca: 'Zoloda', gama: '', u: 'u', codigo: 'GEN-7710', precio: 6400 },
    { linea: 'x2', mat: 'Canal ranurado', spec: '40×60 mm gris × 2 m', marca: 'Zoloda', gama: '', u: 'u', codigo: 'GEN-7781', precio: 8900 },
    { linea: 'x3', mat: 'Terminal puntera', spec: '2,5 mm² aislada × 100', marca: 'Zoloda', gama: '', u: 'u', codigo: 'GEN-7802', precio: 5200 },
    { linea: 'x4', mat: 'Prensacable', spec: 'PG 21 IP68', marca: 'Genrod', gama: '', u: 'u', codigo: 'GEN-7840', precio: 3100 },
    { linea: 'x5', mat: 'Numerador de cable', spec: '0 a 9 × 500', marca: 'Zoloda', gama: '', u: 'u', codigo: 'GEN-7866', precio: 7400 },
  ];
  function generar(s) {
    const B = window.B;
    const pool = B.lineas.filter(l => B.ofertas[l.id] && B.ofertas[l.id][PROV]).map(l => { const o = B.ofertas[l.id][PROV]; return { linea: l.id, mat: l.mat, spec: l.spec, marca: l.marca, gama: l.gama, u: l.u, codigo: o.codigo, precio: o.precio, stock: o.stock, plazo: o.plazo }; })
      .concat(EXTRAS.map(x => Object.assign({ stock: 500, plazo: 1 }, x)));
    const n = Math.max(1, s.lineasN - 1);
    const seed = [...s.id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const share = s.total * 0.9 / n;
    const baratas = pool.filter(x => x.precio <= share * 1.5);
    const orden = (baratas.length >= n ? baratas : pool.slice().sort((a, b) => a.precio - b.precio)).sort((a, b) => Math.abs(Math.log(a.precio / share)) - Math.abs(Math.log(b.precio / share)));
    const elegidas = orden.slice(0, Math.min(n, orden.length)).sort((a, b) => ((a.precio + seed) % 7) - ((b.precio + seed) % 7));
    const out = elegidas.map(x => Object.assign({}, x, { cant: Math.max(1, Math.round(share / x.precio)) }));
    let suma = out.reduce((a, x) => a + x.cant * x.precio, 0);
    // Ajusta cantidades hasta quedar por debajo del total y deja el resto a los accesorios (≤ 10 %)
    for (let k = 0; k < 400 && suma > s.total * 0.97; k++) { const x = out.reduce((m, y) => (y.cant > 1 && y.cant * y.precio > m.cant * m.precio ? y : m), out.find(y => y.cant > 1) || out[0]); if (x.cant <= 1) break; x.cant--; suma -= x.precio; }
    while (suma >= s.total && out.length > 1) { const x = out.pop(); suma -= x.cant * x.precio; }
    out.push({ linea: 'acc', mat: 'Accesorios de montaje', spec: 'Riel DIN, canal, precintos y terminales (global)', marca: 'Varias', gama: '', u: 'gl', cant: 1, codigo: 'GEN-9000', precio: s.total - suma, stock: 1, plazo: 1 });
    return out;
  }

  // Badge del proveedor (SupplierRequestStatusBadge): Recibida / Aceptada / Rechazada / Vencida (+ Contraoferta, nuevo)
  const BADGE = { SENT: ['pri', 'Recibida'], CONFIRMED: ['ok', 'Aceptada'], REJECTED: ['er', 'Rechazada'], EXPIRED: ['', 'Vencida'], COUNTER: ['vi', 'Contraoferta enviada'] };
  const badge = s => { const [c, t] = BADGE[s.estado] || BADGE.SENT; return `<span class="pv-badge ${c}">${t}</span>`; };

  // Escribe el estado de una solicitud: en data.js si es compartida (C la lee), si no en x.prov.sol.
  function escribir(s, campos) {
    if (s.path) Object.entries(campos).forEach(([k, v]) => L.set(s.path + '.' + k, v));
    else L.set('x.prov.sol.' + s.id, prev => Object.assign({}, prev || {}, campos));
  }
  function avisar(a) {
    L.update(st => {
      st.avisos = st.avisos || [];
      const i = st.avisos.findIndex(x => x.id === a.id); if (i >= 0) st.avisos.splice(i, 1);
      st.avisos.unshift(Object.assign({ cuando: 'recién' }, a));
    });
  }
  function aceptar(s) {
    escribir(s, { status: 'CONFIRMED', respondido: HOY });
    avisar({ id: 'prov-ok-' + s.id, t: `Eléctrica Norte confirmó ${s.id}`, d: `${s.lineasN} líneas · ${L.ars(s.total)} +IVA`, i: 'circle-check', tipo: 'ok', href: 'd-com-pedidos.html' });
  }
  function rechazar(s, motivo) {
    escribir(s, { status: 'REJECTED', respondido: HOY, motivo });
    avisar({ id: 'prov-rej-' + s.id, t: `Eléctrica Norte rechazó ${s.id}`, d: motivo, i: 'circle-x', tipo: 'er', href: 'd-com-pedidos.html' });
  }

  // ---- Borrador de respuesta por línea (compartido entre escritorio y teléfono) ----
  // acciones: confirmar | precio | plazo | equivalente | parcial | sinstock
  const ACC = {
    confirmar: { t: 'Confirmar', i: 'check', c: 'ok' },
    precio: { t: 'Cambiar precio', i: 'badge-dollar-sign', c: 'vi' },
    plazo: { t: 'Cambiar plazo', i: 'calendar-clock', c: 'vi' },
    equivalente: { t: 'Ofrecer equivalente', i: 'replace', c: 'vi' },
    parcial: { t: 'Entrega parcial', i: 'split', c: 'vi' },
    sinstock: { t: 'Sin stock', i: 'package-x', c: 'er' },
  };
  const borrador = id => L.get('x.prov.borrador.' + id) || { lineas: {}, alt: {}, revisadas: [] };
  const guardarBorrador = (id, b) => L.set('x.prov.borrador.' + id, b);

  // Calcula cada línea con su respuesta y el total. Todo sin IVA.
  function calcular(s, b = borrador(s.id)) {
    const filas = (s.lineas || []).map(l => {
      const r = b.lineas[l.linea] || { a: 'confirmar' };
      const alt = (b.alt || {})[l.linea] || 'principal';
      let precio = l.precio, cant = l.cant, plazo = l.plazo, prod = { codigo: l.codigo, marca: l.marca, gama: l.gama, desc: l.mat + ' ' + l.spec };
      if (l.alt && alt === 'alternativa') { precio = l.alt.precio; plazo = l.alt.plazo; prod = { codigo: l.alt.codigo, marca: l.alt.marca, gama: l.alt.gama, desc: l.alt.desc }; }
      let extra = 0; // «las dos»: se cotiza también la alternativa (no suma al total adjudicable)
      if (l.alt && alt === 'ambas') extra = l.alt.precio * l.cant;
      if (r.a === 'precio' && r.precio > 0) precio = r.precio;
      if (r.a === 'plazo' && r.plazo > 0) plazo = r.plazo;
      if (r.a === 'equivalente' && r.eq) { const e = (BP.equivalentes[l.linea] || []).find(x => x.codigo === r.eq); if (e) { precio = e.precio; plazo = e.plazo; prod = { codigo: e.codigo, marca: e.marca, gama: e.gama, desc: e.desc }; } }
      if (r.a === 'sinstock') cant = 0;
      const ahora = r.a === 'parcial' ? Math.min(r.ahora || 0, l.cant) : null;
      return { l, r, alt, precio, cant, plazo, prod, ahora, plazoResto: r.a === 'parcial' ? (r.plazo || 7) : null, sub: precio * cant, subAntes: l.precio * l.cant, extra };
    });
    const total = filas.reduce((a, f) => a + f.sub, 0);
    const totalAntes = filas.reduce((a, f) => a + f.subAntes, 0);
    const cambios = filas.filter(f => f.r.a !== 'confirmar' || f.alt !== 'principal');
    const plazoMax = Math.max(0, ...filas.filter(f => f.cant > 0).map(f => Math.max(f.plazo, f.plazoResto || 0)));
    return { filas, total, totalAntes, cambios, plazoMax };
  }
  const dTxt = n => n + (n === 1 ? ' día' : ' días');
  // Traduce el borrador al contrato compartido (.contra)
  function contraDe(s, c) {
    const lineas = [];
    c.filas.forEach(f => {
      const base = { linea: f.l.linea };
      if (f.alt !== 'principal') lineas.push(Object.assign({}, base, { cambio: 'equivalente', antes: `${f.l.marca} ${f.l.gama}`.trim(), despues: f.alt === 'ambas' ? `${f.l.marca} ${f.l.gama} o ${f.l.alt.marca} ${f.l.alt.gama}` : `${f.l.alt.marca} ${f.l.alt.gama}`, nota: f.alt === 'ambas' ? 'BOM alternativo: cotizo las dos opciones, elegís vos.' : 'BOM alternativo: cotizo la alternativa que pediste.', bomAlternativo: f.alt, precioAntes: f.l.precio, precioDespues: f.alt === 'ambas' ? f.l.precio : f.l.alt.precio }));
      const r = f.r;
      if (r.a === 'precio') lineas.push(Object.assign({}, base, { cambio: 'precio', antes: L.ars(f.l.precio), despues: L.ars(f.precio), nota: r.nota || 'Precio unitario sin IVA.', precioAntes: f.l.precio, precioDespues: f.precio }));
      if (r.a === 'plazo') lineas.push(Object.assign({}, base, { cambio: 'plazo', antes: dTxt(f.l.plazo), despues: dTxt(f.plazo), nota: r.nota || '' }));
      if (r.a === 'equivalente') lineas.push(Object.assign({}, base, { cambio: 'equivalente', antes: `${f.l.marca} ${f.l.gama}`.trim(), despues: `${f.prod.marca} ${f.prod.gama} (${f.prod.codigo})`, nota: r.nota || 'Mismo componente base y mismos atributos esenciales. Cambia la marca: revisá la verificación de diseño (IEC 61439).', precioAntes: f.l.precio, precioDespues: f.precio, codigo: f.prod.codigo }));
      if (r.a === 'parcial') lineas.push(Object.assign({}, base, { cambio: 'parcial', antes: `${L.num(f.l.cant)} ${f.l.u} en ${dTxt(f.l.plazo)}`, despues: `${L.num(f.ahora)} ${f.l.u} en ${dTxt(f.l.plazo)} y ${L.num(f.l.cant - f.ahora)} ${f.l.u} en ${dTxt(f.plazoResto)}`, nota: r.nota || '', ahora: f.ahora, resto: f.l.cant - f.ahora }));
      if (r.a === 'sinstock') lineas.push(Object.assign({}, base, { cambio: 'parcial', sinStock: true, antes: `${L.num(f.l.cant)} ${f.l.u}`, despues: `0 ${f.l.u}`, nota: r.nota || 'Sin stock: no la cotizo.' }));
    });
    return { lineas, estado: 'pendiente', enviada: HOY, total: c.total, totalAntes: c.totalAntes, plazoMax: c.plazoMax, validez: addDias(HOY, 7), por: 'julian' };
  }
  function enviarContra(s) {
    const c = calcular(s);
    const contra = contraDe(s, c);
    escribir(s, { contra });
    const n = new Set(contra.lineas.map(x => x.linea)).size;
    avisar({ id: s.id === 'OC-2026-031-1' ? 'a2' : 'prov-ctr-' + s.id, t: `Eléctrica Norte propone un cambio en ${n} ${n === 1 ? 'línea' : 'líneas'}`, d: `Contraoferta a ${s.id}: ${L.ars(contra.total)} +IVA (antes ${L.ars(contra.totalAntes)})`, i: 'repeat', tipo: 'vi', href: 'd-com-pedidos.html?vista=contraoferta' });
    return contra;
  }
  function retirarContra(s) { escribir(s, { contra: null }); }

  // ---- Piezas de interfaz ----
  const comprador = s => BP.compradores[s.comp];
  const revelado = s => s.estado === 'CONFIRMED';
  const quien = s => revelado(s) ? comprador(s).n : comprador(s).anon;
  const usuario = id => (window.B.usuarios || {})[id] || { n: id };
  function contactoHTML(s) {
    const c = comprador(s), k = c.contacto;
    const f = (i, t, v) => `<div class="pv-cf">${L.icon(i)}<div><span class="lbl">${t}</span><b>${L.esc(v || 'Sin dato')}</b></div></div>`;
    return `<div class="card pv-contact"><div class="card-h"><span class="av">${k.nombre.split(' ').map(x => x[0]).join('').slice(0, 2)}</span><div class="grow"><h3>${L.esc(k.nombre)}</h3><div class="sub">${L.esc(k.cargo)} · ${L.esc(c.n)}</div></div><span class="pv-badge ok">Disponible</span> <span class="tag-existe">existe</span></div>
      <div class="card-b pv-cgrid">${f('building-2', 'Empresa', c.n)}${f('file-text', 'CUIT', k.cuit)}${f('map-pin', 'Ubicación', c.zona)}${f('message-circle', 'Método preferido', k.metodo)}${f('phone', 'Teléfono', k.tel)}${f('mail', 'Mail', k.mail)}${f('calendar-clock', 'Horario', k.horario)}${f('notebook-pen', 'Notas', k.notas)}</div>
      <div class="card-b row wrap" style="border-top:1px solid var(--border)"><button class="btn out sm" data-copiar="${L.esc(k.tel)}">${L.icon('message-circle')}WhatsApp</button><button class="btn out sm" data-copiar="${L.esc(k.mail)}">${L.icon('mail')}Copiar mail</button><span class="muted" style="font-size:12px">El pago y el flete se arreglan con el comprador, por fuera de liard.</span></div></div>`;
  }
  document.addEventListener('click', e => {
    const c = e.target.closest('[data-copiar]');
    if (c) { try { navigator.clipboard && navigator.clipboard.writeText(c.dataset.copiar); } catch (er) { /* sin permiso */ } L.toast('Copiado', { desc: c.dataset.copiar }); }
  });

  // Atajo de teclado visible: los elementos con data-key="x" se disparan con la tecla (si no se está escribiendo).
  document.addEventListener('keydown', e => {
    if (e.metaKey || e.ctrlKey || e.altKey || /INPUT|TEXTAREA|SELECT/.test((e.target.tagName || ''))) return;
    if (document.querySelector('.ov')) return;
    const b = document.querySelector(`[data-key="${CSS.escape(e.key.toLowerCase())}"]`);
    if (b && !b.disabled) { e.preventDefault(); b.click(); }
  });

  window.P = { HOY, PROV, dias, hace, venceTxt, addDias, solicitudes, get, badge, BADGE, aceptar, rechazar, escribir, avisar, ACC, borrador, guardarBorrador, calcular, contraDe, enviarContra, retirarContra, comprador, quien, revelado, contactoHTML, usuario, dTxt };
})();
