# LIARD — inventario de código (rama `dev`)

Fuente: `front/src/router/index.tsx`, `front/src/pages/**`, `front/src/components/**`, `back/src/modules/*/controller/*.ts`,
`back/prisma/schema.prisma`, `back/src/modules/canonical-catalog/seed/components/*.ts`, `front/cypress/e2e/*`.
Endpoints sacados de los decoradores de los controllers (no de `api-endpoints.md`). "Existe" = ruta montada en el router
de `dev` con página real; las marcadas [shot] se renderizaron con la API mockeada (ver `shots-app/`).

## 1. Rutas del front por rol

Guards: `GuestOnly` (si hay sesión redirige al home del rol), `RequireAuth`, `RequireOnboarded`, `RequireRole role=ENGINEER|SUPPLIER`.
Layouts: `components/layouts/AppLayout.tsx` (ingeniero: sidebar `AppSidebar` con "Nuevo proyecto" + Proyectos / Pedidos, pie con
`SidebarAccountMenu`), `pages/supplier/SupplierLayout.tsx` (proveedor: `SupplierSidebar`, grupos Solicitudes y Catálogo),
`RoleLayout.tsx` (elige uno de los dos para `/cuenta`). La barra se pliega a riel de 3.5rem (`⌘B`, cookie `sidebar_state`).

### Invitado (público)
| Ruta | Página | Qué se hace | Estado |
|---|---|---|---|
| `/` | `pages/LandingPage.tsx` (+ `components/landing/*`, `styles/landing.css`) | Landing: hero "Del tablero al proveedor, en un solo circuito.", Cómo funciona / Qué hace / Por qué liard / Contacto, CTA Crear cuenta | existe [shot] |
| `/login` | `pages/auth/LoginPage.tsx` (`components/auth/login/*`) | Iniciar sesión; panel azul con unifilar (`OneLineDiagram`) | existe [shot] |
| `/register` | `pages/auth/RegisterAccountPage.tsx` (`components/auth/register/*`) | Crear cuenta (nombre, correo, contraseña con reglas en vivo); a la izquierda una "LISTA DE MATERIALES" de muestra (`BomLegend`) | existe [shot] |
| `/forgot-password` | `pages/auth/ForgotPasswordPage.tsx` | Pedir enlace de recuperación (fondo `BlueprintGrid`) | existe [shot] |
| `/reset-password` | `pages/auth/ResetPasswordPage.tsx` | Elegir contraseña nueva por token | existe |
| `/confirmar-email` | `pages/auth/ConfirmEmailPage.tsx` | Confirmar cambio de correo (estados: confirmando / confirmado / enlace incompleto / error) | existe |
| `/register/type`, `/register/profile` | redirects a `/onboarding/*` | — | existe |

### Sesión sin onboarding (cualquier rol)
| `/onboarding/role` | `pages/onboarding/SelectRolePage.tsx` (`RoleChoice`, `RoleCard`) | Elegir Ingeniero o Proveedor | existe |
| `/onboarding/profile` | `pages/onboarding/CompleteProfilePage.tsx` (`ProfileWizard`, `ProfileStepper`, `TagPicker`, `ProviderFavorites`) | Wizard de perfil por pasos; el ingeniero marca proveedores favoritos | existe |

### Ambos roles (onboarded)
| `/cuenta`, `/cuenta/:section` | `pages/account/AccountPage.tsx` (`components/account/*`) | Tabs Perfil / Empresa / Marcas / Seguridad (proveedor: "Tu perfil de venta"); cambiar correo y contraseña, borrar cuenta, marcas preferidas/bloqueadas del usuario | existe [shot ingeniero] |

