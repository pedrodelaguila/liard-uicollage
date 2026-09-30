# Área proveedor (SUPPLIER · Distribuidora Sur Eléctrica, Paula Giménez)

## Pantallas

| Archivo | Capacidad | Qué hace |
| --- | --- | --- |
| `d-prov-inicio.html` | propuesto (catálogo: existe, leads: planificado) | Qué necesita respuesta (pedidos por confirmar, solicitudes por vencimiento, borradores); KPIs del store: para responder, tiempo de respuesta (mediana de `createdAt → submittedAt` de ofertas enviadas o declinadas), tasa de adjudicación (solicitudes adjudicadas donde envié oferta y tengo pedido / decididas), leads del mes vs `billing.supplier` con «comisión por lead» estimada; salud del catálogo (por leer, fallidas, sin componente base, precio vencido) con links a catálogo y vinculación. |
| `d-prov-solicitudes.html` | existe (rediseño: estados y resultado propuestos) | Solo solicitudes con `supplierIds` que me incluyen. Columnas: código, comprador (contacto oculto «contacto al confirmar»), obra, materiales, vencimiento con urgencia, mi oferta (`L.offerStatusLabel` + total), resultado (adjudicada a mí / a otro / abierta / vencida, derivado de requests + orders). Filtros por chip, búsqueda, orden por columna (`L.sortable`), vacíos (sin solicitudes, sin resultados), cargando, error. Botón demo «Cargar solicitudes de ejemplo». |
| `d-prov-oferta.html` | propuesto (la solicitud en sí: existe) | Oferta estructurada para `?r=` (por defecto la abierta más próxima = SC-0141). Ver abajo. |
| `d-prov-pedidos.html` | existe (rediseño) | Pedidos adjudicados a mí (`?o=`), lista + detalle; confirmar o rechazar una sola vez (`L.respondOrder`, rechazo con motivo obligatorio); contacto del comprador **desde el store** (`company` + miembro de `team` con `area: 'Compras'` = Martín Ruiz, compras@tablerosandes.example) solo tras `CONFIRMED`; PDF del pedido; aviso de pago y flete fuera de liard. |
| `m-prov-inicio.html` | propuesto | Pendientes y KPIs mínimos para el teléfono. |
| `m-prov-oferta.html` | propuesto | Respuesta rápida: por línea precio y plazo con inputs de 48 px, botones grandes Tengo stock / Parcial / A pedido / No cotizo (con motivo), «Confirmar stock de todo», validez y pago, total fijo abajo, enviar. Mismo formato de datos que el escritorio. Alternativas y descuento se editan en escritorio (si existen se respetan). |
| `m-prov-pedidos.html` | existe | Confirmar / rechazar con motivo, contacto tras confirmar. |

### Oferta (`d-prov-oferta.html`)
- Encabezado: código, comprador, obra y ciudad, recibida, vencimiento con urgencia, acepta alternativas o no, estado de mi oferta y revisión; nota del comprador.
- Aviso de confidencialidad fijo: nunca ves precios ni nombres de otros distribuidores; el contacto aparece al confirmar un pedido; pago y flete fuera de liard.
- Sin responder: tabla de materiales pedidos (componente base, atributos en idioma del tablerista `L.lineLabel` — «Térmica 4P · 32 A · curva C» —, marca pedida o «Cualquier marca», cantidad, cuántos artículos míos coinciden) y **Armar oferta desde mi catálogo** (`L.prefillOffer`: precio de referencia, disponibilidad sin confirmar).
- Por línea: qué ofrezco (Cotizo / Alternativa si `alternativesAllowed` / No cotizo con motivo), artículo de mi catálogo, precio unitario con **diferencia vs catálogo** (neto, en vivo), disponibilidad (CONFIRMADO / PARCIAL + unidades / A_PEDIDO / DESCONOCIDO), plazo. Alternativa: elegir otro artículo de mi catálogo del mismo componente base (se muestran los atributos que cambian) o cargar marca/código a mano + precio + motivo de equivalencia → «alternativa sugerida, la aprueba ingeniería» (`equivalence: 'SUGERIDA'`; se vuelve a SUGERIDA si cambio código, precio o motivo al reenviar).
- Condiciones: validez, pago (Contado / 30 / 60 / 90 días), **descuento global %** (se guarda `basePrice` por línea y `unitPrice = round(basePrice × (1 − d))`; eso ve `L.compare`), nota. Totales en vivo: subtotal de lista, descuento, total, plazo máximo.
- Acciones masivas: Confirmar stock de todo, Aplicar plazo a todo (Enter en el campo), Volver a precios de catálogo. Teclado: Tab, Enter baja a la misma columna en la línea siguiente, Ctrl+S guarda, Ctrl+Enter envía.
- Validación con `L.validateOffer` + reglas de pantalla (motivo de «no cotizo», alternativa no permitida, descuento 0–99): resumen arriba con links a la línea y errores bajo cada línea/campo.
- Guardar borrador (`L.saveOffer`, persiste), enviar (`L.submitOffer`) → solo lectura con **Editar oferta** solo mientras la solicitud está abierta y sin adjudicar; el reenvío sube `revision`. **No cotizar** (`L.declineOffer`, motivo obligatorio, una sola vez). Adjudicada: «Te adjudicaron N de M» con link al pedido, o «se adjudicó a otro distribuidor» sin decir a quién.
- Descargas: Oferta PDF (`L.pdf`) y XLSX (`L.xlsx`) del borrador o de lo enviado.

