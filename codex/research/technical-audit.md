# Auditoría técnica de LIARD — fuente para el collage

**Corte:** rama `dev`, HEAD `04fc813941ec3ae3b0121f12c173ea4a64cd7219`, 30/09/2026. Repositorio inspeccionado en modo lectura; árbol limpio al iniciar y al finalizar. No se leyó `main`, no se levantaron servicios, no se invocó IA, no se ejecutaron pruebas ni se modificó el producto. Este informe distingue implementación observada, intención documentada e inferencia de diseño.

## Resultado principal

El flujo de Sprint 4 existe en el código: autenticación real y onboarding de dos roles, proyectos propios, DXF/PDF vectorial, recorte manual, detección en cola, BOM editable y revisión de símbolos, catálogo propio del proveedor, lectura IA a componentes canónicos, matching exacto, cotización y pedidos con respuesta del proveedor. Sprint 5 debe extender cobertura, operación y negocio: serverless, monetización, presupuestos de IA por usuario, email de pedidos, observabilidad y DWG todavía no son capacidades comprobadas del producto.

La documentación tiene capas históricas contradictorias. Para los mocks, el orden de autoridad es **código `dev` actual → contratos y tests actuales → documentación actualizada → investigación histórica**. Que una pantalla o endpoint esté implementado no demuestra que esté desplegado, que sus pruebas hayan pasado recientemente ni que la IA resuelva todos los casos.

## Cobertura y método

Se leyó `api-endpoints.md` **completo**, 3184 líneas, en ocho bloques de hasta 400 líneas. Se extrajeron estáticamente los decoradores de todos los controladores Nest: **86 pares método/ruta**, exactamente los mismos **86 encabezados** de la referencia API, sin rutas exclusivas de un lado. [Inventario JSON](/Users/pedrodelaguila/.codex/visualizations/2026/09/30/01a0f089-d410-7c61-a96a-c8afb607d641/liard-mocks/research/route-inventory.json) conserva archivo y línea por ruta. Esta igualdad verifica presencia, no semántica.

Se hizo comparación dirigida de permisos, parámetros y formas de respuesta con controladores, DTO/input, Prisma, servicios frontend y guards; se profundizó en los flujos que cambian la viabilidad de Sprint 5. **No es una validación exhaustiva campo por campo de los 86 endpoints** ni una auditoría de seguridad completa. Se inspeccionaron matrices de acceso y suites relacionadas, sin ejecutarlas.

Fuentes leídas:

- `AGENTS.md`; `README.md`; `back/README.md`; `front/README.md`; `front/src/README.md`; `front/cypress/README.md`.
- `component-detector/README.md` completo, `component-detector/detector_yolo/README.md` y `evaluation/matching/README.md` completo.
- Los seis archivos de `docs/aws-deployment/`: `arquitectura-aws.md`, `arquitectura-gcp.md`, `arquitectura-azure.md`, `comparacion-nubes.md`, `cola-y-concurrencia.md`, `deploy-vm-prueba.md`.
- `docs/arquitectura-claude-yolo/{baseline,arch-d}.md`, `docs/multiple_panel_per_dxf/dxf-multiple-panels-analysis.md` y ambos documentos de `docs/mvp-symbols/`.
- Roadmap, configuración CI, scripts de paquetes, router y guards frontend, API frontend, configuración/guards backend, controladores y servicios de catálogo/órdenes/matching, cola/reintentos, lectura BOM y esquema Prisma.

## Contratos y permisos efectivos