### ENGINEER (`AppLayout`)
| Ruta | Página | Qué se hace | Estado |
|---|---|---|---|
| `/projects` | `pages/ProjectsPage.tsx` (`ProjectsGrid`, `ProjectCard`, `ProjectsToolbar`, `StatusFilterPopover`, `DateRangeFilterPopover`, `NewProjectCard`, `empty-states/ProjectsEmptyState`) | Grilla de proyectos con barra de progreso tricolor por estado de planos, buscar, filtrar por estado/fecha, paginar, crear proyecto (`NewProjectModal`) | existe [shot] |
| `/projects/:id` | `pages/ProjectDetailPage.tsx` (`project/workspace/*`, `ReferenceTableCard`, `BomSummaryTable`, `CropReferenceTableModal`, `ProjectBrandPreferencesModal`, `FirstStepsChecklist`) | Tabla de referencia (subir/recortar/ver/reemplazar), lista de planos con chips de estado (Todos/Listos/En proceso/Pendientes/Errores/Sin identificar), subir DXF/PDF (`UploadPlansDialog`: "un archivo por tablero" o "un plano con varios tableros" → recorte `plan/crop/*`), procesar/reintentar todos, repeticiones `×N` (`PlanMultiplierDialog`), visor rápido, BOM consolidado con stats (Componentes / Tableros listos / Sin identificar), exportar, "Marcas del proyecto" | existe [shot] |
| `/projects/:id/plans/:planId` | `pages/PlanDetailPage.tsx` → `plan-variations/layouts/PlanLayoutV5_InteractiveInspector.tsx` (`inspector/*`, `plan/PlanDxfViewer`, `PlanDetectedComponentBoxes`, `PlanUnidentifiedBoxes`, `shared/UnmappedSymbolsCard`, `BatchResolveSymbolsDialog`, `SymbolBulkBar`) | Visor CAD con cajas de detección, pestañas BOM / CAD, editar especificación, resolver/descartar símbolos sin identificar (uno o en lote), reclasificar símbolo con preview, paginar entre planos hermanos, atajos de teclado | existe |
| `/projects/:id/bom/edit` | `pages/BomEditorPage.tsx` → `bom-editor/BomEditorWorkspace.tsx` (vista lista y vista "por plano" `layouts/by-plan/*`, `BomEditorInspector`, `BulkSelectionInspector`, `BulkActionBar`, `BomLineCanonicalPanel`, `QuickBrandDropdown`, `BomLineFilters`, `UnsavedChangesDialog`) + `bom-symbol-locator/*` | Editar el BOM consolidado: material/especificación/cantidad/marca/gama, componente base + atributos, autocompletar marca, aplicar marcas preferidas, banner de bloqueadas, selección múltiple, ubicar cada línea en el plano ("Ver en Cómputo BOM", recorrer símbolos) | existe |
| `/projects/:id/quotation` | `pages/QuotationPage.tsx` → `quotation-workspace/layouts/QuotationWorkspaceLayout.tsx` (`table/QuotationMatrixTable`, `QuotationStatusHUD`, `OptimizationToolbar` MIXED/SINGLE, `ComponentOfferMatrix`, `ComponentIntelligenceDrawer`, `AllocateAllConfirmDialog`, `ExecuteOrderAction`) | Matriz BOM × proveedor, cobertura, estrategia mixta o proveedor único, asignar todo, comparar marcas/gamas, emitir pedido (`order/confirm-order/ConfirmOrderDialog`) | existe |
| `/projects/:id/quotation/material/:itemId` | `pages/MaterialOffersPage.tsx` (`MaterialOffersFilters`, `OfferDetailPanel`) | Ofertas alternativas de un material (filtros por marca, rango) | existe |
| `/projects/:id/quotation/:offerId` | `pages/QuotationDetailPage.tsx` (`components/quotation/*`) | Detalle de la oferta de un proveedor: métricas, ítems cotizados, ítems sin catálogo | existe |
| `/orders` | `pages/orders/OrdersPage.tsx` (`OrdersStatsPanel`, `OrdersListTable`, `filters/*`, `empty-states/OrdersEmptyState`) | "Mis pedidos": KPIs En espera / Confirmados / Rechazados / Vencidos, tabla Pedido-Proyecto-Estado-Proveedores-Total, filtros estado/proyecto | existe [shot] |
| `/orders/:orderBatchId/success` | `pages/orders/OrderSuccessPage.tsx` (`order/sent-order/*`) | Confirmación de pedido enviado | existe |
| `/orders/:orderBatchId/providers` | `pages/orders/OrderPerProviderPage.tsx` (`OrderProvidersList`, `OrderProviderDetailView`, `OrderProviderMaterialsTable`, `complete-order/*`) | Pedido por proveedor: estado de cada uno, materiales, panel lateral animado | existe |

