# liard · plan de construcción en producción (ordenado por dependencias)

> **Un prototipo que funciona no es un sprint terminado.** Todo lo de esta galería corre con datos ficticios en el navegador:
> no hay backend, ni migraciones, ni permisos reales, ni IA, ni correos, ni pagos. Un ítem queda hecho cuando pasa lo que
> pide `CLAUDE.md` del repo: `lint:check && typecheck && test` (+ `test:int` si toca controller, repositorio, schema o
> cola) en el back, `lint && build && test && verify:crop` (+ `e2e` si la pantalla tiene spec) en el front, el endpoint
> en `api-endpoints.md` y la llamada en `front/src/service/api/` en el mismo cambio, y la validación con un usuario real
> (Liard / Eaton, un distribuidor) cuando el ítem es una hipótesis.

Fuente de lo que existe: rama `dev` (`research/codigo.md`). Fuente de lo planificado: `documentacion/Roadmap.md`. Lo que
dice «propuesta» sale de las entrevistas (`documentacion/Entrevistas de discovery.md`), de la competencia
(`research/mercado.md`) o de esta galería, y está marcado así en cada pantalla.

## 0. Reglas que el plan respeta

- El precio sigue guardándose **sin IVA**. El IVA, el margen y la mano de obra son una capa nueva de presupuesto que lee
  la cotización; no tocan `ProviderCatalogItem.unitPrice` ni el matcher.
- El matching sigue siendo **por igualdad de componente base + atributos esenciales** (`QuoteMatcherService`). Las reglas
  de la empresa (§3) completan atributos **antes** del matcher; no agregan un matching por texto.
- Toda IA nueva pasa por el mismo control de costo (§1.3) y tiene camino manual.
- Cada modelo nuevo de Prisma entra en `cleanDatabase()` (`test/utils/database.ts`) y se `@@map`pea como el resto.
- Un rol nuevo no es un `UserRole` nuevo: `UserRole` son los dos lados del mercado (ver el comentario del enum). Los
  roles internos de una empresa (compras, taller, dirección) son **membresías** de una empresa (§1.2).

## 1. Base (bloquea casi todo lo demás) — Sprint 5

| # | Ítem | Horizonte | Depende de | Qué hay que construir | Pantallas |
| --- | --- | --- | --- | --- | --- |
| 1.1 | **Cerrar BOM → matching → cotización para todos los componentes** | S4 pendiente + S5 | — | Completar los 33 tipos base en el matcher; `NOT_FOUND` siempre con `unmatchedReason` legible; bandeja de «información insuficiente» en el editor (pregunta concreta por esencial faltante); componente base para lo que hoy no lo tiene (gabinetes, riel, canal). Set de prueba de 67 materiales como gate de CI. | `d-bom-editor`, `d-com-cotizacion` |
| 1.2 | **Empresa y membresías** | propuesta (habilita S5) | — | Modelo `Company` + `CompanyMember { role: ENGINEERING | ESTIMATING | PURCHASING | WORKSHOP | SITE | MANAGEMENT }`; proyectos de la empresa y no del usuario (hoy `Project.ownerId`); migración que crea una empresa por usuario existente. Guards por membresía al lado de `RequireRole`. | `d-pla-equipo` |
| 1.3 | **Control de gasto de IA** | S5 | 1.2 | Medir costo por llamada en los cuatro consumidores (`SymbolDetectionService`, `CatalogReadingService`, `BomLineReadingService`, asistente) en una tabla `AiUsage`; tope mensual por empresa con aviso al 80 %; al llegar al tope, la IA se apaga y el flujo sigue manual (nunca corta una detección a la mitad). | `d-pla-plan` |
| 1.4 | **Notificaciones por email** | S5 | 1.2 | `smtp-mailer.service.ts` ya existe (SES al desplegar). Eventos: OC enviada / confirmada / rechazada / vencida, recordatorio de respuesta; hilo por OC (`PurchaseOrderEvent`) que también alimenta la línea de tiempo en la app. Preferencias por usuario. | `d-com-pedidos` (hilo), `d-com-correo` |
| 1.5 | **Observabilidad** | S5 | — | Métricas de la cola (`ProcessingJob`: espera, p50/p95, fallas por tipo 503/504), salud de los dos puertos al detector, errores del front; vista de estado para el usuario. | `d-pla-estado` |
| 1.6 | **Deploy a los dos perfiles** | S5 | 1.1, 1.3 | AWS según `Arquitectura Liard.md`; usuarios reales ENGINEER y SUPPLIER. | — |
| 1.7 | **Plan y comisión por lead** | S5 (hipótesis sin validar) | 1.2, 1.6 | Suscripción por empresa; contador de leads por distribuidor (cada `PurchaseOrder` recibida); facturación por fuera de la compra (los pagos de la compra no pasan por liard). **Validar precio y aceptación con 2 distribuidores antes de cobrar.** | `d-pla-plan`, `d-prov-leads` |

## 2. Compras con ida y vuelta (depende de 1.1 y 1.4)