| Área | Contrato observado | Implicación para el collage |
|---|---|---|
| Sesión | Guard JWT global; cookie de sesión; onboarding antes de rutas del dominio; guard de roles. Excepciones explícitas para auth y onboarding. | Login, recuperación, email y onboarding son flujos reales. No presentar sesión simulada. |
| Ingeniero | Proyectos, planos, BOM, preferencias, cotizaciones y órdenes del comprador pertenecen al usuario. Recurso ajeno responde 404. | Mantener contexto proyecto → plano → BOM → cotización → pedido. |
| Proveedor | Catálogo `/providers/catalog/*` filtrado por Provider del usuario; solicitudes filtradas por ese Provider. | No permitir administrar el catálogo de otro proveedor. |
| Directorio | `/providers` lista cuentas proveedor activas/onboarded y devuelve User.id; no garantiza que tengan catálogo o ítems cotizables. | Distinguir contacto/directorio de oferta disponible. |
| Canónico | CRUD compartido de catálogo canónico, disponible a ambos roles después del onboarding; controller sin restricción específica de rol. | Corrección de atributos es posible; no inventar propiedad privada de un componente canónico. |
| BOM | Diff por fila, CAS con `expectedUpdatedAt`, conflicto 409, operaciones atómicas. Cambios omitidos no equivalen a borrar. | Mostrar conflicto de guardado y corrección manual sin insinuar autosave garantizado. |
| Procesamiento | POST individual y lote responden 202; Postgres ProcessingJob; polling de estado; cancelación solamente de trabajos QUEUED. | Separar En cola / Procesando / Completado / Error. Cancelar no detiene el análisis RUNNING. |
| PDF | PDF vectorial de una hoja se convierte a DXF durante upload; se conserva original. Escaneados/multipágina no soportados. | Restricción visible antes de subir; error por archivo y descarga de original. |
| Recortes | 1–15 rectángulos manuales sin solapamiento; crea un plano nuevo por zona. | Flujo existente de separación manual; detección automática de tableros es propuesta. |
| Matching | Igualdad por tipo canónico y todos los atributos esenciales; marca/gama solo si la línea los pide. Todos los candidatos CANONICAL puntúan 100. | Explicar atributos faltantes/sin oferta; no representar un porcentaje de similitud ni un motor de búsqueda textual. |
| Pedidos | Confirmación genera snapshot por proveedor; proveedor acepta/rechaza SENT con actualización condicional; contacto del comprador solo después de CONFIRMED. | Precio/selección antes de enviar; respuesta posterior; emails no son comportamiento actual. |

Evidencia de sesión y rutas: [guards globales](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/app.module.ts:45), [validación y CORS](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/app.setup.ts:14), [router](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/front/src/router/index.tsx:55), [API cliente](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/front/src/lib/api.ts:7). Evidencia de aislamiento: [catálogo controller](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/modules/provider/controller/provider.controller.ts:73), [resolución por owner](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/modules/provider/service/provider.service.ts:358), [matriz pedidos](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/test/modules/purchase-order/unit/purchase-order-access.spec.ts:88). El comentario histórico de `own-catalog-access.spec.ts:8` habla de un catálogo abierto anterior; las llamadas actuales del servicio y repositorio son la referencia.

Evidencia de contratos: [BOM diff](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:808), [CAS en repositorio](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/modules/project/repository/project.repository.ts:740), [upload PDF](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:1006), [recortes](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:1040), [lote 202](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:1160), [individual 202](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:1223), [matching](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/modules/quotation/matching/quote-matcher.service.ts:46), [pedidos y contacto](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:3038).

### Detalles que afectan la UX