### SUPPLIER (`SupplierLayout`, base `/supplier` → redirige a `/supplier/requests`)
| `/supplier/requests` | `pages/supplier/SupplierRequestsPage.tsx status=SENT` (`SupplierRequestsGrid`, `SupplierRequestCard`, `filters/*`) | Solicitudes recibidas: tarjetas, buscar, filtro de fecha y monto | existe [shot] |
| `/supplier/requests/accepted` · `/rejected` | misma página con `CONFIRMED` / `REJECTED` | Aceptadas / Rechazadas | existe |
| `/supplier/requests/:purchaseOrderId` | `SupplierRequestDetailPage.tsx` (`SupplierRequestSummaryCard`, `SupplierRequestLinesTable`, `SupplierRequestActionsBar`, `SupplierRequestResponseModals`) | Detalle, aceptar / rechazar con modal | existe |
| `/supplier/requests/:purchaseOrderId/contact` | `SupplierRequestContactPage.tsx` (`SupplierContactCard`) | Contacto del cliente (habilitado al aceptar) | existe |
| `/supplier/catalog/products` | `SupplierCatalogPage.tsx` (`SupplierCatalogTable`, `SupplierCatalogToolbar`, `SupplierCatalogItemModal`) | "Mis productos": tabla código/producto/componente base/marca/precio, Publicados/Todos, alta/edición/baja manual | existe [shot] |
| `/supplier/catalog/manage` | `SupplierCatalogImportPage.tsx` (`catalog-import/*`: stepper Elegir planilla → Revisar la lectura → Confirmar, `CatalogAttributeMapper`, `CatalogVerdictBanner`, `CatalogIssueReport`, `CatalogImportHistory`) | Importar .xlsx en dos pasos (preview/confirm) | existe [shot] |
| `/supplier/catalog/link` | `SupplierCatalogLinkPage.tsx` (`canonical-link/*`: `CatalogReadingProgress`, `CatalogStandardizationOverview`, `CatalogTray`, `CatalogItemSheet`) | Vinculación al catálogo canónico: progreso de la lectura IA, conteos Todas/Listas/Les falta un atributo/Sin vincular, completar atributos | existe [shot] |

Cypress (28 specs en `front/cypress/e2e/`): app-navigation-and-session, auth-and-onboarding, bom-editor-actions,
bom-editor-autocompletado-marcas, bom-editor-marcas-preferidas, bom-editor-por-plano(-edicion), bom-editor-views,
catalog-import-wizard, landing-page, onboarding-favoritos, orders-engineer, plan-detail, project-bom-refresh,
project-brand-preferences, project-delete, project-detail-actions, project-not-found, project-plan-pdf,
project-plan-row-layout, projects-flow, quotation-flow, quotation-matrix-interactions, quotation-multibrand,
supplier-catalog(-management), supplier-requests, user-account. Fixtures reutilizables: `cypress/fixtures/session-*.json`,
`cypress/support/bom-por-plano.ts` (proyecto "Planta Norte", planos "Tablero principal"/"Tablero de bombas"/"Sala de máquinas",
marcas Schneider/Siemens/Prysmian/Zoloda, proveedores Electro Sur / Casa Rosell).

## 2. Backend: grupos de endpoints (todo bajo `/api`)

