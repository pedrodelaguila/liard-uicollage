/* liard · datos de ejemplo compartidos (semilla del estado). TODO ES FICTICIO: empresas, personas, obras y precios.
   Precios en ARS sin IVA (así los guarda la app: el IVA se calcula al presentar). Dólar de referencia BNA venta.
   Estados con los enums reales de back/prisma/schema.prisma. Atributos con los nombres de seed/components (dev).
   Cada área puede sumar sus propios datos en data-<area>.js, pero las entidades de acá (obra, líneas, proveedores,
   pedidos, tableros) se leen de acá y no se duplican. */
(function () {
  const HOY = '2026-10-01';

  const usuarios = {
    martina: { id: 'martina', n: 'Martina Giménez', r: 'Ingeniera de proyecto', rol: 'ENGINEER', ini: 'MG', c: '' },
    lucas: { id: 'lucas', n: 'Lucas Ferreyra', r: 'Presupuestos', rol: 'ENGINEER', ini: 'LF', c: 'c2' },
    sofia: { id: 'sofia', n: 'Sofía Benítez', r: 'Compras', rol: 'ENGINEER', ini: 'SB', c: 'c3' },
    hernan: { id: 'hernan', n: 'Hernán Rossi', r: 'Dirección', rol: 'ENGINEER', ini: 'HR', c: 'c5' },
    ramiro: { id: 'ramiro', n: 'Ramiro Ojeda', r: 'Jefe de taller', rol: 'ENGINEER', ini: 'RO', c: 'c4' },
    diego: { id: 'diego', n: 'Diego Acosta', r: 'Jefe de obra', rol: 'ENGINEER', ini: 'DA', c: 'c2' },
    julian: { id: 'julian', n: 'Julián Roldán', r: 'Vendedor · Eléctrica Norte', rol: 'SUPPLIER', ini: 'JR', c: '' },
    carla: { id: 'carla', n: 'Carla Méndez', r: 'Catálogo · Eléctrica Norte', rol: 'SUPPLIER', ini: 'CM', c: 'c3' },
  };

  const empresa = { n: 'Tableros Delta S.R.L.', ciudad: 'Ezeiza, Buenos Aires', plan: 'Profesional', usuarios: 6 };

  const proyectos = [
    { id: 'p1', n: 'Hospital Regional Cañuelas · Pabellón B', cliente: 'Constructora Ribera S.A.', estado: 'Requiere Atención', planos: { total: 7, completed: 3, processing: 1, pending: 1, error: 1, stale: 1 }, actualizado: '2026-09-30', entrega: '2026-11-20', monto: 71800000, resp: 'martina' },
    { id: 'p2', n: 'Torre Alem 1450 · Oficinas', cliente: 'Desarrollos Puerto S.A.', estado: 'Listo', planos: { total: 12, completed: 12, processing: 0, pending: 0, error: 0, stale: 0 }, actualizado: '2026-09-26', entrega: '2026-10-15', monto: 58300000, resp: 'martina' },
    { id: 'p3', n: 'Planta Norte · Ampliación línea 3', cliente: 'Alimentos del Plata S.A.', estado: 'Requiere Atención', planos: { total: 5, completed: 3, processing: 0, pending: 0, error: 1, stale: 1 }, actualizado: '2026-09-28', entrega: '2026-12-05', monto: 57900000, resp: 'lucas' },
    { id: 'p4', n: 'Data center Pilar · Sala 2', cliente: 'Nube Sur S.A.', estado: 'En proceso', planos: { total: 4, completed: 1, processing: 2, pending: 1, error: 0, stale: 0 }, actualizado: '2026-10-01', entrega: '2027-01-30', monto: 126000000, resp: 'martina' },
    { id: 'p5', n: 'Escuela Técnica N.º 7 · Talleres', cliente: 'Municipio de Ezeiza', estado: 'Sin Planos', planos: { total: 0, completed: 0, processing: 0, pending: 0, error: 0, stale: 0 }, actualizado: '2026-09-29', entrega: '2027-03-01', monto: 0, resp: 'lucas' },
  ];

  // Planos del proyecto principal (p1). status = ElectricalPlanStatus; multiplier = repeticiones del tablero.
  const planos = [
    { id: 'tgbt', cod: 'TGBT', n: 'Tablero general de baja tensión', fmt: 'DXF', status: 'COMPLETED', mult: 1, comp: 58, sinId: 0, act: '2026-09-29' },
    { id: 'tsgpb', cod: 'TSG-PB', n: 'Seccional general planta baja', fmt: 'DXF', status: 'COMPLETED', mult: 1, comp: 41, sinId: 0, act: '2026-09-29' },
    { id: 'tspiso', cod: 'TS-PISO', n: 'Seccional piso tipo (1.º a 6.º)', fmt: 'DXF', status: 'COMPLETED', mult: 6, comp: 23, sinId: 0, act: '2026-09-29' },
    { id: 'tsbombas', cod: 'TS-BOMBAS', n: 'Tablero de bombas y presurización', fmt: 'DXF', status: 'STALE', mult: 1, comp: 19, sinId: 3, act: '2026-09-30' },
    { id: 'tsasc', cod: 'TS-ASC', n: 'Tablero de ascensores', fmt: 'DXF', status: 'ERROR', mult: 1, comp: 0, sinId: 0, act: '2026-09-30', error: 'El servicio de detección tardó más de lo permitido (504). El plano es demasiado grande: recortalo en zonas y volvé a procesar.' },
    { id: 'tsups', cod: 'TS-UPS', n: 'Tablero UPS quirófanos', fmt: 'DXF', status: 'PROCESSING', mult: 1, comp: 0, sinId: 0, act: '2026-10-01' },
    { id: 'tsext', cod: 'TS-EXT', n: 'Iluminación exterior y parque', fmt: 'PDF', status: 'PENDING', mult: 1, comp: 0, sinId: 0, act: '2026-10-01' },
  ];

  // Líneas del BOM consolidado del proyecto p1.
  //   tipo: clave del componente base (null = no hay componente base para eso)
  //   attrs: valores por atributo; faltan = atributos esenciales (required) sin valor
  //   dib: cantidad dibujada (suma de planos sin repetir) · comprar: × repeticiones (+ reserva si hay regla)
  //   org: det (detectado en plano) | inf (inferido por IA) | reg (por regla de la empresa) | man (manual)
  //   estado: ready | warning | blocked  (lineState.ts: "Lista" / "Se puede cotizar con reparos" / "Bloquea la cotización")
  //   fuentes: planos de donde sale la cantidad
  //   base: precio de referencia ARS sin IVA (para generar ofertas)
  const lineas = [
    { id: 'l01', mat: 'Interruptor termomagnético', spec: '2×16 A curva C 6 kA', tipo: 'THERMOMAGNETIC_BREAKER', attrs: { Polos: '2', 'Corriente nominal': '16 A', 'Curva de disparo': 'C', 'Poder de corte': '6 kA' }, faltan: [], marca: 'Schneider Electric', gama: 'Acti9 iC60N', dib: 42, comprar: 132, org: 'det', estado: 'ready', fuentes: ['TSG-PB 12', 'TS-PISO 18 ×6', 'TS-BOMBAS 6', 'TGBT 6'], base: 38500, u: 'u', conf: 0.97 },
    { id: 'l02', mat: 'Interruptor termomagnético', spec: '4×63 A curva C 10 kA', tipo: 'THERMOMAGNETIC_BREAKER', attrs: { Polos: '4', 'Corriente nominal': '63 A', 'Curva de disparo': 'C', 'Poder de corte': '10 kA' }, faltan: [], marca: 'Schneider Electric', gama: 'Acti9 iC60H', dib: 8, comprar: 18, org: 'det', estado: 'ready', fuentes: ['TGBT 6', 'TS-PISO 2 ×6'], base: 214000, u: 'u', conf: 0.95 },
    { id: 'l03', mat: 'Interruptor diferencial', spec: '2×40 A 30 mA clase AC', tipo: 'RESIDUAL_CURRENT_BREAKER', attrs: { Polos: '2', 'Corriente nominal': '40 A', Sensibilidad: '30 mA', 'Clase / tipo': 'AC' }, faltan: [], marca: 'Schneider Electric', gama: 'Acti9 iID', dib: 24, comprar: 74, org: 'det', estado: 'ready', fuentes: ['TSG-PB 8', 'TS-PISO 10 ×6', 'TS-BOMBAS 6'], base: 98000, u: 'u', conf: 0.96 },
    { id: 'l04', mat: 'Interruptor diferencial', spec: '4×40 A 30 mA superinmunizado', tipo: 'RESIDUAL_CURRENT_BREAKER', attrs: { Polos: '4', 'Corriente nominal': '40 A', Sensibilidad: '30 mA', 'Clase / tipo': 'SI' }, faltan: [], marca: 'Schneider Electric', gama: 'Acti9 iID', dib: 4, comprar: 4, org: 'det', estado: 'ready', fuentes: ['TS-UPS 4'], base: 262000, u: 'u', conf: 0.91 },
    { id: 'l05', mat: 'Interruptor de caja moldeada', spec: '4×250 A 36 kA TM', tipo: 'MOLDED_CASE_BREAKER', attrs: { Polos: '4', 'Corriente nominal': '250 A', 'Poder de corte': '36 kA', 'Unidad de disparo': 'TM' }, faltan: [], marca: 'Schneider Electric', gama: 'Compact NSX', dib: 2, comprar: 2, org: 'det', estado: 'ready', fuentes: ['TGBT 2'], base: 2940000, u: 'u', conf: 0.93 },
    { id: 'l06', mat: 'Interruptor de caja moldeada', spec: 'NSX630F 4P', tipo: 'MOLDED_CASE_BREAKER', attrs: { Polos: '4', 'Corriente nominal': '630 A', 'Poder de corte': '', 'Unidad de disparo': 'electrónica' }, faltan: [], reparo: 'Falta el poder de corte (no es esencial): se cotiza sin filtrar por kA.', marca: 'Schneider Electric', gama: 'Compact NSX', dib: 1, comprar: 1, org: 'inf', estado: 'warning', fuentes: ['TGBT 1'], base: 7850000, u: 'u', conf: 0.78 },
    { id: 'l07', mat: 'Contactor', spec: '3P 25 A bobina 220 V CA AC3', tipo: 'CONTACTOR', attrs: { Polos: '3', 'Corriente nominal': '25 A', 'Tensión de bobina (mín.)': '220 V', 'Tipo de tensión de bobina': 'CA', 'Categoría de utilización': 'AC3' }, faltan: [], marca: 'Siemens', gama: 'Sirius 3RT2', dib: 6, comprar: 6, org: 'det', estado: 'ready', fuentes: ['TS-BOMBAS 6'], base: 116000, u: 'u', conf: 0.94 },
    { id: 'l08', mat: 'Guardamotor', spec: 'Regulación 9–14 A', tipo: 'MOTOR_PROTECTION_BREAKER', attrs: { 'Regulación mínima': '9 A', 'Regulación máxima': '14 A', 'Poder de corte': '' }, faltan: [], marca: 'Schneider Electric', gama: 'TeSys GV2', dib: 4, comprar: 4, org: 'det', estado: 'ready', fuentes: ['TS-BOMBAS 4'], base: 142000, u: 'u', conf: 0.92 },
    { id: 'l09', mat: 'Seccionador bajo carga con fusible', spec: '3P NH00 tripolar', tipo: 'FUSED_LOAD_BREAK_SWITCH', attrs: { Polos: '3', 'Corriente nominal': '', 'Tipo de fusible': 'NH', 'Tamaño del fusible': 'NH00' }, faltan: ['Corriente nominal'], marca: '', gama: '', dib: 2, comprar: 2, org: 'det', estado: 'blocked', fuentes: ['TS-BOMBAS 2'], base: 486000, u: 'u', conf: 0.88, motivo: 'Falta el atributo esencial «Corriente nominal». El plano dice «NH00» pero no la corriente del seccionador.' },
    { id: 'l10', mat: 'Descargador de sobretensiones', spec: 'Clase 2 · 40 kA · 4P', tipo: 'SURGE_PROTECTION_DEVICE', attrs: { 'Corriente máxima de descarga': '40 kA', 'Tipo / clase': '2', Polos: '4' }, faltan: [], marca: 'ABB', gama: 'OVR', dib: 2, comprar: 2, org: 'inf', estado: 'ready', fuentes: ['TGBT 1', 'TS-UPS 1'], base: 392000, u: 'u', conf: 0.81 },
    { id: 'l11', mat: 'Instrumento de medición multifunción', spec: 'PM5100 RS485 Modbus', tipo: 'MULTIFUNCTION_METER', attrs: { Comunicación: 'RS485 Modbus', Formato: '', 'Tensión de alimentación (mín.)': '220 V', 'Tipo de tensión de alimentación': 'CA' }, faltan: ['Formato'], marca: 'Schneider Electric', gama: 'PowerLogic', dib: 1, comprar: 1, org: 'det', estado: 'blocked', fuentes: ['TGBT 1'], base: 1160000, u: 'u', conf: 0.9, motivo: 'Información insuficiente: falta «Formato» (96×96 frontal o riel DIN). Sin eso no hay match.' },
    { id: 'l12', mat: 'Sensor de corriente', spec: 'TI 630/5 A clase 0,5', tipo: 'CURRENT_SENSOR', attrs: { 'Corriente primaria': '630 A', 'Corriente secundaria': '5 A', 'Clase de precisión': '0.5' }, faltan: [], marca: '', gama: '', dib: 3, comprar: 3, org: 'det', estado: 'ready', fuentes: ['TGBT 3'], base: 62500, u: 'u', conf: 0.95 },
    { id: 'l13', mat: 'Ojos de buey', spec: 'Ø22 mm rojo 220 V CA', tipo: 'PILOT_LIGHT', attrs: { Diámetro: '22 mm', Color: 'rojo', 'Tensión (mín.)': '220 V', 'Tipo de tensión': 'CA' }, faltan: [], marca: 'Sica', gama: '', dib: 12, comprar: 42, org: 'det', estado: 'ready', fuentes: ['TGBT 3', 'TSG-PB 3', 'TS-PISO 1 ×6', 'TS-BOMBAS 6'], base: 9800, u: 'u', conf: 0.98 },
    { id: 'l14', mat: 'Selectora', spec: '3 posiciones Ø22 mm', tipo: 'SELECTOR_SWITCH', attrs: { Posiciones: '3', Diámetro: '22 mm' }, faltan: [], marca: 'Sica', gama: '', dib: 4, comprar: 4, org: 'det', estado: 'ready', fuentes: ['TS-BOMBAS 4'], base: 21400, u: 'u', conf: 0.9 },
    { id: 'l15', mat: 'Bornera', spec: '4 mm² tornillo', tipo: 'TERMINAL_BLOCK', attrs: { Sección: '4 mm²', 'Tipo de conexión': 'tornillo' }, faltan: [], marca: 'Zoloda', gama: '', dib: 60, comprar: 210, org: 'reg', regla: 'Regla «Borneras por salida»: 1 bornera por polo de cada salida + 10 % de reserva.', estado: 'ready', fuentes: ['Regla de la empresa'], base: 2300, u: 'u', conf: null },
    { id: 'l16', mat: 'Cable unipolar', spec: '2,5 mm² IRAM NM 247-3', tipo: 'SINGLE_CORE_CABLE', attrs: { Sección: '2,5 mm²', Color: 'marrón', Norma: 'IRAM NM 247-3' }, faltan: [], marca: 'Prysmian', gama: 'Superastic Flex', dib: 320, comprar: 1120, org: 'inf', estado: 'ready', fuentes: ['Inferido: largo medio por salida'], base: 1150, u: 'm', conf: 0.7 },
    { id: 'l17', mat: 'Cable subterráneo LSOH', spec: '4×10 mm² + PE', tipo: 'UNDERGROUND_CABLE_LSOH', attrs: { 'Cantidad de conductores': '4', Sección: '10 mm²', 'Material del conductor': 'Cu', Aislación: 'LSOH', Norma: 'IRAM 62266' }, faltan: [], marca: 'Prysmian', gama: 'Afumex', dib: 180, comprar: 180, org: 'det', estado: 'ready', fuentes: ['TGBT 180 m'], base: 21500, u: 'm', conf: 0.86 },
    { id: 'l18', mat: 'Gabinete metálico', spec: '1800×800×400 mm IP55', tipo: null, attrs: {}, faltan: [], marca: 'Genrod', gama: '', dib: 1, comprar: 1, org: 'man', estado: 'blocked', fuentes: ['Cargado a mano'], base: 1950000, u: 'u', conf: null, motivo: 'No hay componente base para gabinetes en el catálogo base: hoy no se puede matchear (Sprint 5: matching para todos los componentes).' },
  ];

  // Distribuidores (ficha Provider de cada cuenta SUPPLIER).
  const proveedores = [
    { id: 'en', n: 'Eléctrica Norte S.A.', zona: 'Pilar · GBA Norte', marcas: ['Schneider Electric', 'ABB', 'Prysmian'], resp: '3 h', conf: 0.94, items: 18420, act: '2026-09-29', min: 300000, plazo: [1, 5], f: 1.0 },
    { id: 'ohm', n: 'Distribuidora Ohm', zona: 'CABA', marcas: ['Siemens', 'Schneider Electric', 'Chint'], resp: '5 h', conf: 0.88, items: 9310, act: '2026-09-17', min: 150000, plazo: [2, 7], f: 0.965 },
    { id: 'volta', n: 'Casa Volta Mayorista', zona: 'La Plata', marcas: ['ABB', 'Sica', 'Genrod', 'Prysmian'], resp: '1 día', conf: 0.81, items: 12780, act: '2026-08-30', min: 500000, plazo: [3, 12], f: 0.93 },
    { id: 'sur', n: 'Electro Sur', zona: 'Avellaneda', marcas: ['Schneider Electric', 'WEG', 'Prysmian', 'Zoloda'], resp: '6 h', conf: 0.9, items: 7640, act: '2026-09-24', min: 200000, plazo: [1, 4], f: 1.035 },
  ];

  // Ofertas por línea y distribuidor (QuoteLineOffer): precio unitario ARS sin IVA, stock, plazo en días.
  // Se generan deterministas para que los totales cierren igual en todas las pantallas.
  const sinStock = { 'volta:l05': 1, 'ohm:l06': 1, 'en:l17': 1, 'sur:l10': 1, 'sur:l12': 1 };
  const noVende = { 'ohm:l13': 1, 'ohm:l14': 1, 'ohm:l15': 1, 'sur:l07': 1, 'volta:l07': 1, 'sur:l13': 1, 'sur:l14': 1, 'en:l14': 1 };
  const ofertas = {};
  lineas.forEach((l, i) => {
    if (l.estado === 'blocked') return; // NOT_FOUND: no hay match
    ofertas[l.id] = {};
    proveedores.forEach((p, j) => {
      const k = p.id + ':' + l.id;
      if (noVende[k]) return;
      const ruido = 1 + (((i * 7 + j * 13) % 9) - 4) / 100;
      const precio = Math.round(l.base * p.f * ruido / 10) * 10;
      ofertas[l.id][p.id] = {
        precio, stock: sinStock[k] ? 0 : Math.max(l.comprar, Math.round(l.comprar * (1.5 + j))),
        plazo: sinStock[k] ? 21 + j * 7 : p.plazo[0] + ((i + j) % (p.plazo[1] - p.plazo[0] + 1)),
        codigo: (p.id === 'ohm' && l.marca === 'Schneider Electric') ? 'A9F' + (74000 + i * 37) : (l.gama ? l.gama.split(' ')[0].toUpperCase().slice(0, 4) + '-' + (1000 + i * 11) : 'GEN-' + (2000 + i)),
        actualizado: p.act, vence: p.id === 'volta' ? '2026-09-30' : '2026-10-15',
      };
    });
  });

  // Pedidos (PurchaseOrderBatch → PurchaseOrder por distribuidor). status = PurchaseOrderStatus.
  const pedidos = [
    { id: 'PED-2026-031', proyecto: 'p1', enviado: '2026-09-30', lineas: 14, sinAsignar: 3, ordenes: [
      { id: 'OC-2026-031-1', prov: 'en', status: 'SENT', vence: '2026-10-02', total: 21894500, lineas: 7 },
      { id: 'OC-2026-031-2', prov: 'ohm', status: 'CONFIRMED', respondido: '2026-09-30', total: 4820300, lineas: 4 },
      { id: 'OC-2026-031-3', prov: 'sur', status: 'SENT', vence: '2026-10-02', total: 1786000, lineas: 3 },
    ] },
    { id: 'PED-2026-027', proyecto: 'p2', enviado: '2026-09-18', lineas: 31, sinAsignar: 0, ordenes: [
      { id: 'OC-2026-027-1', prov: 'en', status: 'CONFIRMED', respondido: '2026-09-18', total: 38410000, lineas: 19 },
      { id: 'OC-2026-027-2', prov: 'volta', status: 'REJECTED', respondido: '2026-09-19', total: 6120000, lineas: 8, motivo: 'Sin stock de Compact NSX 250 hasta noviembre.' },
      { id: 'OC-2026-027-3', prov: 'ohm', status: 'CONFIRMED', respondido: '2026-09-19', total: 5980000, lineas: 8 },
    ] },
    { id: 'PED-2026-022', proyecto: 'p3', enviado: '2026-09-02', lineas: 12, sinAsignar: 1, ordenes: [
      { id: 'OC-2026-022-1', prov: 'volta', status: 'EXPIRED', vence: '2026-09-05', total: 3310000, lineas: 6 },
      { id: 'OC-2026-022-2', prov: 'sur', status: 'CONFIRMED', respondido: '2026-09-03', total: 2980000, lineas: 5 },
    ] },
  ];

  // Tableros físicos (fabricación). linea = id de línea del BOM que aporta cada aparato.
  const tableros = [
    { id: 'tgbt', cod: 'TGBT', n: 'Tablero general de baja tensión', plano: 'tgbt', gabinete: '1800×800×400 IP55', estado: 'armado', avance: 62, frena: null, ensayo: 'pendiente', resp: 'ramiro', serie: 'TD-26-0412' },
    { id: 'tsgpb', cod: 'TSG-PB', n: 'Seccional general planta baja', plano: 'tsgpb', gabinete: '1200×600×250 IP43', estado: 'ensayo', avance: 95, frena: null, ensayo: 'en curso', resp: 'ramiro', serie: 'TD-26-0413' },
    { id: 'tspiso', cod: 'TS-PISO', n: 'Seccional piso tipo', plano: 'tspiso', gabinete: '800×600×200 IP43', estado: 'armado', avance: 50, unidades: 6, listas: 3, frena: null, ensayo: 'pendiente', resp: 'ramiro', serie: 'TD-26-0414…0419' },
    { id: 'tsbombas', cod: 'TS-BOMBAS', n: 'Tablero de bombas y presurización', plano: 'tsbombas', gabinete: '1000×800×300 IP55', estado: 'frenado', avance: 30, frena: 'l09', ensayo: 'pendiente', resp: 'ramiro', serie: 'TD-26-0420' },
  ];

  // Composición del TGBT para 3D, frente 2D y lista de armado (filas de arriba hacia abajo; ancho en módulos de 18 mm).
  const tgbt = {
    gabinete: { alto: 1800, ancho: 800, prof: 400 },
    filas: [
      { n: 'Entrada y medición', items: [ { linea: 'l06', cant: 1, mod: 14, ref: 'Q0' }, { linea: 'l12', cant: 3, mod: 3, ref: 'TI1–TI3' }, { linea: 'l11', cant: 1, mod: 5, ref: 'PM1' }, { linea: 'l10', cant: 1, mod: 4, ref: 'F1' } ] },
      { n: 'Salidas generales', items: [ { linea: 'l05', cant: 2, mod: 10, ref: 'Q1–Q2' }, { linea: 'l02', cant: 3, mod: 4, ref: 'Q3–Q5' } ] },
      { n: 'Servicios propios', items: [ { linea: 'l02', cant: 3, mod: 4, ref: 'Q6–Q8' }, { linea: 'l01', cant: 6, mod: 2, ref: 'Q9–Q14' } ] },
      { n: 'Señalización', items: [ { linea: 'l13', cant: 3, mod: 2, ref: 'H1–H3' } ] },
      { n: 'Borneras', items: [ { linea: 'l15', cant: 36, mod: 1, ref: 'X1' } ] },
    ],
  };

  const cambio = { dolarBNA: 1540, fecha: '2026-09-30', iva: 21 };

  const consumoIA = {
    mes: 'Septiembre 2026', topeUsd: 120, usadoUsd: 86.4, aviso: 0.8,
    areas: [
      { k: 'Detección de planos', usd: 61.2, n: '23 planos' },
      { k: 'Lectura de líneas del BOM', usd: 9.8, n: '412 líneas (281 desde caché)' },
      { k: 'Asistente', usd: 15.4, n: '74 consultas' },
    ],
    porUsuario: [ { u: 'martina', usd: 48.1 }, { u: 'lucas', usd: 22.7 }, { u: 'sofia', usd: 9.9 }, { u: 'hernan', usd: 5.7 } ],
  };

  const avisos = [
    { id: 'a1', t: 'Distribuidora Ohm confirmó OC-2026-031-2', d: '4 líneas · $ 4.820.300 · entrega en 3 días', i: 'circle-check', tipo: 'ok', cuando: 'hace 2 h', href: 'd-com-pedidos.html' },
    { id: 'a2', t: 'Eléctrica Norte propone un cambio en 2 líneas', d: 'Contraoferta: sin stock del Compact NSX630F, ofrece un ABB Tmax XT5 630 4P equivalente; Compact NSX 250 con plazo de 12 días', i: 'repeat', tipo: 'vi', cuando: 'hace 3 h', href: 'd-com-pedidos.html?vista=contraoferta' },
    { id: 'a3', t: 'TS-ASC no se pudo procesar', d: 'El servicio de detección tardó más de lo permitido (504)', i: 'triangle-alert', tipo: 'er', cuando: 'ayer', href: 'd-ing-proyecto.html?estado=error' },
    { id: 'a4', t: 'El TS-BOMBAS está frenado en el taller', d: 'Falta el seccionador NH00: la línea no se pudo cotizar', i: 'octagon-pause', tipo: 'wa', cuando: 'ayer', href: 'd-tal-taller.html' },
    { id: 'a5', t: 'La lista de Casa Volta tiene 32 días', d: 'Sus precios vencieron el 30/09: pedí actualización antes de adjudicar', i: 'clock-alert', tipo: 'wa', cuando: 'hoy', href: 'd-com-recotizar.html' },
  ];

  window.B = {
    HOY, usuarios, empresa, proyectos, planos, lineas, proveedores, ofertas, pedidos, tableros, tgbt, cambio, consumoIA, avisos,
    proyecto: 'p1',
    navCounts: { pedidos: { n: 2, w: true }, taller: { n: 1, w: true }, 'p-recibidas': 3 },
    avisosSinLeer: { 'm-avisos': 3, 'm-aprobar': 2, 'm-p-solicitudes': 3 },
  };
})();