- **Multiplicador por plano:** el proyecto aplica cantidad × multiplicador; la detección y el BOM propio del plano conservan cantidades originales. Símbolos ubicados y pendientes no se multiplican. El usuario debe poder ver origen y cantidad efectiva. [Prisma](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/prisma/schema.prisma:358), [API](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:777).
- **No identificado y revisión son distintos:** la IA produce familias, “no identificado” y “no es componente”; símbolos de confianza no alta requieren revisión. Revisión y reclasificación de símbolo/fila existen. Un símbolo ya ubicado no convierte toda la fila en verificada. [Detector](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/component-detector/README.md:340), [API revisión](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:1630).
- **Catálogo leído ≠ catálogo completo:** PENDING/READ/FAILED de lectura y COMPLETE/INCOMPLETE/UNLINKED de estandarización son dimensiones distintas. COMPLETE requiere todos los atributos del tipo; matching utiliza esenciales. Un componente incompleto puede tener atributos suficientes para match, o faltarle justamente uno esencial. [API catálogo](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:2010), [matcher](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/modules/quotation/matching/quote-matcher.service.ts:51).
- **Precio y moneda:** snapshot de cotización; falta de precio/moneda convertible o antigüedad puede generar STALE_PRICE. La cotización guarda sus alternativas y ofertas, no es una vista en vivo del catálogo. [API cotización](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:2837).
- **Pedido parcial:** puede haber líneas no asignadas. El estado agregado depende de órdenes por proveedor; `responseDeadlineAt` existe nullable pero se crea null, sin setter observado. No inventar cuenta regresiva o SLA contratado. [API confirmación](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:2866), [Prisma](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/prisma/schema.prisma:1209).
- **Importación:** Excel XLSX con preview y confirmación, revalidación atómica y serialización por proveedor. Importar puede desactivar ítems omitidos; lecturas posteriores son background. Confirmar no significa que todos los ítems ya están listos para cotizar. [API](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:2470).

## Sprint 4: implementación y alcance real

| Capacidad | Estado en dev | Límite demostrado |
|---|---|---|
| Auth, roles, onboarding, cuenta | Implementado en front y back | No se comprobó entrega SMTP ni sesiones de producción. |
| Lectura proveedor y BOM a canónico | Implementado, background y corrección manual | No cubre automáticamente todos los componentes; fallos IA permanecen FAILED. |
| Matching estructurado | Implementado exacto por atributos esenciales | No fuzzy matching; falta canónico/tipo/esencial produce NOT_FOUND. |
| Marcas/gamas preferidas | Implementado | Se aplican según solicitudes de cada línea; no reemplazan atributos. |
| YOLO + clasificación | Implementado | Métricas históricas acotadas no garantizan recall universal. |
| Tabla de referencias | Upload/recorte existe; opcional al procesar | Pipeline actual no la lee: 43 familias fijas. |
| PDF vectorial | Implementado | Una hoja, no raster; no procesamiento DWG. |
| Revisión y símbolos en plano | Implementado | Ubicación geométrica cuando existe; PDF convertido pierde estructura INSERT y utiliza camino alternativo. |
| Multiplicador / consolidación | Implementado | Diferenciar contribución efectiva y plano original. |
| Catálogo privado / órdenes proveedor | Implementado | No email de pedido; no cobro de lead/suscripción. |
| Despliegue demo | Roadmap declara producción y cinco usuarios | No se verificó URL, host, runtime, logs, secretos, DNS, TLS ni disponibilidad. |

El Roadmap mezcla declaración “Se desplegó…” con objetivo todavía inmediato de completar/demo/deploy; no resuelve por sí solo qué SHA está operativo. [Declaración demo](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/documentacion/Roadmap.md:168), [resultado/objetivo](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/documentacion/Roadmap.md:180).

### Detección: qué está activo y qué es historia

El README actual describe ubicación YOLO seguida de clasificación en **43 familias**, la tabla del cliente no se lee y el modelo/clasificación actual es distinto del estudio de junio. [Familias y referencia](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/component-detector/README.md:303), [Opus](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/component-detector/README.md:444). `docs/arquitectura-claude-yolo/` compara arquitecturas antiguas con cinco planos y Sonnet; esos resultados no certifican la versión presente.

`detector_yolo/README.md` anuncia “100% recall” para su pipeline empaquetado. La integración actual usa los pesos y el procesamiento de `detection.py`; no es una garantía del flujo LIARD completo. La evaluación actual reporta 816/839 bloques (97,3%) en 15 planos, no 100%. [Evaluación](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/component-detector/README.md:726). En PDF, ausencia de INSERT y diferente estructura geométrica afecta ubicación/refinamiento; una comparación de conteos no demuestra igualdad semántica del BOM.

