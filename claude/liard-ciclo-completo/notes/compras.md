# Área C · Presupuesto y compras

Archivos: `d-com-cotizacion.html`, `d-com-escenarios.html`, `d-com-presupuesto.html`, `d-com-recotizar.html`,
`d-com-pedidos.html`, `d-com-correo.html` (opcional), `m-com-aprobar.html`, `compras.js` (cálculo compartido, `window.C`),
`compras.css`, `sections/c-compras.js` (6 secciones, orden 300–350, 18 marcos).

## Pantallas y estados

| Pantalla | Usuario | Variantes / estados |
| --- | --- | --- |
| `d-com-cotizacion.html` | sofia | `?vista=matriz` (por defecto) · `lista` · `?estado=parcial` (falta Electro Sur, la están leyendo) · `cargando` · `vencida` (no se ejecuta) · `error` |
| `d-com-escenarios.html` | sofia | `?vista=comparar` · `tabla` · `ia` · `?vista=ia&estado=sin-ia` |
| `d-com-presupuesto.html` | lucas | `?vista=interna` · `cliente` (PDF) · `versiones` (v1 → v2) · `?estado=vacio` (sin escenario elegido) · `cargando` |
| `d-com-recotizar.html` | lucas | `?vista=lineas` · `distribuidor` · `?origen=<tablero>` (as-built, pedido de E; `?origen=xx` → tablero inexistente) · `?estado=error` |
| `d-com-pedidos.html` | sofia | `?vista=lista` · `contraoferta` · `correos` (`&oc=…`) · `?ped=<id>` abre el panel · `?estado=vacio` |
| `d-com-correo.html` | (distribuidor) | `?oc=…&mail=…`: la bandeja de entrada del distribuidor, sin el shell |
| `m-com-aprobar.html` | hernan | lista · `?id=<aprobación>` detalle · «ya aprobado» después de decidir · `?estado=vacio` |

## Estado compartido que lee y escribe el área

- Lee: `lineas` (estado, `manual`, `faltan`), `ofertas`, `proveedores`, `pedidos`, `planos`, `tableros`, `tgbt`, `cambio`,
  `window.BP.oc031` y `BP.equivalentes` (área D, `data-prov.js`).
- Escribe: `compra = { estrategia, adjudicadas, filtros, desde, cuando }`, `presupuesto = { margen, tarifa, validez, ajuste,
  horas, estimados, gastos, estado, version }`, nuevos lotes en `pedidos` (`PED-2026-034…`, con `nuevo: true` e
  `items`), `pedidos[k].ordenes[j].contra.estado` (+ `decision`, `decidida`), `avisos.unshift(…)`.
- Privado: `x.compras.filtros`, `x.compras.aprob` (aprobaciones de dirección), `x.compras.dec.<oc>`,
  `x.compras.pedidoAct`.
- Pedidos de otras áreas que se resolvieron:
  - **E:** por defecto `compra.adjudicadas` usa solo en, ohm y sur (las listas vencidas quedan afuera: `FILTROS0.vencidas = true`). Además, `d-com-recotizar.html?origen=<tablero>`.
  - **D:** las líneas de OC-2026-031-1 se leen de `BP.oc031`, sin copiarlas. La contraoferta de D (5 cambios, $ 21.077.620) funciona; si D todavía no escribió una, se siembra un ejemplo de 2 cambios armado con las pistas de `BP.oc031`. Aceptar o rechazar escribe `.contra.estado` y no toca `oc.total`.
  - **B:** `manual = true` se muestra como «Cotizada a mano», sin ofertas ni NOT_FOUND. Una línea que pasa a `ready` se cotiza con `B.ofertas`; si no tiene ofertas, se generan con la misma fórmula que `data.js`.

## Coherencia numérica (verificado en node y en Playwright)

- Los totales salen de `ofertas × lineas[].comprar`. Con el estado inicial: «Más barato» da $ 37.602.760 en 14 de 15 líneas cotizables (sin Volta). Sin el filtro de listas vencidas da $ 36.732.220.
- La suma de las líneas de las OC del PED-2026-031 da exactamente el total de cada una en `data.js`: $ 21.894.500 (de `BP.oc031`), $ 4.820.300 y $ 1.786.000.
- La aprobación del PED-2026-033 suma $ 50.295.400 = 46.380.000 + 3.915.400. La del PRE-2026-044 cierra con un margen de 15,8 % (costo $ 48.752.000, venta $ 57.900.000, IVA $ 12.159.000).
- El presupuesto se arma así: materiales del escenario elegido + las líneas sin ofertas a estimar + mano de obra + gastos, con el margen sobre el precio de venta. La suma de los ítems para el cliente da exactamente el precio de venta.

## Decisiones de diseño

