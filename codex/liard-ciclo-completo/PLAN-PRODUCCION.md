# LIARD · plan de producción por dependencias

30 septiembre 2026 · referencia `dev` en `82300d56`. Esta galería es un instrumento de discusión, no una implementación del sprint. Las estimaciones de esfuerzo y fechas se hacen después de validar alcance y contratos con LIARD y proveedores. No hay asignación confirmada de sprint en los issues examinados; «Backlog» evita inventarla.

La ventaja propuesta es mantener la identidad y la evidencia de cada material desde documentación heterogénea hasta compra, taller y activo instalado. El liderazgo es una aspiración que debe probarse con adopción, confiabilidad y resultados del cliente.

## 0. Fijar el inventario y terminar el cierre real de Sprint 4

**Consumir:** `documentacion/Roadmap.md`, `api-endpoints.md`, matriz de `research/liard-code-research.md` y cuerpos de issues en `research/liard-relevant-issues.md`.

**Entregar:** tickets reconciliados con dev, responsables de los pendientes y evidencia operativa del piloto. Mantener matching canónico, PDF, cuenta, marcas, multiplicadores, matriz, cola y órdenes ya existentes. #987/#832 abiertos no justifican rehacerlos. #824–826 dejan bordes de imagen/referencias; #827 tiene entrega parcial; #835 solo reemplaza catálogo. #1000/#1002/#1007–1010 son backlog sin sprint confirmado.

**Validación:** recorrer dos roles con datos de prueba contra dev; revisar acceso propio; corregir el diálogo #970 si se reproduce en la aplicación. Grabar y editar los videos #787/#788 con el guion `d-demo.html`; la galería no entrega esos videos. El Roadmap reporta demo de cinco usuarios; verificar despliegue, almacenamiento, recuperación y monitoreo antes de describir operación estable.

## 1. Identidad de empresa, permisos y registro de decisiones

**Depende de:** inventario 0. Desbloquea colaboración, nuevos roles, métricas por cuenta e integraciones.

**Entregar:** organización con membresías, proyecto con autoridad técnica/comercial separada y trazabilidad de actor. ENGINEER/SUPPLIER actuales siguen funcionando. Dirección/taller/obra/mantenimiento/operaciones son roles nuevos que requieren contratos; no aparecen mágicamente por tener una pantalla. Revisar ownership de lectura/escritura de catálogo con las matrices existentes antes de ampliar multiusuario. Cada proveedor recibe solo el requerimiento autorizado; contacto según aceptación; margen y planos privados no se filtran.

**Áreas:** `back/prisma/schema.prisma`, módulos `auth`, `users`, `project`, `provider`, guardas y pruebas de acceso; `front` layout/guardas y queries. StorageService centraliza imagen de perfil/logo con MIME/tamaño/ownership. PATCH de referencias conserva IDs y snapshots existentes.

**Puerta:** matriz de accesos por rol/empresa y pruebas de recursos ajenos, edición concurrente y revocación. Migración compatible con usuarios actuales.

## 2. Revisiones inmutables, identidad de línea y procedencia

**Depende de:** 1. Desbloquea alternativas, revisión de cambios, presupuesto, taller y activos.

**Entregar:** versión del BOM referida a la revisión de planos; IDs estables de línea y de instancia física; origen detectado/regla/manual/IA y decisión que lo confirmó. Las cantidades distinguen por tablero, multiplicador y proyecto. Cotización/orden conservan la versión y sus atributos; R04 no reescribe OC de R03. Ante dos editores: conflicto explícito, comparar/reaplicar o recargar, nunca pérdida silenciosa.

**Áreas:** `electrical-bom`, `project`, `quotation`, `purchase-order`; esquema y mappers. Preservar la regla actual por la que la lectura de BOM conserva updatedAt para no generar un 409 ficticio.

**Puerta:** test de cambio R03→R04 con orden emitida; cantidad dibujada/comprada; una línea con alternativa no suma dos veces; historial conserva autor/fecha.

## 3. Cobertura técnica y lectura con evidencia

**Depende de:** 2 para trazabilidad; mejora incremental sobre matching existente.

