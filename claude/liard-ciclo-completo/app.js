/* liard · runtime compartido de los mocks.
   Cada pantalla carga: ui.css, icons.js, data.js, app.js (y su propio js si lo tiene).
   El <body> declara el shell:
     data-role     ing | prov | tal | obra | cli   (cli = vista pública sin shell)
     data-active   id del ítem de navegación activo (ver NAV)
     data-title    h1 de la página · data-sub  descripción debajo
     data-crumbs   "Proyectos|d-ing-proyectos.html>Hospital Cañuelas|d-ing-proyecto.html>Planos"
     data-h        existe | s4 | s5 | h1 | h2 | h3   (marca de horizonte abajo a la izquierda)
     data-back     (móvil) href del botón volver
     class="m"     teléfono 390 × 844
   Contenido en <main id="page"> y acciones del encabezado en <div id="act">.
   Estado: L.get / L.set / L.on sobre localStorage['liard-cc:v1'] (semilla = window.B).
   Dentro de un marco de la galería (?marco=1) el estado vive en memoria: mirar no cambia la demo. */
(function () {
  const q = new URLSearchParams(location.search);
  const MARCO = q.get('marco') === '1';
  const KEY = 'liard-cc:v1';
  const clone = o => JSON.parse(JSON.stringify(o));

  // Dentro de un marco, focus() y scrollIntoView() no pueden mover la galería: el navegador desplaza también la
  // página de afuera hasta el iframe. Acá el foco no desplaza nada y el scroll queda dentro del documento del marco.
  if (MARCO) {
    const focus0 = HTMLElement.prototype.focus;
    HTMLElement.prototype.focus = function (o) { return focus0.call(this, Object.assign({}, o, { preventScroll: true })); };
    Element.prototype.scrollIntoView = function () {
      const r = this.getBoundingClientRect();
      let el = this.parentElement;
      while (el && el !== document.body) { const cs = getComputedStyle(el); if (/(auto|scroll)/.test(cs.overflowY + cs.overflowX) && (el.scrollHeight > el.clientHeight || el.scrollWidth > el.clientWidth)) { const pr = el.getBoundingClientRect(); el.scrollTop += r.top - pr.top - el.clientHeight / 3; el.scrollLeft += r.left - pr.left - el.clientWidth / 3; return; } el = el.parentElement; }
      window.scrollTo(0, window.scrollY + r.top - window.innerHeight / 3);
    };
  }

  // ---------- Íconos ----------
  function icon(name, cls = '') {
    const body = (window.LUCIDE || {})[name];
    if (!body) { console.warn('ícono inexistente:', name); return ''; }
    return `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>`;
  }
  const LOGO_LOCKUP = '<svg class="logo" viewBox="0 0 323.28 100" fill="currentColor" fill-rule="evenodd" role="img" aria-label="liard"><path d="M70.71,0.00 71.27,0.19 71.27,49.20 70.80,49.67 34.79,34.05 34.79,14.78 35.26,14.31 48.54,9.26 51.54,7.77Z M34.23,34.42 34.61,34.61 34.61,99.16 34.33,99.44 0.46,99.44 0.00,98.97 0.18,48.83Z M108.32,34.42 109.07,34.42 109.07,99.16 108.79,99.44 71.74,99.44 71.27,98.78 71.27,50.14 73.06,49.11Z M319.54,36.29 322.44,36.39 323.09,37.04 323.28,79.88 322.90,98.78 321.88,99.44 313.64,99.44 312.43,98.59 312.24,95.79 311.58,95.70 308.03,97.94 304.10,99.44 301.11,100.00 295.31,100.00 290.07,98.88 285.58,96.82 282.58,94.58 279.69,91.48 276.88,86.44 275.76,82.69 275.39,79.51 275.76,72.97 277.26,68.47 278.56,66.04 280.43,63.42 283.14,60.70 286.14,58.65 288.76,57.34 293.99,55.84 299.43,55.47 304.29,56.22 307.66,57.34 311.96,59.96 312.24,59.68 312.24,37.23 313.08,36.39Z M147.04,36.48 156.30,36.39 157.33,37.60 157.33,97.85 157.15,98.41 155.74,99.44 147.88,99.44 146.95,99.06 146.29,98.22 146.29,37.41Z M172.49,37.41 175.02,37.51 176.89,38.44 178.85,40.60 179.41,42.47 179.22,45.46 178.47,46.96 176.89,48.54 174.27,49.67 172.20,49.67 169.77,48.73 168.00,47.14 166.88,43.97 167.25,41.54 168.56,39.29 170.89,37.69Z M209.53,55.56 212.43,55.47 216.93,56.03 219.17,56.59 223.65,58.46 229.09,62.40 232.73,67.35 234.60,72.02 235.16,75.40 235.35,98.03 234.69,99.06 233.94,99.44 225.90,99.44 224.50,98.41 224.31,95.79 223.84,95.70 221.97,97.19 219.36,98.50 214.86,99.81 207.57,100.00 205.50,99.62 201.20,98.31 196.53,95.70 192.88,92.42 191.01,89.80 188.95,85.31 187.83,79.88 188.20,73.71 190.07,67.91 192.88,63.61 195.78,60.70 198.21,59.02 203.63,56.59Z M262.67,55.75 269.68,56.22 271.17,56.59 272.01,57.43 272.20,65.67 270.98,66.70 270.05,66.70 266.31,65.57 262.20,65.57 259.95,66.32 257.42,68.47 255.93,72.02 255.93,98.03 255.55,98.78 254.53,99.44 245.73,99.25 244.70,97.85 244.70,74.46 245.82,67.54 248.25,62.86 250.04,60.70 252.84,58.46 254.90,57.34 258.45,56.22Z M169.49,56.31 177.26,56.22 178.01,56.59 178.85,57.81 178.85,98.03 178.38,98.88 177.26,99.44 169.40,99.44 168.28,98.88 167.62,97.66 167.62,59.49 168.00,57.25Z M209.44,65.39 206.64,66.13 204.20,67.44 201.30,70.15 199.06,74.84 199.06,80.82 200.92,85.13 204.57,88.58 208.50,90.27 214.49,90.27 216.35,89.71 219.17,88.21 222.63,84.57 223.75,82.31 224.50,79.14 224.12,74.65 222.25,70.53 219.17,67.44 214.86,65.57Z M297.00,65.39 294.18,66.13 291.75,67.44 288.29,71.09 286.99,73.71 286.42,76.14 286.61,80.63 287.36,83.06 289.23,86.06 292.50,88.77 294.94,89.89 297.37,90.45 299.24,90.64 302.23,90.27 305.98,88.77 307.85,87.46 310.00,85.13 311.30,82.87 312.05,80.44 312.05,75.21 310.56,71.46 309.06,69.41 307.10,67.63 302.60,65.57Z"/></svg>';

  // ---------- Navegación por rol ----------
  // n: true = ítem nuevo (lleva "Nuevo"); los demás existen en dev.
  const NAV = {
    ing: [
      { g: null, items: [
        { id: 'inicio', t: 'Inicio', i: 'layout-dashboard', href: 'd-pla-inicio.html', n: true },
        { id: 'proyectos', t: 'Proyectos', i: 'folder-kanban', href: 'd-ing-proyectos.html' },
        { id: 'presupuestos', t: 'Presupuestos', i: 'file-spreadsheet', href: 'd-com-presupuesto.html', n: true },
        { id: 'pedidos', t: 'Pedidos', i: 'shopping-cart', href: 'd-com-pedidos.html' },
      ] },
      { g: 'Operación', items: [
        { id: 'taller', t: 'Taller', i: 'factory', href: 'd-tal-taller.html', n: true },
        { id: 'obra', t: 'Obras y entregas', i: 'hard-hat', href: 'd-tal-entregas.html', n: true },
        { id: 'mantenimiento', t: 'Mantenimiento', i: 'wrench', href: 'd-tal-mantenimiento.html', n: true },
      ] },
      { g: 'Empresa', items: [
        { id: 'reglas', t: 'Automatizaciones', i: 'workflow', href: 'd-pla-automatizaciones.html', n: true },
        { id: 'equipo', t: 'Equipo y permisos', i: 'users', href: 'd-pla-equipo.html', n: true },
        { id: 'plan', t: 'Plan y consumo', i: 'gauge', href: 'd-pla-plan.html', n: true },
      ] },
    ],
    prov: [
      { g: null, items: [
        { id: 'p-inicio', t: 'Inicio', i: 'layout-dashboard', href: 'd-prov-inicio.html', n: true },
      ] },
      { g: 'Solicitudes', i: 'clipboard-list', items: [
        { id: 'p-recibidas', t: 'Recibidas', href: 'd-prov-solicitudes.html', sub: true },
        { id: 'p-aceptadas', t: 'Aceptadas', href: 'd-prov-solicitudes.html?estado=aceptadas', sub: true },
        { id: 'p-rechazadas', t: 'Rechazadas', href: 'd-prov-solicitudes.html?estado=rechazadas', sub: true },
      ] },
      { g: 'Catálogo', i: 'library-big', items: [
        { id: 'p-productos', t: 'Productos', href: 'd-prov-catalogo.html', sub: true },
        { id: 'p-gestion', t: 'Gestión de productos', href: 'd-prov-catalogo.html?vista=importar', sub: true },
        { id: 'p-vinculacion', t: 'Vinculación', href: 'd-prov-catalogo.html?vista=vincular', sub: true },
        { id: 'p-listas', t: 'Listas y sincronización', href: 'd-prov-integraciones.html', sub: true, n: true },
      ] },
      { g: 'Comercial', i: 'store', items: [
        { id: 'p-vidriera', t: 'Vidriera y demanda', href: 'd-prov-vidriera.html', sub: true, n: true },
        { id: 'p-leads', t: 'Leads y facturación', href: 'd-prov-leads.html', sub: true, n: true },
      ] },
    ],
  };
  NAV.tal = NAV.ing; // el taller y la dirección usan el shell de la empresa de ingeniería

  // Barra inferior de teléfono por rol
  const TABS = {
    ing: [
      { id: 'm-inicio', t: 'Inicio', i: 'house', href: 'm-pla-inicio.html' },
      { id: 'm-aprobar', t: 'Aprobar', i: 'stamp', href: 'm-com-aprobar.html' },
      { id: 'm-avisos', t: 'Avisos', i: 'bell', href: 'm-pla-avisos.html' },
      { id: 'm-asistente', t: 'Asistente', i: 'sparkles', href: 'm-pla-asistente.html' },
    ],
    obra: [
      { id: 'm-hoy', t: 'Hoy', i: 'calendar-check', href: 'm-tal-hoy.html' },
      { id: 'm-recibir', t: 'Recibir', i: 'package-check', href: 'm-tal-recibir.html' },
      { id: 'm-tableros', t: 'Tableros', i: 'cuboid', href: 'm-tal-tablero.html' },
      { id: 'm-avisos', t: 'Avisos', i: 'bell', href: 'm-pla-avisos.html?rol=obra' },
    ],
    prov: [
      { id: 'm-p-solicitudes', t: 'Solicitudes', i: 'clipboard-list', href: 'm-prov-solicitudes.html' },
      { id: 'm-p-responder', t: 'Responder', i: 'reply', href: 'm-prov-responder.html' },
      { id: 'm-p-avisos', t: 'Avisos', i: 'bell', href: 'm-pla-avisos.html?rol=prov' },
    ],
  };
  const HZ = { existe: 'Existe en dev', s4: 'Sprint 4 · pendiente', s5: 'Sprint 5 · planificado', h1: 'Propuesta · 0–6 meses', h2: 'Propuesta · 6–18 meses', h3: 'Concepto' };

  // ---------- Estado ----------
  let mem = null; const subs = [];
  function load() {
    if (mem) return mem;
    if (!MARCO) { try { const s = localStorage.getItem(KEY); if (s) return (mem = JSON.parse(s)); } catch (e) { /* estado corrupto: se resiembra */ } }
    return (mem = clone(window.B || {}));
  }
  function save() { if (!MARCO) { try { localStorage.setItem(KEY, JSON.stringify(mem)); } catch (e) { /* cuota llena */ } } subs.forEach(f => f(mem)); }
  const walk = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
  function get(path) { const s = load(); return path ? walk(s, path) : s; }
  function set(path, val) {
    const s = load(); const ks = path.split('.'); const last = ks.pop();
    const tgt = ks.reduce((a, k) => (a[k] ??= {}), s);
    tgt[last] = typeof val === 'function' ? val(tgt[last]) : val; save();
  }
  function update(fn) { fn(load()); save(); }
  function on(fn) { subs.push(fn); }
  function reset() { localStorage.removeItem(KEY); mem = null; load(); save(); }
  window.addEventListener('storage', e => { if (e.key === KEY && !MARCO) { mem = null; load(); subs.forEach(f => f(mem)); } });

  // ---------- Formato (es-AR) ----------
  const nf0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const nf2 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const ars = (n, dec) => '$ ' + (dec ? nf2 : nf0).format(Math.round(n * (dec ? 100 : 1)) / (dec ? 100 : 1));
  const usd = n => 'US$ ' + nf2.format(n);
  const num = (n, d = 0) => new Intl.NumberFormat('es-AR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(n);
  const pct = (n, d = 0) => num(n, d) + ' %';
  const fecha = iso => !iso ? '—' : new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const fechaCorta = iso => !iso ? '—' : new Date(iso + (iso.length === 10 ? 'T12:00:00' : '')).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' }).replace('.', '');
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  // ---------- Navegación entre pantallas ----------
  // Un enlace interno conserva marco=1 para que dentro de la galería todo siga aislado.
  function href(h) {
    if (!h || /^(https?:|#|mailto:)/.test(h) || !MARCO) return h;
    return h + (h.includes('?') ? '&' : '?') + 'marco=1';
  }
  function go(h) { location.href = href(h); }
  function param(name, val) {
    const p = new URLSearchParams(location.search);
    if (val == null || val === '') p.delete(name); else p.set(name, val);
    location.search = p.toString();
  }

  // ---------- Toasts ----------
  function toast(title, opts = {}) {
    const type = opts.type || 'success';
    let box = document.querySelector('.toasts');
    if (!box) { box = document.createElement('div'); box.className = 'toasts'; box.setAttribute('role', 'status'); box.setAttribute('aria-live', 'polite'); document.body.appendChild(box); }
    const icons = { success: 'circle-check', error: 'circle-alert', warning: 'triangle-alert', info: 'info', loading: 'loader-circle' };
    const ms = opts.ms || ({ error: 4000, warning: 3000 }[type] || 2600) + Math.max(0, (title + (opts.desc || '')).length - 30) * 35 + (opts.action ? 2400 : 0);
    const el = document.createElement('div');
    el.className = 'toast ' + type;
    el.innerHTML = `${icon(icons[type], type === 'loading' ? 'spin' : '')}<div class="grow"><b>${esc(title)}</b>${opts.desc ? `<span class="muted">${esc(opts.desc)}</span>` : ''}</div>${opts.action ? `<button class="btn xs out">${esc(opts.action)}</button>` : ''}<i class="pg" style="animation-duration:${ms}ms"></i>`;
    if (opts.action) el.querySelector('button').onclick = () => { opts.onAction && opts.onAction(); el.remove(); };
    box.appendChild(el);
    setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 220); }, Math.min(ms, 10000));
    return el;
  }

  // ---------- Diálogos y paneles ----------
  function close(el) { const ov = el?.closest ? el.closest('.ov') : document.querySelector('.ov:last-of-type'); if (ov) ov.remove(); }
  function dialog({ title, desc, body = '', actions = [], wide, icon: ic }) {
    const ov = document.createElement('div');
    ov.className = 'ov';
    ov.innerHTML = `<div class="dlg ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${esc(title)}">
      <div class="dlg-h">${ic ? `<div class="card-ico">${icon(ic)}</div>` : ''}<div class="grow"><h2>${esc(title)}</h2>${desc ? `<p>${desc}</p>` : ''}</div><button class="btn icon sm ghost" data-x aria-label="Cerrar">${icon('x')}</button></div>
      <div class="dlg-b">${body}</div>
      ${actions.length ? `<div class="dlg-f">${actions.map((a, i) => `<button class="btn ${a.cls || (i === actions.length - 1 ? 'pri' : 'out')}" data-a="${i}">${a.icon ? icon(a.icon) : ''}${esc(a.t)}</button>`).join('')}</div>` : ''}
    </div>`;
    ov.addEventListener('click', e => {
      if (e.target === ov || e.target.closest('[data-x]')) return ov.remove();
      const b = e.target.closest('[data-a]'); if (!b) return;
      const a = actions[+b.dataset.a];
      if (a.fn && a.fn(ov) === false) return; // false = no cerrar (validación)
      ov.remove();
    });
    document.body.appendChild(ov);
    setTimeout(() => (ov.querySelector('input, select, textarea, [data-a]') || ov.querySelector('[data-x]')).focus(), 30);
    return ov;
  }
  function sheet(html, { label = 'Panel' } = {}) {
    const ov = document.createElement('div');
    ov.className = 'ov sheet';
    ov.innerHTML = `<aside class="pnl" role="dialog" aria-modal="true" aria-label="${esc(label)}">${html}</aside>`;
    ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-x]')) ov.remove(); });
    document.body.appendChild(ov);
    return ov;
  }
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { const ovs = document.querySelectorAll('.ov'); if (ovs.length) ovs[ovs.length - 1].remove(); }
  });

  // ---------- Paleta de comandos ⌘K ----------
  function cmdk() {
    if (document.querySelector('.ov .cmdk')) return;
    const role = document.body.dataset.role || 'ing';
    const navs = (NAV[role] || NAV.ing).flatMap(g => g.items.map(i => ({ t: i.t, i: i.i || g.i || 'arrow-right', href: i.href, g: 'Ir a' })));
    const extra = (window.CMDK_EXTRA || []).concat(role === 'prov' ? [] : [
      { g: 'Acciones', t: 'Preguntarle al asistente sobre este proyecto', i: 'sparkles', href: 'd-pla-asistente.html' },
      { g: 'Acciones', t: 'Nuevo proyecto', i: 'plus', href: 'd-ing-carga.html' },
      { g: 'Acciones', t: 'Comparar escenarios de compra', i: 'git-compare-arrows', href: 'd-com-escenarios.html' },
      { g: 'Acciones', t: 'Abrir el tablero TGBT en 3D', i: 'box', href: 'd-bom-3d.html' },
    ]);
    const all = navs.concat(extra);
    const ov = document.createElement('div');
    ov.className = 'ov';
    ov.innerHTML = `<div class="cmdk" role="dialog" aria-label="Buscar y ejecutar"><div class="cmdk-in">${icon('search')}<input placeholder="Buscá una pantalla, un tablero o preguntale al asistente…" aria-label="Buscar"><span class="kbd">esc</span></div><div class="cmdk-l"></div><div class="cmdk-f"><span><kbd>↑</kbd> <kbd>↓</kbd> moverse</span><span><kbd>↵</kbd> abrir</span><span class="ml-auto">${icon('sparkles')} Si no hay resultado, se lo preguntás al asistente</span></div></div>`;
    const inp = ov.querySelector('input'); const list = ov.querySelector('.cmdk-l'); let idx = 0, cur = [];
    const draw = () => {
      const t = inp.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
      cur = all.filter(o => !t || o.t.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(t));
      if (t && !cur.length) cur = [{ g: 'Asistente', t: `Preguntar: “${inp.value}”`, i: 'sparkles', href: 'd-pla-asistente.html?q=' + encodeURIComponent(inp.value) }];
      idx = Math.min(idx, cur.length - 1);
      let lastG = '';
      list.innerHTML = cur.map((o, i) => { const h = o.g !== lastG ? `<div class="cmdk-g lbl">${esc(o.g)}</div>` : ''; lastG = o.g; return h + `<div class="cmdk-o ${i === idx ? 'on' : ''}" data-i="${i}">${icon(o.i)}${esc(o.t)}<small>${esc(o.k || '')}</small></div>`; }).join('');
    };
    inp.addEventListener('input', () => { idx = 0; draw(); });
    inp.addEventListener('keydown', e => {
      if (e.key === 'ArrowDown') { idx = Math.min(idx + 1, cur.length - 1); draw(); e.preventDefault(); }
      if (e.key === 'ArrowUp') { idx = Math.max(idx - 1, 0); draw(); e.preventDefault(); }
      if (e.key === 'Enter' && cur[idx]) go(cur[idx].href);
    });
    list.addEventListener('click', e => { const o = e.target.closest('[data-i]'); if (o) go(cur[+o.dataset.i].href); });
    ov.addEventListener('click', e => { if (e.target === ov) ov.remove(); });
    document.body.appendChild(ov); draw(); inp.focus();
  }
  document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); cmdk(); } });

  // ---------- Shell ----------
  function crumbs(spec) {
    if (!spec) return '';
    const parts = spec.split('>').map(p => p.split('|'));
    return `<nav class="crumbs" aria-label="Ruta">${parts.map(([t, h], i) => (i ? `<span class="sep">${icon('chevron-right')}</span>` : '') + (h ? `<a href="${esc(href(h))}">${esc(t)}</a>` : `<b>${esc(t)}</b>`)).join('')}</nav>`;
  }
  function shell() {
    const b = document.body; const d = b.dataset;
    const page = document.getElementById('page'); if (!page) return;
    const act = document.getElementById('act');
    const role = d.role || 'ing';
    if (d.h) { const hz = document.createElement('div'); hz.className = 'hz ' + d.h; hz.textContent = HZ[d.h] || d.h; b.appendChild(hz); }
    if (role === 'cli') return; // vista pública: la pantalla arma todo

    if (b.classList.contains('m')) {
      page.classList.add('page');
      const bar = document.createElement('header'); bar.className = 'mbar';
      bar.innerHTML = (d.back ? `<a class="back" href="${esc(href(d.back))}" aria-label="Volver">${icon('chevron-left')}</a>` : `<span style="color:var(--primary)">${LOGO_LOCKUP}</span>`) + `<h1>${esc(d.title || '')}</h1>` + (act ? '' : '') ;
      if (act) { act.classList.add('row', 'gap8'); bar.appendChild(act); }
      b.insertBefore(bar, b.firstChild);
      if (d.sub) { const s = document.createElement('p'); s.className = 'msub'; s.textContent = d.sub; bar.after(s); }
      const tabs = TABS[d.tabs || role];
      if (tabs && d.tabs !== 'none') {
        const nav = document.createElement('nav'); nav.className = 'mtab'; nav.setAttribute('aria-label', 'Secciones');
        // Avisos sin leer: salen del estado (avisos − x.pla.leidos), así bajan al leerlos y no aparecen en una empresa nueva.
        const leidos = (get('x.pla.leidos') || []);
        const sinLeer = (get('avisos') || []).filter(a => !leidos.includes(a.id)).length;
        const badges = Object.assign({}, (window.B && window.B.avisosSinLeer) || {}, { 'm-avisos': sinLeer, 'm-p-avisos': sinLeer });
        // Aprobaciones: si compras ya guardó su lista, cuentan las que siguen pendientes (sin «estado» o «pendiente»).
        const apr = get('x.compras.aprob');
        if (Array.isArray(apr)) badges['m-aprobar'] = apr.filter(a => !a.estado || a.estado === 'pendiente').length;
        nav.innerHTML = tabs.map(t => `<a href="${esc(href(t.href))}" class="${t.id === d.active ? 'on' : ''}">${icon(t.i)}${esc(t.t)}${badges[t.id] ? `<span class="dot">${badges[t.id]}</span>` : ''}</a>`).join('');
        b.appendChild(nav);
      }
      return;
    }

    const user = (window.B && window.B.usuarios && window.B.usuarios[d.user || (role === 'prov' ? 'julian' : 'martina')]) || { n: 'Martina Giménez', r: 'Ingeniera', ini: 'MG' };
    const counts = (window.B && window.B.navCounts) || {};
    const groups = NAV[role] || NAV.ing;
    const items = groups.map(g => {
      const head = g.g ? (g.i ? `<div class="sb-i" style="font-weight:500">${icon(g.i)}<span>${esc(g.g)}</span>${icon('chevron-down', 'ml-auto')}</div>` : `<div class="sb-gt">${esc(g.g)}</div>`) : '';
      return `<div class="sb-g">${head}${g.items.map(i => `<a class="sb-i ${i.sub ? 'sb-sub' : ''} ${i.id === d.active ? 'on' : ''}" href="${esc(href(i.href))}" ${i.id === d.active ? 'aria-current="page"' : ''}>${i.i ? icon(i.i) : ''}<span>${esc(i.t)}</span>${counts[i.id] ? `<span class="cnt ${counts[i.id].w ? 'warn' : ''}">${counts[i.id].n ?? counts[i.id]}</span>` : ''}${i.n ? '<span class="nuevo">Nuevo</span>' : ''}</a>`).join('')}</div>`;
    }).join('');
    const sb = `<aside class="sb" aria-label="Navegación">
      <div class="sb-h"><div class="sb-brand"><a href="${esc(href(role === 'prov' ? 'd-prov-inicio.html' : 'd-ing-proyectos.html'))}" aria-label="liard, ir al inicio">${LOGO_LOCKUP}</a><button class="tgl" data-rail aria-label="Plegar la navegación" title="Plegar la navegación ⌘B">${icon('panel-left')}</button></div>
        ${role === 'prov' ? '' : `<button class="sb-new" data-href="d-ing-carga.html">${icon('plus')}<span>Nuevo proyecto</span></button>`}
        <button class="sb-cmd" data-cmdk aria-label="Buscar o preguntar (⌘K)">${icon('search')}<span>Buscar o preguntar</span><kbd>⌘K</kbd></button>
      </div>
      <nav class="sb-nav">${items}</nav>
      <div class="sb-f"><div class="sb-acc"><span class="av ${user.c || ''}">${esc(user.ini)}</span><div class="grow"><b>${esc(user.n)}</b><small>${esc(user.r)}</small></div>${icon('chevrons-up-down', 'muted')}</div></div>
    </aside>`;
    const header = (d.title || d.crumbs) ? `<header class="ph"><div class="ph-t">${crumbs(d.crumbs)}<h1>${esc(d.title || '')}</h1>${d.sub ? `<p class="sub">${esc(d.sub)}</p>` : ''}</div></header>` : '';
    const wrap = document.createElement('div'); wrap.className = 'shell';
    wrap.innerHTML = sb + `<div class="main">${header}</div>`;
    b.insertBefore(wrap, b.firstChild);
    const main = wrap.querySelector('.main');
    if (act) { act.classList.add('ph-a'); const ph = main.querySelector('.ph'); if (ph) ph.appendChild(act); }
    main.appendChild(page);
    page.classList.add('page');
    wrap.querySelector('[data-rail]').onclick = () => wrap.classList.toggle('rail');
    document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') { e.preventDefault(); wrap.classList.toggle('rail'); } });
  }

  // ---------- Comportamientos declarativos ----------
  document.addEventListener('click', e => {
    const h = e.target.closest('[data-href]');
    if (h && !e.defaultPrevented) { e.preventDefault(); return go(h.dataset.href); }
    if (e.target.closest('[data-cmdk]')) return cmdk();
    const t = e.target.closest('[data-tab]');
    if (t) {
      const box = t.closest('[data-tabs]'); const scope = box.dataset.tabs ? document.getElementById(box.dataset.tabs) || document : document;
      box.querySelectorAll('[data-tab]').forEach(x => { x.classList.toggle('on', x === t); x.setAttribute('aria-selected', x === t); });
      scope.querySelectorAll('[data-panel]').forEach(p => { if (p.closest('[data-tabs-scope]') === box.closest('[data-tabs-scope]')) p.hidden = p.dataset.panel !== t.dataset.tab; });
    }
    const sw = e.target.closest('.switch');
    if (sw && !sw.dataset.manual) sw.setAttribute('aria-checked', sw.getAttribute('aria-checked') !== 'true');
    const v = e.target.closest('[data-vista]');
    if (v) param(v.closest('[data-param]')?.dataset.param || 'vista', v.dataset.vista);
  });
  // Los <a> internos conservan marco=1
  function fixLinks(root = document) {
    if (!MARCO) return;
    root.querySelectorAll('a[href]').forEach(a => {
      const h = a.getAttribute('href');
      if (h && !/^(https?:|#|mailto:|javascript:)/.test(h) && !h.includes('marco=1') && !a.target) a.setAttribute('href', href(h));
    });
  }

  // Selector de variantes: <div class="seg" data-param="vista"><button data-vista="guiada">…</button></div>
  function markVariants() {
    document.querySelectorAll('[data-param]').forEach(box => {
      const cur = q.get(box.dataset.param) || box.dataset.default || '';
      box.querySelectorAll('[data-vista]').forEach(b => b.classList.toggle('on', b.dataset.vista === cur));
    });
  }

  // ---------- Alto para la galería (?full=1) ----------
  function reportHeight() {
    if (window.parent === window) return;
    const h = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    window.parent.postMessage({ tipo: 'liard-alto', alto: h }, '*');
  }

  function boot() {
    shell(); markVariants(); fixLinks();
    document.querySelectorAll('[data-icon]').forEach(el => { el.insertAdjacentHTML('afterbegin', icon(el.dataset.icon)); el.removeAttribute('data-icon'); });
    if (window.MOCK && typeof window.MOCK.init === 'function') window.MOCK.init();
    fixLinks();
    reportHeight(); setTimeout(reportHeight, 400); setTimeout(reportHeight, 1500);
    new MutationObserver(() => { clearTimeout(boot._t); boot._t = setTimeout(() => { reportHeight(); fixLinks(); }, 120); }).observe(document.body, { childList: true, subtree: true });
  }

  window.L = { icon, LOGO_LOCKUP, get, set, update, on, reset, toast, dialog, sheet, close, cmdk, go, href, param, q: k => q.get(k), MARCO, ars, usd, num, pct, fecha, fechaCorta, esc, fixLinks, HZ };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
