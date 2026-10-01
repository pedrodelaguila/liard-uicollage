/* liard · área F (plataforma) · datos propios del área. Ficticios.
   Lo que es de otras áreas (obra, líneas, ofertas, pedidos, tableros, avisos, consumoIA) se lee de data.js / del estado.
   Acá va solo lo que nadie más tiene: etapas de las obras, indicadores de dirección, equipo y permisos,
   aprobaciones, comentarios, automatizaciones, plan y facturas, y el estado del servicio.
   El estado privado del área vive en L.get('x.pla') (se siembra con BP.seed la primera vez). */
(function () {
  const BP = {};

  // Etapa del ciclo de cada obra (la más avanzada en la que tiene trabajo abierto).
  BP.etapas = ['Ingeniería', 'Presupuesto', 'Compras', 'Fabricación', 'Obra'];
  BP.etapaObra = {
    p1: { etapa: 'Fabricación', nota: '4 tableros en el taller · 2 OC sin respuesta' },
    p2: { etapa: 'Obra', nota: 'Entrega 15/10 · todo confirmado' },
    p3: { etapa: 'Compras', nota: 'OC vencida en Casa Volta: reasignar' },
    p4: { etapa: 'Ingeniería', nota: '2 planos en la cola, 1 sin procesar' },
    p5: { etapa: 'Presupuesto', nota: 'Pliego recibido, sin planos todavía' },
  };

  // Indicadores de dirección (ejemplo, rotulado como tal en pantalla).
  // margenEst: el del presupuesto aprobado · margenReal: con lo comprado y lo cargado de horas hasta hoy (null = sin compras).
  BP.margenes = [
    { p: 'p2', est: 0.24, real: 0.215 },
    { p: 'p1', est: null, real: 0.198 },   // est sale del cálculo de PLA.presupuesto() (mismo número que el asistente)
    { p: 'p3', est: 0.19, real: 0.142 },
    { p: 'p4', est: 0.26, real: null },
  ];
  BP.manoObraP1 = 15400000;               // mano de obra del Hospital Cañuelas, ARS sin IVA (si C no cargó la suya)
  BP.conversion = { anio: 2026, enviados: 64, ganados: 9, montoGanado: 412600000, sector: '10–15 %' };
  BP.taller = { armadores: 3, horasSemana: 132, asignadas: 118, horasPorTablero: { tgbt: 46, tsgpb: 12, tspiso: 38, tsbombas: 22 } };

  // Permisos propuestos dentro de la empresa. Hoy (dev) hay un solo rol, ENGINEER, y todos pueden todo.
  BP.perfiles = {
    dir: { t: 'Dirección', d: 'Ve márgenes y consumo, aprueba lo que supera los montos' },
    ing: { t: 'Ingeniería', d: 'Planos, revisión de símbolos y BOM' },
    pres: { t: 'Presupuesto', d: 'Presupuesto al comitente y margen' },
    comp: { t: 'Compras', d: 'Cotización, adjudicación y OC' },
    tal: { t: 'Taller', d: 'Armado, faltantes y protocolo' },
    obra: { t: 'Obra', d: 'Entregas y remitos desde el teléfono' },
  };
  BP.permisos = [
    // [acción, dir, ing, pres, comp, tal, obra]  1 = puede · 0 = no · 'a' = con aprobación
    ['Subir y procesar planos', 1, 1, 1, 0, 0, 0],
    ['Editar el BOM', 1, 1, 'a', 0, 0, 0],
    ['Ver precios y ofertas', 1, 1, 1, 1, 0, 0],
    ['Ver márgenes', 1, 0, 1, 0, 0, 0],
    ['Enviar una OC', 1, 0, 0, 'a', 0, 0],
    ['Aprobar OC sobre el monto', 1, 0, 0, 0, 0, 0],
    ['Usar el asistente IA', 1, 1, 1, 1, 1, 0],
    ['Cambiar el tope de IA y el plan', 1, 0, 0, 0, 0, 0],
  ];
  BP.equipo = [
    { u: 'hernan', perfil: 'dir', email: 'hrossi@tablerosdelta.com.ar', ultimo: 'hoy 08:12', estado: 'activo' },
    { u: 'martina', perfil: 'ing', email: 'mgimenez@tablerosdelta.com.ar', ultimo: 'hoy 09:40', estado: 'activo' },
    { u: 'lucas', perfil: 'pres', email: 'lferreyra@tablerosdelta.com.ar', ultimo: 'hoy 09:05', estado: 'activo' },
    { u: 'sofia', perfil: 'comp', email: 'sbenitez@tablerosdelta.com.ar', ultimo: 'hoy 09:31', estado: 'activo' },
    { u: 'ramiro', perfil: 'tal', email: 'rojeda@tablerosdelta.com.ar', ultimo: 'ayer 18:20', estado: 'activo' },
    { u: 'diego', perfil: 'obra', email: 'dacosta@tablerosdelta.com.ar', ultimo: 'ayer 16:02', estado: 'activo' },
  ];

  // Estado privado sembrado (x.pla)
  BP.seed = {
    leidos: [],
    hecho: [],
    invitados: [],
    aprobaciones: [
      { id: 'ap1', tipo: 'oc', t: 'OC-2026-034-1 · Data center Pilar · Sala 2', d: 'Eléctrica Norte · 11 líneas · caja moldeada y barras', monto: 14250000, pide: 'sofia', regla: 'oc', href: 'd-com-pedidos.html', estado: 'pendiente', cuando: 'hace 1 h' },
      { id: 'ap2', tipo: 'margen', t: 'Presupuesto Planta Norte · Ampliación línea 3 · v2', d: 'Recotizado sin Casa Volta · margen 16,2 %', monto: 57900000, margen: 0.162, pide: 'lucas', regla: 'margen', href: 'd-com-presupuesto.html', estado: 'pendiente', cuando: 'hace 3 h' },
      { id: 'ap0', tipo: 'oc', t: 'OC-2026-031-1 · Hospital Cañuelas', d: 'Eléctrica Norte · 7 líneas', monto: 21894500, pide: 'sofia', regla: 'oc', href: 'd-com-pedidos.html', estado: 'aprobada', por: 'hernan', cuando: '30/09 10:12' },
      { id: 'apz', tipo: 'oc', t: 'OC-2026-027-1 · Torre Alem 1450', d: 'Eléctrica Norte · 19 líneas', monto: 38410000, pide: 'sofia', regla: 'oc', href: 'd-com-pedidos.html', estado: 'aprobada', por: 'hernan', cuando: '18/09 11:52' },
    ],
    reglasAprob: [
      { id: 'oc', on: true, t: 'OC de más de', valor: 10000000, u: 'ars', quien: 'hernan', d: 'Antes de enviarla al distribuidor' },
      { id: 'margen', on: true, t: 'Presupuesto con margen menor a', valor: 18, u: 'pct', quien: 'hernan', d: 'Antes de mandarlo al comitente' },
      { id: 'marca', on: false, t: 'Cambio de marca en un tablero protocolizado', valor: null, u: null, quien: 'martina', d: 'Sale del diseño verificado (IEC 61439): pide nueva verificación' },
    ],
    hilos: [
      { id: 'h1', tipo: 'linea', ref: 'l09', estado: 'abierto', msgs: [
        { u: 'ramiro', t: 'Esto frena el TS-BOMBAS: sin el seccionador no cierro el armado.', cuando: 'ayer 17:40' },
        { u: 'martina', t: '@lucas el plano dice NH00 pero no la corriente. ¿Le preguntás a Ribera si es 125 A o 160 A?', cuando: 'ayer 18:02' },
        { u: 'lucas', t: 'Pregunté a la constructora, contestan mañana. @sofia no lo pidas todavía.', cuando: 'hoy 08:55' },
      ] },
      { id: 'h2', tipo: 'simbolo', ref: 'tsbombas', sim: 'Símbolo sin identificar 2 de 3', estado: 'abierto', msgs: [
        { u: 'martina', t: '@lucas ¿esto es un relé de nivel o un guardamotor? Está al lado de la bomba 2.', cuando: 'ayer 16:20' },
        { u: 'lucas', t: 'Relé de nivel de la cisterna. No está en el catálogo base, lo cargo a mano.', cuando: 'ayer 16:41' },
      ] },
      { id: 'h3', tipo: 'linea', ref: 'l06', estado: 'resuelto', msgs: [
        { u: 'lucas', t: 'El NSX630F no dice poder de corte. Lo cotizo sin filtrar por kA, ¿ok @martina?', cuando: '29/09 11:10' },
        { u: 'martina', t: 'Sí, pero en el presupuesto aclará 36 kA mínimo.', cuando: '29/09 11:32' },
      ] },
    ],
    reglas: [
      { id: 'r1', on: true, h: 'h1', cuando: 'Un plano queda Listo', si: 'Cualquier obra', entonces: 'Avisar a Presupuesto', a: 'lucas', canal: 'aviso', veces: 14, ultima: '29/09 18:12' },
      { id: 'r2', on: true, h: 'h1', cuando: 'Una lista de precios tiene más de 30 días', si: 'Distribuidores con líneas cotizadas', entonces: 'Pedir actualización al distribuidor', a: 'sofia', canal: 'email', veces: 2, ultima: 'hoy 07:00' },
      { id: 'r3', on: true, h: 'h1', cuando: 'Una OC no se responde en 24 h', si: 'OC en espera', entonces: 'Recordar al distribuidor y avisar a Compras', a: 'sofia', canal: 'email', veces: 7, ultima: 'hoy 09:00' },
      { id: 'r4', on: true, h: 'h2', cuando: 'Llega un remito parcial', si: 'Recepción con faltantes', entonces: 'Avisar al taller con lo que falta', a: 'ramiro', canal: 'aviso', veces: 1, ultima: '25/09 11:40' },
      { id: 'r5', on: false, h: 'h2', cuando: 'Un faltante frena un tablero', si: 'Línea bloqueada con el tablero en armado', entonces: 'Avisar a Compras', a: 'sofia', canal: 'aviso', veces: 0, ultima: '' },
    ],
    ejecuciones: [
      { id: 'e9', r: 'r3', cuando: 'hoy 09:00', obj: 'OC-2026-031-1 · Eléctrica Norte', res: 'ok', d: 'Recordatorio por email (simulado: el email llega en el Sprint 5)' },
      { id: 'e8', r: 'r3', cuando: 'hoy 09:00', obj: 'OC-2026-031-3 · Electro Sur', res: 'ok', d: 'Recordatorio por email (simulado)' },
      { id: 'e7', r: 'r2', cuando: 'hoy 07:00', obj: 'Casa Volta Mayorista · lista del 30/08', res: 'ok', d: '32 días · pedido de actualización enviado' },
      { id: 'e6', r: 'r2', cuando: 'hoy 07:00', obj: 'Distribuidora Ohm · lista del 17/09', res: 'omitida', d: '14 días: todavía no pasa los 30' },
      { id: 'e5', r: 'r1', cuando: '29/09 18:12', obj: 'TSG-PB · Hospital Cañuelas', res: 'ok', d: 'Aviso a Lucas Ferreyra' },
      { id: 'e4', r: 'r1', cuando: '29/09 17:55', obj: 'TS-PISO · Hospital Cañuelas', res: 'ok', d: 'Aviso a Lucas Ferreyra' },
      { id: 'e3', r: 'r4', cuando: '25/09 11:40', obj: 'Remito R-0001-00045390 · Distribuidora Ohm', res: 'ok', d: 'Aviso a Ramiro Ojeda: faltan 2 de 6 líneas' },
      { id: 'e2', r: 'r3', cuando: '19/09 09:00', obj: 'OC-2026-027-2 · Casa Volta', res: 'omitida', d: 'El distribuidor ya había respondido (rechazó)' },
    ],
    propuestas: [],
  };

  // Plan y facturación (hipótesis de precio sin validar: Roadmap S5 «Pagos»)
  BP.planes = [
    { id: 'inicial', t: 'Inicial', usd: 150, usuarios: 3, planos: '40 planos por mes', ia: 40 },
    { id: 'pro', t: 'Profesional', usd: 390, usuarios: 10, planos: '150 planos por mes', ia: 120 },
    { id: 'empresa', t: 'Empresa', usd: null, usuarios: null, planos: 'Planos sin límite', ia: null },
  ];
  BP.facturas = [
    { n: 'A 0003-00000412', per: 'Septiembre 2026', fecha: '2026-09-01', usd: 390, bna: 1505, estado: 'Pagada' },
    { n: 'A 0003-00000377', per: 'Agosto 2026', fecha: '2026-08-01', usd: 390, bna: 1462, estado: 'Pagada' },
    { n: 'A 0003-00000341', per: 'Julio 2026', fecha: '2026-07-01', usd: 390, bna: 1421, estado: 'Pagada' },
    { n: 'A 0003-00000309', per: 'Junio 2026', fecha: '2026-06-01', usd: 150, bna: 1388, estado: 'Pagada' },
  ];
  // Tope por persona (suma = tope de la empresa, US$ 120)
  BP.topeUsuario = { martina: 60, lucas: 30, sofia: 15, hernan: 15 };
  BP.costoAsistente = 0.21;  // US$ por consulta (promedio del mes: 15,4 / 74)

  // Estado del servicio (vista del usuario). Tiempos de detección medidos en el último mes (ejemplo).
  BP.servicios = [
    { id: 'det', t: 'Detección de planos', d: 'Lectura del DXF y clasificación de símbolos', i: 'scan-search', st: 'ok', p50: '1 min 50 s', p95: '4 min 20 s', disp: 99.2 },
    { id: 'rec', t: 'Recorte de tableros', d: 'La tijera: varias zonas de un mismo DXF', i: 'scissors', st: 'ok', p50: '14 s', p95: '48 s', disp: 99.8 },
    { id: 'pdf', t: 'Conversión de PDF', d: 'PDF vectorial al DXF que lee la detección', i: 'file-input', st: 'ok', p50: '22 s', p95: '71 s', disp: 99.6 },
    { id: 'mat', t: 'Matching y cotización', d: 'Componente base + atributos esenciales, sin IA', i: 'git-compare-arrows', st: 'ok', p50: '3 s', p95: '9 s', disp: 99.9 },
    { id: 'lec', t: 'Lectura IA de líneas y catálogos', d: 'Vincula cada línea a su componente base', i: 'sparkles', st: 'ok', p50: '2 s', p95: '6 s', disp: 99.5 },
    { id: 'mail', t: 'Notificaciones por email', d: 'Pedidos y respuestas de los distribuidores', i: 'mail', st: 'sk', p50: '—', p95: '—', disp: null },
  ];
  // 30 días de disponibilidad de la detección (0 = sin problemas, 1 = demora, 2 = caída parcial)
  BP.dias = [0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0];
  BP.incidentes = [
    { f: '27/09 14:10', dur: '14 min', t: 'Detección demorada: cola llena', d: 'El detector contestó «ocupado» (503) a 6 planos. Se reintentaron solos y terminaron bien; nadie tuvo que hacer nada.', st: 'resuelto' },
    { f: '10/09 11:02', dur: '38 min', t: 'Lectura IA lenta', d: 'El proveedor del modelo respondió lento. Las líneas quedaron «Leyendo…» y se completaron después; las que ya estaban en caché no se volvieron a pagar.', st: 'resuelto' },
  ];
  BP.tamanos = [
    { t: 'Chico', ej: 'hasta 20 · TS-PISO', p50: '1 min 10 s', p95: '2 min 30 s' },
    { t: 'Mediano', ej: '20 a 60 · TGBT', p50: '2 min 20 s', p95: '4 min 10 s' },
    { t: 'Grande', ej: 'más de 60 · TS-ASC', p50: '3 min 40 s', p95: '5 min (límite)' },
  ];

  window.BP = BP;
})();