## Variantes (`?v=` en `d-prov-oferta.html`, recordada con `L.pref`)

| Variante | Fortaleza | Costo | Tarea |
| --- | --- | --- | --- |
| `planilla` | Densa, todo a la vista, Tab/Enter como en Excel, acciones masivas rinden más | A 390 px hay que desplazarse de costado; alternativas abren una fila de detalle | Vendedor experto con 15–20 presupuestos por día que ajusta precios de muchas líneas rápido |
| `lineas` | Una línea a la vez con contexto (referencia, marca pedida), progreso «N de 7 revisadas», cabe en pantallas chicas | Más clics, no se compara entre líneas de un vistazo | Solicitudes con alternativas o stock dudoso que piden revisar línea por línea; vendedor nuevo |

El móvil (`m-prov-oferta.html`) es una tercera forma: solo confirmar precio y stock y enviar.

## URLs de estado para la galería
- `d-prov-inicio.html`, `d-prov-inicio.html?estado=cargando`
- `d-prov-solicitudes.html`, `?estado=vacio|cargando|error`, `?f=cerradas`, `?q=zzz` (sin resultados), `?demo=ejemplos` (agrega 4 solicitudes de ejemplo con el flujo real: 2 adjudicadas a Sur con pedido SENT, 1 a otro, 1 vencida)
- `d-prov-oferta.html?r=r-0141` (sin responder), `?r=r-0141&prefill=1&v=planilla`, `?r=r-0141&prefill=1&v=lineas`, `?estado=cargando|error|vacio`
- `d-prov-pedidos.html?demo=ejemplos` (redirige a solicitudes para cargar ejemplos y vuelve), `d-prov-pedidos.html?o=oc-0100&dialogo=confirmar|rechazar`, `?estado=vacio|cargando|error`
- `m-prov-inicio.html`, `m-prov-oferta.html?r=r-0141`, `m-prov-pedidos.html?demo=ejemplos`
- Nota: los ids de los pedidos de ejemplo salen de la secuencia del store (`oc-0100`, `oc-0101` con semilla limpia).

## Prueba
`node tools/tests/proveedor.test.js` → **✓ proveedor: todo bien (63 checks, 0 errores de consola)**. Cubre: bandeja solo con lo mío y contacto oculto; prefill (precio de referencia, sin confirmar); errores (precio 0, parcial sin cantidad, alternativa sin motivo, validez vencida) en el resumen y por línea, sin envío; arreglo; delta vs catálogo; matemática del descuento (900.000 = 1.000.000 − 10 %, total del store = pantalla); Enter en planilla; acciones masivas; Ctrl+S; recarga persiste (keepState); variante línea por línea con progreso; PDF (`%PDF`, código, precio neto) y XLSX (zip válido); envío → aviso a ingeniería y `L.compare` con los precios netos de Sur en las 7 líneas, alternativa SUGERIDA; editar y reenviar (revisión 2); no cotizar en una solicitud creada con `L.createRequest` (motivo obligatorio, una vez); adjudicación → oferta ya no editable; pedido: sin contacto antes, contacto real tras confirmar, segundo `respondOrder` rechazado, PDF con contacto; rechazo con motivo obligatorio; móvil: error de precio, stock de todo, no cotizo con motivo, envío; móvil pedidos confirmar; confidencialidad (sin «Electro Delta», «Norte Materiales», sus contactos ni sus precios) en inicio, bandeja, oferta, pedido y móvil.
42 capturas en `shots/tests/proveedor/` (1440 y 390, todas revisadas). Corregido tras mirarlas: tabla desbordada, `.mt` inexistente, clase `.top` que chocaba con el topbar, plural «1 materiales», capturas de keepState que no cambiaban a 390, pie fijo tapando campos a 390.