| Módulo | Prefijo | Endpoints |
|---|---|---|
| auth | `/auth` | POST register, login, logout, forgot-password, reset-password, email/confirm · GET me, email/pending · PATCH password, email · DELETE email/pending |
| users | `/users` | PATCH me · DELETE me |
| brand-preference | `/users/me` y `/project/:projectId` | GET/PUT brand-preferences |
| project | `/project` | POST · GET · GET :id · PUT/GET :id/bom · GET :id/bom/export · DELETE :id · GET :id/reference-table/file · POST :id/reference-table, :id/reference-table/crop · DELETE :id/reference-table |
| electrical-plan | `/project/:projectId/electrical-plan` | POST (upload) · POST crop · GET · GET :planId · DELETE :planId |
| electrical-plan | `/project/:projectId` | POST process-all (202) · GET processing-status · DELETE processing-batch |
| electrical-plan | `/electrical-plan` | POST :id/process (202) · GET :id, :id/file, :id/source, :id/bom/export · PATCH :id · DELETE :id |
| electrical-bom | `/electrical-plan/:planId/bom` | GET tile-image/:tileIndex · PATCH/DELETE unidentified/:id · POST symbols/:symbolId/reclassify(/preview) · PATCH symbols/review · PUT components |
| quotation | `/quotation` | POST :projectId · GET :projectId/current · GET :projectId/:quoteId · GET :projectId/:quoteId/offers/:providerOfferId |
| quotation/market | `/bom-catalog` · `/electrical-plan/:planId/bom` · `/project/:projectId/bom` | GET · GET market-data · GET market-data |
| purchase-order | `/orders` | POST projects/:projectId/quotes/:quoteId · GET · GET :batchId/providers(/:providerOrderId) · GET supplier/requests(/:id)(/contact) · POST supplier/requests/:id/accept, /reject |
| provider | `/providers` | GET · GET catalog, catalog/reading, catalog/currencies, catalog/items, catalog/unlinked, catalog/imports · POST catalog/items, catalog/imports/preview, catalog/imports · PATCH/DELETE catalog/items/:id · PUT catalog/items/:id/canonical, /reading · DELETE catalog/items/:id/canonical |
| canonical-catalog | `/canonical-catalog` | GET components, components/:id, component-types · POST components · PATCH components/:id |

## 3. Enums reales (`back/prisma/schema.prisma`) y su etiqueta en la UI

