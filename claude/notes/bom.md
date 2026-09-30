# bom · notas del área (ingeniería)

Archivos propios: `d-bom.html`, `tools/tests/bom.test.js`, `notes/bom.md`. No se tocó ningún archivo compartido.

## Pantalla

`d-bom.html?p=<obra>` (usa `L.currentProjectId()`), `&linea=<id>` enfoca y abre el detalle de una línea, `&v=componente|tablero|asistida`.

Común a las tres variantes:
- **Barra de bloqueos** (`L.blockers`) con links (símbolos → `d-plano.html`, líneas → activa el filtro «Bloqueantes») y el botón principal **Pedir cotización** → `d-cotizacion.html?p=`, deshabilitado mientras haya bloqueos.
- **Marcas de la obra** (`project.brandRules`): preferidas en orden (subir/bajar), excluidas, un resumen «lo que termina valiendo» y un aviso cuando hay líneas con marca excluida. Se avisa, no se bloquea. `existe`
- Resumen: líneas, unidades a comprar, cuántas bloquean, sin coincidencias y mejor total de referencia (`L.referenceQuote`).
- Acciones de la barra superior: Agregar línea, CSV (`L.csv`), XLSX (`L.xlsx`, hojas «BOM consolidado» y «Por tablero», columnas Material, Componente base, Atributos, Marca, Cantidad dibujada, Repeticiones, Cantidad a comprar, Origen).
- Guardado automático por cambio (`L.updateLine` / `L.store.update`), con estados de error y de conflicto.

## Variantes

| Variante | Capacidad | Para qué tarea | A favor | En contra |
| --- | --- | --- | --- | --- |
| a) Por componente | `existe` (rediseñada) | Revisar y corregir todo el BOM de una vez, sobre todo en obras grandes o repetidas | Grilla densa, con componente base y atributos editables en la celda desde listas cerradas y marca ordenada por preferidas (excluidas en su propio grupo). Muestra dibujada y a comprar (con repeticiones), procedencia, lectura y problemas con la marca «bloquea la cotización», y un anticipo de cotización (coincidencias + mejor precio de referencia, o `L.unmatchedReason`). Además: búsqueda, filtros (bloqueantes, sin marca, inferidas, sin coincidencias, familia), columnas ordenables, selección múltiple con Asignación rápida, «Aplicar mis preferidas» y flechas entre celdas (Enter entra al control, Esc vuelve a la celda) | Mucha información por fila. A 1024 px la grilla se desplaza de costado dentro de la tarjeta, con la selección y el Material fijos |
| b) Por tablero | `existe` | Revisar un tablero contra su plano, o delegar un tablero a otra persona | Subtotal de símbolos por tablero (dibujados y a comprar, ×repeticiones), links a `d-plano.html?p=&plan=` y a `d-tablero-3d.html?p=&plan=`, Asignación rápida de marca por tablero, aviso para tableros sin procesar | Un material que está en varios tableros aparece repetido. Como la marca es de la línea, cambiarla en un tablero la cambia en todos (lo dice la pantalla) |
| c) Revisión asistida | `propuesto` (IA simulada) | Pasada rápida antes de cotizar, o para quien no conoce bien el BOM | Las propuestas se calculan de forma determinista desde el store: atributos faltantes con el valor sacado de los comentarios (b7 → 300 mA, con la fuente «Daniel Ortega (Dirección)»), marca según las reglas de la obra, inferidos por regla (gabinetes/bornes) para confirmar. Cada una trae fuentes y efecto, y se aplica o se descarta de a una. Lo que se aplica queda `src: 'MANUAL'`. Cada corrida cuesta USD 0,02 (`L.aiSpend`) | Si ninguna fuente dice el valor, no lo inventa y manda a completarlo a mano. Cuando `L.aiCan` es falso, no corre, no gasta y muestra la lista manual sin IA |

