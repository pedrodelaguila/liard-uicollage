# LIARD — sistema visual real (para reproducir en HTML/CSS)

Tomado del código de `dev` (`front/src/styles/index.css`, `components/ui/*`, `components/layouts/*`, `components/shared/*`, los
badges de estado) y de las capturas en `shots-app/` (renders reales con la API mockeada). Los tokens están en `tokens-reales.css`.

## Carácter general

- Herramienta de ingeniería, clara y sobria: lienzo `#F4F4FC` (gris con un tinte azul apenas visible), tarjetas blancas con borde
  `#E2E5EC`, un solo color de marca **azul `#0058BE`**. El resto del color sale de los estados: emerald, amber, rose y sky.
- Dos tipografías: **Inter** para la interfaz y **JetBrains Mono** para todo lo "técnico": códigos (SM-1001, PED-2026-014), fechas
  en tarjetas, cantidades, la tabla del BOM, especificaciones, placeholders y labels de los formularios de auth. Hay 176 `font-mono` y
  128 `tabular-nums` en la app.
- Labels de sección en MAYÚSCULAS chicas con tracking ancho (`text-2xs` 11px, `uppercase tracking-wider`, 101 usos): "TABLA DE
  REFERENCIA", "EN ESPERA", cabeceras de tabla "PEDIDO / PROYECTO / ESTADO".
- Tamaños más usados: `text-xs` (422), `text-sm` (325), `text-2xs` (244). Densidad alta, nada de tipografía gigante dentro de la app;
  el `h1` de pantalla es `text-2xl font-bold tracking-tight` (unos 27px) dentro de `PageShell` (`px-6 py-8 sm:px-8`, `gap-6`).

## Shell de la aplicación

- **Sidebar izquierda** blanca, 16rem, borde derecho `#E2E5EC`. Se pliega a un riel de **3.5rem** (`⌘B`, la cookie `sidebar_state` la
  recuerda) con `cubic-bezier(0.32,0.72,0,1)` en 260ms; las etiquetas se van con `max-width` y opacidad 160ms, y la marca con
  `grid-template-columns 1fr→0fr`.
  - Cabecera: el lockup "liard" (SVG, `currentColor` azul, h-6) + botón de plegar (`PanelLeft`); plegada, la marca se convierte en el
    botón. Ingeniero: botón ancho **"+ Nuevo proyecto"** (primary, rounded 4px, h-9) debajo.
  - Navegación del ingeniero: Proyectos (`FolderKanban`), Pedidos (`ShoppingCart`). El ítem activo: fondo `primary/10`, texto primary
    y **barra derecha de 4px primary** (`border-r-4`), esquinas rectas.
  - Navegación del proveedor: grupos plegables con chevron: **Solicitudes** (Recibidas, Aceptadas, Rechazadas) y **Catálogo**
    (Productos, Gestión de productos, Vinculación); el subítem activo es una píldora `primary/10` con texto primary.
  - **Pie**: borde arriba, avatar circular 40px primary con iniciales blancas en bold (`SessionAvatar`: fallback `bg-primary
    text-2xs font-bold`), nombre en `text-sm font-medium`, rol debajo en muted ("Ingeniero" / "Proveedor"), y un chevron arriba/abajo
    que abre el menú de cuenta (`SidebarAccountMenu`).
- No hay topbar en escritorio. Debajo de `md` aparece `AppTopBar` (h-12, `bg-background/95 backdrop-blur`) solo con el botón que abre
  la barra como Sheet.
- Las páginas de detalle llevan breadcrumb arriba ("Proyectos › Planta Norte") y las acciones a la derecha del título
  ("Marcas del proyecto", outline).

## Superficies y componentes

- **Tarjeta** de la app: blanca, `border #E2E5EC`, radio entre `rounded-xl` y `rounded-2xl` (14 a 18px), sombra mínima
  (`shadow-2xs`/`shadow-xs`). La card de shadcn es más redonda (`rounded-4xl`, 26px, `shadow-md ring-1 ring-foreground/5`) y es la
  que se ve en Cuenta y en las tarjetas de solicitudes del proveedor.
- **Botones**: primary sólido `#0058BE` texto blanco (hover `/80`), outline (borde + fondo blanco, hover muted), ghost, destructive
  suave (`destructive/10` con texto destructive). Alturas: xs 24, sm 32, default 36, lg 40px. Radio `rounded` (4px) en shadcn, aunque
  varias pantallas los hacen píldora (`rounded-full`: CTA de landing, "Agregar producto"). Deshabilitado: opacidad 50% (se ve celeste,
  como "Iniciar sesión" vacío).
- **Inputs**: shadcn = h-9, `rounded-3xl` (22px), sin borde, fondo `input/50` gris claro, foco con ring primary/30 de 3px (Cuenta,
  filtros del proveedor). Los buscadores de la app (`SearchInput`) son barras blancas de ancho completo con lupa a la izquierda,
  `rounded-xl`/`rounded-full` y una X para limpiar; el de planos muestra el atajo `/`. Los formularios de auth son rectos (borde 1px,
  radio chico), icono a la izquierda, placeholder en mono, label mono mayúscula con tracking ("CORREO", "CONTRASEÑA").