| # | Ítem | Horizonte | Depende de | Qué hay que construir | Pantallas |
| --- | --- | --- | --- | --- | --- |
| 2.1 | **Respuesta por línea y contraoferta del distribuidor** | propuesta h1 | 1.4 | Estado nuevo de `PurchaseOrder` (`COUNTER_OFFERED`) y `PurchaseOrderLineResponse { kind: CONFIRM | PRICE | LEAD_TIME | EQUIVALENT | PARTIAL | NO_STOCK }`; el comprador acepta o rechaza por línea; un equivalente vuelve a pasar por el matcher (mismo componente base y esenciales) antes de aceptarse. | `d-prov-solicitudes`, `m-prov-responder`, `d-com-pedidos?vista=contraoferta` |
| 2.2 | **BOM alternativo** | S5 | 1.1, 2.1 | Alternativas por línea en el editor; viajan en la solicitud; el distribuidor cotiza una u otra (2.1). Aviso IEC 61439 cuando el cambio puede pasar la responsabilidad del diseño al tablerista. | `d-bom-alternativo` |
| 2.3 | **Escenarios de compra** | propuesta h1 | 1.1 | Generalizar el optimizador MIXED/SINGLE: «más barato», «llega antes», «menos OC», «marcas preferidas», con restricciones (stock > 0, plazo máx.). Puro cálculo sobre `QuoteLineOffer`: no necesita IA. | `d-com-escenarios` |
| 2.4 | **Aprobación por monto** | propuesta h1 | 1.2 | Regla por empresa (monto, margen); OC en `PENDING_APPROVAL` antes de `SENT`; aprobar desde el teléfono. | `m-com-aprobar`, `d-pla-equipo` |
| 2.5 | **Re-cotizar con precios de hoy** | propuesta h1 | 1.1 | Re-ejecutar una `BomQuote` vieja contra catálogos vigentes y mostrar el diff por línea (ya existen `revision`, `bomFingerprint`, `ProviderPriceHistory`). | `d-com-recotizar` |

## 3. Ingeniería más confiable (depende de 1.1)

| # | Ítem | Horizonte | Depende de | Qué hay que construir | Pantallas |
| --- | --- | --- | --- | --- | --- |
| 3.1 | **Validar la tabla de referencia al subirla** | propuesta h1 | — | Mostrar lo que se leyó de la tabla (símbolos, dudosos, ilegibles) antes de procesar los planos. `docs/analisis-mejoras` la llama «la mejora más valiosa». | `d-ing-carga` |
| 3.2 | **Reglas de la empresa y accesorios derivados** | propuesta h1 | 1.1, 1.2 | `CompanyRule` versionada: «si falta atributo X → valor Y» (corre antes del matcher y marca la línea como «por regla») y «por cada A, agregar B» (líneas derivadas, apagables). Nunca un SKU. | `d-bom-reglas` |
| 3.3 | **DWG** | S5 (evaluación) | — | Conversor en el detector, igual que PDF (`pdf_plan/`): proceso hijo, misma cadena de timeouts (§Gotchas de `CLAUDE.md`). | `d-ing-carga` |
| 3.4 | **Revisión guiada / asistida de símbolos** | existe + propuesta h1 | 1.3 | Hoy existe la revisión experta. La guiada es solo front. La asistida reusa el clasificador con costo medido. | `d-ing-plano?vista=…` |
| 3.5 | **Diff entre versiones de plano** | propuesta h1 | 3.4 | Versionar `ElectricalPlan` (hoy se reemplaza); diff de BOM por línea; si ya hay OC, generar un cambio de alcance (5.3). | `d-ing-revisiones` |
| 3.6 | **Aprender de las correcciones** | propuesta h2 | 3.4, 1.2 | Diccionario de símbolos por cliente/empresa a partir de `MANUAL_RESOLUTION`; se aplica como sugerencia, no como verdad. Medir precisión por plano. **No usar el catálogo QElectroTech como entrenamiento** (licencia). | `d-ing-aprendizaje` |

## 4. Presupuesto y margen (depende de 2.3)

| # | Ítem | Horizonte | Depende de | Qué hay que construir | Pantallas |
| --- | --- | --- | --- | --- | --- |
| 4.1 | **Presupuesto al comitente** | propuesta h1 | 2.3 | `Estimate` versionado sobre una cotización: materiales del escenario, mano de obra por tablero, gastos, margen, IVA de presentación, moneda y dólar de referencia con fecha, validez. PDF para el cliente sin distribuidores ni costos. | `d-com-presupuesto` |
| 4.2 | **Inicio por rol y tablero de dirección** | propuesta h1 | 1.2, 4.1 | Agregados de lo que ya existe + margen estimado vs real (necesita 5.1 para el real). | `d-pla-inicio`, `m-pla-inicio` |

## 5. Después de la OC: taller, obra, mantenimiento (depende de 2.1)

