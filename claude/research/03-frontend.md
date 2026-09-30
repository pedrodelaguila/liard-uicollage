# 03 — LIARD frontend: journeys, rules, copy, visual system

Source: `lab3-liard` repo, `front/`, branch `dev`, commit `04fc8139`. Read-only audit; nothing in the repo was modified.
All paths below are relative to `lab3-liard/front/src/` unless they start with `front/` or `back/`.

Purpose: give the design team a map of every existing screen and the domain rules the UI enforces today, so a radical
redesign can drop the current layouts without dropping a verified rule.

---

## 1. Routes and guards

Router: `router/index.tsx` (mounted in `App.tsx` inside `TooltipProvider` + `components/shared/Toaster.tsx`).

Guards (`components/auth/guards/`):

| Guard | Behaviour |
| --- | --- |
| `GuestOnly` | With a session, redirects to `resolvePostLoginRoute(user)` (`lib/auth/session-home.ts`). Renders nothing while the session loads. |
| `RequireAuth` | No session -> `/login`. Waits for session load (explicitly to avoid the "logged out on refresh" bug). |
| `RequireOnboarded` | Role missing or `needsOnboarding` -> back to the onboarding step. |
| `RequireRole role=X` | Wrong role or onboarding pending -> the user's own home. |

`resolvePostLoginRoute`: no role -> `/onboarding/role`; role but profile not sealed -> `/onboarding/profile`;
otherwise `ENGINEER -> /projects`, `SUPPLIER -> /supplier/requests`.

| Path | Page component | Guard / who sees it |
| --- | --- | --- |
| `/` | `pages/LandingPage.tsx` | public |
| `/forgot-password` | `pages/auth/ForgotPasswordPage.tsx` | public (deliberately not GuestOnly: link opens with a session) |
| `/reset-password` | `pages/auth/ResetPasswordPage.tsx` | public |
| `/confirmar-email` | `pages/auth/ConfirmEmailPage.tsx` | public |
| `/login` | `pages/auth/LoginPage.tsx` | GuestOnly |
| `/register` | `pages/auth/RegisterAccountPage.tsx` | GuestOnly |
| `/register/type`, `/register/profile` | redirects to `/onboarding/role`, `/onboarding/profile` | legacy aliases |
| `/onboarding/role` | `pages/onboarding/SelectRolePage.tsx` | RequireAuth |
| `/onboarding/profile` | `pages/onboarding/CompleteProfilePage.tsx` | RequireAuth |
| `/cuenta`, `/cuenta/:section` | `pages/account/AccountPage.tsx` inside `RoleLayout` | RequireAuth + RequireOnboarded, both roles |
| `/projects` | `pages/ProjectsPage.tsx` | ENGINEER, `AppLayout` |
| `/projects/:id` | `pages/ProjectDetailPage.tsx` | ENGINEER |
| `/projects/:id/plans/:planId` | `pages/PlanDetailPage.tsx` | ENGINEER |
| `/projects/:id/bom/edit` (`?planId=` optional) | `pages/BomEditorPage.tsx` | ENGINEER |
| `/projects/:id/quotation` (`?planId=&planName=` optional) | `pages/QuotationPage.tsx` | ENGINEER |
| `/projects/:id/quotation/material/:itemId` | `pages/MaterialOffersPage.tsx` | ENGINEER |
| `/projects/:id/quotation/:offerId` | `pages/QuotationDetailPage.tsx` | ENGINEER |
| `/orders` | `pages/orders/OrdersPage.tsx` | ENGINEER |
| `/orders/:orderBatchId/success` | `pages/orders/OrderSuccessPage.tsx` | ENGINEER |
| `/orders/:orderBatchId/providers` | `pages/orders/OrderPerProviderPage.tsx` | ENGINEER |
| `/supplier` | redirect -> `/supplier/requests` | SUPPLIER, `pages/supplier/SupplierLayout.tsx` |
| `/supplier/requests` | `SupplierRequestsPage status="SENT"` "Solicitudes recibidas" | SUPPLIER |
| `/supplier/requests/accepted` | same, `CONFIRMED`, "Solicitudes aceptadas" | SUPPLIER |
| `/supplier/requests/rejected` | same, `REJECTED`, "Solicitudes rechazadas" | SUPPLIER |
| `/supplier/requests/:purchaseOrderId` | `SupplierRequestDetailPage.tsx` | SUPPLIER |
| `/supplier/requests/:purchaseOrderId/contact` | `SupplierRequestContactPage.tsx` | SUPPLIER |
| `/supplier/catalog/products` | `SupplierCatalogPage.tsx` | SUPPLIER |
| `/supplier/catalog/manage` | `SupplierCatalogImportPage.tsx` (import wizard) | SUPPLIER |
| `/supplier/catalog/link` | `SupplierCatalogLinkPage.tsx` (canonical linking) | SUPPLIER |

There is no 404 catch-all route: an unknown URL renders an empty `<Routes>`.
Route and UI identifiers are mixed: `/cuenta` and `/confirmar-email` are Spanish, everything else is English.

Navigation shells:
- Engineer (`components/layouts/AppLayout.tsx`): collapsible shadcn sidebar (`AppSidebar.tsx`) with only **Proyectos**
  and **Pedidos**, a "Nuevo proyecto" button, and the account menu at the bottom (`SidebarAccountMenu.tsx`: "Mi cuenta",
  "Cerrar sesión"). `AppTopBar.tsx` holds breadcrumbs. `NewProjectModal` is mounted globally.
