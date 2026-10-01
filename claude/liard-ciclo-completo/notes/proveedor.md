# Área D · Distribuidor (rol SUPPLIER)

Distribuidor: **Eléctrica Norte S.A.** (`en` de `data.js`). Usuarios: Julián Roldán (vendedor: solicitudes, inicio, vidriera, leads) y Carla Méndez (catálogo e integraciones).

## Archivos

- Pantallas: `d-prov-inicio.html`, `d-prov-solicitudes.html`, `d-prov-catalogo.html`, `d-prov-integraciones.html`, `d-prov-vidriera.html`, `d-prov-leads.html`, `m-prov-solicitudes.html`, `m-prov-responder.html`.
- `sections/d-proveedor.js`: 6 secciones, de orden 400 a 450, con 17 marcos.
- `data-prov.js` (`window.BP`): datos de referencia del área. `prov.js` (`window.P`): lista de solicitudes, borrador por línea, cálculo de totales, escritura de `.contra` y avisos. `prov.css`: solo tokens, más el violeta de «contraoferta» que ya usa `.ost.COUNTER`.

## Pantallas y estados

| Pantalla | Variantes / estados |
| --- | --- |
| `d-prov-inicio` (h1) | `?vista=vendedor\|gerencia`, `?estado=vacio` (distribuidor nuevo, 3 pasos), `?estado=cargando` |
| `d-prov-solicitudes` (existe + h1 + s5) | lista: `?vista=tarjetas\|bandeja`, `?estado=aceptadas\|rechazadas\|vacio\|cargando\|error`; detalle: `?oc=<id>`, `&vista=linea\|dev`, `&estado=contraoferta\|error\|cargando`, `&linea=l06` (abre el panel de equivalente), `&dialogo=rechazar\|contraoferta`, `#contacto` |
| `d-prov-catalogo` (existe) | `?vista=productos\|importar\|vincular`, `&paso=1\|2\|3`, `?estado=leyendo\|sin-ia\|error\|vacio\|cargando`, `&filtro=sin\|falta\|listas\|todas`, `?dialogo=editar` |
| `d-prov-integraciones` (h2) | `?vista=erp\|listas\|historial`, `&lista=lg\|ld\|ls\|lr`, `?estado=error\|vacio\|cargando` |
| `d-prov-vidriera` (h2) | `?vista=ficha\|demanda`, `?estado=vacio\|cargando` |
| `d-prov-leads` (s5) | `?mes=sep\|oct`, `?estado=limite\|error\|cargando` |
| `m-prov-solicitudes` (h1) | `?estado=vacio\|cargando\|aceptadas\|rechazadas` |
| `m-prov-responder` (h1) | `?oc=<id>`, `&i=<n.º de línea>`, `?estado=error` (sin conexión) |

## Estado compartido

- **Escribo** en `pedidos[0].ordenes[0]` (OC-2026-031-1, la de `en`). La contraoferta va en `.contra = { lineas: [{ linea, cambio, antes, despues, nota, precioAntes?, precioDespues?, codigo?, ahora?, resto?, sinStock?, bomAlternativo? }], estado: 'pendiente', enviada, total, totalAntes, plazoMax, validez, por }`. Aceptar y rechazar escriben `.status = CONFIRMED|REJECTED`, `.respondido` y `.motivo`. El área C puede escribir `.contra.estado = 'aceptada'|'rechazada'`, y la pantalla lo muestra como Aceptada o Rechazada.
- **Avisos**: hago `avisos.unshift` con `id: 'a2'` (reemplazo el aviso semilla de contraoferta, que apunta a `d-com-pedidos.html?vista=contraoferta`), `prov-ok-<oc>` y `prov-rej-<oc>`.
- **Privado del área**: `x.prov.borrador.<oc>` (el borrador por línea, compartido entre escritorio y teléfono), `x.prov.sol.<oc>` (respuestas a solicitudes que no están en `data.js`), `x.prov.cat`, `x.prov.leidos`, `x.prov.erp`, `x.prov.vid` y `x.prov.disputas`.

## Decisiones de diseño

- La respuesta por línea es una tabla con un selector de 6 acciones por fila. Confirmar y Sin stock se aplican directo, con deshacer. Precio, plazo, equivalente y parcial abren un panel lateral con su formulario. Un dock fijo muestra el total recalculado, la diferencia, el plazo máximo y el IVA (rotulado como presentación). La acción principal cambia: «Aceptar tal cual» si no hay cambios, «Enviar contraoferta» si los hay. Atajos A/R/E.
- **Equivalente**: solo se listan productos del catálogo propio con el mismo componente base. El panel compara atributo por atributo contra lo pedido y avisa sobre la verificación de diseño (IEC 61439).
- **BOM alternativo (s5)**: en l01 y l10 el comprador pidió otra marca, y el vendedor elige Principal, Alternativa o Las dos. «Las dos» no suma al total adjudicable, se muestra aparte («+ alt.»).
- **Sugerencias del ERP**: l05 (plazo), l06 (equivalente) y l16 (parcial). Se proponen con «Aplicar lo que dice el ERP», nunca se aplican solas.
- El contacto del comprador se muestra recién con la solicitud aceptada (o, en esta propuesta, cuando el comprador acepta la contraoferta). Antes solo se ve un comprador anónimo con su historial («Tablerista de Ezeiza · 14 pedidos · adjudica el 71 %»).
- **Refinamientos marcados sobre dev**: «Proyecto» en lugar de «Nombre del cliente» en la tarjeta; vencimiento visible; motivo al rechazar; bandeja por vencimiento; «undefined productos» corregido; la columna de precio ya no se corta; costo estimado de la lectura IA antes de confirmar.
- **Teléfono**: una línea por pantalla, con tres botones grandes (Confirmar avanza solo a la siguiente), paginador de colores y dock con el total. Precio y equivalentes se derivan a la computadora.
- **Movimiento**: entrada lateral de la línea en el teléfono, brillo en la barra de lectura y respiración del ícono de escaneo. Todo se apaga con `prefers-reduced-motion`.

