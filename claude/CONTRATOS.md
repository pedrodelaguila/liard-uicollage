# liard horizon · contratos compartidos

Prototipo local, datos ficticios. Auditado contra `lab3-liard` rama `dev` @ `04fc8139`. El repo es solo lectura.
Investigación en `research/01..05-*.md` — leé la de tu área antes de diseñar.

## Propiedad de archivos

| Archivo | Dueño |
| --- | --- |
| `tokens.css`, `ui.css`, `app.js`, `data.js`, `index.html`, `CONTRATOS.md`, `tools/pw.js`, `vendor/` | **coordinador** (no editar) |
| tus `d-*.html` / `m-*.html` / `tools/tests/<area>.test.js` / `notes/<area>.md` | vos, exclusivo |

¿Te falta algo en lo compartido (función de dominio, ícono, token, campo de datos)? **No lo edites**: implementalo local en tu
página si es de presentación, o escribilo en `notes/<area>.md` sección «Pedidos al coordinador» con la firma exacta. Si una
función de `app.js` tiene un bug, anotalo ahí con cómo reproducirlo.

## Página

```html
<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>liard · …</title><link rel="stylesheet" href="ui.css"><script src="data.js"></script><script src="app.js"></script>
<!-- 3D: <script src="vendor/three.global.js"></script> → window.THREE (r161). Sin OrbitControls: hacé tu propio orbit. -->
</head>
<body data-role="ENGINEER|SUPPLIER" data-active="<id de L.pages>" data-title="…" data-sub="…" [class="m" en móvil]>
<div id="act"><!-- acciones del encabezado (opcional) --></div>
<div id="page"> … </div>
<script> L.ready(() => { … }); </script></body></html>
```

- El shell (barra lateral / barra inferior móvil, topbar, avisos, ⌘K, menú Demo con «Reiniciar demo») lo arma `app.js`.
- `L.pages` define ids y archivos: usá exactamente esos nombres. Pantallas de obra reciben `?p=<projectId>`; usá
  `L.currentProjectId()`. Para links internos usá `L.link('d-bom.html', { p })` (conserva `p`, `full`, `bare`).
- Marcos de la galería: `?frame=<id>` da a esa página un estado propio sembrado desde cero (y `L.link` lo conserva); «abrir» usa el estado compartido.
- Estados en query params: `?estado=vacio|cargando|error|limite`, `?v=<variante>`, `?dialogo=…`. Todo estado que muestre
  la galería se tiene que poder abrir por URL.
- Se prueba por `http://` (el arnés levanta un servidor) y tiene que funcionar también por `file://`: nada de `type=module`, fetch
  de archivos locales, ni CDN (salvo Google Fonts ya importada en tokens).

## Estado y dominio (`app.js`)

`L.store.get()` devuelve el estado; `L.store.update(s => { … })` lo muta, guarda en localStorage y avisa a esta página y a las
demás (evento `storage`) → **suscribite con `L.store.subscribe(render)`** para que los cambios de otra pantalla/iframe se vean.
Nunca guardes datos de dominio en otro lado. Preferencias de interfaz (filtros, vista): `L.pref('area:clave', valor)`.

Lecturas: `L.project(id)`, `L.plansOf(pid)`, `L.plan(id)`, `L.linesOf(pid)`, `L.line(id)`, `L.type(typeId)`, `L.supplier(id)`,
`L.member(id)`, `L.who(id)`, `L.unidentifiedOf(pid)`, `L.requestsOf(pid)`, `L.request(id)`, `L.offersOf(rid)`, `L.offer(rid,sid)`,
`L.ordersOf(pid)`, `L.commentsOf(entity)`, `L.myNotifications()`.

Reglas (espejo de la app real, **no las cambies**):
- `L.effectiveBrandRules(pid)` → `{preferred, blocked, account, project}`: cuenta (`s.company.brandRules`) + obra; la obra pisa. Una solicitud guarda `altSnapshot[lineId]` con la alternativa permitida de cada línea.
- `L.qtyDrawn(l)` dibujada · `L.qty(l)` a comprar (× repeticiones del tablero). `L.lineLabel(l)`, `L.attrText(typeId, attrs)`.
- `L.lineIssues(l)` → `[{code,text,blocks}]`. Bloquea: marca sin decidir (`brand: null`; `'ANY'` = «Cualquier marca») o cantidad 0.
  Falta de atributo esencial no bloquea, pero cotiza `NOT_FOUND` con `L.unmatchedReason(l)`.