**Entregar:** casos de prueba y cobertura por todas las familias planificadas, atributos esenciales completos y razones legibles de no coincidencia. Los 33 tipos actuales no demuestran cobertura de todos los casos; #856 menciona 88 sin especificación suficiente, requiere aclaración. Mantener igualdad de tipo y esenciales; marca/gama solo cuando el BOM la pide. No reintroducir parecido de texto como equivalencia técnica.

#1007 lee polos propios de texto/trazos; #1008 hereda solo desde aparato conectado demostrado y conserva origen/confianza; #1009 suma polos y estima módulos con factores documentados. Desconocidos no cuentan como cero. Polos ≠ módulos; fuera de DIN se explicita. «Vías» requiere topología acordada; usar «protecciones» si no se conoce. #1002 valida la marca numerada con la tabla; un número no es especificación.

**Áreas:** `component-detector/classification.py`, contrato/mapper español→inglés, catálogo canónico/seeds, `quotation/matching/quote-matcher.service.ts`, APIs y bandeja de atributos.

**Puerta:** medición antes/después contra anotación humana; herencia errónea y esenciales pendientes separados de éxito HTTP; corrección manual prevalece y cambia resumen/coincidencias.

## 4. Operación confiable: cola, observabilidad y presupuesto IA

**Depende de:** 1; puede avanzar en paralelo con 2–3. Desbloquea expansión del piloto y límites comerciales.

**Entregar:** correlación de trabajo/servicio/modelo/tokens/costo, sin prompts/imágenes de clientes; alertas y procedimiento de recuperación. Libro de uso por usuario/empresa con reserva antes de llamada, conciliación de gasto real y liberación de excedente/cancelación. Límite compartido por detección, lectura BOM y catálogo; no solo barra visual. Reusar caché de lecturas, no hacer llamadas pagas repetidas.

#1000 define latidos, cancelación de ejecución, guardado atómico y puntos de reanudación; el mock no prueba que hoy pueda retomar una caja paga. Mantener 504 de detección sin reintento automático; respetar espera de proveedor y retry de 503. Conservar concurrencia PROCESS_CONCURRENCY ≤ BOM_RENDER_CONCURRENCY, plazos del trabajador menores que los del cliente y lease mayor que detección+guardado. CPU en child process; no hilos con GIL.

**Áreas:** `electrical-plan/service/plan-processing-worker.service.ts`, `processing-job` repository/notifier, lectura BOM/catálogo, `component-detector/common/child_process.py`, telemetría y nuevo módulo de uso/presupuesto.

**Puerta:** pruebas de dos reservas concurrentes contra saldo restante, gasto fraccional, caída antes/después de respuesta, duplicado de evento, cancelar y reiniciar sin doble cobro. Incidente no revela credenciales/archivos. Manual sigue disponible con límite alcanzado.

## 5. Catálogo incremental, BOM alternativo y entrega seleccionada

**Depende de:** 2–3; reserva IA 4 para nueva lectura.

**Entregar:** #835 modo incremental por código externo único, altas/cambios/ausentes/duplicados, confirmación transaccional e idempotente, versión auditable. Modo reemplazo conserva advertencia explícita y despublicación. Solo texto cambiado se relee.

#829 alternativa por línea sin modificar base; #830 conjunto alternativo usa base para el resto; #831 orden captura especificación, marca/SKU y procedencia elegidos. Aprobación técnica es independiente del precio. #827 optimiza con plazo del ítem seleccionado, no solo mínimo del proveedor; captura min/max/estado desconocido por línea y cuello de botella por orden. Stock de catálogo y precio siguen siendo referencias.

**Áreas:** `provider/service/catalog-import-confirm.service.ts`, repositorios, esquema, quotation y purchase-order. Front en `service/api`→queries/mutations→hooks→pantallas. Actualizar `api-endpoints.md` junto a cliente.

**Puerta:** importación repetida no duplica; incremental conserva ausentes; reemplazo los despublica; alternativa con base restante; OC solo variante seleccionada; plazo desconocido no se sustituye por cero; fastest considera stock/plazo de SKU.

