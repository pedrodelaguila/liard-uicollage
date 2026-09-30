# 04 — Estado real de entrega de LIARD (Sprint 4, Sprint 5, issues abiertos, números medidos)

Fuente: repo `lab3-liard`, rama `dev`, commit `04fc8139` (30/09/2026), más GitHub (`gh issue list/view`, `gh pr list/view`) leído el 30/09/2026. Solo lectura: no se corrió ningún test, ni docker, ni el detector. "Verificado en código" = grep/lectura de archivos en `dev`, no ejecución.

**Ojo con el estado de los issues.** El repo por defecto de GitHub es `main`, y los PRs van a `dev`, así que `Closes #N` **no cierra el issue al mergear**. Hay issues abiertos cuyo código ya está en `dev` (#832, #930, #931, #970, #987, y la épica #988). Por eso el estado se decidió mirando el código, no el issue.

No hay milestones en el repo (`gh api .../milestones?state=all` devuelve una lista vacía). 300 issues (273 cerrados, 27 abiertos), 150 PRs mergeados a `dev` en la ventana consultada, 0 PRs abiertos.

---

## 1. Sprint 4: ítem por ítem (roadmap `documentacion/Roadmap.md` §Sprint 4)

El roadmap redacta el Sprint 4 como **"Desarrollo realizado"**, pero hay dos ítems que no están hechos (11 y 12), aunque el texto del 11 dice lo contrario.

| # | Ítem del roadmap | Estado | Evidencia |
| --- | --- | --- | --- |
| 1 | Catálogo base de componentes | **Hecho** | Módulo `back/src/modules/canonical-catalog/`; 33 tipos base con una clase por archivo en `seed/components/` (33 archivos). Épicas #850 (cerrada 21/9) y #936/#934/#960 (cerradas 26–27/9); PRs #852, #854, #858, #862, #935, #944, #964. |
| 2 | Clasificación de productos del proveedor con IA | **Hecho** | `back/src/modules/provider/service/catalog-reading.service.ts`; modelo `CatalogReadingRun` con `costUsd` (`schema.prisma:977`). Issues #961–#963, #968, #975–#979 y #984 (costo y tiempo restante en vivo), todos cerrados; PRs #865, #876, #893, #969, #978. |
| 3 | Lectura del BOM con IA | **Hecho** | `back/src/modules/electrical-bom/service/bom-line-reading.service.ts`, caché `BomLineReading` (`schema.prisma:~717`, con `costUsd`). #938 y #986 cerrados; PRs #991 (lectura con Haiku) y #992 (completar el componente base y los atributos en Editar BOM), mergeados el 29/9. |
| 4 | Matching por componente base y atributos | **Hecho en el backend; el front no muestra el motivo del no-match; issue todavía abierto** | PR #995 ("matchear cada línea del BOM por componente base y atributos esenciales iguales", `Refs #987`), mergeado a `dev` el 29/9. `quotation/matching/` tiene solo `quote-matcher.service.ts` y `component-type-essentials.reader.ts`; `ProviderCandidateFinder` y la similitud de Dice ya no existen (grep vacío). `BomQuoteLine.unmatchedReason` existe (`schema.prisma:1052`), pero en el front solo aparece en `front/src/types/quotation.types.ts`: **ningún componente lo muestra**. #987 y la épica #988 siguen abiertas aunque sus dos tickets (#986 y #987) están en código. El set de prueba (67 materiales, series de Schneider, ABB y Siemens) está en `evaluation/matching/` (PRs #929, #947). |
| 5 | Marcas y preferencias | **Hecho** | Módulo `back/src/modules/brand-preference/` (PUT `brand-preferences` de cuenta y de proyecto), `model BrandPreference` (`schema.prisma:253`). Issues #764, #394, #807, y la épica de submarca #837 con #838–#845, todos cerrados; PRs #767, #769, #796, #804, #815, #866, #897. |
| 6 | Mejoras en la detección (YOLO+Claude en 2 etapas, tabla opcional, filtrado rápido, PDF) | **Hecho** | PR #733 (pipeline YOLO+Claude), #898 (unificar servicios), #900 (tabla opcional), #994 (filtrado: lu_un_01 **622 s → 26 s**, nyw_un_01 755 s → 24 s), #795 (recorte más rápido), #996 (rondas de filtros 1–3). PDF: `component-detector/pdf_plan/`, PRs #955/#956/#957, mergeados el 29/9 (**el issue #832 sigue abierto**). YOLO26 (#849) y Gemini (#811), cerrados. |
| 7 | Ver y corregir componentes sobre el plano | **Hecho** | #797, #888 cerrados; PRs #801, #808, #959. |
| 8 | Multiplicador de planos | **Hecho** | `multiplier Int @default(1)` (`schema.prisma:365`), con un CHECK ≥ 1; PRs #869 y #871; #833 cerrado. |
| 9 | Rediseño y cuenta de usuario | **Mayormente hecho** | `front/src/pages/account/AccountPage.tsx`, con secciones por rol (el SUPPLIER tiene perfil, empresa, preferencias y seguridad), PATCH `users/me`, `auth/password` y `auth/email`; toasts #791; landing #875/#885. Exportación: redondeo a 2 decimales (PR #989) y encabezados `Cantidad a comprar` / `Cantidad en el plano` / `Cantidad_en_planos` (PR #990); **#930 y #931 siguen abiertos aunque están resueltos**. Lo que falta, de los tickets #824–#826: avatar (no aparece en ningún lado) y renombrar proyecto o pedido (no hay `@Patch` en `project` ni en `purchase-order`). |
| 10 | Calidad y CI (Cypress, 142 tests) | **Hecho, y ya son más** | PR #765 (142 tests); hoy `front/cypress/e2e/` tiene 28 specs y unos 258 bloques `it(`. `.github/workflows/ci.yml`. |
| 11 | **Deploy de la versión demo "para sus primeros 5 usuarios"** | **NO hecho**: el roadmap dice que se desplegó, pero no hay nada desplegado | Issue **#985** "Deploy de prueba para el cliente" (abierto, 28/9), con **todas** las casillas sin marcar. En ninguna rama local hay `docker-compose.prod.yml`, `Caddyfile`, `.github/workflows/deploy.yml` ni IaC (solo están `ci.yml` y `claude-pr-review.yml`). Lo que sí hay es el diseño: `docs/aws-deployment/deploy-vm-prueba.md` y `arquitectura-{aws,gcp,azure}.md`, `comparacion-nubes.md` (spikes #823 y #899, cerrados). `Arquitectura Liard.md:75` dice "Preparada, no desplegada". #985 depende de COLA-01 y COLA-02 (en **#1000**, abierto). Según #987/#988, la fecha del deploy era el domingo **04/10**. |
| 12 | Video demo y primeros clientes | **Parcial** | La demo en vivo en Liard está hecha (#814, cerrado 19/9). Los videos **#787** (usuario) y **#788** (proveedor) siguen abiertos, y los dos dependen de **#834** (nombre comercial, abierto). No hay evidencia en el repo del contacto con Eaton. |

**Lo que queda del Sprint 4, en concreto:**
1. **El deploy (#985)**, más COLA-01/02 de #1000, que son su prerrequisito. Esto es lo grande, y el roadmap lo da por hecho.
2. **Los videos demo (#787, #788)**, bloqueados por el naming (#834).
3. Mostrar `unmatchedReason` en la UI de cotización, un hueco chico del ítem 4.
4. Avatar y renombrar proyecto o pedido (#824–#826), si se cuentan dentro del ítem 9.
5. Higiene: cerrar #832, #930, #931, #970, #987 y #988, que ya están en `dev` (PRs #957, #989, #990, #971, #995).

---

## 2. Sprint 5: lo planificado, los issues que le corresponden y las dependencias

| Ítem del roadmap Sprint 5 | Issues | Estado en código | Depende de |
| --- | --- | --- | --- |
| Extender el deploy serverless a más usuarios | #985 (VM de prueba, paso previo); la Alternativa 2 serverless está en `docs/aws-deployment/arquitectura-aws.md`, sin issue propio | Nada desplegado | #985 → #1000 (COLA-01/02; fases 2–4: protocolo asíncrono, latido, cancelación) |
| Matching para todos los componentes | #945 (15 materiales del unifilar: datos mergeados en PR #947, issue abierto a la espera de revisión); #856 ("seed: los 88 componentes", **cuerpo vacío**) | Hay 33 tipos base sembrados, contra 67 materiales en `evaluation/matching/variantes-descripcion.json` (52 + 15). Ninguno de los nuevos (UPS, ACB, capacitor…) está en `seed/components/` | #987/#995 (hecho); una clase por componente en `seed/components/` |
| BOM alternativo | Épica #828 → #829 (editor), #830 (cotización de backup), #831 (órdenes de compra) | No empezado: no hay campo alternativo en `schema.prisma` | #829 → #830 → #831, en ese orden |
| Pagos (suscripción + comisión por lead) | **Sin issue** | Nada (grep de stripe, mercadopago y subscription vacío) | Definir el modelo de negocio |
| Control del gasto de IA por usuario | Parte de #836 y de #985 §3 (workspaces y tope de gasto por workspace) | Parcial: el backend registra `costUsd` de las lecturas de catálogo y de BOM. El costo de la detección queda solo en `runs/.../components.json` (`cost.retries`), sin persistir en la base. No hay límites por usuario | #836 |
| Notificaciones por email de pedidos | **Sin issue** | Parcial: `back/src/common/mail/` (IMailer, SmtpMailer, LogMailer) existe, pero solo lo usan `auth` (reset de contraseña, credenciales) | — |
| Observabilidad | #836 (APM y trazabilidad de IA); #985 §8 (New Relic en la VM, evento `ClaudeCall`) | Nada: grep de newrelic, sentry y opentelemetry vacío | #985 |
| Procesamiento de DWG | **Sin issue** | Nada (grep de "dwg" en el código vacío) | — |
| Mejoras de la herramienta y del dataset | #1002 (marcas numeradas con la tabla de referencias), #901 (familias ↔ tabla del cliente), #946 (segundo YOLO), #813 (spike del tile residual) | Abiertos | #901 y #1002 se tocan (los dos usan la tabla de referencia, que hoy se descarta: `component-detector/api.py:263-271`) |

Hay issues abiertos que no están en ninguno de los dos sprints del roadmap: #827 (plazos de entrega en la matriz: ya hay `leadTimeLabel` en `ComponentOfferMatrix.tsx`, así que es parcial), #835 (importación incremental del catálogo), #824/#825/#826 (perfil), #834 (branding) y #970 (bug, ya resuelto por #971).

---

## 3. Issues abiertos (27), en una línea cada uno

| # | Título corto | Nota |
| --- | --- | --- |
| #1002 | Tabla de referencias para resolver marcas numeradas (⑦ en vez de `2x14A`) | Detector; primero hay que medir el problema |
| #1000 | Cola de planos: lo que falta (un YOLO por proceso, soltar jobs en SIGTERM, protocolo asíncrono con latido) | Bloquea #985 |
| #988 | Épica Matching del lado usuario + match por igualdad | Sus dos tickets están en código: se puede cerrar |
| #987 | Matching por componente base y atributos iguales | Hecho por PR #995: se puede cerrar |
| #985 | Deploy de prueba en VM + New Relic | 0 casillas marcadas; es lo que falta del Sprint 4 |
| #970 | Bug: cancelar un diálogo abierto desde un menú deja la página sin clicks | Resuelto por PR #971 (`PlanRowMenu.tsx:55` `modal={false}`) |
| #946 | Segundo YOLO opcional | README: R+U juntos no suman ni un aparato y tardan un 63% más, así que probablemente es obsoleto |
| #945 | 15 materiales del unifilar que faltan (potencia, MT) | Datos mergeados (PR #947); falta la revisión y el seed |
| #931 | Nombrar la cantidad de cada exportación | Resuelto por PR #990 |
| #930 | Decimales binarios en la exportación | Resuelto por PR #989 |
| #901 | Mapear las familias con la tabla de referencia del cliente, con validación humana | Detector y producto |
| #856 | Seed de los 88 componentes | Cuerpo vacío |
| #836 | Observabilidad: APM + trazabilidad de IA | Sprint 5 |
| #835 | Actualización del catálogo: incremental o reemplazo total | Hoy la importación reemplaza todo |
| #834 | Nombre comercial del producto | Bloquea #787 y #788 |
| #832 | Planos en PDF | Hecho (PRs #955–#957): se puede cerrar |
| #831 | BOM-01C: órdenes de compra con la alternativa | Sprint 5 |
| #830 | BOM-01B: cotización de backup | Sprint 5 |
| #829 | BOM-01A: especificación alternativa en el editor | Sprint 5 |
| #828 | Épica del BOM alternativo | Sprint 5 |
| #827 | Plazos de entrega en la matriz y en la confirmación | Parcial |
| #826 | UI/UX de perfil y renombrado | Parcial (la cuenta existe) |
| #825 | Perfil del proveedor, datos comerciales | Parcial |
| #824 | Perfil del ingeniero, avatar, renombrar proyectos y pedidos | Parcial (sin avatar ni renombrado) |
| #813 | Spike: recuperar los símbolos que YOLO no recuadra | Detector |
| #788 | Video demo del proveedor | Sprint 4, pendiente |
| #787 | Video demo del usuario | Sprint 4, pendiente |

---

## 4. Números medidos (para usar en el business case)

Todos salen de corridas del equipo sobre los planos del repo. Salvo donde se aclara, son del cliente Liard y de un segundo cliente.

### Detección: ubicar los aparatos (YOLO, etapa 1)
- **v13_R sobre 15 planos (839 bloques de aparato): 816 encontrados = 97,3%** (v3 anterior: 94,4%). 955 cajas, 33 sin bloque, 334 s en total para los 15 planos. — `component-detector/README.md` §Estado medido (líneas 726–746).
- **25 planos: 976 de 982 aparatos ubicados (99,4%), 23 planos al 100%, mediana de 14 s por plano** (con el `detect()` real). — README, línea ~226.
- PR #996 (6 planos, contra la verdad v5): los aparatos perdidos bajaron de **125 a 11**; las cajas de más, de 430 a 353. De esas 353, unas 180 son aparatos reales que la verdad no marca.
- Línea base histórica (05/06/2026, `evaluation/ground-truth.json`, 5 planos de prueba y 129 componentes): Claude solo, P 0,944 / R 0,907 / F1 0,925; YOLO, P 1,0 / R 0,953 / F1 0,976.

### Clasificación (Claude, etapa 2)
- **51 y 52 aciertos de 56** en dos corridas idénticas (~91–93%), y **cero respuestas equivocadas con confianza alta** en 212 respuestas puntuadas (Opus 5.5). Opus 5 hacía 38/56. — README, líneas ~445 y ~800.
- Contra el propio DXF, en un tablero real de 205 bloques: 202/205 ubicados con umbral 0,50 (medido con el modelo v3, antes del cambio de pesos). — README §El clasificador.

### Costo de IA
- **Detección: USD 1,02 por plano de 221 cajas** (Opus 5.5, esquema de respuesta y esfuerzo bajo), medido sobre 100 recortes reales; techo del proyecto USD 1,22; antes costaba USD 2,95. TSSS completo: 229 cajas, **USD 1,32**. — README §Estado medido.
- `docs/aws-deployment/arquitectura-aws.md:70,408`: un plano medio tiene ~121 cajas (~121 llamadas, **~80 s**) y **~USD 0,73 por plano**; ~USD 0,006 por llamada (`deploy-vm-prueba.md`).
- **Lectura del catálogo (Haiku 4.5): USD 0,00146 por línea con caché** (7,7× menos que sin caché); 1.000 líneas ≈ USD 1,47 en ~14 s; un catálogo real de 2.551 líneas ≈ USD 3,42 en ~32 s. — issue #932.
- **Lectura del BOM: USD 0,0023 por línea**; un plano típico (10 líneas distintas) ≈ **USD 0,041 en 8,3 s**; un proyecto de 64 líneas ≈ USD 0,16. — issue #938.
- La VM de prueba: ~USD 15–16 al mes a pedido (2 h por día hábil), ~USD 31–34 con horario fijo de 6 h, ~USD 139–154 siempre prendida. — `docs/aws-deployment/deploy-vm-prueba.md`.

### Precisión de la lectura con IA (matching)
- Catálogo (#932): componente correcto en **69/70 (98,6%)**, atributos presentes bien leídos 201/202 (99,5%), **0 atributos inventados** (24/24 `null`). **Aviso del propio issue: los casos son sintéticos, los escribió Claude y el modelo evaluado es de la misma familia.**
- BOM (#938): 39/40 casos exactos (97,5%); componente 40/40, atributos 135/135, marca 40/40, gama 39/40. También sintético.
- **No hay una medición de punta a punta del matching** (línea del BOM → oferta correcta) sobre datos reales. #904 armó el set de casos reales etiquetados, pero no hay un número de acierto del match publicado.

### Tiempos
- Filtrado de los planos más grandes: **622 s → 26 s** (lu_un_01) y 755 s → 24 s (nyw_un_01), con la salida idéntica bit a bit (PR #994).
- Clasificación en paralelo en TSSS: 83 s con 8 consultas en paralelo, 43 s con 16 y 29 s con 24; el plano completo pasó de 124 s a 66 s (README, línea ~425).
- De punta a punta: `/bom/detectBom` sobre test1 respondió en 40 s, con 100 componentes y 24 líneas de BOM (PR #996).
- Techo de la API: ~8 planos por minuto con el tier Build (`arquitectura-aws.md:459`).
- **PDF contra DXF: −2,4% de aparatos encontrados** (2.649 contra 2.713), lo que corre hoy (README, línea ~604). El roadmap dice "2–3% menos": consistente.
- Referencia manual para comparar, **dicha por el cliente y no medida por el equipo**: un tablero chico ≈ 30 min, uno grande ≥ 1 día, ~40 tableros en un edificio sencillo, y cada tablero se revisa 2 veces (`Documento de Visión`, PR #1003).

---

## 5. El recorrido del proyecto (git log de `dev`, 699 commits)

Commits por mes: abril 1 · mayo 169 · junio 63 · julio 0 · agosto 102 · **septiembre 364**. Más de la mitad del trabajo es de septiembre.

| Fecha | Hito |
| --- | --- |
| 28/04/2026 | Commit inicial |
| 04/05 | Spikes de detección con LLM (Sprint 1) |
| 17/05 | CRUD de proyectos, API NestJS |
| 26/05 | Microservicio de detección FastAPI + Docker (#84) |
| 05–07/06 | Línea base de detección (`ground-truth.json`), documentación |
| 18–24/06 | Exportación del BOM a Excel y CSV (#185), importación de componentes (#207), servicio de cotizaciones (#212), generación de planos individuales (#215) |
| julio | Sin commits |
| 24–31/08 | Símbolos ubicados, modo revisión (#290), corte en grilla (#304), módulo de proveedores (#357, #365), **cola asíncrona de procesamiento** (#374) |
| 02–07/09 | Catálogo y market-data para cotizar (#401), editor del BOM (#407), workspace de cotización (#463), **autenticación real y roles** (AUTH-01…25, #516–#559), mailer SMTP (#548) |
| 10–14/09 | Recorte de DXF por rectángulo (#643, #645, #708), catálogo propio del proveedor: importación en 3 pasos, ABM, resumen e historial (#716–#729), directorio de proveedores (#731) |
| 16–18/09 | **Pipeline único YOLO+Claude** (#733), pantalla de cuenta, **Cypress con 142 tests en CI** (#765), el editor elige marcas y no proveedores (#769, #796) |
| 20–21/09 | **Catálogo base (canónico)** (#852–#865), multimarca y submarca en la cotización (#804, #866), reglas de marca (#815), ver y corregir sobre el plano (#801, #808) |
| 23–27/09 | Tipos de componente y atributos (#935, #944, #964), multiplicador (#869, #871), corregir desde el visor (#959), código de producto, código de marca y gama (#969) |
| 28–30/09 | Estandarización del catálogo (#978), set de variantes (#929, #947), **PDF de punta a punta** (#955–#957), **lectura del BOM con Haiku y matching por igualdad** (#991, #992, #995), cola justa por usuario y detector en rondas (#996), actualización de docs (#1003) |

La secuencia de capacidades: detección (mayo) → BOM y exportación (junio) → cola, proveedores y pedidos (agosto) → auth, catálogo y cotización (principios de septiembre) → YOLO+Claude y e2e (mediados de septiembre) → catálogo canónico, lectura con IA y matching por igualdad (fines de septiembre). Todavía no se desplegó nada.