| # | Ítem | Horizonte | Depende de | Qué hay que construir | Pantallas |
| --- | --- | --- | --- | --- | --- |
| 5.1 | **Recepción y entregas parciales** | propuesta h1 | 2.1 | `GoodsReceipt` por OC con remito y cantidades por línea; faltantes avisan a compras; desde el teléfono. | `d-tal-entregas`, `m-tal-recibir` |
| 5.2 | **Taller** | propuesta h2 | 5.1 | `Switchboard` físico por plano (× repeticiones): estado, avance, armadores, horas reales; lista de armado y de corte derivadas del BOM; «frenado por» = línea sin OC o sin recepción. | `d-tal-taller`, `m-tal-tablero`, `m-tal-hoy` |
| 5.3 | **Cambios de alcance** | propuesta h2 | 3.5, 4.1 | Un cambio produce: delta de BOM, OC adicional y adicional al comitente. | `d-tal-entregas` |
| 5.4 | **Protocolo de ensayos de rutina** | propuesta h2 | 5.2 | Checklist guiado (IEC 61439 / AEA 90364-7-771 como referencia, la norma manda), valores medidos, firmas, PDF y placa con número de serie. **Validar el checklist con GRAMONT** (IEC 61439, EcoXpert). | `d-tal-protocolo` |
| 5.5 | **As-built, QR y mantenimiento** | propuesta h2/h3 | 5.4 | Página pública por número de serie (sin datos comerciales), historial, pedido de repuesto que re-cotiza (2.5). | `d-tal-mantenimiento`, `m-cli-tablero` |
| 5.6 | **Tablero 3D vinculado al BOM** | propuesta h2 | 5.2 | Necesita la disposición física (filas, módulos), que hoy no existe en ningún modelo: arrancar por el frente 2D generado de las líneas + editor de disposición; el 3D es una vista más de los mismos datos. | `d-bom-3d` |

## 6. Distribuidor y red (depende de 2.1 y 1.7)

| # | Ítem | Horizonte | Depende de | Qué hay que construir | Pantallas |
| --- | --- | --- | --- | --- | --- |
| 6.1 | **Inicio del distribuidor** | propuesta h1 | 2.1 | Solicitudes por vencer, tasas propias, lista vieja. | `d-prov-inicio`, `m-prov-solicitudes` |
| 6.2 | **Scoping de catálogo por dueño** | deuda conocida | — | Hoy las lecturas de catálogo no se filtran por `Provider` (ver `CLAUDE.md` › Quoting and providers). Prerrequisito de 6.3. | — |
| 6.3 | **Listas por cliente e integración ERP** | propuesta h2 | 6.2 | Lista base + bonificación por cliente (nunca pública); adaptadores SAP / Electrobase / Odoo para precio y stock. | `d-prov-integraciones` |
| 6.4 | **Vidriera y demanda perdida** | propuesta h2 | 6.1, 2.1 | Ficha pública con métricas medidas; demanda perdida desde `NOT_FOUND` y `NO_STOCK`. Ojo con mostrar datos de un comprador a otro distribuidor. | `d-prov-vidriera` |

## 7. Asistentes y automatización (depende de 1.3 y de los datos de arriba)

| # | Ítem | Horizonte | Depende de | Qué hay que construir | Pantallas |
| --- | --- | --- | --- | --- | --- |
| 7.1 | **Asistente IA (revisión, presupuesto, compras)** | propuesta h1 | 1.3, 2.3, 4.1 | Herramientas de solo lectura sobre los endpoints existentes + acciones que siempre piden confirmación; cada respuesta cita sus fuentes. Evaluar alucinaciones con el set de 67 materiales antes de abrirlo. | `d-pla-asistente`, `m-pla-asistente`, ⌘K |
| 7.2 | **Comentarios y menciones** | propuesta h1 | 1.2, 1.4 | Hilos sobre una línea del BOM o un símbolo del plano. | `d-pla-equipo` |
| 7.3 | **Automatizaciones** | propuesta h2 | 1.4, 2.4, 5.1 | Disparadores sobre eventos que ya existen (plano listo, lista vieja, OC sin respuesta, remito parcial) → aviso/email. Sin código del usuario. | `d-pla-automatizaciones` |

## 8. Orden sugerido

1. **Sprint 5 tal como está planificado**: 1.1 → 1.3 → 1.4 → 1.5 → 1.6, con 1.2 adelante porque lo piden 1.3, 1.4 y 1.7. 2.2 (BOM alternativo) cuando 2.1 defina la respuesta del distribuidor. 3.3 (DWG) en paralelo, en el detector.
2. **Sprint 6**: 3.1, 2.1, 2.3, 2.4, 3.2, 6.1. Validar 1.7 con distribuidores.
3. **Sprint 7**: 4.1, 2.5, 5.1, 7.1 (solo lectura primero), 7.2.
4. **Después**: 3.5, 5.2–5.6, 6.2–6.4, 3.6, 7.3.

## 9. Lo que la galería no prueba

- Que la detección, el matching o la IA rindan como se muestra: los números (90 %, 96 %, costos en US$) son ilustrativos.
- Que los usuarios quieran estas pantallas: cada propuesta necesita una validación con el segmento que la pidió (ver la
  columna «refs» de cada sección de la galería).
- Precios de la suscripción y de la comisión: hipótesis sin validar (Roadmap S5).
- Cumplimiento normativo del protocolo de ensayos: la pantalla es una guía, no una certificación.