- `L.blockers(pid)` → lo que impide pedir cotización (planos procesando, símbolos sin identificar, BOM vacío, líneas bloqueadas).
- Matching **por igualdad**: `L.matches(line, supplierId?)` = mismo componente base + mismos atributos esenciales; la marca filtra
  solo si la línea pide una. Nunca por texto. `L.referenceQuote(pid)` = precios de catálogo (referencia, no confirmados).
- Planos: estados `PENDING|PROCESSING|COMPLETED|ERROR|STALE` (`L.planStatusLabel/Tone`). `L.processPlans(ids, {fail, durationMs})`,
  `L.cancelProcessing(id)` (solo antes de arrancar), `L.jobProgress(plan)`; `L.tick()` corre solo cada 1 s y completa trabajos.
  Un 504 de detección no se reintenta solo. Repeticiones 1–1000.
- Símbolos: `L.resolveSymbol(uid, { lineId } | { typeId, attrs } | { discard: true })`. Líneas: `L.updateLine(id, patch)`.
- Solicitud → oferta → comparación → adjudicación → pedido:
  `L.createRequest({projectId, supplierIds, lineIds, deadline, note, alternativesAllowed})` ·
  `L.prefillOffer(rid, sid)` (desde el catálogo del distribuidor, disponibilidad sin confirmar) · `L.saveOffer(oid, patch)` ·
  `L.validateOffer(o)` · `L.submitOffer(oid)` → `{ok, errs}` · `L.declineOffer(oid, motivo)` · `L.simulateOffer(rid, sid)` (solo demo) ·
  `L.setEquivalence(oid, lineId, 'APROBADA'|'RECHAZADA')` · `L.compare(rid)` · `L.allocate(rid, 'BARATO'|'RAPIDO'|'UNICO')` ·
  `L.allocationSummary(rid, alloc)` · `L.validateAward` · `L.award(rid, alloc)` → `{ok, orders}` | `{needsApproval, approval}` ·
  `L.decideApproval(apId, 'APROBADA'|'RECHAZADA', nota)` · `L.respondOrder(oid, 'CONFIRMED'|'REJECTED', motivo)` (una sola vez).
  Estructura de línea de oferta: `{lineId, mode: CATALOGO|AJUSTADO|ALTERNATIVA|SIN_OFERTA, brand, code, refPrice, unitPrice,
  stock: CONFIRMADO|PARCIAL|A_PEDIDO|DESCONOCIDO, stockQty, leadDays, alt: {typeId, attrs, brand, gama, code, unitPrice, equivalence:
  SUGERIDA|APROBADA|RECHAZADA, reason}}`.
- Presupuesto: `L.materialCost(pid)` (pedido > oferta vigente > referencia, con procedencia), `L.budget(pid, override)`,
  `L.scenarios`, `L.saveBudget(pid, patch)`, `L.boardsOf(pid)`.
- IA (simulada, nunca llamadas reales): `L.aiState()`, `L.aiCan(usd)`, `L.aiSpend(kind, usd, pid, ref)` → false si pasa el límite.
- Colaboración: `L.addComment(entity, pid, text)` (entity `line:<id>`, `plan:<id>`, `request:<id>`); `s.activity`, `s.approvals`,
  `s.automations`, `s.notifications`, `s.outbox` (correos simulados). Para escribir avisos/correos/actividad desde tu página usá
  `L.store.update(s => { L._notify(s, {...}); L._mail(s, to, asunto, cuerpo); L._log(s, pid, who, texto); })`.

## UI (`ui.css` + helpers)

Componentes: `.btn(.btn-primary|secondary|ghost|danger|volt)(.btn-sm|lg)`, `.icon-btn`, `.field > label + .input|.select|.textarea`,
`.switch`, `.seg`, `.chip[aria-pressed]`, `.card(.card-h|b|f)`, `.kpi`, `.meter(.ok|warn|err)>i`, `.badge.b-*`, `.tbl` en `.tbl-wrap`,
`.tabs`, `.note(.note-warn|err|ok|ai)`, `.empty`, `.skel`, `.stage` (escenario oscuro), `.hud`, `.steps li(.done|.cur)`, `.tl`,
`.list/.list-i`, `.grid.g2|g3|g4`, `.split`, `.row`, `.col`, `.eyebrow`, `.num`, `.mono`.
Helpers: `L.icon(name, size)` (ver `L.icons`), `L.badge(text, tone, icon)`, `L.cap('existe'|'planificado'|'propuesto')`,
`L.sim('Detección simulada')`, `L.ai()`, `L.srcTag(DETECTOR|RULE|MANUAL)`, `L.priceTag(referencia|oferta|pedido|sinPrecio)`,
`L.toast(msg, {kind, detail, action})`, `L.dialog({title, body, actions, wide})`, `L.confirm(t, texto, label, kind)`,
`L.fieldError(input, msg|null)`, `L.sortable(table, (key, dir) => …)`, `L.empty({icon,title,text,action})`,
`L.variants(host, [{id,label,desc}], onChange, key)`, formato `L.ars/arsShort/usd/num/dec/pct/date/dateShort/time`, `L.esc`.
Descargas reales: `L.download(nombre, blob|string, mime)`, `L.csv(rows)`, `L.xlsx([{name, rows}])`, `L.pdf(blocks, {title, footer})`.

