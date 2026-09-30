/* ==== T3D-ENGINE:BEGIN · modelo y motor. Lo usan d-tablero-3d.html y m-tablero-3d.html (dueño: área tablero3d). ==== */
const T3D = (() => {
  'use strict';
  const MOD = 18; /* ancho de un módulo DIN, mm */
  const DISCLAIMER = 'Modelo conceptual: disposición aproximada derivada del BOM, no un plano de montaje ni un cálculo de gabinete.';
  const FAMILIES = ['Protección', 'Maniobra', 'Medición', 'Señalización', 'Conexionado', 'Envolvente', 'Otros'];
  const FAM_COLOR = { 'Protección': '#4c7bf0', 'Maniobra': '#d0587e', 'Medición': '#5fb847', 'Señalización': '#e0604f', 'Conexionado': '#9aa3b5', 'Envolvente': '#c7cbc6', 'Otros': '#b9b2a0' };
  const LAMP = { Rojo: '#e5483a', Verde: '#37c26b', Amarillo: '#f2c94c' };
  const RAIL_ORDER = ['sec', 'dps', 'itm4', 'dif', 'itm', 'gm', 'cont'];
  const DEFAULT_ENC = { H: 800, W: 600 };
  const polesMod = p => ({ '1P': 1, '1P+N': 2, '2P': 2, '3P': 3, '4P': 4 }[p] || 2);
  const q = v => (v == null || v === '') ? '¿?' : v;
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const mix = (a, b, t) => { const p = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)); const x = p(a), y = p(b); return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); };

  /* Medidas aproximadas por tipo (mm). Aparatos modulares: ancho = módulos (por polos) × 18 mm. */
  function size(l) {
    const a = l.attrs || {};
    switch (l.typeId) {
      case 'mccb': return +a.in >= 400 ? { zone: 'big', w: a.polos === '3P' ? 140 : 185, h: 255, d: 110 } : { zone: 'big', w: a.polos === '3P' ? 105 : 140, h: 161, d: 86 };
      case 'sec': return +a.in > 125 ? { zone: 'big', w: 185, h: 240, d: 120 } : { zone: 'rail', mod: 4, h: 85, d: 70 };
      case 'itm': return { zone: 'rail', mod: polesMod(a.polos), h: 85, d: 70 };
      case 'dif': return { zone: 'rail', mod: a.polos === '4P' ? 4 : 2, h: 85, d: 72 };
      case 'dps': return { zone: 'rail', mod: a.polos === '4P' ? 4 : 2, h: 90, d: 72 };
      case 'gm': return { zone: 'rail', w: 45, h: 90, d: 80 };
      case 'cont': return +a.in >= 25 ? { zone: 'rail', w: 54, h: 85, d: 92 } : { zone: 'rail', w: 45, h: 75, d: 80 };
      case 'multi': return { zone: 'door', w: 96, h: 96, d: 14 };
      case 'piloto': return { zone: 'door', w: 22, h: 22, d: 16 };
      case 'borne': return { zone: 'bornes', w: { 4: 6.2, 10: 8.2, 35: 16 }[a.seccion] || 6.2, h: 45, d: 42 };
      default: return { zone: 'rail', mod: 2, h: 85, d: 70 };
    }
  }
  /* Rótulo corto (como se marca en un tablero). «¿?» = atributo que falta en el BOM. */
  function short(l) {
    const a = l.attrs || {};
    switch (l.typeId) {
      case 'itm': return q(a.curva) + q(a.in) + ' ' + q(a.polos);
      case 'dif': return 'ID ' + q(a.polos) + ' ' + q(a.in) + ' A ' + q(a.sens) + ' mA';
      case 'dps': return 'DPS ' + q(a.polos) + ' ' + q(a.imax) + ' kA';
      case 'cont': return 'KM ' + q(a.polos) + ' ' + q(a.in) + ' A';
      case 'gm': return 'GM ' + q(a.rango);
      case 'mccb': return 'CM ' + q(a.polos) + ' ' + q(a.in) + ' A ' + q(a.icu) + ' kA';
      case 'sec': return 'SEC ' + q(a.polos) + ' ' + q(a.in) + ' A';
      case 'multi': return 'Multimedidor';
      case 'piloto': return 'H ' + String(q(a.color)).toLowerCase() + ' ' + q(a.tension);
      case 'borne': return 'Bornes ' + q(a.seccion) + ' mm²';
      case 'gab': return 'Gabinete ' + q(a.medida) + ' ' + q(a.ip);
      default: { const t = L.type(l.typeId); return t ? t.short : 'Material'; }
    }
  }
  const familyOf = l => (l.typeId && L.type(l.typeId) && L.type(l.typeId).family) || 'Otros';
  const railKey = l => l.typeId === 'itm' && polesMod((l.attrs || {}).polos) >= 3 ? 'itm4' : l.typeId;
  const zoneLabel = it => it.zone === 'door' ? 'Puerta' : it.zone === 'big' ? 'Placa, fila superior' : (it.zone === 'bornes' ? 'Bornera' : 'Riel ' + (it.rail + 1));

  function enclosureFor(planId, lines) {
    const g = lines.find(l => l.typeId === 'gab');
    let H = DEFAULT_ENC.H, W = DEFAULT_ENC.W, isDefault = true;
    if (g && g.attrs && g.attrs.medida) { const [h, w] = String(g.attrs.medida).split(/[×x]/).map(Number); if (h > 0 && w > 0) { H = h; W = w; isDefault = false; } }
    return { W, H, D: H >= 1800 ? 400 : H >= 1200 ? 300 : 250, lineId: g ? g.id : null, isDefault, ip: g && g.attrs ? g.attrs.ip : null };
  }

  /* Disposición en mm; origen en el centro del gabinete, x a la derecha, y hacia arriba.
     Cantidad por línea = símbolos dibujados en ESTE plano (perPlan), o sea un tablero; las repeticiones no se dibujan. */
  function layout(planId) {
    const plan = L.plan(planId);
    const lines = plan ? L.linesOf(plan.projectId).filter(l => ((l.perPlan || {})[planId] || 0) > 0) : [];
    const enc = enclosureFor(planId, lines);
    const plate = { w: enc.W - 80, h: enc.H - 80 };
    const x0 = -plate.w / 2 + 30, U = plate.w - 60;
    const bomIdx = id => lines.findIndex(x => x.id === id);
    const items = [], rails = [], segs = [];
    const drawn = lines.filter(l => l.typeId !== 'gab' && L.type(l.typeId));
    const expand = ls => ls.flatMap(l => { const s = size(l); const w = s.w || s.mod * MOD; return Array.from({ length: l.perPlan[planId] }, (_, k) => ({ lineId: l.id, typeId: l.typeId, family: familyOf(l), zone: s.zone, w, h: s.h, d: s.d, mod: s.mod || null, k })); });
    /* Puerta: franja superior maciza con multimedidor y ojos de buey; debajo, visor */
    const door = expand(drawn.filter(l => size(l).zone === 'door'));
    const multis = door.filter(i => i.typeId === 'multi'), lamps = door.filter(i => i.typeId !== 'multi');
    const perRow = Math.max(1, Math.floor((enc.W - 160) / 44)); const lampRows = Math.ceil(lamps.length / perRow);
    let dy = enc.H / 2 - 45 - 30;
    if (multis.length) { multis.forEach((m, i) => { m.x = (i - (multis.length - 1) / 2) * 130; m.y = dy - 48; }); dy -= 96 + 34; }
    lamps.forEach((p, i) => { const r = Math.floor(i / perRow), c = i % perRow, n = Math.min(perRow, lamps.length - r * perRow); p.x = (c - (n - 1) / 2) * 44; p.y = dy - 11 - r * 44; });
    if (lamps.length) dy -= lampRows * 44 + 10;
    const band = door.length ? (enc.H / 2 - dy) + 12 : 0;
    items.push(...door);
    /* Placa: fila superior (caja moldeada, seccionador grande), rieles DIN, bornera abajo */
    let y = Math.min(plate.h / 2 - 30, enc.H / 2 - band - 26);
    const rowsOf = (list, groupGap) => { const rows = []; let row = [], used = 0, prev = null; list.forEach(it => { const g = row.length && prev !== it.lineId ? groupGap : 0; if (row.length && used + g + it.w > U) { rows.push(row); row = []; used = 0; } const gg = row.length && prev !== it.lineId ? groupGap : 0; it.x = x0 + used + gg + it.w / 2; used += gg + it.w; row.push(it); prev = it.lineId; }); if (row.length) rows.push(row); return rows; };
    const segOf = row => row.forEach(it => { const s = segs[segs.length - 1]; if (s && s.lineId === it.lineId && s.row === row) { s.x1 = it.x + it.w / 2; s.count++; s.top = Math.max(s.top, it.y + it.h / 2); } else segs.push({ lineId: it.lineId, row, zone: it.zone, x0: it.x - it.w / 2, x1: it.x + it.w / 2, top: it.y + it.h / 2, d: it.d, count: 1, rail: it.rail }); });
    const big = expand(drawn.filter(l => size(l).zone === 'big').sort((a, b) => (a.typeId === 'sec' ? 0 : 1) - (b.typeId === 'sec' ? 0 : 1) || bomIdx(a.id) - bomIdx(b.id)));
    rowsOf(big, 50).forEach(row => { const h = Math.max(...row.map(i => i.h)); const tw = row[row.length - 1].x + row[row.length - 1].w / 2 - x0; row.forEach(i => { i.y = y - 26 - h / 2; i.x += (U - tw) / 2; }); segOf(row); y -= h + 26 + 36; items.push(...row); });
    const ordered = drawn.filter(l => size(l).zone === 'rail').sort((a, b) => (RAIL_ORDER.indexOf(railKey(a)) + 1 || 99) - (RAIL_ORDER.indexOf(railKey(b)) + 1 || 99) || bomIdx(a.id) - bomIdx(b.id));
    const dinRows = rowsOf(expand(ordered), 9);
    const bornRows = rowsOf(expand(drawn.filter(l => l.typeId === 'borne')), 5);
    const bottom = -plate.h / 2 + 20 + bornRows.length * 110;
    const pitch = dinRows.length ? Math.max(150, Math.min(230, (y - bottom) / dinRows.length)) : 0;
    dinRows.forEach((row, r) => { const cy = y - 26 - pitch / 2 + 20; rails.push({ y: cy, w: U + 30, kind: 'din' }); row.forEach(i => { i.y = cy; i.rail = rails.length - 1; }); segOf(row); y -= pitch; items.push(...row); });
    bornRows.forEach((row, r) => { const cy = -plate.h / 2 + 50 + (bornRows.length - 1 - r) * 110; rails.push({ y: cy, w: U + 30, kind: 'bornes' }); row.forEach(i => { i.y = cy; i.rail = rails.length - 1; }); segOf(row); items.push(...row); });
    const lowest = Math.min(...items.filter(i => i.zone !== 'door').map(i => i.y - i.h / 2), plate.h / 2);
    const dinCap = Math.floor(U / MOD), dinUsed = dinRows.reduce((a, r) => a + r.reduce((b, i) => b + i.w, 0), 0) / MOD;
    segs.forEach(s => { delete s.row; });
    return { planId, plan, lines, drawn, skipped: lines.filter(l => l.typeId !== 'gab' && !L.type(l.typeId)), enc, plate, band, rails, items, segs,
      overflow: lowest < -plate.h / 2 || (dinRows.length && y - 26 < bottom - 10), dinRails: dinRows.length, dinCap, dinUsed: Math.round(dinUsed) };
  }

  /* Filas por línea para la lista, la tabla y el CSV. */
  function summary(model) {
    return model.lines.map(l => {
      const its = model.items.filter(i => i.lineId === l.id); const f = its[0];
      const where = l.typeId === 'gab' ? 'Envolvente (el gabinete)' : its.length ? [...new Set(its.map(zoneLabel))].join(' · ') : 'No se dibuja (sin componente base)';
      return { line: l, family: familyOf(l), count: l.perPlan[model.planId], where, mod: f && f.mod, w: f ? f.w : (l.typeId === 'gab' ? model.enc.W : null), h: f ? f.h : (l.typeId === 'gab' ? model.enc.H : null) };
    }).sort((a, b) => FAMILIES.indexOf(a.family) - FAMILIES.indexOf(b.family));
  }
  function refRange(l) { const ms = L.matches(l); if (!ms.length) return null; const p = ms.map(m => m.price); return { min: Math.min(...p), max: Math.max(...p), n: ms.length, suppliers: new Set(ms.map(m => m.supplierId)).size, stale: ms.some(L.isStale) }; }
  function csv(model) {
    const mult = model.plan.multiplier || 1;
    const rows = [['Tablero', 'Línea', 'Familia', 'Material', 'Marca', 'Cantidad dibujada (1 tablero)', 'Repeticiones', 'Cantidad a comprar por este tablero', 'Ubicación estimada', 'Módulos DIN', 'Ancho estimado (mm)', 'Alto estimado (mm)', 'Procedencia', 'Precio de referencia mín. (ARS)', 'Precio de referencia máx. (ARS)']];
    summary(model).forEach(r => { const rr = refRange(r.line); rows.push([model.plan.name, r.line.id, r.family, L.lineLabel(r.line), L.brandLabel(r.line.brand), r.count, mult, r.count * mult, r.where, r.mod || '', r.w == null ? '' : Math.round(r.w * 10) / 10, r.h == null ? '' : r.h,
      { DETECTOR: 'detectado', RULE: 'inferido', MANUAL: 'manual' }[r.line.src] || r.line.src, rr ? rr.min : '', rr ? rr.max : '']); });
    rows.push([]); rows.push([DISCLAIMER]);
    rows.push(['Gabinete: ' + (model.enc.isDefault ? 'medida por defecto ' + model.enc.H + '×' + model.enc.W + ' mm (el BOM no tiene gabinete para este tablero)' : model.enc.H + '×' + model.enc.W + ' mm, de la línea del BOM') + '; profundidad ' + model.enc.D + ' mm supuesta.']);
    rows.push(['Precios de referencia de catálogo: no son ofertas confirmadas.']);
    return L.csv(rows);
  }
  /* Firma de lo que cambia el dibujo: si no cambia, no se reconstruye. */
  const signature = model => JSON.stringify([model.planId, model.plan && model.plan.multiplier, model.lines.map(l => [l.id, l.typeId, l.attrs, l.perPlan[model.planId], l.brand, l.src])]);

  /* Vista 2D: interior de frente (puerta abierta) y la puerta al lado. Colores con texto oscuro para contraste AA. */
  function svg(model, st) {
    const { enc, plate } = model; const W = enc.W, H = enc.H; const sel = st.sel, iso = st.iso;
    const doorX = W + 90; const vb = [-W / 2 - 30, -H / 2 - 70, W * 2 + 150, H + 100];
    const fs = Math.max(11, H / 60); const Y = v => -v;
    let s = `<svg class="t3-svg" xmlns="http://www.w3.org/2000/svg" viewBox="${vb.join(' ')}" width="${vb[2]}" height="${vb[3]}" role="img" aria-label="Vista frontal 2D del tablero ${L.esc(model.plan.name)}: ${model.items.length} aparatos en ${model.rails.length} rieles. La tabla lista los mismos datos." font-family="IBM Plex Sans, system-ui, sans-serif">`;
    s += `<rect x="${vb[0]}" y="${vb[1]}" width="${vb[2]}" height="${vb[3]}" fill="#ffffff"/>`;
    const encOn = enc.lineId && sel === enc.lineId;
    s += `<g ${enc.lineId ? `data-line="${enc.lineId}" class="t3-hit"` : ''}><rect x="${-W / 2}" y="${-H / 2}" width="${W}" height="${H}" rx="8" fill="#e4e6e1" stroke="${encOn ? '#f2b705' : '#6b7486'}" stroke-width="${encOn ? 8 : 3}"/><rect x="${doorX - W / 2}" y="${-H / 2}" width="${W}" height="${H}" rx="8" fill="#e4e6e1" stroke="${encOn ? '#f2b705' : '#6b7486'}" stroke-width="${encOn ? 8 : 3}"/></g>`;
    s += `<rect x="${-plate.w / 2}" y="${-plate.h / 2}" width="${plate.w}" height="${plate.h}" fill="#c9ccd0" stroke="#9aa1ab"/>`;
    if (model.band) s += `<rect x="${doorX - W / 2 + 45}" y="${H / 2 - 45 - (H - 90)}" width="${W - 90}" height="${H - 90 - model.band + 45}" fill="#dbe7f3" stroke="#9aa1ab" stroke-dasharray="6 4"/><text x="${doorX}" y="${Y(-H / 2 + 45 + (H - 90 - model.band + 45) / 2)}" font-size="${fs}" fill="#3b4658" text-anchor="middle">visor</text>`;
    s += `<text x="0" y="${-H / 2 - 24}" font-size="${fs * 1.2}" font-weight="600" fill="#111a2b" text-anchor="middle">Interior (puerta abierta)</text><text x="${doorX}" y="${-H / 2 - 24}" font-size="${fs * 1.2}" font-weight="600" fill="#111a2b" text-anchor="middle">Puerta (frente)</text>`;
    model.rails.forEach(r => { s += `<rect x="${-r.w / 2}" y="${Y(r.y) - 17.5}" width="${r.w}" height="35" fill="#eef0f2" stroke="#9aa1ab"/>`; });
    const dev = (it, ox) => {
      const on = it.lineId === sel, ghost = iso && it.family !== iso && !on; const fc = FAM_COLOR[it.family] || FAM_COLOR.Otros; const l = L.line(it.lineId);
      const stroke = on ? '#f2b705' : mix(fc, '#111a2b', .45), sw = on ? 5 : 1.4;
      const shape = it.typeId === 'piloto' ? `<circle cx="${ox + it.x}" cy="${Y(it.y)}" r="${it.w / 2 + 4}" fill="${LAMP[l.attrs.color] || '#e5483a'}" stroke="${stroke}" stroke-width="${sw}"/>`
        : `<rect x="${ox + it.x - it.w / 2 + .7}" y="${Y(it.y) - it.h / 2}" width="${it.w - 1.4}" height="${it.h}" rx="2" fill="${mix(fc, '#ffffff', .55)}" stroke="${stroke}" stroke-width="${sw}"/>`;
      return `<g class="t3-hit" data-line="${it.lineId}" opacity="${ghost ? .18 : 1}"><title>${L.esc(L.lineLabel(l))} · ${it.k + 1} de ${l.perPlan[model.planId]} · ${L.esc(zoneLabel(it))}</title>${shape}</g>`;
    };
    model.items.forEach(it => { s += dev(it, it.zone === 'door' ? doorX : 0); });
    model.segs.forEach(sg => { const l = L.line(sg.lineId); const w = sg.x1 - sg.x0; const ox = sg.zone === 'door' ? doorX : 0; const ghost = iso && familyOf(l) !== iso && sg.lineId !== sel;
      const t = short(l) + (sg.count > 1 ? ' ×' + sg.count : ''); const f = Math.min(fs, w / Math.max(4, t.length * .56));
      s += `<text x="${ox + (sg.x0 + sg.x1) / 2}" y="${Y(sg.top) - 6}" font-size="${f}" fill="#111a2b" text-anchor="middle" opacity="${ghost ? .25 : 1}">${L.esc(t)}</text>`; });
    return s + '</svg>';
  }

  /* ─── Motor 3D (three r161, cámara orbital propia) ─── */
  function webglOk() { try { const c = document.createElement('canvas'); const gl = c.getContext('webgl2') || c.getContext('webgl'); const ok = !!gl; if (gl && gl.getExtension('WEBGL_lose_context')) gl.getExtension('WEBGL_lose_context').loseContext(); return ok; } catch (e) { return false; } }

  function Viewer(host, opts) {
    opts = opts || {};
    const THREE = window.THREE; if (!THREE || !webglOk()) return null;
    const canvas = document.createElement('canvas'); canvas.className = 't3-canvas'; canvas.tabIndex = 0;
    canvas.setAttribute('role', 'application'); canvas.setAttribute('aria-roledescription', 'visor 3D');
    canvas.setAttribute('aria-label', 'Modelo 3D conceptual del tablero. Flechas: girar. Mayúscula más flechas: desplazar. Más y menos: acercar y alejar. Cero: vista inicial. N y P: línea siguiente o anterior. Escape: quitar la selección.');
    let renderer;
    try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true, powerPreference: 'low-power' }); } catch (e) { return null; }
    host.appendChild(canvas);
    renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
    renderer.setClearColor(0x0c1220, 1);
    const reduced = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const scene = new THREE.Scene(); scene.fog = new THREE.Fog(0x0c1220, 5000, 14000);
    const cam = new THREE.PerspectiveCamera(32, 1, 10, 40000);
    scene.add(new THREE.HemisphereLight(0xe4ecff, 0x2a3350, 2.2));
    const sun = new THREE.DirectionalLight(0xfff6e8, 2.6); sun.position.set(-1400, 2400, 3000); scene.add(sun);
    const rim = new THREE.DirectionalLight(0x9fb6ff, .9); rim.position.set(2400, 800, -600); scene.add(rim);
    const grid = new THREE.GridHelper(8000, 80, 0x34425f, 0x1a2338); grid.material.transparent = true; grid.material.opacity = .6; scene.add(grid);
    const maxAniso = renderer.capabilities.getMaxAnisotropy();

    const orbit = { theta: -.42, phi: 1.36, r: 3000, target: new THREE.Vector3(), home: null };
    const st = { explode: 0, iso: null, sel: null, model: null, anim: null, hover: null };
    let board = null, pickables = [], blockers = [], layers = null, selDecor = [];
    const perf = { renders: 0, times: [] };
    const selMat = new THREE.MeshStandardMaterial({ color: 0xffe99a, emissive: 0xf2b705, emissiveIntensity: .55, roughness: .45 });
    const selLine = new THREE.LineBasicMaterial({ color: 0xf2b705 });
    const tmpV = new THREE.Vector3(), tmpM = new THREE.Matrix4(), tmpC = new THREE.Color(), tmpQ = new THREE.Quaternion(), tmpS = new THREE.Vector3();

    /* Render a demanda: solo si algo cambió o hay animación; nada mientras la pestaña está oculta. */
    let dirty = false, raf = 0;
    const invalidate = () => { dirty = true; if (!raf && !document.hidden) raf = requestAnimationFrame(frame); };
    function frame(t) { raf = 0; const anim = step(t); if (dirty || anim) { render(); dirty = false; } if (anim) invalidate(); }
    function render() { const t0 = performance.now(); applyCam(); renderer.render(scene, cam); perf.renders++; perf.times.push(performance.now() - t0); if (perf.times.length > 120) perf.times.shift(); }
    const onVis = () => { if (document.hidden) { if (raf) cancelAnimationFrame(raf); raf = 0; if (st.anim) st.anim.pausedAt = performance.now(); } else { if (st.anim && st.anim.pausedAt) { st.anim.t0 += performance.now() - st.anim.pausedAt; st.anim.pausedAt = 0; } invalidate(); } };
    document.addEventListener('visibilitychange', onVis);
    function step(t) { const a = st.anim; if (!a) return false; const p = Math.min(1, (t - a.t0) / a.dur); setExplodeRaw(a.from + (a.to - a.from) * p); if (p >= 1) { st.anim = null; if (opts.onAnimEnd) opts.onAnimEnd(); return false; } return true; }
    function applyCam() { const o = orbit; cam.position.set(o.target.x + o.r * Math.sin(o.phi) * Math.sin(o.theta), o.target.y + o.r * Math.cos(o.phi), o.target.z + o.r * Math.sin(o.phi) * Math.cos(o.theta)); cam.lookAt(o.target); }
    const ro = new ResizeObserver(() => { const w = host.clientWidth, h = host.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); invalidate(); });
    ro.observe(host);

    function labelTex(text, wmm, hmm) {
      const k = Math.min(10, 2048 / wmm); const c = document.createElement('canvas'); c.width = Math.max(16, Math.round(wmm * k)); c.height = Math.max(8, Math.round(hmm * k));
      const g = c.getContext('2d'); g.fillStyle = '#0c1220'; g.fillRect(0, 0, c.width, c.height); g.strokeStyle = '#46557a'; g.lineWidth = Math.max(1, k * .7); g.strokeRect(0, 0, c.width, c.height);
      let f = c.height * .64; g.font = `600 ${f}px "IBM Plex Sans", system-ui, sans-serif`; const tw = g.measureText(text).width; if (tw > c.width * .92) { f *= c.width * .92 / tw; g.font = `600 ${f}px "IBM Plex Sans", system-ui, sans-serif`; }
      g.fillStyle = '#f1f4fa'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, c.width / 2, c.height / 2 + f * .05);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = maxAniso; return t;
    }

    /* ─── Construcción (se descarta todo al cambiar de plano o si cambian las líneas) ─── */
    function disposeBoard() {
      clearSel();
      if (!board) return;
      board.traverse(o => { if (o.geometry) o.geometry.dispose(); if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(m => { if (m === selMat || m === selLine) return; if (m.map) m.map.dispose(); m.dispose(); }); });
      scene.remove(board); board = null; pickables = []; blockers = []; layers = null;
    }
    function build(model, keepCam) {
      disposeBoard(); st.model = model;
      const { enc, plate } = model; const W = enc.W, H = enc.H, D = enc.D;
      board = new THREE.Group(); scene.add(board);
      layers = { plate: new THREE.Group(), rails: new THREE.Group(), devices: new THREE.Group(), door: new THREE.Group() };
      Object.values(layers).forEach(g => board.add(g));
      const geos = new Map(); const box = (w, h, d) => { const k = w + '|' + h + '|' + d; if (!geos.has(k)) geos.set(k, new THREE.BoxGeometry(w, h, d)); return geos.get(k); };
      const mat = (color, o) => { o = o || {}; const m = new THREE.MeshStandardMaterial({ color, roughness: o.rough != null ? o.rough : .6, metalness: o.metal || 0 }); m.userData = { family: o.family || null }; return m; };
      const add = (parent, geo, m, x, y, z, ud) => { const me = new THREE.Mesh(geo, m); me.position.set(x, y, z); if (ud) Object.assign(me.userData, ud); parent.add(me); return me; };
      /* Envolvente (fija): fondo, laterales, techo y piso */
      const t = 14, encMat = mat(0xc7cbc6, { rough: .72, metal: .1, family: 'Envolvente' });
      const encUd = enc.lineId ? { lineId: enc.lineId, sym: 0, part: 'enc' } : null;
      [[W, H, t, 0, 0, -D / 2 + t / 2], [t, H, D, -W / 2 + t / 2, 0, 0], [t, H, D, W / 2 - t / 2, 0, 0], [W, t, D, 0, H / 2 - t / 2, 0], [W, t, D, 0, -H / 2 + t / 2, 0]]
        .forEach(([w, h, d, x, y, z], i) => { const m = add(board, box(w, h, d), encMat, x, y, z, encUd); (i && encUd ? pickables : blockers).push(m); });
      /* Placa y rieles */
      const zPlate = -D / 2 + t + 20;
      blockers.push(add(layers.plate, box(plate.w, plate.h, 3), mat(0xa3a9b0, { rough: .5, metal: .45 }), 0, 0, zPlate));
      const z0 = zPlate + 1.5;
      const railMat = mat(0xe3e6ea, { rough: .28, metal: .85 });
      model.rails.forEach(r => add(layers.rails, box(r.w, 35, 7.5), railMat, 0, r.y, z0 + 3.75));
      /* Aparatos: color por familia; cada malla sabe su línea (lineId) y su índice de símbolo (sym) */
      const lineMats = new Map();
      const bodyMat = (l, fam) => { if (!lineMats.has(l.id)) { const c = mix(FAM_COLOR[fam] || FAM_COLOR.Otros, '#1a2336', .12); lineMats.set(l.id, mat(new THREE.Color(c).getHex(), { rough: .55, family: fam })); } return lineMats.get(l.id); };
      const darkMat = mat(0x1b2030, { rough: .45 });
      const doorMat = mat(0xcfd3ce, { rough: .7, metal: .1, family: 'Envolvente' });
      const zDoor = D / 2 + 10;
      const fw = 45; const band = Math.max(model.band, 0);
      const frame = [[fw, H, fw / 2 - W / 2, 0], [fw, H, W / 2 - fw / 2, 0], [W - 2 * fw, fw + band, 0, H / 2 - (fw + band) / 2], [W - 2 * fw, fw, 0, -H / 2 + fw / 2]];
      frame.forEach(([w, h, x, y]) => { const m = add(layers.door, box(w, h, 20), doorMat, x, y, zDoor, encUd); (encUd ? pickables : blockers).push(m); });
      const glassH = H - 2 * fw - band;
      const glass = new THREE.Mesh(new THREE.PlaneGeometry(W - 2 * fw, glassH), new THREE.MeshStandardMaterial({ color: 0xa9c8e8, transparent: true, opacity: .12, roughness: .05, metalness: 0, depthWrite: false }));
      glass.position.set(0, -H / 2 + fw + glassH / 2, zDoor + 2); glass.userData.glass = true; layers.door.add(glass);
      add(layers.door, box(16, 130, 24), darkMat, W / 2 - fw / 2, -H * .05, zDoor + 22);
      const bornes = new Map();
      model.items.forEach(it => {
        const l = L.line(it.lineId); if (!l) return;
        const ud = { lineId: it.lineId, sym: it.k, family: it.family };
        if (it.zone === 'bornes') { (bornes.get(l.id) || bornes.set(l.id, []).get(l.id)).push(it); return; }
        if (it.zone === 'door') {
          const zf = zDoor + 10;
          if (it.typeId === 'piloto') {
            const ring = new THREE.CylinderGeometry(it.w / 2 + 5, it.w / 2 + 5, 6, 28); ring.rotateX(Math.PI / 2);
            const m = add(layers.door, ring, bodyMat(l, it.family), it.x, it.y, zf + 3, ud); pickables.push(m);
            const lens = new THREE.CylinderGeometry(it.w / 2, it.w / 2 * .92, it.d, 28); lens.rotateX(Math.PI / 2);
            const lm = new THREE.MeshStandardMaterial({ color: LAMP[l.attrs.color] || LAMP.Rojo, emissive: LAMP[l.attrs.color] || LAMP.Rojo, emissiveIntensity: .45, roughness: .25 }); lm.userData = { family: it.family };
            add(m, lens, lm, 0, 0, it.d / 2);
          } else {
            const m = add(layers.door, box(it.w, it.h, it.d), bodyMat(l, it.family), it.x, it.y, zf + it.d / 2, ud); pickables.push(m);
            const sm = mat(0x9fe0a4, { rough: .3, family: it.family }); sm.emissive = new THREE.Color(0x2c6b33); add(m, box(it.w - 22, it.h * .4, 2), sm, 0, it.h * .1, it.d / 2 + 1);
          }
          return;
        }
        const zc = (it.zone === 'big' ? z0 : z0 + 7.5) + it.d / 2;
        const m = add(layers.devices, box(it.w - (it.mod ? .9 : 2), it.h, it.d), bodyMat(l, it.family), it.x, it.y, zc, ud); pickables.push(m);
        const lw = it.zone === 'big' ? 36 : Math.min(it.w * .5, 30), lh = it.zone === 'big' ? 48 : 15;
        add(m, box(lw, lh, 12), darkMat, 0, it.zone === 'big' ? 18 : 6, it.d / 2 + 6);
        if (it.typeId === 'dif') add(m, box(8, 8, 6), mat(0xf2d15c, { family: it.family }), it.w / 2 - 9, -it.h / 2 + 16, it.d / 2 + 3);
      });
      /* Bornes: una malla instanciada por línea (una sola llamada de dibujo aunque haya cientos) */
      bornes.forEach((list, id) => {
        const im = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), mat(0xffffff, { rough: .6, family: 'Conexionado' }), list.length);
        list.forEach((it, i) => { tmpM.compose(tmpV.set(it.x, it.y, z0 + 7.5 + it.d / 2), tmpQ.identity(), tmpS.set(it.w - .8, it.h, it.d)); im.setMatrixAt(i, tmpM); im.setColorAt(i, tmpC.set(FAM_COLOR['Conexionado'])); });
        im.userData = { lineId: id, family: 'Conexionado', instSym: list.map(i => i.k) };
        im.computeBoundingSphere(); layers.devices.add(im); pickables.push(im);
      });
      /* Rótulos legibles sobre cada grupo (como la tira de marcación de un tablero real) */
      model.segs.forEach(sg => {
        const l = L.line(sg.lineId); const w = Math.max(sg.x1 - sg.x0, sg.zone === 'door' ? 90 : 0); const hh = sg.zone === 'big' ? 40 : 30;
        const text = short(l) + (sg.count > 1 ? ' ×' + sg.count : '');
        const lm = new THREE.MeshBasicMaterial({ map: labelTex(text, w, hh), transparent: true }); lm.userData = { family: familyOf(l) };
        const parent = sg.zone === 'door' ? layers.door : layers.devices;
        const z = sg.zone === 'door' ? zDoor + 11 : (sg.zone === 'big' ? z0 : z0 + 7.5) + sg.d + .5;
        /* en la puerta el rótulo va debajo del aparato; en la placa, arriba del grupo */
        const y = sg.zone !== 'door' ? sg.top + hh / 2 + 5 : l.typeId === 'piloto' ? sg.top - 22 - hh / 2 - 8 : sg.top - 96 - hh / 2 - 6;
        const me = add(parent, new THREE.PlaneGeometry(w, hh), lm, (sg.x0 + sg.x1) / 2, y, z, { lineId: sg.lineId, sym: 0, label: true });
        pickables.push(me);
      });
      grid.position.y = -H / 2 - 1;
      const fov = cam.fov * Math.PI / 360; const aspect = Math.max(.45, cam.aspect || 1.4);
      const r = Math.max((H * 1.06 / 2) / Math.tan(fov), (W * 1.6 / 2) / (Math.tan(fov) * aspect));
      orbit.home = { theta: -.36, phi: 1.4, r: r * 1.08, target: new THREE.Vector3(0, -H * .02, D * .75) };
      if (!keepCam) resetCam();
      applyExplode(); applyIso();
      if (st.sel && !model.lines.find(l => l.id === st.sel)) st.sel = null;
      applySel(); invalidate();
    }
    /* Vista explotada: cada capa se separa en profundidad con easing (el valor del control es lineal). */
    function applyExplode() {
      if (!layers || !st.model) return; const u = Math.max(.8, Math.min(2, Math.max(st.model.enc.W, st.model.enc.H) / 1000)); const e = ease(st.explode);
      layers.plate.position.z = e * 50 * u; layers.rails.position.z = e * 140 * u; layers.devices.position.z = e * 260 * u; const side = cam.aspect >= 1 ? 1 : 0; /* en pantallas angostas la puerta solo avanza */
      layers.door.position.z = e * (side ? 300 : 620) * u; layers.door.position.x = side * e * (st.model.enc.W + 80); board.position.x = -side * e * (st.model.enc.W + 80) / 2; /* la puerta se corre al costado: no tapa el interior */
      invalidate();
    }
    function setExplodeRaw(v) { st.explode = Math.max(0, Math.min(1, +v || 0)); applyExplode(); if (opts.onExplode) opts.onExplode(st.explode); }
    function eachMat(fn) { if (!board) return; const seen = new Set(); const each = m => { if (m === selMat || seen.has(m)) return; seen.add(m); fn(m); }; board.traverse(o => { if (o.material && !o.userData.glass) each(o.material); }); selDecor.forEach(d => { if (d.restore) each(d.restore); }); }
    /* Aislar familia: lo demás queda fantasma (semitransparente) y no se puede tocar */
    function applyIso() {
      eachMat(m => { const fam = m.userData.family; const op = !st.iso || !fam ? 1 : fam === st.iso ? 1 : fam === 'Envolvente' ? .28 : .08; if (m.opacity !== op) { m.transparent = op < 1; m.opacity = op; m.depthWrite = op === 1; m.needsUpdate = true; } });
      invalidate();
    }
    function clearSel() { selDecor.forEach(d => { if (d.restore) d.mesh.material = d.restore; if (d.line) { if (d.line.parent) d.line.parent.remove(d.line); d.line.geometry.dispose(); } }); selDecor = []; }
    function applySel() {
      clearSel(); if (!board) return; const id = st.sel;
      pickables.forEach(p => {
        if (p.isInstancedMesh) { for (let i = 0; i < p.count; i++) p.setColorAt(i, tmpC.set(p.userData.lineId === id ? '#f2b705' : FAM_COLOR['Conexionado'])); p.instanceColor.needsUpdate = true; return; }
        if (!id || p.userData.lineId !== id || p.userData.label) return;
        if (p.userData.part === 'enc') { const ls = new THREE.LineSegments(new THREE.EdgesGeometry(p.geometry), selLine); p.add(ls); selDecor.push({ line: ls }); return; }
        selDecor.push({ mesh: p, restore: p.material }); p.material = selMat;
        const ls = new THREE.LineSegments(new THREE.EdgesGeometry(p.geometry), selLine); ls.scale.setScalar(1.04); p.add(ls); selDecor.push({ line: ls });
      });
      invalidate();
    }
    function select(id, silent) { st.sel = id || null; applySel(); if (!silent && opts.onSelect) opts.onSelect(st.sel); return st.sel; }

    /* ─── Cámara orbital ─── */
    const clampPhi = v => Math.max(.2, Math.min(Math.PI - .25, v));
    function rotate(dt, dp) { orbit.theta += dt; orbit.phi = clampPhi(orbit.phi + dp); invalidate(); }
    function zoom(f) { const h = orbit.home ? orbit.home.r : 3000; orbit.r = Math.max(h * .15, Math.min(h * 3, orbit.r * f)); invalidate(); }
    function pan(dx, dy) { const k = orbit.r * .0012; applyCam(); const right = tmpV.subVectors(cam.position, orbit.target).cross(cam.up).normalize(); orbit.target.addScaledVector(right, dx * k); orbit.target.y += dy * k; invalidate(); }
    function resetCam() { const h = orbit.home; if (!h) return; orbit.theta = h.theta; orbit.phi = h.phi; orbit.r = h.r; orbit.target.copy(h.target); invalidate(); }

    /* ─── Picking ─── */
    const ray = new THREE.Raycaster(); const ndc = new THREE.Vector2();
    function hit(cx, cy) {
      if (!board) return null; const rc = canvas.getBoundingClientRect(); ndc.set((cx - rc.left) / rc.width * 2 - 1, -((cy - rc.top) / rc.height) * 2 + 1);
      applyCam(); cam.updateMatrixWorld(); board.updateMatrixWorld(true); ray.setFromCamera(ndc, cam);
      const solid = o => { const m = o.material; return !(m && m !== selMat && m.opacity < .5); };
      const h = ray.intersectObjects(pickables.filter(solid).concat(blockers), false)[0]; if (!h) return null;
      if (!pickables.includes(h.object)) return null;
      return { lineId: h.object.userData.lineId, sym: h.object.isInstancedMesh ? h.object.userData.instSym[h.instanceId] : h.object.userData.sym };
    }
    function worldOf(id) {
      if (!board) return null; board.updateMatrixWorld(true);
      for (const o of pickables) {
        if (o.userData.lineId !== id || o.userData.label || o.userData.part) continue;
        if (o.isInstancedMesh) { o.getMatrixAt(0, tmpM); return new THREE.Vector3().setFromMatrixPosition(tmpM).applyMatrix4(o.matrixWorld); }
        return o.getWorldPosition(new THREE.Vector3());
      }
      return null;
    }
    function screenOf(id) { const p = worldOf(id); if (!p) return null; applyCam(); cam.updateMatrixWorld(); const rc = canvas.getBoundingClientRect(); p.project(cam); return { x: Math.round(rc.left + (p.x + 1) / 2 * rc.width), y: Math.round(rc.top + (1 - p.y) / 2 * rc.height) }; }

    /* ─── Entrada: mouse, touch (un dedo gira; dos dedos pellizcan y desplazan), rueda y teclado ─── */
    const pts = new Map(); let mode = null, downAt = null, moved = 0, pinch = null, hoverRaf = 0;
    const pinchState = () => { const [a, b] = [...pts.values()]; return { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2 }; };
    canvas.addEventListener('pointerdown', e => {
      canvas.focus({ preventScroll: true }); try { canvas.setPointerCapture(e.pointerId); } catch (err) { /* puntero sintético */ }
      pts.set(e.pointerId, { x: e.clientX, y: e.clientY }); stopAnim();
      if (pts.size === 1) { downAt = { x: e.clientX, y: e.clientY, button: e.button }; moved = 0; mode = (e.button === 2 || e.button === 1 || e.shiftKey) ? 'pan' : 'rotate'; if (opts.onHover) opts.onHover(null); }
      else if (pts.size === 2) { mode = 'pinch'; pinch = pinchState(); }
    });
    canvas.addEventListener('pointermove', e => {
      const p = pts.get(e.pointerId);
      if (!p) {
        if (!opts.onHover || e.pointerType !== 'mouse' || hoverRaf) return; const cx = e.clientX, cy = e.clientY;
        hoverRaf = requestAnimationFrame(() => { hoverRaf = 0; const h = hit(cx, cy); canvas.style.cursor = h ? 'pointer' : 'grab'; if ((h && h.lineId) !== st.hover) st.hover = h && h.lineId; opts.onHover(h, cx, cy); });
        return;
      }
      const dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
      if (mode === 'rotate' && pts.size === 1) rotate(-dx * .0068, -dy * .0068);
      else if (mode === 'pan' && pts.size === 1) pan(-dx, dy);
      else if (mode === 'pinch' && pts.size === 2) { const c = pinchState(); zoom(pinch.d / c.d); pan(-(c.mx - pinch.mx), c.my - pinch.my); pinch = c; }
    });
    const up = e => {
      if (!pts.has(e.pointerId)) return; pts.delete(e.pointerId);
      if (pts.size === 0) { if (e.type === 'pointerup' && mode === 'rotate' && downAt && downAt.button === 0 && moved < 8) { const h = hit(e.clientX, e.clientY); select(h && h.lineId); } mode = null; }
      else mode = 'done';
    };
    canvas.addEventListener('pointerup', up); canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', () => { if (opts.onHover && !pts.size) opts.onHover(null); });
    canvas.addEventListener('contextmenu', e => e.preventDefault());
    canvas.addEventListener('wheel', e => { e.preventDefault(); zoom(Math.exp(Math.max(-60, Math.min(60, e.deltaY)) * .004)); }, { passive: false });
    canvas.addEventListener('keydown', e => {
      const k = e.key; let used = true;
      if (k === 'ArrowLeft') e.shiftKey ? pan(-40, 0) : rotate(-.14, 0);
      else if (k === 'ArrowRight') e.shiftKey ? pan(40, 0) : rotate(.14, 0);
      else if (k === 'ArrowUp') e.shiftKey ? pan(0, 40) : rotate(0, -.1);
      else if (k === 'ArrowDown') e.shiftKey ? pan(0, -40) : rotate(0, .1);
      else if (k === '+' || k === '=') zoom(.85);
      else if (k === '-' || k === '_') zoom(1 / .85);
      else if (k === '0' || k === 'Home') resetCam();
      else if (k === 'Escape') select(null);
      else if (/^[np]$/i.test(k) && st.model) { const ids = summary(st.model).map(r => r.line.id); const i = ids.indexOf(st.sel); select(ids[(i + (k.toLowerCase() === 'n' ? 1 : ids.length - (i < 0 ? 0 : 1))) % ids.length]); }
      else used = false;
      if (used) e.preventDefault();
    });

    function stopAnim() { if (st.anim) { st.anim = null; if (opts.onAnimEnd) opts.onAnimEnd(); } }
    function animateTo(to) { if (reduced()) { stopAnim(); setExplodeRaw(to); return false; } st.anim = { from: st.explode, to, t0: performance.now(), dur: 400 + 1100 * Math.abs(to - st.explode) }; invalidate(); return true; }

    /* PNG del lienzo con la leyenda de modelo conceptual al pie. */
    function png(title) {
      render(); const f = Math.min(2, window.devicePixelRatio || 1); const band = Math.round(58 * f);
      const c = document.createElement('canvas'); c.width = canvas.width; c.height = canvas.height + band; const x = c.getContext('2d');
      x.drawImage(canvas, 0, 0); x.fillStyle = '#141c2e'; x.fillRect(0, canvas.height, c.width, band); x.fillStyle = '#f2b705'; x.fillRect(0, canvas.height, 6 * f, band);
      x.fillStyle = '#e6ebf5'; x.font = `600 ${15 * f}px "IBM Plex Sans", system-ui, sans-serif`; x.fillText(title, 18 * f, canvas.height + 23 * f);
      x.fillStyle = '#9aa6bf'; x.font = `${12.5 * f}px "IBM Plex Sans", system-ui, sans-serif`; x.fillText(DISCLAIMER + ' · liard · datos ficticios', 18 * f, canvas.height + 44 * f);
      return new Promise(res => c.toBlob(res, 'image/png'));
    }
    function bench(n) { n = n || 60; const gl = renderer.getContext(); const ts = []; const th = orbit.theta; for (let i = 0; i < n; i++) { orbit.theta = th + i * .01; const t0 = performance.now(); applyCam(); renderer.render(scene, cam); gl.finish(); ts.push(performance.now() - t0); } orbit.theta = th; invalidate(); ts.sort((a, b) => a - b); return { avgMs: +(ts.reduce((a, b) => a + b, 0) / n).toFixed(2), p95Ms: +ts[Math.floor(n * .95)].toFixed(2), maxMs: +ts[n - 1].toFixed(2), calls: renderer.info.render.calls, triangles: renderer.info.render.triangles }; }
    function dispose() { if (raf) cancelAnimationFrame(raf); raf = 0; disposeBoard(); ro.disconnect(); document.removeEventListener('visibilitychange', onVis); renderer.dispose(); canvas.remove(); }

    return {
      canvas, build, select, dispose, png, bench, screenOf, rotate, zoom, pan, resetCam, animateTo, stopAnim,
      setExplode(v) { stopAnim(); setExplodeRaw(v); },
      isolate(f) { st.iso = f || null; applyIso(); },
      hitAt: hit,
      state: () => ({ explode: st.explode, iso: st.iso, sel: st.sel, animating: !!st.anim, renders: perf.renders, pickables: pickables.length }),
      camera: () => ({ theta: +orbit.theta.toFixed(3), phi: +orbit.phi.toFixed(3), r: Math.round(orbit.r), target: orbit.target.toArray().map(Math.round), position: cam.position.toArray().map(Math.round) }),
      layers: () => layers ? { plate: Math.round(layers.plate.position.z), rails: Math.round(layers.rails.position.z), devices: Math.round(layers.devices.position.z), door: Math.round(layers.door.position.z), doorX: Math.round(layers.door.position.x) } : null,
      worldOf: id => { const v = worldOf(id); return v && v.toArray().map(Math.round); },
      opacityOf(id) { const o = pickables.find(p => p.userData.lineId === id && !p.userData.label && !p.userData.part); return o ? (o.material === selMat ? 1 : o.material.opacity) : null; },
      highlighted() { const s = new Set(); pickables.forEach(p => { if (p.material === selMat) s.add(p.userData.lineId); if (p.isInstancedMesh && p.userData.lineId === st.sel && st.sel) s.add(p.userData.lineId); }); return [...s]; },
      memory: () => ({ geometries: renderer.info.memory.geometries, textures: renderer.info.memory.textures }),
      perf: () => ({ renders: perf.renders, avgMs: perf.times.length ? +(perf.times.reduce((a, b) => a + b, 0) / perf.times.length).toFixed(2) : null }),
    };
  }

  return { MOD, DISCLAIMER, FAMILIES, FAM_COLOR, layout, summary, csv, refRange, signature, svg, short, zoneLabel, familyOf, webglOk, Viewer };
})();
/* ==== T3D-ENGINE:END ==== */

