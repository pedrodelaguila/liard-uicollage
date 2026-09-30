# Área catálogo (distribuidor, cuenta `sur`)

Archivos: `d-prov-catalogo.html`, `d-prov-vinculacion.html`, `tools/tests/catalogo.test.js`. Ambas páginas `data-role="SUPPLIER"`.
No se tocó ningún archivo compartido.

## Pantallas

### `d-prov-catalogo.html` · Catálogo
- **Resumen** `existe`: productos (publicados / despublicados), % vinculado a un componente base con meter, precios vencidos
  (`L.isStale`), última carga. Todo filtrado por `session.supplierId`; aviso de que ningún otro distribuidor ve estos precios.
- **Tabla** `existe`: búsqueda (nombre, código, marca, gama, código de la marca), chips Todos / Publicados / Despublicados /
  Precio vencido, selects familia · marca · lectura (READ/PENDING/FAILED) · vínculo (AUTO/MANUAL/UNLINKED) guardados con
  `L.pref('catalogo:*')`, orden por columna (`L.sortable`), 20 por página. Estado de vínculo con el vocabulario de producción.
- **Alta / edición** `existe`: código, nombre, precio (punto decimal, hasta 14 enteros + 4 decimales, > 0), moneda ARS/USD,
  vigencia, marca, código de la marca (uno por marca: SCH), gama (submarca), plazo mín./máx. (0–365, máx. ≥ mín.). Si el código ya existe
  (sin distinguir mayúsculas) se rechaza. Un producto nuevo queda `PENDING`. Si cambia el nombre de un AUTO, vuelve a `PENDING`/`UNLINKED`.
  Un MANUAL conserva su vínculo.
- **Historial de precios** `propuesto` (dentro del diálogo de edición): cada cambio de precio por edición o importación guarda el anterior en
  `item.priceHistory` `{at, price, currency, validUntil, source}`.