La mejora de concurrencia reportada —TSSS de 124 a 66 segundos— es un benchmark puntual. Hay presupuesto global de visión por **proceso**, configurado por `BOM_VISION_CONCURRENCY`, y limitador común para análisis/recorte/PDF. No equivale a presupuesto monetario por usuario ni a un limitador distribuido entre instancias. [Medición](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/component-detector/README.md:421), [implementación presupuesto visión](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/component-detector/vision_concurrency.py:42), [limitador](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/component-detector/common/concurrency.py:40).

## Sprint 5: dependencias y preparación

| Objetivo del roadmap | Base existente | Trabajo/dependencia pendiente | Cómo representarlo |
|---|---|---|---|
| Más usuarios y serverless | Dos roles, ownership, cola durable, cookies | Infra producción, storage remoto/presigned, workers/scaler, límites distribuidos, estado multiinstancia; validar tiempos y archivos contra límites Lambda | Flujo producto existente; operación futura explícita. |
| Matching para todos los componentes | 33 tipos en seed; lectura/corrección y matcher canónico | Expandir tipos/atributos, dataset externo representativo, evaluación independiente, errores/familias sin tipo y equivalencias | “Cobertura ampliada” propuesta; evitar “todos compatibles”. |
| Alternativas BOM/proveedor | Múltiples candidatos, comparación, elección por línea | Definir qué equivalencias o sustituciones se aceptan; actuales opciones son matches canónicos compatibles | Variante de selección respaldada; sustitución técnica no autorizada por motor. |
| Suscripción y comisión por lead | User/Provider/Orders | Modelo precios, entitlements, facturación/pagos, eventos idempotentes, reglas de cobro/reembolso | Propuesta nueva con supuestos de pricing visibles. |
| Costo IA por usuario | `costUsd` de lectura BOM cacheada, costos/progreso catálogo, detección | Ledger atribuible a usuario/proyecto/operación, reservas antes de ejecutar, reintentos/cancelación, fallos cobrados, límite atómico por usuario y periodo | Panel/control propuesto; cifras de demo simuladas y separadas. |
| Email pedidos ambos roles | SMTP/log mailer para recuperación y cambio de correo | Eventos de pedido/respuesta, plantillas, outbox/reintento, preferencias/consentimiento y observación de entrega | Bandeja/estado existente; emails se anuncian como Sprint 5. |
| Observabilidad | Logs, estados de cola, lastError, health detector | Backend health/readiness, telemetría centralizada, dashboards/alertas y producción real | Vista operativa propuesta; no señal “sistema saludable” sin evidencia. |
| DWG | DXF y PDF vectorial | Evaluar conversor/licencias/aislamiento/compatibilidad, fixtures y pipeline | DWG como exploración futura, no extensión aceptada. |
| Dataset diverso | Investigación y ejemplos existentes | Holdout nuevo por origen/cliente, ground truth fiable, no entrenamiento con QElectroTech CC-BY restringido por proyecto | Calidad y cobertura como trabajo; no claim universal. |

Fuente de objetivos: [Sprint 5](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/documentacion/Roadmap.md:192). El cache `BomLineReading` es compartido por texto normalizado y guarda costo por lectura, **sin owner ni ledger de consumo**. No permite atribuir sin diseño adicional el costo de un cache hit o controlar presupuestos por usuario. [Esquema](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/prisma/schema.prisma:716). Las lecturas fallidas se aplican FAILED antes de persistir el cache exitoso; el ledger futuro debe contabilizar también intentos que incurrieron gasto. [Servicio](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/modules/electrical-bom/service/bom-line-reading.service.ts:149).

El contrato `IMailer` solo tiene recuperación y cambio de correo; no se observó envío desde purchase-order. Si no hay SMTP, el mailer loguea enlaces y no entrega correo. [Contrato](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/common/mail/mailer.interface.ts:17), [configuración](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/common/mail/mail.module.ts:19). No hay modelos/rutas de billing, suscripción o presupuesto en el esquema/controladores inspeccionados.

### Producción y serverless: planes no certificados