## Supuestos (lo que inventé donde la doc no decide)

- **Las 7 líneas de OC-2026-031-1** son l01, l05, l06, l08, l10, l15 y l16, con la cantidad a comprar y la oferta de `en` en `data.js`. Para que la suma dé el total de `data.js` ($ 21.894.500), el precio de l06 en la OC es $ 8.179.240, un 0,19 % más que la oferta guardada (con la explicación de que se fijó al enviar). Si el área C muestra el detalle de esa OC, conviene que use `BP.oc031`.
- Compradores, contactos, CUIT, el resto de las solicitudes, los leads de septiembre y la demanda perdida son ficticios. Las solicitudes viejas sin detalle generan líneas deterministas (`prov.js`, `generar`), que cierran con su total mediante una línea de «Accesorios de montaje».
- **Comisión**: 5 leads sin cargo y $ 6.000 + IVA desde el 6.º, con tope configurable. Es una hipótesis sin validar y está rotulada así en la pantalla.
- **Conector de ERP de solo lectura**, con Electrobase conectado. La frecuencia, los conflictos y la lista de precios en USD al dólar BNA son propuesta.
- Las métricas de la vidriera (3 h, 94 %) salen de `proveedores[en]` y de los leads de septiembre. «Cómo te comparan» usa números de ejemplo.
- La lectura IA cuesta US$ 0,0024 por producto, con un tope de lectura de US$ 40 por mes para el distribuidor.

## Qué existe en dev y qué es nuevo

- **Existe**: Recibidas, Aceptadas y Rechazadas en tarjetas con filtros; el detalle con Aceptar o Rechazar todo y sus modales; el contacto del comprador al aceptar; Mis productos; Cargar catálogo en 3 pasos con mapeo y reglas; el historial de cargas; la Vinculación con lectura en vivo y la ficha por producto. En el detalle de la solicitud, la vista «Como en dev» lo reproduce.
- **Nuevo**: el inicio, la respuesta por línea con contraoferta, el BOM alternativo del lado del proveedor, la bandeja por vencimiento, el motivo de rechazo, el ERP y las listas por cliente, la vidriera y la demanda perdida, los leads y la comisión, y las dos pantallas de teléfono.

## Pedidos al coordinador

1. `.st` no tiene variante violeta para «contraoferta». Usé `.pv-badge.vi` con los mismos colores de `.ost.COUNTER`. Si se suma `.st.vi` al `ui.css` compartido (ya existe, pero con fondo plano), se podría unificar.
2. Si el área C muestra el detalle de las líneas de OC-2026-031-1, que use las de `BP.oc031` (`data-prov.js`) o que esas líneas pasen a `data.js` (ver Supuestos).
3. El ítem activo de la barra lateral se decide antes de armar el shell. Para `?oc=` lo corrijo después de renderizar. Un `data-active` dinámico en `app.js` lo resolvería de forma prolija.
4. El aviso semilla `a2` de `data.js` habla de «ABB Tmax XT» como alternativa al NSX 250. En mi pantalla el equivalente Tmax es para el NSX630F (l06), y el NSX 250 (l05) va con plazo de 12 días, que coincide con el texto. Al enviar la contraoferta reemplazo `a2` con el texto real.

## Verificado y no verificado

**Verificado**
- `node tools/qa.mjs d-prov- m-prov- <43 URL de estados y marcos>` da **51/51 limpias** (sin errores de consola, sin desborde, sin inglés, `undefined` ni `NaN`, controles con nombre, `lang=es`).
- Miré con Read las capturas de todas las pantallas y de los estados principales, y corregí: buscador angosto, etiquetas apiladas, el dock del teléfono que se quedaba en el medio (por la animación de `.page`), el ítem activo de la barra, saltos de línea en números de OC y precios, y la tabla de leads apretada.
- Recorrido completo con Playwright (`scratchpad/e2e.mjs`), en este orden y sin errores de consola:
  1. «Aplicar ERP», cambio de precio en l08 y alternativa en l10.
  2. Enviar la contraoferta escribe `pedidos[0].ordenes[0].contra` con 5 cambios y un total de $ 21.077.620 (antes $ 21.894.500), más el aviso `a2`.
  3. El teléfono y el inicio la muestran como «Contraoferta enviada».
  4. La respuesta desde el teléfono a OC-2026-033-2 queda en `x.prov.sol`.
  5. Retirar, aceptar y ver el contacto deja el estado en CONFIRMED.
  6. Vincular la bornera sube «Listas» de 17.596 a 17.597.
  7. La disputa del duplicado se acepta y la comisión baja a $ 72.000.
- Los totales de las 20 solicitudes cierran con la suma de sus líneas (script en `scratchpad/t1.js`).

**No verificado**
- No probé que las pantallas del área C (`d-com-pedidos.html?vista=contraoferta`) lean bien mi `.contra`: todavía no existen en la carpeta.
- No probé la galería `index.html` completa con mi sección, solo que `sections/d-proveedor.js` carga y que sus URL pasan el QA.
- No probé los atajos de teclado ni `prefers-reduced-motion` en un navegador real; los revisé solo en el código.
