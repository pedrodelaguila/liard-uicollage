/* liard · área F (plataforma) · cálculos y piezas compartidas por las pantallas d-pla-* y m-pla-*.
   Todo se calcula desde el estado (L.get) para que los números cierren con las otras áreas.
   Se carga después de data-pla.js y antes de app.js; las funciones se llaman desde MOCK.init(). */
(function () {
  const P = {};
  const HOY = '2026-10-01';
  const RM = () => window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  P.RM = RM;

  // Siembra el estado privado del área una sola vez.
  P.boot = function () {
    if (!L.get('x.pla')) L.set('x.pla', JSON.parse(JSON.stringify(BP.seed)));
    return L.get('x.pla');
  };

  P.u = id => (L.get('usuarios') || {})[id] || { n: id, ini: '?', r: '' };
  P.av = (id, cls = 'sm') => { const u = P.u(id); return `<span class="av ${cls} ${u.c || ''}" title="${L.esc(u.n)}">${L.esc(u.ini)}</span>`; };
  P.prov = id => ((L.get('proveedores') || []).find(p => p.id === id) || { n: id }).n;
  P.proy = id => (L.get('proyectos') || []).find(p => p.id === id) || { n: id };
  P.dias = (iso, desde = HOY) => Math.round((new Date(iso + 'T12:00:00') - new Date(desde + 'T12:00:00')) / 86400000);

  // ---------- Hospital Cañuelas (p1): qué falta para cotizar ----------
  P.faltantes = function () {
    const lineas = L.get('lineas') || [];
    const planos = L.get('planos') || [];
    return {
      bloquean: lineas.filter(l => l.estado === 'blocked'),
      reparos: lineas.filter(l => l.estado === 'warning'),
      listas: lineas.filter(l => l.estado === 'ready'),
      error: planos.filter(p => p.status === 'ERROR'),
      stale: planos.filter(p => p.status === 'STALE'),
      proc: planos.filter(p => p.status === 'PROCESSING'),
      pend: planos.filter(p => p.status === 'PENDING'),
      sinId: planos.reduce((a, p) => a + (p.sinId || 0), 0),
      total: lineas.length, planos,
    };
  };

  // Mejor oferta de una línea (opcional: que llegue antes de una fecha con stock suficiente)
  P.mejor = function (l, hasta, excluir = []) {
    const o = (L.get('ofertas') || {})[l.id]; if (!o) return null;
    let c = Object.entries(o).map(([prov, v]) => ({ prov, ...v })).filter(v => !excluir.includes(v.prov));
    if (hasta) { const d = P.dias(hasta); c = c.filter(v => v.plazo <= d && v.stock >= l.comprar); }
    c.sort((a, b) => a.precio - b.precio);
    return c[0] || null;
  };

  // Costo de materiales del BOM de p1 (sin IVA): lo cotizado al mejor precio + lo no cotizable a precio de referencia
  P.costo = function (hasta) {
    let cot = 0, ref = 0; const sin = [];
    (L.get('lineas') || []).forEach(l => {
      const m = P.mejor(l, hasta) || (hasta ? P.mejor(l) : null);
      if (m) cot += m.precio * l.comprar; else { ref += l.base * l.comprar; sin.push(l); }
    });
    return { cot, ref, sin, total: cot + ref };
  };

  // Presupuesto al comitente del Hospital Cañuelas: venta del proyecto, materiales, mano de obra, margen
  P.presupuesto = function (factorVenta = 1) {
    const venta = Math.round(P.proy('p1').monto * factorVenta);
    const mat = P.costo();
    const mo = BP.manoObraP1;
    const costo = mat.total + mo;
    const margen = (venta - costo) / venta;
    return { venta, mat, mo, costo, margen, ganancia: venta - costo, iva: Math.round(venta * (L.get('cambio.iva') || 21) / 100), usd: venta / (L.get('cambio.dolarBNA') || 1540) };
  };

  // Qué llega antes de una fecha
  P.llegaAntes = function (hasta, excluir = []) {
    const out = { llegan: [], noLlegan: [], sinOferta: [], delta: 0, total: 0, porProv: {} };
    (L.get('lineas') || []).forEach(l => {
      const barato = P.mejor(l);
      if (!barato) return out.sinOferta.push(l);
      const rapido = P.mejor(l, hasta, excluir);
      if (!rapido) return out.noLlegan.push({ l, barato });
      out.llegan.push({ l, of: rapido, cambia: rapido.prov !== barato.prov, barato });
      out.delta += (rapido.precio - barato.precio) * l.comprar;
      out.total += rapido.precio * l.comprar;
      const g = (out.porProv[rapido.prov] ||= { prov: rapido.prov, total: 0, lineas: [], plazo: 0 });
      g.total += rapido.precio * l.comprar; g.lineas.push(l.id); g.plazo = Math.max(g.plazo, rapido.plazo);
    });
    out.provs = Object.values(out.porProv).sort((a, b) => b.total - a.total);
    return out;
  };

  // ---------- Consumo de IA ----------
  P.consumo = function () {
    const c = L.get('consumoIA') || { topeUsd: 0, usadoUsd: 0, aviso: 0.8, areas: [], porUsuario: [] };
    const pct = c.topeUsd ? c.usadoUsd / c.topeUsd : 0;
    return { ...c, pct, enAviso: pct >= c.aviso, enTope: c.usadoUsd >= c.topeUsd - 0.005, avisoUsd: c.topeUsd * c.aviso, resta: Math.max(0, c.topeUsd - c.usadoUsd) };
  };
  // Cobra una consulta del asistente. Devuelve false si no hay saldo (no ejecuta nada).
  P.cobrar = function (usd, user, area = 'Asistente') {
    const c = P.consumo();
    if (c.usadoUsd + usd > c.topeUsd + 0.0001) return false;
    const antes = c.pct;
    L.update(s => {
      const k = s.consumoIA; k.usadoUsd = Math.round((k.usadoUsd + usd) * 100) / 100;
      const a = k.areas.find(x => x.k === area); if (a) a.usd = Math.round((a.usd + usd) * 100) / 100;
      const pu = k.porUsuario.find(x => x.u === user); if (pu) pu.usd = Math.round((pu.usd + usd) * 100) / 100;
    });
    const d = P.consumo();
    if (antes < d.aviso && d.pct >= d.aviso) P.aviso({ t: 'El consumo de IA llegó al 80 % del tope', d: `${L.usd(d.usadoUsd)} de ${L.usd(d.topeUsd)} · ${L.get('consumoIA.mes')}`, i: 'gauge', tipo: 'wa', href: 'd-pla-plan.html' });
    return true;
  };

  P.aviso = function (a) {
    L.update(s => { (s.avisos ||= []).unshift({ id: 'f' + Date.now() + Math.round(Math.random() * 99), cuando: 'recién', ...a }); });
  };

  // ---------- Medidor (barra con marca del 80 %) ----------
  P.medidor = function (c, { alto = 10 } = {}) {
    const pct = Math.min(1, c.pct);
    const cls = c.enTope ? 'bad' : c.enAviso ? 'warn' : '';
    return `<div class="pla-meter ${cls}" style="--h:${alto}px" role="img" aria-label="Consumo ${L.pct(c.pct * 100)} del tope">
      <i style="width:${(pct * 100).toFixed(1)}%"></i><b class="pla-mark" style="left:${c.aviso * 100}%" title="Aviso al ${L.pct(c.aviso * 100)}"></b></div>`;
  };

  // ---------- Texto que aparece de a poco (respeta reduced motion) ----------
  P.revelar = function (el) {
    if (RM()) return;
    const kids = [...el.children];
    kids.forEach((k, i) => { k.style.opacity = 0; k.style.transform = 'translateY(4px)'; setTimeout(() => { k.style.transition = 'opacity 200ms var(--ease-out-expo), transform 200ms var(--ease-out-expo)'; k.style.opacity = 1; k.style.transform = 'none'; }, 120 + i * 140); });
  };

  // Estado → etiqueta del plano (mismas que la app)
  P.planoSt = {
    COMPLETED: ['ok', 'circle-check', 'Listo'], PROCESSING: ['pr', 'refresh-cw', 'En proceso'], PENDING: ['gr', 'clock', 'Pendiente'],
    ERROR: ['er', 'triangle-alert', 'Error'], STALE: ['wa', 'circle-alert', 'Desactualizado'],
  };
  P.ocSt = { SENT: 'En espera', CONFIRMED: 'Confirmado', REJECTED: 'Rechazado', EXPIRED: 'Vencido' };

  // ======================================================================
  // Asistente IA: arma respuestas con los números del estado. Nunca escribe
  // en las claves de otras áreas: lo que ejecuta queda en x.pla.* y en avisos.
  // ======================================================================
  const A = {};
  P.asis = A;
  A.PREG = {
    revision: '¿Qué falta para cotizar el Hospital Cañuelas?',
    presupuesto: 'Bajá el total un 5 % sin cambiar de marca',
    compras: '¿A quién le compro si necesito todo antes del 15/10?',
  };
  A.SUG = {
    revision: ['¿Qué falta para cotizar el Hospital Cañuelas?', '¿Qué planos no terminaron?'],
    presupuesto: ['Bajá el total un 5 % sin cambiar de marca', 'Bajá el total un 3 %'],
    compras: ['¿A quién le compro si necesito todo antes del 15/10?', '¿Y si necesito todo antes del 08/10?'],
  };
  A.MODOS = { revision: ['Revisión', 'list-checks'], presupuesto: ['Presupuesto', 'file-spreadsheet'], compras: ['Compras', 'shopping-cart'] };
  A.ruta = function (q) {
    const t = (q || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    if (/compr|antes del|llega|plazo|a quien|proveedor|distribuidor/.test(t)) return 'compras';
    if (/baj|total|%|margen|presupuest|barat|precio/.test(t)) return 'presupuesto';
    if (/falta|cotizar|bloque|revis|plano|listo|simbolo/.test(t)) return 'revision';
    return null;
  };
  const src = (href, t, ic = 'arrow-up-right') => `<a class="src" href="${href}">${L.icon(ic)}${L.esc(t)}</a>`;
  const inf = t => `<span class="org inf" title="Inferido: no sale de un dato, confirmalo">${L.icon('sparkles')}inferido</span> <span class="muted">${t}</span>`;
  const planoDe = cod => (L.get('planos') || []).find(p => p.cod === cod);
  const fuentesLinea = l => (l.fuentes || []).map(f => { const cod = f.split(' ')[0]; const p = planoDe(cod); return p ? src(`d-ing-plano.html?plano=${p.id}`, f, 'layers') : ''; }).join('');
  const li = (ic, cls, t, d, extra = '') => `<div class="li">${L.icon(ic, cls)}<div class="grow"><div class="t">${t}</div>${d ? `<div class="d">${d}</div>` : ''}${extra ? `<div class="pla-srcs" style="margin-top:6px">${extra}</div>` : ''}</div></div>`;

  A.responder = function (modo, q) {
    const f = P.faltantes();
    if (modo === 'revision') {
      const inferencias = {
        l09: inf('Un NH00 lleva fusibles de hasta 160 A: suele ser 125 A o 160 A. No lo completo: lo decide una persona.'),
        l11: inf('El PM5100 se monta en la puerta (96×96 frontal). Confirmalo antes de cotizar.'),
      };
      const cot = f.listas.length + f.reparos.length;
      const bloq = f.bloquean.map(l => li('triangle-alert', 'up', `<b>${L.esc(l.mat)}</b> <span class="mono muted">${L.esc(l.spec)}</span>`, L.esc(l.motivo || 'Bloquea la cotización') + (inferencias[l.id] ? `<br>${inferencias[l.id]}` : ''), src(`d-bom-editor.html?linea=${l.id}`, 'Línea ' + l.id, 'table-2') + fuentesLinea(l))).join('');
      const rep = f.reparos.map(l => li('circle-alert', '', `<b>${L.esc(l.mat)}</b> <span class="mono muted">${L.esc(l.spec)}</span> <span class="org ${l.org}">${l.org === 'inf' ? 'inferido' : 'detectado'}</span>`, L.esc(l.reparo || ''), src(`d-bom-editor.html?linea=${l.id}`, 'Línea ' + l.id, 'table-2'))).join('');
      const pl = [
        ...f.error.map(p => li('triangle-alert', 'up', `<b>${p.cod}</b> · ${L.esc(p.n)} <span class="st er" style="height:20px">Error</span>`, 'La detección tardó más de 5 minutos (504). Eso no se reintenta solo: es el plano, no el momento. Recortalo con la tijera en tableros más chicos y procesalo de nuevo.', src(`d-ing-plano.html?plano=${p.id}`, p.cod, 'layers') + src('d-pla-estado.html', 'Por qué tarda', 'activity'))),
        ...f.stale.map(p => li('circle-alert', '', `<b>${p.cod}</b> · ${L.esc(p.n)} <span class="st wa" style="height:20px">Desactualizado</span>`, `${p.sinId} símbolos sin identificar. Hasta resolverlos, sus cantidades no entran completas al BOM.`, src(`d-ing-plano.html?plano=${p.id}`, p.cod, 'layers'))),
        ...f.proc.map(p => li('refresh-cw', '', `<b>${p.cod}</b> · ${L.esc(p.n)} <span class="st pr" style="height:20px">En proceso</span>`, 'Está en la cola; cuando termine, sus líneas se suman solas.', src('d-pla-estado.html', 'Cola de procesamiento', 'activity'))),
        ...f.pend.map(p => li('clock', '', `<b>${p.cod}</b> · ${L.esc(p.n)} <span class="st gr" style="height:20px">Pendiente</span>`, `Subido en ${p.fmt}, todavía no se procesó.`, src(`d-ing-plano.html?plano=${p.id}`, p.cod, 'layers'))),
      ].join('');
      return {
        costo: 0.18, tokens: 4210,
        intro: f.bloquean.length
          ? `Hoy podés cotizar ${cot} de ${f.total} líneas del Hospital Cañuelas. Para cotizar todo faltan ${f.bloquean.length} líneas que bloquean y ${f.error.length + f.stale.length + f.proc.length + f.pend.length} planos que no terminaron.`
          : `No queda ninguna línea que bloquee: las ${f.total} líneas del Hospital Cañuelas se pueden cotizar.`,
        blocks: [
          f.bloquean.length ? `<div class="lbl">Bloquean la cotización · ${f.bloquean.length}</div><div class="pla-ans list">${bloq}</div>` : '',
          f.reparos.length ? `<div class="lbl">Se cotizan con reparos · ${f.reparos.length}</div><div class="pla-ans list">${rep}</div>` : '',
          pl ? `<div class="lbl">Planos que no terminaron</div><div class="pla-ans list">${pl}</div>` : '',
          `<p class="muted" style="font-size:12px">No inventé ningún código: lo que no tiene componente base o le falta un atributo esencial queda «sin match» con su motivo, como en la cotización.</p>`,
        ],
        fuentes: [src('d-bom-editor.html', 'BOM consolidado · 18 líneas', 'table-2'), src('d-ing-proyecto.html', 'Planos · 7', 'layers')],
        acciones: f.bloquean.length ? [
          { id: 'rev-mencion', t: 'Pedirle a Martina las 2 definiciones', icon: 'at-sign',
            confirm: 'Voy a dejar un comentario mencionando a Martina Giménez en las líneas l09 (corriente del seccionador NH00) y l11 (formato del PM5100). Le llega un aviso. No cambio ningún atributo.',
            run: user => {
              L.update(s => {
                const x = s.x.pla; const h1 = x.hilos.find(h => h.ref === 'l09');
                const msg = t => ({ u: user, t, cuando: 'recién', ia: true });
                if (h1) h1.msgs.push(msg('@martina ¿definís la corriente del seccionador NH00 (125 A o 160 A)? Bloquea la cotización.'));
                x.hilos.unshift({ id: 'h' + Date.now(), tipo: 'linea', ref: 'l11', estado: 'abierto', msgs: [msg('@martina falta el «Formato» del PM5100 (96×96 frontal o riel DIN). Bloquea la cotización.')] });
              });
              P.aviso({ t: `${P.u(user).n} mencionó a Martina en 2 líneas del BOM`, d: 'Hospital Cañuelas · l09 seccionador NH00 · l11 PM5100', i: 'at-sign', tipo: 'pr', href: 'd-pla-equipo.html?vista=actividad' });
              return 'Listo: comentario en l09 y l11, y aviso a Martina.';
            } },
          { id: 'rev-regla', t: 'Avisarme cuando se pueda cotizar todo', icon: 'workflow',
            confirm: 'Voy a crear una automatización: «Cuando el BOM del Hospital Cañuelas quede sin líneas que bloqueen → avisarte». La podés pausar o borrar en Automatizaciones.',
            run: user => {
              L.update(s => { s.x.pla.reglas.unshift({ id: 'r' + Date.now(), on: true, h: 'h2', cuando: 'El BOM queda sin bloqueos', si: 'Hospital Cañuelas · ' + f.bloquean.length + ' líneas bloquean hoy', entonces: 'Avisar a ' + P.u(user).n.split(' ')[0], a: user, canal: 'aviso', veces: 0, ultima: '', nueva: true }); });
              return 'Listo: la regla quedó activa en Automatizaciones.';
            } },
        ] : [],
      };
    }
    if (modo === 'presupuesto') {
      const m = /(\d+(?:[.,]\d+)?)\s*%/.exec(q || ''); const pct = m ? parseFloat(m[1].replace(',', '.')) / 100 : 0.05;
      const pr = P.presupuesto();
      const obj = Math.round(pr.venta * (1 - pct));
      const mNuevo = (obj - pr.costo) / obj;
      const regla = (L.get('x.pla.reglasAprob') || []).find(r => r.id === 'margen') || { valor: 18, on: true };
      const piso = regla.valor / 100;
      const v18 = Math.ceil(pr.costo / (1 - piso) / 1000) * 1000;
      const pide = regla.on && mNuevo < piso;
      const calc = `<div class="pla-ans pla-calc">
        <span>Materiales cotizados (${f.listas.length + f.reparos.length} líneas, mejor precio)</span><b>${L.ars(pr.mat.cot)}</b>
        <span>Sin cotizar: ${pr.mat.sin.map(l => l.id).join(', ')} a precio de referencia ${inf('')}</span><b>${L.ars(pr.mat.ref)}</b>
        <span>Mano de obra</span><b>${L.ars(pr.mo)}</b>
        <span class="tot">Costo</span><b class="tot">${L.ars(pr.costo)}</b>
        <span>Venta actual · margen ${L.pct(pr.margen * 100, 1)}</span><b>${L.ars(pr.venta)}</b>
        <span class="tot">Venta −${L.pct(pct * 100, 1)} · margen ${L.pct(mNuevo * 100, 1)}</span><b class="tot">${L.ars(obj)}</b>
        <span>IVA 21 % (cálculo de presentación)</span><b>${L.ars(Math.round(obj * 0.21))}</b>
      </div>`;
      return {
        costo: 0.24, tokens: 5630,
        intro: `Sin cambiar de marca, los materiales ya están al mejor precio de cada línea: no hay ahorro en la compra. El −${L.pct(pct * 100, 1)} (${L.ars(pr.venta - obj)}) sale del margen, que pasa de ${L.pct(pr.margen * 100, 1)} a ${L.pct(mNuevo * 100, 1)}.`,
        blocks: [
          `<div class="lbl">Cómo llego al número · todo sin IVA</div>${calc}`,
          pide ? `<div class="note warn">${L.icon('stamp')}<div><b>${L.pct(mNuevo * 100, 1)} está debajo del ${L.pct(regla.valor)} de margen mínimo</b>Según tus reglas, ese presupuesto lo tiene que aprobar Dirección. Sin aprobación podés bajar hasta ${L.ars(v18)} (−${L.pct((1 - v18 / pr.venta) * 100, 1)}).<div class="pla-srcs" style="margin-top:6px">${src('d-pla-equipo.html?vista=aprobaciones', 'Reglas de aprobación', 'stamp')}</div></div></div>`
            : `<div class="note ok">${L.icon('circle-check')}<div><b>No pide aprobación</b>El margen queda arriba del ${L.pct(regla.valor)} mínimo.</div></div>`,
          `<p class="muted" style="font-size:12px">No toqué marcas, gamas, cantidades (la reserva por regla sigue) ni la mano de obra. Las 3 líneas sin cotizar van a precio de referencia: cuando se coticen, el margen real puede moverse.</p>`,
        ],
        fuentes: [src('d-com-cotizacion.html', 'Cotización · 4 distribuidores', 'git-compare-arrows'), src('d-com-presupuesto.html', 'Presupuesto al comitente', 'file-spreadsheet')],
        acciones: [
          pide ? { id: 'pres-aprob-' + Math.round(pct * 1000), t: `Pedir aprobación a Hernán por el ${L.pct(mNuevo * 100, 1)}`, icon: 'stamp',
            confirm: `Voy a mandarle a Hernán Rossi un pedido de aprobación: «Hospital Cañuelas · venta ${L.ars(obj)} +IVA · margen ${L.pct(mNuevo * 100, 1)}». El presupuesto no cambia hasta que él apruebe y vos lo apliques.`,
            run: user => {
              L.update(s => { s.x.pla.aprobaciones.unshift({ id: 'ap' + Date.now(), tipo: 'margen', t: 'Presupuesto Hospital Cañuelas · −' + L.pct(pct * 100, 1), d: `Venta ${L.ars(obj)} +IVA · margen ${L.pct(mNuevo * 100, 1)} · preparado con el asistente`, monto: obj, margen: mNuevo, pide: user, regla: 'margen', href: 'd-com-presupuesto.html', estado: 'pendiente', cuando: 'recién', ia: true }); });
              P.aviso({ t: 'Pedido de aprobación: margen ' + L.pct(mNuevo * 100, 1), d: `Hospital Cañuelas · ${L.ars(obj)} +IVA · pide ${P.u(user).n}`, i: 'stamp', tipo: 'wa', href: 'd-pla-equipo.html?vista=aprobaciones' });
              return 'Pedido enviado a Hernán. Lo ves en Equipo › Aprobaciones.';
            } } : null,
          { id: 'pres-version-' + Math.round(pct * 1000), t: pide ? `Guardar versión al ${L.pct(regla.valor)} (sin aprobación)` : 'Guardar como versión para revisar', icon: 'file-spreadsheet',
            confirm: `Voy a guardar una propuesta de presupuesto: venta ${L.ars(pide ? v18 : obj)} +IVA. Queda como borrador en Presupuestos; el vigente no cambia.`,
            run: user => {
              L.update(s => { s.x.pla.propuestas.unshift({ id: 'pp' + Date.now(), t: 'Presupuesto Hospital Cañuelas', d: `Venta ${L.ars(pide ? v18 : obj)} +IVA`, u: user, cuando: 'recién', href: 'd-com-presupuesto.html' }); });
              P.aviso({ t: 'Propuesta de presupuesto lista para revisar', d: `Hospital Cañuelas · ${L.ars(pide ? v18 : obj)} +IVA · borrador del asistente`, i: 'file-spreadsheet', tipo: 'pr', href: 'd-com-presupuesto.html' });
              return 'Guardada como borrador en Presupuestos.';
            } },
        ].filter(Boolean),
      };
    }
    if (modo === 'compras') {
      const m = /(\d{1,2})\/(\d{1,2})/.exec(q || ''); const hasta = m ? `2026-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}` : '2026-10-15';
      const r = P.llegaAntes(hasta); const sinV = P.llegaAntes(hasta, ['volta']);
      const provs = L.get('proveedores') || [];
      const vencidas = r.provs.filter(g => { const of = (L.get('ofertas') || {})[g.lineas[0]][g.prov]; return of && of.vence < '2026-10-01'; });
      const tabla = `<div class="tbl-wrap" style="border-radius:12px"><table class="tbl"><thead><tr><th>Distribuidor</th><th class="r">Líneas</th><th class="r">Llega</th><th class="r">Total +IVA</th></tr></thead><tbody>${r.provs.map(g => {
        const p = provs.find(x => x.id === g.prov) || {}; const venc = vencidas.includes(g);
        return `<tr><td><b>${L.esc(p.n)}</b>${venc ? ' <span class="bdg wa">lista vencida</span>' : ''}<div class="muted" style="font-size:11px">${g.lineas.join(' · ')}</div></td><td class="r mono">${g.lineas.length}</td><td class="r mono">${L.fecha(new Date(new Date('2026-10-01T12:00:00').getTime() + g.plazo * 864e5).toISOString().slice(0, 10)).slice(0, 5)}</td><td class="r money">${L.ars(g.total)}</td></tr>`;
      }).join('')}</tbody></table></div>`;
      const cambios = r.llegan.filter(x => x.cambia).map(x => li('repeat', '', `<b>${L.esc(x.l.mat)}</b> <span class="mono muted">${L.esc(x.l.spec)}</span>`, `${L.esc(P.prov(x.barato.prov))} es más barato pero ${x.barato.stock < x.l.comprar ? 'no tiene stock (' + x.barato.stock + ' de ' + x.l.comprar + ')' : 'tarda ' + x.barato.plazo + (x.barato.plazo === 1 ? ' día' : ' días')} → ${L.esc(P.prov(x.of.prov))}, ${x.of.plazo} ${x.of.plazo === 1 ? 'día' : 'días'} · +${L.ars((x.of.precio - x.barato.precio) * x.l.comprar)}`, src(`d-com-cotizacion.html?linea=${x.l.id}`, 'Ofertas de ' + x.l.id, 'git-compare-arrows'))).join('');
      const fuera = sinV.noLlegan.map(x => x.l.id);
      return {
        costo: 0.22, tokens: 5080,
        intro: r.noLlegan.length
          ? `Antes del ${L.fecha(hasta).slice(0, 5)} llegan ${r.llegan.length} de ${r.llegan.length + r.noLlegan.length} líneas que se pueden comprar; ${r.noLlegan.length === 1 ? 'una no llega' : r.noLlegan.length + ' no llegan'} con nadie (${r.noLlegan.map(x => x.l.id).join(', ')}).`
          : `Si mandás las OC hoy, las ${r.llegan.length} líneas que se pueden comprar llegan antes del ${L.fecha(hasta).slice(0, 5)} con ${r.provs.length} distribuidores: ${L.ars(r.total)} +IVA, ${L.ars(r.delta)} más que lo más barato sin fecha.`,
        blocks: [
          tabla,
          cambios ? `<div class="lbl">Cambian de distribuidor por stock o plazo · ${r.llegan.filter(x => x.cambia).length}</div><div class="pla-ans list">${cambios}</div>` : '',
          vencidas.length ? `<div class="note warn">${L.icon('clock-alert')}<div><b>La lista de ${vencidas.map(g => P.prov(g.prov)).join(', ')} venció el 30/09</b>${vencidas.reduce((a, g) => a + g.lineas.length, 0)} líneas (${L.ars(vencidas.reduce((a, g) => a + g.total, 0))}) tienen precio vencido. Sin Casa Volta: ${L.ars(sinV.total)} (+${L.ars(sinV.total - r.total)})${fuera.length ? ` y ${fuera.join(', ')} no la tiene nadie más a tiempo` : ''}.</div></div>` : '',
          `<p class="muted" style="font-size:12px">${inf('Cuento días corridos desde hoy y que cada distribuidor confirme en el día.')} No se pueden comprar todavía: ${f.bloquean.map(l => l.id).join(', ')} (bloquean la cotización).</p>`,
        ],
        fuentes: [src('d-com-cotizacion.html', 'Ofertas · stock y plazo', 'git-compare-arrows'), src('d-com-escenarios.html', 'Escenarios de compra', 'split')],
        acciones: [
          { id: 'comp-esc-' + hasta, t: `Guardar el escenario «Todo antes del ${L.fecha(hasta).slice(0, 5)}»`, icon: 'split',
            confirm: `Voy a guardar el escenario con ${r.provs.length} distribuidores y ${L.ars(r.total)} +IVA para que Compras lo compare. No adjudica ni envía ninguna OC.`,
            run: user => {
              L.update(s => { s.x.pla.propuestas.unshift({ id: 'pe' + Date.now(), t: `Escenario «Todo antes del ${L.fecha(hasta).slice(0, 5)}»`, d: `${r.provs.length} distribuidores · ${L.ars(r.total)} +IVA`, u: user, cuando: 'recién', href: 'd-com-escenarios.html' }); });
              P.aviso({ t: `Escenario guardado: todo antes del ${L.fecha(hasta).slice(0, 5)}`, d: `${r.provs.length} distribuidores · ${L.ars(r.total)} +IVA · Hospital Cañuelas`, i: 'split', tipo: 'pr', href: 'd-com-escenarios.html' });
              return 'Escenario guardado. Lo abrís en Escenarios de compra.';
            } },
          vencidas.length ? { id: 'comp-lista', t: 'Pedirle a Casa Volta la lista actualizada', icon: 'mail',
            confirm: 'Voy a pedirle a Casa Volta Mayorista que actualice su lista de precios (vencida el 30/09). Hoy queda como aviso; el email llega con el Sprint 5.',
            run: user => {
              L.update(s => { s.x.pla.ejecuciones.unshift({ id: 'e' + Date.now(), r: 'r2', cuando: 'recién', obj: 'Casa Volta Mayorista · lista del 30/08', res: 'ok', d: 'Pedido desde el asistente por ' + P.u(user).n }); });
              P.aviso({ t: 'Pedido de lista actualizada a Casa Volta', d: 'Lista vencida el 30/09 · 7 líneas del Hospital Cañuelas', i: 'mail', tipo: 'pr', href: 'd-pla-automatizaciones.html' });
              return 'Pedido registrado en Automatizaciones › Historial.';
            } } : null,
        ].filter(Boolean),
      };
    }
    return {
      costo: 0.03, tokens: 640,
      intro: 'Por ahora contesto sobre el Hospital Cañuelas con tres tipos de preguntas: qué falta para cotizar, cómo bajar el presupuesto y a quién comprarle según la fecha. Probá con alguna de estas:',
      blocks: [`<div class="pla-sug">${Object.values(A.PREG).map(t => `<button type="button" data-preg="${L.esc(t)}">${L.esc(t)}</button>`).join('')}</div>`],
      fuentes: [], acciones: [],
    };
  };

  // Atajos manuales (sin IA o con el tope alcanzado): todo lo que el asistente hace se puede hacer a mano.
  A.manual = [
    ['list-checks', 'Qué falta para cotizar', 'BOM filtrado por «Bloquea la cotización»', 'd-bom-editor.html?filtro=bloquea'],
    ['layers', 'Planos con error o pendientes', 'Detalle del proyecto, filtro Errores', 'd-ing-proyecto.html'],
    ['split', 'Comparar escenarios de compra', 'Más barato · llega antes · menos distribuidores', 'd-com-escenarios.html'],
    ['file-spreadsheet', 'Ajustar el presupuesto', 'Margen, mano de obra y validez a mano', 'd-com-presupuesto.html'],
    ['git-compare-arrows', 'Matriz de ofertas', 'Precio, stock y plazo por línea', 'd-com-cotizacion.html'],
    ['activity', 'Estado del servicio', 'Qué está caído y desde cuándo', 'd-pla-estado.html'],
  ];
  // Resumen sin IA: es una consulta a los datos, no necesita un modelo.
  A.resumenManual = function () {
    const f = P.faltantes();
    return `<div class="pla-ans list">${f.bloquean.map(l => li('triangle-alert', 'up', `<b>${L.esc(l.mat)}</b> <span class="mono muted">${L.esc(l.spec)}</span>`, L.esc(l.motivo || ''), src(`d-bom-editor.html?linea=${l.id}`, 'Línea ' + l.id, 'table-2'))).join('')}
      ${[...f.error, ...f.stale, ...f.proc, ...f.pend].map(p => li(P.planoSt[p.status][1], '', `<b>${p.cod}</b> · ${L.esc(p.n)}`, P.planoSt[p.status][2], src(`d-ing-plano.html?plano=${p.id}`, p.cod, 'layers'))).join('')}</div>`;
  };

  // Monta una conversación en `root`. opts: { user, compact, modo, bloqueo: null | 'limite' | 'sin-ia' }
  A.montar = function (root, opts) {
    const chat = root.querySelector('[data-chat]');
    const hecho = () => L.get('x.pla.hecho') || [];
    let corriendo = null;
    function burbujaYo(q) {
      chat.querySelector('.empty')?.remove();
      chat.insertAdjacentHTML('beforeend', `<div class="pla-msg me"><span class="who">${P.av(opts.user, 'sm')}</span><div class="bd"><p>${L.esc(q)}</p></div></div>`);
    }
    function pintarAcciones(box, r) {
      box.innerHTML = r.acciones.map(a => hecho().includes(a.id)
        ? `<span class="st ok">${L.icon('circle-check')}Hecho: ${L.esc(a.t)}</span>`
        : `<button class="btn ${opts.compact ? 'sm' : 'sm'} out" data-acc="${a.id}">${L.icon(a.icon)}${L.esc(a.t)}</button>`).join('');
      box.querySelectorAll('[data-acc]').forEach(b => b.onclick = () => {
        const a = r.acciones.find(x => x.id === b.dataset.acc);
        L.dialog({
          title: 'Confirmá antes de que lo haga', icon: 'shield-check',
          desc: 'El asistente propone; nada cambia hasta que confirmes.',
          body: `<p style="font-size:14px">${L.esc(a.confirm)}</p><div class="note info">${L.icon('info')}<div>Si cancelás no se hace nada y no se cobra otra consulta.</div></div>`,
          actions: [
            { t: 'Cancelar', cls: 'out', fn: () => { const n = box.parentElement.querySelector('.pla-cancel'); if (n) n.textContent = 'Cancelaste «' + a.t + '»: no se hizo nada.'; } },
            { t: 'Confirmar', icon: 'check', fn: () => { const msg = a.run(opts.user); L.update(s => { s.x.pla.hecho.push(a.id); }); L.toast('Hecho', { type: 'success', desc: msg }); pintarAcciones(box, r); } },
          ],
        });
      });
    }
    function preguntar(q, { auto } = {}) {
      if (!q || !q.trim()) return;
      if (corriendo) corriendo.fin();
      burbujaYo(q);
      const modo = A.ruta(q) || (auto ? opts.modo : null);
      const r = A.responder(modo, q);
      const el = document.createElement('div');
      el.className = 'pla-msg ai';
      el.innerHTML = `<span class="who">${L.icon('sparkles')}</span><div class="bd"><div class="meta"><span class="ai-tag">${L.icon('sparkles')}IA</span><span>${modo ? A.MODOS[modo][0] : 'Ayuda'}</span><span class="pla-think" aria-label="Pensando"><i></i><i></i><i></i></span></div></div>`;
      chat.appendChild(el);
      const bd = el.querySelector('.bd');
      const clave = (modo || 'ayuda') + ':' + q.trim().toLowerCase();
      const enCache = (L.get('x.pla.cache') || []).includes(clave);
      if (!enCache && !P.cobrar(r.costo, opts.user)) {
        el.querySelector('.pla-think').remove();
        bd.insertAdjacentHTML('beforeend', `<div class="note bad">${L.icon('gauge')}<div><b>Se alcanzó el tope de IA del mes</b>No se envió la consulta ni se cobró. Usá los atajos manuales o pedile más tope a Dirección.</div></div>`);
        opts.onTope && opts.onTope();
        return;
      }
      if (!enCache) L.update(s => { (s.x.pla.cache ||= []).push(clave); });
      const lento = !auto && !RM();
      let i = 0; let cancel = false;
      const p = document.createElement('p'); p.style.lineHeight = '1.5';
      const fin = () => {
        if (cancel) return; cancel = true; corriendo = null;
        el.querySelector('.pla-think')?.remove();
        p.textContent = r.intro;
        const rest = document.createElement('div'); rest.className = 'col'; rest.style.gap = '10px';
        rest.innerHTML = r.blocks.filter(Boolean).join('') +
          (r.fuentes.length ? `<div class="pla-srcs"><span class="lbl">Fuentes</span>${r.fuentes.join('')}</div>` : '') +
          (r.acciones.length ? `<div class="lbl">Acciones propuestas · se confirman antes</div><div class="pla-act"></div><small class="pla-cancel muted" style="font-size:12px"></small>` : '') +
          `<div class="meta"><span class="cost">${enCache ? 'Respuesta guardada · no se volvió a cobrar (' + L.usd(r.costo) + ' la primera vez)' : L.usd(r.costo) + ' · ' + L.num(r.tokens) + ' tokens'}</span><span>·</span><button class="btn xs ghost" data-copiar>${L.icon('copy')}Copiar</button><button class="btn xs ghost" data-util>${L.icon('thumbs-up')}Útil</button><button class="btn xs ghost" data-noutil>${L.icon('thumbs-down')}No sirvió</button></div>`;
        bd.appendChild(rest);
        if (r.acciones.length) pintarAcciones(rest.querySelector('.pla-act'), r);
        rest.querySelector('[data-copiar]').onclick = () => L.toast('Respuesta copiada', { type: 'success', desc: 'Con los números y las fuentes.' });
        rest.querySelector('[data-util]').onclick = () => L.toast('Gracias', { type: 'info', desc: 'Lo usamos para mejorar las respuestas de esta empresa.' });
        rest.querySelector('[data-noutil]').onclick = () => L.toast('Anotado', { type: 'info', desc: 'Contanos qué faltaba desde el chat: no se cobra.' });
        rest.querySelectorAll('[data-preg]').forEach(b => b.onclick = () => preguntar(b.dataset.preg));
        if (lento) P.revelar(rest);
        L.fixLinks(el);
        opts.onRespuesta && opts.onRespuesta(r);
        if (!auto) el.scrollIntoView({ block: 'nearest', behavior: RM() ? 'auto' : 'smooth' });
      };
      bd.appendChild(p);
      if (!lento) { fin(); return; }
      const stop = opts.onStream ? opts.onStream(true, () => fin()) : null;
      corriendo = { fin };
      setTimeout(() => {
        const words = r.intro.split(' ');
        const tick = () => {
          if (cancel) return;
          i += 2; p.innerHTML = L.esc(words.slice(0, i).join(' ')) + '<span class="cursor"></span>';
          if (i >= words.length) { opts.onStream && opts.onStream(false); fin(); } else setTimeout(tick, 45);
        };
        el.querySelector('.pla-think')?.remove(); tick();
      }, 550);
      return stop;
    }
    return { preguntar };
  };

  window.PLA = P;
})();
