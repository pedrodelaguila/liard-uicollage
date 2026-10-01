/* liard · área C (presupuesto y compras): cálculo compartido.
   Todo sale del estado (L.get): líneas del BOM, ofertas, proveedores, pedidos. Nada de totales escritos a mano,
   salvo las fotos del pasado (la v1 del presupuesto, la cotización vieja de Torre Alem), que se rotulan como tales.
   Estado que escribe el área: `compra`, `presupuesto`, `pedidos` (nuevos lotes y `contra.estado`), `x.compras.*`. */
(function () {
  const HOY = (window.B && window.B.HOY) || '2026-10-01';
  const dia = iso => new Date(iso + 'T12:00:00').getTime();
  const dias = (a, b) => Math.round((dia(b) - dia(a)) / 86400000);
  const sumaDias = (iso, n) => { const d = new Date(iso + 'T12:00:00'); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };

  // Condición comercial que declara cada distribuidor en su lista (columna "condición" que pidió discovery).
  const CONDICION = { en: 'Cta. cte. 30 días', ohm: 'Contado −3 %', volta: 'Cta. cte. 60 días', sur: 'Transferencia anticipada' };
  const INI = { en: 'EN', ohm: 'OH', volta: 'CV', sur: 'ES' };
  const COLOR = { en: '', ohm: 'c2', volta: 'c4', sur: 'c3' };
  const TOPE_OC = 20000000;        // aprobación por monto: una OC por encima de esto la firma dirección
  const UMBRAL_MARGEN = 18;        // margen mínimo sin aprobación de dirección
  const MARCAS_PREF = ['Schneider Electric', 'Prysmian'];   // marcas preferidas del proyecto (existe en dev)

  const lineas = () => L.get('lineas');
  const provs = () => L.get('proveedores');
  const prov = id => provs().find(p => p.id === id);
  const linea = id => lineas().find(l => l.id === id);
  // Matching: una línea entra si no está bloqueada y no se cotiza a mano (área B: `manual = true`, fuera del matching).
  const cotizable = l => l.estado !== 'blocked' && !l.manual;
  const aMano = l => !!l.manual && l.estado !== 'blocked';
  const vencida = o => o && o.vence < HOY;
  const diasLista = p => dias(p.act, HOY);

  // Ofertas de una línea. Si el área B destrabó una línea que no tenía match, se generan con la misma regla de data.js
  // (determinista), así la cotización la muestra cotizada sin inventar un SKU fuera del catálogo del distribuidor.
  function ofertas(l) {
    if (!cotizable(l)) return null;
    const st = L.get('ofertas') || {};
    if (st[l.id]) return st[l.id];
    const i = lineas().findIndex(x => x.id === l.id); const out = {};
    provs().forEach((p, j) => {
      const ruido = 1 + (((i * 7 + j * 13) % 9) - 4) / 100;
      out[p.id] = {
        precio: Math.round(l.base * p.f * ruido / 10) * 10,
        stock: Math.max(l.comprar, Math.round(l.comprar * (1.5 + j))),
        plazo: p.plazo[0] + ((i + j) % (p.plazo[1] - p.plazo[0] + 1)),
        codigo: (l.gama ? l.gama.split(' ')[0].toUpperCase().slice(0, 4) + '-' : 'GEN-') + (1000 + i * 11),
        actualizado: p.act, vence: p.id === 'volta' ? '2026-09-30' : '2026-10-15', generada: true,
      };
    });
    return out;
  }

  // Filtros del "¿qué pasa si…?": sin = distribuidores sacados, stock = exigir stock, tope = plazo máximo (días),
  // vencidas = sacar las listas vencidas. Por defecto las listas vencidas NO se adjudican (Casa Volta venció el 30/09):
  // así `compra.adjudicadas` sale solo con en, ohm y sur, que es lo que leen las entregas del área E.
  const FILTROS0 = { sin: [], stock: false, tope: null, vencidas: true };
  const filtros = () => Object.assign({}, FILTROS0, L.get('x.compras.filtros') || {});
  function elegibles(l, f) {
    f = Object.assign({}, FILTROS0, f);
    const of = ofertas(l); if (!of) return [];
    return Object.entries(of).map(([pid, o]) => Object.assign({ pid }, o)).filter(o =>
      !f.sin.includes(o.pid) && (!f.stock || o.stock >= l.comprar) && (f.tope == null || o.plazo <= f.tope) && (!f.vencidas || !vencida(o)));
  }
  const barata = arr => arr.slice().sort((a, b) => a.precio - b.precio || a.plazo - b.plazo)[0];
  const rapida = arr => arr.slice().sort((a, b) => a.plazo - b.plazo || a.precio - b.precio)[0];

  const ESCENARIOS = [
    { k: 'barato', t: 'Más barato', i: 'piggy-bank', d: 'La oferta más barata de cada línea, sin mirar cuántos distribuidores quedan.' },
    { k: 'rapido', t: 'Llega antes', i: 'timer', d: 'El menor plazo de entrega por línea; ante un empate, el más barato.' },
    { k: 'menos', t: 'Menos distribuidores', i: 'boxes', d: 'El menor número de OC que cubre todo; dentro de ese grupo, lo más barato.' },
    { k: 'marcas', t: 'Marcas preferidas', i: 'badge-check', d: 'Cada marca, por un distribuidor que la representa (garantía de fábrica).' },
  ];

  function adjudicar(k, f) {
    if (f === undefined) f = filtros();
    const ls = lineas().filter(cotizable); const adj = {};
    if (k === 'barato' || k === 'rapido') {
      ls.forEach(l => { const o = (k === 'barato' ? barata : rapida)(elegibles(l, f)); if (o) adj[l.id] = o.pid; });
    } else if (k === 'menos') {
      let pend = ls.filter(l => elegibles(l, f).length); const grupo = [];
      while (pend.length) {
        const cand = provs().filter(p => !grupo.includes(p.id)).map(p => {
          const cub = pend.filter(l => elegibles(l, f).some(o => o.pid === p.id));
          const tot = cub.reduce((s, l) => s + elegibles(l, f).find(o => o.pid === p.id).precio * l.comprar, 0);
          return { p: p.id, n: cub.length, tot };
        }).filter(c => c.n).sort((a, b) => b.n - a.n || a.tot - b.tot);
        if (!cand.length) break;
        grupo.push(cand[0].p);
        pend = pend.filter(l => !elegibles(l, f).some(o => o.pid === cand[0].p));
      }
      ls.forEach(l => { const o = barata(elegibles(l, f).filter(o => grupo.includes(o.pid))); if (o) adj[l.id] = o.pid; });
    } else if (k === 'marcas') {
      ls.forEach(l => {
        const el = elegibles(l, f);
        const of = el.filter(o => l.marca && (prov(o.pid).marcas || []).includes(l.marca));
        const o = barata(of.length ? of : el); if (o) adj[l.id] = o.pid;
      });
    }
    return adj;
  }

  // Métricas de cualquier adjudicación { lineaId: provId }.
  function resumen(adj) {
    const ls = lineas(); const porProv = {}; const riesgos = []; let total = 0, plazoMax = 0;
    const aPedido = [], viejas = [];
    Object.entries(adj).forEach(([lid, pid]) => {
      const l = ls.find(x => x.id === lid); if (!l || !cotizable(l)) return;
      const o = (ofertas(l) || {})[pid]; if (!o) return;
      const sub = o.precio * l.comprar; total += sub; plazoMax = Math.max(plazoMax, o.plazo);
      (porProv[pid] ||= { n: 0, total: 0, lineas: [] }); porProv[pid].n++; porProv[pid].total += sub; porProv[pid].lineas.push(lid);
      if (!o.stock) aPedido.push(lid);
      if (vencida(o)) viejas.push(lid);
    });
    const cotizables = ls.filter(cotizable).length;
    const cubiertas = Object.values(porProv).reduce((s, p) => s + p.n, 0);
    if (aPedido.length) riesgos.push({ t: 'er', k: 'stock', n: aPedido.length, txt: `${aPedido.length} ${aPedido.length === 1 ? 'línea' : 'líneas'} sin stock (a pedido)`, lineas: aPedido });
    if (viejas.length) riesgos.push({ t: 'wa', k: 'vieja', n: viejas.length, txt: `${viejas.length} con lista vencida (Casa Volta, 30/09)`, lineas: viejas });
    Object.entries(porProv).forEach(([pid, p]) => { const pr = prov(pid); if (p.total < pr.min) riesgos.push({ t: 'wa', k: 'min', txt: `OC a ${pr.n.split(' ')[0]} ${pr.n.split(' ')[1] || ''} debajo del mínimo (${L.ars(pr.min)})`.replace('  ', ' ') }); });
    if (cubiertas < cotizables) riesgos.push({ t: 'er', k: 'cob', txt: `${cotizables - cubiertas} ${cotizables - cubiertas === 1 ? 'línea queda' : 'líneas quedan'} sin oferta con estos filtros` });
    return { total, plazoMax, nOC: Object.keys(porProv).length, porProv, cubiertas, cotizables, totalLineas: ls.length, noEncontradas: ls.filter(l => !cotizable(l)).length, riesgos, aPedido, viejas };
  }
  const escenario = (k, f) => { const adj = adjudicar(k, f); return Object.assign({ k, adj }, resumen(adj)); };

  // La compra elegida (estado compartido). Si nadie eligió todavía, se sugiere "más barato" sin escribir nada.
  function compra() {
    const c = L.get('compra');
    if (c && c.adjudicadas) return c;
    return { estrategia: 'barato', adjudicadas: adjudicar('barato', FILTROS0), sugerida: true, filtros: FILTROS0 };
  }

  // Estado de la línea en la cotización (QuoteLineStatus real).
  function estadoLinea(l, pid) {
    if (aMano(l)) return { k: 'MANUAL_REQUIRED', t: 'Cotizada a mano', c: 'sk' };
    if (!cotizable(l)) return { k: 'NOT_FOUND', t: 'Sin match', c: 'er' };
    const o = pid && (ofertas(l) || {})[pid];
    if (o && vencida(o)) return { k: 'STALE_PRICE', t: 'Precio vencido', c: 'wa' };
    return { k: 'QUOTED', t: 'Cotizada', c: 'ok' };
  }
  function observacion(l, pid, o) {
    const out = [];
    if (!o) return out;
    if (vencida(o)) out.push('Lista vencida el ' + L.fecha(o.vence));
    if (!o.stock) out.push('Sin stock: a pedido, ' + o.plazo + ' días');
    if (o.generada) out.push('Recién cotizada: la línea se destrabó en el BOM');
    if (pid === 'ohm' && /^A9F/.test(o.codigo)) out.push('Código oficial Schneider');
    if (pid === 'en' && l.id === 'l06') out.push('Acepta entrega parcial');
    if (l.estado === 'warning' && l.reparo) out.push(l.reparo);
    return out;
  }

  // ---------- Presupuesto al comitente ----------
  // Horas de taller por tablero (por unidad). Supuesto del mock, editable en pantalla.
  const HORAS0 = { tgbt: 96, tsgpb: 40, tspiso: 18, tsbombas: 32, tsasc: 16, tsups: 20, tsext: 12 };
  const PRESU0 = {
    id: 'PRE-2026-041', proyecto: 'p1', version: 2, margen: 22, tarifa: 17500, validez: 7, ajuste: true,
    horas: HORAS0, estimados: { l09: 972000, l11: 1160000, l18: 1950000 },
    gastos: { ingenieria: 1850000, ensayos: 145000, flete: 680000, imprevistos: 3 },
    estado: 'borrador', aprobacion: null,
  };
  function presupuesto() {
    const p = L.get('presupuesto') || {};
    return Object.assign({}, PRESU0, p, { horas: Object.assign({}, HORAS0, p.horas || {}), estimados: Object.assign({}, PRESU0.estimados, p.estimados || {}), gastos: Object.assign({}, PRESU0.gastos, p.gastos || {}) });
  }
  // Reparte el costo de cada línea por tablero según sus fuentes ("TS-PISO 18 ×6" = 108 de las que se compran).
  function porTablero(adj) {
    const planos = L.get('planos'); const cod = Object.fromEntries(planos.map(p => [p.cod, p.id]));
    const out = Object.fromEntries(planos.map(p => [p.id, 0])); out.general = 0;
    lineas().forEach(l => {
      const pid = adj[l.id]; const of = ofertas(l);
      const costo = cotizable(l) ? (pid && of && of[pid] ? of[pid].precio * l.comprar : 0) : estimado(l);
      if (!costo) return;
      const partes = (l.fuentes || []).map(f => { const m = f.match(/^([A-Z][A-Z0-9-]+) (\d+)(?: ×(\d+))?$/); return m && cod[m[1]] ? { p: cod[m[1]], q: +m[2] * (+m[3] || 1) } : null; });
      if (!partes.length || partes.some(x => !x)) { out.general += costo; return; }
      const tot = partes.reduce((s, x) => s + x.q, 0);
      partes.forEach(x => { out[x.p] += costo * x.q / tot; });
    });
    return out;
  }
  // Monto a estimar de una línea sin ofertas: lo cargado a mano o, si nadie lo cargó, el precio de referencia × cantidad.
  const estimado = (l, p) => { p = p || presupuesto(); const v = p.estimados[l.id]; return v != null && v !== '' ? +v : l.base * l.comprar; };
  function calcPresu(p, adj) {
    p = p || presupuesto(); adj = adj || compra().adjudicadas;
    const r = resumen(adj); const planos = L.get('planos');
    const sinCot = lineas().filter(l => !cotizable(l));
    const estimados = sinCot.reduce((s, l) => s + estimado(l, p), 0);
    const materiales = r.total + estimados;
    const mo = planos.map(pl => ({ id: pl.id, cod: pl.cod, n: pl.n, mult: pl.mult, status: pl.status, horas: +p.horas[pl.id] || 0, sub: (+p.horas[pl.id] || 0) * pl.mult * p.tarifa }));
    const manoObra = mo.reduce((s, x) => s + x.sub, 0);
    const unidades = planos.reduce((s, pl) => s + pl.mult, 0);
    const g = p.gastos; const imprev = Math.round(materiales * g.imprevistos / 100);
    const gastosL = [
      { k: 'ingenieria', t: 'Ingeniería, planos conforme a obra y documentación', v: +g.ingenieria },
      { k: 'ensayos', t: `Protocolo de ensayos IEC 61439 · ${unidades} tableros × ${L.ars(g.ensayos)}`, v: g.ensayos * unidades },
      { k: 'flete', t: 'Flete y descarga en obra (Cañuelas)', v: +g.flete },
      { k: 'imprevistos', t: `Imprevistos · ${L.num(g.imprevistos)} % de materiales`, v: imprev },
    ];
    const gastos = gastosL.reduce((s, x) => s + x.v, 0);
    const costo = materiales + manoObra + gastos;
    const venta = Math.round(costo / (1 - p.margen / 100) / 1000) * 1000;   // margen sobre el precio de venta
    const ganancia = venta - costo;
    const iva = Math.round(venta * L.get('cambio').iva / 100);
    const c = L.get('cambio');
    // Ítems para el cliente: cada tablero con sus materiales + su mano de obra + su parte de los gastos, al precio de venta.
    const reparto = porTablero(adj);
    const base = planos.map(pl => ({ id: pl.id, cod: pl.cod, n: pl.n, mult: pl.mult, costo: reparto[pl.id] + mo.find(x => x.id === pl.id).sub }));
    base.push({ id: 'general', cod: 'GRAL', n: 'Gabinetes, cableado, borneras y accesorios de montaje', mult: 1, costo: reparto.general });
    base.push({ id: 'serv', cod: 'SERV', n: 'Ingeniería, ensayos IEC 61439, documentación y flete', mult: 1, costo: gastos });
    let acum = 0; const items = base.map((b, i) => { const v = i === base.length - 1 ? venta - acum : Math.round(venta * b.costo / costo / 1000) * 1000; acum += v; return Object.assign(b, { venta: v, unit: Math.round(v / b.mult) }); });
    return { r, materiales, cotizado: r.total, estimados, sinCot, mo, manoObra, gastosL, gastos, costo, venta, ganancia, margen: p.margen, iva, conIva: venta + iva, usd: venta / c.dolarBNA, dolar: c.dolarBNA, fechaDolar: c.fecha, vence: sumaDias(HOY, +p.validez), items, unidades, bajoUmbral: p.margen < UMBRAL_MARGEN };
  }
  // v1, la que se le mandó al comitente el 24/09 (foto: no se recalcula). Venta = monto del proyecto p1 en data.js.
  const V1 = { version: 1, fecha: '2026-09-24', por: 'lucas', margen: 27, materiales: 38940000, manoObra: 5302500, gastos: 8170000, venta: 71800000, estado: 'enviado', nota: 'Lista de Eléctrica Norte del 15/09; TS-UPS sin cómputo (se presupuestó a estimar).' };

  // Otros presupuestos de la empresa (lista de la barra "Presupuestos"). Foto de cada uno.
  const PRESUPUESTOS = [
    { id: 'PRE-2026-041', proyecto: 'p1', ver: 'v2', estado: 'borrador', por: 'lucas', fecha: '2026-10-01' },
    { id: 'PRE-2026-044', proyecto: 'p3', ver: 'v1', estado: 'aprobacion', por: 'lucas', fecha: '2026-09-30', venta: 57900000, margen: 15.8 },
    { id: 'PRE-2026-038', proyecto: 'p2', ver: 'v3', estado: 'aceptado', por: 'lucas', fecha: '2026-09-12', venta: 58300000, margen: 24.5 },
    { id: 'PRE-2026-046', proyecto: 'p4', ver: 'v1', estado: 'enviado', por: 'martina', fecha: '2026-09-29', venta: 126000000, margen: 21 },
  ];

  // ---------- Pedidos ----------
  // Composición de las OC del PED-2026-031 (primera tanda de p1): cantidad y precio unitario pactado al emitir (30/09).
  // OC-2026-031-1 (Eléctrica Norte) la define el área D en window.BP.oc031 (data-prov.js); las otras dos son de esta área.
  // Las sumas dan exactamente el total de cada orden en data.js.
  const OC_LINEAS = {
    'OC-2026-031-2': [['l07', 4], ['l08', 4], ['l12', 3], ['l17', 168, 21680]],
    'OC-2026-031-3': [['l04', 2], ['l15', 192], ['l16', 689]],
  };
  function lineasOC(oc) {
    if (oc.id === 'OC-2026-031-1') {
      const bp = window.BP && window.BP.oc031; if (!bp) return null;
      return bp.map(x => ({ l: linea(x.linea), q: x.cant, precio: x.precio, sub: x.precio * x.cant, codigo: x.codigo }));
    }
    const def = oc.items || OC_LINEAS[oc.id]; if (!def) return null;
    return def.map(([lid, q, pr]) => { const l = linea(lid); const o = (ofertas(l) || {})[oc.prov] || {}; const precio = pr || o.precio; return { l, q, precio, sub: precio * q, codigo: o.codigo }; });
  }
  // Contraoferta semilla de Eléctrica Norte sobre OC-2026-031-1 (el área D la escribe en ordenes[].contra; si todavía no
  // lo hizo, se muestra esta, que es la del aviso a2).
  // Contraoferta de ejemplo de Eléctrica Norte sobre OC-2026-031-1, con la misma forma que escribe el área D
  // (ordenes[].contra). Se usa solo si D todavía no escribió una; sigue las pistas de BP.oc031 (plazo del NSX 250,
  // equivalente ABB para el NSX630F).
  function contraSemilla() {
    const bp = (window.BP && window.BP.oc031) || []; const eq = ((window.BP && window.BP.equivalentes) || {}).l06 || [];
    const l06 = bp.find(x => x.linea === 'l06'), l05 = bp.find(x => x.linea === 'l05'), e = eq[0];
    const lineas = [];
    if (l05) lineas.push({ linea: 'l05', cambio: 'plazo', antes: l05.plazo + ' días', despues: (l05.hint && l05.hint.plazo || 12) + ' días', nota: 'Compact NSX 250 sin stock libre: reposición del fabricante.' });
    if (l06 && e) lineas.push({ linea: 'l06', cambio: 'equivalente', antes: `${l06.marca} ${l06.gama} · ${L.ars(l06.precio)}`, despues: `${e.marca} ${e.gama} (${e.codigo}) · ${L.ars(e.precio)}`, nota: 'Mismo componente base y atributos esenciales; entrega en ' + e.plazo + ' días.', precioAntes: l06.precio, precioDespues: e.precio });
    const totalAntes = bp.reduce((s, x) => s + x.precio * x.cant, 0);
    const total = totalAntes + lineas.reduce((s, x) => s + (x.precioDespues != null ? (x.precioDespues - x.precioAntes) * ((bp.find(y => y.linea === x.linea) || {}).cant || 1) : 0), 0);
    return { lineas, estado: 'pendiente', enviada: '2026-10-01', recibida: '2026-10-01T09:15', total, totalAntes, semilla: true };
  }
  const ordenPath = id => { const ps = L.get('pedidos'); for (let k = 0; k < ps.length; k++) for (let j = 0; j < ps[k].ordenes.length; j++) if (ps[k].ordenes[j].id === id) return { k, j, path: `pedidos.${k}.ordenes.${j}`, ped: ps[k], oc: ps[k].ordenes[j] }; return null; };
  const contraDe = id => { const p = ordenPath(id); if (!p) return null; return p.oc.contra || (id === 'OC-2026-031-1' && window.BP ? contraSemilla() : null); };
  const recibida = ct => ct.recibida || ((ct.enviada || HOY).length > 10 ? ct.enviada : (ct.enviada || HOY) + 'T09:15');

  // Semáforo de respuesta (responseDeadlineAt).
  function semaforo(oc) {
    if (oc.status === 'CONFIRMED' || oc.status === 'REJECTED') return { c: 'ok', t: 'Respondió ' + L.fechaCorta(oc.respondido || HOY), i: 'circle-check' };
    if (oc.status === 'EXPIRED') return { c: 'gr', t: 'Venció ' + L.fechaCorta(oc.vence), i: 'clock' };
    const d = dias(HOY, oc.vence);
    if (d < 0) return { c: 'er', t: 'Vencida', i: 'clock-alert' };
    if (d <= 1) return { c: 'wa', t: d === 0 ? 'Vence hoy' : 'Vence mañana', i: 'clock-alert' };
    return { c: 'pr', t: `Vence en ${d} días`, i: 'clock' };
  }
  const OST = { SENT: 'En espera', CONFIRMED: 'Confirmado', REJECTED: 'Rechazado', EXPIRED: 'Vencido', COUNTER: 'Contraoferta', PARTIAL: 'Parcial' };

  // Aprobaciones de dirección (Hernán). Semilla: 2 pendientes (cuadra con avisosSinLeer['m-aprobar']).
  const APROB0 = [
    { id: 'apr-pre-044', tipo: 'presupuesto', ref: 'PRE-2026-044 · v1', proyecto: 'p3', por: 'lucas', creado: '2026-09-30T17:40', monto: 57900000, margen: 15.8, umbral: UMBRAL_MARGEN, motivo: 'El margen queda en 15,8 %, debajo del 18 % que pide la empresa. Lucas lo bajó para competir: el comitente tiene otra oferta.', detalle: [['Costo', 48752000], ['Precio de venta sin IVA', 57900000], ['IVA 21 % (presentación)', 12159000]], estado: 'pendiente' },
    { id: 'apr-ped-033', tipo: 'pedido', ref: 'PED-2026-033', proyecto: 'p4', por: 'sofia', creado: '2026-10-01T08:55', monto: 50295400, tope: TOPE_OC, motivo: 'La OC a Eléctrica Norte ($ 46.380.000) supera el tope de $ 20.000.000 por orden.', ordenes: [{ prov: 'en', total: 46380000, lineas: 22 }, { prov: 'sur', total: 3915400, lineas: 6 }], estado: 'pendiente' },
  ];
  const aprobaciones = () => L.get('x.compras.aprob') || APROB0;
  function guardarAprob(list) { L.set('x.compras.aprob', list); }

  // Correos del hilo de una OC (Sprint 5). Se arman a partir del estado de la orden.
  function hilo(id) {
    const p = ordenPath(id); if (!p) return [];
    const oc = p.oc, pr = prov(oc.prov), env = p.ped.enviado;
    const mail = pr.n.toLowerCase().split(' ').filter(w => !/^(s\.a\.|s\.r\.l\.)$/.test(w)).slice(0, 2).join('').normalize('NFD').replace(/[^a-z]/g, '');
    const out = [
      { k: 'nuevo', cuando: env + 'T18:02', de: 'liard', a: `ventas@${mail}.com.ar`, lado: 'prov', t: `Nuevo pedido ${oc.id} · ${oc.lineas} líneas`, d: `Responder antes del ${L.fecha(oc.vence || sumaDias(env, 2))}`, i: 'send' },
      { k: 'copia', cuando: env + 'T18:02', de: 'liard', a: 'sofia@tablerosdelta.com.ar', lado: 'ing', t: `Enviaste ${oc.id} a ${pr.n}`, d: 'Copia para tu registro, con el detalle de lo pedido', i: 'copy' },
    ];
    const ct = contraDe(id);
    if (ct) {
      out.push({ k: 'contraoferta', cuando: recibida(ct), de: pr.n, a: 'liard', lado: 'prov', t: `${pr.n} respondió con una contraoferta`, d: `${ct.lineas.length} ${ct.lineas.length === 1 ? 'cambio' : 'cambios'}${ct.total ? ' · nuevo total ' + L.ars(ct.total) : ''}`, i: 'repeat' });
      out.push({ k: 'aviso-contra', cuando: recibida(ct).slice(0, 11) + String(+recibida(ct).slice(11, 13)).padStart(2, '0') + ':' + String(Math.min(59, +recibida(ct).slice(14, 16) + 1)).padStart(2, '0'), de: 'liard', a: 'sofia@tablerosdelta.com.ar', lado: 'ing', t: `${pr.n} propone ${ct.lineas.length} ${ct.lineas.length === 1 ? 'cambio' : 'cambios'}`, d: 'Revisalos antes de que venza la respuesta', i: 'mail-warning' });
      if (ct.estado !== 'pendiente') out.push({ k: 'decision', cuando: (ct.decidida || HOY + 'T10:30'), de: 'liard', a: `ventas@${mail}.com.ar`, lado: 'prov', t: ct.estado === 'aceptada' ? 'Tablero Delta aceptó tu contraoferta' : 'Respuesta a tu contraoferta', d: ct.estado === 'aceptada' ? 'Podés confirmar el pedido' : 'Revisá las líneas rechazadas', i: 'mail-check' });
    }
    if (oc.status === 'CONFIRMED') {
      out.push({ k: 'confirmado', cuando: (oc.respondido || HOY) + 'T11:20', de: pr.n, a: 'liard', lado: 'prov', t: `${pr.n} confirmó ${oc.id}`, d: 'Precio, stock y plazo confirmados', i: 'circle-check' });
      out.push({ k: 'contacto', cuando: (oc.respondido || HOY) + 'T11:21', de: 'liard', a: `ventas@${mail}.com.ar`, lado: 'prov', t: 'Ya podés ver el contacto del comprador', d: 'Se habilitó al confirmar', i: 'contact' });
    } else if (oc.status === 'REJECTED') {
      out.push({ k: 'rechazado', cuando: (oc.respondido || HOY) + 'T10:05', de: pr.n, a: 'liard', lado: 'prov', t: `${pr.n} rechazó ${oc.id}`, d: oc.motivo || 'Sin motivo', i: 'circle-x' });
    } else if (oc.status === 'EXPIRED') {
      out.push({ k: 'vencido', cuando: oc.vence + 'T18:02', de: 'liard', a: 'sofia@tablerosdelta.com.ar', lado: 'ing', t: `${oc.id} venció sin respuesta`, d: 'Podés reenviarlo a otro distribuidor', i: 'clock' });
    } else {
      out.push({ k: 'recordatorio', cuando: sumaDias(oc.vence, -1) + 'T09:00', de: 'liard', a: `ventas@${mail}.com.ar`, lado: 'prov', t: 'Recordatorio: el pedido vence mañana', d: 'Programado', i: 'alarm-clock', futuro: sumaDias(oc.vence, -1) > HOY });
    }
    return out.sort((a, b) => a.cuando < b.cuando ? -1 : 1).map(m => Object.assign(m, { mail }));
  }
  const hora = iso => iso.length > 10 ? iso.slice(11, 16) : '';

  // Cotización vieja de Torre Alem (p2): foto del 05/09, contra las listas vigentes. ref = línea del catálogo equivalente.
  const TORRE = {
    id: 'COT-2026-019', proyecto: 'p2', fecha: '2026-09-05', ipc: 1.7, icc: 4.4,
    lineas: [
      { ref: 'l01', q: 210, prov: 'en', antes: 34900 }, { ref: 'l02', q: 24, prov: 'en', antes: 208200 },
      { ref: 'l03', q: 96, prov: 'ohm', antes: 86100 }, { ref: 'l05', q: 2, prov: 'volta', antes: 2512000 },
      { ref: 'l06', q: 1, prov: 'ohm', antes: 7210000 }, { ref: 'l07', q: 12, prov: 'ohm', antes: 103900 },
      { ref: 'l10', q: 3, prov: 'en', antes: 361500 }, { ref: 'l12', q: 6, prov: 'ohm', antes: 59400 },
      { ref: 'l13', q: 64, prov: 'ohm', antes: 9100 }, { ref: 'l14', q: 8, prov: 'volta', antes: 18200 },
      { ref: 'l15', q: 480, prov: 'volta', antes: 2140 }, { ref: 'l16', q: 2600, prov: 'en', antes: 1060 },
      { ref: 'l17', q: 240, prov: 'en', antes: 20900 }, { ref: 'l08', q: 6, prov: 'en', antes: 137200 },
    ],
  };
  // As-built de un tablero de p1 (pedido del área E: ?origen=<tablero>): lo que lleva el tablero, a lo que se pagó.
  // Precio "antes" = el de la OC del PED-2026-031 si la línea fue en esa tanda; si no, la oferta más barata vigente al 30/09.
  function asBuilt(tid) {
    const t = (L.get('tableros') || []).find(x => x.id === tid); if (!t) return null;
    const pl = L.get('planos').find(p => p.id === t.plano) || {}; const cod = pl.cod || t.cod;
    let items = [];
    if (tid === 'tgbt') { const acc = {}; L.get('tgbt').filas.forEach(f => f.items.forEach(i => { acc[i.linea] = (acc[i.linea] || 0) + i.cant; })); items = Object.entries(acc).map(([ref, q]) => ({ ref, q })); }
    else lineas().forEach(l => (l.fuentes || []).forEach(f => { const m = f.match(/^([A-Z][A-Z0-9-]+) (\d+)(?: ×(\d+))?$/); if (m && m[1] === cod) items.push({ ref: l.id, q: +m[2] * (+m[3] || 1) }); }));
    const enOC = {}; Object.entries(OC_LINEAS).forEach(([oc, ls]) => { const o = (L.get('pedidos')[0] || { ordenes: [] }).ordenes.find(x => x.id === oc); ls.forEach(([lid, q, pr]) => { const l = linea(lid); const v = (ofertas(l) || {})[o ? o.prov : 'en']; enOC[lid] = { prov: o ? o.prov : 'en', antes: pr || (v && v.precio), oc }; }); });
    const lin = items.map(x => { const l = linea(x.ref); const e = enOC[x.ref]; if (e) return Object.assign(x, e); const b = barata(Object.entries(ofertas(l) || {}).map(([pid, v]) => Object.assign({ pid }, v))); return Object.assign(x, b ? { prov: b.pid, antes: b.precio } : { prov: null, antes: null }); });
    return { id: 'AS-BUILT ' + cod, tablero: t, cod, proyecto: 'p1', fecha: '2026-09-30', ipc: TORRE.ipc, icc: TORRE.icc, lineas: lin, asBuilt: true };
  }

  function recotizar(base) {
    base = base || TORRE;
    return base.lineas.map(x => {
      const l = linea(x.ref); const of = ofertas(l) || {};
      if (!x.prov) return { x, l, k: 'nf', antes: 0, hoy: 0, pu: null };
      const o = of[x.prov];
      const antes = x.antes * x.q;
      if (!o) { const alt = barata(Object.entries(of).map(([pid, v]) => Object.assign({ pid }, v)).filter(v => v.stock)); return { x, l, k: 'salio', antes, hoy: alt ? alt.precio * x.q : antes, alt, pu: alt ? alt.precio : null }; }
      const hoy = o.precio * x.q; const d = (o.precio - x.antes) / x.antes * 100;
      const k = !o.stock ? 'stock' : Math.abs(d) < 0.5 ? 'igual' : d > 0 ? 'subio' : 'bajo';
      return { x, l, o, k, antes, hoy, pu: o.precio, d, vieja: vencida(o) };
    });
  }

  window.C = { HOY, dias, sumaDias, CONDICION, INI, COLOR, TOPE_OC, UMBRAL_MARGEN, MARCAS_PREF, lineas, provs, prov, linea, cotizable, aMano, estimado, vencida, diasLista, ofertas, elegibles, ESCENARIOS, FILTROS0, filtros, adjudicar, resumen, escenario, compra, estadoLinea, observacion, presupuesto, calcPresu, V1, PRESUPUESTOS, OC_LINEAS, lineasOC, ordenPath, contraDe, recibida, semaforo, OST, aprobaciones, guardarAprob, hilo, hora, TORRE, recotizar, asBuilt, barata };
})();