Por línea (detalle expandible, en la variante a):
- Desglose por tablero con repeticiones y un link «Ver en el plano».
- Cantidad extra (`extraQty`) y gama opcional (`gama`), con datalist sacado del catálogo.
- Problemas y hasta 5 coincidencias del catálogo, con precio `L.priceTag('referencia')`, marca de vencido y plazo.
- Comentarios (`L.addComment('line:<id>')`, `propuesto`).
- **Alternativa permitida** (`planificado`, BOM alternativo #828/#829): otra marca del mismo material, u otro componente base con sus atributos. Se guarda en la línea como `alt: {typeId, attrs, brand, note}`, aparece como etiqueta «alt: …» y el texto explica que el distribuidor la ve en la solicitud y que queda *sugerida* hasta que ingeniería apruebe la equivalencia. Se valida: necesita marca, distinta de la de la línea, y atributos esenciales completos.
- Eliminar con confirmación: `deleted: true`, con Deshacer.

Agregar línea a mano: exige componente base y una cantidad entera > 0. Si faltan atributos esenciales avisa, pero la deja agregar (cotiza sin coincidencias). La cantidad es por tablero, o «sin tablero» como cantidad extra. Queda `src: 'MANUAL'`.

## Estados de galería

- `d-bom.html?p=p1` · `?p=p1&v=tablero` · `?p=p1&v=asistida` · `?p=p1&v=asistida&correr=1` (corre la revisión al abrir si todavía no corrió; gasta USD 0,02)
- `?p=p1&linea=b7` (línea enfocada con el detalle abierto)
- `?p=p1&estado=error`: «No pudimos guardar «Marca Schneider en …». El BOM queda como estaba», con Reintentar (guarda el cambio pendiente) y Descartar.
- `?p=p1&estado=conflicto`: 409, alguien más editó. Todo cambio se rechaza con un diálogo «Recargar el BOM».
- `?p=p4` (vacío real) · `?p=p1&estado=vacio` · `?p=p1&estado=cargando` (esqueleto) · `?p=p1&v=asistida&estado=limite` (límite de IA simulado)

## Pruebas

`node tools/tests/bom.test.js`, resultado: **✓ bom: todo bien, 65 verificaciones, 0 errores de consola.**
Cubre:
- b9/b12 con marca → el bloqueo de líneas desaparece; con los símbolos descartados, Pedir cotización → `d-cotizacion.html?p=p1`.
- b7 con 300 mA → pasa de 0 a 2 coincidencias.
- Marca en bloque, Asignación rápida por tablero, Aplicar mis preferidas.
- Excluir una marca: aviso, lo ya guardado no cambia.
- Flechas y Enter en la grilla.
- Línea manual: la validación y el alta con 12 u.
- Eliminar, primero cancelando y después confirmando.
- Comentario; alternativa con su validación, guardada y con etiqueta.
- Persistencia tras recargar; `d-kit.html` con `keepState` ve los cambios a través de `L.lineIssues`.
- XLSX: se abre con python `zipfile`. Térmica 1P+N · 10 A: dibujada 18, a comprar **36**. En la hoja «Por tablero», TS-P tipo 6×4 = 24. Las 8 columnas y las 2 hojas.
- CSV: encabezado y 19 filas.
- Revisión asistida: gasta USD 0,02 en `ai.ledger`, la fuente es el comentario, aplicar deja `MANUAL`, descartar no cambia la línea. Con `ai.ledger` en 39,99 rechaza sin gastar y muestra la lista manual.
- Estados error (y reintento), conflicto y vacío (p4 y `?estado=vacio`).
- Sin scroll horizontal de página a 1024 en las tres variantes.

Capturas en `shots/tests/bom/`:
- a 1440: `a-componente-1440`, `a-detalle-linea`, `a-listo-para-cotizar`, `b-tablero-1440`, `c-asistida-antes`, `c-asistida-propuestas`, `c-asistida-limite`, `estado-error`, `estado-conflicto`, `estado-vacio-p4`
- a 1024: `a-componente-1024`, `b-tablero-1024`, `c-asistida-1024`

Revisadas a ojo y corregidas: filas demasiado altas, la columna Estado cortada a 1440 (se unieron Componente base y Atributos en una sola celda), el padding de las tablas del detalle, y un aviso de «marca excluida» que decía «Cotiza sin coincidencias».

## Supuestos

- Guardado por cambio (autosave), no un botón «Guardar BOM» como en la app. Los estados de error y conflicto se simulan sobre ese guardado.
- En la grilla, la marca ofrece las marcas con coincidencia exacta en catálogo. Si no hay ninguna, las que venden ese componente base. Una marca guardada sin catálogo aparece en su propio grupo.
- «Aplicar mis preferidas» solo completa líneas **sin marca**, con la primera preferida no excluida que tenga el material en catálogo (como en la app).
- Las reglas de cuenta no existen en el store: solo se editan las de la obra (`project.brandRules`) y la pantalla aclara que las de cuenta no están cargadas en el prototipo.
- Las líneas propuestas descartadas se recuerdan por corrida (`L.pref('bom:asistida:<p>')`). Una corrida nueva las vuelve a proponer.
- `attrs` opcionales vacíos se borran de la línea nueva; los esenciales quedan en `null`.

## Pedidos al coordinador

1. **Reglas de marca de la cuenta**: agregar al seed `s.company.brandRules = { preferred: [], blocked: [] }` y una función `L.effectiveBrandRules(pid) → { preferred, blocked, from: {brand: 'obra'|'cuenta'} }` (la obra pisa a la cuenta). La usarían `L.lineIssues` (MARCA_EXCLUIDA) y esta pantalla. Hoy solo existen las de la obra.
2. **`alt` en la solicitud**: `L.createRequest` debería copiar `line.alt` a la solicitud (p. ej. `r.altSnapshot[lineId]`) para que `d-prov-oferta.html` muestre «alternativa aceptada por el cliente». Hoy el campo vive solo en la línea.
3. **Sticky del shell en capturas de página completa**: `.side { position: sticky; height: 100vh }` hace que, en `fullPage: true`, la barra lateral salga cortada o a mitad de página si la página estaba scrolleada. En las pruebas lo esquivé con `scrollTo(0,0)`. Una alternativa sería que `shot()` en `pw.js` haga ese scroll.
4. `L.lineIssues`: el código `MARCA_EXCLUIDA` no trae `quote`. Si se quiere mostrar en el anticipo de cotización que el matcher igual lo encuentra, conviene marcarlo explícitamente (no cambia reglas, es solo un dato).

## Marcos para la galería (`kind|src|caption|note`)

```
laptop|d-bom.html?p=p1&v=componente|BOM · Por componente|existe (rediseñada): grilla experta, edición en celda, anticipo de cotización, asignación rápida
laptop|d-bom.html?p=p1&linea=b7|BOM · Línea enfocada (b7 sin sensibilidad)|detalle: por tablero, coincidencias, alternativa (planificado #828), comentarios
laptop|d-bom.html?p=p1&v=tablero|BOM · Por tablero|existe: subtotal por tablero, repeticiones, links a plano y 3D
laptop|d-bom.html?p=p1&v=asistida&correr=1|BOM · Revisión asistida|propuesto, IA simulada: propuestas con fuentes, aplicar/descartar, USD 0,02 por corrida
laptop|d-bom.html?p=p1&v=asistida&estado=limite|BOM · Límite de IA alcanzado|no corre, no gasta, revisión manual
laptop|d-bom.html?p=p1&estado=error|BOM · No se pudo guardar|el BOM queda como estaba, reintentar
laptop|d-bom.html?p=p1&estado=conflicto|BOM · Conflicto (409)|otra persona editó: recargar
laptop|d-bom.html?p=p4|BOM · Obra sin BOM|vacío real: subir planos o agregar a mano
```