- Cotización: mantuve el lenguaje de la que existe (HUD de 4 celdas, toolbar Mixto / Único proveedor, celdas que se adjudican con un clic, «Asignar todo» al pie). Arriba sumé el recorrido de punta a punta en 5 pasos, cada uno con un enlace.
- Las líneas NOT_FOUND quedan al final de la matriz, con fondo de aviso y su motivo; no se esconden.
- STALE_PRICE va como celda ámbar y tiene un botón «Pedir lista».
- Escenarios: cuatro tarjetas con el mismo esquema, una barra apilada por distribuidor, el delta contra el más barato y los riesgos. El «¿qué pasa si…?» recalcula en vivo y tiene atajos (1–4, S, V).
- Presupuesto: un resumen fijo a la derecha, con un slider de margen que marca el umbral del 18 %. El IVA va rotulado «cálculo de presentación». El PDF para el cliente es una hoja A4 con un precio por tablero.
- Pedidos: sumé el KPI «Contraofertas» y una columna «Respuesta» con el semáforo de `responseDeadlineAt`. El detalle va en `L.sheet`, en lugar del panel 3D de la app.
- Teléfono: tarjetas grandes y el detalle con el motivo. Para rechazar, el comentario es obligatorio. Se puede deshacer.
- Movimiento: solo el de `ui.css`, más el flash de la celda adjudicada y el cambio de color del total del escenario. Todo se apaga con `prefers-reduced-motion`.

## Supuestos (lo que no decide la documentación)

- La condición comercial de cada distribuidor (cta. cte. 30/60, contado −3 %, transferencia anticipada) es inventada.
- Los topes son inventados: OC de más de $ 20.000.000 y margen mínimo del 18 % para pedir aprobación.
- Horas de taller por tablero y tarifa de $ 17.500/h. Gastos: ingeniería $ 1.850.000, ensayo $ 145.000 por tablero, flete $ 680.000 e imprevistos del 3 %.
- La v1 del presupuesto (24/09, margen 27 %, venta $ 71.800.000 = `proyectos.p1.monto`) es una foto que no se recalcula.
- La cotización vieja de Torre Alem (COT-2026-019, 05/09) son 14 líneas con precios inventados alrededor de los de hoy. El IPC del período es 1,7 % mensual prorrateado (research/mercado.md).
- El as-built usa la lista de armado del TGBT (`tgbt.filas`) y, para el resto, las `fuentes` de cada línea. El precio «antes» sale del PED-2026-031, o de la oferta más barata si la línea no se pidió.
- Hilo de correos: direcciones, horarios y textos inventados. El recordatorio sale el día anterior al vencimiento.
- Otros presupuestos de la lista (PRE-2026-044/038/046) son fotos de un solo número.
- La recomendación IA es texto calculado con los mismos números; el costo (US$ 0,04) y el resto del tope son inventados (el tope sale de `consumoIA`).

## Qué existe en dev y qué es nuevo

- **Existe:** la matriz de cotización (MIXED/SINGLE, más barato/más rápido/mayor cobertura, adjudicar por celda y «Asignar todo», ejecutar la orden con su diálogo), «Mis pedidos» (KPIs, tabla, filtros, estado vacío, pedido por proveedor) y los estados SENT/CONFIRMED/REJECTED/EXPIRED.
- **Sprint 4 pendiente:** el recorrido de punta a punta, el motivo NOT_FOUND visible, STALE_PRICE, y el stock, plazo, fecha y condición en la matriz.
- **Sprint 5:** el hilo de correos y el correo del distribuidor.
- **Nuevo (h1):** escenarios, presupuesto con margen e IVA, re-cotizar, contraoferta por línea, aprobación por monto y aprobación desde el teléfono.

## Pedidos al coordinador

1. `ui.css` no tiene `.st.sk` con ícono ni una variante «cotizada a mano»: usé `.st.sk`. Si se suma un estado `MANUAL_REQUIRED` compartido, conviene alinearlo.
2. En `app.js` falta el contador de aprobaciones (`avisosSinLeer['m-aprobar']` está fijo en 2): no lo recalcula con `x.compras.aprob`.
3. El ítem «Presupuestos» de la barra abre `d-com-presupuesto.html`, que muestra PRE-2026-041. No hay una pantalla de listado aparte: la tira de 4 presupuestos de arriba hace ese papel.
4. El área F (inicio/avisos) puede leer `x.compras.aprob` para mostrar «N esperan tu firma».

## Qué verifiqué y qué no

- ✓ QA (`tools/qa.mjs`) en las 33 combinaciones de pantalla y estado: 33/33 limpias. Miré los PNG de cada pantalla y corregí cortes, desbordes y solapes (HUD truncado, cabeceras de columna, pie de la contraoferta, barra fija del teléfono, sidebar del correo).
- ✓ Recorrido completo con Playwright, sobre localStorage:
  - Elegí un escenario y la cotización quedó pre-adjudicada.
  - Destrabé una línea bloqueada (simulando B) y apareció cotizada.
  - Ejecuté la orden: como la OC supera el tope, fue a aprobación, y el pedido nuevo aparece en Pedidos.
  - Respondí la contraoferta y el hilo de correos muestra la decisión.
  - Bajé el margen del presupuesto: pidió aprobación, el teléfono la aprobó y la pantalla de escritorio se actualizó por el evento `storage`.
- ✓ Contraoferta con el formato del área D (5 cambios, $ 21.077.620) y sin ella (ejemplo sembrado). Línea `manual` (simulando B). Sin errores de consola.
- ✗ No probé contra las pantallas reales de B, D y E: simulé su estado escribiendo localStorage con el formato que me pasaron. La galería (`index.html?s=cotizacion`) carga la sección con sus 3 marcos y sin errores; no recorrí las otras 5 secciones dentro de la galería. Tampoco probé la navegación por teclado más allá de los atajos de escenarios. Tampoco miré el teléfono en un navegador real.
