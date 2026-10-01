/* liard · tablero3d.js — motor del tablero vinculado al BOM (área B). Reutilizable: lo usa d-bom-3d.html y
   lo puede incluir cualquier pantalla (p. ej. m-tal-tablero.html) después de vendor/three.global.js.
   No depende de app.js ni de data.js: recibe los datos por parámetro.

   API (window.Tablero3D)
     hayWebGL()                              → true si el navegador puede abrir un contexto WebGL
     armado(tablero, lineas)                 → [{ fila, filaN, linea, l, ref, refs[], cant, mod, ancho, tipo }] (lista de armado)
     ocupacion(tablero)                      → [{ fila, n, usados, capacidad }] módulos de 18 mm por fila
     csv(filas)                              → texto CSV (separador «;», para Excel en español)
     montar(el, opts)                        → vista 3D (three.js). Devuelve un control (ver abajo)
     frente(el, opts)                        → frente 2D en SVG con cotas, sin WebGL. Mismo control (menos explotar/puerta/png)
   opts
     tablero   B.tgbt: { gabinete: { alto, ancho, prof } (mm), filas: [{ n, items: [{ linea, cant, mod, ref }] }] }
     lineas    B.lineas (usa id, mat, spec, tipo, estado)
     gabinete  id de la línea del BOM que es el gabinete (opcional, p. ej. 'l18'): al tocar la envolvente se selecciona
     color     'estado' (lista/reparos/bloquea) | 'compra'
     compra    { [lineaId]: 'CONFIRMED' | 'SENT' | 'NONE' | 'SIN' } (para color 'compra')
     onSeleccion(lineaId | null, ref)        al tocar un aparato (o la envolvente)
     etiquetas true (default) · puerta 'abierta' (default) | 'cerrada' · titulo texto de la placa de la puerta
   control
     seleccionar(lineaId | null) · aislar(familia | null) · explotar(bool) · puerta(bool abierta) · cotas(bool)
     color('estado' | 'compra', compra?) · reiniciar() · rotar(dAzimut, dPolar) · zoom(factor) · png() → dataURL
     actualizar(lineas) (re-pinta estados) · destruir()
   Rendimiento: no hay bucle continuo. Se dibuja un cuadro cuando la cámara cambia, cuando hay una animación en curso
   o cuando cambia la selección; quieto, no consume GPU. Respeta prefers-reduced-motion (las transiciones son instantáneas).
   Teclado (el lienzo es enfocable): ← → giran, ↑ ↓ inclinan, + − acercan, 0 reinicia. */
