# Área E · Fabricación, obra y mantenimiento

Nada de esto existe en `dev`. Todo es propuesta (h1/h2/h3). Lo único que existe y se reutiliza son las OC
(`PurchaseOrder` SENT/CONFIRMED/REJECTED/EXPIRED), que se marcan `tag-existe` en `d-tal-entregas.html`.

## Archivos

`d-tal-taller.html`, `d-tal-protocolo.html`, `d-tal-entregas.html`, `d-tal-mantenimiento.html`, `m-tal-hoy.html`,
`m-tal-recibir.html`, `m-tal-tablero.html`, `m-cli-tablero.html`, `campo.css`, `campo.js` (helpers `window.CP`),
`data-campo.js` (`window.CAMPO`), `sections/e-campo.js`.

## Pantallas y estados

| Pantalla | Usuario | Variantes / estados |
| --- | --- | --- |
| `d-tal-taller.html` (h2) | ramiro | `?vista=lista`, `?estado=vacio`, `?estado=cargando`, `?tablero=<id>` abre el panel (`&panel=corte\|eq`) |
| `d-tal-protocolo.html?tablero=tsgpb` (h2) | ramiro | `?estado=fallido` (aislación 0,18 MΩ en Q7, bloquea la firma), `?vista=hoja` (PDF), `?tablero=tgbt` (todavía en armado), tablero inexistente → error |
| `d-tal-entregas.html` (h1) | sofia | `?vista=recepcion\|alcance\|entregas`, `?estado=error`, `?estado=cargando` |
| `d-tal-mantenimiento.html` (h2) | hernan | `?vista=tableros\|plan\|oportunidades`, `?estado=vacio`, `?estado=limite` (cupo de QR), `?tablero=lib-tg` abre el as-built |
| `m-tal-hoy.html` (h1) | diego | `?vista=taller` (versión de ramiro), `?estado=vacio` |
| `m-tal-recibir.html` (h1) | diego | `?paso=lineas`, `?estado=sin-ia` (carga manual), `?oc=<id>` |
| `m-tal-tablero.html` (h2) | obra/taller | `?tablero=<id>`, `?vista=3d` (solo TGBT, usa `tablero3d.js` de B; sin WebGL cae al frente 2D), `?ref=Q0` abre la ficha |
| `m-cli-tablero.html` (h3, `data-role="cli"`) | público | `?tablero=tsgpb\|lib-tg\|…`, `?estado=error` (QR no reconocido) |

Secciones: E1 Recepción (500), E2 Taller (510), E3 Protocolo (520), E4 Alcance y entregas (530), E5 As-built y QR (540).
Hay vacío, cargando, error y límite en el área.

## Estado compartido que escribe el área

- `tableros[i].estado` / `.avance` / `.frena`: lo cambian el kanban (arrastrar o «Mover a»), el protocolo emitido (→ `listo`, 100 %) y el remito de entrega (→ `entregado`).
- `recepciones`: `m-tal-recibir` agrega `{ oc, prov, proyecto:'p1', remito, fecha, por, foto, faltante, lineas:[{ linea, pedido, recibido, previo }], nota }`. La semilla (`CAMPO.recepciones`) son remitos de Torre Alem (p2).
- `avisos.unshift(…)`: frenar un tablero, reportar un aparato, no conformidad, protocolo emitido, faltante de un remito, cambio de alcance, pedido adicional, adicional al comitente, remito de entrega, pedido de servicio desde el QR.
- Privado en `x.campo.*`: `protocolos.<tablero>`, `montado.<tablero>`, `arm.<tablero>`, `horas.<tablero>`, `alcance`, `remitosEntrega`, `hechas`, `qrUsados`, `pedidosCli.<tablero>`, `servicio.<id>`.
- Lee: `lineas` (estado/faltan/motivo, para lo que frena), `pedidos` (PED-2026-031 y el status de sus OC), `compra.adjudicadas` (si C la escribe, pisa la adjudicación por defecto de E), `presupuesto.margen` (para el adicional; si no existe usa 25 %).

## Decisiones de diseño

- **Lo que frena es una línea del BOM, no un texto.** Cada faltante sale del cruce tablero × línea × OC × recepción × stock del taller: «No se pudo cotizar» (l09, l11 → `d-bom-editor.html?linea=…`), «Sin adjudicar» (l14, solo Volta con lista vencida → `d-com-recotizar.html`), «OC sin confirmar», «En camino · llega …». La tabla muestra por defecto solo lo que frena; «Ver todas» suma lo que está en camino.
- **«Listo para entregar» solo con protocolo firmado.** El kanban rechaza el arrastre y ofrece abrir el protocolo.
- **El taller no edita el BOM.** Los botones llevan a ingeniería (editor) o compras (re-cotizar).
- **Cambio de alcance en tres pasos encadenados** (BOM → pedido adicional → adicional al comitente). La OC enviada no se edita: va un `PED-2026-031-A`.
- **El protocolo es una guía:** nota fija arriba («la norma manda»), criterios numéricos rotulados como del taller.
- **Frente 2D propio** en `campo.js` (SVG con aparatos por módulos, referencias Q0…, color por estado del material), porque los demás tableros no tienen composición en `B.tgbt`. En el teléfono, el TGBT ofrece además el 3D de B (`Tablero3D.montar`, `color:'compra'`), con el frente 2D como alternativa.
- **QR público sin datos comerciales:** placa, documentos, historial y pedir servicio. Los planos de obra quedan detrás de un enlace al correo del responsable.
- Sheets (`L.sheet`) para el detalle de tablero, aparato y as-built, en lugar de cambiar de página.

