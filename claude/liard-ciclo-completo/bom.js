/* liard · área B (BOM, matching y tablero 3D): ayudantes compartidos por las pantallas d-bom-* y m-bom-*.
   Lee y escribe el estado común con L (app.js). Lo que escribe en `lineas[i]` está en CONTRATOS §4
   (attrs, faltan, estado, marca, gama, org, comprar, motivo); lo privado del área vive en `x.bom.*`. */
(function () {
  const ORG = {
    det: ['Detectado', 'scan-search', 'Lo vio el modelo en el plano'],
    inf: ['Inferido por IA', 'sparkles', 'Lo dedujo la IA: no está escrito en el plano'],
    reg: ['Por regla', 'workflow', 'Lo agregó o completó una regla de la empresa'],
    man: ['Manual', 'hand', 'Lo cargó o corrigió una persona'],
  };
  const ST = {
    ready: ['ok', 'circle-check', 'Lista', 'Lista'],
    warning: ['wa', 'circle-alert', 'Se puede cotizar con reparos', 'Con reparos'],
    blocked: ['er', 'triangle-alert', 'Bloquea la cotización', 'Bloquea'],
  };

  // Componentes base que usa el BOM del Hospital (nombres y atributos de seed/components, dev).
  // req = atributo esencial (required): sin él no hay match. v = valores admitidos (recortados).
  const TIPOS = {
    THERMOMAGNETIC_BREAKER: { n: 'Interruptor termomagnético', fam: 'Termomagnéticas', a: [
      ['Polos', 1, ['1', '2', '3', '4']], ['Corriente nominal', 1, ['6 A', '10 A', '16 A', '20 A', '25 A', '32 A', '40 A', '50 A', '63 A']],
      ['Curva de disparo', 0, ['B', 'C', 'D', 'K', 'Z']], ['Poder de corte', 0, ['3 kA', '4,5 kA', '6 kA', '10 kA', '15 kA']]] },
    RESIDUAL_CURRENT_BREAKER: { n: 'Interruptor diferencial', fam: 'Diferenciales', a: [
      ['Polos', 1, ['2', '4']], ['Corriente nominal', 1, ['16 A', '25 A', '40 A', '63 A', '80 A']],
      ['Sensibilidad', 1, ['10 mA', '30 mA', '100 mA', '300 mA', '500 mA']], ['Clase / tipo', 0, ['AC', 'SI']]] },
    MOLDED_CASE_BREAKER: { n: 'Interruptor de caja moldeada', fam: 'Caja moldeada', a: [
      ['Polos', 1, ['2', '3', '4']], ['Corriente nominal', 1, ['100 A', '160 A', '250 A', '400 A', '630 A']],
      ['Poder de corte', 0, ['25 kA', '36 kA', '50 kA', '70 kA']], ['Unidad de disparo', 0, ['TM', 'electrónica']]] },
    CONTACTOR: { n: 'Contactor', fam: 'Maniobra', a: [
      ['Polos', 1, ['2', '3', '4']], ['Corriente nominal', 1, ['9 A', '12 A', '18 A', '25 A', '32 A']],
      ['Tensión de bobina (mín.)', 0, ['24 V', '110 V', '220 V']], ['Tipo de tensión de bobina', 0, ['CA', 'CC', 'CA/CC']],
      ['Categoría de utilización', 0, ['AC1', 'AC3', 'AC4']]] },
    MOTOR_PROTECTION_BREAKER: { n: 'Guardamotor', fam: 'Maniobra', a: [
      ['Regulación mínima', 1, ['6 A', '9 A', '13 A']], ['Regulación máxima', 1, ['10 A', '14 A', '18 A']], ['Poder de corte', 0, ['50 kA', '100 kA']]] },
    FUSED_LOAD_BREAK_SWITCH: { n: 'Seccionador bajo carga con fusible', fam: 'Seccionamiento', a: [
      ['Polos', 1, ['1', '2', '3', '4']], ['Corriente nominal', 1, ['32 A', '40 A', '63 A', '80 A', '100 A', '125 A', '160 A']],
      ['Tipo de fusible', 0, ['TAB', 'NH']], ['Tamaño del fusible', 0, ['NH000', 'NH00', 'NH0', 'NH1']]] },
    SURGE_PROTECTION_DEVICE: { n: 'Descargador de sobretensiones', fam: 'Protección', a: [
      ['Corriente máxima de descarga', 1, ['20 kA', '40 kA', '65 kA']], ['Tipo / clase', 1, ['1', '2', '3']], ['Polos', 0, ['2', '4']]] },
    MULTIFUNCTION_METER: { n: 'Instrumento de medición multifunción', fam: 'Medición', a: [
      ['Comunicación', 0, ['RS485 Modbus', 'Modbus TCP', 'BACnet']], ['Formato', 1, ['96×96 frontal', 'riel DIN']],
      ['Tensión de alimentación (mín.)', 0, ['24 V', '110 V', '220 V']], ['Tipo de tensión de alimentación', 0, ['CA', 'CC', 'CA/CC']]] },
    CURRENT_SENSOR: { n: 'Sensor de corriente', fam: 'Medición', a: [
      ['Corriente primaria', 1, ['250 A', '400 A', '630 A', '800 A']], ['Corriente secundaria', 1, ['1 A', '5 A']], ['Clase de precisión', 0, ['0.2', '0.5', '1']]] },
    PILOT_LIGHT: { n: 'Ojos de buey', fam: 'Señalización', a: [
      ['Diámetro', 1, ['16 mm', '22 mm', '30 mm']], ['Color', 1, ['rojo', 'verde', 'amarillo', 'blanco']], ['Tensión (mín.)', 0, ['24 V', '220 V']], ['Tipo de tensión', 0, ['CA', 'CC']]] },
    SELECTOR_SWITCH: { n: 'Selectora', fam: 'Señalización', a: [['Posiciones', 1, ['2', '3', '4']], ['Diámetro', 0, ['16 mm', '22 mm', '30 mm']]] },
    TERMINAL_BLOCK: { n: 'Bornera', fam: 'Borneras', a: [['Sección', 1, ['2,5 mm²', '4 mm²', '6 mm²', '10 mm²']], ['Tipo de conexión', 0, ['tornillo', 'resorte', 'push-in']]] },
    SINGLE_CORE_CABLE: { n: 'Cable unipolar', fam: 'Cables', a: [['Sección', 1, ['1,5 mm²', '2,5 mm²', '4 mm²', '6 mm²']], ['Color', 0, ['marrón', 'celeste', 'negro', 'rojo', 'verde-amarillo']], ['Norma', 0, ['IRAM NM 247-3', 'IRAM 62267']]] },
    UNDERGROUND_CABLE_LSOH: { n: 'Cable subterráneo LSOH', fam: 'Cables', a: [['Cantidad de conductores', 1, ['2', '3', '4', '5']], ['Sección', 1, ['4 mm²', '6 mm²', '10 mm²', '16 mm²']], ['Material del conductor', 0, ['Cu', 'Al']], ['Aislación', 0, ['PVC', 'XLPE', 'LSOH']], ['Norma', 0, ['IRAM 62266', 'IEC 60502-1']]] },
    // Propuesta del Sprint 5 («matching para todos los componentes»): no existe en el catálogo base de dev.
    ENCLOSURE: { n: 'Gabinete', fam: 'Gabinete', s5: true, a: [['Alto', 1, ['1200 mm', '1800 mm', '2000 mm']], ['Ancho', 1, ['600 mm', '800 mm', '1000 mm']], ['Profundidad', 1, ['250 mm', '400 mm', '600 mm']], ['Grado de protección', 1, ['IP43', 'IP55', 'IP65']], ['Material', 0, ['chapa de acero', 'acero inoxidable', 'poliéster']]] },
  };

  // Lo que la IA sugiere para destrabar (la sugerencia completa un atributo; nunca elige un producto).
  const SUGERENCIAS = {
    l09: { attr: 'Corriente nominal', val: '125 A', conf: 0.62, costo: 0.021,
      por: 'No está escrito en el plano. Las 4 salidas que protege son bombas de 7,5 kW; para un NH00 tripolar lo habitual es 125 A o 160 A.',
      fuente: ['TS-BOMBAS · cuadro de cargas', 'tsbombas'] },
    l11: { attr: 'Formato', val: '96×96 frontal', conf: 0.93, costo: 0.018,
      por: '«PM5100» es un medidor de panel de 96×96 mm según la especificación del fabricante.',
      fuente: ['TGBT · especificación «PM5100»', 'tgbt'] },
    l06: { attr: 'Poder de corte', val: '36 kA', conf: 0.9, costo: 0.017,
      por: 'En la gama Compact NSX la letra «F» del código (NSX630F) es la versión de 36 kA.',
      fuente: ['TGBT · especificación «NSX630F»', 'tgbt'] },
    l18: { tipo: 'ENCLOSURE', attrs: { Alto: '1800 mm', Ancho: '800 mm', Profundidad: '400 mm', 'Grado de protección': 'IP55', Material: 'chapa de acero' }, conf: 0.88, costo: 0.024,
      por: 'Las medidas y el IP salen de la especificación que cargaste a mano: «1800×800×400 mm IP55».',
      fuente: ['Línea cargada a mano', null] },
  };

  // Reglas de la empresa (Tableros Delta). Accesorios derivados (EMEVE) y reglas para lo que falta (Meco).
  const REGLAS = [
    { id: 'r1', tipo: 'acc', n: 'Borneras por salida', activa: true, autor: 'hernan', fecha: '2026-08-12',
      cuando: ['cada polo de salida de un tablero'], entonces: ['Bornera', 'Sección 4 mm²', 'tornillo'], cant: '1 por polo + 10 % de reserva',
      impacto: { linea: 'l15', t: 'Bornera 4 mm² · 210 u (191 polos + 10 %)' }, usos: 9 },
    { id: 'r2', tipo: 'acc', n: 'Cable por térmica de 16 A', activa: false, autor: 'lucas', fecha: '2026-09-22',
      cuando: ['Interruptor termomagnético', 'Corriente nominal = 16 A'], entonces: ['Cable unipolar', 'Sección 2,5 mm²'], cant: '6 m por salida',
      impacto: { linea: 'l16', t: 'Cable unipolar 2,5 mm²: 1.120 m inferidos por IA → 1.112 m (320 dibujados + 132 × 6 m)', comprar: 1112 }, usos: 0, prueba: true },
    { id: 'r3', tipo: 'acc', n: 'Riel DIN por fila', activa: false, autor: 'hernan', fecha: '2026-09-02',
      cuando: ['cada fila de aparatos modulares'], entonces: ['Riel DIN 35 mm', 'largo = ancho útil del gabinete'], cant: '1 tramo por fila + 20 % de módulos libres',
      impacto: { t: 'Agregaría 1 línea por tablero. El riel DIN no tiene componente base: se cotizaría a mano hasta el Sprint 5.' }, usos: 0, sinBase: true },
    { id: 'r4', tipo: 'falta', n: 'Poder de corte faltante en termomagnéticas', activa: true, autor: 'hernan', fecha: '2026-08-12',
      cuando: ['Interruptor termomagnético', 'falta «Poder de corte»'], entonces: ['usar 6 kA'], cant: '',
      impacto: { t: 'Hoy no completa nada: las 2 termomagnéticas del Hospital ya traen el poder de corte.' }, usos: 14 },
    { id: 'r5', tipo: 'falta', n: 'Seccionador NH sin corriente', activa: true, autor: 'lucas', fecha: '2026-08-30',
      cuando: ['Seccionador bajo carga con fusible', 'falta «Corriente nominal»'], entonces: ['no completar', 'armar la consulta al proyectista'], cant: '',
      impacto: { linea: 'l09', t: 'Marcó el NH00 del TS-BOMBAS y dejó lista la consulta.' }, usos: 3, valida: true },
    { id: 'r6', tipo: 'falta', n: 'Formato de multimedidor', activa: false, autor: 'lucas', fecha: '2026-09-28',
      cuando: ['Instrumento de medición multifunción', 'falta «Formato»'], entonces: ['usar 96×96 frontal'], cant: '',
      impacto: { linea: 'l11', attr: 'Formato', val: '96×96 frontal', t: 'Destrabaría el PM5100 del TGBT (96×96 frontal).' }, usos: 0 },
    { id: 'r7', tipo: 'acc', n: 'Terminales y numeradores por térmica', activa: false, autor: 'hernan', fecha: '2026-09-02',
      cuando: ['Interruptor termomagnético', 'Polos = 2', 'Corriente nominal = 16 A'], entonces: ['Terminal tubular 2,5 mm²', 'Numerador de cable'], cant: '4 terminales y 4 numeradores por aparato',
      impacto: { t: 'Agregaría 2 líneas: 528 terminales y 528 numeradores (132 térmicas × 4). No tienen componente base: van como «se cotiza a mano», sin código.' }, usos: 0, sinBase: true },
    { id: 'r8', tipo: 'acc', n: 'Ventilación de gabinete IP55', activa: false, autor: 'hernan', fecha: '2026-09-02',
      cuando: ['Gabinete', 'Grado de protección = IP55'], entonces: ['Kit de ventilación con filtro'], cant: '1 entrada + 1 salida por gabinete',
      impacto: { t: 'Agregaría 1 línea para el gabinete del TGBT. Sin componente base: se cotiza a mano.' }, usos: 0, sinBase: true },
  ];

  // Bandeja «Información insuficiente»: la pregunta concreta de cada línea que bloquea y cómo se destraba.
  const PREGUNTAS = {
    l09: { attr: 'Corriente nominal', q: '¿De qué corriente es el seccionador NH00 del TS-BOMBAS?',
      why: 'El plano dice «NH00 tripolar» pero no la corriente. Sin la corriente nominal no hay match: un NH00 va de 32 A a 160 A.',
      opts: ['63 A', '80 A', '100 A', '125 A', '160 A'], consulta: true },
    l11: { attr: 'Formato', q: '¿El PM5100 va en la puerta (96×96) o sobre riel DIN?',
      why: 'El formato es esencial: cambia el producto y el calado de la puerta. El plano solo dice «PM5100 RS485 Modbus».',
      opts: ['96×96 frontal', 'riel DIN'] },
    l18: { q: '¿Cómo cotizamos el gabinete 1800×800×400 IP55?',
      why: 'El catálogo base de dev no tiene un componente «Gabinete», así que la línea no puede entrar al matching.',
      tipo: 'ENCLOSURE' },
  };

  // Alternativa ABB de la misma ingeniería (BOM alternativo, Sprint 5). Solo cambian marca y gama:
  // los atributos esenciales son los mismos, así que el match sigue siendo canónico.
  const ALTERNATIVA = {
    id: 'alt-abb', n: 'Alternativa ABB', marca: 'ABB', prov: 'en',
    lineas: {
      l01: { gama: 'S200', f: 0.93, plazo: 2, iec: 'mod' },
      l02: { gama: 'S200M', f: 0.96, plazo: 2, iec: 'mod' },
      l03: { gama: 'F200', f: 0.91, plazo: 3, iec: 'mod' },
      l05: { gama: 'Tmax XT4', f: 0.97, plazo: 3, iec: 'pot' },
      l06: { gama: 'Tmax XT6', f: 1.04, plazo: 15, stock0: true, iec: 'pot' },
    },
  };

  // Lo que ya está pedido (PED-2026-031): si el área de compras no adjudicó (compra.adjudicadas), se usa este reparto.
  const REPARTO = { l01: 'ohm', l02: 'ohm', l03: 'ohm', l07: 'ohm', l08: 'sur', l15: 'sur', l16: 'sur',
    l04: 'en', l05: 'en', l06: 'en', l10: 'en', l12: 'en', l13: 'en', l17: 'en' };

  // ---------- Lectura ----------
  const lineas = () => L.get('lineas') || [];
  const linea = id => lineas().find(l => l.id === id);
  const planos = () => L.get('planos') || [];
  const planoPorCod = cod => planos().find(p => p.cod === cod);
  const tipoDe = l => (l && l.tipo ? TIPOS[l.tipo] : null);
  const priv = () => L.get('x.bom') || {};
  const usuario = id => (L.get('usuarios') || {})[id] || { n: id, ini: '?' };

  function estadoDe(l) {
    if (!l.tipo) return l.manual ? 'warning' : 'blocked';
    if ((l.faltan || []).length) return 'blocked';
    if (l.reparo) return 'warning';
    return 'ready';
  }

  function conteo(ls = lineas()) {
    const c = { total: ls.length, ready: 0, warning: 0, blocked: 0, det: 0, inf: 0, reg: 0, man: 0 };
    ls.forEach(l => { c[l.estado]++; c[l.org]++; });
    return c;
  }

  // Ofertas de los distribuidores para la línea (ARS sin IVA). Si la línea estaba trabada y se destrabó,
  // todavía no hay ofertas reales: se estima con el precio de referencia y se rotula «estimado».
  function ofertasDe(l) {
    const o = (L.get('ofertas') || {})[l.id];
    if (o && Object.keys(o).length) return Object.entries(o).map(([prov, v]) => ({ prov, ...v }));
    return [];
  }
  function mejor(l) {
    const os = ofertasDe(l);
    if (!os.length) return l.estado === 'blocked' ? null : { precio: l.base, plazo: null, stock: null, estimado: true };
    const con = os.filter(o => o.stock >= l.comprar);
    return (con.length ? con : os).slice().sort((a, b) => a.precio - b.precio)[0];
  }
  function cotizable() {
    let total = 0, n = 0, estimado = false;
    lineas().forEach(l => { if (l.estado === 'blocked') return; const m = mejor(l); if (!m) return; n++; total += m.precio * l.comprar; if (m.estimado) estimado = true; });
    return { total, n, estimado };
  }

  // ---------- Trazabilidad: por qué esta cantidad ----------
  const ESPECIAL = {
    l15: { rows: [ { t: 'Dibujadas en el TGBT (X1)', cod: 'TGBT', dib: 36, rep: 1, comprar: null }, { t: 'Dibujadas en el TSG-PB', cod: 'TSG-PB', dib: 24, rep: 1, comprar: null } ],
      regla: { t: 'Regla «Borneras por salida»: 191 polos de salida × 1 + 10 % de reserva', comprar: 210 },
      expl: 'La regla reemplaza el conteo del plano: los planos dibujan solo las borneras del TGBT y del TSG-PB.' },
    l16: { rows: [ { t: 'Recorridos acotados en TGBT y TSG-PB', cod: 'TGBT', dib: 320, rep: 1, comprar: 320 } ],
      ia: { t: '160 salidas sin recorrido dibujado × 5 m de largo medio', comprar: 800 },
      expl: 'Los planos no acotan los recorridos de los seccionales: la IA estimó un largo medio por salida.' },
    l17: { rows: [ { t: 'Acometida medida en el plano', cod: 'TGBT', dib: 180, rep: 1, comprar: 180 } ], expl: 'La longitud está acotada en el plano del TGBT.' },
    l18: { rows: [ { t: 'Cargado a mano por Martina Giménez (29/09)', cod: null, dib: 1, rep: 1, comprar: 1 } ], expl: 'No aparece en ningún plano: se cargó a mano desde el pliego.' },
  };
  function traza(l) {
    const esp = ESPECIAL[l.id];
    let rows = [];
    if (esp) rows = esp.rows.map(r => ({ ...r, plano: r.cod && planoPorCod(r.cod) }));
    else {
      (l.fuentes || []).forEach(f => {
        const m = f.match(/^(\S+) (\d+)(?: ×(\d+))?$/);
        if (!m) return;
        const p = planoPorCod(m[1]);
        const dib = +m[2], rep = +(m[3] || (p ? p.mult : 1));
        rows.push({ t: p ? p.n : m[1], cod: m[1], plano: p, dib, rep, comprar: dib * rep });
      });
    }
    const extra = [];
    if (esp && esp.regla) extra.push({ t: esp.regla.t, comprar: esp.regla.comprar, org: 'reg', reemplaza: true });
    if (esp && esp.ia) extra.push({ t: esp.ia.t, comprar: esp.ia.comprar, org: 'inf' });
    const h = (priv().historial || {})[l.id] || [];
    const regla = h.find(e => e.via === 'regla' && e.comprar);
    if (regla) extra.push({ t: regla.t, comprar: regla.comprar, org: 'reg', reemplaza: true });
    if (!esp) {
      const sumD = rows.reduce((a, r) => a + r.dib, 0), sumC = rows.reduce((a, r) => a + r.comprar, 0);
      const dd = l.dib - sumD, dc = l.comprar - sumC;
      if (dd) extra.push({ t: 'Corrección manual del conteo', dib: dd, comprar: dd, org: 'man' });
      if (dc - dd) extra.push({ t: 'Reserva agregada a mano', comprar: dc - dd, org: 'man' });
    }
    return { rows, extra, expl: esp ? esp.expl : 'Dibujada = lo que aparece en los planos, sin repetir. A comprar = dibujada × repeticiones de cada tablero.' };
  }

  // Historial de la línea (lo que pasó, con quién y cuándo)
  function historial(l) {
    const ev = [];
    const fuentes = (l.fuentes || []).map(f => f.split(' ')[0]).filter(c => planoPorCod(c));
    if (l.org === 'det' || fuentes.length) ev.push({ i: 'scan-search', c: 'ok', t: 'Detectado en ' + (fuentes.length ? [...new Set(fuentes)].join(', ') : 'el plano'), d: l.conf ? 'confianza ' + L.num(l.conf, 2) : '', cuando: '29/09' });
    if (l.org === 'inf') ev.push({ i: 'sparkles', c: 'pri', t: 'Completado por la IA', d: l.conf ? 'confianza ' + L.num(l.conf, 2) + ' · revisalo' : '', cuando: '29/09' });
    if (l.org === 'reg' && l.regla) ev.push({ i: 'workflow', c: 'pri', t: l.regla, d: 'regla de la empresa', cuando: '29/09' });
    if (l.org === 'man' && l.id === 'l18') ev.push({ i: 'hand', c: '', t: 'Cargada a mano por Martina Giménez', d: 'desde el pliego', cuando: '29/09' });
    if (l.tipo) ev.push({ i: 'book-open-check', c: 'ok', t: 'Componente base: ' + (TIPOS[l.tipo] ? TIPOS[l.tipo].n : l.tipo), d: 'lectura de la línea (desde caché)', cuando: '29/09' });
    if (l.marca) ev.push({ i: 'tag', c: '', t: 'Marca ' + l.marca + (l.gama ? ' · ' + l.gama : ''), d: 'marcas preferidas del proyecto', cuando: '30/09' });
    ((priv().historial || {})[l.id] || []).forEach(e => ev.push({ i: ORG[e.org] ? ORG[e.org][1] : 'pencil', c: 'pri', t: e.t, d: usuario(e.por).n, cuando: 'recién' }));
    return ev;
  }

  // ---------- Escritura ----------
  function log(id, e) { L.set('x.bom.historial.' + id, h => (h || []).concat([{ ...e, cuando: new Date().toISOString() }])); }

  const ORG_DE_VIA = { ia: 'inf', regla: 'reg', manual: 'man' };
  function fijarAtributo(id, attr, val, via = 'manual', por = 'martina') {
    let antes, despues, lin;
    L.update(s => {
      const l = s.lineas.find(x => x.id === id); if (!l) return;
      antes = l.estado;
      l.attrs = { ...(l.attrs || {}), [attr]: val };
      l.faltan = (l.faltan || []).filter(a => a !== attr);
      if (l.reparo && l.reparo.includes(attr)) delete l.reparo;
      l.org = ORG_DE_VIA[via] || 'man';
      l.estado = estadoDe(l);
      if (l.estado !== 'blocked') delete l.motivo;
      despues = l.estado; lin = l;
    });
    log(id, { t: `«${attr}» = ${val}`, via, org: ORG_DE_VIA[via], por });
    if (antes === 'blocked' && despues !== 'blocked') avisarDestrabada(lin, via);
    return despues;
  }
  function fijarTipo(id, tipo, attrs, via = 'manual', por = 'martina') {
    let lin, antes;
    L.update(s => {
      const l = s.lineas.find(x => x.id === id); if (!l) return;
      antes = l.estado;
      l.tipo = tipo; l.attrs = { ...attrs };
      l.faltan = (TIPOS[tipo] ? TIPOS[tipo].a : []).filter(a => a[1] && !l.attrs[a[0]]).map(a => a[0]);
      l.org = ORG_DE_VIA[via] || 'man';
      l.estado = estadoDe(l);
      if (l.estado !== 'blocked') delete l.motivo;
      lin = l;
    });
    log(id, { t: 'Componente base: ' + (TIPOS[tipo] ? TIPOS[tipo].n : tipo), via, org: ORG_DE_VIA[via], por });
    if (antes === 'blocked' && lin.estado !== 'blocked') avisarDestrabada(lin, via);
  }
  function cotizarAMano(id, por = 'martina') {
    let lin;
    L.update(s => {
      const l = s.lineas.find(x => x.id === id); if (!l) return;
      l.manual = true; l.reparo = 'Se cotiza a mano: no entra al matching y se le pide el precio aparte a cada distribuidor.';
      l.estado = estadoDe(l); delete l.motivo; lin = l;
    });
    log(id, { t: 'Se cotiza a mano (fuera del matching)', via: 'manual', org: 'man', por });
    avisarDestrabada(lin, 'manual');
  }
  function fijarCantidad(id, comprar, t, via = 'regla', por = 'hernan') {
    L.update(s => { const l = s.lineas.find(x => x.id === id); if (!l) return; l.comprar = comprar; l.org = ORG_DE_VIA[via]; if (via === 'regla') l.regla = t; });
    log(id, { t, via, org: ORG_DE_VIA[via], por, comprar });
  }
  function avisarDestrabada(l, via) {
    const como = via === 'ia' ? 'con una sugerencia de la IA que confirmaste' : via === 'regla' ? 'con una regla de la empresa' : 'a mano';
    L.update(s => { (s.avisos ||= []).unshift({ id: 'b-' + l.id + '-' + Date.now(), t: `${l.mat} ya se puede cotizar`, d: `${l.spec} · se destrabó ${como}`, i: 'lock-open', tipo: 'ok', cuando: 'recién', href: 'd-bom-editor.html?linea=' + l.id }); });
  }
  function marcarRevisada(id, ok = true) { L.set('x.bom.revisadas.' + id, ok ? new Date().toISOString() : null); }

  // ---------- Compra ----------
  function compraDe(id) {
    const adj = L.get('compra.adjudicadas') || {};
    const prov = adj[id] || REPARTO[id];
    const ped = (L.get('pedidos') || []).find(p => p.proyecto === (L.get('proyecto') || 'p1'));
    const l = linea(id);
    if (!prov) return { k: l && l.estado === 'blocked' ? 'NONE' : 'SIN', t: l && l.estado === 'blocked' ? 'Sin asignar' : 'Sin pedir' };
    const oc = ped && ped.ordenes.find(o => o.prov === prov);
    const pv = (L.get('proveedores') || []).find(p => p.id === prov);
    const st = oc ? oc.status : 'SIN';
    const T = { SENT: 'En espera', CONFIRMED: 'Confirmado', REJECTED: 'Rechazado', EXPIRED: 'Vencido', SIN: 'Sin pedir' };
    return { k: st, t: T[st] || st, prov: pv ? pv.n : prov, oc: oc ? oc.id : null };
  }

  // ---------- Pintar ----------
  const icon = (n, c) => L.icon(n, c);
  function chipOrg(l, corto) { const o = ORG[l.org] || ORG.man; return `<span class="org ${l.org}" title="${L.esc(o[2])}">${icon(o[1])}${corto ? '' : L.esc(o[0])}</span>`; }
  function chipSt(l, corto) { const s = ST[l.estado] || ST.ready; return `<span class="st ${s[0]}">${icon(s[1])}${L.esc(corto ? s[3] : s[2])}</span>`; }
  function dot(l) { const s = ST[l.estado] || ST.ready; return `<span class="dot ${s[0]}" aria-label="${L.esc(s[2])}" role="img"></span>`; }
  function qty(n, u) { return `${L.num(n)} ${u === 'm' ? 'm' : 'u'}`; }

  window.BOM = { ORG, ST, TIPOS, SUGERENCIAS, REGLAS, PREGUNTAS, ALTERNATIVA, lineas, linea, planos, planoPorCod, tipoDe, priv, usuario,
    estadoDe, conteo, ofertasDe, mejor, cotizable, traza, historial, fijarAtributo, fijarTipo, cotizarAMano, fijarCantidad,
    marcarRevisada, compraDe, chipOrg, chipSt, dot, qty, log };
})();