(function () {
  const MOD = 18; // mm por módulo DIN
  const FAMILIAS = {
    MOLDED_CASE_BREAKER: 'Caja moldeada', THERMOMAGNETIC_BREAKER: 'Termomagnéticas', RESIDUAL_CURRENT_BREAKER: 'Diferenciales',
    CURRENT_SENSOR: 'Medición', MULTIFUNCTION_METER: 'Medición', SURGE_PROTECTION_DEVICE: 'Protección', PILOT_LIGHT: 'Señalización',
    SELECTOR_SWITCH: 'Señalización', TERMINAL_BLOCK: 'Borneras', CONTACTOR: 'Maniobra', MOTOR_PROTECTION_BREAKER: 'Maniobra',
  };
  const COL = { ready: '#10b981', warning: '#f59e0b', blocked: '#e11d48', CONFIRMED: '#15803d', SENT: '#d97706', NONE: '#e11d48', SIN: '#94a3b8', REJECTED: '#b91c1c', EXPIRED: '#6b7280' };
  const SEL = '#0058BE';
  const reduce = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Medidas por tipo (mm): alto y profundidad del cuerpo
  function dim(tipo, mod) {
    switch (tipo) {
      case 'MOLDED_CASE_BREAKER': return mod >= 14 ? { h: 300, d: 125 } : { h: 220, d: 100 };
      case 'MULTIFUNCTION_METER': return { h: 96, d: 70 };
      case 'CURRENT_SENSOR': return { h: 54, d: 40, aro: true };
      case 'PILOT_LIGHT': case 'SELECTOR_SWITCH': return { h: 40, d: 48, cil: true };
      case 'TERMINAL_BLOCK': return { h: 62, d: 46 };
      default: return { h: 90, d: 72 };
    }
  }

  function expandir(ref, cant) {
    const m = String(ref).match(/^([A-Z]+)(\d+)[–-]([A-Z]*)(\d+)$/);
    if (m) { const out = []; for (let i = +m[2]; i <= +m[4]; i++) out.push(m[1] + i); if (out.length === cant) return out; }
    if (cant === 1) return [ref];
    return Array.from({ length: cant }, (_, i) => ref + ':' + (i + 1));
  }

  function armado(t, lineas) {
    const by = Object.fromEntries((lineas || []).map(l => [l.id, l]));
    const out = [];
    t.filas.forEach((f, i) => f.items.forEach(it => {
      const l = by[it.linea] || { id: it.linea, mat: it.linea, spec: '', estado: 'ready' };
      out.push({ fila: i + 1, filaN: f.n, linea: it.linea, l, ref: it.ref, refs: expandir(it.ref, it.cant), cant: it.cant, mod: it.mod, ancho: it.mod * it.cant, tipo: l.tipo });
    }));
    return out;
  }
  function capacidad(t) { return Math.floor((t.gabinete.ancho - 100) / MOD); }
  function ocupacion(t) {
    const cap = capacidad(t);
    return t.filas.map((f, i) => ({ fila: i + 1, n: f.n, usados: f.items.reduce((a, it) => a + it.mod * it.cant, 0), capacidad: cap }));
  }
  function csv(filas) {
    const q = v => { const s = String(v ?? ''); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
    const head = ['Fila', 'Ubicación', 'Referencias', 'Material', 'Especificación', 'Línea del BOM', 'Cantidad', 'Módulos c/u', 'Módulos total'];
    return '﻿' + [head].concat(filas.map(r => [r.fila, r.filaN, r.ref, r.l.mat, r.l.spec, r.linea, r.cant, r.mod, r.ancho])).map(r => r.map(q).join(';')).join('\n');
  }

  // Disposición vertical (mm desde abajo) de cada fila
  function layout(t) {
    const H = t.gabinete.alto;
    const filas = t.filas.map(f => {
      const hmax = Math.max(...f.items.map(it => dim((it._tipo || ''), it.mod).h));
      return { hmax, alto: hmax + 120 };
    });
    const suma = filas.reduce((a, f) => a + f.alto, 0);
    const gap = Math.max(20, (H - 120 - suma) / (filas.length + 1));
    let y = H - 60 - gap;
    return filas.map(f => { const top = y; y -= f.alto + gap; return { ...f, centro: top - f.alto / 2, top, base: top - f.alto }; });
  }
  function conTipos(t, lineas) {
    const by = Object.fromEntries((lineas || []).map(l => [l.id, l]));
    return { ...t, filas: t.filas.map(f => ({ ...f, items: f.items.map(it => ({ ...it, _tipo: (by[it.linea] || {}).tipo })) })) };
  }

  const enTablero = (t, id) => !!id && t.filas.some(f => f.items.some(i => i.linea === id));
  function hayWebGL() {
    try { const c = document.createElement('canvas'); return !!(window.WebGLRenderingContext && (c.getContext('webgl2') || c.getContext('webgl'))); } catch (e) { return false; }
  }

  function colorDe(l, modo, compra) {
    if (modo === 'compra') return COL[(compra || {})[l.id] || 'SIN'] || COL.SIN;
    return COL[l.estado] || COL.ready;
  }

  // =====================================================================================
  // 3D
  // =====================================================================================
  function montar(el, opts) {
    const T = window.THREE;
    if (!T || !hayWebGL()) throw new Error('Sin WebGL');
    const o = Object.assign({ color: 'estado', compra: {}, etiquetas: true, puerta: 'abierta', titulo: '' }, opts);
    const tab = conTipos(o.tablero, o.lineas);
    let lineas = o.lineas.slice();
    const lin = id => lineas.find(l => l.id === id) || { id, estado: 'ready' };
    const G = tab.gabinete, W = G.ancho / 1000, H = G.alto / 1000, D = G.prof / 1000;
    const mm = v => v / 1000;

    el.classList.add('t3d');
    const renderer = new T.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor('#f3f4f8');
    if (T.SRGBColorSpace) renderer.outputColorSpace = T.SRGBColorSpace;
    const cv = renderer.domElement;
    cv.tabIndex = 0; cv.setAttribute('role', 'application');
    cv.setAttribute('aria-label', 'Vista 3D del tablero. Flechas para girar, más y menos para acercar, cero para reiniciar. Tocá un aparato para ver su línea del BOM.');
    el.appendChild(cv);
    const tip = document.createElement('div'); tip.className = 't3d-tip'; tip.hidden = true; el.appendChild(tip);

    const scene = new T.Scene();
    const camera = new T.PerspectiveCamera(32, 1, 0.05, 50);
    const target = new T.Vector3(0, H / 2, 0);
    const HOME = new T.Vector3(1.25, H * 0.72, 3.55);
    camera.position.copy(HOME);
    const controls = new T.OrbitControls(camera, cv);
    controls.target.copy(target); controls.enableDamping = false;
    controls.minDistance = 0.8; controls.maxDistance = 7; controls.maxPolarAngle = Math.PI * 0.55;
    controls.update();

    scene.add(new T.HemisphereLight('#ffffff', '#d5dae3', 1.6));
    const sun = new T.DirectionalLight('#ffffff', 1.5); sun.position.set(2.2, 3.4, 3.2); scene.add(sun);
    const fill = new T.DirectionalLight('#ffffff', 0.7); fill.position.set(-2.5, 1.2, 2.5); scene.add(fill);

    // Piso
    const piso = new T.Mesh(new T.CircleGeometry(2.6, 48), new T.MeshStandardMaterial({ color: '#e7e9f0', roughness: 1 }));
    piso.rotation.x = -Math.PI / 2; piso.position.y = -0.101; scene.add(piso);
    const sombra = new T.Mesh(new T.PlaneGeometry(W * 1.15, D * 1.4), new T.MeshBasicMaterial({ color: '#c9cdd8', transparent: true, opacity: 0.55 }));
    sombra.rotation.x = -Math.PI / 2; sombra.position.y = -0.1; scene.add(sombra);

    const picks = []; // mallas que se pueden tocar
    const unidades = []; // { mesh, mat, linea, ref, fila, fam, label }
    const mats = { chapa: new T.MeshStandardMaterial({ color: '#d7d9de', roughness: 0.62, metalness: 0.15 }) };

    // Gabinete (RAL 7035) sobre zócalo de 100 mm
    const gab = new T.Group(); scene.add(gab);
    const chapaMat = mats.chapa.clone();
    const panel = (w, h, d, x, y, z) => { const m = new T.Mesh(new T.BoxGeometry(w, h, d), chapaMat); m.position.set(x, y, z); m.userData = { linea: o.gabinete, ref: 'Gabinete' }; gab.add(m); picks.push(m); return m; };
    const e = 0.015;
    panel(W, H, e, 0, H / 2, -D / 2 + e / 2);           // fondo
    panel(e, H, D, -W / 2 + e / 2, H / 2, 0);            // lateral izquierdo
    panel(e, H, D, W / 2 - e / 2, H / 2, 0);             // lateral derecho
    panel(W, e, D, 0, H - e / 2, 0);                     // techo
    panel(W, e, D, 0, e / 2, 0);                         // piso del gabinete
    const zocalo = new T.Mesh(new T.BoxGeometry(W, 0.1, D), new T.MeshStandardMaterial({ color: '#3a3f4a', roughness: 0.8 }));
    zocalo.position.set(0, -0.05, 0); gab.add(zocalo);
    // Placa de montaje
    const placa = new T.Mesh(new T.BoxGeometry(W - 0.07, H - 0.1, 0.004), new T.MeshStandardMaterial({ color: '#c3c8d0', roughness: 0.5, metalness: 0.35 }));
    const zPlaca = -D / 2 + 0.03; placa.position.set(0, H / 2, zPlaca); gab.add(placa);
    // Canales verticales
    [-1, 1].forEach(s => { const c = new T.Mesh(new T.BoxGeometry(0.04, H - 0.18, 0.06), new T.MeshStandardMaterial({ color: '#99a1b0', roughness: 0.85 })); c.position.set(s * (W / 2 - 0.045), H / 2, zPlaca + 0.032); gab.add(c); });

    // Etiquetas (sprites con texto)
    function sprite(texto, { alto = 0.03, fondo = 'rgba(255,255,255,.92)', tinta = '#0f172a', borde = '#cbd5e1', mono = true, peso = 600 } = {}) {
      const c = document.createElement('canvas'); const x = c.getContext('2d');
      const fs = 44; const font = `${peso} ${fs}px ${mono ? "'JetBrains Mono', ui-monospace, monospace" : "'Inter', system-ui, sans-serif"}`;
      x.font = font; const w = Math.ceil(x.measureText(texto).width) + 28; c.width = w; c.height = fs + 22;
      x.font = font; x.fillStyle = fondo; x.strokeStyle = borde; x.lineWidth = 3;
      const r = 12; x.beginPath(); x.moveTo(r, 1.5); x.lineTo(w - r, 1.5); x.quadraticCurveTo(w - 1.5, 1.5, w - 1.5, r); x.lineTo(w - 1.5, c.height - r); x.quadraticCurveTo(w - 1.5, c.height - 1.5, w - r, c.height - 1.5); x.lineTo(r, c.height - 1.5); x.quadraticCurveTo(1.5, c.height - 1.5, 1.5, c.height - r); x.lineTo(1.5, r); x.quadraticCurveTo(1.5, 1.5, r, 1.5); x.fill(); if (borde) x.stroke();
      x.fillStyle = tinta; x.textBaseline = 'middle'; x.fillText(texto, 14, c.height / 2 + 2);
      const tex = new T.CanvasTexture(c); if (T.SRGBColorSpace) tex.colorSpace = T.SRGBColorSpace; tex.anisotropy = 4;
      const s = new T.Sprite(new T.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
      s.scale.set(alto * c.width / c.height, alto, 1); s.renderOrder = 5; return s;
    }

    // Filas
    const lay = layout(tab);
    const filas = [];
    const xIni = -W / 2 + 0.07;
    tab.filas.forEach((f, fi) => {
      const g = new T.Group(); g.userData.base = { y: 0, z: 0 }; scene.add(g);
      const L = lay[fi];
      const yRiel = mm(L.centro);
      // Riel DIN y canal horizontal debajo
      const riel = new T.Mesh(new T.BoxGeometry(W - 0.14, 0.035, 0.0075), new T.MeshStandardMaterial({ color: '#b9c0ca', metalness: 0.7, roughness: 0.35 }));
      riel.position.set(0, yRiel, zPlaca + 0.006); g.add(riel);
      const canal = new T.Mesh(new T.BoxGeometry(W - 0.14, 0.04, 0.06), new T.MeshStandardMaterial({ color: '#99a1b0', roughness: 0.85 }));
      canal.position.set(0, mm(L.base) + 0.03, zPlaca + 0.032); g.add(canal);
      let x = xIni;
      f.items.forEach((it, ii) => {
        const l = lin(it.linea);
        const dm = dim(l.tipo, it.mod);
        const w = mm(it.mod * MOD), h = mm(dm.h), d = mm(dm.d);
        const refs = expandir(it.ref, it.cant);
        refs.forEach((ref, k) => {
          const mat = new T.MeshStandardMaterial({ color: '#ffffff', roughness: 0.55, metalness: 0.05, transparent: true, opacity: 1 });
          let mesh;
          if (dm.aro) { mesh = new T.Mesh(new T.TorusGeometry(Math.min(w, h) * 0.36, Math.min(w, h) * 0.12, 12, 28), mat); mesh.position.set(x + w / 2, yRiel, zPlaca + 0.03); }
          else if (dm.cil) { mesh = new T.Mesh(new T.CylinderGeometry(0.011, 0.011, d, 20), mat); mesh.rotation.x = Math.PI / 2; mesh.position.set(x + w / 2, yRiel, zPlaca + d / 2 + 0.004); }
          else { mesh = new T.Mesh(new T.BoxGeometry(w - 0.0012, h, d), mat); mesh.position.set(x + w / 2, yRiel, zPlaca + d / 2 + 0.004); }
          mesh.userData = { linea: it.linea, ref, fila: fi };
          g.add(mesh); picks.push(mesh);
          // Detalle frontal (palanca / pantalla / tapa)
          const det = new T.MeshStandardMaterial({ color: '#2b303b', roughness: 0.6 });
          let frente = null;
          if (l.tipo === 'MULTIFUNCTION_METER') { frente = new T.Mesh(new T.BoxGeometry(w * 0.7, h * 0.5, 0.002), new T.MeshStandardMaterial({ color: '#1d3b2f', emissive: '#0d2a1e', roughness: 0.3 })); frente.position.set(x + w / 2, yRiel + h * 0.08, zPlaca + d + 0.006); }
          else if (l.tipo === 'MOLDED_CASE_BREAKER') { frente = new T.Mesh(new T.BoxGeometry(w * 0.22, h * 0.28, 0.03), det); frente.position.set(x + w / 2, yRiel, zPlaca + d + 0.018); }
          else if (l.tipo === 'PILOT_LIGHT') { frente = new T.Mesh(new T.CylinderGeometry(0.0095, 0.0095, 0.006, 20), new T.MeshStandardMaterial({ color: '#dc2626', emissive: '#7f1d1d', roughness: 0.3 })); frente.rotation.x = Math.PI / 2; frente.position.set(x + w / 2, yRiel, zPlaca + d + 0.008); }
          else if (!dm.aro && l.tipo !== 'TERMINAL_BLOCK') { frente = new T.Mesh(new T.BoxGeometry(Math.max(0.006, w * 0.3), 0.018, 0.014), det); frente.position.set(x + w / 2, yRiel + h * 0.06, zPlaca + d + 0.011); }
          if (frente) { frente.userData = mesh.userData; g.add(frente); picks.push(frente); }
          let label = null;
          const grupo = l.tipo === 'TERMINAL_BLOCK' || (it.cant > 1 && it.mod * MOD < 60);
          if (o.etiquetas && (!grupo || k === 0)) {
            const txt = l.tipo === 'TERMINAL_BLOCK' ? it.ref + ' · ' + it.cant + ' bornes' : grupo ? it.ref : ref;
            label = sprite(txt, { alto: l.tipo === 'MOLDED_CASE_BREAKER' ? 0.05 : 0.04 });
            const lx = grupo ? x + mm(it.mod * MOD * it.cant) / 2 : x + w / 2;
            label.position.set(lx, yRiel + h / 2 + 0.024, zPlaca + d + 0.02);
            g.add(label);
          }
          unidades.push({ mesh, mat, frente, linea: it.linea, ref, fila: fi, fam: FAMILIAS[l.tipo] || 'Otros', label });
          x += w;
        });
        x += mm(MOD) * 0.6;
      });
      filas.push(g);
    });

    // Puerta (bisagra a la izquierda) con placa de identificación
    const bisagra = new T.Group(); bisagra.position.set(-W / 2, H / 2, D / 2); scene.add(bisagra);
    const puertaMat = new T.MeshStandardMaterial({ color: '#d4d7dd', roughness: 0.6, metalness: 0.15, transparent: true, opacity: 1 });
    const hoja = new T.Mesh(new T.BoxGeometry(W, H, 0.02), puertaMat); hoja.position.set(W / 2, 0, 0.01); bisagra.add(hoja);
    hoja.userData = { linea: o.gabinete, ref: 'Puerta' }; picks.push(hoja);
    const manija = new T.Mesh(new T.BoxGeometry(0.025, 0.16, 0.03), new T.MeshStandardMaterial({ color: '#2b303b' })); manija.position.set(W - 0.06, 0, 0.035); bisagra.add(manija);
    const placaPuerta = []; if (o.titulo) { const pl = sprite(o.titulo, { alto: 0.05, mono: false, peso: 700 }); pl.position.set(W / 2, H / 2 - 0.16, 0.03); bisagra.add(pl); placaPuerta.push(pl); }
    const riesgo = sprite('Riesgo eléctrico', { alto: 0.04, fondo: '#facc15', tinta: '#111827', borde: '#111827', mono: false, peso: 700 }); riesgo.position.set(W / 2, H / 2 - 0.26, 0.03); bisagra.add(riesgo); placaPuerta.push(riesgo);
    const ABIERTA = -1.95;
    bisagra.rotation.y = o.puerta === 'cerrada' ? 0 : ABIERTA;

    // Cotas
    const cotas = new T.Group(); cotas.visible = false; scene.add(cotas);
    const lmat = new T.LineBasicMaterial({ color: '#0058BE' });
    function cota(a, b, txt, off) {
      const pts = [a, b]; const g = new T.BufferGeometry().setFromPoints(pts.map(p => new T.Vector3(...p)));
      cotas.add(new T.Line(g, lmat));
      const s = sprite(txt, { alto: 0.045, tinta: '#0058BE', borde: '#93c5fd' }); s.position.set((a[0] + b[0]) / 2 + off[0], (a[1] + b[1]) / 2 + off[1], (a[2] + b[2]) / 2 + off[2]); cotas.add(s);
      [a, b].forEach(p => { const t = new T.Mesh(new T.SphereGeometry(0.008, 8, 8), new T.MeshBasicMaterial({ color: '#0058BE' })); t.position.set(...p); cotas.add(t); });
    }
    cota([-W / 2, -0.14, D / 2 + 0.06], [W / 2, -0.14, D / 2 + 0.06], G.ancho + ' mm', [0, -0.05, 0]);
    cota([-W / 2 - 0.08, 0, D / 2], [-W / 2 - 0.08, H, D / 2], G.alto + ' mm', [-0.1, 0, 0]);
    cota([W / 2 + 0.06, -0.14, -D / 2], [W / 2 + 0.06, -0.14, D / 2], G.prof + ' mm', [0.12, -0.04, 0]);
    ocupacion(tab).forEach((oc, i) => { const s = sprite(`${oc.usados}/${oc.capacidad} mód.`, { alto: 0.026, tinta: oc.usados / oc.capacidad > 0.85 ? '#b45309' : '#334155' }); s.position.set(W / 2 + 0.1, mm(lay[i].centro), zPlaca + 0.05); s.userData.fila = i; cotas.add(s); });

    // ---------- Estado visual ----------
    const st = { sel: null, fam: null, exp: false, abierta: o.puerta !== 'cerrada', modo: o.color, compra: o.compra || {} };
    const cSel = new T.Color(SEL), cTmp = new T.Color(), cBlanco = new T.Color('#f8fafc');
    function pintar() {
      const hay = enTablero(tab, st.sel);
      unidades.forEach(u => {
        const l = lin(u.linea);
        cTmp.set(colorDe(l, st.modo, st.compra));
        const enFam = !st.fam || u.fam === st.fam;
        const esSel = st.sel && u.linea === st.sel;
        u.mat.color.copy(cBlanco).lerp(cTmp, esSel ? 0.0 : 0.55);
        if (esSel) u.mat.color.copy(cSel).lerp(cBlanco, 0.25);
        u.mat.emissive = u.mat.emissive || new T.Color(); u.mat.emissive.set(esSel ? '#0b3b82' : '#000000'); u.mat.emissiveIntensity = esSel ? 0.5 : 0;
        const op = !enFam ? 0.07 : (hay && !esSel ? 0.32 : 1);
        u.mat.opacity = op; u.mat.depthWrite = op > 0.9;
        if (u.frente) { u.frente.visible = op > 0.2; }
        if (u.label) { u.label.visible = enFam && (!hay || esSel || op > 0.5); u.label.material.opacity = hay && !esSel ? 0.35 : 1; }
      });
      const gSel = st.sel && st.sel === o.gabinete;
      chapaMat.color.set(gSel ? '#9ec3f0' : '#d7d9de');
      chapaMat.emissive = chapaMat.emissive || new T.Color(); chapaMat.emissive.set(gSel ? '#0b3b82' : '#000000'); chapaMat.emissiveIntensity = gSel ? 0.25 : 0;
      puertaMat.opacity = 1;
      placaPuerta.forEach(p => { p.visible = !st.abierta; p.material.depthTest = false; });
      dibujar();
    }
    function mixHex(a, b, t) { return '#' + new T.Color(a).lerp(new T.Color(b), t).getHexString(); }

    // ---------- Render a pedido + animaciones ----------
    let pend = false, vivo = true; const tweens = [];
    function dibujar() { if (pend || !vivo) return; pend = true; requestAnimationFrame(() => { pend = false; if (vivo) renderer.render(scene, camera); }); }
    function animar(obj, prop, hasta, ms = 420) {
      const desde = prop.split('.').reduce((a, k) => a[k], obj);
      const set = v => { const ks = prop.split('.'); const last = ks.pop(); ks.reduce((a, k) => a[k], obj)[last] = v; };
      if (reduce() || ms === 0) { set(hasta); dibujar(); return; }
      tweens.push({ set, desde, hasta, t0: performance.now(), ms });
      if (tweens.length === 1) requestAnimationFrame(tick);
    }
    const ease = t => 1 - Math.pow(1 - t, 4); // --ease-out-quart, cerca de --ease-out-expo
    function tick(now) {
      if (!vivo) return;
      for (let i = tweens.length - 1; i >= 0; i--) { const tw = tweens[i]; const p = Math.min(1, (now - tw.t0) / tw.ms); tw.set(tw.desde + (tw.hasta - tw.desde) * ease(p)); if (p >= 1) tweens.splice(i, 1); }
      controls.update(); renderer.render(scene, camera);
      if (tweens.length) requestAnimationFrame(tick);
    }
    controls.addEventListener('change', dibujar);

    // Tamaño
    function medir() { const r = el.getBoundingClientRect(); const w = Math.max(200, r.width), h = Math.max(200, r.height); renderer.setSize(w, h, false); cv.style.width = w + 'px'; cv.style.height = h + 'px'; camera.aspect = w / h; camera.updateProjectionMatrix(); dibujar(); }
    const ro = window.ResizeObserver ? new ResizeObserver(medir) : null; if (ro) ro.observe(el); medir();

    // ---------- Selección con el puntero ----------
    const ray = new T.Raycaster(), ptr = new T.Vector2();
    function tocar(ev) {
      const r = cv.getBoundingClientRect(); ptr.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ptr, camera);
      const hits = ray.intersectObjects(picks, false).filter(h => { const u = unidades.find(x => x.mesh === h.object || x.frente === h.object); return !u || u.mat.opacity > 0.2; }).filter(h => h.object.visible && (h.object !== hoja || !st.abierta));
      return hits[0] ? hits[0].object.userData : null;
    }
    let down = null;
    cv.addEventListener('pointerdown', e => { down = [e.clientX, e.clientY]; });
    cv.addEventListener('pointerup', e => {
      if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 5) return; down = null;
      const u = tocar(e);
      if (u && u.linea) { api.seleccionar(u.linea === st.sel ? null : u.linea); o.onSeleccion && o.onSeleccion(st.sel, u.ref); }
      else { api.seleccionar(null); o.onSeleccion && o.onSeleccion(null); }
    });
    cv.addEventListener('pointermove', e => {
      if (e.buttons) { tip.hidden = true; return; }
      const u = tocar(e); cv.style.cursor = u && u.linea ? 'pointer' : 'grab';
      if (u && u.linea) { const l = lin(u.linea); tip.innerHTML = `<b>${esc(u.ref)}</b> ${esc(l.mat || '')}<small>${esc(l.spec || '')}</small>`; tip.hidden = false; const r = el.getBoundingClientRect(); tip.style.left = Math.min(r.width - 220, e.clientX - r.left + 14) + 'px'; tip.style.top = (e.clientY - r.top + 14) + 'px'; }
      else tip.hidden = true;
    });
    cv.addEventListener('pointerleave', () => { tip.hidden = true; });
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

    // ---------- Teclado ----------
    function rotar(dA, dP) {
      const off = camera.position.clone().sub(controls.target);
      const sph = new T.Spherical().setFromVector3(off);
      sph.theta += dA; sph.phi = Math.max(0.15, Math.min(controls.maxPolarAngle, sph.phi + dP));
      off.setFromSpherical(sph); camera.position.copy(controls.target).add(off); controls.update(); dibujar();
    }
    function zoom(f) { const off = camera.position.clone().sub(controls.target); const d = Math.max(controls.minDistance, Math.min(controls.maxDistance, off.length() * f)); off.setLength(d); camera.position.copy(controls.target).add(off); controls.update(); dibujar(); }
    cv.addEventListener('keydown', e => {
      const k = e.key; let ok = true;
      if (k === 'ArrowLeft') rotar(-0.14, 0); else if (k === 'ArrowRight') rotar(0.14, 0);
      else if (k === 'ArrowUp') rotar(0, -0.08); else if (k === 'ArrowDown') rotar(0, 0.08);
      else if (k === '+' || k === '=') zoom(0.88); else if (k === '-' || k === '_') zoom(1.13);
      else if (k === '0') api.reiniciar(); else ok = false;
      if (ok) e.preventDefault();
    });

    // ---------- Control ----------
    const api = {
      seleccionar(id) { st.sel = id || null; pintar(); },
      aislar(fam) { st.fam = fam || null; pintar(); },
      explotar(on) {
        st.exp = !!on; if (st.exp && !st.abierta) api.puerta(true);
        const n = filas.length;
        filas.forEach((g, i) => { animar(g, 'position.z', st.exp ? 0.16 + i * 0.075 : 0); animar(g, 'position.y', st.exp ? ((n - 1) / 2 - i) * 0.055 : 0); });
        cotas.children.forEach(c => { if (c.userData.fila != null) { const i = c.userData.fila; animar(c, 'position.z', zPlaca + 0.05 + (st.exp ? 0.16 + i * 0.075 : 0)); } });
      },
      puerta(abierta) { st.abierta = !!abierta; animar(bisagra, 'rotation.y', st.abierta ? ABIERTA : 0, 520); pintar(); },
      cotas(on) { cotas.visible = !!on; dibujar(); },
      color(modo, compra) { st.modo = modo; if (compra) st.compra = compra; pintar(); },
      reiniciar() { animar(camera.position, 'x', HOME.x); animar(camera.position, 'y', HOME.y); animar(camera.position, 'z', HOME.z); controls.target.copy(target); dibujar(); },
      rotar, zoom,
      png() { renderer.render(scene, camera); return cv.toDataURL('image/png'); },
      actualizar(ls) { lineas = ls.slice(); pintar(); },
      estado() { return { ...st }; },
      destruir() { vivo = false; ro && ro.disconnect(); controls.dispose(); renderer.dispose(); el.innerHTML = ''; el.classList.remove('t3d'); },
      lienzo: cv,
    };
    pintar();
    return api;
  }

  // =====================================================================================
  // Frente 2D (SVG). Mismos datos y la misma selección, sin WebGL.
  // =====================================================================================
  function frente(el, opts) {
    const o = Object.assign({ color: 'estado', compra: {}, cotas: true }, opts);
    const tab = conTipos(o.tablero, o.lineas);
    let lineas = o.lineas.slice();
    const lin = id => lineas.find(l => l.id === id) || { id, estado: 'ready' };
    const G = tab.gabinete; const lay = layout(tab); const occ = ocupacion(tab);
    const st = { sel: null, fam: null, modo: o.color, compra: o.compra || {}, cotas: o.cotas };
    const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    function dibujar() {
      const PAD = { l: 150, r: 170, t: 50, b: 150 };
      const vw = G.ancho + PAD.l + PAD.r, vh = G.alto + PAD.t + PAD.b + 100;
      const Y = y => PAD.t + (G.alto - y); // y desde abajo
      let s = `<svg class="t2d" viewBox="0 0 ${vw} ${vh}" role="group" aria-label="Frente del tablero con cotas">`;
      s += `<defs><pattern id="t2d-h" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><line x1="0" y1="0" x2="0" y2="10" stroke="#cbd5e1" stroke-width="3"/></pattern></defs>`;
      const gSel = st.sel && st.sel === o.gabinete;
      s += `<g class="t2d-gab${gSel ? ' sel' : ''}" ${o.gabinete ? `data-linea="${o.gabinete}" tabindex="0" role="button" aria-label="Gabinete ${G.alto}×${G.ancho}×${G.prof} mm"` : ''}><rect x="${PAD.l}" y="${PAD.t}" width="${G.ancho}" height="${G.alto}" rx="6" class="t2d-env" style="${o.gabinete && st.modo === 'estado' ? `stroke:${colorDe(lin(o.gabinete), st.modo, st.compra)}` : ''}"/>`;
      s += `<rect x="${PAD.l + 35}" y="${PAD.t + 50}" width="${G.ancho - 70}" height="${G.alto - 100}" class="t2d-placa"/></g>`;
      s += `<rect x="${PAD.l}" y="${PAD.t + G.alto}" width="${G.ancho}" height="100" class="t2d-zoc"/>`;
      tab.filas.forEach((f, fi) => {
        const L = lay[fi];
        const yc = Y(L.centro);
        s += `<rect x="${PAD.l + 70}" y="${yc - 17}" width="${G.ancho - 140}" height="35" class="t2d-riel"/>`;
        s += `<rect x="${PAD.l + 70}" y="${Y(L.base) - 70}" width="${G.ancho - 140}" height="40" fill="url(#t2d-h)" class="t2d-canal"/>`;
        let x = PAD.l + 70;
        f.items.forEach(it => {
          const l = lin(it.linea); const dm = dim(l.tipo, it.mod);
          const w = it.mod * MOD, wt = w * it.cant;
          const grupo = l.tipo === 'TERMINAL_BLOCK' || (it.cant > 1 && w < 60) || (w < 80 && it.ref.length > 3);
          const enFam = !st.fam || (FAMILIAS[l.tipo] || 'Otros') === st.fam; const esSel = st.sel === it.linea;
          const cls = 't2d-it' + (esSel ? ' sel' : '') + (!enFam ? ' fuera' : '') + (enTablero(tab, st.sel) && !esSel ? ' atenuado' : '');
          const col = colorDe(l, st.modo, st.compra);
          s += `<g class="${cls}" data-linea="${it.linea}" tabindex="0" role="button" aria-pressed="${esSel}" aria-label="${esc(it.ref + ' · ' + (l.mat || '') + ' ' + (l.spec || ''))}">`;
          expandir(it.ref, it.cant).forEach((ref, k) => {
            const xx = x + k * w;
            if (dm.cil) s += `<circle cx="${xx + w / 2}" cy="${yc}" r="12" style="fill:${col}" class="t2d-b"/><circle cx="${xx + w / 2}" cy="${yc}" r="7" fill="#dc2626"/>`;
            else if (dm.aro) s += `<circle cx="${xx + w / 2}" cy="${yc}" r="${Math.min(w, dm.h) * 0.4}" class="t2d-b" style="fill:none;stroke:${col};stroke-width:8"/>`;
            else s += `<rect x="${xx + 0.6}" y="${yc - dm.h / 2}" width="${w - 1.2}" height="${dm.h}" rx="3" class="t2d-b" style="fill:${col}"/>`;
            if (l.tipo === 'MULTIFUNCTION_METER') s += `<rect x="${xx + w * 0.15}" y="${yc - dm.h * 0.25}" width="${w * 0.7}" height="${dm.h * 0.45}" fill="#1d3b2f"/>`;
            else if (!dm.cil && !dm.aro && l.tipo !== 'TERMINAL_BLOCK') s += `<rect x="${xx + w * 0.38}" y="${yc - 9}" width="${w * 0.24}" height="${l.tipo === 'MOLDED_CASE_BREAKER' ? 60 : 18}" rx="2" fill="#2b303b"/>`;
            if (!grupo) s += `<text x="${xx + w / 2}" y="${yc - dm.h / 2 - 14}" class="t2d-ref">${esc(ref)}</text>`;
          });
          if (grupo) s += `<text x="${x + wt / 2}" y="${yc - dm.h / 2 - 14}" class="t2d-ref">${esc(it.ref)}${l.tipo === 'TERMINAL_BLOCK' ? ' · ' + it.cant + ' bornes' : ''}</text>`;
          s += `</g>`;
          x += wt + MOD * 0.6;
        });
        s += `<text x="${PAD.l - 16}" y="${yc + 6}" class="t2d-fila">${fi + 1}</text>`;
        if (st.cotas) { const oc = occ[fi]; s += `<text x="${PAD.l + G.ancho + 18}" y="${yc + 6}" class="t2d-occ${oc.usados / oc.capacidad > 0.85 ? ' alto' : ''}">${oc.usados}/${oc.capacidad} mód.</text>`; }
      });
      if (st.cotas) {
        const yb = PAD.t + G.alto + 150;
        s += `<g class="t2d-cota"><line x1="${PAD.l}" y1="${yb}" x2="${PAD.l + G.ancho}" y2="${yb}"/><line x1="${PAD.l}" y1="${yb - 14}" x2="${PAD.l}" y2="${yb + 14}"/><line x1="${PAD.l + G.ancho}" y1="${yb - 14}" x2="${PAD.l + G.ancho}" y2="${yb + 14}"/><text x="${PAD.l + G.ancho / 2}" y="${yb - 14}">${G.ancho} mm</text></g>`;
        const xl = PAD.l - 70;
        s += `<g class="t2d-cota"><line x1="${xl}" y1="${PAD.t}" x2="${xl}" y2="${PAD.t + G.alto}"/><line x1="${xl - 14}" y1="${PAD.t}" x2="${xl + 14}" y2="${PAD.t}"/><line x1="${xl - 14}" y1="${PAD.t + G.alto}" x2="${xl + 14}" y2="${PAD.t + G.alto}"/><text transform="translate(${xl - 18} ${PAD.t + G.alto / 2}) rotate(-90)">${G.alto} mm</text></g>`;
        s += `<text x="${PAD.l + G.ancho / 2}" y="${yb + 52}" class="t2d-nota">Profundidad ${G.prof} mm · módulo DIN de ${MOD} mm · zócalo 100 mm</text>`;
      }
      s += `</svg>`;
      el.innerHTML = s;
    }
    el.classList.add('t2d-wrap');
    el.addEventListener('click', e => { const g = e.target.closest('[data-linea]'); const id = g ? g.dataset.linea : null; api.seleccionar(id && id === st.sel ? null : id); o.onSeleccion && o.onSeleccion(st.sel); });
    el.addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.closest('[data-linea]')) { e.preventDefault(); e.target.closest('[data-linea]').dispatchEvent(new MouseEvent('click', { bubbles: true })); } });
    const api = {
      seleccionar(id) { const foco = document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-linea]'); const fid = foco && foco.dataset.linea; st.sel = id || null; dibujar(); if (fid) { const n = el.querySelector(`[data-linea="${fid}"]`); n && n.focus(); } },
      aislar(f) { st.fam = f || null; dibujar(); },
      cotas(on) { st.cotas = !!on; dibujar(); },
      color(m, c) { st.modo = m; if (c) st.compra = c; dibujar(); },
      explotar() {}, puerta() {}, reiniciar() {}, rotar() {}, zoom() {},
      png() { return null; },
      svg() { return el.querySelector('svg').outerHTML; },
      actualizar(ls) { lineas = ls.slice(); dibujar(); },
      estado() { return { ...st }; },
      destruir() { el.innerHTML = ''; },
    };
    dibujar();
    return api;
  }

  window.Tablero3D = { hayWebGL, armado, ocupacion, csv, montar, frente, FAMILIAS, COLORES: COL, expandir };
})();