No verificado: por `file://` (solo `http://`), lectores de pantalla reales, contraste medido con herramienta.

## Supuestos
- El descuento global es de la oferta y se aplica al precio neto de cada línea (lo que compara el ingeniero); el precio de lista queda en `basePrice` (campo nuevo en la línea de oferta) y `discountPct` en la oferta.
- Una línea cotizada con precio igual al de catálogo pero con descuento queda `AJUSTADO` (lo decide `L.submitOffer`); en solo lectura se etiqueta «catálogo − desc. global» y no «precio ajustado».
- Editar después de enviar vuelve a SUGERIDA la equivalencia de una alternativa si cambió código, precio o motivo.
- «Tiempo de respuesta» cuenta ofertas enviadas y «no cotizo»; la ficha declara ~3 h (`responseH`) y se muestra aparte.
- Los ejemplos de la demo usan la obra p3 y corrigen `createdAt`/`submittedAt` para que las fechas sean coherentes; se marcan «[Ejemplo]» y «ejemplo de la demo».

## Pedidos al coordinador
1. `ui.css`: falta la utilidad `.mt` (varias páginas la usan); la definí local: `.mt { margin-top: var(--sp-4); }`.
2. `app.js` `L.shell`: en capturas de página completa la barra lateral (`position: sticky; height: 100vh`) termina a 994 px y deja fondo vacío debajo; es cosmético.
3. `L.submitOffer` cambia a `AJUSTADO` cualquier línea con `unitPrice !== refPrice`, incluso cuando solo aplica el descuento global. Propuesta: `L.submitOffer` respeta `ol.basePrice` si existe (`AJUSTADO` solo si `basePrice !== refPrice`).
4. `L.offerStatusLabel` no tiene revisión; si la comparación debe mostrar «oferta actualizada», leer `offer.revision` (número, 0 o ausente = primera).
5. `L.validateOffer` no pide motivo en `SIN_OFERTA` ni rechaza `ALTERNATIVA` cuando `alternativesAllowed` es false; lo hago en la página, convendría moverlo al dominio.

## Frames para la galería (`kind|src|caption|note`)
```
laptop|d-prov-inicio.html|Inicio del distribuidor|Qué responder hoy, tiempo de respuesta, adjudicación y leads (planificado)
laptop|d-prov-solicitudes.html?demo=ejemplos|Bandeja de solicitudes|Solo lo mío; contacto oculto; resultado derivado de pedidos
laptop|d-prov-solicitudes.html?estado=vacio|Bandeja vacía|Invita a revisar el catálogo
laptop|d-prov-oferta.html?r=r-0141|Solicitud sin responder|Lista estructurada en idioma del tablerista
laptop|d-prov-oferta.html?r=r-0141&prefill=1&v=planilla|Oferta · Planilla|Precio con delta vs catálogo, stock, plazo, descuento global, Tab/Enter
laptop|d-prov-oferta.html?r=r-0141&prefill=1&v=lineas|Oferta · Línea por línea|Tarjetas guiadas con progreso
laptop|d-prov-pedidos.html?demo=ejemplos|Pedido por responder|Confirmar o rechazar una sola vez; contacto al confirmar
laptop|d-prov-pedidos.html?o=oc-0100&dialogo=rechazar|Rechazar pedido|Motivo obligatorio
phone|m-prov-inicio.html|Inicio en el teléfono|Pendientes
phone|m-prov-oferta.html?r=r-0141|Ofertar desde el teléfono|Botones grandes de stock, total fijo, enviar
phone|m-prov-pedidos.html?demo=ejemplos|Pedidos en el teléfono|Confirmar o rechazar
```
