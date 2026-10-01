/* liard · datos propios del área D (distribuidor). Se carga después de data.js.
   Solo datos de referencia (no cambian): lo que cambia vive en el estado compartido
   (pedidos[k].ordenes[j].status / .contra para las OC de data.js) o en x.prov.* para lo privado del área.
   El distribuidor es «en» (Eléctrica Norte S.A.) de data.js. TODO ES FICTICIO. */
(function () {
  const B = window.B;
  const of = (lin, campo) => (B.ofertas[lin] && B.ofertas[lin].en ? B.ofertas[lin].en[campo] : null);
  const L0 = id => B.lineas.find(l => l.id === id);

  // Compradores. El nombre y el contacto se revelan recién cuando el distribuidor confirma (BuyerContactDto, 409 antes).
  const compradores = {
    delta: { n: 'Tableros Delta S.R.L.', anon: 'Tablerista de Ezeiza', zona: 'Ezeiza, Buenos Aires', pedidos: 14, adjudica: 0.71, verificado: true,
      contacto: { nombre: 'Sofía Benítez', cargo: 'Compras', tel: '+54 11 4232-7781', mail: 'compras@tablerosdelta.com.ar', cuit: '30-71234567-8', horario: 'Lunes a viernes, 8 a 17 h', metodo: 'WhatsApp', notas: 'Recepción en planta: Av. Cañuelas 1840, Ezeiza. Avisar 24 h antes.' } },
    msur: { n: 'Montajes del Sur S.R.L.', anon: 'Tablerista de Quilmes', zona: 'Quilmes, Buenos Aires', pedidos: 6, adjudica: 0.5, verificado: true,
      contacto: { nombre: 'Nicolás Paredes', cargo: 'Socio gerente', tel: '+54 11 4253-1190', mail: 'npareds@montajesdelsur.com.ar', cuit: '30-70988123-4', horario: 'Lunes a viernes, 9 a 18 h', metodo: 'Mail', notas: 'Factura A. Retiran por depósito.' } },
    ribera: { n: 'Ingeniería Ribera Norte', anon: 'Integrador de Tigre', zona: 'Tigre, Buenos Aires', pedidos: 3, adjudica: 0.33, verificado: false,
      contacto: { nombre: 'Lorena Sosa', cargo: 'Ingeniera de proyecto', tel: '+54 11 4749-3302', mail: 'lsosa@riberanorte.com.ar', cuit: '30-71566001-2', horario: 'Lunes a viernes, 8 a 16 h', metodo: 'Teléfono', notas: '' } },
  };

  // Líneas de la OC-2026-031-1 (pedido PED-2026-031 de data.js, BOM del Hospital Cañuelas).
  // Cantidad = «a comprar» del BOM; precio = oferta de «en» en data.js, salvo l06: el precio con el que salió la OC
  // el 30/09 (8.179.240) es 0,19 % más alto que la oferta guardada. Así la suma da el total de data.js: $ 21.894.500.
  const oc031 = [
    { linea: 'l01', alt: { marca: 'ABB', gama: 'S200', codigo: 'ABB-S202C16', desc: 'Interruptor termomagnético S202 2P 16 A curva C 6 kA', precio: 33900, stock: 400, plazo: 2 } },
    { linea: 'l05', hint: { tipo: 'plazo', texto: 'El ERP (06:00) marca 3 u comprometidas para otro pedido. Reposición del fabricante en 12 días.', plazo: 12 } },
    { linea: 'l06', precio: 8179240, hint: { tipo: 'equivalente', texto: 'Sin stock del Compact NSX630F desde la sincronización de hoy. Tenés en stock un ABB Tmax XT5 630 4P con los mismos atributos esenciales.' } },
    { linea: 'l08' },
    { linea: 'l10', alt: { marca: 'Schneider Electric', gama: 'Acti9 iPRD', codigo: 'IPRD-1340', desc: 'Descargador iPRD40r 4P clase 2 40 kA', precio: 361500, stock: 12, plazo: 2 } },
    { linea: 'l15' },
    { linea: 'l16', hint: { tipo: 'parcial', texto: 'Stock disponible hoy: 800 m. Los 320 m restantes entran con el camión de Prysmian del 08/10.', ahora: 800, plazo: 7 } },
  ].map(x => {
    const l = L0(x.linea);
    return Object.assign({ mat: l.mat, spec: l.spec, marca: l.marca, gama: l.gama, tipo: l.tipo, attrs: l.attrs, u: l.u, cant: l.comprar,
      codigo: of(x.linea, 'codigo'), precio: of(x.linea, 'precio'), stock: of(x.linea, 'stock'), plazo: of(x.linea, 'plazo') }, x);
  });

  // Productos equivalentes que el distribuidor tiene en su catálogo (mismo componente base y mismos esenciales).
  const equivalentes = {
    l06: [
      { codigo: 'ABB-XT5-630', marca: 'ABB', gama: 'Tmax XT5', desc: 'Interruptor de caja moldeada Tmax XT5 630 4P Ekip Dip LS/I', precio: 7420000, stock: 3, plazo: 2,
        attrs: { Polos: '4', 'Corriente nominal': '630 A', 'Poder de corte': '50 kA', 'Unidad de disparo': 'electrónica' } },
      { codigo: 'COMP-1088', marca: 'Schneider Electric', gama: 'Compact NSX', desc: 'Compact NSX630N 4P Micrologic 2.3 (otra gama de poder de corte)', precio: 8642000, stock: 1, plazo: 4,
        attrs: { Polos: '4', 'Corriente nominal': '630 A', 'Poder de corte': '50 kA', 'Unidad de disparo': 'electrónica' } },
    ],
    l05: [
      { codigo: 'ABB-XT4-250', marca: 'ABB', gama: 'Tmax XT4', desc: 'Interruptor de caja moldeada Tmax XT4 250 4P TMA 36 kA', precio: 2690000, stock: 6, plazo: 2,
        attrs: { Polos: '4', 'Corriente nominal': '250 A', 'Poder de corte': '36 kA', 'Unidad de disparo': 'TM' } },
    ],
    l01: [
      { codigo: 'ABB-S202C16', marca: 'ABB', gama: 'S200', desc: 'Interruptor termomagnético S202 2P 16 A curva C 6 kA', precio: 33900, stock: 400, plazo: 2,
        attrs: { Polos: '2', 'Corriente nominal': '16 A', 'Curva de disparo': 'C', 'Poder de corte': '6 kA' } },
      { codigo: 'EZ9-1016', marca: 'Schneider Electric', gama: 'Easy9', desc: 'Easy9 2P 16 A curva C 4,5 kA', precio: 21800, stock: 900, plazo: 1,
        attrs: { Polos: '2', 'Corriente nominal': '16 A', 'Curva de disparo': 'C', 'Poder de corte': '4,5 kA' } },
    ],
  };

  // Solicitudes de otros compradores (las de Tableros Delta salen de B.pedidos).
  const lin = (id, cant) => ({ linea: id, cant, mat: L0(id).mat, spec: L0(id).spec, marca: L0(id).marca, gama: L0(id).gama, u: L0(id).u, codigo: of(id, 'codigo'), precio: of(id, 'precio'), stock: id === 'l17' ? 0 : of(id, 'stock'), plazo: of(id, 'plazo') });
  const otras = [
    { id: 'OC-2026-034-1', comp: 'ribera', proyecto: 'Nave logística Garín · TGBT y seccionales', enviado: '2026-10-01', hora: '08:05', vence: '2026-10-03', status: 'SENT',
      lineas: [lin('l05', 1), lin('l02', 6), lin('l07', 8), lin('l10', 1), lin('l12', 3), lin('l17', 120), lin('l13', 12), lin('l08', 8), lin('l16', 400)] },
    { id: 'OC-2026-033-2', comp: 'msur', proyecto: 'Edificio Panorámico · Torre 2', enviado: '2026-10-01', hora: '09:12', vence: '2026-10-04', status: 'SENT',
      lineas: [lin('l01', 64), lin('l03', 32), lin('l13', 20), lin('l15', 120), lin('l16', 600), lin('l02', 4)] },
    { id: 'OC-2026-025-1', comp: 'msur', proyecto: 'Clínica San Roque · Ampliación', enviado: '2026-09-22', vence: '2026-09-24', status: 'CONFIRMED', respondido: '2026-09-22',
      lineas: [lin('l01', 36), lin('l03', 18), lin('l13', 10), lin('l15', 80), lin('l16', 500), lin('l12', 3), lin('l08', 2), lin('l02', 3)] },
    { id: 'OC-2026-028-3', comp: 'ribera', proyecto: 'Depósito Escobar · Tablero de fuerza', enviado: '2026-09-20', vence: '2026-09-22', status: 'REJECTED', respondido: '2026-09-21',
      motivo: 'Pedían entrega en 48 h y el PM5100 tiene 15 días de plazo.', lineas: [lin('l02', 4), lin('l07', 6), lin('l08', 6), lin('l13', 6), lin('l15', 60)] },
  ];
  otras.forEach(s => { s.total = s.lineas.reduce((a, l) => a + l.cant * l.precio, 0); });

  // Leads de septiembre (cada solicitud recibida por la plataforma = 1 lead). 18 en el mes:
  // 15 confirmadas, 1 rechazada, 1 vencida sin responder y 1 pendiente (OC-2026-031-1).
  const leadsSep = [
    ['OC-2026-012-2', '2026-09-01', 'msur', 'Local comercial Bernal', 5, 1842000, 'CONFIRMED'],
    ['OC-2026-013-1', '2026-09-02', 'delta', 'Planta Norte · Línea 2', 11, 9620000, 'CONFIRMED'],
    ['OC-2026-014-3', '2026-09-03', 'ribera', 'Oficinas Nordelta', 4, 1210000, 'CONFIRMED'],
    ['OC-2026-016-1', '2026-09-05', 'msur', 'Supermercado Quilmes Oeste', 9, 4380000, 'CONFIRMED'],
    ['OC-2026-017-2', '2026-09-08', 'delta', 'Escuela Técnica N.º 3', 6, 2105000, 'CONFIRMED'],
    ['OC-2026-018-1', '2026-09-09', 'msur', 'Edificio Panorámico · Torre 1', 14, 6930000, 'CONFIRMED'],
    ['OC-2026-019-2', '2026-09-10', 'ribera', 'Galpón Benavídez', 3, 640000, 'EXPIRED'],
    ['OC-2026-020-1', '2026-09-11', 'delta', 'Laboratorio Ezeiza', 8, 3270000, 'CONFIRMED'],
    ['OC-2026-021-3', '2026-09-12', 'msur', 'Clínica San Roque · Quirófanos', 7, 5115000, 'CONFIRMED'],
    ['OC-2026-021-4', '2026-09-12', 'msur', 'Clínica San Roque · Quirófanos', 7, 5115000, 'CONFIRMED', 'Llegó dos veces: es la misma solicitud que OC-2026-021-3.'],
    ['OC-2026-023-1', '2026-09-15', 'delta', 'Depósito Spegazzini', 5, 1480000, 'CONFIRMED'],
    ['OC-2026-024-2', '2026-09-16', 'msur', 'Gimnasio municipal Quilmes', 4, 920000, 'CONFIRMED'],
    ['OC-2026-027-1', '2026-09-18', 'delta', 'Torre Alem 1450 · Oficinas', 19, 38410000, 'CONFIRMED'],
    ['OC-2026-028-3', '2026-09-20', 'ribera', 'Depósito Escobar · Tablero de fuerza', 5, 0, 'REJECTED'],
    ['OC-2026-025-1', '2026-09-22', 'msur', 'Clínica San Roque · Ampliación', 8, 0, 'CONFIRMED'],
    ['OC-2026-029-1', '2026-09-24', 'delta', 'Hospital Cañuelas · Obrador', 3, 690000, 'CONFIRMED'],
    ['OC-2026-030-2', '2026-09-26', 'msur', 'Edificio Panorámico · Cocheras', 6, 2240000, 'CONFIRMED'],
    ['OC-2026-031-1', '2026-09-30', 'delta', 'Hospital Regional Cañuelas · Pabellón B', 7, 21894500, 'SENT'],
  ].map(([id, fecha, comp, proyecto, lineas, monto, estado, duda]) => {
    const o = otras.find(s => s.id === id);
    return { id, fecha, comp, proyecto, lineas, monto: o ? o.total : monto, estado, duda };
  });
  const leadsOct = [
    { id: 'OC-2026-034-1', fecha: '2026-10-01', comp: 'ribera', proyecto: otras[0].proyecto, lineas: 9, monto: otras[0].total, estado: 'SENT' },
    { id: 'OC-2026-033-2', fecha: '2026-10-01', comp: 'msur', proyecto: otras[1].proyecto, lineas: 6, monto: otras[1].total, estado: 'SENT' },
  ];
  // Hipótesis de precio (Sprint 5, sin validar): 5 leads sin cargo por mes; desde el 6.º, $ 6.000 + IVA cada uno.
  const comision = { porLead: 6000, sinCargo: 5, factura: { nro: 'A 0004-00000127', emitida: '2026-10-01', vence: '2026-10-15', periodo: 'Septiembre 2026' } };

  // Demanda perdida de septiembre: líneas que te pidieron (en tus solicitudes) y no cotizaste o se perdieron.
  const demanda = [
    { k: 'stock', mat: 'Cable subterráneo LSOH', spec: '4×10 mm² + PE · Prysmian Afumex', veces: 3, cant: 420, u: 'm', monto: 420 * 21500, sug: 'Reponé Afumex 4×10: lo pidieron 3 veces en septiembre y figuraba sin stock.', accion: 'Avisar a compras' },
    { k: 'marca', mat: 'Contactor', spec: '3P 25 A AC3 · Siemens Sirius 3RT2', veces: 4, cant: 22, u: 'u', monto: 22 * 118320, sug: 'Sumá Siemens a tus marcas: 4 pedidos en 30 días, todos de tableristas de tu zona.', accion: 'Sumar la marca' },
    { k: 'plazo', mat: 'Interruptor de caja moldeada', spec: '4×250 A 36 kA · Compact NSX', veces: 1, cant: 2, u: 'u', monto: 2 * 2851800, sug: 'Se perdió por plazo: pedían 5 días y ofreciste 12. Un stock mínimo de 2 u lo evitaba.', accion: 'Definir stock mínimo' },
    { k: 'catalogo', mat: 'Variador de velocidad', spec: '2,2 kW 380 V · sin componente base', veces: 2, cant: 3, u: 'u', monto: 3 * 1045000, sug: 'Lo tenés en el ERP pero no está vinculado: sin componente base no entra en el matching.', accion: 'Vincular el producto' },
    { k: 'marca', mat: 'Selectora', spec: '3 posiciones Ø22 mm · Sica', veces: 2, cant: 9, u: 'u', monto: 9 * 21400, sug: 'Sica aparece en 2 pedidos: si no la vas a sumar, ofrecé el equivalente Schneider Harmony.', accion: 'Ofrecer equivalente' },
    { k: 'stock', mat: 'Ojos de buey', spec: 'Ø22 mm rojo 220 V CA', veces: 1, cant: 30, u: 'u', monto: 30 * 9700, sug: 'Faltante puntual: entró stock el 25/09.', accion: '' },
  ];
  const MOTIVOS = { stock: 'Sin stock', plazo: 'Por plazo', marca: 'Marca que no trabajás', catalogo: 'No está en tu catálogo' };

  // Catálogo de Eléctrica Norte (muestra de la tabla «Mis productos»; el total es proveedores[en].items = 18.420).
  const prod = (linea, extra = {}) => { const l = L0(linea); return Object.assign({ codigo: of(linea, 'codigo'), nombre: l.mat + ' ' + (l.gama ? l.gama.split(' ').slice(-1)[0] + ' ' : '') + l.spec, spec: l.spec, marca: l.marca || 'Genérico', bc: l.marca ? l.marca.slice(0, 3).toUpperCase() : 'GEN', gama: l.gama, precio: of(linea, 'precio'), act: '2026-09-29', tipo: l.tipo, comp: l.mat, attrs: l.attrs, est: 'AUTO', linea }, extra); };
  const catalogo = [
    prod('l01'), prod('l02'), prod('l03'), prod('l04', { est: 'MANUAL' }), prod('l05'), prod('l06', { stock0: true, nombre: 'Interruptor de caja moldeada Compact NSX630F 4P' }),
    prod('l08'), prod('l10'), prod('l12', { nombre: 'Transformador de corriente TI 630/5 A clase 0,5', marca: 'Genérico', bc: 'GEN' }),
    prod('l13', { marca: 'Schneider Electric', bc: 'SCH', nombre: 'Ojo de buey Harmony XB7 Ø22 rojo 220 V' }),
    prod('l15', { nombre: 'Bornera a tornillo 4 mm² gris', marca: 'Zoloda', bc: 'ZOL', est: 'FALTA', falta: 'Tipo de conexión' }),
    prod('l16'), prod('l17', { stock0: true }),
    { codigo: 'ABB-XT5-630', nombre: 'Interruptor Tmax XT5 630 4P Ekip Dip LS/I', spec: '4×630 A 50 kA', marca: 'ABB', bc: 'ABB', gama: 'Tmax XT5', precio: 7420000, act: '2026-10-01', comp: 'Interruptor de caja moldeada', est: 'LEYENDO' },
    { codigo: 'ABB-S202C16', nombre: 'Interruptor termomagnético S202 2P C16', spec: '2×16 A C 6 kA', marca: 'ABB', bc: 'ABB', gama: 'S200', precio: 33900, act: '2026-10-01', comp: 'Interruptor termomagnético', est: 'LEYENDO' },
    { codigo: 'IPRD-1340', nombre: 'Descargador iPRD40r 4P clase 2', spec: '40 kA 4P', marca: 'Schneider Electric', bc: 'SCH', gama: 'Acti9 iPRD', precio: 361500, act: '2026-09-29', comp: 'Descargador de sobretensiones', est: 'AUTO' },
    { codigo: 'ATV-3202', nombre: 'Variador ATV320 2,2 kW 380 V', spec: '2,2 kW trifásico', marca: 'Schneider Electric', bc: 'SCH', gama: 'Altivar Machine', precio: 1045000, act: '2026-09-29', comp: '', est: 'SIN' },
    { codigo: 'GEN-7781', nombre: 'Canal ranurado 40×60 gris x 2 m', spec: '40×60 mm', marca: 'Zoloda', bc: 'ZOL', gama: '', precio: 8900, act: '2026-09-29', comp: '', est: 'FALLO' },
  ];
  // Vinculación: conteo sobre el catálogo completo (18.420). 368 se están leyendo (importación de ABB de hoy).
  const vinculacion = { total: 18420, leyendo: 368, listas: 17596, faltan: 427, sin: 29,
    lectura: { archivo: 'lista-ABB-octubre.xlsx', total: 1580, leidos: 1212, fallidos: 9, costo: 2.91, costoEst: 3.79, restanteMin: 4, inicio: '07:40' } };

  // Historial de importaciones (ProviderSyncRun).
  const importaciones = [
    { f: '2026-10-01 07:38', archivo: 'lista-ABB-octubre.xlsx', quien: 'carla', leidos: 1592, creados: 214, act: 1366, desc: 12, despub: 0, est: 'RUNNING' },
    { f: '2026-09-29 18:02', archivo: 'lista-general-septiembre.xlsx', quien: 'carla', leidos: 18428, creados: 120, act: 2310, desc: 8, despub: 41, est: 'SUCCESS' },
    { f: '2026-08-21 10:15', archivo: 'prysmian-cables-agosto.xlsx', quien: 'carla', leidos: 846, creados: 0, act: 790, desc: 56, despub: 0, est: 'PARTIAL' },
    { f: '2026-08-21 09:58', archivo: 'prysmian-cables-agosto.xlsx', quien: 'carla', leidos: 0, creados: 0, act: 0, desc: 0, despub: 0, est: 'FAILED', error: 'La fila de encabezados no tenía «Precio»: elegí la fila 4.' },
  ];
  // Mapeo de columnas recordado por encabezado (el de la carga del 29/09).
  const mapeo = [
    ['A', 'Cod. art.', 'Código de producto', 'ABB-XT5-630'],
    ['B', 'Descripción', 'Descripción', 'Interruptor Tmax XT5 630 4P Ekip Dip LS/I'],
    ['C', 'Marca', 'Marca', 'ABB'],
    ['D', 'Cod. marca', 'Código de la marca', 'ABB'],
    ['E', 'Línea', 'Gama', 'Tmax XT5'],
    ['F', 'Precio lista', 'Precio sin IVA', '7.420.000,00'],
    ['G', 'Mon.', 'Moneda', 'ARS'],
    ['H', 'Plazo (días)', 'Plazo de entrega', '2'],
    ['I', 'Disp.', '— no se importa —', '3'],
  ];

  // Integraciones con el ERP (adaptadores de la Visión) y listas por cliente.
  const erp = {
    conectado: 'ebase', frecuencia: '4h', ultimo: '2026-10-01 06:00', proximo: '2026-10-01 10:00', productos: 18420, cambiados: 312,
    conectores: [
      { id: 'ebase', n: 'Electrobase (EBASE)', d: 'Stock, catálogo y precios. Lo usan muchos distribuidores eléctricos del país.', i: 'database' },
      { id: 'odoo', n: 'Odoo', d: 'Para quien está migrando desde Electrobase: se conecta en paralelo y elegís cuál manda.', i: 'boxes' },
      { id: 'sap', n: 'SAP Business One', d: 'Lee artículos, listas y stock por almacén por la API de servicio de SAP.', i: 'server' },
    ],
    conflictos: [
      { id: 'c1', tipo: 'precio', t: 'Precio distinto en el ERP y en liard', prod: 'ACTI-1000 · Termomagnético iC60N 2×16 A C', erp: 36960, liard: 35900, nota: 'Carla lo corrigió a mano el 25/09.' },
      { id: 'c2', tipo: 'base', t: 'Producto nuevo sin componente base', prod: 'ATV-3202 · Variador ATV320 2,2 kW', nota: 'No hay componente base para variadores: queda publicado, pero no entra en el matching.' },
      { id: 'c3', tipo: 'despub', t: 'El ERP lo dio de baja y hay solicitudes abiertas', prod: 'AFUM-1176 · Cable Afumex 4×10 mm² + PE', nota: 'Está en OC-2026-034-1 (sin responder).' },
    ],
  };
  const listas = [
    { id: 'lg', cliente: 'Lista general', comp: null, bonif: 0, moneda: 'ARS', desde: '2026-09-29', hasta: '2026-10-15', estado: 'vigente', marcas: {} },
    { id: 'ld', cliente: 'Tableros Delta S.R.L.', comp: 'delta', bonif: 8, moneda: 'ARS', desde: '2026-10-02', hasta: '2026-10-31', estado: 'borrador', marcas: { 'Schneider Electric': 8, ABB: 5, Prysmian: 3 }, nota: 'Entra en vigencia el 02/10: no cambia la OC-2026-031-1 ya enviada.' },
    { id: 'ls', cliente: 'Montajes del Sur S.R.L.', comp: 'msur', bonif: 5, moneda: 'ARS', desde: '2026-09-01', hasta: '2026-10-31', estado: 'vigente', marcas: { 'Schneider Electric': 5 } },
    { id: 'lr', cliente: 'Ingeniería Ribera Norte', comp: 'ribera', bonif: 3, moneda: 'USD', desde: '2026-09-15', hasta: '2026-09-30', estado: 'vencida', marcas: { ABB: 3 } },
  ];
  const historial = [
    { f: '2026-10-01', codigo: 'ACTI-1000', prod: 'iC60N 2×16 A C', antes: 35900, despues: 36960, origen: 'Electrobase' },
    { f: '2026-10-01', codigo: 'COMP-1044', prod: 'Compact NSX 250 4P TM', antes: 2766000, despues: 2851800, origen: 'Electrobase' },
    { f: '2026-09-29', codigo: 'SUPE-1165', prod: 'Superastic Flex 2,5 mm²', antes: 1120, despues: 1170, origen: 'Planilla' },
    { f: '2026-09-29', codigo: 'ACTI-1022', prod: 'iID 2×40 A 30 mA', antes: 96400, despues: 98980, origen: 'Planilla' },
    { f: '2026-09-25', codigo: 'ACTI-1000', prod: 'iC60N 2×16 A C', antes: 36200, despues: 35900, origen: 'Manual · Carla' },
    { f: '2026-09-22', codigo: 'OVR-1099', prod: 'OVR clase 2 40 kA 4P', antes: 366900, despues: 376320, origen: 'Electrobase' },
    { f: '2026-09-15', codigo: 'AFUM-1176', prod: 'Afumex 4×10 mm² + PE', antes: 20700, despues: 21500, origen: 'Electrobase' },
  ];

  // Ficha pública (vidriera). Las métricas son medidas, no declaradas.
  const vidriera = {
    zonas: ['Pilar', 'Escobar', 'Tigre', 'San Isidro', 'Campana', 'Zárate'],
    especialidades: ['Tableros de BT', 'Protección y maniobra', 'Cables LSOH', 'Medición y energía'],
    horario: 'Lunes a viernes, 8 a 18 h · sábados 8 a 12 h',
    entrega: 'Entrega propia en GBA Norte desde $ 300.000 · retiro en depósito Pilar',
  };

  window.BP = { compradores, oc031, equivalentes, otras, leadsSep, leadsOct, comision, demanda, MOTIVOS, catalogo, vinculacion, importaciones, mapeo, erp, listas, historial, vidriera };
})();