## Supuestos (inventados donde la doc no decide)

- **Composición** de TSG-PB, TS-PISO y TS-BOMBAS (`CAMPO.composicion`), la **adjudicación por línea** a las 3 OC de PED-2026-031 (`CAMPO.adjudicacion`: 7 / 4 / 3 líneas, las mismas cantidades que `pedidos`; los totales de cada OC no los recalculo) y el **stock del taller**.
- **Horas presupuestadas/reales**, costo hora de taller $ 16.000 (ejemplo), armadores (no son usuarios de liard).
- **Criterios de ensayo:** aislación ≥ 1 MΩ a 500 V CC, continuidad PE ≤ 0,10 Ω, disparo del diferencial ≤ 300 ms. Los capítulos 11.2–11.10 de IEC 61439-1 son como los recuerdo: hay que verificarlos contra la edición vigente. La placa (In 160 A, Icc 6 kA) es de ejemplo.
- **Remito de hoy** de Ohm (50 de 74 diferenciales → entrega parcial), remitos de entrega y tableros entregados de otras obras (Libertador 4200, Clínica San Rafael, etc.), historial de mantenimiento y aparatos discontinuados (Compact NS, Multi 9).
- **Cupo de 50 etiquetas QR** en el plan Profesional: es una hipótesis de monetización, no una decisión.
- El patrón del QR es ilustrativo (no codifica la URL).

## Pedidos al coordinador

1. **Ícono `history` no existe** en `icons.js` y lo usan `d-bom-reglas.html` y `d-com-presupuesto.html` (warning en consola → ✗ en el QA). Yo usé `list-checks` / `archive`.
2. Si C escribe `compra.adjudicadas`, conviene que use solo proveedores de PED-2026-031 (en, ohm, sur); E ignora una adjudicación a un proveedor sin OC en el lote.
3. `m-pla-avisos.html?rol=obra` (F) debería mostrar los avisos de E: los escribo con `tipo` `wa/er/ok/pr` y `href` a pantallas de E.
4. Los enlaces salientes de E dependen de otras áreas: `d-bom-editor.html?linea=l09|l11`, `d-com-recotizar.html?origen=<tablero>` (C debería leer `origen` para precargar el as-built), `d-com-presupuesto.html`, `d-com-pedidos.html`, `d-prov-solicitudes.html?oc=<id>`, `d-ing-plano.html?plano=<id>`, `d-pla-plan.html`.

## Qué verifiqué

- `node tools/qa.mjs` sobre las 8 pantallas y todos los estados/variantes de `sections/e-campo.js` y los de la tabla de arriba: **32/32 limpias** (consola, desborde, inglés/undefined/NaN, nombres accesibles, `lang=es`).
- Miré los PNG de taller (kanban, panel TGBT y TS-PISO), protocolo (normal y fallido), entregas (recepción, alcance, entregas), mantenimiento (tableros, plan, oportunidades, as-built), y teléfono (hoy, recibir líneas, tablero frente y 3D, ficha Q0, QR público). Corregí: textos cortados en KPIs y tabla de faltantes, superposición de avatares, columna de estado en la lista de armado, migas largas, segmentado del 3D sin marcar, el texto de «quién lo frena», tarjeta «Sale a obra» vacía.
- Recorrido con Playwright (estado en `localStorage`): completar aislación y funcionamiento en el protocolo del TSG-PB → firmar ×2 → emitir → el taller lo muestra en «Listo para entregar» → remito de entrega en Obras → el TSG-PB pasa a «entregado» → recibir el remito de Ohm en el teléfono (rechaza confirmar sin foto) → aviso «Entrega parcial de Distribuidora Ohm» y KPIs de Obras actualizados (3/14 completas, 1 parcial) → pedido de servicio desde el QR → aviso. Sin errores de consola. Encontré y arreglé un bug (`classList.toggle` con `undefined` dejaba «Emitir protocolo» deshabilitado).

## Qué no verifiqué

- El arrastre del kanban (drag & drop HTML5) solo a mano en código; el recorrido usó «Mover a» y el protocolo.
- Interacción con el 3D de B (tocar un aparato en el canvas → ficha): solo comprobé que monta y se ve; depende de `onSeleccion` de `tablero3d.js`, que puede seguir cambiando.
- Que otras áreas lean bien `recepciones`, `tableros[i].estado` y `avisos` (F, C).
- La galería armada con `index.html` (no la abrí con las secciones de todas las áreas juntas).
- La normativa: capítulos y criterios de IEC 61439 / AEA 771 no están validados contra el texto vigente.