## 6. Emails de pedidos y apertura a ambos perfiles

**Depende de:** 1, 4 y contratos de órdenes 5.

**Entregar:** evento transaccional + bandeja de salida idempotente, preferencias por rol, enlace protegido a orden, estado de entrega y reintento separado del estado del pedido. No duplicar aceptación/pedido por repetir email. Email no muestra contacto antes de aceptar, ni adjunta planos privados.

Abrir producción por cohortes: ingeniería completa primera detección/BOM/pedido; proveedor primer catálogo/solicitud/respuesta. Serverless es objetivo de Sprint 5: validar costos de arranque, almacenamiento persistente, tiempos de CPU y cola antes de elegir Lambda/Fargate/VM. No migrar ciegamente detector a una función con tiempos incompatibles. Piloto observado con responsables y reversión.

**Puerta:** integración con transporte falso; eventos aceptado/rechazado en ambos sentidos; rebote/reintento deduplicado. E2E ambos roles y cold-start; restauración de DB/archivos y jobs. No activar emails reales durante E2E.

## 7. Monetización con reglas validadas y DWG/dataset medidos

Tres pistas paralelas tras 4/6:

- **Suscripción y comisión:** validar disposición a pagar por segmento y definir oportunidad elegible, duplicados, rechazo/cancelación, disputa/devolución y tratamiento fiscal con responsables. Los USD 39/89 y USD 15 de la demo no son precios aprobados. Pago alojado, webhooks firmados, intentos/ledger idempotentes, cancelación y renovación transparentes. Pago de materiales y flete siguen entre partes. Puerta: webhook repetido/fuera de orden, pago rechazado, devolución y acceso cancelado correctamente.
- **DWG:** spike con conversor/licencia, archivos confinados y deadline en child process; preservar original y vínculo al DXF, revisar texto SHX/capas/unidades/layout. Puerta: corpus consentido diverso y comparación con anotación; ofrecer DXF manual si no hay fidelidad. No prometer soporte antes de medirlo.
- **Dataset:** consentimiento específico independiente de subir para procesar; segregación, procedencia/licencia, anonimización, anotación doble, conjunto de evaluación reservado y umbrales por familia. QElectroTech nunca se usa como entrenamiento. Versionar pipeline, medir recall/falsos positivos/herencia y revertir una versión sin reescribir BOM previo. Métricas del mock son ficticias.

## 8. Costeo, condiciones confirmadas y colaboración

**Depende de:** 1–2, 5–6. Nuevas propuestas, no entregables actuales de S5.

**Entregar:** EstimateRevision y partidas de compra/mano de obra/servicio/gastos/contingencia, supuestos de moneda/IVA/TC con fecha. Precio = costo/(1−margen), separar recargo sobre costo. Aprobación de dirección se invalida al cambiar costo o alcance. Proveedor declara precio/stock/plazo/vigencia por línea; contrapropuesta requiere aprobación técnica; datos de catálogo no pasan a «confirmado» sin respuesta.

Comentarios/tareas/aprobaciones referidos a revisión/línea; permisos técnicos y comerciales; registro de conflictos. Oportunidad/propuesta se integra con CRM primero, no duplica todo CRM. Ganado traspasa alcance congelado a ejecución; perdido guarda motivo.

**Puerta:** margen 25% equivale a recargo 33,33%; mezcla de monedas requiere TC explícito; proveedor no accede a margen; revisión concurrente no pisa; presupuesto sin aprobar no puede traspasar.

## 9. Reglas derivadas y datos físicos → 2D/3D

**Depende de:** 2–3 y aprobación técnica 8.

**Entregar:** reglas de accesorios validadas por LIARD con fuente/versiones y simulación de cantidades/costo. No inventar SKU crítico ni convertir #1009 en recomendador de gabinete. Fabricante aporta dimensiones/huellas/montaje/compatibilidad; layout aprobado persiste coordenadas reales. Visor 3D selecciona la misma identidad que tabla/2D; agrupaciones del mock no son instancias CAD reales.