- **Badges de estado** (`rounded-full`, h-6, `text-xs font-semibold`, icono de 14px):
  - Plano: Listo `bg-emerald-500/10 text-emerald-600` + CheckCircle2 · En Proceso `bg-primary/10 text-primary` + RefreshCw girando ·
    Error `bg-rose-500/10 text-rose-600` + AlertTriangle · Por revisar `bg-amber-500/10 text-amber-600` + AlertCircle ·
    Pendiente `bg-muted text-muted-foreground` + Clock.
  - Pedido (vista del ingeniero, `rounded-md text-2xs` mayúsculas): EN ESPERA amber-100/700, CONFIRMADO green-100/700, RECHAZADO
    red-100/700, VENCIDO gray-100/500.
  - Solicitud (vista del proveedor, outline h-7): Recibida primary, Aceptada green-500, Rechazada destructive, Vencida muted.
  - Catálogo: "Leyendo…" (primary/5 con un punto que hace `animate-ping`), "No se pudo leer" (destructive), "Sin identificar"
    (`warning-surface` + texto warning-foreground).
  - Proyecto: "Listo" (emerald), "Requiere Atención" (rose), "Sin Planos" (gris), con un punto de color delante.
  - Contadores: `CountPill` / "3 PEDIDOS" en píldora `primary/10`; `×2` (repeticiones) como chip chico primary; los filtros de chip
    ("Todos 5", "Listos 3") llevan el número en mono chico, y el activo es primary sólido.
- **Barra de progreso tricolor** en las tarjetas de proyecto y en el panel de planos: segmentos emerald (listos), primary (en
  proceso), rose (error) y gris (espera), de 6px con extremos redondeados; se repite como línea de 3px bajo la cabecera de "Planos".
- **Tablas**: cabecera `bg-muted` con texto muted, 13px, peso 500 (en las de pedidos y catálogo va en mayúsculas `text-2xs`); filas
  separadas por borde 1px, hover `muted/50`. La **tabla del BOM** (`.bom-table`) es toda mono 14px: el material en azul bold 700, la
  especificación debajo en muted, y la cantidad en una columna derecha bold `tabular-nums` (centrada en "A comprar"). En la
  matriz de cotización la primera columna es sticky y opaca (`warning-surface` cuando hay aviso).
- **KPIs / stats**: grupos de celdas en una sola tarjeta separadas por bordes verticales, número grande mono/bold con su label debajo
  (BOM Consolidado: "6 Componentes", "3/5 Tableros listos", "3 Sin identificar" en amber). En Pedidos van con punto de color + label
  mayúscula + número de color + descripción chica ("1 sin respuesta").
- **Dialogs**: overlay `bg-black/60`, contenido centrado `max-w-lg rounded-2xl border bg-card p-6 shadow-xl`, entra con fade +
  zoom-95 en 200ms, X arriba a la derecha. **Sheets** (por ejemplo `CatalogItemSheet`): overlay `bg-black/30` + `backdrop-blur-sm`,
  panel lateral derecho de 3/4 de ancho (o fijo en sm), `shadow-xl`, `duration-200 ease-in-out`.
- **Dropdown / popover**: `rounded-xl border bg-popover p-1 shadow-md`, ítems `rounded-lg px-2 py-1.5 text-sm`, fade + zoom-95 +
  slide-in-from-top-2. **Tooltip**: `rounded-xl bg-foreground text-background text-xs px-3 py-1.5` (negro) con flecha; en la sidebar
  muestra el atajo en muted ("⌘B").
- **Tabs**: shadcn píldora (`rounded-full p-1`, el activo `bg-background`); Cuenta usa tabs de texto (Perfil / Empresa / Marcas /
  Seguridad). El import del catálogo usa un stepper de 3 pasos (círculo numerado; el activo en píldora `primary/10`, unidos por líneas
  finas).
- **Toasts** propios (`components/ui/toast`, store Zustand): abajo a la derecha, se apilan y se expanden al pasar el mouse
  (`transform 350ms cubic-bezier(0.16,1,0.3,1)`), con una barra de progreso (`toast-progress`) y variantes default / info / success /
  warning / error / loading. Duran 2s, 3s (warning) o 4s (error), más tiempo si el texto es largo o hay una acción.

## Carga y vacíos

- **Skeletons**: `animate-pulse rounded-2xl bg-muted` (80 `<Skeleton>`), un esqueleto por pantalla: `ProjectDetailSkeleton`,
  `PlanDetailSkeleton`, `QuotationDetailSkeleton`, `FullOrderLoading`. Spinner `animate-spin` (43 usos, `Loader2`/`RefreshCw`)
  dentro de los botones mientras trabajan ("Procesando...").