- Supplier (`components/layouts/supplier-nav.ts`, `SupplierSidebar.tsx`): **Solicitudes** (Recibidas / Aceptadas /
  Rechazadas) and **Catálogo** (Productos / Gestión de productos / Vinculación).
- `RoleLayout.tsx` picks one of the two for `/cuenta` (the only shared screen).

---

## 2. Journeys by role

### 2.1 Public and auth

**Landing** (`pages/LandingPage.tsx`, `components/landing/*`, own stylesheet `styles/landing.css`): hero diagram, audience
switch (engineer / supplier), boards showcase, CAD symbol art, steps. CTAs to `/login` and `/register`.

**Register** (`components/auth/register/RegisterForm.tsx`, `hooks/auth/useRegisterForm.ts`): single screen — "Nombre y
apellido", email, password, "Repetir contraseña" -> "Crear cuenta" / "Creando cuenta". Side sheet: "Tu plano, ya contado."
Validations: "Ingresá tu nombre.", "Ingresá un correo válido.", "Las contraseñas no coinciden.", password rule
"Debe contener al menos 8 caracteres, una mayúscula y un número." (`hooks/auth/authValidation.ts`). Duplicate email:
"Ese email ya tiene una cuenta." + link "Iniciá sesión con esa cuenta".

**Login** (`components/auth/login/*`): "Iniciar sesión — Entrá con la cuenta de tu equipo." Panel tagline "Del plano a la
orden de compra." Button disabled until fields are filled. Error alerts (`components/auth/shared/AuthFormAlert.tsx`):
credentials invalid ("Revisá el correo y la contraseña, e intentá de nuevo."), "Sin conexión con el servidor — No pudimos
llegar a liard…", "Demasiados intentos — Esperá unos minutos antes de volver a probar." (429 handled distinctly on
purpose, `lib/api.ts isTooManyRequestsError`). After a reset: "Contraseña actualizada — Entrá con tu contraseña nueva."

**Recovery**: "Recuperar contraseña" -> "Enviar enlace" -> "Si hay una cuenta con ese email, mandamos un enlace… El enlace
vence en una hora." (no account enumeration). Reset with a dead token: "Este enlace ya no sirve".

**Email change confirmation** (`/confirmar-email`): states "Enlace incompleto / A este enlace le falta el código",
"Correo confirmado", "No pudimos confirmar el correo", "Esa dirección ya está en uso", "El enlace no sirve más".

**Onboarding**
1. `/onboarding/role` — "¿Cómo vas a usar liard?" Two cards (`lib/auth/role-options.ts`): **Soy Usuario** ("Querés
   cotizar, comparar proveedores y gestionar los pedidos…") and **Soy Proveedor** ("Estás en Argentina y querés llegar a
   más compradores…"). Rule: role can change until the profile is complete; **then it is fixed**.
2. `/onboarding/profile` — "Bienvenido a liard. Completá tu perfil para empezar. Son dos pasos obligatorios y uno que podés
   dejar para después." Stepper (`components/auth/onboarding/ProfileWizard.tsx`, fields in `lib/auth/profile-fields.ts`):
   - ENGINEER: *Tus datos* (Cargo, Teléfono) -> *Tu empresa* (Nombre de la empresa, CUIT, Sitio web optional, Provincia,
     Ciudad) -> *Tus proveedores* (optional; pick favourite providers from `GET /providers`). Copy states the favourites
     "no se guarda en tu perfil ni afecta cómo se ordenan tus cotizaciones" — **the step is cosmetic today.**
   - SUPPLIER: *Tus datos* -> *Tu empresa* (+ "Rubros que vendés", "Solo te llegan pedidos de los rubros que marques.") ->
     *Tu perfil de venta* (optional: Descripción corta, Marcas que representás, Zonas de entrega, Pedido mínimo en pesos,
     Plazo de entrega habitual en días hábiles).
   Validations (`lib/auth/profile-validation.ts`): "Completá este campo.", "Ingresá un teléfono válido.", "Ingresá una URL
   válida.", "El CUIT no es válido.", "Ingresá solo números." 24 Argentine provinces hard-coded.

**Account** (`/cuenta/:section`): sections ENGINEER `perfil | empresa | marcas | seguridad`, SUPPLIER
`perfil | empresa | preferencias | seguridad` (`pages/account/AccountPage.tsx`). *Marcas* = account-level brand rules
(`components/account/BrandPreferencesCard.tsx`: "Marcas preferidas — En orden: cuando varias cotizan lo mismo, gana la de
arriba." + blocked brands). *Seguridad*: change password ("Contraseña actualizada. Las otras sesiones quedaron cerradas.",
"La contraseña nueva tiene que ser distinta de la actual."), change email with pending state and cancel, and "Dar de baja la
cuenta" which requires typing exactly **`ELIMINAR`** (`service/api/users.ts DELETE_ACCOUNT_CONFIRMATION`).

### 2.2 Engineer ("Usuario")

**Step 1 — Projects list** (`pages/ProjectsPage.tsx`, `components/project/ProjectsGrid.tsx`, `ProjectCard.tsx`): subtitle
"Tus obras y sus tableros, con el estado de cada plano a la vista." Card grid + "Iniciar Nuevo Proyecto" card. Toolbar:
search "Buscar proyectos...", status popover (Todos los estados / Listo / En Proceso / Pendiente / Requiere Atención / Sin
Planos — `types/project.types.ts ProgressLabel`), date range popover, "Limpiar filtros". Filters live in the URL
(`hooks/project/useProjectFilters.ts`). Empty: "No hay proyectos activos todavía"; no match: "Sin resultados". A
**FirstStepsChecklist** ("Primeros pasos": Creá un proyecto / Subí la tabla de referencia y los planos / Procesá los planos y
revisá la lista / Cotizá y emití los pedidos) can be hidden. Delete project from the card (Cypress pins that the modal copy
must not promise deleting plans/BOMs).

**Step 2 — New project** (`components/project/NewProjectModal.tsx`): name required, max 100 chars; description max 500.

**Step 3 — Project workspace** (`pages/ProjectDetailPage.tsx`, `components/project/workspace/*`):
- **Reference table card** (`ReferenceTableCard.tsx`): the client's symbol legend DXF. Optional — "Sin ella los planos se
  procesan igual, con los nombres estándar en vez de los del cliente". Only `.dxf` accepted ("Solo se permiten archivos .dxf
  para la tabla de referencia."). Upload file, or crop it out of a plan (`CropReferenceTableModal.tsx`, embeds the DXF
  viewer), view, download, replace, delete.
