/* Área F · Plataforma: inicio, asistente IA, colaboración, automatizaciones, plan y consumo, estado del servicio. */
(window.SECCIONES ||= []).push(
  {
    id: 'pla-inicio', orden: 600, etapa: 'Plataforma', horizonte: 'h1',
    roles: ['ing', 'comp', 'dir'],
    refs: ['Visión · dueño de la tablerista', 'Mercado · presupuestado contra real'],
    titulo: 'Inicio por rol y tablero de dirección', corto: 'Inicio',
    descripcion: 'Una sola pantalla de entrada con los mismos datos para todos, ordenados según quién la mira: ingeniería ve planos y líneas que bloquean, compras ve OC sin respuesta y listas vencidas, dirección ve aprobaciones, margen presupuestado contra real, carga del taller, presupuestos ganados y consumo de IA. Debajo, cada obra en su etapa del ciclo.',
    existe: 'Proyectos, estados de plano y de pedido y la barra tricolor existen en dev; la pantalla de Inicio, los pendientes por rol y los indicadores de dirección son nuevos.',
    reglas: [
      'Cada pendiente trae el botón que lo destraba y se puede marcar como hecho (con deshacer).',
      'Los avisos son los mismos de todas las áreas (`B.avisos`): lo que confirma un distribuidor en D aparece acá.',
      'El margen del Hospital Cañuelas sale del mismo cálculo que el asistente: materiales al mejor precio + 3 líneas a precio de referencia + mano de obra.',
      'Toda visualización tiene su tabla al lado (Gráfico / Tabla, Por etapa / Tabla).',
    ],
    estados: [['Empresa nueva (primeros pasos)', 'd-pla-inicio.html?estado=vacio'], ['Cargando', 'd-pla-inicio.html?estado=cargando'], ['Vista de compras', 'd-pla-inicio.html?vista=compras']],
    marcos: `
      d|d-pla-inicio.html?vista=direccion|Dirección: margen, taller, conversión, IA|Hernán aprueba desde los pendientes
      d|d-pla-inicio.html|Ingeniería: lo que me toca hoy|Mismos datos, otro orden
      d|d-pla-inicio.html?estado=vacio|Empresa nueva: primeros pasos|Estado vacío que enseña
    `,
  },
  {
    id: 'pla-asistente', orden: 610, etapa: 'Plataforma', horizonte: 'h1',
    roles: ['ing', 'pres', 'comp'],
    refs: ['Entrevistas · «la IA alucinó»', 'Togal · chat sobre el plano'],
    titulo: 'Asistente IA para revisión, presupuesto y compras', corto: 'Asistente IA',
    descripcion: 'Tres modos sobre los mismos datos del Hospital Cañuelas: qué falta para cotizar, cómo bajar el total sin cambiar de marca y a quién comprarle según la fecha. Contesta con números del estado, cada uno con su fuente clicable, marca lo inferido, muestra el costo de la consulta y propone acciones que se confirman antes de ejecutarse.',
    existe: 'Los datos que usa (BOM, ofertas, planos) y la lectura IA por línea existen en dev. El asistente es nuevo; el control de gasto es del Sprint 5.',
    reglas: [
      'Nunca completa un atributo ni inventa un código: lo que no matchea queda sin match con su motivo.',
      'Confirmar ejecuta y deja rastro (comentario, pedido de aprobación, escenario); cancelar no hace nada y no cobra.',
      'Una pregunta ya respondida no se vuelve a cobrar.',
      'Al llegar al tope o sin servicio queda el resumen calculado sin IA y atajos manuales a cada pantalla.',
      'Bajar un 5 % deja el margen en 17,6 %: por debajo del 18 % pide aprobación de Dirección.',
    ],
    estados: [['Tope de IA alcanzado', 'd-pla-asistente.html?estado=limite'], ['Servicio de IA caído', 'd-pla-asistente.html?estado=sin-ia'], ['Pregunta desde ⌘K', 'd-pla-asistente.html?q=bajá el total un 3 %']],
    marcos: `
      d|d-pla-asistente.html|Revisión: qué falta para cotizar|Fuentes, inferencias y acciones a confirmar
      d|d-pla-asistente.html?modo=compras|Compras: todo antes del 15/10|Por distribuidor, con la lista vencida a la vista
      d|d-pla-asistente.html?modo=presupuesto|Presupuesto: −5 % sin cambiar de marca|Choca con la regla de margen
      d|d-pla-asistente.html?estado=sin-ia|Sin IA: el camino manual|
    `,
  },
  {
    id: 'pla-equipo', orden: 620, etapa: 'Plataforma', horizonte: 'h1',
    roles: ['dir', 'ing', 'pres', 'comp', 'tal'],
    refs: ['Entrevistas · roles del tablerista', 'Código · UserRole ENGINEER/SUPPLIER'],
    titulo: 'Equipo, permisos, aprobaciones y comentarios', corto: 'Colaboración',
    descripcion: 'Quién está en Tableros Delta y con qué perfil (ingeniería, presupuesto, compras, taller, obra, dirección), una matriz de permisos editable, reglas de aprobación (OC de más de $ 10.000.000 o margen menor a 18 % pasan por Dirección) y conversaciones ancladas a una línea del BOM o a un símbolo del plano, con menciones que avisan.',
    existe: 'Hoy hay dos roles: ENGINEER (toda la empresa, todos pueden todo) y SUPPLIER (el distribuidor). Los perfiles se proponen encima de ENGINEER.',
    reglas: [
      'Una mención crea un aviso para la persona; resolver o reabrir deja constancia en el hilo.',
      'Rechazar una aprobación pide motivo; aprobar avisa a quien pidió.',
      'Cambiar un monto aplica a lo nuevo: no frena lo que ya salió.',
    ],
    estados: [['Conversación de una línea (l09)', 'd-pla-equipo.html?linea=l09']],
    marcos: `
      d|d-pla-equipo.html|Equipo y permisos por perfil|Marca lo que existe (ENGINEER) y lo nuevo
      d|d-pla-equipo.html?vista=aprobaciones|Reglas de aprobación|$ 10.000.000 y 18 %
      d|d-pla-equipo.html?linea=l09|Hilo en la línea del seccionador NH00|Mencioná con @
    `,
  },
  {
    id: 'pla-automatizaciones', orden: 630, etapa: 'Plataforma', horizonte: 'h2',
    roles: ['comp', 'pres', 'tal'],
    refs: ['Entrevistas · seguimiento a mano por mail y WhatsApp', 'Roadmap S5 · email'],
    titulo: 'Automatizaciones «cuando… entonces…»', corto: 'Automatizaciones',
    descripcion: 'Avisos y recordatorios que hoy alguien hace a mano: plano Listo → avisar a presupuesto; lista con más de 30 días → pedir actualización; OC sin respuesta en 24 h → recordar al distribuidor; remito parcial → avisar al taller. Plantillas, constructor, prueba con un evento de ejemplo que arma el email o aviso, historial y pausa.',
    existe: 'Los datos que disparan las reglas (estado del plano, fecha de la lista, vencimiento de la OC) existen en dev. El email llega con el Sprint 5; remitos y taller son de Fabricación y obra.',
    reglas: [
      'Probar nunca le escribe a un distribuidor: genera el mensaje y, si querés, te lo manda solo a vos.',
      'Pausar conserva el historial; borrar ofrece pausar antes.',
      'Lo que no corrió por estar resuelto queda como «omitida», no como error.',
    ],
    estados: [['Sin reglas', 'd-pla-automatizaciones.html?estado=vacio'], ['Error de envío', 'd-pla-automatizaciones.html?estado=error'], ['Historial', 'd-pla-automatizaciones.html?vista=historial']],
    marcos: `
      d|d-pla-automatizaciones.html|Reglas activas y plantillas|Probá «OC sin respuesta»
      d|d-pla-automatizaciones.html?estado=error|Un email que rebota|
      d|d-pla-automatizaciones.html?estado=vacio|Primera regla desde una plantilla|
    `,
  },
  {
    id: 'pla-plan', orden: 640, etapa: 'Plataforma', horizonte: 's5',
    roles: ['dir'],
    refs: ['Roadmap S5 · pagos', 'Roadmap S5 · control de gastos de IA'],
    titulo: 'Plan, suscripción y consumo de IA', corto: 'Plan y consumo',
    descripcion: 'Plan actual, personas y facturas de la suscripción (solo la suscripción: los materiales se pagan por fuera). Consumo de IA del mes por área del flujo y por persona, con tope de la empresa y por persona, aviso al 80 % y qué pasa al llegar al tope. Los precios son hipótesis sin validar.',
    existe: 'El costo de la lectura IA ya se mide en el catálogo y la caché por texto de línea (BomLineReading) existe: por eso 281 líneas no se volvieron a pagar. Plan, facturación y topes son del Sprint 5.',
    reglas: [
      'Al tope: no se manda nada nuevo a la IA, lo que estaba en curso termina, nada se corta a la mitad.',
      'Todo lo que no es IA (BOM, matching, cotización, pedidos) sigue igual sin tope.',
      'La lectura de catálogos de los distribuidores no se le cobra a la empresa.',
    ],
    estados: [['Tope alcanzado', 'd-pla-plan.html?estado=limite']],
    marcos: `
      d|d-pla-plan.html|Consumo por área y por persona|Aviso al 80 %
      d|d-pla-plan.html?estado=limite|Tope alcanzado: modo manual|
      d|d-pla-plan.html?vista=plan|Plan y facturas|Hipótesis de precio
    `,
  },
  {
    id: 'pla-estado', orden: 650, etapa: 'Plataforma', horizonte: 's5',
    roles: ['ing', 'dir'],
    refs: ['Roadmap S5 · observabilidad', 'component-detector · 503 sí, 504 no'],
    titulo: 'Estado del servicio', corto: 'Estado del servicio',
    descripcion: 'La vista del usuario de la observabilidad: si funcionan detección, recorte, conversión de PDF, matching, lectura IA y email; la cola de planos (en espera, procesando, p50/p95) y por qué un plano puede tardar, con los límites reales. Una vista interna muestra la configuración del procesamiento.',
    existe: 'La cola en Postgres, los reintentos y los códigos (503 se reintenta, 504 no, 5 minutos de límite) existen en dev. Medirlos y mostrarlos es del Sprint 5.',
    reglas: [
      'Un 504 no se reintenta: es el plano, y cada intento es una detección paga. La salida es recortarlo.',
      'Un 503 se reintenta solo hasta 3 veces.',
      'Cuando algo cae se dice qué sigue funcionando y adónde ir a mano.',
    ],
    estados: [['Lectura IA caída', 'd-pla-estado.html?estado=error'], ['Operación interna', 'd-pla-estado.html?vista=operador']],
    marcos: `
      d|d-pla-estado.html|Servicios, cola y límites|
      d|d-pla-estado.html?estado=error|Incidente en curso|Qué sigue andando
    `,
  },
  {
    id: 'pla-movil', orden: 660, etapa: 'Plataforma', horizonte: 'h1',
    roles: ['dir', 'ing', 'obra', 'prov'],
    refs: ['Entrevistas · el pedido llega por WhatsApp'],
    titulo: 'Avisos y asistente en el teléfono', corto: 'En el teléfono',
    descripcion: 'Lo del día en el teléfono: aprobar sin abrir la computadora, los avisos filtrados según el rol (empresa, obra o distribuidor, cada uno con su barra inferior) y el asistente con dictado simulado.',
    existe: 'La app de dev es responsive pero no tiene vistas de teléfono propias ni avisos.',
    reglas: [
      'Los avisos son los de todas las áreas; cada rol ve los suyos.',
      'El dictado muestra lo que va entendiendo; tocar el cuadrado lo corta y lo envía.',
    ],
    estados: [['Avisos de obra', 'm-pla-avisos.html?rol=obra'], ['Asistente sin IA', 'm-pla-asistente.html?estado=sin-ia']],
    marcos: `
      m|m-pla-inicio.html|Hoy: aprobar desde el teléfono|
      m|m-pla-avisos.html|Avisos de la empresa|
      m|m-pla-avisos.html?rol=prov|Avisos del distribuidor|Otra barra inferior
      m|m-pla-asistente.html|Asistente con dictado|Tocá el micrófono
    `,
  },
);
