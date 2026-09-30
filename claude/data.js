/* liard horizon · datos de ejemplo (ficticios)
   Toda empresa, persona, obra, código y precio de este archivo es inventado. Las marcas de fabricante
   (Schneider, ABB, Chint, Siemens) se usan como referencia de dominio; los códigos y precios no son reales.
   Esto es la SEMILLA: la app la copia a localStorage la primera vez y desde ahí cada pantalla lee y escribe
   con L.store (app.js). "Reiniciar demo" vuelve a esta semilla. */
(function () {
  const TODAY = '2026-09-30';

  /* Componentes base (catálogo canónico): tipo → atributos → valores. `req` = atributo esencial para el matching. */
  const types = {
    mccb: { name: 'Interruptor automático en caja moldeada', short: 'Caja moldeada', family: 'Protección', attrs: [
      { k: 'polos', label: 'Polos', req: true, values: ['3P', '4P'] },
      { k: 'in', label: 'Corriente nominal', unit: 'A', req: true, values: [160, 250, 400, 630] },
      { k: 'icu', label: 'Poder de corte', unit: 'kA', req: true, values: [36, 50, 70] },
      { k: 'disparo', label: 'Unidad de disparo', req: false, values: ['Termomagnética', 'Electrónica'] } ] },
    sec: { name: 'Seccionador bajo carga', short: 'Seccionador', family: 'Maniobra', attrs: [
      { k: 'polos', label: 'Polos', req: true, values: ['3P', '4P'] },
      { k: 'in', label: 'Corriente nominal', unit: 'A', req: true, values: [63, 125, 250, 400] } ] },
    itm: { name: 'Interruptor termomagnético', short: 'Térmica', family: 'Protección', attrs: [
      { k: 'polos', label: 'Polos', req: true, values: ['1P', '1P+N', '2P', '3P', '4P'] },
      { k: 'in', label: 'Corriente nominal', unit: 'A', req: true, values: [6, 10, 16, 20, 25, 32, 40, 63] },
      { k: 'curva', label: 'Curva', req: true, values: ['B', 'C', 'D'] },
      { k: 'icu', label: 'Poder de corte', unit: 'kA', req: false, values: [4.5, 6, 10] } ] },
    dif: { name: 'Interruptor diferencial', short: 'Diferencial', family: 'Protección', attrs: [
      { k: 'polos', label: 'Polos', req: true, values: ['2P', '4P'] },
      { k: 'in', label: 'Corriente nominal', unit: 'A', req: true, values: [25, 40, 63] },
      { k: 'sens', label: 'Sensibilidad', unit: 'mA', req: true, values: [30, 300] },
      { k: 'clase', label: 'Clase', req: false, values: ['AC', 'A', 'SI'] } ] },
    dps: { name: 'Descargador de sobretensión', short: 'Descargador', family: 'Protección', attrs: [
      { k: 'polos', label: 'Polos', req: true, values: ['2P', '4P'] },
      { k: 'imax', label: 'Corriente máxima', unit: 'kA', req: true, values: [20, 40, 65] } ] },
    cont: { name: 'Contactor', short: 'Contactor', family: 'Maniobra', attrs: [
      { k: 'polos', label: 'Polos', req: true, values: ['3P', '4P'] },
      { k: 'in', label: 'Corriente AC3', unit: 'A', req: true, values: [9, 12, 25, 40] },
      { k: 'bobina', label: 'Bobina', req: true, values: ['24 Vca', '220 Vca'] } ] },
    gm: { name: 'Guardamotor', short: 'Guardamotor', family: 'Protección', attrs: [
      { k: 'rango', label: 'Rango de regulación', req: true, values: ['2,5–4 A', '4–6,3 A', '6–10 A'] } ] },
    multi: { name: 'Multimedidor', short: 'Multimedidor', family: 'Medición', attrs: [
      { k: 'com', label: 'Comunicación', req: true, values: ['Modbus RTU', 'Sin comunicación'] } ] },
    piloto: { name: 'Ojo de buey (señalización)', short: 'Ojo de buey', family: 'Señalización', attrs: [
      { k: 'color', label: 'Color', req: true, values: ['Rojo', 'Verde', 'Amarillo'] },
      { k: 'tension', label: 'Tensión', req: true, values: ['24 V', '220 V'] } ] },
    gab: { name: 'Gabinete metálico', short: 'Gabinete', family: 'Envolvente', attrs: [
      { k: 'ip', label: 'Protección', req: true, values: ['IP43', 'IP55', 'IP65'] },
      { k: 'medida', label: 'Medida (alto × ancho)', unit: 'mm', req: true, values: ['600×400', '800×600', '1200×800', '2000×800'] } ] },
    borne: { name: 'Borne de riel DIN', short: 'Borne', family: 'Conexionado', attrs: [
      { k: 'seccion', label: 'Sección', unit: 'mm²', req: true, values: [4, 10, 35] } ] },
  };

  /* Precio base de referencia en ARS por componente (ficticio), antes de marca y distribuidor. */
  const basePrice = {
    'mccb|4P|400|50': 2890000, 'mccb|4P|250|36': 1640000, 'sec|4P|400': 920000, 'sec|4P|125': 312000,
    'itm|4P|63|C': 186000, 'itm|4P|32|C': 131000, 'itm|2P|20|C': 46500, 'itm|1P+N|10|C': 23800, 'itm|1P+N|16|C': 24600,
    'dif|4P|40|30': 214000, 'dif|4P|63|30': 262000, 'dif|4P|63|300': 248000, 'dif|2P|25|30': 98500,
    'dps|4P|40': 188000, 'cont|4P|25|220 Vca': 142000, 'gm|4–6,3 A': 118000, 'multi|Modbus RTU': 468000,
    'piloto|Rojo|220 V': 7400, 'piloto|Verde|220 V': 7400,
    'gab|IP55|2000×800': 3150000, 'gab|IP43|800×600': 486000, 'gab|IP43|1200×800': 842000, 'gab|IP65|800×600': 690000,
    'borne|4': 1450, 'borne|10': 2380, 'borne|35': 6100,
  };

  /* Distribuidores (ficticios). */
  const suppliers = [
    { id: 'sur', name: 'Distribuidora Sur Eléctrica', short: 'Sur Eléctrica', city: 'Rosario', brands: ['Schneider', 'Chint'], factor: 1.0, lead: 2,
      contact: 'Paula Giménez', email: 'ventas@sur-electrica.example', phone: '+54 341 555-0142', responseH: 3, color: '#1f4fd8' },
    { id: 'delta', name: 'Electro Delta SA', short: 'Electro Delta', city: 'CABA', brands: ['ABB', 'Schneider', 'Siemens'], factor: 1.04, lead: 4,
      contact: 'Hernán Sosa', email: 'cotizaciones@electrodelta.example', phone: '+54 11 5555-0190', responseH: 6, color: '#c8642b' },
    { id: 'norte', name: 'Norte Materiales Eléctricos', short: 'Norte Materiales', city: 'Córdoba', brands: ['Chint', 'ABB'], factor: 0.95, lead: 9,
      contact: 'Valeria Quiroga', email: 'pedidos@nortemateriales.example', phone: '+54 351 555-0117', responseH: 20, color: '#13a3b5' },
  ];
  const brandFactor = { Schneider: 1.0, ABB: 0.97, Siemens: 1.06, Chint: 0.63 };
  const gama = { Schneider: { itm: 'Acti9 iC60N', dif: 'Acti9 iID', mccb: 'ComPacT NSX', sec: 'INS', cont: 'TeSys D', dps: 'iPRD', gm: 'TeSys GV2', multi: 'PowerLogic PM', piloto: 'Harmony XB7', gab: 'Spacial', borne: 'Linergy' },
    ABB: { itm: 'S200', dif: 'F200', mccb: 'Tmax XT', sec: 'OT', cont: 'AF', dps: 'OVR', gm: 'MS132', multi: 'M4M', piloto: 'CL2', gab: 'SR2', borne: 'SNK' },
    Siemens: { itm: '5SL', dif: '5SV', mccb: '3VA', sec: '3KD', cont: 'SIRIUS 3RT', dps: '5SD7', gm: '3RV2', multi: 'SENTRON PAC', piloto: '3SU1', gab: '8MF', borne: '8WH' },
    Chint: { itm: 'NXB-63', dif: 'NXBLE', mccb: 'NXM', sec: 'NH40', cont: 'NXC', dps: 'NU6', gm: 'NS2', multi: 'DTSU', piloto: 'ND16', gab: 'NX', borne: 'JXB' } };

  /* Catálogo de cada distribuidor: una fila por componente × marca que vende. */
  const catalog = [];
  const expired = new Set(['norte|itm|4P|32|C', 'delta|piloto|Verde|220 V']); // precios con vigencia vencida
  const notCarried = new Set(['norte|multi', 'norte|mccb', 'sur|gm', 'norte|dps']);
  let n = 0;
  for (const s of suppliers) {
    for (const [key, price] of Object.entries(basePrice)) {
      const [typeId, ...vals] = key.split('|');
      if (notCarried.has(s.id + '|' + typeId)) continue;
      for (const brand of s.brands) {
        if (typeId === 'gab' && brand === 'Siemens') continue;
        const t = types[typeId];
        const attrs = {}; t.attrs.filter(a => a.req).forEach((a, i) => { attrs[a.k] = isNaN(+vals[i]) ? vals[i] : +vals[i]; });
        const unit = Math.round(price * brandFactor[brand] * s.factor / 10) * 10;
        n++;
        const stale = expired.has(s.id + '|' + key);
        catalog.push({
          id: 'ci-' + n, supplierId: s.id, typeId, attrs, brand, gama: gama[brand][typeId],
          code: (brand.slice(0, 3).toUpperCase()) + '-' + typeId.toUpperCase() + '-' + vals.join('').replace(/[^0-9A-Za-z+]/g, '') + '-' + s.id.slice(0, 1).toUpperCase(),
          name: t.short + ' ' + vals.join(' ') + (t.attrs[1] && t.attrs[1].unit === 'A' ? '' : '') + ' ' + gama[brand][typeId],
          price: unit, currency: 'ARS', leadDays: s.lead + (brand === 'Siemens' ? 5 : 0) + (typeId === 'mccb' || typeId === 'gab' ? 6 : 0),
          priceValidUntil: stale ? '2026-09-12' : '2026-10-31', published: true,
          readingStatus: 'READ', linkStatus: 'AUTO',
        });
      }
    }
  }
  // Filas de catálogo recién importadas que la IA todavía no leyó o no pudo vincular (bandeja del proveedor Sur).
  catalog.push(
    { id: 'ci-p1', supplierId: 'sur', typeId: null, attrs: {}, brand: 'Schneider', gama: 'Acti9', code: 'SCH-A9R-4P40-300', name: 'DIF. 4X40 300MA ACTI9 SUPERINMUNIZADO', price: 239000, currency: 'ARS', leadDays: 3, priceValidUntil: '2026-10-31', published: true, readingStatus: 'PENDING', linkStatus: 'UNLINKED' },
    { id: 'ci-p2', supplierId: 'sur', typeId: null, attrs: {}, brand: 'Chint', gama: 'NXB', code: 'CHI-NXB-3X50', name: 'TERMICA NXB 3X50 C 6KA', price: 58200, currency: 'ARS', leadDays: 2, priceValidUntil: '2026-10-31', published: true, readingStatus: 'FAILED', linkStatus: 'UNLINKED', readingNote: 'La lectura no reconoció el valor 50 A: no está en la lista de corrientes del componente base.' },
    { id: 'ci-p3', supplierId: 'sur', typeId: null, attrs: {}, brand: 'Schneider', gama: 'Harmony', code: 'SCH-XB7-AMB-24', name: 'PILOTO LED AMBAR 24V 22MM', price: 6900, currency: 'ARS', leadDays: 2, priceValidUntil: '2026-10-31', published: true, readingStatus: 'PENDING', linkStatus: 'UNLINKED' },
  );

  /* Planos (tableros) de cada obra. qty = símbolos dibujados por línea del BOM. */
  const plans = [
    { id: 'pl-tgbt', projectId: 'p1', name: 'TGBT', title: 'Tablero general de baja tensión', file: 'CSM-E-101_TGBT.dxf', format: 'DXF', status: 'COMPLETED', multiplier: 1, reviewed: true, processedAt: '2026-09-28T14:12:00', durationS: 52 },
    { id: 'pl-tspb', projectId: 'p1', name: 'TS-PB', title: 'Tablero seccional planta baja', file: 'CSM-E-102_TS-PB.dxf', format: 'DXF', status: 'COMPLETED', multiplier: 1, reviewed: true, processedAt: '2026-09-28T14:14:00', durationS: 41 },
    { id: 'pl-tstipo', projectId: 'p1', name: 'TS-P tipo', title: 'Tablero seccional piso tipo (1.º a 4.º)', file: 'CSM-E-103_TS-tipo.dxf', format: 'DXF', status: 'COMPLETED', multiplier: 4, reviewed: false, processedAt: '2026-09-28T14:15:00', durationS: 38 },
    { id: 'pl-tde', projectId: 'p1', name: 'TDE', title: 'Tablero de emergencia', file: 'CSM-E-104_TDE.pdf', format: 'PDF', status: 'COMPLETED', multiplier: 1, reviewed: false, processedAt: '2026-09-28T14:18:00', durationS: 66 },
    { id: 'pl-tsb', projectId: 'p1', name: 'TS-B', title: 'Tablero de bombas', file: 'CSM-E-105_TS-B.dxf', format: 'DXF', status: 'PENDING', multiplier: 1, reviewed: false },
    { id: 'pl-h1', projectId: 'p2', name: 'TGBT', title: 'Tablero general', file: 'HCS-TGBT.dxf', format: 'DXF', status: 'COMPLETED', multiplier: 1, reviewed: true },
    { id: 'pl-h2', projectId: 'p2', name: 'TS habitaciones', title: 'Seccional habitaciones', file: 'HCS-TS-HAB.dxf', format: 'DXF', status: 'COMPLETED', multiplier: 6, reviewed: true },
    { id: 'pl-r1', projectId: 'p3', name: 'TGBT', title: 'Tablero general', file: 'PFR-TGBT.dxf', format: 'DXF', status: 'COMPLETED', multiplier: 1, reviewed: true },
    { id: 'pl-r2', projectId: 'p3', name: 'TS cámaras', title: 'Seccional cámaras de frío', file: 'PFR-TS-CAM.dxf', format: 'DXF', status: 'COMPLETED', multiplier: 3, reviewed: true },
  ];

  /* Líneas del BOM. perPlan = cantidad dibujada por tablero; la cantidad a comprar multiplica por las repeticiones.
     src: DETECTOR (detectado), RULE (inferido por regla, p. ej. gabinetes y bornes), MANUAL (agregado a mano).
     brand: null = sin decisión (bloquea la cotización), 'ANY' = Cualquier marca. */
  const L = (id, projectId, typeId, attrs, perPlan, brand, extra) => Object.assign({
    id, projectId, typeId, attrs, perPlan, brand, src: 'DETECTOR', readingStatus: 'READ', linkStatus: 'AUTO', note: '' }, extra || {});
  const bomLines = [
    L('b1', 'p1', 'mccb', { polos: '4P', in: 400, icu: 50, disparo: 'Termomagnética' }, { 'pl-tgbt': 1 }, 'Schneider'),
    L('b2', 'p1', 'sec', { polos: '4P', in: 400 }, { 'pl-tgbt': 1 }, 'Schneider'),
    L('b3', 'p1', 'dps', { polos: '4P', imax: 40 }, { 'pl-tgbt': 1, 'pl-tde': 1 }, 'ANY'),
    L('b4', 'p1', 'multi', { com: 'Modbus RTU' }, { 'pl-tgbt': 1, 'pl-tde': 1 }, 'Schneider'),
    L('b5', 'p1', 'itm', { polos: '4P', in: 63, curva: 'C' }, { 'pl-tgbt': 4, 'pl-tspb': 1 }, 'Schneider'),
    L('b6', 'p1', 'itm', { polos: '4P', in: 32, curva: 'C' }, { 'pl-tgbt': 6, 'pl-tde': 2 }, 'Schneider'),
    L('b7', 'p1', 'dif', { polos: '4P', in: 63, sens: null }, { 'pl-tgbt': 1 }, 'Schneider', { note: 'La lectura no encontró la sensibilidad en la especificación.' }),
    L('b8', 'p1', 'dif', { polos: '4P', in: 40, sens: 30 }, { 'pl-tspb': 2, 'pl-tstipo': 1 }, 'Schneider'),
    L('b9', 'p1', 'dif', { polos: '2P', in: 25, sens: 30, clase: 'A' }, { 'pl-tspb': 4, 'pl-tstipo': 3, 'pl-tde': 2 }, null),
    L('b10', 'p1', 'itm', { polos: '1P+N', in: 10, curva: 'C' }, { 'pl-tspb': 8, 'pl-tstipo': 6, 'pl-tde': 4 }, 'ANY'),
    L('b11', 'p1', 'itm', { polos: '1P+N', in: 16, curva: 'C' }, { 'pl-tspb': 6, 'pl-tstipo': 5 }, 'ANY'),
    L('b12', 'p1', 'itm', { polos: '2P', in: 20, curva: 'C' }, { 'pl-tstipo': 2 }, null),
    L('b13', 'p1', 'cont', { polos: '4P', in: 25, bobina: '220 Vca' }, { 'pl-tspb': 1, 'pl-tde': 1 }, 'Schneider'),
    L('b14', 'p1', 'piloto', { color: 'Rojo', tension: '220 V' }, { 'pl-tgbt': 3, 'pl-tspb': 3, 'pl-tstipo': 3 }, 'ANY'),
    L('b15', 'p1', 'piloto', { color: 'Verde', tension: '220 V' }, { 'pl-tgbt': 3 }, 'ANY'),
    L('b16', 'p1', 'gab', { ip: 'IP55', medida: '2000×800' }, { 'pl-tgbt': 1 }, 'Schneider', { src: 'RULE', note: 'Inferido por regla: 1 gabinete por tablero, medida estimada por cantidad de módulos.' }),
    L('b17', 'p1', 'gab', { ip: 'IP43', medida: '800×600' }, { 'pl-tspb': 1, 'pl-tstipo': 1, 'pl-tde': 1 }, 'ANY', { src: 'RULE', note: 'Inferido por regla: 1 gabinete por tablero, medida estimada por cantidad de módulos.' }),
    L('b18', 'p1', 'borne', { seccion: 4 }, { 'pl-tgbt': 24, 'pl-tspb': 36, 'pl-tstipo': 28, 'pl-tde': 18 }, 'ANY', { src: 'RULE', note: 'Inferido por regla: 2 bornes por polo de salida.' }),
    // Obra 2 · Hotel Costa Serena (ya cotizada, con ofertas)
    L('h1', 'p2', 'mccb', { polos: '4P', in: 250, icu: 36 }, { 'pl-h1': 1 }, 'ANY'),
    L('h2', 'p2', 'itm', { polos: '4P', in: 32, curva: 'C' }, { 'pl-h1': 6 }, 'ANY'),
    L('h3', 'p2', 'dif', { polos: '2P', in: 25, sens: 30 }, { 'pl-h2': 3 }, 'ANY'),
    L('h4', 'p2', 'itm', { polos: '1P+N', in: 10, curva: 'C' }, { 'pl-h2': 6 }, 'ANY'),
    L('h5', 'p2', 'itm', { polos: '1P+N', in: 16, curva: 'C' }, { 'pl-h2': 4 }, 'ANY'),
    L('h6', 'p2', 'piloto', { color: 'Rojo', tension: '220 V' }, { 'pl-h1': 3 }, 'ANY'),
    L('h7', 'p2', 'gab', { ip: 'IP43', medida: '800×600' }, { 'pl-h2': 1 }, 'ANY', { src: 'RULE' }),
    // Obra 3 · Planta Frigorífica Rafaela (pedida y confirmada)
    L('r1', 'p3', 'mccb', { polos: '4P', in: 250, icu: 36 }, { 'pl-r1': 1 }, 'ABB'),
    L('r2', 'p3', 'cont', { polos: '4P', in: 25, bobina: '220 Vca' }, { 'pl-r2': 4 }, 'ABB'),
    L('r3', 'p3', 'itm', { polos: '4P', in: 32, curva: 'C' }, { 'pl-r1': 4, 'pl-r2': 2 }, 'ABB'),
  ];

  /* Símbolos que el modelo no pudo nombrar: bloquean la cotización hasta asignarlos o descartarlos. */
  const unidentified = [
    { id: 'u1', planId: 'pl-tde', x: .62, y: .41, guess: 'itm', guessAttrs: { polos: '2P', in: 20, curva: 'C' }, conf: .58, text: 'C20 2x', status: 'PENDIENTE' },
    { id: 'u2', planId: 'pl-tde', x: .81, y: .63, guess: null, guessAttrs: {}, conf: .21, text: 'K1 (?)', status: 'PENDIENTE' },
    { id: 'u3', planId: 'pl-tstipo', x: .44, y: .72, guess: 'piloto', guessAttrs: { color: 'Rojo', tension: '220 V' }, conf: .71, text: 'H3 R', status: 'PENDIENTE' },
  ];

  const projects = [
    { id: 'p1', name: 'Clínica San Martín · Etapa 1', client: 'Constructora Paraná SA', city: 'Rosario', createdAt: '2026-09-22', stage: 'revision',
      referenceTable: { file: 'CSM-E-100_referencias.dxf', rows: 27 }, owner: 'u-lucia', brandRules: { preferred: ['Schneider'], blocked: [] } },
    { id: 'p2', name: 'Hotel Costa Serena · Tableros', client: 'Grupo Costa Serena', city: 'Mar del Plata', createdAt: '2026-09-10', stage: 'comparacion',
      referenceTable: null, owner: 'u-lucia', brandRules: { preferred: [], blocked: ['Siemens'] } },
    { id: 'p3', name: 'Planta Frigorífica Rafaela', client: 'Frigorífico del Oeste SA', city: 'Rafaela', createdAt: '2026-08-18', stage: 'pedido',
      referenceTable: { file: 'PFR-referencias.dxf', rows: 14 }, owner: 'u-martin', brandRules: { preferred: ['ABB'], blocked: [] } },
    { id: 'p4', name: 'Edificio Alvear 1200', client: 'Fideicomiso Alvear', city: 'CABA', createdAt: '2026-09-29', stage: 'nuevo',
      referenceTable: null, owner: 'u-lucia', brandRules: { preferred: [], blocked: [] } },
  ];

  /* Solicitudes de cotización a distribuidores y sus ofertas editables. */
  const requests = [
    { id: 'r-0141', projectId: 'p2', code: 'SC-0141', createdAt: '2026-09-24T10:30:00', deadline: '2026-10-02', supplierIds: ['sur', 'delta', 'norte'],
      lineIds: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'h7'], alternativesAllowed: true, note: 'Entrega en obra Mar del Plata. Pago 30 días.', status: 'ABIERTA' },
    { id: 'r-0127', projectId: 'p3', code: 'SC-0127', createdAt: '2026-08-26T09:00:00', deadline: '2026-08-29', supplierIds: ['delta', 'norte'],
      lineIds: ['r1', 'r2', 'r3'], alternativesAllowed: false, note: '', status: 'ADJUDICADA' },
  ];
  const offers = [
    { id: 'o-1', requestId: 'r-0141', supplierId: 'delta', status: 'ENVIADA', submittedAt: '2026-09-25T16:40:00', validUntil: '2026-10-09', paymentTerms: '30 días', note: 'Precios con bonificación por volumen.', lines: [
      { lineId: 'h1', mode: 'CATALOGO', brand: 'ABB', unitPrice: 1653540, stock: 'CONFIRMADO', leadDays: 10 },
      { lineId: 'h2', mode: 'AJUSTADO', brand: 'ABB', unitPrice: 119800, stock: 'CONFIRMADO', leadDays: 4 },
      { lineId: 'h3', mode: 'CATALOGO', brand: 'ABB', unitPrice: 99370, stock: 'PARCIAL', stockQty: 10, leadDays: 4 },
      { lineId: 'h4', mode: 'AJUSTADO', brand: 'ABB', unitPrice: 22400, stock: 'CONFIRMADO', leadDays: 4 },
      { lineId: 'h5', mode: 'CATALOGO', brand: 'ABB', unitPrice: 24820, stock: 'CONFIRMADO', leadDays: 4 },
      { lineId: 'h6', mode: 'CATALOGO', brand: 'ABB', unitPrice: 7470, stock: 'CONFIRMADO', leadDays: 4 },
      { lineId: 'h7', mode: 'SIN_OFERTA', note: 'No trabajamos gabinetes de esa medida.' } ] },
    { id: 'o-2', requestId: 'r-0141', supplierId: 'norte', status: 'ENVIADA', submittedAt: '2026-09-26T11:05:00', validUntil: '2026-10-03', paymentTerms: 'Contado', note: '', lines: [
      { lineId: 'h1', mode: 'ALTERNATIVA', brand: 'Chint', unitPrice: 0, alt: { typeId: 'mccb', attrs: { polos: '4P', in: 250, icu: 36 }, brand: 'Chint', gama: 'NXM', code: 'CHI-NXM-250-N', unitPrice: 998000, equivalence: 'SUGERIDA', reason: 'Mismo tipo y atributos esenciales; otra gama.' }, stock: 'A_PEDIDO', leadDays: 15 },
      { lineId: 'h2', mode: 'CATALOGO', brand: 'Chint', unitPrice: 78350, stock: 'CONFIRMADO', leadDays: 9 },
      { lineId: 'h3', mode: 'CATALOGO', brand: 'Chint', unitPrice: 58950, stock: 'CONFIRMADO', leadDays: 9 },
      { lineId: 'h4', mode: 'CATALOGO', brand: 'Chint', unitPrice: 14240, stock: 'CONFIRMADO', leadDays: 9 },
      { lineId: 'h5', mode: 'CATALOGO', brand: 'Chint', unitPrice: 14720, stock: 'DESCONOCIDO', leadDays: 9 },
      { lineId: 'h6', mode: 'CATALOGO', brand: 'Chint', unitPrice: 4430, stock: 'CONFIRMADO', leadDays: 9 },
      { lineId: 'h7', mode: 'CATALOGO', brand: 'Chint', unitPrice: 290900, stock: 'A_PEDIDO', leadDays: 20 } ] },
    { id: 'o-3', requestId: 'r-0141', supplierId: 'sur', status: 'PENDIENTE', lines: [] },
    { id: 'o-4', requestId: 'r-0127', supplierId: 'delta', status: 'ENVIADA', submittedAt: '2026-08-27T12:00:00', validUntil: '2026-09-10', paymentTerms: '30 días', lines: [
      { lineId: 'r1', mode: 'CATALOGO', brand: 'ABB', unitPrice: 1612000, stock: 'CONFIRMADO', leadDays: 10 },
      { lineId: 'r2', mode: 'CATALOGO', brand: 'ABB', unitPrice: 139000, stock: 'CONFIRMADO', leadDays: 4 },
      { lineId: 'r3', mode: 'CATALOGO', brand: 'ABB', unitPrice: 128500, stock: 'CONFIRMADO', leadDays: 4 } ] },
    { id: 'o-5', requestId: 'r-0127', supplierId: 'norte', status: 'ENVIADA', submittedAt: '2026-08-28T09:20:00', validUntil: '2026-09-05', paymentTerms: 'Contado', lines: [
      { lineId: 'r1', mode: 'SIN_OFERTA' },
      { lineId: 'r2', mode: 'CATALOGO', brand: 'ABB', unitPrice: 131200, stock: 'A_PEDIDO', leadDays: 14 },
      { lineId: 'r3', mode: 'CATALOGO', brand: 'ABB', unitPrice: 121300, stock: 'CONFIRMADO', leadDays: 9 } ] },
  ];
  const orders = [
    { id: 'oc-0098', code: 'OC-0098', requestId: 'r-0127', projectId: 'p3', supplierId: 'delta', createdAt: '2026-08-29T15:00:00', status: 'CONFIRMED', respondedAt: '2026-08-29T18:10:00',
      lines: [{ lineId: 'r1', qty: 1, unitPrice: 1612000, brand: 'ABB' }] },
    { id: 'oc-0099', code: 'OC-0099', requestId: 'r-0127', projectId: 'p3', supplierId: 'norte', createdAt: '2026-08-29T15:00:00', status: 'CONFIRMED', respondedAt: '2026-08-30T10:25:00',
      lines: [{ lineId: 'r2', qty: 12, unitPrice: 131200, brand: 'ABB' }, { lineId: 'r3', qty: 10, unitPrice: 121300, brand: 'ABB' }] },
  ];

  /* Presupuesto de venta del tablerista al cliente final (escenarios de margen). */
  const budgets = {
    p1: { laborHoursPerBoard: 26, laborRate: 21500, extrasPct: 6, contingencyPct: 5, marginPct: 22, validityDays: 7, inflationMonthlyPct: 2.4, scenario: 'base' },
    p2: { laborHoursPerBoard: 22, laborRate: 21500, extrasPct: 5, contingencyPct: 4, marginPct: 20, validityDays: 10, inflationMonthlyPct: 2.4, scenario: 'base' },
    p3: { laborHoursPerBoard: 30, laborRate: 20000, extrasPct: 6, contingencyPct: 5, marginPct: 24, validityDays: 7, inflationMonthlyPct: 2.6, scenario: 'base' },
    p4: { laborHoursPerBoard: 24, laborRate: 21500, extrasPct: 6, contingencyPct: 5, marginPct: 22, validityDays: 7, inflationMonthlyPct: 2.4, scenario: 'base' },
  };

  const team = [
    { id: 'u-lucia', name: 'Lucía Ferreyra', initials: 'LF', area: 'Ingeniería', email: 'lucia@tablerosandes.example' },
    { id: 'u-martin', name: 'Martín Ruiz', initials: 'MR', area: 'Compras', email: 'compras@tablerosandes.example' },
    { id: 'u-daniel', name: 'Daniel Ortega', initials: 'DO', area: 'Dirección', email: 'daniel@tablerosandes.example' },
  ];

  const seed = {
    version: 3,
    today: TODAY,
    session: { role: 'ENGINEER', userId: 'u-lucia', supplierId: 'sur', lastProjectId: 'p1' },
    company: { name: 'Tableros Andes SRL', cuit: '30-00000000-0 (ficticio)', city: 'Rosario', brandRules: { preferred: ['Schneider', 'ABB'], blocked: [] } },
    team, suppliers, types, catalog, plans, bomLines, unidentified, projects, requests, offers, orders, budgets,
    comments: [
      { id: 'c1', entity: 'line:b7', projectId: 'p1', who: 'u-daniel', at: '2026-09-29T09:14:00', text: 'El diferencial general del TGBT va de 300 mA, confirmalo con el unifilar.', resolved: false },
      { id: 'c2', entity: 'plan:pl-tstipo', projectId: 'p1', who: 'u-martin', at: '2026-09-29T11:02:00', text: '¿Son 4 pisos iguales o el 4.º cambia? Si cambia hay que separarlo.', resolved: false },
    ],
    activity: [
      { id: 'a1', projectId: 'p1', at: '2026-09-28T14:18:00', who: 'sistema', text: '4 planos procesados en 3 min 17 s. 3 símbolos quedaron sin identificar.' },
      { id: 'a2', projectId: 'p1', at: '2026-09-28T15:40:00', who: 'u-lucia', text: 'Marcó TGBT y TS-PB como revisados.' },
      { id: 'a3', projectId: 'p2', at: '2026-09-24T10:30:00', who: 'u-lucia', text: 'Envió la solicitud SC-0141 a 3 distribuidores.' },
      { id: 'a4', projectId: 'p2', at: '2026-09-25T16:40:00', who: 'delta', text: 'Electro Delta envió su oferta.' },
      { id: 'a5', projectId: 'p2', at: '2026-09-26T11:05:00', who: 'norte', text: 'Norte Materiales envió su oferta con 1 alternativa.' },
    ],
    notifications: [
      { id: 'n1', role: 'ENGINEER', at: '2026-09-26T11:05:00', title: 'Nueva oferta en SC-0141', body: 'Norte Materiales respondió con 1 alternativa para revisar.', href: 'd-comparar.html?r=r-0141', read: false },
      { id: 'n2', role: 'SUPPLIER', supplierId: 'sur', at: '2026-09-24T10:31:00', title: 'Solicitud SC-0141 recibida', body: 'Tableros Andes SRL pide 7 materiales. Vence el 2 de octubre.', href: 'd-prov-oferta.html?r=r-0141', read: false },
    ],
    outbox: [
      { id: 'e1', to: 'ventas@sur-electrica.example', at: '2026-09-24T10:31:00', subject: 'Nueva solicitud de cotización SC-0141', body: 'Tableros Andes SRL te pidió cotización de 7 materiales. Respondé antes del 2/10 desde liard.' },
    ],
    automations: [
      { id: 'au1', when: 'PLANOS_PROCESADOS', then: 'AVISAR_COMPRAS', label: 'Cuando todos los planos de una obra terminan de procesarse, avisar a Compras', enabled: true },
      { id: 'au2', when: 'OFERTA_RECIBIDA', then: 'AVISAR_INGENIERIA', label: 'Cuando llega una oferta, avisar a Ingeniería por correo', enabled: true },
      { id: 'au3', when: 'VENCE_SOLICITUD_24H', then: 'RECORDAR_PROVEEDOR', label: 'Un día antes del vencimiento, recordar a los distribuidores que no respondieron', enabled: false },
      { id: 'au4', when: 'ADJUDICACION_SUPERA', then: 'PEDIR_APROBACION', label: 'Si una adjudicación supera ARS 30.000.000, pedir aprobación de Dirección', enabled: true, threshold: 30000000 },
    ],
    approvals: [],
    billing: {
      engineer: { plan: 'Estudio', priceUSD: 150, boardsIncluded: 40, boardsUsed: 18, extraBoardUSD: 2.5, cycleEnds: '2026-10-14', invoices: [
        { id: 'F-0007', period: 'Agosto 2026', usd: 150, status: 'Pagada' }, { id: 'F-0008', period: 'Septiembre 2026', usd: 157.5, status: 'Pagada' } ] },
      supplier: { plan: 'Distribuidor', priceUSD: 120, leadFeeUSD: 4, leadsThisMonth: 9, leadsFree: 5, cycleEnds: '2026-10-14' },
      fx: { usdArs: 1245, source: 'Cotización simulada para la demo' },
    },
    ai: {
      monthlyBudgetUSD: 40, alertAtPct: 80, hardLimit: true,
      ledger: [
        { at: '2026-09-28T14:12:00', kind: 'Detección', projectId: 'p1', ref: 'TGBT', usd: 1.02 },
        { at: '2026-09-28T14:14:00', kind: 'Detección', projectId: 'p1', ref: 'TS-PB', usd: 0.74 },
        { at: '2026-09-28T14:15:00', kind: 'Detección', projectId: 'p1', ref: 'TS-P tipo', usd: 0.61 },
        { at: '2026-09-28T14:18:00', kind: 'Detección', projectId: 'p1', ref: 'TDE', usd: 0.88 },
        { at: '2026-09-28T14:20:00', kind: 'Lectura BOM', projectId: 'p1', ref: '18 líneas', usd: 0.04 },
        { at: '2026-09-10T12:00:00', kind: 'Detección', projectId: 'p2', ref: '2 planos', usd: 1.31 },
        { at: '2026-09-18T09:00:00', kind: 'Asistente', projectId: 'p2', ref: 'Revisión de ofertas', usd: 0.09 },
      ],
    },
    ui: {},
  };

  window.B = { seed, TODAY };
})();