- **Estado vacío genérico** (`shared/EmptyState`): centrado, `py-16`, un círculo de 56px `bg-muted` con el icono, título
  `text-lg font-semibold` y descripción `text-sm` muted. Hay variantes ricas: `ProjectsEmptyState` (grilla de feature cards),
  `OrdersEmptyState`, `PlansEmptyStates`, `PlanEmptyNotice`, `LocatorStates` ("Buscando los símbolos…", "Sin símbolos ubicados",
  "No se pudo cargar el plano"), una "Iniciar Nuevo Proyecto" con borde punteado como última tarjeta de la grilla, y el dropzone de
  importación (borde punteado `rounded-2xl`, icono en un cuadrado gris, "Arrastrá tu planilla o elegila del disco").
- **Errores / 404**: `ProjectNotFound`, `PlanNotFound`, `ProjectLoadError` (Volver / Reintentar), "Solicitud no encontrada",
  "Oferta no encontrada", `QuotationStateCard`. Copy de error en rose; el error de un plano va en la fila, en mono, truncado.
- **Paneles "elegí algo"**: tarjeta con borde punteado y un icono centrado ("Elegí un producto de la lista" + "Ir al primer pendiente").

## Visor DXF / detecciones

- Toolbar del visor: h-10, `bg-muted/40`, borde abajo; botones h-7.5 con texto mono `text-xs`, `rounded-md`, borde `border/60`,
  `shadow-2xs`, separadores de 1×16px.
- Cajas de detección (`absolute rounded-[3px] border-2`): identificada `border-emerald-600 bg-emerald-500/5`, por revisar
  `border-amber-500 bg-amber-400/5`, error/seleccionada `border-rose-600 bg-rose-500/5` (+ `ring-2 ring-rose-500 ring-offset-1`), foco
  del localizador `border-sky-500 bg-sky-400/10` con un velo de foco `shadow-[0_0_0_9999px_rgba(15,23,42,0.28)]`, descartada
  `border-dashed border-slate-400`. El hover agrega `ring-2 ring-primary/60`.
- El overlay de carga del visor es `bg-background/85 backdrop-blur-xs` con una barra fina (h-1, w-56, `rounded-full`, relleno primary
  con transición de 200ms).
- El visor standalone (`dxf-viewer.html`) tiene su propio set: `--bg-app #F5F6F8`, cobalt `#0058BE` / hover `#00479E` / active
  `#00367A`, `--ease-cad cubic-bezier(0.16,1,0.3,1)`, 150 y 250ms.

## Movimiento (resumen)

- Duraciones: 150ms la base (44 usos, hovers y colores), 200 (dialogs y menús), 260 (sidebar), 300 (toasts), 500 (el panel de
  pedido por proveedor con `cubic-bezier(0.22,1,0.36,1)`), 700 y 1100 a 1400ms solo en la landing.
- `prefers-reduced-motion` respetado: `motion-reduce:transition-none` (9), `motion-safe:animate-*`, y el sidebar baja a 0ms.
- Feedback de "trabajando": spin en el icono del badge, el ping de "Leyendo…", y en la lectura del catálogo `catalog-reading-scan`
  (el icono sube y baja) junto con `catalog-reading-sheen` (un brillo que recorre la barra).

## Pantallas públicas (otro registro)

- Landing: fondo `#f6f7fc` con glows azules difusos que se mueven solos (`landing-drift`, 26s), titular enorme negro con la última
  línea en azul ("Del tablero / al proveedor, / **en un solo circuito.**", `tracking -0.04em`), CTA píldora con el gradiente
  `#0058be→#04407f` y sombra azul, un botón secundario blanco con borde, y la nav centrada.
- Auth: un panel azul sólido `#0058BE` con un unifilar dibujado en líneas blancas finas y etiquetas mono (Q1, M1, "3~ 380 V"), y el
  formulario sobre blanco. Registro: todo azul, con una "LISTA DE MATERIALES" mono a la izquierda y la tarjeta blanca recta con sombra.
  Recuperar contraseña: una banda azul arriba con grilla blueprint y la tarjeta blanca centrada encima.

## Capturas (`shots-app/`, 1440×994, Vite dev con `/api` interceptado por Playwright y datos inventados)

`01-landing`, `01b-landing-full` (página completa), `02-login`, `03-register`, `04-forgot-password`, `10-eng-projects`,
`11-eng-project-detail`, `12-eng-orders`, `13-eng-account`, `20-sup-requests`, `21-sup-catalog-products`, `22-sup-catalog-manage`,
`23-sup-catalog-link`. Cosas raras en las capturas: en `21` dice "undefined productos publicados" porque al summary que mockeé le falta `itemsCount` (lo lee `hooks/supplier/supplierCatalog.ts`), y la columna Precio queda cortada por el scroll horizontal de la tabla a 1440px. En `20` la tarjeta pone `projectName` bajo el label "Nombre del cliente": eso es de la app (`SupplierRequestCard.tsx:38`), no del mock. En `11` "Configurar BOM" está deshabilitado porque hay un plano procesando.
No se capturaron Plan detail, BOM editor ni Cotización: necesitan muchas más respuestas mockeadas (DXF, market-data, comparativa).
