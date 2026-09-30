/* Contenido de la galería. Cada sección: id, title, short, caps, chips, priority, desc (HTML), tradeoffs, states, frames.
   frames: una línea por marco `kind|src|caption|note` (d = laptop 1440, m = teléfono 390). */
window.GALLERY_SECTIONS = [
{
  id: 'recorrido', title: 'Recorrido completo: plano → solicitud → oferta → comparación → pedido', short: 'Recorrido', caps: ['existe', 'propuesto'], priority: 'alta',
  desc: `<p>El mismo dato recorre los dos roles. Probalo en orden: la Clínica San Martín tiene bloqueos reales (3 símbolos sin identificar, 2 líneas sin marca, TS-B sin procesar). Resolvelos en la revisión y en el BOM y la cotización se habilita. La solicitud le llega a Sur Eléctrica, que arma una <b>oferta editable</b> desde su catálogo, confirma stock y propone alternativas. De vuelta en ingeniería, se compara contra las otras ofertas, se aprueba la equivalencia técnica, se adjudica y se emite un pedido por distribuidor. El distribuidor confirma y recién ahí ve el contacto del comprador. Hotel Costa Serena (SC-0141) ya tiene dos ofertas para arrancar desde el paso 6.</p>`,
  frames: `
d|d-inicio.html|Inicio: qué te toca en cada obra|El pipeline de obras por etapa sale del estado; se actualiza en vivo
d|d-obra.html?p=p1&v=guiado|Obra guiada: planos, procesamiento y bloqueos|Subí, recortá, procesá (detección simulada) y mirá qué falta
d|d-plano.html?p=p1&plan=pl-tde|Revisión en el plano|Asigná o descartá los símbolos que el modelo no nombró
d|d-bom.html?p=p1&v=componente|BOM por componente|Decidí marcas, completá atributos esenciales, mirá el anticipo de cotización
d|d-cotizacion.html?p=p2|Pedir cotización|Referencia de catálogo (no confirmada) → solicitud a distribuidores
d|d-prov-oferta.html?r=r-0141&prefill=1&v=planilla|Distribuidor: oferta editable|Sur Eléctrica ajusta precio, confirma stock y propone alternativas
d|d-comparar.html?r=r-0141&p=p2&v=matriz|Comparar y adjudicar|Oferta confirmada vs referencia, equivalencias, estrategias
d|d-pedidos.html|Pedidos emitidos|Un pedido por distribuidor, orden de compra en PDF
d|d-prov-pedidos.html?demo=ejemplos|Distribuidor confirma el pedido|Confirmar una sola vez; el contacto aparece al confirmar
d|d-presupuesto.html?p=p2|Presupuesto al cliente con margen|Costos según su procedencia, riesgo de inflación y PDF para el cliente`,
},
{
  id: 'obras', title: 'Obras, planos y procesamiento', short: 'Obras y planos', caps: ['existe', 'propuesto'], chips: ['Sprint 2–4', '#1000 cola'], priority: 'alta',
  desc: `<ul><li>Carga real de archivos (DXF/PDF, hasta 15 por vez y 10 PDF; otros tipos se rechazan). El contenido no se lee: la detección es simulada.</li>
<li>Estados de plano iguales a la app: Pendiente, En proceso, Listo, Error, Por revisar. Reemplazar la tabla de referencia marca los planos listos como «Por revisar».</li>
<li>Cola con progreso vivo, cancelar antes de arrancar, falla 504 que <b>no</b> se reintenta sola y botón Reintentar. Repeticiones 1–1000 cambian las cantidades a comprar en todas las pantallas.</li>
<li>Recorte de tableros con mouse o por formulario de teclado, hasta 15 zonas.</li></ul>`,
  tradeoffs: [
    { name: 'Guiado', rec: true, text: 'Cinco pasos con su estado real y lo que bloquea. Para quien procesa pocas obras o recién empieza: nunca se pregunta «¿y ahora qué?».' },
    { name: 'Experto', text: 'Tabla densa con selección múltiple y la cola al costado. Para quien presupuesta 35–40 obras por semana (Meco) y quiere procesar en lote.' },
    { name: 'Móvil', text: 'Solo estado, procesar y bloqueos: el celular no es para subir DXF, sí para seguir la obra en el lugar.' },
  ],
  states: [['d-obras.html?estado=vacio', 'sin obras'], ['d-obras.html?estado=cargando', 'cargando'], ['d-obras.html?estado=error', 'error'], ['d-obra.html?p=p4', 'obra vacía'], ['d-obra.html?p=p1&dialogo=repeticiones&plan=pl-tstipo', 'repeticiones'], ['d-obra.html?p=p1&dialogo=comentarios&plan=pl-tstipo', 'comentarios']],
  frames: `
d|d-obras.html|Obras: tira de planos, próximo paso y total de referencia|existe (rediseño) · búsqueda, etapas y orden
d|d-obras.html?dialogo=nueva|Nueva obra con validación|existe · nombre 3–80, sin duplicados
d|d-obra.html?p=p1&v=experto|Obra experta: tabla de planos y cola|existe · variante Experto
d|d-obra.html?p=p1&dialogo=recortar|Recortar tableros|existe · zonas con mouse o teclado, vista esquemática
m|m-inicio.html|Inicio en el celular|propuesto
m|m-obra.html?p=p1|La obra en el celular|propuesto · planos, progreso, procesar, bloqueos`,
},
{
  id: 'revision', title: 'Revisión de detecciones sobre el plano', short: 'Revisión en plano', caps: ['existe', 'propuesto'], chips: ['Sprint 3–4', 'visor + símbolos'], priority: 'alta',
  desc: `<p>Unifilar esquemático generado desde las detecciones (etiquetado como simulación: no es el DXF). Cada símbolo es un control con teclado que lleva a su línea del BOM, con la cantidad dibujada separada de la cantidad a comprar. Los símbolos sin identificar bloquean la cotización hasta asignarlos a una línea existente, crear una nueva desde las listas cerradas del componente base o descartarlos, de a uno o en lote. Desde una fila del BOM (<code>?linea=</code>) se abre el plano encuadrando el primer símbolo y se recorren los iguales, como en la app actual.</p>`,
  tradeoffs: [
    { name: 'Lienzo experto', text: 'Zoom, paneo, filtros y panel lateral. Para revisar un tablero entero y entender contexto (qué alimenta a qué).' },
    { name: 'Una por una', rec: true, text: 'Cola solo de lo que necesita decisión, sugerencia de IA con confianza, atajos A/D/1–9. La forma más rápida de llegar a cero bloqueos.' },
    { name: 'Tabla accesible', text: 'Todos los símbolos ordenables con las mismas acciones. Alternativa 2D completa para lector de pantalla o para auditar.' },
  ],
  states: [['d-plano.html?p=p1&plan=pl-tde&estado=error', 'error 504'], ['d-plano.html?p=p1&estado=cargando', 'cargando'], ['d-plano.html?p=p2&plan=pl-h1&v=guiada', 'nada pendiente'], ['d-plano.html?p=p1&plan=pl-tspb', 'tablero denso']],
  frames: `
d|d-plano.html?p=p1&linea=b6|Desde una línea del BOM|Encuadra la 1.ª de 6 térmicas 4P 32 A; ‹ › recorre las iguales
d|d-plano.html?p=p1&plan=pl-tde&v=guiada|Revisión una por una|A acepta la sugerencia, D descarta, 1–9 asigna
d|d-plano.html?p=p1&plan=pl-tgbt&v=guiada|Lectura incompleta|Diferencial sin sensibilidad: completar el atributo esencial
d|d-plano.html?p=p1&plan=pl-tde&v=tabla|Tabla accesible|Ordenable, mismas acciones`,
},
{
  id: 'bom', title: 'BOM: componente base, atributos, marcas y alternativas', short: 'BOM', caps: ['existe', 'planificado', 'propuesto'], chips: ['Sprint 4 matching', '#828 BOM alternativo'], priority: 'alta',
  desc: `<ul><li>Cada línea muestra su procedencia (detectado / inferido por regla / manual) y el anticipo de cotización: cuántos catálogos la tienen y el mejor <b>precio de referencia</b>, o por qué no matchea (hoy el front no muestra <code>unmatchedReason</code>; acá sí).</li>
<li>Matching por igualdad: mismo componente base y mismos atributos esenciales; la marca filtra solo si la línea pide una. Sin marca decidida, la línea bloquea la cotización.</li>
<li>Reglas de marca de la cuenta y de la obra (la obra pisa); una marca excluida avisa, no bloquea.</li>
<li>BOM alternativo (Sprint 5): alternativa permitida por línea que viaja en la solicitud al distribuidor.</li>
<li>Exporta XLSX real (consolidado y por tablero, cantidad dibujada vs a comprar) y CSV.</li></ul>`,
  tradeoffs: [
    { name: 'Por componente', rec: true, text: 'Grilla experta con edición en celda y navegación con flechas. La tarea diaria de dejar el BOM cotizable.' },
    { name: 'Por tablero', text: 'Subtotales por tablero y repeticiones, con saltos al plano y al 3D. Para revisar tablero por tablero contra el unifilar.' },
    { name: 'Revisión asistida', text: 'La IA propone correcciones con su fuente (comentario de Dirección, regla de marca, regla de accesorios) y una persona confirma cada una. Útil al primer pase; cobra y tiene tope.' },
  ],
  states: [['d-bom.html?p=p1&estado=error', 'no se pudo guardar'], ['d-bom.html?p=p1&estado=conflicto', 'conflicto 409'], ['d-bom.html?p=p1&v=asistida&estado=limite', 'tope de IA'], ['d-bom.html?p=p4', 'obra sin BOM']],
  frames: `
d|d-bom.html?p=p1&linea=b7|Línea enfocada: diferencial sin sensibilidad|Por tablero, coincidencias, alternativa (planificado #828), comentarios
d|d-bom.html?p=p1&v=tablero|BOM por tablero|Subtotal, repeticiones, links a plano y 3D
d|d-bom.html?p=p1&v=asistida&correr=1|Revisión asistida|IA simulada USD 0,02 por corrida; aplicar o descartar cada propuesta`,
},
{
  id: 'tablero3d', title: 'Tablero 3D explotado vinculado al BOM', short: 'Tablero 3D', caps: ['propuesto'], chips: ['modelo conceptual'], priority: 'media-baja',
  desc: `<p>Gabinete, placa, rieles DIN y aparatos generados desde el BOM de un tablero (ancho por polos en módulos de 18 mm, familia por color). Rotar, hacer zoom, panear, vista explotada con reproducción, aislar una familia, tocar un aparato para ver su línea del BOM con precio de referencia u ofertado. Lleva al plano o al BOM, descarga PNG y CSV. <b>Es un modelo conceptual</b>: los planos son unifilares 2D sin disposición física, así que no es un plano de montaje ni un cálculo de gabinete (exclusión del alcance). Tiene vista 2D/tabla equivalente y cae a 2D si no hay WebGL.</p>`,
  tradeoffs: [
    { name: '3D', text: 'Hace tangible el BOM en una reunión con el cliente o con compras, y muestra de un vistazo qué está sin precio o sin stock. No suma precisión técnica.' },
    { name: 'Vista 2D / tabla', rec: true, text: 'Frente del tablero en SVG y la tabla, con la misma selección. Accesible, liviano, suficiente para revisar.' },
  ],
  states: [['d-tablero-3d.html?p=p1&estado=sin-webgl', 'sin WebGL'], ['m-tablero-3d.html?p=p1', 'móvil']],
  frames: `
d|d-tablero-3d.html?p=p1&plan=pl-tgbt|TGBT en 3D|Rotá, acercá, tocá un aparato para ver su línea del BOM
d|d-tablero-3d.html?p=p1&plan=pl-tgbt&explotada=80&linea=b6|Vista explotada con un aparato elegido|Térmicas 4P 32 A resaltadas; el panel muestra su línea del BOM y precios
m|m-tablero-3d.html?p=p1|3D en el celular|Un dedo rota, pellizco para zoom, hoja inferior con el aparato`,
},
{
  id: 'compras', title: 'Cotización, comparación de ofertas y adjudicación', short: 'Comparar y adjudicar', caps: ['existe', 'propuesto'], chips: ['Sprint 3 cotización', 'RFQ nuevo'], priority: 'alta',
  desc: `<ul><li>La cotización de catálogo (existe) queda como <b>referencia</b>: siempre dice «precio de referencia, no confirmado» y marca precios vencidos.</li>
<li>Nuevo: solicitud a distribuidores elegidos con vencimiento, líneas y alternativas permitidas. Cada distribuidor ve solo su oferta.</li>
<li>Comparación sobre ofertas confirmadas: stock confirmado, parcial, a pedido o sin confirmar; ofertas vencidas no se adjudican; una alternativa sugerida no se adjudica hasta que ingeniería aprueba la equivalencia técnica.</li>
<li>Adjudicar por línea o por estrategia (más barato, más rápido, único proveedor). Si supera el monto de la regla, pide aprobación de Dirección (desde el celular). Se emite un pedido por distribuidor.</li></ul>`,
  tradeoffs: [
    { name: 'Matriz', rec: true, text: 'Material × distribuidor, clic para adjudicar. Para compradores que conocen su mercado y quieren control celda por celda.' },
    { name: 'Escenarios', text: 'Costo total contra plazo máximo por estrategia, ahorro frente al mejor proveedor único. Para decidir el criterio antes que las celdas, o explicárselo a Dirección.' },
    { name: 'Asistente de compras', text: 'Recomendación en castellano con evidencia y riesgos (stock parcial, oferta por vencer, equivalencia pendiente). Para quien compra poco o no conoce a los distribuidores; la persona aplica.' },
  ],
  states: [['d-cotizacion.html?p=p1', 'bloqueada'], ['d-comparar.html?r=r-0141&p=p2&v=asistente&estado=limite', 'asistente sin presupuesto'], ['d-comparar.html?r=r-0141&p=p2&dialogo=equivalencia', 'equivalencia técnica'], ['d-comparar.html?r=r-0127&p=p3', 'adjudicada'], ['d-pedidos.html?estado=vacio', 'sin pedidos']],
  frames: `
d|d-cotizacion.html?p=p1|Cotización bloqueada|Bloqueos con links; envío deshabilitado
d|d-comparar.html?r=r-0141&p=p2&v=escenarios|Comparar · Escenarios|Costo contra plazo por estrategia
d|d-comparar.html?r=r-0141&p=p2&v=asistente|Comparar · Asistente de compras|IA simulada USD 0,03; la persona aplica
d|d-comparar.html?r=r-0141&p=p2&dialogo=equivalencia|Equivalencia técnica|Alternativa sugerida vs pedido, atributo por atributo
d|d-pedidos.html?p=p3&o=oc-0098|Pedido confirmado|Contacto visible solo al confirmar; orden de compra PDF
d|d-directorio.html?p=p1|Distribuidores|Marcas, respuesta y cobertura para la obra
m|m-aprobar.html|Aprobar desde el celular|Dirección decide adjudicaciones y equivalencias`,
},
{
  id: 'proveedor', title: 'Distribuidor: solicitudes, oferta editable y pedidos', short: 'Distribuidor', caps: ['existe', 'propuesto'], chips: ['hoy: aceptar o rechazar todo'], priority: 'alta',
  desc: `<p>Hoy el distribuidor solo acepta o rechaza el pedido entero. Acá recibe una lista estructurada en el idioma del tablerista, prellenada desde <b>su</b> catálogo con precio de referencia y «disponibilidad sin confirmar», y la convierte en oferta: ajusta precio (con la diferencia contra su catálogo), confirma stock total o parcial, plazo, no cotiza una línea con motivo, ofrece alternativas con justificación de equivalencia, aplica descuento global y condición de pago. Guarda borrador, valida y envía; puede editar mientras la solicitud siga abierta. Nunca ve precios ni nombres de otros distribuidores. El contacto del comprador aparece al confirmar el pedido, con datos reales del store (en dev hoy son datos fijos de ejemplo).</p>`,
  tradeoffs: [
    { name: 'Planilla', rec: true, text: 'Densa, con Tab entre celdas y acciones masivas. Para el vendedor que responde 15–20 presupuestos por día.' },
    { name: 'Línea por línea', text: 'Tarjetas guiadas con progreso. Para ofertas con alternativas o stock parcial que requieren pensar cada línea.' },
    { name: 'Móvil', text: 'Confirmar stock y precio con dedos, y enviar: responder en 2–3 horas aunque no esté en la oficina.' },
  ],
  states: [['d-prov-oferta.html?r=r-0141&estado=error', 'error al enviar'], ['d-prov-solicitudes.html?estado=vacio', 'sin solicitudes']],
  frames: `
d|d-prov-inicio.html|Inicio del distribuidor|Solicitudes por vencer, borradores, pedidos a confirmar, leads del mes
d|d-prov-solicitudes.html?demo=ejemplos|Solicitudes recibidas|Comprador visible, contacto oculto; estado de mi oferta y resultado
d|d-prov-oferta.html?r=r-0141&prefill=1&v=planilla|Oferta · Planilla|Precio, stock, plazo, alternativa; totales vivos
d|d-prov-oferta.html?r=r-0141&prefill=1&v=lineas|Oferta · Línea por línea|Tarjetas guiadas con progreso
m|m-prov-oferta.html?r=r-0141|Ofertar desde el celular|Confirmar stock y precio, enviar
d|d-prov-pedidos.html?o=oc-0100&dialogo=rechazar&demo=ejemplos|Rechazar pedido|Motivo obligatorio; se responde una sola vez
m|m-prov-pedidos.html?demo=ejemplos|Pedidos en el celular|Confirmar o rechazar una sola vez`,
},
{
  id: 'catalogo', title: 'Catálogo del distribuidor y vinculación con IA', short: 'Catálogo', caps: ['existe', 'planificado'], chips: ['Sprint 3–4', '#835 importación incremental'], priority: 'media',
  desc: `<ul><li>Resumen, tabla filtrable, alta/edición con validación (código del producto único; el código de la marca es de marca, no de producto; la gama es la submarca). Editar el nombre de un ítem vinculado por IA lo vuelve a «pendiente de lectura», como en la app.</li>
<li>Importación en 3 pasos desde un CSV real o la planilla de ejemplo: mapeo recordado por encabezado, errores por fila, <b>reemplazar</b> (existe) o <b>actualizar sin reemplazar</b> (planificado #835). Los vínculos manuales sobreviven.</li>
<li>Historial de precios por ítem (el backend ya lo guarda, ninguna ruta lo lee).</li>
<li>Lectura con IA simulada a USD 0,00146 por fila, con progreso y cancelación; filas que no se pueden leer explican por qué y se estandarizan a mano eligiendo de listas cerradas.</li></ul>`,
  tradeoffs: [
    { name: 'Bandeja', rec: true, text: 'Tabla con estados y editor al costado: para revisar muchas filas y elegir el orden.' },
    { name: 'Tarjetas una por una', text: 'Un producto por vez con atajos: para vaciar la bandeja sin pensar en el resto.' },
  ],
  frames: `
d|d-prov-catalogo.html|Catálogo|Resumen, filtros, precios vencidos, publicar o despublicar
d|d-prov-catalogo.html?dialogo=importar|Importar planilla|Subir, mapear columnas, previsualizar y confirmar
d|d-prov-vinculacion.html|Vinculación · Bandeja|Lectura IA simulada, estandarización con listas cerradas
d|d-prov-vinculacion.html?v=tarjetas|Vinculación · Tarjetas|Una fila por vez`,
},
{
  id: 'presupuesto', title: 'Presupuesto de venta y margen con riesgo de inflación', short: 'Presupuesto y margen', caps: ['propuesto'], chips: ['GRAMONT: el valor es el costeo'], priority: 'media-alta',
  desc: `<p>El tablerista convierte el costo en precio para su cliente. El costo de materiales se muestra según de dónde sale cada número: pedido emitido, oferta confirmada vigente, precio de referencia o sin precio. Un presupuesto armado sobre referencias es más riesgoso y se avisa. Cascada completa (materiales → mano de obra → accesorios → cobertura → contingencia → margen), margen sobre venta y su recargo equivalente, deriva esperada si los precios suben durante la validez y precio mínimo para no perder. El PDF para el cliente no incluye distribuidores ni precios de compra; el XLSX interno sí.</p>`,
  tradeoffs: [
    { name: 'Calculadora', rec: true, text: 'Parámetros y cascada en vivo. Para quien presupuesta todos los días.' },
    { name: 'Comparador', text: '2–4 escenarios lado a lado con las diferencias marcadas. Para decidir con Dirección cuánto margen resignar.' },
    { name: 'Guiado', text: 'Cuatro pasos con explicaciones (margen ≠ recargo). Para quien presupuesta de vez en cuando.' },
  ],
  states: [['d-presupuesto.html?p=p3', 'todo con pedidos'], ['d-presupuesto.html?p=p4', 'obra vacía'], ['d-presupuesto.html?p=p1&estado=sin-precios', 'sin precios'], ['d-presupuesto.html?p=p1&moneda=USD', 'en USD']],
  frames: `
d|d-presupuesto.html?p=p1&v=calculadora|Calculadora|Solo referencias + 1 línea sin precio: el PDF se bloquea hasta cargarle precio
d|d-presupuesto.html?p=p1&v=comparador|Comparador de escenarios|Base, cobertura por inflación, competitivo y propios
d|d-presupuesto.html?p=p3&v=guiado&paso=3|Guiado · riesgo|Paso 3 de 4 con costos ya confirmados por pedido`,
},
{
  id: 'asistentes', title: 'Asistentes de IA especializados', short: 'Asistentes IA', caps: ['propuesto'], chips: ['IA simulada'], priority: 'media',
  desc: `<p>Cuatro asistentes (Revisión, Estimación, Compras, Catálogo) que responden con datos de la obra y citan de dónde sale cada número. Cada respuesta muestra su costo estimado y descuenta del tope mensual. Toda acción propuesta (poner una marca, aprobar una equivalencia) se ejecuta recién cuando una persona la confirma, y se revalida contra el estado actual. Si no sabe, lo dice. Sin presupuesto o con el servicio caído, quedan los caminos manuales.</p>`,
  states: [['d-asistentes.html?estado=limite', 'tope de IA'], ['d-asistentes.html?estado=ia-no-disponible', 'IA caída']],
  frames: `
d|d-asistentes.html?p=p1&a=revision&q=rev-bloqueos|Asistente de Revisión|Qué bloquea la Clínica; propone marcas que confirmás
d|d-asistentes.html?p=p1&a=estimacion&q=est-margen|Asistente de Estimación|Margen si la validez es 15 días
d|d-asistentes.html?p=p2&a=catalogo&q=cat-alternativas|Asistente de Catálogo|Alternativa Chint comparada por atributos esenciales`,
},
{
  id: 'equipo', title: 'Equipo, aprobaciones, comentarios y automatizaciones', short: 'Equipo y reglas', caps: ['planificado', 'propuesto'], chips: ['Sprint 5 correos'], priority: 'media',
  desc: `<p>Hoy cada obra tiene un solo dueño y no hay avisos: el cliente consulta y espera. Propuesta: invitar al equipo con acceso por obra, comentarios sobre planos y líneas, aprobaciones de Dirección por monto, y reglas simples de lista cerrada («cuando llega una oferta, avisar a Ingeniería por correo») que se disparan con los eventos reales de la demo. Los correos del Sprint 5 aparecen en la bandeja simulada: ninguno sale del prototipo.</p>`,
  frames: `
d|d-automatizaciones.html?tab=reglas|Automatizaciones|Reglas cerradas, monto editable, crear y probar
d|d-automatizaciones.html?tab=aprobaciones&estado=con-aprobacion|Aprobaciones|Dirección aprueba o rechaza sobre el monto
d|d-automatizaciones.html?tab=correos|Correos simulados|Lo que se enviaría
m|m-avisos.html|Avisos en el celular|Ingeniería; con ?rol=prov, los del distribuidor`,
},
{
  id: 'cuenta', title: 'Plan, cobros, uso de IA y estado del servicio', short: 'Plan y uso', caps: ['planificado'], chips: ['Sprint 5 pagos', '#836 observabilidad'], priority: 'media-alta',
  desc: `<p>Dos fuentes de ingreso planificadas: suscripción con cupo de tableros para ingeniería y comisión por lead para distribuidores. Los precios son <b>hipótesis a validar</b>: nadie en el discovery fue consultado sobre cuánto pagaría. La separación es explícita: lo que se le paga a liard no es el pago de los materiales, que se acuerda fuera de la plataforma. Uso de IA por obra con tope mensual, aviso y corte duro. El estado del servicio calcula p50 y p95 a partir de los tiempos reales de los planos de la demo.</p>`,
  states: [['d-cuenta.html?tab=estado&estado=degradado', 'detección degradada'], ['d-cuenta.html?tab=perfil', 'perfil y baja']],
  frames: `
d|d-cuenta.html?tab=plan|Plan y facturación|Cupo calculado, planes hipotéticos, factura PDF
d|d-cuenta.html?rol=prov|Plan del distribuidor|Comisión por lead ≠ pago de materiales
d|d-cuenta.html?tab=ia|Uso de IA|Registro, tope, aviso y CSV
d|d-cuenta.html?tab=estado&estado=degradado|Estado del servicio|p50/p95, cola y guía ante degradación`,
},
{
  id: 'sistema', title: 'Sistema visual compartido', short: 'Sistema visual', caps: ['propuesto'],
  desc: `<p>Papel técnico cálido para trabajar, escenario azul noche para plano, 3D e IA. Amarillo tensión para foco y selección, cobre para costos y margen, cian para IA. IBM Plex Sans y Mono (números tabulares), Space Grotesk para títulos. La procedencia es parte del sistema: detectado, inferido, manual, precio de referencia y oferta confirmada tienen etiqueta propia y nunca se comunican solo con color. Tokens en <code>tokens.css</code>, componentes en <code>ui.css</code>, contratos en <code>CONTRATOS.md</code>.</p>`,
  frames: `
d|d-kit.html|Tokens, estados y procedencia|Componentes compartidos por todas las pantallas`,
},
{
  id: 'cobertura', title: 'Mapa de cobertura', short: 'Cobertura', caps: [],
  desc: `<p>Qué cubre la galería frente a lo que existe en <code>dev</code>, lo planificado en el Sprint 5 y lo que se propone por primera vez. El detalle, el puntaje y lo diferido o descartado están en <a href="estrategia/02-oportunidades.html">oportunidades</a>.</p>`,
  html: `<div class="card tbl-wrap"><table class="tbl cov"><thead><tr><th>Capacidad</th><th>Estado en dev</th><th>En la galería</th><th>Pantallas</th></tr></thead><tbody>
<tr><td>Obras, carga de planos DXF/PDF, recorte, cola de procesamiento</td><td>${'existe'}</td><td>Rediseño guiado/experto + móvil</td><td>d-obras, d-obra, m-obra</td></tr>
<tr><td>Revisión de símbolos sobre el plano</td><td>existe</td><td>3 variantes + recorrido por línea</td><td>d-plano</td></tr>
<tr><td>Editor de BOM, componente base, marcas y preferencias</td><td>existe (reglas de marca no llegan al matcher)</td><td>3 variantes, anticipo de cotización con motivo</td><td>d-bom</td></tr>
<tr><td>BOM alternativo</td><td>planificado Sprint 5 (#828–#831)</td><td>Alternativa por línea que viaja en la solicitud</td><td>d-bom, d-prov-oferta</td></tr>
<tr><td>Matching por componente base para todos los componentes</td><td>planificado Sprint 5 (#945, #856)</td><td>Supuesto funcionando con 11 tipos de la demo</td><td>d-bom, d-cotizacion</td></tr>
<tr><td>Cotización desde catálogos</td><td>existe</td><td>Como referencia, nunca como oferta</td><td>d-cotizacion</td></tr>
<tr><td>Solicitud a distribuidores y oferta editable</td><td>no existe (solo aceptar/rechazar)</td><td>Propuesta central</td><td>d-cotizacion, d-prov-oferta, m-prov-oferta</td></tr>
<tr><td>Comparación, equivalencia técnica, adjudicación, aprobación</td><td>parcial (matriz de solo lectura)</td><td>3 variantes + aprobación móvil</td><td>d-comparar, m-aprobar</td></tr>
<tr><td>Pedidos por distribuidor, confirmar o rechazar</td><td>existe (contacto con datos fijos)</td><td>Rediseño con contacto real y PDF</td><td>d-pedidos, d-prov-pedidos</td></tr>
<tr><td>Catálogo, importación, lectura IA, vinculación</td><td>existe (importación incremental #835 abierta)</td><td>Reemplazar o actualizar, historial de precios</td><td>d-prov-catalogo, d-prov-vinculacion</td></tr>
<tr><td>Correos de pedidos a ambas partes</td><td>planificado Sprint 5</td><td>Bandeja simulada + reglas</td><td>d-automatizaciones</td></tr>
<tr><td>Pagos: suscripción + comisión por lead</td><td>planificado Sprint 5, sin validar</td><td>Precios hipotéticos, separación de pagos</td><td>d-cuenta</td></tr>
<tr><td>Control de gasto de IA por usuario</td><td>planificado Sprint 5 (#836)</td><td>Registro, tope y aviso</td><td>d-cuenta, asistentes</td></tr>
<tr><td>Observabilidad</td><td>planificado Sprint 5 (#836)</td><td>Estado del servicio simulado</td><td>d-cuenta</td></tr>
<tr><td>Deploy a producción (#985)</td><td>no hecho (roadmap dice lo contrario)</td><td>Fuera de la galería: es el primer bloqueo del roadmap</td><td>—</td></tr>
<tr><td>DWG sin convertir</td><td>planificado Sprint 5 (evaluar)</td><td>Diferido: no cambia la UX</td><td>—</td></tr>
<tr><td>Presupuesto de venta y margen</td><td>no existe</td><td>Propuesto</td><td>d-presupuesto</td></tr>
<tr><td>Tablero 3D conceptual</td><td>no existe</td><td>Propuesto, prioridad baja</td><td>d-tablero-3d, m-tablero-3d</td></tr>
<tr><td>Asistentes, equipo, aprobaciones, automatizaciones</td><td>no existe</td><td>Propuesto</td><td>d-asistentes, d-automatizaciones</td></tr>
<tr><td>Índice de precios, datos de fabricantes</td><td>no existe</td><td>Diferido: necesita volumen y consentimiento</td><td>—</td></tr>
</tbody></table></div>`,
},
];