| Enum | Valores | Etiqueta / color en el front |
|---|---|---|
| `UserRole` | ENGINEER, SUPPLIER | "Ingeniero" / "Proveedor" (pie de sidebar) |
| `ElectricalPlanStatus` | PENDING, PROCESSING, COMPLETED, ERROR, STALE | Pendiente (muted, Clock) · En Proceso (primary, RefreshCw girando) · Listo (emerald, CheckCircle2) · Error (rose, AlertTriangle) · Por revisar (amber, AlertCircle) — `components/project/PlanStatusBadge.tsx`. Acción: Procesar / Reintentar / Procesando (`lib/planStatus.ts`; procesables = PENDING, ERROR, STALE) |
| `ElectricalBomStatus` | PENDING_REVIEW, COMPLETE | símbolos sin resolver vs todo resuelto |
| `DetectedComponentOrigin` | DETECTOR, MANUAL_RESOLUTION, LEGACY_POINT | |
| `ProcessingJobStatus` | QUEUED, RUNNING, SUCCEEDED, FAILED, CANCELLED | resumen de tanda (`PlansBatchSummary`, `ProcessingStatus {total, queued, running, completed, failed, cancelled, inProgress}`) |
| `SyncStatus` (import de catálogo) | PENDING, RUNNING, SUCCESS, FAILED, PARTIAL | historial de cargas |
| `QuoteStatus` | PENDING, PROCESSING, READY, PARTIAL, FAILED, EXPIRED | |
| `QuoteLineStatus` | QUOTED, NOT_FOUND, STALE_PRICE, ERROR, MANUAL_REQUIRED | NOT_FOUND lleva `BomQuoteLine.unmatchedReason` |
| `MatchMethod` | EXACT_CODE, SKU, MANUFACTURER_PART, NAME_SPEC, FUZZY, MANUAL, CANONICAL | hoy todo match es CANONICAL, score 100 |
| `PurchaseOrderStatus` | SENT, CONFIRMED, REJECTED, EXPIRED | Ingeniero: EN ESPERA (amber-100/700) · CONFIRMADO (green-100/700) · RECHAZADO (red-100/700) · VENCIDO (gray) — `OrderStatusBadge`. Proveedor: Recibida (primary) · Aceptada (green-500) · Rechazada (destructive) · Vencida (muted) — `SupplierRequestStatusBadge` |
| `BrandPreferenceKind` | PREFERRED, BLOCKED | marcas preferidas / bloqueadas (usuario y proyecto) |
| `CanonicalAttributeDataType` | NUMBER, TEXT, BOOLEAN | |
| `CatalogReadingStatus` | PENDING, READ, FAILED | front: "Leyendo…" (primary + ping) · "No se pudo leer" (destructive) |
| `CanonicalLinkStatus` | UNLINKED, AUTO, MANUAL | front deriva LINKED / READING / FAILED / UNIDENTIFIED ("Sin identificar", warning-surface) y filtros ALL "Todas" / COMPLETE "Listas" / INCOMPLETE "Les falta un atributo" / UNLINKED "Sin vincular" |

Estados derivados solo en el front: línea del BOM `blocked | warning | ready` → "Bloquea la cotización" / "Se puede cotizar con reparos" / "Lista"
(`bom-editor/shared/lineState.ts`); estrategia de cotización `MIXED | SINGLE`; filtros de pedidos `ALL | SENT | CONFIRMED | REJECTED | EXPIRED`;
estado del proyecto en la tarjeta: "Listo" / "Requiere Atención" / "Sin Planos".

## 4. Modelos principales (campos que una pantalla puede mostrar)