- **Publicar / despublicar** `existe` con Deshacer; **eliminar** con confirmación, que avisa en cuántas líneas de BOM deja de aparecer.
- **Importar planilla** `existe`, en 3 pasos (Elegir planilla → Revisar la lectura → Confirmar). El CSV se lee en el navegador: separador `;`/`,`/tab
  autodetectado, comillas, BOM UTF-8, fila de encabezados elegible, formato de números `1.234,56` / `1,234.56`
  autodetectado. Las columnas se mapean por alias; Moneda, Marca, Código de la marca y Gama aceptan «Valor fijo para toda la planilla».
  El mapeo se recuerda en `L.pref('catalogo:mapeo')` cuando los encabezados son iguales. Veredicto: aceptada / con advertencias / rechazada,
  con controles por fila (sin código, sin nombre, precio ilegible, moneda desconocida, sin marca, código repetido: queda la última fila).
  - Modo **«Reemplazar catálogo»** `existe`: lo que no viene en la planilla se **despublica** (producción hace `isActive: false`, no borra).
    Los vínculos MANUAL con el mismo código se conservan.
  - Modo **«Actualizar sin reemplazar»** `planificado` (#835): crea y actualiza, y no despublica nada.
  - La confirmación muestra nuevos / actualizados / sin cambios / se despublican / descartados, la tabla de cambios (precio anterior → nuevo)
    y cuántos quedan por leer con su costo. Escribe en el store. Los productos nuevos o con nombre cambiado quedan `PENDING`.
  - Cada carga se registra en `s.ui.importHistory` y se lista en «Cargas anteriores».
- **Plantilla XLSX** (`L.xlsx`, con hojas Catálogo + Instrucciones) y **Exportar catálogo XLSX** (catálogo actual con componente base y vínculo).

### `d-prov-vinculacion.html` · Vinculación IA
- **Lectura del catálogo** `existe` · `L.ai()` · `L.sim()`. «Leer N pendientes» procesa uno cada 650 ms con barra, «ahora: código»,
  transcurrido, tiempo restante, costo acumulado y **Cancelar lectura** (lo no leído queda PENDING). Cada producto cobra
  USD 0,00146 vía `L.aiSpend('Lectura catálogo', …)`. Si `L.aiCan` es false, rechaza antes de empezar con un mensaje que deja el
  camino manual. Si el límite se alcanza a mitad de la corrida, se detiene. En producción la lectura corre sola después de cada carga, así que
  dispararla a mano está marcado `propuesto`.
- **Lectura simulada determinística** (parser del nombre, en la página): palabra clave → tipo; los patrones `4X40`, `300MA`, `6KA`, `24V`, `IP55`,
  `800X600`, colores y curva → atributos, **siempre contra la lista cerrada**:
  - `DIF. 4X40 300MA ACTI9 SUPERINMUNIZADO` → AUTO dif 4P · 40 A · 300 mA (clase SI).
  - `TERMICA NXB 3X50 C 6KA` → FAILED: «leyó corriente nominal 50 A, que no está en la lista (6…63 A)».
  - `PILOTO LED AMBAR 24V 22MM` → FAILED: «leyó color Ámbar, que no está en la lista (Rojo, Verde, Amarillo)».
  - Tipo reconocido sin atributo → «Les falta un atributo». Nada reconocido → «Sin identificar».
- **Estandarización**: se elige el componente base (select por familia) y cada atributo con radios de valores cerrados (sin texto libre;
  «Sin valor» solo en los opcionales). La propuesta de la IA viene precargada y marcada con borde punteado. **Vincular** → MANUAL
  (se rechaza si falta un esencial). **Desvincular** → UNLINKED. **Siguiente pendiente**.
- **Impacto**: antes de vincular, «Si lo vinculás así, aparece en N obras que cotizan este material hoy». Después, «Esta fila ahora
  aparece en N obras que cotizan este material (M líneas del BOM)», calculado con `L.matches(l, sid)` sobre las líneas de ingeniería.

## Variantes (Vinculación, `?v=`)
| Variante | Cap. | Tradeoff | Para qué tarea |
| --- | --- | --- | --- |
| `bandeja` · Bandeja | existe | Tabla con pestañas (Para revisar / Por leer / Vinculados) + editor lateral. Da contexto y deja elegir el orden, pero cuesta más clics por fila | Revisar un catálogo grande, comparar filas parecidas, corregir vinculados |
| `tarjetas` · Tarjetas una por una | propuesto | Un producto por vez con atajos (Enter vincular, U desvincular, N siguiente pendiente, J/K navegar). Es lo más rápido, pero no se ve el conjunto | Vaciar la cola después de una carga, trabajo de teclado repetitivo |

## Estados abribles por URL
- `d-prov-catalogo.html` · `?estado=vacio` · `?estado=cargando` · `?estado=error` (Reintentar) · `?dialogo=nuevo` ·
  `?dialogo=editar&item=ci-9` · `?dialogo=importar` · `?dialogo=importar&paso=2&muestra=1` · `?dialogo=importar&paso=3&muestra=1`
- `d-prov-vinculacion.html` · `?v=bandeja` · `?v=tarjetas` · `?item=ci-p2` · `?tab=vinculados` · `?estado=leyendo` (lectura de ejemplo, no
  escribe) · `?estado=limite` (rechazo por presupuesto, sin tocar el consumo real) · `?estado=vacio`

## Prueba
`cd tools && node tests/catalogo.test.js` → **✓ catalogo: todo bien, 70 checks, 0 errores de consola**. Pasó 3 de 3 corridas después del último
arreglo de timing. Cubre: aislamiento por distribuidor, búsqueda, filtros, orden, paginación, validaciones del alta, PENDING al crear, nombre cambiado → PENDING,
priceHistory visible, despublicar sacándolo de `L.matches` (visto desde otra página), eliminar con confirmación, importación de la muestra
(reemplazo: 3 nuevos, 4 actualizados, 49 despublicados; MANUAL de ci-p2 sobrevive), un CSV real con coma, BOM y comillas en modo actualizar (precio y moneda
inválidos descartados, nada se despublica), mapeo recordado después de recargar, XLSX de plantilla y exportación abiertos y verificados, lectura IA (ci-p1 AUTO,
ci-p3 FAILED Ámbar, costo = N × 0,00146), cancelar la lectura, ci-p2 FAILED con motivo → MANUAL 3P 63 A C, impacto, desvincular, tarjetas con J y Enter,
rechazo por presupuesto (`?estado=limite` y `L.aiCan` false de verdad), estados por URL, 1024 px, persistencia y Reiniciar demo.
Capturas en `shots/tests/catalogo/` (1440 y 1024). Las revisé todas y corregí: mapeo recortado, plurales, kbd invisible en el
botón primario, meter de IA oculto, bandeja vacía durante la lectura y encabezado apretado a 1024.
No probé: móvil (no hay pantallas `m-` en esta área) ni `file://`. Las páginas no usan nada que lo impida, pero no las abrí así.

## Supuestos
- La importación del prototipo lee **CSV**. Producción lee solo `.xlsx`: un `.xlsx` se rechaza con el camino «guardala como CSV UTF-8».
- «Reemplazar» **despublica** lo que falta (como `replaceCatalog`, `isActive: false`) en lugar de borrarlo.
- `brandCode` es un campo nuevo en el ítem. Si falta, se muestra derivado de la marca (3 letras).
- Los resultados de lectura no vinculados guardan `item.guess {typeId, attrs, bad, miss}` + `readingNote`. `unlinkedByUser` distingue
  «Sin vincular» de «Sin identificar». La impresión en N obras cuenta las líneas que pasan `L.matches` en todas las obras, no solo las que cotizan hoy.
- Con los datos semilla ninguna línea de ingeniería pide dif 4P 40 A 300 mA, así que el impacto de ci-p1 da 0 obras (honesto).

## Pedidos al coordinador
1. `L.matchesDraft(line, item) → boolean`: la misma regla que `L.matches`, pero contra un ítem en borrador (sin estar en el store), para
   la vista previa de impacto. Hoy está duplicada en `impactDraft` de `d-prov-vinculacion.html`.
2. Posible bug en `L.matches`: compara `String(c.attrs[k]) === String(l.attrs[k])`, así que una línea con un esencial en `null` (b7 `sens: null`) matchearía un ítem que también tenga ese atributo en `null` (`"null" === "null"`). Hoy ningún ítem de la semilla lo tiene. Reproducir: `L.store.update(s => s.catalog.find(c => c.id === 'ci-p2').attrs = { polos: '4P', in: 63, sens: null })` con `typeId: 'dif'` y publicado. Sugerencia: exigir `!L.missingAttrs(l).length`.
3. Si otras áreas van a leer `item.priceHistory`, `item.brandCode` o `s.ui.importHistory`, documentarlos en CONTRATOS.md.

## Galería
```
d|d-prov-catalogo.html|Catálogo del distribuidor|Resumen propio, filtros, publicar/despublicar · existe
d|d-prov-catalogo.html?dialogo=editar&item=ci-9|Editar producto|Historial de precios · propuesto
d|d-prov-catalogo.html?dialogo=importar&paso=2&muestra=1|Importar: revisar la lectura|Mapeo de columnas y controles por fila · existe
d|d-prov-catalogo.html?dialogo=importar&paso=3&muestra=1|Importar: confirmar|Reemplazar (existe) o Actualizar sin reemplazar (#835, planificado)
d|d-prov-catalogo.html?estado=vacio|Catálogo vacío|Invita a importar o descargar la plantilla
d|d-prov-vinculacion.html?v=bandeja&item=ci-p2|Vinculación · Bandeja|FAILED 50 A con motivo, valores cerrados, impacto · existe
d|d-prov-vinculacion.html?v=tarjetas|Vinculación · Tarjetas una por una|Atajos Enter/U/N/J/K · propuesto
d|d-prov-vinculacion.html?estado=leyendo|Lectura en curso|Progreso, tiempo restante, costo USD 0,00146/línea, cancelable
d|d-prov-vinculacion.html?estado=limite|Límite de IA alcanzado|Rechazo antes de gastar; camino manual
```