## Reglas de producto (no negociables)

1. Copy en español rioplatense con voseo («Revisá», «Subí»); el producto es **liard** en minúscula. Botón = lo que pasa
   («Enviar solicitud», «Emitir pedidos»); el aviso repite el verbo («Solicitud enviada»). Errores: qué no pasó, por qué, qué hacer,
   y si el estado anterior quedó intacto. Vacíos que invitan con el primer paso. Solo números que salen del estado.
2. Vocabulario: obra, plano = tablero, tabla de referencia, símbolo, BOM, línea, material, componente base, atributos esenciales,
   marca, gama, «Cualquier marca», repeticiones, solicitud de cotización, oferta, adjudicar, pedido / orden de compra, distribuidor.
3. Procedencia visible siempre: detectado / inferido / manual; **precio de referencia ≠ oferta confirmada**; **disponibilidad sin
   confirmar ≠ stock confirmado**; **alternativa sugerida ≠ equivalencia aprobada** (la aprueba una persona de ingeniería).
4. IA y servicios externos: etiquetá `L.ai()` / `L.sim()`; mostrá costo estimado y el límite; siempre hay camino manual; la IA
   propone, una persona confirma decisiones técnicas.
5. Confidencialidad: un distribuidor nunca ve precios ni nombres de otros distribuidores; el contacto del comprador se muestra al
   confirmar el pedido. Tarifa de la plataforma (suscripción, comisión por lead) ≠ pago de materiales (fuera de liard).
6. Marcá en cada pantalla qué es `existe` / `planificado` / `propuesto` (`L.cap`), p. ej. en el encabezado de cada bloque.
7. Accesibilidad: todo operable con teclado, foco visible, `aria-*` en controles propios, contraste AA, estado nunca solo por
   color, `prefers-reduced-motion` respetado, alternativa 2D/tabla para cualquier visualización.
8. Toda interacción ofrecida funciona de verdad sobre el store: nada de toasts de éxito sin la operación hecha.

## Datos de ejemplo clave

Empresa: Tableros Andes SRL (Lucía Ferreyra · Ingeniería, Martín Ruiz · Compras, Daniel Ortega · Dirección).
Distribuidores: `sur` Distribuidora Sur Eléctrica (la cuenta proveedor de la demo, Paula Giménez), `delta` Electro Delta SA,
`norte` Norte Materiales Eléctricos. Obras: `p1` Clínica San Martín (revisión: 3 símbolos sin identificar, 2 líneas sin marca,
TS-B sin procesar, TS-P tipo ×4) · `p2` Hotel Costa Serena (SC-0141 abierta: Delta y Norte ofertaron, Sur pendiente) ·
`p3` Planta Frigorífica Rafaela (pedidos confirmados) · `p4` Edificio Alvear 1200 (vacía). Fecha de la demo: 30 sep 2026.

## Pruebas

`node tools/tests/<area>.test.js` con `tools/pw.js` (servidor propio, Chromium de Playwright, contexto limpio por `open`, `keepState`
para persistencia). Cubrí camino feliz, validaciones, error y recuperación, persistencia tras recarga, reinicio, descarga (abrí el
archivo y verificá contenido), teclado, móvil si aplica. Mirá cada PNG con Read y corregí antes de terminar. Cero errores de consola.

## Campos agregados por las áreas (documentados al integrar)

- `item.priceHistory: [{price, at, source}]`, `item.brandCode` (código de la marca, p. ej. SCH) — catálogo.
- `s.ui.importHistory`, `s.ui.alloc[rid]`, `s.ui.budgetScenarios[pid]`, `s.ui.budgetSend[pid]`, `s.ui.manualPrices[pid][lineId]`, `s.ui.asist` — borradores de UI.
- Oferta: `offer.discountPct`, `line.basePrice` (precio antes del descuento global); `line.declared` marca un «No cotizo» explícito.
- Línea de BOM: `alt: {typeId, attrs, brand, note}` (BOM alternativo).