- **Project**: name, description, owner, referenceTable (fileName, uploadedAt), plans, currentQuote, purchaseOrderBatches, brandPreferences, deletedAt. Front lista: `planCount {total, completed, processing, pending, error, stale}`, `progressPercentage`.
- **ElectricalPlan**: name, file, sourceFile (PDF origen), `sourceFormat` DXF/PDF, status, lastError, **multiplier** (repeticiones del tablero, `×N`), processingStartedAt. En el detalle del proyecto: `bomWarning`, `unidentifiedSymbolsCount`.
- **ElectricalBom**: status, electricalComponents, unidentifiedSymbols, tileImages (recortes PNG por `tileIndex`), detectedComponents.
- **ElectricalComponent** (línea por plano): material, specification, quantity, **detectedQuantity**, brand, subBrand, canonicalComponent, canonicalLinkStatus, readingStatus.
- **DetectedComponent** (cada caja): `worldBoxMinX/MinY/MaxX/MaxY` (coordenadas CAD), `worldX/worldY`, `pointedByModel`, origin, material, specification, reason, `confidence` (texto), `detectionConfidence` (float), `isComponent`, `mergedIntoAnotherBox`, `needsReview`.
- **UnidentifiedElectricalComponent**: approximateLocation, visualDescription, possibleSpecification, tileIndex + bbox normalizado (`bboxMinX…`, 2 decimales, incluye el texto), worldX/Y, `anchoredToGeometry`, worldBox, resolvedMaterial/Quantity/Specification, resolvedAt.
- **ProjectBomItem** (BOM consolidado editado): material, specification, quantity, brand, subBrand, canonical link + reading. El DTO consolidado trae `quantity` (dibujado), `effectiveQuantity` (× multiplier), `detectedQuantity`, `sources[]` por plano.
- **BomLineReading**: caché por texto normalizado; `model`, `costUsd`, `readAt`.
- **ProcessingJob**: status, attempts/maxAttempts, lastError, batchId, enqueuedAt/startedAt/finishedAt, leaseExpiresAt, workerId.
- **Provider** (ficha de un User SUPPLIER): catalogColumnMapping, catalogItems, syncRuns, readingRuns. User proveedor: companyName, categories, brands, deliveryZones, minOrderAmount, leadTimeDays, shortDescription.
- **ProviderCatalogItem**: productCode, brand, brandCode (código de la marca, ej. SCH), subBrand (gama), name, description, specification, currency, unitPrice, leadTimeDaysMin/Max, priceUpdatedAt, priceValidUntil, isActive, canonical link + reading, priceHistory.
- **ProviderSyncRun**: itemsRead/Created/Updated/Failed/Discarded/Deactivated/ToRead, errorMessage, discardReport. **CatalogReadingRun**: costo y progreso de la lectura IA (front: `costUsd`, `estimatedCostUsd`).
- **BomQuote**: status, currency, revision, bomFingerprint, totalLines, requestedAt/completedAt/confirmedAt/supersededAt/expiresAt, selectedOffer. DTO comparativa: `summary {totalItems, providerOffers, bestTotalAmount, bestAvailabilityPercent}`, `offers[] {providerName, subtotal/totalAmount, quotedLines/totalLines, availabilityPercent, leadTimeDaysMin/Max, isSelected, rank}`, `project {completedPlans, totalPlans, stalePlans}`, `orderBatchId`.
- **BomQuoteLine**: lineNumber, material, specification, quantity, selectedBrand, selectedProviderId, unmatchedReason. **QuoteProviderOffer**: subtotal/total, quotedLines/totalLines, coveragePercent, leadTime. **QuoteLineOffer**: status, matchMethod, matchScore, productCode, brand/subBrand, unitPrice, subtotal, leadTime, priceValidUntil.
- **PurchaseOrderBatch**: orderNumber (PED-AAAA-NNN), projectName, sourcePlanName, quoteRevision, sentAt, sourceTotalLines, totalAmount, unassignedLines (con `reason`). **PurchaseOrder** por proveedor: orderNumber, status, responseDeadlineAt, respondedAt, totalAmount, lineCount. **PurchaseOrderLine**: lineNumber, material, specification, quantity, productCode, brand/subBrand, unitPrice, subtotal, priceValidUntil.

## 5. Datos que una feature nueva puede explotar

- **Geometría por detección**: worldBox + worldX/Y en coordenadas CAD por caja (`DetectedComponent`), bbox normalizado + `tileIndex` + imagen del tile (`GET tile-image/:tileIndex`) para los no identificados. Ya se dibujan cajas: emerald (identificado), amber (revisar), rose (error/seleccionado), sky (foco del localizador), slate punteado (descartado/merged). Ojo: el bbox incluye el texto de la especificación, sirve para revisión humana, no para deduplicar.
- **Confianza**: `detectionConfidence` (float), `confidence` (texto), `needsReview`, `pointedByModel`, `mergedIntoAnotherBox` → mapas de calor, colas de revisión, "por qué lo vi".
- **Repeticiones**: `multiplier` por plano → `quantity` vs `effectiveQuantity`; trazabilidad `sources[]` por plano de cada línea consolidada.
- **Cantidad editada vs detectada**: `detectedQuantity` contra `quantity` → diff "lo que vio el modelo / lo que corregiste".
- **Estandarización canónica**: tipo → atributos → valores, `required` define el match. Estado AUTO/MANUAL/UNLINKED + lectura PENDING/READ/FAILED en líneas de BOM y en ítems de catálogo; costo de la lectura (`costUsd`).
- **Mercado**: `/project/:id/bom/market-data` da por línea marcas disponibles, proveedores y rango de precio min/max; `/bom-catalog` da proveedores (itemsCount, leadDaysAvg) y marcas.
- **Cola de procesamiento**: QUEUED/RUNNING/... con attempts, lease, batch → timeline de procesamiento, ETA, cancelar tanda.
- **Precio en el tiempo**: `ProviderPriceHistory`, `priceValidUntil`, `STALE_PRICE` → alertas de vencimiento.
- **Pedidos**: `responseDeadlineAt`, `respondedAt`, `unassignedLines.reason` → semáforos de respuesta, faltantes.