`arquitectura-aws.md` es una propuesta/estimación de arquitectura Lambda + S3 + RDS + Fargate. `deploy-vm-prueba.md`, posterior, propone una VM con Caddy, frontend compilado, Nest, detector y Postgres, apagado por inactividad, New Relic y sin Terraform/backups por decisión documentada. No son la misma etapa de despliegue. [Prueba VM](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/docs/aws-deployment/deploy-vm-prueba.md:19), [archivos por crear](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/docs/aws-deployment/deploy-vm-prueba.md:339).

No se encontraron `docker-compose.prod.yml`, Caddyfile operativo, scripts deploy, Terraform o integración New Relic versionados al buscar archivos de producción/deploy. El runbook depende de **`GET /api/health`**, pero no aparece tal ruta en el inventario de controladores, y AppModule no tiene controller propio. [Dependencia](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/docs/aws-deployment/deploy-vm-prueba.md:329), [AppModule](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/app.module.ts:42). El health del detector no prueba salud de back/front/Postgres.

La cola actual es durable pero **at least once**. Pérdida de lease/reinicio puede repetir una llamada pagada. La recuperación single-instance debe configurarse distinto con varios backends. 504 no se reintenta automáticamente porque representa un plano demasiado lento. [Retry](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/modules/electrical-plan/service/plan-processing-retry.ts:5), [worker](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/src/modules/electrical-plan/service/plan-processing-worker.service.ts:336). `cola-y-concurrencia.md` propone API de análisis asíncrona, checkpoints, cancelación RUNNING, RPM global, liberación al apagar, retención y scaler; no existe ese protocolo completo en `component-detector/api.py`. No prometer ETA fiable, progreso porcentual exhaustivo ni cancelación en curso.

Los precios/costos nube de los documentos son estimaciones fechadas; no se verificaron precios vigentes, regiones, impuestos, cuotas, SLA o configuración cloud. Tampoco se accedió a proveedores externos de observabilidad o facturación.

## Desajustes documentales concretos

| Referencia | Desajuste | Fuente que prevalece |
|---|---|---|
| Root README líneas 71–116 | 52 rutas y frontend login/session todavía simulados | 86 rutas actuales y RequireAuth/RequireRole activos. |
| `front/src/README.md` | Arquitectura app/features/shared descrita como destino | Carpetas reales components/hooks/pages/service/types; aliases no prueban carpetas. |
| AGENTS provider catalog | Dice lecturas no filtradas por owner | ProviderService actual filtra propio Provider, además del rol. |
| API líneas 789–790 | Describe bloqueo global por plano | PUT y repositorio actuales usan CAS por fila; API líneas 831–837 ya lo explica. |
| API línea 1391 | Enumera 504 entre errores transitorios reintentados | plan-processing-retry excluye 504 explícitamente. |
| API líneas 3115 / 3160 | Export todo COMPLETED; “processing 200” | STALE puede exportarse según contrato detallado; POST process 202. |
| AWS documentos anteriores | Sin limitador/global visión; catálogo sin ownership; modelos viejos | Limiter/global visión, catálogo privado, 33 modelos/14 enums actuales. |
| VM prueba línea 31 | Haiku todavía no entró a dev local a4333 | Lectura catálogo/BOM actual sí está en HEAD auditado. |
| Multi-panel | No implementación; propone parentPlanId/region y detectPanels | Recorte manual actual crea documentos independientes, sin esos campos de linaje. |
| MVP symbols | Directorios /standard, /complete, test-drawings y DWG creados | No están en checkout; no constituyen aceptación DWG de la app. |
| detector_yolo package | Claim 100% recall | Integración y evaluación actual reportan métricas acotadas distintas. |

[API lock histórico](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:789), [API lock actual](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:831), [retry inconsistente](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:1391), [resumen inconsistente](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/api-endpoints.md:3160), [multi-panel explícitamente propuesta](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/docs/multiple_panel_per_dxf/dxf-multiple-panels-analysis.md:3), [campos multi-panel propuestos](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/docs/multiple_panel_per_dxf/dxf-multiple-panels-analysis.md:257), [plan real sin linaje/region](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/back/prisma/schema.prisma:345), [referencias MVP](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/docs/mvp-symbols/mvp-standards-definition.md:101).