**Puerta:** navegar por teclado y selección sincronizada; faltar medida bloquea liberación física; multiplicador no multiplica ancho del tablero; cambios de SKU invalidan layout cuando cambian dimensiones. Cajas normalizadas de detección incluyen texto y solo sirven para revisión humana, nunca geometría física.

## 10. Recepción, stock, kits y fabricación

**Depende de:** 5 para OC, 2 para versión, 9 para disposición. Integración ERP requiere permisos 1.

**Entregar:** recepción parcial por línea/lote/estado/remito, daño/faltante/reclamo, ubicación de stock, reserva y kit por tablero. Transacciones y locks de cantidad evitan reservas dobles. Orden de fabricación referencia revisión, kit, instancia y responsables; móvil registra avance/consulta/evidencia; FAT registra resultados/no conformidad/firma competente. Cambio R04 afecta tareas correspondientes sin borrar R03.

**Puerta:** 36 esperados = 34 aceptados + 1 dañado + 1 faltante; reemplazo resuelve pendientes, reservar una vez; misma identidad BOM→comprado→recibido→instalado. No se libera con kit/dimensiones/revisión incompletos. Checklist no certifica IEC ni sustituye ensayo real.

## 11. Obra, documentación conforme a obra y mantenimiento

**Depende de:** 10, roles 1 y revisión 2.

**Entregar:** móvil de instalación/recepción/incidencias/evidencia/SAT/entrega con paquete aprobado; guardado local diferente de sincronizado, cola y conflicto R03/R04. Evidencia conforme a obra, serial/garantía/documentación, QR con permisos; plan de mantenimiento→visita→hallazgo→borrador de repuesto→revisión→cierre firmado. Repuestos vuelven a compra/alternativas existentes.

**Puerta:** corte de conexión no pierde tarea; duplicado de sincronización no duplica evidencia; versión antigua requiere reconciliar; QR sin sesión no revela privado; reparación/ensayo nunca se decide autónomamente con IA.

## 12. Integraciones y automatización sobre eventos reales

**Depende de:** permisos 1, versiones 2, bandeja de eventos 6 y acción destino implementada en 5/8/10/11.

**Entregar:** adapter ERP/catálogo/CRM con mapeo de SKU/unidad/moneda, ejecución seca, errores por fila, claves únicas, confirmación y reconciliación. Automatización configura alcance/excepciones, simula costo/destinatario/eventos y crea borradores revisables antes de actuar; pausa/reintento/auditoría e idempotencia. Asistentes técnicos/comerciales usan fuentes de la revisión, límites IA 4 e identidad de acción; aprobar subconjunto, alternativa manual.

**Puerta:** eventos repetidos/fuera de orden; proveedor ajeno bloqueado; regla pausada no ejecuta; presupuesto insuficiente conserva trabajo; importación inválida no borra catálogo; borrador no envía orden/email ni cambia SKU sin autoridad.

## Gates comunes

Backend conserva controller/service/repository/mapper/dto/input/types, repositorios por DI y StorageService como única entrada a archivos. Un cambio de esquema necesita migración + Prisma generado y ampliar cleanDatabase. Nueva API requiere documentación y cliente en el mismo cambio. Strings españolas y tipos en types/; nada de estado mutable global.

Backend: lint:check, typecheck, unitarios; integración para controller/repo/schema/cola. Front: lint, build, Vitest, verify:crop; Cypress para recorridos de pantalla. Detector: requirements-dev + pytest y medición de corpus pertinente. Integraciones/AI/mail/pagos falsos en tests para no gastar ni enviar. UX: teclado, foco, estados vacíos/cargando/error/límite, 390 px, movimiento reducido y alternativa tabular al 3D.

## Métricas para decidir si expandir

Tiempo de revisión por BOM aprobado; correcciones posteriores y esenciales pendientes; cobertura comprable en fecha con precio confirmado; tiempo de respuesta del proveedor; costo IA por BOM útil; margen previsto vs real; errores de kit/montaje y tiempo para resolver incidencia; calidad de documentación de entrega. Medir con pilotos de empresas que cuentan, empresas que costean y proveedores. Éxito HTTP y visitas al visor 3D no miden confiabilidad eléctrica ni valor comercial.
