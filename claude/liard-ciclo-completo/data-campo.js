/* liard · área E (fabricación, obra y mantenimiento) · datos propios del área.
   TODO ES FICTICIO. Lo que ya existe en data.js (obra p1, líneas, proveedores, pedidos, tableros, tgbt) se lee de ahí:
   acá solo va lo que el área agrega (armadores, horas, stock del taller, remitos, entregas, mantenimiento).
   Se carga después de data.js y antes de app.js. */
(function () {
  // Personal del taller (no son usuarios de liard: los carga el jefe de taller).
  const armadores = {
    nico: { n: 'Nicolás Paz', r: 'Oficial armador', ini: 'NP', c: '' },
    mati: { n: 'Matías Correa', r: 'Oficial armador', ini: 'MC', c: 'c2' },
    bren: { n: 'Brenda Ríos', r: 'Cableadora', ini: 'BR', c: 'c3' },
    ivan: { n: 'Iván Sosa', r: 'Medio oficial', ini: 'IS', c: 'c5' },
  };

  // Asignación y horas por tablero (presupuestadas = las del presupuesto; reales = partes de horas cargados).
  const taller = {
    tgbt: { armadores: ['nico', 'ivan'], hPres: 96, hReal: 58, entrega: '2026-11-06', etapa: 'Montaje de aparatos' },
    tsgpb: { armadores: ['bren'], hPres: 40, hReal: 44, entrega: '2026-10-09', etapa: 'Ensayos de rutina' },
    tspiso: { armadores: ['mati', 'bren'], hPres: 84, hReal: 45, entrega: '2026-10-30', etapa: 'Cableado (unidades 4 a 6)' },
    tsbombas: { armadores: ['mati'], hPres: 36, hReal: 12, hEspera: 6, entrega: '2026-10-23', etapa: 'Montaje mecánico terminado' },
  };
  const tarifaHora = 16000; // costo hora taller ARS (ejemplo, sin IVA)

  // Proveedor adjudicado por línea cuando cotización (área C) todavía no escribió compra.adjudicadas.
  // Elegido entre los distribuidores que de verdad ofertan esa línea en B.ofertas.
  const adjudicacion = {
    l01: 'en', l02: 'en', l05: 'en', l06: 'en', l10: 'en', l13: 'en', l16: 'en',
    l03: 'ohm', l07: 'ohm', l08: 'ohm', l12: 'ohm',
    l04: 'sur', l15: 'sur', l17: 'sur',
  };
  // Lo que no tiene OC en liard y por qué.
  const sinOC = {
    l09: { t: 'No se pudo cotizar', d: 'Falta el atributo esencial «Corriente nominal»: sin eso no hay match.', quien: 'Ingeniería', href: 'd-bom-editor.html?linea=l09' },
    l11: { t: 'No se pudo cotizar', d: 'Falta «Formato» (96×96 frontal o riel DIN).', quien: 'Ingeniería', href: 'd-bom-editor.html?linea=l11' },
    l14: { t: 'Sin adjudicar', d: 'Solo la ofrece Casa Volta y su lista venció el 30/09.', quien: 'Compras', href: 'd-com-recotizar.html' },
    l18: { t: 'Comprado por fuera de liard', d: 'OC manual a Genrod (no hay componente base para gabinetes). Llegó el 22/09.', quien: '', recibido: true },
  };

  // Stock del taller: aparatos comunes que se toman y se reponen con la OC.
  const stock = {
    l01: { cant: 72, usa: { tsgpb: 12, tgbt: 6, tspiso: 54 } },
    l02: { cant: 6, usa: { tspiso: 6 } },
    l03: { cant: 40, usa: { tsgpb: 8, tspiso: 30 } },
    l13: { cant: 12, usa: { tsgpb: 3, tgbt: 3, tspiso: 3 } },
    l15: { cant: 300, usa: { tgbt: 36 } },
    l16: { cant: 400, usa: { tgbt: 110, tsgpb: 90 } },
  };

  // Composición resumida de los otros tableros (para la lista de armado; el TGBT viene de B.tgbt).
  const composicion = {
    tsgpb: [ { linea: 'l01', cant: 12, ref: 'Q1–Q12' }, { linea: 'l03', cant: 8, ref: 'ID1–ID8' }, { linea: 'l13', cant: 3, ref: 'H1–H3' }, { linea: 'l16', cant: 90, ref: 'Cableado' } ],
    tspiso: [ { linea: 'l01', cant: 18, ref: 'Q1–Q18', x: 6 }, { linea: 'l03', cant: 10, ref: 'ID1–ID10', x: 6 }, { linea: 'l02', cant: 2, ref: 'Q0A–Q0B', x: 6 }, { linea: 'l13', cant: 1, ref: 'H1', x: 6 } ],
    tsbombas: [ { linea: 'l09', cant: 2, ref: 'QS1–QS2' }, { linea: 'l07', cant: 6, ref: 'KM1–KM6' }, { linea: 'l08', cant: 4, ref: 'QM1–QM4' }, { linea: 'l14', cant: 4, ref: 'SA1–SA4' }, { linea: 'l01', cant: 6, ref: 'Q1–Q6' }, { linea: 'l03', cant: 6, ref: 'ID1–ID6' }, { linea: 'l13', cant: 6, ref: 'H1–H6' } ],
  };

  // Lista de corte del cableado interno (TGBT). El cable de 2,5 mm² es la línea l16; potencia va por planilla de barras.
  const corte = {
    tgbt: [
      { circ: 'Q9–Q14', desde: 'Q9…Q14', hasta: 'X1:1…12', sec: '2,5 mm²', color: 'marrón / celeste', largo: 1.6, n: 12, linea: 'l16' },
      { circ: 'H1–H3', desde: 'Q9', hasta: 'H1…H3', sec: '2,5 mm²', color: 'marrón / celeste', largo: 0.9, n: 6, linea: 'l16' },
      { circ: 'PM1 tensión', desde: 'Q0 (bornes)', hasta: 'PM1', sec: '2,5 mm²', color: 'marrón / negro / rojo / celeste', largo: 1.2, n: 4, linea: 'l16' },
      { circ: 'TI1–TI3', desde: 'TI1…TI3', hasta: 'PM1 (S1/S2)', sec: '2,5 mm²', color: 'gris', largo: 1.4, n: 6, linea: 'l16' },
      { circ: 'F1', desde: 'Barra', hasta: 'F1', sec: '2,5 mm²', color: 'según fase', largo: 0.8, n: 4, linea: 'l16' },
      { circ: 'PE general', desde: 'Barra PE', hasta: 'Puerta y placa de montaje', sec: '2,5 mm²', color: 'verde-amarillo', largo: 0.7, n: 6, linea: 'l16' },
      { circ: 'Q3–Q8', desde: 'Barra', hasta: 'Q3…Q8', sec: 'Según planilla de barras', color: '—', largo: 0, n: 0, linea: null },
    ],
  };

  // Recepciones ya registradas (seed). Las de la obra principal las registra el usuario desde el teléfono.
  const recepciones = [
    { id: 'rc-027-1a', oc: 'OC-2026-027-1', prov: 'en', proyecto: 'p2', remito: 'R-0002-00031877', fecha: '2026-09-22', por: 'diego', foto: true, lineas: [ { t: 'Interruptor termomagnético 2×20 A curva C', pedido: 96, recibido: 96 }, { t: 'Interruptor diferencial 2×40 A 30 mA', pedido: 48, recibido: 48 }, { t: 'Interruptor de caja moldeada 4×160 A', pedido: 4, recibido: 2 }, { t: 'Cable LSOH 4×16 mm² + PE', pedido: 450, recibido: 300, u: 'm' } ], nota: 'Eléctrica Norte entrega el resto en un segundo remito.' },
    { id: 'rc-027-1b', oc: 'OC-2026-027-1', prov: 'en', proyecto: 'p2', remito: 'R-0002-00032104', fecha: '2026-09-29', por: 'diego', foto: true, lineas: [ { t: 'Cable LSOH 4×16 mm² + PE', pedido: 150, recibido: 150, u: 'm' } ], nota: 'Completa el cable. Siguen faltando 2 cajas moldeadas 4×160 A (prometidas para el 07/10).' },
    { id: 'rc-027-3', oc: 'OC-2026-027-3', prov: 'ohm', proyecto: 'p2', remito: 'R-0003-00012511', fecha: '2026-09-23', por: 'diego', foto: true, lineas: [ { t: 'Contactor 3P 18 A bobina 220 V', pedido: 12, recibido: 12 }, { t: 'Guardamotor 6–10 A', pedido: 12, recibido: 12 } ], nota: '' },
  ];
  // Líneas de la OC de Ohm de la obra principal que llegan hoy (para el remito que se controla en el teléfono).
  const remitoHoy = { oc: 'OC-2026-031-2', prov: 'ohm', remito: 'R-0003-00012877', hora: '08:40', chofer: 'Transporte Ohm · patente AF 512 KD',
    lineas: [ { linea: 'l03', remito: 50 }, { linea: 'l07', remito: 6 }, { linea: 'l08', remito: 4 }, { linea: 'l12', remito: 3 } ],
    promesa: '2026-10-06' };

  // Entregas de tableros a obra (remitos propios del tablerista).
  const entregas = [
    { id: 'RE-0001-00000312', proyecto: 'p2', fecha: '2026-09-12', tableros: ['TS-PISO 1.º a 4.º'], recibe: 'Ing. Paula Sarmiento (Desarrollos Puerto)', estado: 'firmado' },
    { id: 'RE-0001-00000318', proyecto: 'p2', fecha: '2026-09-26', tableros: ['TS-PISO 5.º a 8.º', 'TS-SS'], recibe: 'Ing. Paula Sarmiento (Desarrollos Puerto)', estado: 'firmado' },
    { id: 'RE-0001-00000321', proyecto: 'p2', fecha: '2026-10-08', tableros: ['TGBT', 'TS-PISO 9.º y 10.º'], recibe: '', estado: 'programado' },
  ];

  // Cambio de alcance pedido en obra (Hospital Cañuelas): 2 circuitos más de tomas en sala de máquinas, desde el TGBT.
  const alcance = {
    id: 'CA-01', proyecto: 'p1', tablero: 'tgbt', fecha: '2026-09-30', pide: 'Arq. Valeria Nuñez · Constructora Ribera', via: 'Minuta de obra N.º 14',
    desc: 'Agregar 2 circuitos de tomacorrientes en la sala de máquinas, alimentados desde el TGBT (salidas Q15 y Q16).',
    items: [ { linea: 'l01', cant: 2, ref: 'Q15–Q16' }, { linea: 'l03', cant: 2, ref: 'ID1–ID2' }, { linea: 'l15', cant: 5, ref: 'X1:37–41' }, { linea: 'l16', cant: 70, ref: 'Cableado' } ],
    hMO: 9, // horas de taller + obra para los 2 circuitos (ejemplo)
  };

  // Ensayos de rutina por tablero (guía basada en IEC 61439-1/-2 §11 y AEA 90364-7-771; la norma manda).
  const ensayos = [
    { id: 'ip', sec: '11.2', t: 'Grado de protección de la envolvente', d: 'Inspección visual: juntas, tapas, prensacables y aberturas coinciden con el IP declarado (IP43).', tipo: 'check' },
    { id: 'dist', sec: '11.3', t: 'Distancias de aislación y de fuga', d: 'Verificación visual de las distancias en barras y bornes contra las del diseño verificado.', tipo: 'check' },
    { id: 'pe', sec: '11.4', t: 'Protección contra choque eléctrico y continuidad del circuito de protección', d: 'Continuidad entre cada masa (puerta, placa, chasis) y la barra PE. Criterio del taller: ≤ 0,10 Ω.', tipo: 'pe' },
    { id: 'comp', sec: '11.5', t: 'Incorporación de componentes', d: 'Los aparatos instalados coinciden con el BOM aprobado (referencia, calibre, poder de corte).', tipo: 'check' },
    { id: 'cab', sec: '11.6 · 11.7', t: 'Circuitos internos, conexiones y bornes', d: 'Reapriete al par del fabricante, numeración de cables, secciones según lista de corte, bornes de salida identificados.', tipo: 'check' },
    { id: 'mec', sec: '11.8', t: 'Funcionamiento mecánico', d: 'Accionamiento de manijas, cerraduras, enclavamientos y puertas.', tipo: 'check' },
    { id: 'ais', sec: '11.9', t: 'Propiedades dieléctricas · aislación con megóhmetro', d: 'Megóhmetro a 500 V CC entre cada circuito y PE. Criterio del taller: ≥ 1 MΩ (revisá el que pida la especificación del comitente).', tipo: 'ais' },
    { id: 'func', sec: '11.10', t: 'Cableado, desempeño operativo y funcionamiento', d: 'Prueba funcional en vacío: señalización, disparo de diferenciales con instrumento (t ≤ 300 ms a IΔn) y ajustes de protecciones.', tipo: 'func' },
  ];
  const medicionesAis = [
    { c: 'Q1–Q3 · tomas planta baja ala A', v: 48 }, { c: 'Q4–Q6 · tomas planta baja ala B', v: 52 },
    { c: 'Q7 · iluminación pasillo central', v: 35, falla: 0.18 }, { c: 'Q8–Q10 · iluminación consultorios', v: 61 },
    { c: 'Q11–Q12 · reserva equipada', v: 120 }, { c: 'Barras L1-L2-L3-N', v: 210 },
  ];
  const medicionesPE = [ { c: 'Puerta frontal', v: 0.04 }, { c: 'Placa de montaje', v: 0.03 }, { c: 'Laterales y techo', v: 0.06 } ];
  const ajustes = [ { ref: 'ID1–ID8', t: 'Diferenciales 2×40 A 30 mA', v: 'Disparo medido 18–24 ms a IΔn' }, { ref: 'Q1–Q12', t: 'Termomagnéticas 2×16 A curva C', v: 'Sin ajuste (fijas)' } ];

  // Tableros entregados (mantenimiento). Los de la obra principal se suman cuando se entregan.
  const entregados = [
    { id: 'ta-tgbt', cod: 'TGBT', n: 'Tablero general', obra: 'Torre Alem 1450 · Oficinas', cliente: 'Desarrollos Puerto S.A.', proyecto: 'p2', serie: 'TD-26-0301', entrega: '2026-10-08', anios: 0, estado: 'programado', aparatos: 64, discont: 0, protocolo: true, ultimo: null, prox: '2027-10-08' },
    { id: 'ta-piso', cod: 'TS-PISO ×10', n: 'Seccional piso tipo', obra: 'Torre Alem 1450 · Oficinas', cliente: 'Desarrollos Puerto S.A.', proyecto: 'p2', serie: 'TD-26-0302…0311', entrega: '2026-09-26', anios: 0, estado: 'garantia', aparatos: 31, discont: 0, protocolo: true, ultimo: null, prox: '2027-09-26' },
    { id: 'lib-tg', cod: 'TG', n: 'Tablero general', obra: 'Edificio Libertador 4200', cliente: 'Consorcio Libertador 4200', serie: 'TD-18-0077', entrega: '2018-03-14', anios: 8, estado: 'vigente', aparatos: 48, discont: 0, protocolo: true, ultimo: '2025-09-02', prox: '2026-09-02', vencido: true },
    { id: 'csr-tgbt', cod: 'TGBT', n: 'Tablero general de baja tensión', obra: 'Clínica San Rafael', cliente: 'Clínica San Rafael S.A.', serie: 'TD-12-0019', entrega: '2012-06-20', anios: 14, estado: 'vigente', aparatos: 72, discont: 9, protocolo: false, ultimo: '2024-11-12', prox: '2025-11-12', vencido: true },
    { id: 'pes-ccm', cod: 'CCM-1', n: 'Centro de control de motores', obra: 'Planta Envases Sur', cliente: 'Envases Sur S.A.', serie: 'TD-21-0144', entrega: '2021-05-04', anios: 5, estado: 'vigente', aparatos: 86, discont: 0, protocolo: true, ultimo: '2026-05-10', prox: '2027-05-10' },
    { id: 'cns-tg', cod: 'TG', n: 'Tablero general', obra: 'Colegio Nuestra Señora', cliente: 'Asociación Civil NS', serie: 'TD-23-0210', entrega: '2023-02-27', anios: 3, estado: 'vigente', aparatos: 36, discont: 0, protocolo: true, ultimo: '2026-03-01', prox: '2027-03-01' },
  ];
  // As-built del TG de Libertador 4200 (lo instalado de verdad, con los cambios contra el proyecto).
  const asbuilt = {
    'lib-tg': {
      lineas: [
        { mat: 'Interruptor de caja moldeada', spec: '4×400 A 36 kA TM', marca: 'Schneider Electric · Compact NSX', ref: 'Q0', cant: 1 },
        { mat: 'Interruptor de caja moldeada', spec: '4×160 A 25 kA TM', marca: 'ABB · Tmax XT', ref: 'Q1–Q2', cant: 2, cambio: 'Proyectado: Compact NSX 160. Se cambió por contraoferta (stock).' },
        { mat: 'Interruptor termomagnético', spec: '4×40 A curva C 10 kA', marca: 'Schneider Electric · Acti9 iC60H', ref: 'Q3–Q14', cant: 12 },
        { mat: 'Interruptor diferencial', spec: '4×40 A 30 mA superinmunizado', marca: 'Schneider Electric · Acti9 iID', ref: 'ID1–ID6', cant: 6 },
        { mat: 'Descargador de sobretensiones', spec: 'Clase 2 · 40 kA · 4P', marca: 'ABB · OVR', ref: 'F1', cant: 1 },
        { mat: 'Instrumento de medición multifunción', spec: 'PM5110 RS485', marca: 'Schneider Electric · PowerLogic', ref: 'PM1', cant: 1, cambio: 'Agregado en obra (minuta 7): medición para la administración.' },
        { mat: 'Ojos de buey', spec: 'Ø22 mm 220 V CA', marca: 'Sica', ref: 'H1–H3', cant: 3 },
      ],
      docs: ['Unifilar as-built (rev. C)', 'Protocolo de ensayos de rutina', 'Lista de aparatos instalados', 'Remito de entrega RE-0001-00000102', 'Informe de termografía 09/2025'],
    },
  };
  const historial = {
    'lib-tg': [
      { f: '2025-09-02', t: 'Termografía anual', d: 'Sin puntos calientes. Máx. 41 °C en Q0 (fase L2), ΔT 6 °C.', i: 'thermometer', tipo: 'ok' },
      { f: '2025-09-02', t: 'Reapriete de bornes y barras', d: 'Reapriete al par del fabricante. Limpieza interior.', i: 'wrench', tipo: 'ok' },
      { f: '2024-08-28', t: 'Ampliación', d: 'Se agregaron 2 salidas 4×40 A para cocheras (Q13–Q14).', i: 'circle-plus', tipo: 'pri' },
      { f: '2023-03-10', t: 'Reemplazo de diferencial', d: 'ID4 disparaba sin falla: se cambió por superinmunizado.', i: 'repeat', tipo: 'wa' },
      { f: '2018-03-14', t: 'Entrega y puesta en servicio', d: 'Protocolo de ensayos de rutina firmado.', i: 'stamp', tipo: 'ok' },
    ],
    'tsgpb': [],
  };
  const preventivo = [
    { id: 'pv1', tablero: 'lib-tg', tarea: 'Termografía anual', f: '2026-09-02', vencida: true },
    { id: 'pv2', tablero: 'csr-tgbt', tarea: 'Termografía anual + reapriete', f: '2025-11-12', vencida: true },
    { id: 'pv3', tablero: 'csr-tgbt', tarea: 'Prueba de diferenciales (semestral)', f: '2026-10-15' },
    { id: 'pv4', tablero: 'cns-tg', tarea: 'Prueba de diferenciales (semestral)', f: '2026-10-21' },
    { id: 'pv5', tablero: 'pes-ccm', tarea: 'Reapriete de bornes de potencia', f: '2026-11-10' },
    { id: 'pv6', tablero: 'ta-piso', tarea: 'Visita de fin de garantía', f: '2027-09-26' },
  ];
  const pedidosServicio = [
    { id: 'SV-0042', tablero: 'csr-tgbt', fecha: '2026-09-29', tipo: 'Repuesto', d: 'Se quemó un Compact NS 250 (Q4). Piden reemplazo urgente.', estado: 'nuevo', de: 'Mantenimiento Clínica San Rafael' },
    { id: 'SV-0041', tablero: 'lib-tg', fecha: '2026-09-18', tipo: 'Ampliación', d: 'Quieren sumar 3 salidas para cargadores de autos en cocheras.', estado: 'cotizando', de: 'Administración Consorcio Libertador' },
  ];
  // Aparatos discontinuados del TGBT de Clínica San Rafael (2012).
  const discontinuados = {
    'csr-tgbt': [
      { t: 'Interruptor de caja moldeada Compact NS 250', cant: 4, reemplazo: 'Compact NSX 250 (4×250 A 36 kA TM)', linea: 'l05' },
      { t: 'Termomagnéticas Multi 9 C60N 2×16 A', cant: 5, reemplazo: 'Acti9 iC60N 2×16 A curva C 6 kA', linea: 'l01' },
    ],
  };
  const plan = { qrIncluidos: 50, qrUsados: 47 };

  window.CAMPO = { armadores, taller, tarifaHora, adjudicacion, sinOC, stock, composicion, corte, recepciones, remitoHoy, entregas, alcance, ensayos, medicionesAis, medicionesPE, ajustes, entregados, asbuilt, historial, preventivo, pedidosServicio, discontinuados, plan };
})();