/* ==== T3D.ui · piezas de interfaz compartidas por escritorio y móvil ==== */
T3D.ui = (() => {
  const SRC = { DETECTOR: 'detectado', RULE: 'inferido', MANUAL: 'manual' };
  /* Planos que se pueden dibujar: procesados (o por revisar). */
  const drawable = p => p && (p.status === 'COMPLETED' || p.status === 'STALE');
  function pickPlan(pid, wanted) {
    const plans = L.plansOf(pid); const w = plans.find(p => p.id === wanted);
    if (w) return w; return plans.find(drawable) || null;
  }
  function planOptions(pid, cur) {
    return L.plansOf(pid).map(p => `<option value="${p.id}"${p.id === cur ? ' selected' : ''}${drawable(p) ? '' : ' disabled'}>${L.esc(p.name)}${(p.multiplier || 1) > 1 ? ' ×' + p.multiplier : ''}${drawable(p) ? '' : ' · ' + L.planStatusLabel[p.status]}</option>`).join('');
  }
  /* Ofertas y pedidos de la obra que incluyen la línea. */
  function offersFor(l) {
    const out = [];
    L.requestsOf(l.projectId).filter(r => r.lineIds.includes(l.id)).forEach(r => {
      const row = L.compare(r.id).rows.find(x => x.lineId === l.id); if (!row) return;
      row.opts.forEach(o => out.push(Object.assign({ request: r }, o)));
    });
    const ords = L.ordersOf(l.projectId).flatMap(o => o.lines.filter(x => x.lineId === l.id).map(x => ({ order: o, line: x })));
    return { offers: out, orders: ords };
  }
  function detail(l, model, opt) {
    opt = opt || {};
    const t = L.type(l.typeId); const planId = model.planId; const n = l.perPlan[planId] || 0; const mult = model.plan.multiplier || 1;
    const fam = T3D.familyOf(l); const its = model.items.filter(i => i.lineId === l.id);
    const where = l.typeId === 'gab' ? 'Envolvente del tablero' : its.length ? [...new Set(its.map(T3D.zoneLabel))].join(' · ') : 'No se dibuja';
    const attrs = t ? t.attrs.map(a => { const v = l.attrs[a.k]; const miss = v == null || v === ''; return `<div class="t3-kv"><dt>${L.esc(a.label)}${a.req ? ' <small class="muted">esencial</small>' : ''}</dt><dd>${miss ? (a.req ? L.badge('Falta', 'warn', 'alert') : '<span class="muted">—</span>') : L.esc(v + (a.unit ? ' ' + a.unit : ''))}</dd></div>`; }).join('') : '';
    const rr = T3D.refRange(l); const reason = rr ? null : L.unmatchedReason(l);
    const { offers, orders } = offersFor(l);
    const issues = L.lineIssues(l);
    const lnkPlano = L.link('d-plano.html', { p: l.projectId, plan: planId, linea: l.id }), lnkBom = L.link('d-bom.html', { p: l.projectId, linea: l.id });
    return `<div class="t3-det" data-det="${l.id}">
      <div class="t3-det-h"><span class="t3-sw" style="background:${T3D.FAM_COLOR[fam]}"></span><div><h3>${L.esc(L.lineLabel(l))}</h3><small class="muted">${L.esc(fam)} · ${L.srcTag(l.src)}</small></div>${opt.close ? `<button class="icon-btn" data-close aria-label="Cerrar detalle">${L.icon('x', 16)}</button>` : ''}</div>
      ${issues.filter(i => i.blocks).map(i => `<div class="note note-warn">${L.icon('alert', 16)}<p>${L.esc(i.text)}. Bloquea la solicitud de cotización.</p></div>`).join('')}
      <div class="t3-qty"><div><span class="eyebrow">Dibujada</span><strong class="mono">${n}</strong></div><div><span class="eyebrow">× Repeticiones</span><strong class="mono">${mult}</strong></div><div><span class="eyebrow">A comprar</span><strong class="mono">${n * mult}</strong></div></div>
      <p class="t3-small muted">Cantidades de ${L.esc(model.plan.name)}. En toda la obra: ${L.qtyDrawn(l)} dibujadas · ${L.qty(l)} a comprar.</p>
      <dl class="t3-dl">
        <div class="t3-kv"><dt>Componente base</dt><dd>${t ? L.esc(t.name) : L.badge('Sin componente base', 'warn')}</dd></div>
        ${attrs}
        <div class="t3-kv"><dt>Marca</dt><dd>${l.brand == null ? L.badge('Sin decidir', 'warn', 'alert') : L.esc(L.brandLabel(l.brand))}</dd></div>
        <div class="t3-kv"><dt>Procedencia</dt><dd>${L.srcTag(l.src)} <small class="muted">${l.src === 'RULE' ? 'inferido por regla: revisalo' : l.src === 'DETECTOR' ? 'detectado en el plano' : 'cargado a mano'}</small></dd></div>
        <div class="t3-kv"><dt>Ubicación estimada</dt><dd>${L.esc(where)} <small class="muted">(aproximada)</small></dd></div>
      </dl>
      ${l.note ? `<p class="t3-small ink2">${L.esc(l.note)}</p>` : ''}
      <div class="t3-price"><span class="eyebrow">Precio unitario</span>
        <div class="t3-pr">${L.priceTag('referencia')} ${rr ? `<strong class="mono">${rr.min === rr.max ? L.ars(rr.min) : L.ars(rr.min) + ' – ' + L.ars(rr.max)}</strong><small class="muted">${rr.n} ${rr.n === 1 ? 'ítem' : 'ítems'} de catálogo en ${rr.suppliers} ${rr.suppliers === 1 ? 'distribuidor' : 'distribuidores'}${rr.stale ? ' · hay precios vencidos' : ''}</small>` : `<small class="muted">${L.esc(reason || 'Sin precio de catálogo.')}</small>`}</div>
        ${offers.map(o => { const s = L.supplier(o.supplierId); if (o.none) return `<div class="t3-pr">${L.priceTag('sinPrecio')} <span>${L.esc(s.short)} no lo cotizó</span>${o.note ? `<small class="muted">${L.esc(o.note)}</small>` : ''}</div>`;
          return `<div class="t3-pr">${L.priceTag('oferta')} <strong class="mono">${L.ars(o.price)}</strong><span>${L.esc(s.short)} · ${L.esc(o.brand || '')}</span> ${L.badge(L.stockLabel[o.stock] + (o.stock === 'PARCIAL' && o.stockQty ? ' (' + o.stockQty + ')' : ''), L.stockTone[o.stock])} ${o.valid ? '' : L.badge('Oferta vencida', 'err')} ${o.isAlt ? L.badge(o.equivalence === 'APROBADA' ? 'Equivalencia aprobada' : 'Alternativa sugerida, sin aprobar', o.equivalence === 'APROBADA' ? 'ok' : 'warn') : ''}<small class="muted">${L.esc(o.request.code)} · ${o.lead} días</small></div>`; }).join('')}
        ${orders.map(x => `<div class="t3-pr">${L.priceTag('pedido')} <strong class="mono">${L.ars(x.line.unitPrice)}</strong><span>${L.esc(L.supplier(x.order.supplierId).short)} · ${L.esc(x.order.code)}</span> ${L.badge(L.orderStatusLabel[x.order.status], L.orderStatusTone[x.order.status])}</div>`).join('')}
        ${!offers.length && !orders.length ? `<small class="muted">Todavía no hay ofertas: los precios de arriba son de catálogo, no confirmados.</small>` : ''}
      </div>
      <div class="row t3-links"><a class="btn btn-secondary btn-sm" href="${lnkPlano}">${L.icon('scan', 14)}Ver en el plano</a><a class="btn btn-secondary btn-sm" href="${lnkBom}">${L.icon('edit', 14)}Editar en el BOM</a></div>
    </div>`;
  }
  /* PNG de la vista 2D (se rasteriza el SVG). */
  function svgPng(svgEl, scale) {
    return new Promise((res, rej) => {
      const w = svgEl.viewBox.baseVal.width, h = svgEl.viewBox.baseVal.height; const k = (scale || 1600) / w;
      const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = Math.round(w * k); c.height = Math.round(h * k) + 60; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(img, 0, 0, c.width, c.height - 60);
        x.fillStyle = '#111a2b'; x.font = '600 15px "IBM Plex Sans", system-ui, sans-serif'; x.fillText(T3D.DISCLAIMER, 16, c.height - 34); x.fillStyle = '#6b7486'; x.font = '12px "IBM Plex Sans", system-ui, sans-serif'; x.fillText('liard · vista 2D · datos ficticios', 16, c.height - 14);
        c.toBlob(b => b ? res(b) : rej(new Error('toBlob'))); };
      img.onerror = rej; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(svgEl));
    });
  }
  const fileBase = model => 'tablero-' + String(model.plan.name).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  return { SRC, drawable, pickPlan, planOptions, detail, offersFor, svgPng, fileBase };
})();