## Verificación disponible y límites de la investigación

Inventario estático del checkout: **134 archivos unitarios backend**, **53 de integración backend**, **25 Vitest frontend**, **28 specs Cypress**. Esto no es conteo de casos individuales ni porcentaje de cobertura. CI usa filtros de cambios y gates por área: lint/build/Vitest/crop frontend, lint/types/unit/integration backend, pytest detector y Cypress con backend real. [Workflow](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/.github/workflows/ci.yml:71), [integración](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/.github/workflows/ci.yml:150), [Cypress](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/.github/workflows/ci.yml:197).

Los E2E deshabilitan la API key del backend y explícitamente prohíben procesar planos. Por diseño, verifican flujo, contratos y presentación, **no precisión IA ni gasto real**. [Reglas](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/front/cypress/README.md:28), [CI key vacía](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/.github/workflows/ci.yml:247). El pytest de CI instala requisitos dev sin ultralytics/torch; `detectBom` completo requiere verificación separada con stack y datos/modelos. [CI detector](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/.github/workflows/ci.yml:188).

La gate crop de CI tiene checks estructurales en fixture y deja comparación real contra `/dxf/crop` manual porque planos reales no están en repo. [Limitación declarada](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/.github/workflows/ci.yml:101). Las matrices de acceso con Reflector comprueban metadata, no sustituyen tests integrales de query de ownership; el catálogo tiene suites de cuenta, escritura, importación, canon e items y los pedidos suites de confirmación/solicitudes.

**No se ejecutó ningún gate en esta investigación**; no afirmar tests pasando o producción lista. Ejecutarlos implicaría instalación/configuración/servicios fuera de alcance de la fase lectura. No hay verificación reciente de precisión/latencia, estabilidad multiusuario, disponibilidad ni envío SMTP.

## Referencias ausentes / externas no verificadas

- `docs/refactor/01-refactor-changes.md` referenciado en AGENTS: `docs/refactor/` no existe en HEAD.
- `symbol-detection-service/` nombrado por investigaciones históricas: ausente; implementación actual en `component-detector/`.
- `/standard`, `/complete`, `test-drawings/`, `reference-table.dwg` de MVP: no presentes como esos paths en checkout.
- Links de proveedores/modelos/cloud, branches históricas, dashboards y demo externa presentes en documentación: **no abiertos ni verificados durante esta auditoría**. No se infiere su disponibilidad o configuración a partir de una mención.
- No se inspeccionaron datos privados de runtime, `.env` con secretos, archivos uploads ni cuentas cloud; no se necesitaban para la fase de evidencia local.

Los archivos de `evaluation/matching/` sí están: JSON/CSV/XLSX de variantes, patrones por marca y README. Son **material sintético para seed/ajuste**, no holdout de calidad; reutilizarlos como test/few-shot contamina una medida independiente. [Uso permitido](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/evaluation/matching/README.md:28), [validador](/Users/pedrodelaguila/faculty/lab3/liard/lab3-liard/evaluation/matching/README.md:20).

## Instrucciones de evidencia para la fase de diseño

1. Etiquetar pantallas actuales, variantes y funciones nuevas por separado; conservar contrato y límites en cualquier variante.
2. Los nuevos módulos Sprint 5 necesitan estados vacíos, lectura/error, permiso y bloqueo por presupuesto/modelo, pero esas transiciones son **propuestas** hasta implementarse.
3. Usar datos de demo claramente simulados para costos, límites, pagos, observabilidad y emails; no presentar señales de servicios reales conectados.
4. Priorizar tareas: detectar → revisar → estructurar → cotizar → decidir proveedor → pedido/respuesta. Mantener atributos faltantes y resolución manual como caminos centrales.
5. No usar los históricos 100%/95%/97% como promesa comercial universal. Distinguir medición del detector, clasificación, exactitud BOM y cobertura del matching.
6. Presentar recorte manual como actual; segmentación automática, DWG, facturación, cuotas y notificaciones de pedidos como futuro.
