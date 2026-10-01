/* Área A · Ingeniería: obra → planos → detección → revisión. */
(window.SECCIONES ||= []).push(
{
  id: 'ing-proyectos', orden: 110, etapa: 'Ingeniería', horizonte: 'existe', roles: ['ing', 'dir'],
  refs: ['front/src/pages/ProjectsPage.tsx', 'ProjectCard.tsx · barra tricolor', 'ProjectDetailPage.tsx', 'Visión · ciclo completo'],
  titulo: 'Proyectos y camino de la obra', corto: 'Proyectos',
  descripcion: 'La grilla de proyectos de dev, con la barra tricolor por estado de planos, buscar y filtrar por estado y fecha. Se le suma «Lo que te toca hoy» (lo que frena las obras, armado con el estado real de planos, líneas, revisiones y aprendizaje) y la etapa del ciclo de cada obra, con dos vistas más sobre los mismos datos: lista y por etapa. En el detalle, un «camino del proyecto» que abre la pantalla de cada paso: Planos → BOM → Cotización → Compra → Taller → Entrega.',
  existe: 'En dev: /projects (grilla, ProjectCard con barra tricolor y estado Listo / En Proceso / Requiere Atención / Sin Planos, buscador con atajo /, filtros Estado y Fecha, tarjeta «Iniciar Nuevo Proyecto», primeros pasos) y /projects/:id (tabla de referencia, planos con chips de estado, BOM consolidado). No existen: lo que te toca hoy, etapa del ciclo, vistas lista y por etapa, camino del proyecto.',
  reglas: ['El estado de la tarjeta sale de los planos: error o por revisar → «Requiere Atención».', 'Lo que te toca hoy se recalcula con el estado: si resolvés el símbolo en el visor, el pendiente desaparece.', 'La etapa es la del último paso con algo pendiente; cada paso del camino lee su área (BOM, pedidos, taller).'],
  estados: [['Vacío (sin proyectos)', 'd-ing-proyectos.html?estado=vacio'], ['Cargando', 'd-ing-proyectos.html?estado=cargando']],
  marcos: `
    d|d-ing-proyectos.html|Proyectos con «lo que te toca hoy»|Grilla real de dev + etapa del ciclo por obra
    d|d-ing-proyectos.html?vista=etapas|Vista por etapa del ciclo|Las mismas obras agrupadas de Ingeniería a Entrega
    d|d-ing-proyecto.html|Detalle de la obra con el camino del proyecto|Cada paso abre BOM, cotización, pedidos, taller o entregas
  `,
},
{
  id: 'ing-carga', orden: 120, etapa: 'Ingeniería', horizonte: 'h1', roles: ['ing'],
  refs: ['docs/analisis-mejoras · «la mejora más valiosa»', 'Roadmap S5 · DWG', 'UploadPlansDialog.tsx · MAX_PLANS_PER_UPLOAD = 15', 'Drawer AI · leyenda primero'],
  titulo: 'Carga de planos y validación de la tabla de referencia', corto: 'Carga y tabla',
  descripcion: 'Un asistente de cuatro pasos: obra, tabla de referencia, planos, confirmar. La tabla se lee al subirla y se muestra qué materiales se leyeron, cuáles son dudosos (un símbolo con dos nombres, una fila sin texto) y cuáles no tienen componente base. Si se leen 2 materiales, no se avanza en silencio. Los planos aceptan DXF y PDF (existe) y DWG (Sprint 5, con aviso de conversión en evaluación), con repeticiones por plano, rechazos por tipo, por más de 15 planos y por más de 100 MB, y el costo estimado de la detección contra el tope del mes.',
  existe: 'En dev: subir tabla de referencia DXF (opcional desde S4) y recortarla de un plano, UploadPlansDialog con «un archivo por tablero» o «un plano con varios tableros» (tijera), DXF y PDF (el PDF se convierte a DXF), hasta 15 planos de 100 MB, repeticiones ×N. No existen: validar la tabla al subirla, DWG, duplicar de un proyecto, costo antes de procesar.',
  reglas: ['La detección solo reconoce lo que está en la tabla: una tabla mala da un BOM vacío sin error, por eso se valida antes.', 'Si se leen 0 o 2 materiales hay advertencia explícita y tres caminos: otra tabla, seguir sin tabla o usarla igual con confirmación.', 'Un archivo rechazado no frena a los demás; el motivo y qué hacer van en la fila.', 'Sin IA: seguir sin validar (como hoy) o cargar la lista a mano.'],
  estados: [['Leyendo la tabla', 'd-ing-carga.html?estado=cargando'], ['Tabla que no es tabla (error)', 'd-ing-carga.html?estado=error'], ['Sin IA', 'd-ing-carga.html?estado=sin-ia'], ['Límite de 15 planos', 'd-ing-carga.html?estado=limite'], ['Confirmar y costo', 'd-ing-carga.html?paso=4']],
  marcos: `
    d|d-ing-carga.html?paso=2|Validación de la tabla de referencia|23 materiales leídos, 2 dudosos para decidir
    d|d-ing-carga.html?paso=3|Planos DXF, PDF y DWG con repeticiones|Rechazos con motivo: más de 100 MB y foto
    d|d-ing-carga.html?estado=error|Tabla que en realidad es un unifilar|Leímos 2 materiales: no se avanza en silencio
  `,
},
{
  id: 'ing-cola', orden: 130, etapa: 'Ingeniería', horizonte: 's5', roles: ['ing'],
  refs: ['ProcessingJob QUEUED/RUNNING/SUCCEEDED/FAILED/CANCELLED', 'plan-processing-retry.ts · el 504 no se reintenta', 'PlansToolbar · Cancelar tanda', 'Roadmap S5 · observabilidad'],
  titulo: 'Procesamiento: cola, errores y reintentos', corto: 'Cola y errores',
  descripcion: 'La lista de planos de dev con sus chips de estado, acciones por fila y en lote, más una cola visible con ETA por plano y motivo de cada estado. Un 504 (el detector cortó a los 300 s) no se reintenta solo: la fila ofrece «Recortar en zonas» con zonas sugeridas, y reintentar igual pide confirmación con el costo. Un 503 (detector ocupado) se reintenta solo y se explica. Cancelar tanda cancela lo que no arrancó.',
  existe: 'En dev: cola Postgres con 202 y polling, chips Todos/Listos/En proceso/Pendientes/Errores/Sin identificar, Procesar / Reintentar todos, Cancelar tanda, error del plano en la fila, regla de no reintentar el 504 y sí el 503, tijera manual. Nuevo: cola con ETA y motivo, zonas sugeridas, confirmación con costo antes de reintentar un 504.',
  reglas: ['504 → no se reintenta solo; la acción principal es recortar en zonas (hasta 15 por recorte).', '503 → se reintenta solo, con intento n de 3 a la vista.', 'Cancelar tanda solo cancela lo QUEUED; lo RUNNING termina.', 'Cambiar repeticiones recalcula «a comprar» de las líneas que salen de ese plano.'],
  estados: [['Error 504 y reintento 503', 'd-ing-proyecto.html?estado=error'], ['Cargando', 'd-ing-proyecto.html?estado=cargando']],
  marcos: `
    d|d-ing-proyecto.html?estado=error|504 que no se reintenta y 503 que sí|TS-ASC con «Recortar en zonas», TS-UPS reintentándose solo
    d|d-ing-proyecto.html|Planos y cola de procesamiento con ETA|Cancelar tanda, sacar de la cola, repeticiones ×N
  `,
},
{
  id: 'ing-revision', orden: 140, etapa: 'Ingeniería', horizonte: 'existe', roles: ['ing'],
  refs: ['PlanLayoutV5_InteractiveInspector.tsx', 'UnmappedSymbolsCard / SymbolBulkBar / BatchResolveSymbolsDialog', 'usePlanKeyboardShortcuts (← → 1 2)', 'Togal / Countfire · buscar parecidos'],
  titulo: 'Revisión de símbolos: experta, guiada y asistida por IA', corto: 'Revisión de símbolos',
  descripcion: 'El visor del TS-BOMBAS con sus cajas de detección por color (identificado, por revisar, seleccionado, localizador, descartado) y los tres símbolos sin identificar. Tres formas de revisar con los mismos datos: experta (visor + inspector, J/K/A/D), guiada (de a un símbolo, «¿qué es esto?» con el recorte ampliado y «aplicar a todos los iguales») y asistida por IA (propuesta por símbolo con confianza, fuente y costo, aceptación en lote). Resolver Q0 completa la corriente del seccionador NH00, que deja de bloquear la cotización y el taller; Q2 y Q3 suman guardamotores al BOM.',
  existe: 'En dev: /projects/:id/plans/:planId con Visor CAD y Cómputo BOM, cajas de detección por color, símbolos sin identificar sobre el visor, resolver o descartar uno o en lote, reclasificar con vista previa, localizador desde la fila del BOM, paginar entre planos con ← →, pestañas con 1 y 2. Nuevo: J/K/A/D, vista guiada, vista asistida por IA, aplicar a los iguales.',
  reglas: ['Resolver actualiza planos[].sinId y la línea del BOM: un atributo completo desbloquea la línea; una cantidad suma × repeticiones.', 'Lo aceptado de la IA queda «Manual» (lo confirmó una persona), nunca «Detectado».', 'Todo se puede deshacer desde el toast o desde la lista.', 'Sin IA: aviso y camino manual (guiada o visor), sin perder lo detectado.'],
  estados: [['Sin IA', 'd-ing-plano.html?plano=tsbombas&vista=ia&estado=sin-ia'], ['Cargando el plano', 'd-ing-plano.html?plano=tsbombas&estado=cargando'], ['Plano con error', 'd-ing-plano.html?plano=tsasc'], ['Localizador desde el BOM', 'd-ing-plano.html?plano=tsbombas&linea=l07']],
  marcos: `
    d|d-ing-plano.html?plano=tsbombas|Experta: visor + inspector|Cajas por color, J K A D, resolver o descartar en lote
    d|d-ing-plano.html?plano=tsbombas&vista=guiada|Guiada: de a un símbolo|«¿Qué es esto?» con recorte ampliado y aplicar a los iguales
    d|d-ing-plano.html?plano=tsbombas&vista=ia|Asistida por IA|Confianza, fuente y costo por propuesta; aceptar en lote
    m|m-ing-plano.html|Revisar un símbolo desde el teléfono|Desde el aviso, sin abrir la compu
  `,
},
{
  id: 'ing-revisiones', orden: 150, etapa: 'Ingeniería', horizonte: 'h1', roles: ['ing', 'comp'],
  refs: ['Beam AI · Addendum Variance Report', 'Countfire · comparación entre revisiones', 'Entrevistas · cambios de último momento'],
  titulo: 'Revisión de plano: versión 2 contra versión 1', corto: 'Revisiones de plano',
  descripcion: 'El cliente manda el TS-BOMBAS corregido: suma la bomba 4, quita un diferencial y pasa el seccionador general de NH00 160 A a NH1 250 A. La pantalla superpone las dos revisiones (con mezcla y lado a lado), marca agregado / quitado / cambiado y muestra por línea del BOM el impacto en cantidades (× repeticiones) y en el monto sin IVA con el mejor precio vigente. «Aplicar cambios al BOM» avisa si la OC ya está confirmada y manda la diferencia a cambios de alcance.',
  existe: 'Nada: hoy reemplazar un plano obliga a procesarlo de nuevo y no muestra qué cambió.',
  reglas: ['La comparación es por bloques y textos del DXF, no por píxeles.', 'Si la línea está en una OC enviada o confirmada, la OC no se toca: la diferencia queda como cambio de alcance (d-tal-entregas.html).', 'Se elige qué cambios aplicar; lo no elegido queda como en la rev. 1. Se puede deshacer.'],
  estados: [['Una sola revisión (vacío)', 'd-ing-revisiones.html?estado=vacio'], ['Solo tabla', 'd-ing-revisiones.html?vista=tabla']],
  marcos: `
    d|d-ing-revisiones.html|Diff superpuesto + impacto en el BOM|6 cambios, + $ 204.600 +IVA, aviso de OC confirmada
    d|d-ing-revisiones.html?vista=lado|Lado a lado|Rev. 1 y rev. 2 con los cambios marcados en cada una
  `,
},
{
  id: 'ing-aprendizaje', orden: 160, etapa: 'Ingeniería', horizonte: 'h2', roles: ['ing', 'dir'],
  refs: ['Entrevistas · «aprender de las correcciones»', 'Kreo · Auto Count entrenado', 'EMEVE · IA con alucinaciones: siempre revisión humana'],
  titulo: 'Aprender de las correcciones', corto: 'Aprendizaje',
  descripcion: '«Corregiste 3 veces el bloque girado → guardamotor en planos de Constructora Ribera: ¿lo recordamos?». Un diccionario de símbolos por cliente, familia de planos o toda la empresa, con usos, autor, historial y deshacer, y la precisión de la detección mes a mes (90,1 % → 96,1 %) con alternativa en tabla. Las correcciones hechas en la revisión del plano suman a la cuenta de cada patrón.',
  existe: 'Nada: hoy cada corrección vale solo para ese plano.',
  reglas: ['Nada se recuerda sin aprobación explícita y con alcance elegido.', 'Lo aplicado por una regla queda marcado «Por regla» en el plano y en el BOM.', 'No inventa materiales ni toca «a comprar» por su cuenta.'],
  estados: [['Vacío', 'd-ing-aprendizaje.html?estado=vacio']],
  marcos: `
    d|d-ing-aprendizaje.html|Sugerencias, diccionario y precisión|Recordar con alcance, olvidar, deshacer
    d|d-ing-aprendizaje.html?estado=vacio|Todavía no hay nada para recordar|Estado vacío que explica cómo se arma
  `,
}
);
