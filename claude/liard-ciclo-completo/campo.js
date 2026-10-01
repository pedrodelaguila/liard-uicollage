/* liard · área E (fabricación, obra y mantenimiento) · helpers compartidos por las pantallas d-tal-*, m-tal-*, m-cli-*.
   Se carga después de app.js (usa window.L). Estado propio del área en x.campo.*; claves compartidas que escribe:
   tableros[i].estado/.avance/.frena, recepciones, avisos. */
(function () {
  const B = window.B, K = window.CAMPO;
  const C = {};

  // ---------- Estado ----------
  C.x = (k, v) => (v === undefined ? L.get('x.campo.' + k) : L.set('x.campo.' + k, v));
  C.aviso = a => L.update(s => { (s.avisos ||= []).unshift(Object.assign({ id: 'e' + Date.now(), cuando: 'recién' }, a)); });
  C.EST = { porarmar: 'Por armar', armado: 'Armando', ensayo: 'En ensayo', frenado: 'Frenado', listo: 'Listo para entregar', entregado: 'Entregado' };
  C.EST_ST = { porarmar: 'gr', armado: 'pr', ensayo: 'sk', frenado: 'er', listo: 'ok', entregado: 'ok' };
  C.EST_IC = { porarmar: 'clock', armado: 'hammer', ensayo: 'gauge', frenado: 'octagon-pause', listo: 'circle-check', entregado: 'truck' };
  C.OST = { SENT: 'En espera', CONFIRMED: 'Confirmado', REJECTED: 'Rechazado', EXPIRED: 'Vencido' };

  C.lin = id => (L.get('lineas') || B.lineas).find(l => l.id === id) || B.lineas.find(l => l.id === id);
  C.prov = id => B.proveedores.find(p => p.id === id);
  C.user = id => B.usuarios[id];
  C.tableros = () => (L.get('tableros') || B.tableros).map((t, i) => Object.assign({ i }, K.taller[t.id] || {}, t));
  C.tab = id => C.tableros().find(t => t.id === id);
  C.setTab = (id, patch) => L.update(s => { const t = s.tableros.find(x => x.id === id); Object.assign(t, patch); });
  C.porArmar = () => (L.get('planos') || B.planos).filter(p => !C.tableros().some(t => t.plano === p.id)).map(p => ({
    id: 'pl-' + p.id, cod: p.cod, n: p.n, plano: p.id, estado: 'porarmar', avance: 0, planoStatus: p.status,
    motivo: { ERROR: 'El plano no se pudo procesar: no hay BOM todavía.', PROCESSING: 'El plano se está procesando.', PENDING: 'El plano está en cola.', STALE: 'El BOM está desactualizado.' }[p.status] || 'Esperando el BOM aprobado.',
  }));

  // ---------- Compras: de qué OC sale cada línea ----------
  C.ped = () => (L.get('pedidos') || B.pedidos).find(p => p.proyecto === 'p1');
  C.adj = () => {
    const a = Object.assign({}, K.adjudicacion); const c = L.get('compra.adjudicadas') || {};
    const ped = C.ped();
    Object.entries(c).forEach(([l, p]) => { if (ped && ped.ordenes.some(o => o.prov === p)) a[l] = p; });
    return a;
  };
  C.oc = lineaId => {
    const ped = C.ped(); const prov = C.adj()[lineaId]; if (!ped || !prov) return null;
    const o = ped.ordenes.find(x => x.prov === prov); if (!o) return null;
    const of = (B.ofertas[lineaId] || {})[prov] || {};
    let eta = null;
    if (o.status === 'CONFIRMED') { const d = new Date((o.respondido || B.HOY) + 'T12:00:00'); d.setDate(d.getDate() + (of.plazo || 3)); eta = d.toISOString().slice(0, 10); }
    return { id: o.id, prov, provN: C.prov(prov).n, status: o.status, eta, codigo: of.codigo, precio: of.precio, plazo: of.plazo, vence: o.vence };
  };
  C.recs = () => L.get('recepciones') || K.recepciones;
  C.recibido = lineaId => C.recs().filter(r => r.proyecto === 'p1').reduce((a, r) => a + r.lineas.filter(x => x.linea === lineaId).reduce((b, x) => b + (x.recibido || 0), 0), 0);

  // ---------- Composición de cada tablero ----------
  const MOD = { l01: 2, l02: 4, l03: 2, l04: 4, l05: 10, l06: 14, l07: 3, l08: 3, l09: 6, l10: 4, l11: 5, l12: 3, l13: 2, l14: 2, l15: 1 };
  const ALTO = { l05: 230, l06: 260, l15: 70 };
  function expandir(ref, cant) {
    const m = /^([A-Z]+)(\d+)–[A-Z]+(\d+)$/.exec(ref || '');
    if (m && +m[3] - +m[2] + 1 === cant) return Array.from({ length: cant }, (_, k) => m[1] + (+m[2] + k));
    if (cant > 12 || cant === 1) return [ref];
    return Array.from({ length: cant }, (_, k) => ref + '·' + (k + 1));
  }
  C.items = tabId => {
    if (tabId === 'tgbt') return B.tgbt.filas.flatMap((f, fi) => f.items.map(it => Object.assign({ fila: f.n, fi }, it)));
    return (K.composicion[tabId] || []).map(it => Object.assign({ fila: null, fi: null, mod: MOD[it.linea] }, it));
  };
  C.filas = tabId => {
    if (tabId === 'tgbt') return B.tgbt.filas;
    const its = (K.composicion[tabId] || []).filter(it => MOD[it.linea]);
    const filas = []; let cur = null;
    its.forEach(it => {
      const u = MOD[it.linea]; const n = Math.min(it.cant, 12);
      if (!cur || cur.w + u * n > 36) { cur = { n: 'Fila ' + (filas.length + 1), items: [], w: 0 }; filas.push(cur); }
      cur.items.push(Object.assign({ mod: u }, it, { cant: n })); cur.w += u * n;
    });
    return filas;
  };
  C.aparatos = tabId => C.filas(tabId).flatMap(f => f.items.flatMap(it => expandir(it.ref, it.cant > 12 ? 1 : it.cant).map(r => ({ ref: r, linea: it.linea, fila: f.n, grupo: it.ref, mod: it.cant > 12 ? it.mod * it.cant : it.mod }))));

  C.montado = (tabId, ref) => !!(C.x('montado.' + tabId) || SEED_MONT[tabId] || {})[ref];
  const SEED_MONT = {
    tgbt: { Q9: 1, Q10: 1, Q11: 1, Q12: 1, Q13: 1, Q14: 1, H1: 1, H2: 1, H3: 1, X1: 1 },
    tsgpb: Object.fromEntries(['Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12', 'ID1', 'ID2', 'ID3', 'ID4', 'ID5', 'ID6', 'ID7', 'ID8', 'H1', 'H2', 'H3'].map(r => [r, 1])),
    tspiso: Object.fromEntries(['Q0A·1', 'Q0A·2', 'Q1', 'Q2', 'Q3', 'Q4', 'Q5', 'Q6', 'Q7', 'Q8', 'Q9', 'Q10', 'Q11', 'Q12'].map(r => [r, 1])),
    tsbombas: {},
  };
  C.toggleMontado = (tabId, ref) => {
    const cur = Object.assign({}, C.x('montado.' + tabId) || SEED_MONT[tabId] || {});
    if (cur[ref]) delete cur[ref]; else cur[ref] = 1;
    C.x('montado.' + tabId, cur);
    return !!cur[ref];
  };

  // Estado del material de una línea para un tablero
  C.mat = (tabId, lineaId, ref, need) => {
    if (ref && C.montado(tabId, ref)) return { k: 'ok', t: 'Montado', i: 'circle-check' };
    const st = K.stock[lineaId];
    if (st && st.usa[tabId] && need && st.usa[tabId] < need) {
      const oc = C.oc(lineaId); const rec = C.recibido(lineaId);
      if (rec > 0) return { k: 'st', t: 'Stock + recibido', i: 'package-check' };
      return { k: 'wa', t: 'Stock para ' + L.num(st.usa[tabId]) + ' de ' + L.num(need) + ' · resto ' + (oc ? (oc.status === 'CONFIRMED' ? 'llega ' + L.fechaCorta(oc.eta) : 'en ' + oc.id + ' sin confirmar') : 'sin OC'), i: 'package-open', oc };
    }
    if (st && st.usa[tabId]) return { k: 'st', t: 'En el taller (stock)', i: 'package-check' };
    const so = K.sinOC[lineaId];
    if (so && so.recibido) return { k: 'st', t: 'Recibido (OC manual)', i: 'package-check' };
    const rec = C.recibido(lineaId);
    if (rec > 0) return { k: 'st', t: 'Recibido · ' + L.num(rec) + ' ' + (C.lin(lineaId).u || 'u'), i: 'package-check' };
    if (so) return { k: 'er', t: so.t, i: 'octagon-pause', d: so.d, href: so.href, quien: so.quien };
    const oc = C.oc(lineaId);
    if (!oc) return { k: 'er', t: 'Sin OC', i: 'octagon-pause' };
    if (oc.status === 'CONFIRMED') return { k: 'wa', t: 'En camino · llega ' + L.fechaCorta(oc.eta), i: 'truck', oc };
    if (oc.status === 'SENT') return { k: 'wa', t: 'OC sin confirmar', i: 'clock', oc };
    return { k: 'er', t: 'OC ' + C.OST[oc.status].toLowerCase(), i: 'circle-alert', oc };
  };
  C.refs = expandir;
  C.matItem = (tabId, it) => {
    const rs = expandir(it.ref, it.cant > 12 ? 1 : it.cant);
    if (MOD[it.linea] && rs.every(r => C.montado(tabId, r))) return { k: 'ok', t: 'Montado', i: 'circle-check' };
    return C.mat(tabId, it.linea, null, it.cant * (it.x || 1));
  };
  C.resumenMat = tabId => {
    const its = C.items(tabId).filter(it => MOD[it.linea] || it.linea === 'l16');
    const r = { ok: 0, st: 0, wa: 0, er: 0, total: its.length, faltan: [] };
    its.forEach(it => { const m = C.matItem(tabId, it); r[m.k]++; if (m.k === 'er') r.faltan.push(Object.assign({ it }, m)); });
    return r;
  };

  // ---------- Frente 2D (SVG) ----------
  C.frente = (tabId, { sel = null, compact = false } = {}) => {
    const filas = C.filas(tabId); const W = 800; let y = 56; const parts = [];
    filas.forEach(f => {
      const units = f.items.flatMap(it => expandir(it.ref, it.cant > 12 ? 1 : it.cant).map(r => ({ r, it, w: (it.cant > 12 ? it.mod * it.cant : it.mod) * 18 })));
      const h = Math.max(...f.items.map(it => ALTO[it.linea] || 120));
      const tot = units.reduce((a, u) => a + u.w, 0) + (units.length - 1) * 2;
      let x = (W - tot) / 2;
      parts.push(`<text class="fila-t" x="60" y="${y}">${L.esc(f.n)}</text>`);
      y += 14;
      parts.push(`<rect class="riel" x="56" y="${y + h / 2 - 9}" width="${W - 112}" height="18" rx="2"/>`);
      units.forEach(u => {
        const m = C.mat(tabId, u.it.linea, u.r); const l = C.lin(u.it.linea);
        const lab = u.w >= 34 || u.r.length <= 2 ? u.r.replace('·', '.') : '';
        parts.push(`<g class="ap ${m.k} ${sel === u.r ? 'sel' : ''}" tabindex="0" role="button" data-ref="${L.esc(u.r)}" data-linea="${u.it.linea}" aria-label="${L.esc(u.r + ' · ' + l.mat + ' ' + l.spec + ' · ' + m.t)}">
          <rect class="c" x="${x}" y="${y}" width="${u.w}" height="${h}"/>
          ${u.it.cant > 12 ? Array.from({ length: Math.floor(u.w / 18) }, (_, k) => `<rect class="k" x="${x + k * 18 + 5}" y="${y + 12}" width="8" height="${h - 34}" rx="1"/>`).join('') : `<rect class="k" x="${x + u.w / 2 - Math.min(10, u.w / 4)}" y="${y + h * 0.28}" width="${Math.min(20, u.w / 2)}" height="${h * 0.3}" rx="2"/>`}
          ${lab ? `<text class="r" x="${x + u.w / 2}" y="${y + h - 12}">${L.esc(lab)}</text>` : ''}
        </g>`);
        x += u.w + 2;
      });
      y += h + 46;
    });
    const H = y + (compact ? 10 : 70);
    return `<svg class="cp-frente" viewBox="0 0 ${W} ${H}" role="group" aria-label="Frente del tablero ${L.esc(tabId.toUpperCase())}">
      <rect class="gab" x="3" y="3" width="${W - 6}" height="${H - 6}" rx="10"/>
      <rect class="placa" x="40" y="24" width="${W - 80}" height="${H - 48}" rx="6"/>
      ${parts.join('')}
    </svg>`;
  };
  C.leyenda = () => `<div class="cp-ley"><span><i class="ok"></i>Montado</span><span><i class="st"></i>En el taller</span><span><i class="wa"></i>En camino</span><span><i class="er"></i>Sin OC · frena</span></div>`;

  // Ficha de un aparato (panel lateral en escritorio, hoja en teléfono)
  C.ficha = (tabId, ref) => {
    const ap = C.aparatos(tabId).find(a => a.ref === ref); if (!ap) return '';
    const l = C.lin(ap.linea); const m = C.mat(tabId, ap.linea, ref); const oc = C.oc(ap.linea); const t = C.tab(tabId);
    const so = K.sinOC[ap.linea];
    return `<div class="cp-ficha">
      <div class="row"><div class="card-ico">${L.icon('cpu')}</div><div class="grow"><span class="lbl">${L.esc(t.cod)} · ${L.esc(ap.fila)}</span><h2 class="mono" style="font-size:20px">${L.esc(ref.replace('·', '.'))}</h2></div><button class="btn icon sm ghost" data-x aria-label="Cerrar">${L.icon('x')}</button></div>
      <div class="bom"><span class="mat">${L.esc(l.mat)}</span><span class="spec">${L.esc(l.spec)}${l.marca ? ' · ' + L.esc(l.marca) : ''}${l.gama ? ' ' + L.esc(l.gama) : ''}</span></div>
      <span class="cp-mst ${m.k}">${L.icon(m.i)}${L.esc(m.t)}</span>
      ${m.d ? `<div class="note ${m.k === 'er' ? 'bad' : 'warn'}">${L.icon('octagon-pause')}<div><b>Frena el armado</b>${L.esc(m.d)}${m.quien ? ` Lo resuelve: ${L.esc(m.quien)}.` : ''}</div></div>` : ''}
      <dl class="cp-kv">
        <dt>Línea del BOM</dt><dd class="mono"><a class="src" href="${L.href('d-bom-editor.html?linea=' + ap.linea)}">${L.icon('table-2')}${ap.linea}</a></dd>
        <dt>Código del distribuidor</dt><dd class="mono">${oc && oc.codigo ? L.esc(oc.codigo) : '—'}</dd>
        <dt>OC</dt><dd class="mono">${oc ? `${L.esc(oc.id)} <span class="ost ${oc.status}">${C.OST[oc.status]}</span>` : (so && so.recibido ? 'OC manual · Genrod' : 'sin OC')}</dd>
        <dt>Distribuidor</dt><dd>${oc ? L.esc(oc.provN) : '—'}</dd>
        <dt>Garantía</dt><dd>12 meses desde la entrega a obra</dd>
        <dt>Serie del tablero</dt><dd class="mono">${L.esc(t.serie || '—')}</dd>
      </dl>
      <div class="col gap8">
        <button class="btn ${C.montado(tabId, ref) ? 'out' : 'pri'} block" data-montar="${L.esc(ref)}">${L.icon(C.montado(tabId, ref) ? 'undo-2' : 'circle-check')}${C.montado(tabId, ref) ? 'Desmarcar montado' : 'Marcar montado'}</button>
        <div class="row gap8"><a class="btn out grow" href="${L.href('d-bom-editor.html?linea=' + ap.linea)}">${L.icon('table-2')}Ver en el BOM</a><button class="btn out grow" data-reportar="${L.esc(ref)}">${L.icon('flag')}Reportar</button></div>
      </div>
    </div>`;
  };
  // Conecta los eventos de la ficha (montar / reportar) dentro de un panel
  C.fichaEventos = (ov, tabId, onChange) => {
    ov.addEventListener('click', e => {
      const b = e.target.closest('[data-montar]');
      if (b) { const on = C.toggleMontado(tabId, b.dataset.montar); L.toast(on ? b.dataset.montar.replace('·', '.') + ' montado' : 'Marcado como no montado', { type: on ? 'success' : 'info' }); ov.remove(); onChange && onChange(); }
      const r = e.target.closest('[data-reportar]');
      if (r) {
        const ref = r.dataset.reportar; ov.remove();
        L.dialog({ title: 'Reportar un problema con ' + ref.replace('·', '.'), icon: 'flag', body: `<div class="field"><label for="rp-t">Qué pasa</label><select class="inp" id="rp-t"><option>Llegó dañado</option><option>No es el aparato del BOM</option><option>Falta</option><option>Otro</option></select></div><div class="field"><label for="rp-d">Detalle</label><textarea class="inp" id="rp-d">La caja vino golpeada y la manija no traba.</textarea></div>`,
          actions: [{ t: 'Cancelar', cls: 'out' }, { t: 'Avisar a compras', icon: 'send', fn: dl => { C.aviso({ t: ref.replace('·', '.') + ' de ' + C.tab(tabId).cod + ': ' + dl.querySelector('#rp-t').value.toLowerCase(), d: dl.querySelector('#rp-d').value, i: 'flag', tipo: 'wa', href: 'd-tal-taller.html?tablero=' + tabId }); L.toast('Aviso enviado a compras', { desc: 'Sofía Benítez lo ve en Avisos' }); } }] });
      }
    });
  };

  // ---------- QR (patrón ilustrativo, no codifica la URL) ----------
  C.qr = (txt, px = 92) => {
    const n = 25; let h = 2166136261; for (const ch of txt) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); }
    const rnd = () => { h ^= h << 13; h ^= h >>> 17; h ^= h << 5; return (h >>> 0) / 4294967296; };
    const cells = []; const fin = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
    for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!fin(x, y) && rnd() > 0.52) cells.push(`<rect x="${x}" y="${y}" width="1" height="1"/>`);
    const eye = (x, y) => `<rect x="${x}" y="${y}" width="7" height="7"/><rect x="${x + 1}" y="${y + 1}" width="5" height="5" style="fill:var(--card)"/><rect x="${x + 2}" y="${y + 2}" width="3" height="3"/>`;
    return `<svg class="cp-qr" width="${px}" height="${px}" viewBox="-1 -1 ${n + 2} ${n + 2}" role="img" aria-label="Código QR del tablero"><rect x="-1" y="-1" width="${n + 2}" height="${n + 2}" style="fill:var(--card)"/>${eye(0, 0)}${eye(n - 7, 0)}${eye(0, n - 7)}${cells.join('')}</svg>`;
  };

  // ---------- Estados genéricos por query param ----------
  C.cargando = (el, filas = 3) => { el.innerHTML = `<div class="kpis">${'<div class="kpi"><div class="skel" style="height:22px;width:60%"></div><div class="skel" style="height:12px;width:80%;margin-top:8px"></div></div>'.repeat(4)}</div>` + Array.from({ length: filas }, () => '<div class="skel" style="height:180px"></div>').join(''); };
  C.error = (el, t, d, href) => { el.innerHTML = `<div class="card"><div class="empty"><div class="e-ico" style="color:var(--rose-600)">${L.icon('circle-alert')}</div><h3>${L.esc(t)}</h3><p>${L.esc(d)}</p><div class="row gap8" style="justify-content:center"><a class="btn out" href="${L.href(href || 'd-pla-inicio.html')}">${L.icon('arrow-left')}Volver</a><button class="btn pri" onclick="L.param('estado','')">${L.icon('refresh-cw')}Reintentar</button></div></div></div>`; };
  C.vacio = (el, ic, t, d, btn) => { el.innerHTML = `<div class="card"><div class="empty"><div class="e-ico">${L.icon(ic)}</div><h3>${L.esc(t)}</h3><p>${d}</p>${btn || ''}</div></div>`; };

  C.dias = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
  C.avs = ids => `<span class="cp-avs">${(ids || []).map(k => { const a = K.armadores[k]; return `<span class="av xs ${a.c}" title="${L.esc(a.n)}">${L.esc(a.ini)}</span>`; }).join('')}</span>`;

  window.CP = C;
})();
