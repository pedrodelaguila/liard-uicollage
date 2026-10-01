/* liard · área A (Ingeniería) · datos propios del área. Todo ficticio.
   Las entidades compartidas (proyectos, planos, líneas, ofertas, pedidos) se leen de data.js vía L.get; acá va
   solo lo que esas entidades no tienen: símbolos sin identificar del TS-BOMBAS, la cola de procesamiento,
   la revisión 2 del TS-BOMBAS, el flujo de carga de un proyecto nuevo y el diccionario aprendido. */
(function () {
  // Etapa del ciclo de cada proyecto (vista por etapas en Proyectos). Propuesta: hoy la app no la calcula.
  const etapas = [
    { k: 'ing', t: 'Ingeniería', i: 'layers', d: 'Planos y detección' },
    { k: 'pres', t: 'Presupuesto', i: 'file-spreadsheet', d: 'Costo y precio al comitente' },
    { k: 'comp', t: 'Compras', i: 'shopping-cart', d: 'Cotización y OC' },
    { k: 'fab', t: 'Fabricación', i: 'factory', d: 'Armado y ensayo' },
    { k: 'obra', t: 'Obra y entrega', i: 'hard-hat', d: 'Remitos y montaje' },
  ];
  const proyEtapa = {
    p1: { k: 'fab', d: 'TS-BOMBAS frenado en el taller · 2 OC en espera', href: 'd-tal-taller.html' },
    p2: { k: 'obra', d: 'Entrega el 15/10 · 2 de 3 OC confirmadas', href: 'd-tal-entregas.html' },
    p3: { k: 'comp', d: 'OC-2026-022-1 venció sin respuesta', href: 'd-com-pedidos.html' },
    p4: { k: 'ing', d: '2 planos en detección', href: 'd-ing-proyecto.html' },
    p5: { k: 'ing', d: 'Falta subir la tabla de referencia y los planos', href: 'd-ing-carga.html' },
  };

  // Símbolos sin identificar del TS-BOMBAS (UnidentifiedElectricalComponent). Coordenadas en % del visor.
  // s1 completa el esencial que le falta a l09; s2 y s3 son el mismo bloque (guardamotor girado 90°) → l08.
  const simbolos = {
    tsbombas: [
      { id: 's1', ref: 'Q0', x: 20.5, y: 10.5, w: 10.5, h: 10, desc: 'Texto «NH00 160A» separado del símbolo del seccionador', ubic: 'Entrada general, arriba a la izquierda',
        posible: 'Corriente nominal 160 A del seccionador Q0', accion: 'attr', linea: 'l09', attr: 'Corriente nominal', valor: '160 A',
        ia: { conf: 0.82, fuente: 'Texto «NH00 160A» a 4 mm del símbolo Q0, en la misma capa', costo: 0.04 } },
      { id: 's2', ref: 'Q2', x: 34.5, y: 38.9, w: 7, h: 15, desc: 'Bloque rectangular con tres contactos, girado 90°', ubic: 'Salida bomba 2, centro',
        posible: 'Guardamotor regulación 9–14 A', accion: 'qty', linea: 'l08', grupo: 'gv2-girado',
        ia: { conf: 0.91, fuente: 'Mismo bloque que el guardamotor de la bomba 1 (Q1), girado 90°', costo: 0.04 } },
      { id: 's3', ref: 'Q3', x: 49.5, y: 38.9, w: 7, h: 15, desc: 'Bloque rectangular con tres contactos, girado 90°', ubic: 'Salida bomba 3, centro',
        posible: 'Guardamotor regulación 9–14 A', accion: 'qty', linea: 'l08', grupo: 'gv2-girado',
        ia: { conf: 0.89, fuente: 'Mismo bloque que el guardamotor de la bomba 1 (Q1), girado 90°', costo: 0.04 } },
    ],
  };
  // Cajas detectadas (DetectedComponent) del TS-BOMBAS, para pintar el visor. linea = línea del BOM consolidado.
  const detectadas = {
    tsbombas: [
      { id: 'd1', ref: 'Q0', linea: 'l09', x: 6, y: 7, w: 14, h: 17, conf: 0.88, revisar: true },
      { id: 'd2', ref: 'Q1', linea: 'l08', x: 19.5, y: 38.9, w: 7, h: 15, conf: 0.92 },
      { id: 'd3', ref: 'KM1', linea: 'l07', x: 19.5, y: 58.6, w: 7, h: 12.9, conf: 0.94 },
      { id: 'd4', ref: 'KM2', linea: 'l07', x: 34.5, y: 58.6, w: 7, h: 12.9, conf: 0.93 },
      { id: 'd5', ref: 'KM3', linea: 'l07', x: 49.5, y: 58.6, w: 7, h: 12.9, conf: 0.94 },
      { id: 'd6', ref: 'F1', linea: 'l01', x: 75.5, y: 38.9, w: 7, h: 13, conf: 0.97 },
      { id: 'd7', ref: 'ID1', linea: 'l03', x: 89.5, y: 38.9, w: 7, h: 13, conf: 0.96 },
      { id: 'd8', ref: 'S1', linea: 'l14', x: 75.5, y: 70, w: 7, h: 10, conf: 0.9 },
      { id: 'd9', ref: 'H1', linea: 'l13', x: 89.5, y: 70, w: 7, h: 10, conf: 0.98 },
    ],
  };

  // Cola de procesamiento del proyecto p1 (ProcessingJob). min = minutos desde que arrancó / se encoló.
  const cola = [
    { plano: 'tsups', status: 'RUNNING', intento: 2, max: 3, desde: 4, eta: [2, 4], nota: 'El primer intento recibió 503 (detector ocupado) y se reintentó solo al minuto.' },
    { plano: 'tsext', status: 'QUEUED', intento: 0, max: 3, desde: 6, eta: [6, 10], pos: 1, nota: 'PDF convertido a DXF al subirlo (1 página). Arranca cuando termine TS-UPS.' },
    { plano: 'tsasc', status: 'FAILED', intento: 1, max: 3, desde: 26, codigo: 504, nota: 'El detector cortó a los 300 s. Un 504 no se reintenta solo: el plano es demasiado grande, no fue un mal momento.' },
    { plano: 'tsbombas', status: 'SUCCEEDED', intento: 1, max: 3, desde: 1500, dur: 3.4 },
    { plano: 'tgbt', status: 'SUCCEEDED', intento: 1, max: 3, desde: 2900, dur: 4.1 },
  ];
  // Zonas sugeridas para recortar el TS-ASC (máx. 15 por pedido de recorte).
  const zonasAsc = [
    { n: 'Ascensor 1 · fuerza motriz', x: 4, y: 8, w: 44, h: 40 },
    { n: 'Ascensor 2 · fuerza motriz', x: 52, y: 8, w: 44, h: 40 },
    { n: 'Comando y señalización', x: 4, y: 54, w: 60, h: 38 },
    { n: 'Iluminación de pasadizo', x: 68, y: 54, w: 28, h: 38 },
  ];

  // Revisión 2 del TS-BOMBAS que mandó el cliente. delta se suma a lo que hoy tiene la línea.
  const revision = {
    plano: 'tsbombas', v1: { n: 'Rev. 1', f: '2026-09-29', archivo: 'TS-BOMBAS_rev1.dxf' },
    v2: { n: 'Rev. 2', f: '2026-10-01', archivo: 'TS-BOMBAS_rev2.dxf', de: 'Constructora Ribera S.A.', nota: 'Se agrega la bomba 4 (jockey) de presurización, se quita el tomacorriente de servicio y el seccionador general pasa a 250 A.' },
    cambios: [
      { id: 'c1', tipo: 'agregado', linea: 'l07', delta: 1, ref: 'KM4', motivo: 'Bomba 4 (jockey): contactor', x: 64.5, y: 58.6, w: 7, h: 12.9 },
      { id: 'c2', tipo: 'agregado', linea: 'l08', delta: 1, ref: 'Q4', motivo: 'Bomba 4 (jockey): guardamotor', x: 64.5, y: 38.9, w: 7, h: 15 },
      { id: 'c3', tipo: 'agregado', linea: 'l01', delta: 1, ref: 'F2', motivo: 'Circuito de comando de la bomba 4', x: 82.5, y: 38.9, w: 7, h: 13 },
      { id: 'c4', tipo: 'agregado', linea: 'l14', delta: 1, ref: 'S2', motivo: 'Selectora manual-0-automático de la bomba 4', x: 82.5, y: 70, w: 7, h: 10 },
      { id: 'c5', tipo: 'quitado', linea: 'l03', delta: -1, ref: 'ID1', motivo: 'Se quita el diferencial del tomacorriente de servicio', x: 89.5, y: 38.9, w: 7, h: 13 },
      { id: 'c6', tipo: 'cambiado', linea: 'l09', delta: 0, motivo: 'Seccionador general: 160 A → 250 A (pasa de NH00 a NH1)', antes: '3P NH00 · 160 A', despues: '3P NH1 · 250 A', attrs: { 'Corriente nominal': '250 A', 'Tamaño del fusible': 'NH1' }, spec: '3P NH1 tripolar 250 A', ref: 'Q0', x: 6, y: 7, w: 14, h: 17 },
    ],
    ocAfectada: { oc: 'OC-2026-031-2', prov: 'ohm', lineas: ['l07', 'l08'] },
  };

  // Proyecto nuevo del flujo de carga.
  const nuevo = {
    n: 'Clínica San Vicente · Guardia y quirófanos', cliente: 'Estudio Ferraro & Asoc.', entrega: '2026-12-18', resp: 'martina',
    tabla: { archivo: 'referencias-simbolos-SV.dxf', mb: 1.8, materiales: 23,
      muestra: [
        ['Q-TM', 'Interruptor termomagnético', 'THERMOMAGNETIC_BREAKER'], ['Q-DD', 'Interruptor diferencial', 'RESIDUAL_CURRENT_BREAKER'],
        ['Q-CM', 'Interruptor de caja moldeada', 'MOLDED_CASE_BREAKER'], ['KM', 'Contactor', 'CONTACTOR'], ['Q-GM', 'Guardamotor', 'MOTOR_PROTECTION_BREAKER'],
        ['F-DS', 'Descargador de sobretensiones', 'SURGE_PROTECTION_DEVICE'], ['PM', 'Instrumento de medición multifunción', 'MULTIFUNCTION_METER'],
        ['TI', 'Sensor de corriente', 'CURRENT_SENSOR'], ['H', 'Ojos de buey', 'PILOT_LIGHT'], ['S', 'Selectora', 'SELECTOR_SWITCH'],
        ['X', 'Bornera', 'TERMINAL_BLOCK'], ['TR', 'Transformador de aislación', 'TRANSFORMER'],
      ],
      avisos: [
        { k: 'dup', tipo: 'wa', t: 'El símbolo Q-TM aparece dos veces con nombres distintos', d: '«Termomagnética» en la fila 2 y «Llave térmica» en la fila 17. Elegí uno: si no, la detección puede contarlos separados.' },
        { k: 'sin-texto', tipo: 'wa', t: 'La fila 14 tiene un símbolo sin descripción', d: 'Sin texto al lado, la detección no sabe qué material es. Escribilo o sacá la fila.' },
        { k: 'sin-base', tipo: 'info', t: 'El gabinete no tiene componente base', d: 'Se va a contar, pero no se puede cotizar hasta el Sprint 5 (matching para todos los componentes).' },
      ],
      costo: 0.02,
    },
    tablaMala: { archivo: 'unifilar-TGBT-SV.dxf', mb: 6.4, materiales: 2, muestra: [['—', 'Interruptor termomagnético', 'THERMOMAGNETIC_BREAKER'], ['—', 'Contactor', 'CONTACTOR']] },
    archivos: [
      { id: 'f1', n: 'TGBT-SV.dxf', fmt: 'DXF', mb: 6.4, mult: 1 },
      { id: 'f2', n: 'TS-GUARDIA.dxf', fmt: 'DXF', mb: 3.1, mult: 1 },
      { id: 'f3', n: 'TS-QUIROFANO.pdf', fmt: 'PDF', mb: 12.8, mult: 4, nota: 'Se convierte a DXF al subirlo · 1 página' },
      { id: 'f4', n: 'TS-AIRE-ACOND.dwg', fmt: 'DWG', mb: 9.2, mult: 1, nota: 'Conversión DWG → DXF en evaluación (Sprint 5)' },
    ],
    archivoGrande: { id: 'f5', n: 'PLANTA-COMPLETA-SV.dxf', fmt: 'DXF', mb: 128.4, mult: 1 },
    costoPlano: 2.66, // US$ por plano: 61,20 / 23 planos de septiembre (consumoIA)
  };

  // Aprender de las correcciones: sugerencias, diccionario aprendido e historial.
  const aprendizaje = {
    sugerencias: [
      { id: 'g1', grupo: 'gv2-girado', base: 3, t: 'Bloque de tres contactos girado 90°', a: 'Guardamotor regulación 9–14 A', linea: 'l08', cliente: 'Constructora Ribera S.A.', planos: ['TS-BOMBAS', 'TS-PISO', 'Planta Norte · TB-2'] },
      { id: 'g2', grupo: 'texto-corriente', base: 2, t: 'Corriente escrita al lado del seccionador («NH00 160A»)', a: 'Leer la corriente del texto a menos de 5 mm', linea: 'l09', cliente: 'Constructora Ribera S.A.', planos: ['TS-BOMBAS', 'TSG-PB'] },
      { id: 'g3', grupo: 'rotulo-motor', base: 4, t: 'Rótulo «BOMBA n – x kW» al pie de cada salida', a: 'Descartar: es un rótulo, no un aparato', linea: null, cliente: 'Toda la empresa', planos: ['TS-BOMBAS', 'Planta Norte · Sala de máquinas'] },
    ],
    diccionario: [
      { id: 'r1', t: 'Círculo con «SI» dentro del diferencial', a: 'Interruptor diferencial · clase SI (superinmunizado)', alcance: 'empresa', usos: 31, desde: '2026-06-12', por: 'martina', ultimo: '2026-09-30' },
      { id: 'r2', t: 'Cuadrado con «PM» y cuatro bornes', a: 'Instrumento de medición multifunción', alcance: 'cliente', cliente: 'Constructora Ribera S.A.', usos: 6, desde: '2026-08-04', por: 'lucas', ultimo: '2026-09-29' },
      { id: 'r3', t: 'Ojo de buey dibujado con una «H» y un número', a: 'Ojos de buey Ø22 mm', alcance: 'familia', familia: 'Hospitales · Estudio Ferraro', usos: 12, desde: '2026-07-21', por: 'martina', ultimo: '2026-09-29' },
      { id: 'r4', t: 'Fusible NH dibujado como rectángulo partido', a: 'Seccionador bajo carga con fusible', alcance: 'empresa', usos: 9, desde: '2026-05-30', por: 'lucas', ultimo: '2026-09-17' },
    ],
    historial: [
      { id: 'h1', t: 'Se aplicó «Círculo con SI» en TS-UPS', d: '4 diferenciales quedaron como superinmunizados', por: 'Detección', cuando: '2026-10-01', regla: 'r1' },
      { id: 'h2', t: 'Lucas amplió «PM con cuatro bornes» a Constructora Ribera', d: 'Antes valía solo para el TGBT de Cañuelas', por: 'lucas', cuando: '2026-09-29', regla: 'r2' },
      { id: 'h3', t: 'Martina creó «Ojo de buey con H»', d: 'Desde 5 correcciones en planos de Estudio Ferraro', por: 'martina', cuando: '2026-07-21', regla: 'r3' },
    ],
    // Precisión de la detección por plano procesado (proporción de símbolos que no hubo que corregir), por mes.
    precision: [
      { m: 'Abr', v: 90.1, planos: 14, corr: 7.4 }, { m: 'May', v: 91.3, planos: 18, corr: 6.1 }, { m: 'Jun', v: 92.6, planos: 21, corr: 5.0 },
      { m: 'Jul', v: 93.8, planos: 17, corr: 3.9 }, { m: 'Ago', v: 95.2, planos: 26, corr: 2.8 }, { m: 'Sep', v: 96.1, planos: 23, corr: 2.1 },
    ],
  };

  window.BI = { etapas, proyEtapa, simbolos, detectadas, cola, zonasAsc, revision, nuevo, aprendizaje };
})();