- **Plans panel** (`PlansPanel.tsx`): "Cada plano del proyecto es un tablero." Upload dialog (`UploadPlansDialog.tsx`) offers
  two paths: "Ya tengo un archivo por tablero" (pick `.dxf`/`.pdf`, drag-drop onto the list) or "Tengo un plano con varios"
  -> **Recortar tableros** (`components/plan/DxfGeneratorModal.tsx`, the crop viewer). Limits
  (`utils/uploadPlansValidation.ts`): **max 15 plans per upload, max 10 PDFs**; PDFs are converted to DXF on upload
  ("Convirtiendo el PDF a DXF. Puede tardar unos segundos.").
- Plan rows: status badge (`components/project/PlanStatusBadge.tsx`): `COMPLETED` "Listo", `PROCESSING` "En Proceso",
  `ERROR` "Error", `STALE` "Por revisar", `PENDING` "Pendiente". Processable = PENDING, ERROR, STALE (`lib/planStatus.ts`);
  action label "Procesar" / "Reintentar" / "Procesando". Row menu: Ver página de detalles, **Editar repeticiones…**
  (multiplier 1–1000, `plan-variations/shared/planMultiplierForm.ts`; a board repeated N times counts N times), Abrir visor
  rápido, Descargar BOM del plano, Descargar DXF / PDF original, Eliminar plano. Badge on rows with unidentified symbols.
- **Bulk processing** (`hooks/project/useBulkPlanProcessing.ts`): select plans -> process-all (202, queued); progress bar
  "Procesando tanda / Planos en espera / Progreso de extracción"; "Cancelar los planos que todavía no empezaron a
  procesarse" (`DELETE /project/:id/processing-batch`). Messages: "Ya hay una tanda en curso; se sigue esa.", "No hay planos
  para procesar.", "No quedaba nada encolado para cancelar." Status is polled (`refetchInterval` in
  `service/queries/project.queries.ts`, `plan.queries.ts`).
- **Consolidated BOM** (`components/project/BomSummaryTable.tsx`): "BOM Consolidado", "Material / Especificación", export
  Excel/CSV, "Editar BOM" / "Configurar BOM", "Solicitar cotización" / "Ver cotización" / "Volver a cotizar". Empty: "Sin BOM
  consolidado — Procesá al menos un plano…". Partial: "Hay planos procesándose: el BOM todavía no está completo."
- **Project brand rules** (`ProjectBrandPreferencesModal.tsx`, "Marcas del proyecto"): preferred (ordered, override account)
  and blocked brands for this obra; shows the merged "Lo que termina valiendo en esta obra".
- **Quote gate** (`ProjectDetailPage.tsx` lines 42–68, `hooks/project/bomSummaryPresentation.ts`) — "Solicitar cotización"
  refuses, in order:
  1. no computed BOM — "No hay un BOM computado en el proyecto. Procesá al menos un plano primero."
  2. plans still processing — "Hay planos procesándose actualmente. Esperá a que finalicen."
  3. zero materials
  4. lines without brand or specification — "Faltan definir marcas o especificaciones en el BOM. Primero definilas en el editor."
  5. unresolved symbols — "Hay símbolos sin resolver en los planos. Resolvelos o descartalos en el visor CAD antes de cotizar."

**Step 4 — Plan detail** (`pages/PlanDetailPage.tsx` -> `components/plan-variations/layouts/PlanLayoutV5_InteractiveInspector.tsx`,
the only surviving "V5" of an earlier variations experiment). Header with breadcrumbs, status badge, multiplier field (saved
on blur, reverted if the server refuses), pager "1 / 2" with ←/→ shortcuts. Two tabs:
- **Visor CAD** (`components/plan/PlanDxfViewer.tsx`, three.js/dxf-viewer in-page): zoom, fit ("F"), fullscreen,
  **Detecciones** toggle overlays detected boxes (`PlanDetectedComponentBoxes.tsx`) and unidentified boxes
  (`PlanUnidentifiedBoxes.tsx`). Clicking a box opens `DetectedSymbolPanel` ("Símbolo seleccionado", "Qué leyó el detector",
  "En qué fila cuenta", "Corregir símbolo" / "Abrir el corrector completo"). A box that no row counts opens read-only.
  Loading copy: "Descargando plano CAD…", "Analizando entidades geométricas…", "Preparando vista 2D…"; timeouts "El plano
  DXF demoró demasiado en procesarse."
- **Cómputo BOM** (`plan-variations/layouts/inspector/PlanBomTab.tsx`): per-plan table (Material / Código Técnico,
  Especificación Técnica, qty), "Total de unidades", inline "Editar especificación" (material and spec cannot be empty),
  export, "Editar BOM" (-> editor with `?planId`), "Ver en el plano" (-> symbol locator), "Solicitar cotización" for the plan.