/* ==== T3D.page · controlador de pantalla. Busca los elementos por [data-t3="…"] dentro de `root`. ==== */
T3D.page = (root, cfg) => {
  cfg = cfg || {};
  const $ = k => root.querySelector('[data-t3="' + k + '"]');
  const el = { plan: $('plan'), view: $('view'), chips: $('chips'), range: $('explode'), out: $('explode-out'), play: $('play'), stage: $('stage'), tip: $('tip'), list: $('list'), det: $('detail'), svg: $('svg'), table: $('table'), sum: $('summary'), png: $('png'), csv: $('csv'), note: $('note'), body: $('body'), empty: $('empty'), zin: $('zoom-in'), zout: $('zoom-out'), reset: $('reset'), hud: $('hud-title') };
  const pid = L.currentProjectId();
  const forcedNoGL = L.param('estado') === 'sin-webgl';
  const st = { planId: null, model: null, sig: null, sel: null, iso: L.param('familia') || null, view: L.param('vista') === '2d' ? '2d' : '3d', viewer: null, glFailed: false };

  function initViewer() {
    if (st.viewer || st.glFailed) return;
    const v = forcedNoGL ? null : T3D.Viewer(el.stage, {
      onSelect: id => select(id, '3d'),
      onHover: (h, x, y) => tip(h, x, y),
      onExplode: v => { el.range.value = Math.round(v * 100); out(); },
      onAnimEnd: () => { el.play.setAttribute('aria-pressed', 'false'); el.play.innerHTML = L.icon('play', 14) + '<span>Animar</span>'; },
    });
    if (!v) { st.glFailed = true; st.view = '2d'; el.note.innerHTML = `<div class="note note-warn">${L.icon('alert', 16)}<p><strong>No pudimos iniciar la vista 3D${forcedNoGL ? ' (simulado con ?estado=sin-webgl)' : ''}.</strong> Tu navegador no tiene WebGL disponible. Te mostramos la vista 2D y la tabla, con los mismos datos y la misma selección; no se perdió nada.</p></div>`; return; }
    st.viewer = v;
  }
  function out() { if (el.out) el.out.textContent = el.range.value + ' %'; el.range.setAttribute('aria-valuetext', el.range.value + ' % separado'); }
  function tip(h, x, y) {
    if (!el.tip) return; if (!h || !h.lineId) { el.tip.hidden = true; return; }
    const l = L.line(h.lineId); if (!l) { el.tip.hidden = true; return; } const n = l.perPlan[st.planId] || 0; const rc = el.stage.getBoundingClientRect();
    el.tip.innerHTML = `<strong>${L.esc(L.lineLabel(l))}</strong><small>${l.typeId === 'gab' ? 'Gabinete' : 'Símbolo ' + ((h.sym || 0) + 1) + ' de ' + n} · ${L.esc(L.brandLabel(l.brand))} · clic para ver el detalle</small>`;
    el.tip.hidden = false; el.tip.style.left = Math.min(rc.width - 280, Math.max(8, x - rc.left + 14)) + 'px'; el.tip.style.top = Math.max(8, y - rc.top - 56) + 'px';
  }

  function load(planId, keepCam) {
    const plan = T3D.ui.pickPlan(pid, planId);
    const forcedEmpty = L.param('estado') === 'vacio';
    el.plan.innerHTML = T3D.ui.planOptions(pid, plan && plan.id); el.plan.disabled = !L.plansOf(pid).length || forcedEmpty;
    if (forcedEmpty || !plan || !T3D.ui.drawable(plan)) {
      st.planId = plan && plan.id; st.model = null; st.sig = null; el.body.hidden = true; el.empty.hidden = false;
      el.png.disabled = el.csv.disabled = true;
      const anyDrawable = L.plansOf(pid).some(T3D.ui.drawable);
      el.empty.innerHTML = forcedEmpty || !anyDrawable ? L.empty({ icon: 'cube', title: 'Todavía no hay un tablero para armar', text: 'El modelo se arma con el BOM de un plano procesado. Subí y procesá un plano de la obra para verlo acá.', action: `<a class="btn btn-primary" href="${L.link('d-obra.html', { p: pid })}">${L.icon('upload', 15)}Ir a los planos de la obra</a>` })
        : L.empty({ icon: 'clock', title: 'El plano ' + plan.name + ' está ' + L.planStatusLabel[plan.status].toLowerCase(), text: 'Cuando termine de procesarse vas a poder ver su tablero. Mientras tanto elegí otro plano de la lista.', action: `<a class="btn btn-secondary" href="${L.link('d-obra.html', { p: pid })}">Ver el estado de los planos</a>` });
      if (st.viewer) { st.viewer.dispose(); st.viewer = null; }
      return;
    }
    el.body.hidden = false; el.empty.hidden = true; el.png.disabled = el.csv.disabled = false;
    const changed = st.planId !== plan.id; st.planId = plan.id; L.setParam('plan', plan.id);
    const model = T3D.layout(plan.id); st.model = model; st.sig = T3D.signature(model);
    if (st.sel && !model.lines.find(l => l.id === st.sel)) st.sel = null;
    if (st.iso && !model.drawn.some(l => T3D.familyOf(l) === st.iso)) st.iso = null;
    initViewer();
    if (st.viewer) { st.viewer.build(model, keepCam && !changed); st.viewer.isolate(st.iso); st.viewer.select(st.sel, true); }
    renderAll();
  }
  function renderAll() { renderView(); renderSummary(); renderChips(); renderList(); renderDetail(); renderSvg(); renderTable(); }
  function renderView() {
    const is3 = st.view === '3d' && !!st.viewer;
    el.view.querySelectorAll('[data-view]').forEach(b => { b.setAttribute('aria-pressed', String(b.dataset.view === (is3 ? '3d' : '2d'))); if (b.dataset.view === '3d') { b.disabled = !st.viewer; b.title = st.viewer ? '' : 'WebGL no disponible en este navegador'; } });
    el.stage.hidden = !is3; el.svg.hidden = is3; if (el.table) el.table.closest('[data-t3-2d]').hidden = is3;
    el.range.disabled = el.play.disabled = !is3; root.classList.toggle('t3-is2d', !is3);
  }
  function renderSummary() {
    const m = st.model, mult = m.plan.multiplier || 1; const n = m.items.length; const un = L.unidentifiedOf(pid).filter(u => u.planId === m.planId).length;
    if (el.hud) el.hud.innerHTML = `<strong>${L.esc(m.plan.name)}</strong> <span class="badge b-volt">× ${mult} ${mult === 1 ? 'repetición' : 'repeticiones'}</span>`;
    el.sum.innerHTML = `<div class="t3-stat"><span class="eyebrow">Tablero</span><strong>${L.esc(m.plan.name)}</strong><small>${L.esc(m.plan.title || '')}</small></div>
      <div class="t3-stat"><span class="eyebrow">Repeticiones</span><strong class="mono">× ${mult}</strong><small>se dibuja uno; se compran ${mult}</small></div>
      <div class="t3-stat"><span class="eyebrow">Aparatos dibujados</span><strong class="mono">${n}</strong><small>${m.drawn.length} líneas del BOM${m.skipped.length ? ' · ' + m.skipped.length + ' sin componente base, sin dibujar' : ''}</small></div>
      <div class="t3-stat"><span class="eyebrow">Rieles DIN</span><strong class="mono">${m.dinRails}</strong><small>${m.dinUsed} de ${m.dinRails * m.dinCap} módulos de 18 mm ocupados</small></div>
      <div class="t3-stat"><span class="eyebrow">Gabinete</span><strong class="mono">${m.enc.H}×${m.enc.W}</strong><small>${m.enc.isDefault ? 'medida por defecto: el BOM no tiene gabinete' : 'de la línea del BOM' + (m.enc.ip ? ' · ' + L.esc(m.enc.ip) : '')} · fondo ${m.enc.D} mm supuesto</small></div>
      ${un ? `<a class="t3-flag" href="${L.link('d-plano.html', { p: pid, plan: m.planId })}">${L.icon('alert', 14)}${un} ${un === 1 ? 'símbolo sin identificar no se dibuja' : 'símbolos sin identificar no se dibujan'}: resolvelos en el plano</a>` : ''}
      ${m.overflow ? `<span class="t3-flag">${L.icon('alert', 14)}Los aparatos no entran en la placa de este gabinete: revisá la medida (el modelo no la calcula)</span>` : ''}`;
  }
  function renderChips() {
    const fams = T3D.FAMILIES.filter(f => st.model.drawn.some(l => T3D.familyOf(l) === f));
    el.chips.innerHTML = `<button class="chip" data-fam="" aria-pressed="${!st.iso}">Todas</button>` + fams.map(f => `<button class="chip" data-fam="${f}" aria-pressed="${st.iso === f}"><i class="t3-sw" style="background:${T3D.FAM_COLOR[f]}"></i>${f}</button>`).join('');
  }
  function renderList() {
    const rows = T3D.summary(st.model);
    el.list.innerHTML = rows.map(r => { const l = r.line; const ghost = st.iso && r.family !== st.iso && l.typeId !== 'gab';
      return `<button class="t3-li${ghost ? ' ghost' : ''}" data-line="${l.id}" aria-pressed="${st.sel === l.id}"><i class="t3-sw" style="background:${T3D.FAM_COLOR[r.family]}"></i><span class="t3-li-t"><strong>${L.esc(T3D.short(l))}</strong><small>${L.esc(L.brandLabel(l.brand))} · ${L.esc(r.where)}</small></span><span class="mono t3-li-n">×${r.count}</span>${l.brand == null ? `<span class="sr-only">sin marca</span>${L.icon('alert', 14, 't3-warn')}` : ''}</button>`; }).join('');
  }
  function renderDetail() {
    const l = st.sel && L.line(st.sel);
    if (!l) { el.det.innerHTML = cfg.mobile ? '' : `<div class="t3-det-empty">${L.icon('target', 22)}<p><strong>Elegí un aparato</strong> en el modelo o en la lista para ver su línea del BOM, su precio de referencia y las ofertas.</p><p class="muted t3-small">Teclado: foco en el modelo, <kbd>N</kbd>/<kbd>P</kbd> recorren las líneas.</p></div>`; root.classList.remove('t3-sheet-open'); return; }
    el.det.innerHTML = T3D.ui.detail(l, st.model, { close: cfg.mobile }); root.classList.add('t3-sheet-open');
    const c = el.det.querySelector('[data-close]'); if (c) c.onclick = () => select(null, 'ui');
  }
  function renderSvg() { el.svg.innerHTML = T3D.svg(st.model, { sel: st.sel, iso: st.iso }); }
  function renderTable() {
    if (!el.table) return; const mult = st.model.plan.multiplier || 1;
    el.table.innerHTML = `<thead><tr><th>Familia</th><th>Material</th><th>Marca</th><th class="num">Dibujada</th><th class="num">× rep.</th><th class="num">A comprar</th><th>Ubicación estimada</th><th class="num">Módulos</th><th>Procedencia</th></tr></thead><tbody>` +
      T3D.summary(st.model).map(r => `<tr data-line="${r.line.id}" tabindex="0" aria-selected="${st.sel === r.line.id}"${st.iso && r.family !== st.iso && r.line.typeId !== 'gab' ? ' class="t3-ghost"' : ''}><td><i class="t3-sw" style="background:${T3D.FAM_COLOR[r.family]}"></i> ${L.esc(r.family)}</td><td>${L.esc(L.lineLabel(r.line))}</td><td>${L.esc(L.brandLabel(r.line.brand))}</td><td class="num">${r.count}</td><td class="num">${mult}</td><td class="num">${r.count * mult}</td><td>${L.esc(r.where)}</td><td class="num">${r.mod || '—'}</td><td>${L.srcTag(r.line.src)}</td></tr>`).join('') + '</tbody>';
  }
  function select(id, from) {
    st.sel = id || null; L.setParam('linea', st.sel);
    if (st.viewer && from !== '3d') st.viewer.select(st.sel, true);
    el.list.querySelectorAll('[data-line]').forEach(b => b.setAttribute('aria-pressed', String(b.dataset.line === st.sel)));
    if (el.table) el.table.querySelectorAll('tr[data-line]').forEach(r => r.setAttribute('aria-selected', String(r.dataset.line === st.sel)));
    renderSvg(); renderDetail();
    if (st.sel && from !== 'list') { const b = el.list.querySelector(`[data-line="${st.sel}"]`); const lc = el.list; if (b && lc.scrollHeight > lc.clientHeight) { const top = b.offsetTop - lc.offsetTop; if (top < lc.scrollTop || top + b.offsetHeight > lc.scrollTop + lc.clientHeight) lc.scrollTop = top - lc.clientHeight / 2; } }
  }
  function isolate(f) { st.iso = f || null; L.setParam('familia', st.iso); if (st.viewer) st.viewer.isolate(st.iso); renderChips(); renderList(); renderSvg(); renderTable(); }

  /* Eventos */
  el.plan.onchange = () => { st.sel = null; L.setParam('linea', null); load(el.plan.value); };
  el.view.onclick = e => { const b = e.target.closest('[data-view]'); if (!b || b.disabled) return; st.view = b.dataset.view; L.setParam('vista', st.view === '2d' ? '2d' : null); renderView(); };
  el.chips.onclick = e => { const b = e.target.closest('[data-fam]'); if (b) isolate(b.dataset.fam); };
  el.list.onclick = e => { const b = e.target.closest('[data-line]'); if (b) select(b.dataset.line === st.sel ? null : b.dataset.line, 'list'); };
  el.svg.onclick = e => { const g = e.target.closest('[data-line]'); select(g ? g.dataset.line : null, 'svg'); };
  if (el.table) { el.table.onclick = e => { const r = e.target.closest('tr[data-line]'); if (r) select(r.dataset.line, 'table'); }; el.table.onkeydown = e => { const r = e.target.closest('tr[data-line]'); if (r && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); select(r.dataset.line, 'table'); } }; }
  el.range.oninput = () => { if (st.viewer) st.viewer.setExplode(el.range.value / 100); out(); };
  el.play.onclick = () => { if (!st.viewer) return; if (st.viewer.state().animating) { st.viewer.stopAnim(); return; } const to = st.viewer.state().explode < .5 ? 1 : 0; if (st.viewer.animateTo(to)) { el.play.setAttribute('aria-pressed', 'true'); el.play.innerHTML = L.icon('pause', 14) + '<span>Pausar</span>'; } };
  if (el.zin) el.zin.onclick = () => st.viewer && st.viewer.zoom(.8);
  if (el.zout) el.zout.onclick = () => st.viewer && st.viewer.zoom(1.25);
  if (el.reset) el.reset.onclick = () => st.viewer && st.viewer.resetCam();
  el.png.onclick = async () => {
    const name = T3D.ui.fileBase(st.model) + (st.view === '3d' && st.viewer ? '-3d' : '-2d') + '.png';
    try { const blob = st.view === '3d' && st.viewer ? await st.viewer.png(st.model.plan.name + ' · ' + L.project(pid).name) : await T3D.ui.svgPng(el.svg.querySelector('svg')); L.download(name, blob, 'image/png'); L.toast('Imagen descargada', { detail: name }); }
    catch (err) { L.toast('No pudimos generar la imagen', { kind: 'err', detail: 'Probá de nuevo o descargá la lista en CSV; el modelo quedó como estaba.' }); }
  };
  el.csv.onclick = () => { const name = T3D.ui.fileBase(st.model) + '-lista.csv'; L.download(name, T3D.csv(st.model), 'text/csv;charset=utf-8'); L.toast('Lista del tablero descargada', { detail: name }); };
  /* Otra pantalla o iframe editó el BOM: se reconstruye solo si cambió lo que se dibuja */
  L.store.subscribe(() => {
    if (!st.model) { load(st.planId); return; }
    const plan = L.plan(st.planId); if (!plan || !T3D.ui.drawable(plan)) { load(null); return; }
    const m = T3D.layout(st.planId); const sig = T3D.signature(m);
    if (sig !== st.sig) { load(st.planId, true); if (cfg.onRebuild) cfg.onRebuild(); } else { st.model = m; renderSummary(); renderDetail(); }
  });
  /* Los rótulos se dibujan en canvas: cuando llega la tipografía, se rehacen */
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => { if (st.viewer && st.model) { st.viewer.build(st.model, true); st.viewer.isolate(st.iso); st.viewer.select(st.sel, true); } });

  st.sel = L.param('linea');
  load(L.param('plan'));
  const ex = +L.param('explotada'); if (ex && st.viewer) { st.viewer.setExplode(Math.min(1, ex > 1 ? ex / 100 : ex)); }
  out(); if (st.sel) select(st.sel, 'url');

  /* Ganchos de prueba */
  window.__t3d = {
    pick: id => { select(id, 'api'); return st.sel; }, selected: () => st.sel,
    camera: () => st.viewer && st.viewer.camera(), state: () => Object.assign({ planId: st.planId, view: st.view, iso: st.iso, webgl: !!st.viewer, items: st.model && st.model.items.length }, st.viewer ? st.viewer.state() : {}),
    layers: () => st.viewer && st.viewer.layers(), worldOf: id => st.viewer && st.viewer.worldOf(id), screenOf: id => st.viewer && st.viewer.screenOf(id), hitAt: (x, y) => st.viewer && st.viewer.hitAt(x, y),
    opacityOf: id => st.viewer && st.viewer.opacityOf(id), highlighted: () => st.viewer ? st.viewer.highlighted() : [], memory: () => st.viewer && st.viewer.memory(), perf: () => st.viewer && st.viewer.perf(), bench: n => st.viewer && st.viewer.bench(n),
    model: () => st.model && { planId: st.model.planId, items: st.model.items.length, rails: st.model.rails.length, enc: st.model.enc, overflow: st.model.overflow, lines: st.model.lines.map(l => [l.id, l.perPlan[st.model.planId]]) },
  };
  return st;
};