## 6. Los 33 componentes base (`seed/components/*.ts`, `*` = atributo `required`)

| Clave | Nombre | Atributos clave |
|---|---|---|
| AUTOMATIC_TRANSFER_SWITCHBOARD | Tablero de transferencia automática | Polos* [2,3,4]; Corriente nominal A* [40…3200]; Tensión mín/máx V |
| AUXILIARY_CONTACT | Contacto auxiliar | Contactos auxiliares* [1NA, 1NC, 2NA, 2NC, 1NA+1NC…]; Montaje [frontal, lateral] |
| BARE_CABLE | Cable desnudo | Sección mm²* [6,10,16,25,35…]; Cantidad de hilos; Material [Cu, Al]; Norma [IRAM 2004, IEC 60228] |
| CHANGEOVER_SWITCH | Conmutador | Polos* [1–4]; Corriente nominal A* [16…]; Posiciones [2,3] |
| CONTACTOR | Contactor | Polos* [2,3,4]; Corriente nominal A* [6,9,12,18,25…]; Tensión de bobina mín/máx; Tipo de tensión [CA, CC, CA/CC]; Categoría [AC1–AC4]; Contactos auxiliares |
| CURRENT_SENSOR | Sensor de corriente | Corriente primaria A* [5,10,15,20,25…]; Corriente secundaria A* [1,5]; Clase de precisión [0.1, 0.2, 0.2S, 0.5, 0.5S…] |
| DISCONNECTOR_WITH_CONTACTOR | Seccionador con contactor | Corriente nominal* [6,9,12,16,18…]; Categoría de utilización [AC1–AC4]; Código interno |
| FLAT_SHEATHED_CABLE | Cable envainado chato | Cantidad de conductores* [2,3]; Sección* [1, 1.5, 2.5, 4, 6] |
| FUSE | Fusible | Tamaño del fusible* [NH000, NH00, NH0, NH1, NH2…]; Corriente nominal* [2,4,6,10,16…]; Clase |
| FUSED_LOAD_BREAK_SWITCH | Seccionador bajo carga con fusible | Polos* [1–4]; Corriente nominal* [20,25,32,40,50…]; Corriente del fusible [0.5,1,2,4,6…]; Tipo de fusible [TAB, NH]; Tamaño del fusible |
| GENERATOR_SET | Grupo electrógeno | Potencia aparente kVA* [5, 7.5, 10, 15, 20…] |
| GROUNDING | Puesta a tierra | Tipo de puesta a tierra* [PE, PAT]; Sección [2.5,4,6,10,16…] |
| LOAD_BREAK_SWITCH | Seccionador bajo carga | Polos* [1–4]; Corriente nominal A* [16…]; Tamaño del fusible [NH…] |
| MEDIUM_VOLTAGE_CELL | Celda de media tensión | Tensión mín/máx V* [6600, 13200, 13800, 33000]; Corriente nominal; Poder de corte kA; Función* [entrada, salida, medición, protección, remonte] |
| MOLDED_CASE_BREAKER | Interruptor de caja moldeada | Polos* [2,3,4]; Corriente nominal A* [16…]; Poder de corte kA; Unidad de disparo [TM, electrónica] |
| MOTOR_PROTECTION_BREAKER | Guardamotor con protección electromagnética | Regulación mín/máx A* [0.1…]; Poder de corte kA |
| MOTORIZED_BREAKER | Interruptor motorizado | Polos* [3,4]; Corriente nominal A* [100…]; Poder de corte kA |
| MULTIFUNCTION_METER | Instrumento de medición multifunción | Comunicación [RS485 Modbus, Modbus TCP, Profibus DP, BACnet…]; Formato* (… DIN); Tensión de alimentación mín/máx [24,48,110,220,230…]; Tipo de tensión de alimentación [CA, CC, CA/CC] |
| PARALLEL_CABLE | Cable paralelo | Cantidad de conductores* [2]; Sección* [0.5, 0.75, 1, 1.5, 2.5] |
| PHOTOCELL | Fotocélula | Tensión mín/máx [110,127,220,230,240]; Corriente nominal* [6,10,16,20,25] |
| PILOT_LIGHT | Ojos de buey | Diámetro* [16,22,30]; Color*; Tensión mín/máx [12,24,48,110,127…]; Tipo de tensión [CA, CC, CA/CC] |
| RESIDUAL_CURRENT_BREAKER | Interruptor diferencial | Polos* [2,4]; Corriente nominal* [16,25,40,63,80…]; Sensibilidad mA* [10,30,100,300,500]; Clase / tipo [AC, SI] |
| SELECTOR_SWITCH | Selectora | Posiciones* [2,3,4]; Diámetro mm [16,22,30] |
| SINGLE_CORE_CABLE | Cable unipolar | Sección mm²* [0.5…]; Color [rojo, negro, marrón, celeste, blanco…]; Norma [IRAM NM 247-3, IRAM 62267] |
| SOCKET_BOX | Caja de toma | Configuración* [2P+T, 3P+T, 3P+N+T]; Corriente nominal A* [10,16,20,32,63]; Tensión; Grado de protección [IP20…IP55…] |
| SURGE_PROTECTION_DEVICE | Descargador de sobretensiones | Corriente máx. de descarga kA*; Tipo/clase* [1,2,3]; Polos; Tensión; Tipo de tensión |
| TERMINAL_BLOCK | Bornera | Sección mm²* [1.5…]; Tipo de conexión [tornillo, resorte, push-in]; Corriente nominal |
| THERMOMAGNETIC_BREAKER | Interruptor termomagnético | Polos* [1–4]; Corriente nominal A* [0.5…]; Curva [B,C,D,K,Z]; Poder de corte kA [3, 4.5, 6, 10, 15] |
| TIMED_SWITCH | Interruptor temporizado | Corriente nominal* [10,16]; Tensión mín/máx [110…240]; Rango de tiempo [0.5-7, 0.5-10, 0.5-12, 0.5-20, 1-7…] |
| TRANSFORMER | Transformador | Tensión primaria mín/máx* [220,230,380,400,440…]; Tensión secundaria mín/máx* [6,12,24,48,110…]; Potencia aparente kVA* [0.025, 0.04, 0.05, 0.063, 0.1…] |
| UNDERGROUND_CABLE_LSOH | Cable subterráneo LSOH | Cantidad de conductores* [1–5]; Sección* [1.5,2.5,4,6,10…]; Material del conductor; Aislación [PVC, XLPE, EPR, LSOH]; Norma [IRAM 62266, IRAM 2178, IEC 60502-1] |
| UNDERGROUND_CABLE | Cable subterráneo | Cantidad de conductores* [1–5]; Sección* [1.5,2.5,4,6,10…]; Material del conductor; Norma [IRAM 2178, IEC 60502-1] |
| WORKSHOP_TYPE_CABLE | Cable tipo taller | Conductores* [2–5]; Sección mm²* [0.5…]; Norma [IRAM 2158, IRAM NM 247-5] |

Nombres de componente y de atributo copiados de cada clase; los rangos de valores se muestran recortados (los primeros 5).
Cada valor tiene `variants` (escrituras que se normalizan, ej. "4P", "tetrapolar", "3P+N" → 4).