- **Símbolos CAD sin resolver** (`plan-variations/shared/UnmappedSymbolsCard.tsx`): grouped rows of symbols the detector
  could not map; select many -> "Asignar material" (`BatchResolveSymbolsDialog`: Especificación Técnica, "Cantidad por
  símbolo" > 0, placeholders "Ej: Guardamotor GV2P16") or "Descartar símbolo (no computar)". Concurrency: 409 -> "No se
  descartó nada: otro usuario ya resolvió o descartó alguno de los símbolos seleccionados…".
- Symbol **reclassify** with a backend preview ("Así queda la fila", "Ya existe esa fila: se suman", "Esto parte la fila en
  dos / Partir la fila", "Está bien, siguiente").

**Step 5 — BOM editor** (`pages/BomEditorPage.tsx` -> `components/bom-editor/BomEditorWorkspace.tsx`, `useBomEditor.ts`
1089 lines, `saveBomEditor.ts`). Scope: project, or one plan via `?planId`. Two views (`shared/ViewModeToggle.tsx`):
"Por planos — Recorre plano por plano, con lo que cada uno aporta al BOM" (`layouts/by-plan/*`: board list "Tableros del
proyecto", board panel, footer nav) and "Por componentes — Lista todos los componentes del proyecto, con el detalle del
elegido" (list + `layouts/BomEditorInspector.tsx`: "Origen y Trazabilidad en Planos", Material en Catálogo, Especificación
Técnica, Componente base, Precio unitario / Precio por la cantidad).
- Per line: material (catalog combo or free text "Material fuera de catálogo"), specification, brand ("Cualquier marca — El
  proveedor propone el equivalente más conveniente", or a brand not in catalog "Pedir esta marca aunque no esté en el
  catálogo"), **gama** (sub-brand range; "Cualquier gama"), quantity with ± and "Restaurar cantidad detectada",
  "Detectado en planos:" traceability, canonical panel "Componente base" (reading status: "Leyendo componente…", "No es un
  componente base", "Tiene todos los atributos esenciales.").
- Line diagnosis (`bomEditorLogic.ts ISSUE_DEFS`, `shared/lineState.ts`): state **Bloquea la cotización / Se puede cotizar con
  reparos / Lista**.
  - BLOCKER: `NO_MATERIAL` "Falta material", `NO_QUANTITY` "Sin cantidad", `NO_SPEC` "Falta especificación", `NO_BRAND`
    "Falta decidir marca". Only the first three block **saving** (`SAVE_BLOCKING_CODES`); `NO_BRAND` blocks only quoting.
  - WARNING: "Material fuera de catálogo", "Especificación libre", "Marca fuera de catálogo", "Posible duplicado", "Faltan
    atributos esenciales".
  - INFO: "Especificación a criterio del proveedor", "Cantidad editada".
- Filter chips (`filterChips.ts`): No se guardan, Sin marca, Sin especificación, Sin cantidad, Con observaciones. Search
  "Buscar material o especificación…".
- Bulk: multi-select, `BulkActionBar` "Aplicar marca a las líneas seleccionadas" (incompatible brands excluded),
  **Asignación rápida** per board (`QuickBrandDropdown`), **Aplicar mis preferidas** (fills brandless lines with the
  preferred-brand rules). Blocked brands: "Las marcas bloqueadas dejan de ofrecerse. Lo que ya está guardado en el BOM no
  cambia." (a warning, not a rejection — pinned by Cypress). Keyboard: duplicate/delete lines.
- Save: "BOM guardado correctamente." / "No hay cambios nuevos para guardar."; optimistic lock -> "Alguien más editó una de
  las líneas que estás guardando. Recargá la página…". Leaving dirty: `UnsavedChangesDialog` "Tenés cambios sin guardar".
  "Guardá los cambios del BOM antes de cotizar." then "Solicitar cotización" (`hooks/bom/useBomEditorQuote.ts`: "BOM
  verificado y confirmado. Cotización generada."). Degraded modes: "No hay proveedores importados: el editor abre sin
  catálogo ni precios de referencia."
- Symbol locator (`components/bom-symbol-locator/*`): from a line, walk every symbol that produced it on the plan (←/→),
  "Leé la especificación en el plano y corregila", zoom +/−/0.

**Step 6 — Quotation / allocation** (`pages/QuotationPage.tsx` -> `components/quotation-workspace/layouts/QuotationWorkspaceLayout.tsx`).
Title "Cotización · Adjudicación de Materiales". States (`components/quotation/QuotationStateCard.tsx`): "No hay cotización
vigente" + "Generar cotización"; "Sin ofertas de proveedores"; "Todavía no hay proveedores con catálogo"; load error.
- Matrix (`table/QuotationMatrixTable.tsx`): rows = materials, columns = suppliers, cells = offers; per-cell brand/gama
  variant selector ("Clic para cambiar la variante").
- Optimization toolbar (`shared/OptimizationToolbar.tsx`): Estrategia **Múltiples Proveedores / Único Proveedor**;
  Optimizar **Más Barato / Más Rápido / Mayor Cobertura** (single-supplier picks the cheapest/fastest with 100 % coverage).
  Table toolbar: availability (Todos / Solo con stock / Sin stock en proveedores), quick filters (Mostrar Todos / Top 3 Más
  Baratos / Top 3 Más Rápidos / Selección Manual). "Adjudicar todo" to one supplier with a coverage/impact confirm dialog
  ("Se adjudicarán todos los materiales… que cuenten con stock confirmado en este distribuidor", reassignment notice).
- HUD (`summary/QuotationStatusHUD.tsx`): Cobertura, Estado, Distribuidores, Monto total; "Sin adjudicar" filter.
- Material drawer (`shared/ComponentIntelligenceDrawer.tsx`) and a full page per material (`MaterialOffersPage.tsx`).
- Offer detail per supplier (`QuotationDetailPage.tsx`, `components/quotation/*`): priced lines (flags "PRECIO DESACT.",
  "NO CATALOGADO", "REVISION MANUAL"), uncatalogued items box, emit from here with warning: "Emitir desde acá usa la
  cotización entera: una cotización admite un solo pedido…".
- `?planId` only **filters the view** ("Cotizando únicamente componentes del plano: … Ver cotización de todo el proyecto →");
  the quote is always project-wide.
- **Allocations and selected variants are kept in `sessionStorage`** (`hooks/quotation/quotationSessionStorage.ts`, keys
  `liard.quotation.allocations.<quoteId>`), not on the server — closing the tab loses the allocation.
- Emit (`shared/ExecuteOrderAction.tsx`, `components/order/confirm-order/ConfirmOrderDialog.tsx`): disabled with "Adjudicá al
  menos un ítem para ejecutar la orden"; dialog "Emitir solicitud a proveedores", "N pedidos · M ítems", "Enviar solicitud".
  **One quote admits one order**; afterwards "Esta cotización ya tiene un pedido emitido" + "Ver pedido".

**Step 7 — Orders** (`pages/orders/*`, `components/order/*`): success page "La solicitud se envió correctamente" (Materiales
enviados, Proveedores contactados, Total estimado; next steps "Respuesta del proveedor — puede confirmar o rechazar",
"Contacto habilitado — Si confirma, compartimos sus datos…"). `/orders`: stats (En espera / Confirmados / Rechazados /
Vencidos), toolbar (project filter, search "Buscar pedido, proyecto o tablero...", sort Más recientes / Más antiguos / Mayor
monto), table, pagination. Scope label "Tablero puntual" vs "Proyecto completo". Per-provider page: provider list + detail
("Qué le pediste a cada proveedor y cómo viene respondiendo.") or "Pedido completo" (all lines, sorted by provider, partial
load warning). Order status badges (`OrderStatusBadge.tsx`): EN ESPERA / CONFIRMADO / RECHAZADO / VENCIDO.

### 2.3 Supplier ("Proveedor")

1. **Requests inbox** (`SupplierRequestsPage.tsx`, grid of `SupplierRequestCard`: Nombre del cliente, Nro de solicitud,
   Precio total estimado). Tabs by status via the sidebar. Filters: search, date range, price range ("El precio desde no puede
   ser mayor que el precio hasta.").
2. **Request detail** (`SupplierRequestDetailPage.tsx`): summary card + lines table (Código de producto…). Actions **Aceptar
   solicitud** ("se compartirán tus datos de contacto con el solicitante") / **Rechazar solicitud** ("el solicitante va a
   verla como rechazada y no vas a poder responderla de nuevo"). No partial accept, no reason field. 409 -> "Esta solicitud
   ya fue respondida o venció su plazo." After accept: "Ver contacto".
3. **Client contact** (`SupplierRequestContactPage.tsx`): only after accepting ("Los datos del cliente se comparten cuando
   aceptás la solicitud."). **Preferred channel, schedule, notes, WhatsApp and Instagram are hard-coded mock data**
   (`components/supplier/fixtures/supplier.fixtures.ts mockSupplierContactDetails`, used at line 131) — every client shows
   "Lun a Vie · 9:00 a 18:00", WhatsApp 541112345678, @liard.oficial.
4. **Catalog — Productos** (`SupplierCatalogPage.tsx`, `SupplierCatalogTable.tsx`): table Producto / Código de producto /
   Marca / Componente base / Precio / Estado / Acciones, page size 20. Add/edit product modal
   (`SupplierCatalogItemModal.tsx`: código, nombre, precio + moneda required — "Usá punto para los decimales", up to 14
   integers + 4 decimals; optional vigencia "Hasta cuándo vale este precio", Código de la marca, gama, plazo mín/máx días).
   Publish / unpublish ("Producto despublicado. Seguí viéndolo con el filtro Todos."). Price freshness: "Precio vencido",
   "Actualizado hoy/ayer". Banner "Tenés N productos sin componente base" -> "Ir a vincular". Empty: "Tu catálogo está vacío
   — … Sin ítems en el catálogo no vas a recibir pedidos."
5. **Catalog — Gestión de productos** (import wizard, `SupplierCatalogImportPage.tsx`, `hooks/supplier/useCatalogImportWizard.ts`,
   `components/supplier/catalog-import/*`): steps **Elegir planilla -> Revisar la lectura -> Confirmar**. Choose header row
   and number format ("1.234,56 — coma decimal" / "1,234.56 — punto decimal"), map columns to attributes or a fixed default
   ("Valor fijo para toda la planilla"), preview via backend; verdict **Planilla aceptada / Aceptada con advertencias /
   Planilla rechazada**; checks such as "Todos los artículos declaran su marca", "Los códigos repetidos son pocos". Import
   **replaces** the catalog (`CatalogReplaceWarning`). Result "Catálogo actualizado — Tu lista de precios ya es la que ven
   los ingenieros al cotizar." History "Cargas anteriores".
6. **Catalog — Vinculación** (`SupplierCatalogLinkPage.tsx`, `components/supplier/canonical-link/*`): background AI reading
   progress ("Leyendo tu catálogo", Productos leídos / No se pudieron leer / Por leer, Tiempo restante; polled); overview by
   state (Sin identificar / Les falta un atributo / Sin vincular / No se pudo leer); per-product sheet: component type +
   attribute slots ("Fuera del estándar", "Sin valor"), autosave ("Cada cambio se guarda solo."), "Siguiente pendiente".
   Manual links are kept across re-imports ("…a mano: una nueva carga del catálogo no lo cambia.").

---

## 3. Domain rules the UI enforces (keep these through a redesign)

1. Role chosen once; locked when the profile is complete. Engineer and supplier never share screens except `/cuenta`.
2. A plan = a tablero. Upload max 15 files (10 PDFs); PDF converts to DXF server-side. Reference table is DXF only and optional.
3. Plan lifecycle PENDING -> PROCESSING -> COMPLETED | ERROR | STALE ("Por revisar" = plan changed, reprocess). Only
   PENDING/ERROR/STALE are processable; processing is queued and polled, one batch at a time per project, cancellable
   while not started.
4. Board multiplier 1..1000; quantities in the consolidated BOM are multiplied.
5. Unresolved/unidentified symbols must be assigned or discarded before quoting.
6. BOM line rules: material + quantity > 0 + specification needed to save; brand decision (a brand, or "Cualquier marca")
   also needed to quote. Specification "Sin preferencia" = supplier's choice.
7. Brand rules: account preferred (ordered) and blocked; project rules override account. Blocked brands stop being
   offered but existing BOM values are untouched and saving is not blocked.
8. Optimistic concurrency on BOM saves and symbol edits (409 -> reload message).
9. A quote can only be generated when no plan is processing and the BOM is saved/clean.
10. Quote is project-wide; one quote -> one order batch -> one purchase order per provider.
11. Supplier: accept or reject whole request, once; contact data shared only after accept; requests can expire (VENCIDO).
12. Catalog import replaces the whole catalog; manual canonical links survive re-imports; unpublished products are hidden
    from engineers.

---

## 4. API calls vs backend routes

Method + path extraction over `front/src/**` (`apiClient.<verb>(...)`) against every `@Controller` + `@Get/@Post/...` in
`back/src/**/controller/*.ts` (path params normalised).

- Front calls: 84 (in 13 files under `service/api/`). Backend routes: 86.
- **Front calls with no backend route: none.** Every frontend call matches a route.
- One call is not through `apiClient`: `getBomTileImageUrl` (`service/api/electrical-plan.ts:109`) builds
  `/api/electrical-plan/:id/bom/tile-image/:n` as a string, **but no component uses it** (dead helper). The standalone
  viewer (`dxf-viewer/main.ts:257`) uses `fetch(url)` for a URL the host passes in.
- **Backend routes with no frontend caller:**
  | Route | Note |
  | --- | --- |
  | `GET /quotation/:projectId/:quoteId` | front only uses `/current` and `/offers/:id` |
  | `PATCH /canonical-catalog/components/:id` | |
  | `GET /project/:projectId/electrical-plan` | plans come inside `GET /project/:id` |
  | `DELETE /project/:projectId/electrical-plan/:planId` | front deletes via `DELETE /electrical-plan/:id` |
  | `GET /electrical-plan/:id` | front uses the project-scoped `GET /project/:id/electrical-plan/:planId` |
  | `GET /providers/catalog/unlinked` | link page uses `GET /providers/catalog/items` with filters |
  | `GET /electrical-plan/:id/bom/tile-image/:n` | only the unused URL helper above |

Front call inventory by area: auth (11 routes under `/auth/*`), users (`/users/me` PATCH x2, DELETE; brand prefs
GET/PUT), project (list, detail, create, delete, `bom` GET/PUT/export, reference-table POST/DELETE/file/crop,
processing-status, process-all, processing-batch DELETE, brand-preferences GET/PUT, market-data), electrical-plan (upload,
crop, detail, PATCH, delete, process, file, source, export, `bom/components` PUT, `bom/symbols/review`, reclassify +
preview, unidentified PATCH/DELETE, market-data), bom-catalog, canonical-catalog (types, components GET/POST, one by id),
quotation (POST, current, offer detail), orders (list, providers, provider detail, confirm), supplier requests (list,
detail, contact, accept, reject), provider catalog (summary, currencies, items CRUD, canonical PUT/DELETE, reading GET/PUT,
imports GET/POST, preview), providers directory.

---

## 5. Visual system today

- **Stack**: Tailwind v4 (`@import "tailwindcss"`, tokens in `styles/index.css`, 558 lines), `tw-animate-css`, shadcn
  (`front/components.json`: style `radix-luma`, baseColor `mist`, icons `lucide`), Radix primitives in `components/ui/`
  (alert-dialog, badge, breadcrumb, button, card, checkbox, dialog, dropdown-menu, input, popover, scroll-area, select,
  separator, sheet, sidebar, skeleton, switch, table, tabs, textarea, tooltip, custom toast). TanStack Query, Zustand,
  three.js via `dxf-viewer`.
- **Fonts**: Inter Variable (body and headings; `--heading` = `--sans`), JetBrains Mono 400–700 (`font-mono` used 176
  times — codes, quantities, labels); `font-heading` used 10 times.
- **Colour**: background `#F4F4FC` (bluish off-white, hex on purpose for P3/sRGB consistency), cards white, primary
  `#0058BE` (blue), secondary greys `#E2E5EC/#CDD2DC/#AEB6C4`, semantic tokens `--success`, `--warning` (+ solid/surface
  variants), `--destructive`; greyscale chart tokens; BOM-table tokens (`--bom-material` = primary). Leftover Vite starter
  vars (`--accent-bg: rgba(170,59,255,.1)` purple, `--code-bg`, `--social-bg`). Radius base `0.625rem`.
- **Dark mode**: a `.dark` block exists (`index.css:329`) but nothing toggles it.
- **Layout**: full-height sidebar + scroll inset; content widths vary per page (`max-w-7xl` in quotation, others differ).
  Landing has a separate stylesheet and visual language (`styles/landing.css`, 534 lines).

What feels weak (evidence-based):
- Token discipline leaks: 279 raw palette utilities (`bg-/text-/border-` + slate/gray/zinc/blue/amber/emerald/red/green)
  outside the semantic tokens, e.g. `SupplierRequestStatusBadge.tsx` uses `green-500` while orders use `--success`.
- Radius drift: `rounded-lg` 133, `rounded-2xl` 112, `rounded-xl` 108, `rounded-md` 64, `rounded-[3px]` 32, plus
  `rounded-3xl/[2rem]/[2px]/[4px]` — no card/control radius scale.
- Inconsistent capitalisation of copy: Title Case ("Iniciar Nuevo Proyecto", "Solicitar Cotización", "Múltiples
  Proveedores", "Requiere Atención") next to sentence case ("Solicitar cotización", "Subir planos"); ALL CAPS badges
  ("EN ESPERA", "NO CATALOGADO", "PRECIO DESACT.").
- Vocabulary drift for the same concept: plano / tablero / plan; "Usuario" (role card) vs "ingeniero" (copy) vs ENGINEER;
  proveedor / distribuidor; pedido / solicitud / orden de compra; "Cómputo BOM" / "BOM Consolidado" / "Lista de
  materiales"; "Visor CAD" vs "Visor Rápido CAD 2D".
- Very dense expert screens: BOM editor (two views, inspector, bulk bar, filters, quick assign, preferred brands) and the
  quotation matrix (two strategy axes + availability filter + quick filters + HUD + drawer + per-material page) layer
  controls rather than guide a decision.
- Some copy is jargon/marketing that reads as filler ("Motor Three.js WebGL", "Renderizando entidades CAD en WebGL...",
  "Drawer de Inteligencia de Componentes", "proveedores oficiales").
- Mock data shipped in the real UI (supplier contact channels, see 2.3.3); onboarding "Tus proveedores" step saves
  nothing; allocation lives only in `sessionStorage`.
- No 404 route; no dark mode despite tokens; no mobile layout for the heavy screens (only `use-mobile.ts` hook for the
  sidebar).

---

## 6. Cypress coverage (`front/cypress/e2e/`, 28 specs, ~260 `it`)

Specs stub the API with `cy.intercept` for most flows (fixtures in `cypress/fixtures/`: sessions per role, catalog
previews, `minimal-plan.dxf`, `plan-with-symbols.dxf`, `catalogo-proveedor.xlsx`); CI runs them against a real backend.

| Spec | Journey covered |
| --- | --- |
| `landing-page` (8) | landing sections, nav to login/register |
| `app-navigation-and-session` (4) | sidebar navigation, session, landing |
| `auth-and-onboarding` (21) | login validation/401/429/network, register, recovery, email confirm, route guards, onboarding role+profile |
| `onboarding-favoritos` (9) | "Tus proveedores" step |
| `user-account` (22) | `/cuenta` tabs per role, brand rules, password, email change + cancel, delete with `ELIMINAR`, onboarding redirect |
| `projects-flow` (11) | list, filters, NewProjectModal, plan 404 |
| `project-delete` (10) | delete project, copy guard, 409, double-click single DELETE |
| `project-not-found` (6) | 404 and 500 states |
| `project-detail-actions` (8) | plan list/search, delete plan modal, quote pre-validations |
| `project-plan-row-layout` (6) | plan rows, multiplier from row menu, invalid multiplier |
| `project-plan-pdf` (6) | PDF plans |
| `project-bom-refresh` (1) | consolidated BOM refresh |
| `project-brand-preferences` (7) | project brand rules modal |
| `plan-detail` (27) | header/pager/multiplier, tabs, BOM tab, unidentified symbols, quote pre-validation, inline spec edit, locator, symbol correction incl. 409 |
| `bom-editor-views` (8), `bom-editor-por-plano` (12), `bom-editor-por-plano-edicion` (14) | two views, per-board editing, bulk brand, gama, shortcuts, quick assign, multiplier |
| `bom-editor-actions` (4) | unsaved-changes guard, bulk bar, save errors |
| `bom-editor-autocompletado-marcas` (8), `bom-editor-marcas-preferidas` (5) | preferred-brand autofill, blocked brands (warning, not rejection) |
| `quotation-flow` (10) | quotation states, workspace, confirm dialog, emit success/500, offer detail |
| `quotation-matrix-interactions` (3) | drawer, allocate-all dialog, search/filters |
| `quotation-multibrand` (7) | brand/gama variants |
| `orders-engineer` (11) | `/orders`, success page, per-provider page |
| `supplier-requests` (9) | inbox, detail accept/reject, contact |
| `supplier-catalog` (6), `supplier-catalog-management` (5) | product list, CRUD |
| `catalog-import-wizard` (10) | import wizard accepted/warned/rejected |

Note: the project's `CLAUDE.md` says "23 specs"; `dev` has 28.

Not covered by Cypress: `SupplierCatalogLinkPage` (canonical linking; only the link to it is asserted), `MaterialOffersPage`
beyond the navigation to it (`quotation-multibrand.cy.ts:304`), the DXF crop flows
(`DxfGeneratorModal`, `CropReferenceTableModal`) and the standalone viewer (guarded instead by `npm run verify:crop` and
Vitest in `front/tests/dxf-viewer/`).

---

## 7. `src/dxf-viewer/` — the standalone crop tool

A second Vite entrypoint (`front/dxf-viewer.html`, `dxf-viewer/main.ts` 533 lines), no React, state held at module level
in `main.ts`. Built on `dxf-viewer` + three.js with a worker (`core/dxf.worker.ts`).

What it does: load a DXF (drag-drop, file picker, or a URL/content sent by the host), separate model/paper spaces
(`core/dxfSpaces.ts`), repair references and prune blocks, then let the user **draw rectangular zones** ("Seleccionar zona",
"Arrastrá para dibujar la zona · Botón derecho para mover · Rueda para acercar", `ui/toolCopy.ts`), name each panel
(`core/panelNaming.ts`), keep or drop the frame, queue several (`core/panelCropManager.ts`, `ui/croppedPanelsView.ts`),
and export. Load steps shown: "Leyendo el archivo / Separando espacios / Interpretando el DXF / Preparando la escena".
It is **not** the symbol locator (that lives in React, `components/bom-symbol-locator/`).

Host protocol (`dxf-viewer/ui/parentMessages.ts`, host side `hooks/dxf/useDxfIframeMessages.ts`):
- Host -> viewer: `LOAD_DXF_URL`, `LOAD_DXF_CONTENT` (`main.ts:474-480`). Embedded mode via `?embedded=1` (or being in an
  iframe) toggles `.is-embedded` styling.
- Viewer -> host: one `DXF_CROPS_DONE` per batch with `crops: [{ filename, bounds{minX,maxX,minY,maxY}, keepFrame }]` —
  rectangles only, no bytes; and `CLOSE_MODAL` (host also accepts `CLOSE_DXF_MODAL` and Escape). Host checks
  `event.origin === window.location.origin`.
- The host then sends the rectangles to the backend (`POST /project/:id/electrical-plan/crop` for boards,
  `POST /project/:id/reference-table/crop` for the legend), which crops via the detector's `/dxf/crop`. The host enforces
  `MAX_PLANS_PER_UPLOAD` (15) on the batch (`components/plan/DxfGeneratorModal.tsx:57`), matching the backend's 15-zone cap.
- Embedded by `components/plan/DxfGeneratorModal.tsx` ("Editor de Recorte de Tableros DXF": "Subí el plano DXF que contiene
  los tableros" or "O elegí un plano ya cargado en el proyecto") and `components/project/CropReferenceTableModal.tsx`
  ("Editor de Recorte de Tabla de Referencia DXF").

---

## 8. Glossary (verbatim UI vocabulary)

Domain nouns: Proyecto / obra, Plano, Tablero, Tabla de referencia, Símbolo (CAD), Detecciones, BOM / Cómputo BOM /
BOM Consolidado / Lista de materiales, Línea, Material, Especificación (técnica), Marca, Gama, Componente base, Atributos
esenciales, Repeticiones (multiplicador), Cotización, Oferta, Adjudicación / adjudicar, Distribuidor, Proveedor, Pedido,
Solicitud, Orden de compra, Catálogo, Planilla, Vinculación, Lectura (del catálogo).

Statuses:
- Plan: Listo · En Proceso · Error · Por revisar · Pendiente (CAD tab also "Error CAD").
- Project: Listo · En Proceso · Pendiente · Requiere Atención · Sin Planos.
- BOM line: Bloquea la cotización · Se puede cotizar con reparos · Lista.
- Order / supplier request: EN ESPERA · CONFIRMADO · RECHAZADO · VENCIDO (filters: En espera, Confirmados, Rechazados, Vencidos).
- Catalog item link: Sin identificar · Les falta un atributo · Sin vincular · No se pudo leer (reading PENDING/READ/FAILED; link UNLINKED/AUTO/MANUAL).
- Catalog import verdict: Planilla aceptada · Aceptada con advertencias · Planilla rechazada.
- Quote line flags: PRECIO DESACT. · NO CATALOGADO · REVISION MANUAL · Sin adjudicar · Sin asignar.

Choice labels: Cualquier marca · Cualquier gama · Sin preferencia · Material fuera de catálogo · Pedir esta marca aunque no
esté en el catálogo · Múltiples Proveedores / Único Proveedor · Más Barato / Más Rápido / Mayor Cobertura · Por planos /
Por componentes · Soy Usuario / Soy Proveedor.

Primary actions: Crear cuenta · Iniciar sesión · Iniciar Nuevo Proyecto · Subir planos · Recortar tableros · Subir tabla ·
Procesar / Reintentar · Editar repeticiones… · Editar BOM / Configurar BOM · Aplicar mis preferidas · Asignación rápida ·
Asignar material · Descartar símbolo · Corregir la fila / Partir la fila · Solicitar cotización / Generar cotización / Volver
a cotizar · Adjudicar todo · Emitir solicitud a proveedores / Enviar solicitud · Ver pedido · Aceptar solicitud / Rechazar
solicitud · Ver contacto · Cargar planilla · Confirmar importación · Agregar producto · Despublicar producto · Ir a
vincular · Siguiente pendiente · Dar de baja la cuenta.

Recurring tone: voseo rioplatense ("Subí", "Elegí", "Revisá", "Volvé a intentar en unos minutos"), errors say what happened
and what is preserved ("la cotización queda como estaba", "Las páginas ya cargadas se conservan").
