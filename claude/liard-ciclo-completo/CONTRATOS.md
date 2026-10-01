# Contratos compartidos · galería «liard · ciclo completo»

Carpeta: esta. Todo lo de abajo es obligatorio para cada subagente. Lo fija el coordinador; si algo no alcanza, se pide en
`notes/<área>.md` → «Pedidos al coordinador» y mientras tanto se resuelve en los archivos propios del área.

## 1. Archivos compartidos (solo lectura para los subagentes)

| Archivo | Qué es |
| --- | --- |
| `tokens.css` | tokens reales de `front/src/styles/index.css` (dev). No se agregan colores sueltos en pantallas. |
| `ui.css` | componentes en CSS plano: shell, `.card`, `.btn` (`pri out ghost dan ok ai`, `sm xs lg pill icon block`), `.inp`, `.search`, `.seg` (selector de variantes), `.chip`, `.st` (estado: `ok pr er wa gr sk vi`), `.ost` (pedido: `SENT CONFIRMED REJECTED EXPIRED PARTIAL COUNTER`), `.bdg`, `.org` (origen: `det inf reg man`), `.tbl` + `.bom` (`.mat .spec .qty`), `.kpis/.kpi`, `.tri`, `.bar`, `.note` (`info warn bad ok ai`), `.ai-tag`, `.src`, `.cost`, `.tabs`, `.list/.li`, `.timeline/.tl`, `.empty`, `.skel`, `.dlg`, `.sheet .pnl`, `.menu`, `.toast`, `.cmdk`, `.cad`, `.cad-tb`, `.box` (`ok wa er fx ds`), `.switch`, `.drop`, `.tag-existe/.tag-s4/.tag-s5/.tag-h1/.tag-h2/.tag-h3/.tag-nuevo`, `.money`, `.lbl`, `.mono`. |
| `icons.js` | 1790 íconos lucide reales (`window.LUCIDE`). Usar `L.icon('nombre-kebab')` o `<span data-icon="nombre">`. Íconos que usa la app: `folder-kanban shopping-cart clipboard-list library-big panel-left plus refresh-cw circle-check triangle-alert circle-alert clock upload download trash-2 eye tag scissors layers search sparkles`. |
| `data.js` | `window.B`: semilla ficticia. `usuarios`, `empresa`, `proyectos` (p1 es la obra principal), `planos` (de p1), `lineas` (BOM consolidado de p1, 18 líneas con estados reales), `proveedores` (4 distribuidores), `ofertas[lineaId][provId] = {precio, stock, plazo, codigo, actualizado, vence}`, `pedidos` (lotes PED → órdenes OC por distribuidor), `tableros` (4 tableros físicos), `tgbt` (composición por filas para 3D/frente/armado), `cambio` (dólar BNA 1540, IVA 21), `consumoIA`, `avisos`. |
| `app.js` | runtime `window.L` (ver §3). |
| `gallery.js`, `gallery.css`, `index.html` | la galería. La arma el coordinador a partir de `sections/*.js`. |
| `vendor/three.global.js` | three.js r161 + OrbitControls como `window.THREE` (funciona por file://). |
| `tools/qa.mjs` | QA automático (§7). |
| `_plantilla-d.html`, `_plantilla-m.html` | ejemplo mínimo de pantalla de escritorio y de teléfono. **Copiá su estructura.** |

## 2. Estructura de una pantalla

```html
<!doctype html>
<html lang="es">
<head><meta charset="utf-8"><meta name="viewport" content="width=1440"><!-- 390 en teléfono -->
<title>Título · liard</title>
<link rel="stylesheet" href="ui.css"><!-- + css propio del área si hace falta: <area>.css -->
</head>
<body data-role="ing" data-active="proyectos" data-h="s4"
      data-crumbs="Proyectos|d-ing-proyectos.html>Hospital Regional Cañuelas · Pabellón B"
      data-title="…" data-sub="…">
<div id="act"><!-- acciones del encabezado --></div>
<main id="page"><!-- contenido --></main>
<script src="icons.js"></script><script src="data.js"></script>
<!-- opcional: <script src="data-<área>.js"></script> -->
<script>window.MOCK = { init() { /* render + eventos; corre después de armar el shell */ } };</script>
<script src="app.js"></script>
</body></html>
```

- Teléfono: `<body class="m" data-role="obra|ing|prov" data-tabs="obra|ing|prov|none" data-active="m-…" data-back="…">`.
- `data-role`: `ing` (empresa de ingeniería/tablerista; incluye presupuesto, compras, taller, dirección), `prov` (distribuidor), `cli` (vista pública sin shell, p. ej. la página que abre el QR del tablero).
- `data-user`: clave de `B.usuarios` para el pie de la barra (por defecto `martina` / `julian`). Usalo para que cada pantalla la "use" el rol correcto (`sofia` en compras, `ramiro` en taller, `hernan` en dirección, `lucas` en presupuesto, `carla` en catálogo).
- `data-h` = horizonte de **la pantalla** (`existe s4 s5 h1 h2 h3`) → píldora abajo a la izquierda. Dentro de una pantalla, marcá las partes que ya existen con `<span class="tag-existe">existe</span>` y las nuevas con `<span class="tag-nuevo">Nuevo</span>` o `.tag-s5`, etc.
- Estados por query param: `?estado=vacio|cargando|error|limite|sin-ia`, `?vista=<variante>`, `?dialogo=<id>`, `?linea=l09`. Una pantalla cubre varios marcos.
- Variantes con los mismos datos: `<div class="seg" data-param="vista" data-default="tabla"><button data-vista="tabla">Tabla</button><button data-vista="guiada">Guiada</button>…</div>` (cambia `?vista=` y recarga; `L.q('vista')` para leerla). Variantes típicas: guiada / experta / asistida por IA / visual (3D o plano) / tabla.

## 3. Runtime `L` (app.js)

`L.icon(n, cls)` · `L.get('lineas')` / `L.set('pedidos.0.ordenes.1.status', 'CONFIRMED')` / `L.update(s => { … })` / `L.on(fn)` (re-render cuando cambia el estado, incluso desde otra pestaña) · `L.toast(título, {type: success|error|warning|info|loading, desc, action, onAction})` · `L.dialog({title, desc, icon, body, wide, actions: [{t, cls, icon, fn}]})` (`fn` devuelve `false` para no cerrar: validación) · `L.sheet(html, {label})` (panel lateral; en teléfono, hoja desde abajo; cerrar con `[data-x]`) · `L.go(href)` · `L.param(k, v)` · `L.q(k)` · `L.ars(n)` (`$ 1.234.567`), `L.usd`, `L.num(n, dec)`, `L.pct`, `L.fecha('2026-10-01')` (`01/10/2026`), `L.fechaCorta`, `L.esc` (escapar SIEMPRE lo que viene de datos) · `L.MARCO` (true dentro de la galería).
Declarativos: `[data-href]` navega; `[data-tabs]` + `[data-tab]` / `[data-panel]` dentro de un `[data-tabs-scope]`; `.switch[aria-checked]` alterna solo; `[data-cmdk]` abre la paleta ⌘K. Los `<a href>` internos conservan `marco=1` solos.

## 4. Estado compartido (lo que un área escribe y otra lee)

El estado vive en `localStorage['liard-cc:v1']` fuera de la galería y en memoria dentro de los marcos. «Reiniciar demo» lo borra.

| Quién escribe | Clave | Quién lee |
| --- | --- | --- |
| A, B | `lineas[i].attrs`, `.faltan`, `.estado` (`ready warning blocked`), `.marca`, `.gama`, `.org` (pasa a `man` si lo corrige una persona), `.comprar`, `.motivo` | B, C (cotización), E (faltantes del taller) |
| A | `planos[i].status`, `.sinId`, `.mult` | A, B, F (inicio) |
| C | `compra = { estrategia, adjudicadas: { [lineaId]: provId } }`, `presupuesto = { margen, manoObra, validez, … }` | C, F |
| C, D | `pedidos[k].ordenes[j].status` (`SENT CONFIRMED REJECTED EXPIRED`), `.contra = { lineas: [{ linea, cambio: 'precio'|'plazo'|'equivalente'|'parcial', antes, despues, nota }], estado: 'pendiente'|'aceptada'|'rechazada' }` | C, D, E (entregas) |
| E | `tableros[i].estado` (`armado ensayo frenado listo entregado`), `.avance`, `.frena`, `recepciones` | E, F |
| todos | `avisos.unshift({ id, t, d, i, tipo: ok|vi|er|wa|pr, cuando: 'recién', href })` | F (avisos, inicio) |
| cada área | `x.<área>.*` para su estado privado | solo esa área |

Reglas de dominio que no se rompen: el precio se guarda **sin IVA** (el IVA se muestra como cálculo de presentación rotulado); el matching es por **componente base + atributos esenciales** (todo match es `CANONICAL` 100 %; sin componente base o con un esencial vacío → `NOT_FOUND` con motivo; nunca un SKU inventado); cantidad **dibujada** ≠ cantidad **a comprar** (× repeticiones del plano, + reserva por regla); el contacto del comprador se ve recién cuando el distribuidor confirma; los pagos van por fuera de la plataforma (solo se factura la suscripción y la comisión por lead).

## 5. Diseño

- Mismo ciclo y lenguaje que la app real: lienzo `#F4F4FC`, tarjetas blancas borde `#E2E5EC` radio 18, un solo azul `#0058BE`, estados emerald/amber/rose/sky, Inter para la interfaz y **JetBrains Mono para todo lo técnico** (códigos, cantidades, precios, la tabla del BOM). Labels en mayúsculas chicas con tracking (`.lbl`). Densidad alta: no hay tipografía gigante dentro de la app.
- Mejorá donde ayude, sin cambiar de marca: jerarquía más clara, paneles laterales (`L.sheet`) en vez de saltos de página, ⌘K, atajos de teclado visibles, estados vacíos que enseñan, movimiento con las curvas reales (`--ease-drawer` 260 ms, `--ease-out-expo`, 150/200 ms), siempre con alternativa 2D/tabla y respetando `prefers-reduced-motion`.
- IA: siempre `.ai-tag`, fuentes (`.src` que lleva al plano/línea/catálogo), marca «inferido» (`.org.inf`), costo (`.cost` en US$) y tope, confirmación antes de ejecutar, y **un camino manual** cuando la IA no está (`?estado=sin-ia`).
- Copy en español rioplatense ("Subí", "Revisá", "Cotizá"), en el vocabulario del rubro: tablero, TGBT, seccional, termomagnética, diferencial, caja moldeada, contactor, guardamotor, bornera, riel DIN, gabinete, cómputo, BOM, OC, remito, lista de precios, bonificación, plazo de entrega, «+IVA», dólar BNA, protocolo de ensayos (IEC 61439 / AEA 90364-7-771). Nada en inglés en la UI. Nada de lorem ipsum, `undefined` ni `NaN`.
- Cada pantalla tiene que poder recorrerse: botones que hacen algo (cambia el estado, abre un panel, muestra un toast, navega). Nada de botones muertos.

## 6. La sección de la galería (`sections/<área>.js`)

```js
(window.SECCIONES ||= []).push({
  id: 'bom-3d', orden: 250,               // A 100–199 · B 200–299 · C 300–399 · D 400–499 · E 500–599 · F 600–699
  etapa: 'Fabricación',                   // Ingeniería | Presupuesto | Compras | Fabricación | Obra | Mantenimiento | Comercial | Plataforma
  horizonte: 'h2',                        // existe | s4 | s5 | h1 | h2 | h3 (de la funcionalidad)
  roles: ['ing', 'tal'],                  // ing pres comp tal obra dir prov cli
  refs: ['Roadmap S5 · BOM alternativo'], // de dónde sale (doc, entrevista, competidor)
  titulo: 'Tablero 3D vinculado al BOM', corto: 'Tablero 3D',
  descripcion: 'Las reglas del comportamiento, no los píxeles…',
  existe: 'Qué de esto ya está en dev (si algo).',
  reglas: ['Regla 1', 'Regla 2'],
  estados: [['Sin WebGL', 'd-bom-3d.html?estado=sin-3d'], ['Vacío', 'd-bom-3d.html?estado=vacio']],
  marcos: `
    d|d-bom-3d.html|Vista 3D seleccionable|Clic en un aparato → su línea del BOM
    d|d-bom-3d.html?vista=frente|Frente 2D con cotas|Misma selección, sin WebGL
    m|m-tal-tablero.html|En el taller, desde el teléfono|
  `,
});
```

2 a 4 marcos por sección. Entre todas las secciones de un área: al menos un vacío, un cargando, un error y un límite.

## 7. QA obligatorio antes de terminar

```sh
node tools/qa.mjs d-<área>- m-<área>- --shots shots/qa/<área>
node tools/qa.mjs "d-<área>-x.html?estado=error"    # cada estado
```

Tiene que dar `✓` en todas (sin errores de consola, sin desborde horizontal, sin inglés/undefined/NaN, controles con nombre, `lang=es`). **Mirá cada PNG** con la herramienta Read y corregí lo que se vea mal (texto cortado, solapes, vacíos raros, contraste). Probá a mano al menos un recorrido completo con Playwright (clic → cambia el estado → otra pantalla lo refleja).

## 8. Navegación ya cableada (no cambiar nombres de archivo)

Barra lateral `ing`: Inicio `d-pla-inicio.html` · Proyectos `d-ing-proyectos.html` · Presupuestos `d-com-presupuesto.html` · Pedidos `d-com-pedidos.html` · Taller `d-tal-taller.html` · Obras y entregas `d-tal-entregas.html` · Mantenimiento `d-tal-mantenimiento.html` · Automatizaciones `d-pla-automatizaciones.html` · Equipo y permisos `d-pla-equipo.html` · Plan y consumo `d-pla-plan.html` · «Nuevo proyecto» `d-ing-carga.html`.
Barra lateral `prov`: Inicio `d-prov-inicio.html` · Recibidas/Aceptadas/Rechazadas `d-prov-solicitudes.html[?estado=aceptadas|rechazadas]` · Productos/Gestión/Vinculación `d-prov-catalogo.html[?vista=importar|vincular]` · Listas y sincronización `d-prov-integraciones.html` · Vidriera y demanda `d-prov-vidriera.html` · Leads y facturación `d-prov-leads.html`.
⌘K: `d-pla-asistente.html`, `d-ing-carga.html`, `d-com-escenarios.html`, `d-bom-3d.html`.
Teléfono `ing`: `m-pla-inicio.html` · `m-com-aprobar.html` · `m-pla-avisos.html` · `m-pla-asistente.html`. `obra`: `m-tal-hoy.html` · `m-tal-recibir.html` · `m-tal-tablero.html` · `m-pla-avisos.html?rol=obra`. `prov`: `m-prov-solicitudes.html` · `m-prov-responder.html` · `m-pla-avisos.html?rol=prov`.
Otros enlaces entre áreas conocidos: `d-ing-proyecto.html` (detalle de la obra), `d-ing-plano.html?plano=<id>` (visor y revisión), `d-bom-editor.html?linea=<id>`, `d-com-cotizacion.html`, `d-com-recotizar.html`, `d-prov-solicitudes.html?oc=<id>`, `d-tal-protocolo.html?tablero=<id>`.
