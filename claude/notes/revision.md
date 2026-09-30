# revision · Revisión de detecciones en el plano (ingeniería)

Archivos: `d-plano.html`, `tools/tests/revision.test.js`, `notes/revision.md`. No toqué nada compartido.

## Pantallas

- **`d-plano.html` · Revisión en plano** `existe` (reinventada). El plano se elige con `?plan=<id>`. Sin `?plan`: si hay `?linea=`, el primer plano donde está esa línea; si no, el primer plano de la obra con símbolos pendientes; si no, el primer COMPLETED. Tiene selector de plano, estado, repeticiones y KPIs (símbolos / sin identificar / líneas con lectura incompleta).
- **Unifilar procedural en SVG**, generado desde el store con layout determinista: acometida arriba, marco punteado con el nombre y el título del tablero, cabecera (caja moldeada / seccionador), ojos de buey R-S-T, multimedidor y descargador colgados, juego de barras horizontal, ramas verticales (diferencial → grupo de térmicas, o térmica 4P directa), numeración de circuitos C1…, bornera al pie, gabinete en la esquina.
  - Hay un glifo IEC por símbolo, con `line.perPlan[planId]` glifos por línea, y el glifo depende del tipo: ITM, caja moldeada, seccionador, diferencial con toroide, contactor con bobina, guardamotor, IM, ⊗, DPS, borne y gabinete.
  - Cada glifo lleva su especificación estilo CAD (`4x32A / Curva C`) y su etiqueta (`Q7`, `DD1`). En tableros densos (más de 14 columnas) el texto va rotado 90°.
  - Los sin identificar van en su posición x/y, en rojo, con «?» y el texto leído. Los resueltos quedan en su lugar con un recuadro verde de «asignado a mano».
  - Rótulo fijo: «Vista esquemática generada desde las detecciones (simulada) · no es el DXF» + `L.sim`.
- **Comentarios del plano** `propuesto`: `L.addComment('plan:<id>')`, con la lista y la validación de vacío.
- **Marcar plano como revisado / Reabrir revisión**: pone `plan.reviewed` y `reviewedAt/By` y deja registro en la actividad. Si quedan pendientes, pide confirmación y avisa que siguen bloqueando.
- **Barra «Para cotizar la obra»**: se actualiza en vivo desde `L.blockers(pid)`, con badge de símbolos y links a los demás bloqueos.
- Links: `L.link('d-bom.html', {p, linea})`, que lleva la línea cuando hay una seleccionada, y `d-tablero-3d.html?p=..&plan=..`.

## Variantes (`L.variants`, key `plano`, mismo estado de partida)

| Variante | Qué es | Tarea que resuelve mejor | Tradeoff |
| --- | --- | --- | --- |
| a) **Lienzo experto** `existe` | Zoom con rueda, botones y +/−; pan arrastrando y con flechas; encuadrar (0/F). Hover o foco muestra un tooltip; Enter o clic abre el panel con la línea del BOM: tipo, atributos con marca de esencial, procedencia `L.srcTag`, dibujados en el plano / en la obra / a comprar con el multiplicador, problemas de `L.lineIssues` y completar un atributo esencial faltante. «Ver todos los iguales» ‹ › recorre y encuadra cada símbolo de la línea, igual que el localizador real. Filtros por familia (chips) y por estado (seg). Lista de sin identificar con resolver, descartar, ver en plano y lote con checkbox («Asignar a una línea…», «Descartar N» con confirmación). | Revisar un tablero entero y verificar el contexto (qué hay alrededor, contar iguales), rastrear una línea sospechosa del BOM (`?linea=`). | Es la que tiene más capacidad y más ruido visual. Para decidir 30 pendientes es más lenta que la guiada. |
| b) **Revisión una por una** `propuesto` | Cola con solo lo que necesita decisión: primero los sin identificar, después las líneas con lectura incompleta, que es el equivalente a baja confianza en los datos. Recorte grande y resaltado del símbolo, sugerencia `L.ai('Sugerencia')` con barra de confianza, candidatas 1–9 ordenadas por coincidencia con la sugerencia, progreso. Atajos: A acepta, D descarta, 1–9 asigna, N crea línea nueva, ←/→ mueve. «Descartar todos…» pide confirmación. Cuando no queda nada muestra un vacío de éxito con «Marcar como revisado» y «Seguir con <otro plano>». | Vaciar rápido los bloqueos antes de cotizar, con mucha repetición. | Pierde el contexto del tablero completo. Aceptar una sugerencia sin mirar es tentador, por eso la confianza está a la vista. |
| c) **Tabla accesible** `propuesto` | Todos los símbolos en una tabla ordenable (`L.sortable`: etiqueta, componente, especificación, línea, estado y procedencia, confianza) con los mismos filtros, resolver, descartar, lote y «Ver», que salta al lienzo con el símbolo encuadrado. | Lector de pantalla y solo teclado, auditoría o conteo, exportar mentalmente. | No tiene lectura espacial del unifilar. |

## Estados de galería (URLs)

- `d-plano.html?p=p1&plan=pl-tde`: lienzo experto, TDE con 2 sin identificar (u1 con sugerencia, u2 sin sugerencia)
- `d-plano.html?p=p1&linea=b6`: deep link, abre TGBT encuadrando el 1.º de 6 «Térmica 4P 32 A»
- `d-plano.html?p=p1&plan=pl-tgbt`: tablero grande revisado, con 1 línea con lectura incompleta (b7 sin sensibilidad)
- `d-plano.html?p=p1&plan=pl-tspb`: tablero denso con texto rotado
- `d-plano.html?p=p1&plan=pl-tde&v=guiada`: revisión una por una
- `d-plano.html?p=p1&plan=pl-tde&v=tabla`: tabla accesible
- `d-plano.html?p=p1&plan=pl-tgbt&v=guiada`: cola con lectura incompleta
- `d-plano.html?p=p2&plan=pl-h1&v=guiada`: cero pendientes, vacío de éxito
- `d-plano.html?p=p1&plan=pl-tde&estado=error`: error 504 con link a reprocesar en `d-obra.html`
- `d-plano.html?p=p1&estado=cargando`: esqueleto
- `d-plano.html?p=p1&plan=pl-tsb`: plano sin procesar

## Prueba

`node tools/tests/revision.test.js`: **✓ revision: todo bien, 66 comprobaciones, 0 errores de consola.**

Cubre:
- plano por defecto y cantidad de glifos igual a la suma de `perPlan` más los sin identificar
- u1 a una línea existente (b12 +1 en TDE)
- u2 a una línea nueva, con validación del componente base y de los 3 esenciales
- persistencia tras recargar
- descarte individual
- bloqueos a 0 símbolos (UI y `L.blockers`)
- marcar revisado, con y sin pendientes, y persistencia
- lote: descartar con confirmación y cancelación, y asignar 2 a una línea
- zoom y pan por teclado y rueda, y encuadrar
- Enter sobre un símbolo, y completar un atributo faltante
- filtros por estado y familia
- `?linea=` con encuadre y «Ver todos los iguales» 1→2 de 6
- links a BOM y 3D
- guiada con ←/→, A, D y 1, más confirmar «Descartar todos»
- tabla: orden por clic y teclado, y acciones
- comentarios con validación
- estados error, cargando y sin procesar
- 1024 px, y movimiento reducido

Capturas en `shots/tests/revision/`: experto, experto-linea, experto-seleccion, resolver-dialogo, crear-linea-validacion, lote, guiada, guiada-vacio, tabla, error y cargando, a 1440, más las principales a 1024. Las miré todas y corregí íconos gigantes, etiquetas superpuestas, `kbd` en el botón primario, el estado error que decía «Listo», el anillo de foco en el título del vacío y el desborde de la tabla a 1024.

## Supuestos

- «Baja confianza» en la cola guiada = líneas con un atributo esencial sin leer. Los datos no tienen confianza por símbolo detectado, solo `conf` de los sin identificar.
- Los sin identificar resueltos ocupan su x/y y reemplazan uno de los glifos de árbol de esa línea, para que el total dibujado siga siendo `perPlan`.
- «Aceptar sugerencia» llama a `L.resolveSymbol(uid, {typeId: guess, attrs: guessAttrs})`: si existe una línea con los mismos atributos (mismo JSON) se suma a esa; si no, crea una manual sin marca.
- `?estado=error` fuerza la vista de error sobre el plano elegido aunque en los datos esté COMPLETED.
- Crear línea nueva desde un símbolo es propuesto: la app real pide texto libre de especificación. Acá se usan listas cerradas de `L.type`.

## Pedidos al coordinador

1. `L.resolveSymbol` compara con `JSON.stringify(l.attrs) === JSON.stringify(attrs)`, así que el orden de claves importa. Si una pantalla arma `attrs` en otro orden (p. ej. `{in, polos, curva}`) crea una línea duplicada en vez de sumar. Sugerencia: comparar por los atributos del tipo (`t.attrs.every(a => String(l.attrs[a.k]) === String(attrs[a.k]))`). Para reproducirlo: `L.resolveSymbol('u1', {typeId:'itm', attrs:{in:20, polos:'2P', curva:'C'}})` crea una línea nueva en vez de sumar a b12.
2. Opcional, en data.js: confianza por línea detectada (`conf` en `bomLines` o por plano) para que la cola guiada pueda incluir detecciones de baja confianza reales y no solo lecturas incompletas.
3. La galería puede usar `v=` y `plan=` directo; la página persiste la variante en `L.pref('v:plano')`.

## Líneas de galería

```
d|d-plano.html?p=p1&plan=pl-tde|Revisión en plano · lienzo experto|Unifilar simulado desde las detecciones; 2 sin identificar en TDE
d|d-plano.html?p=p1&linea=b6|Revisión en plano · desde una línea del BOM|Abre TGBT encuadrando la 1.ª de 6 térmicas 4P 32 A; ‹ › recorre las iguales
d|d-plano.html?p=p1&plan=pl-tspb|Revisión en plano · tablero denso|Texto de especificación rotado cuando hay más de 14 salidas
d|d-plano.html?p=p1&plan=pl-tde&v=guiada|Revisión una por una|Cola de lo que necesita decisión; A acepta, D descarta, 1–9 asigna
d|d-plano.html?p=p1&plan=pl-tgbt&v=guiada|Revisión una por una · lectura incompleta|Diferencial sin sensibilidad: completar el atributo esencial
d|d-plano.html?p=p1&plan=pl-tde&v=tabla|Revisión en plano · tabla accesible|Todos los símbolos, ordenables, con las mismas acciones
d|d-plano.html?p=p2&plan=pl-h1&v=guiada|Revisión en plano · nada pendiente|Vacío de éxito con marcar como revisado
d|d-plano.html?p=p1&plan=pl-tde&estado=error|Revisión en plano · error de detección|504: explica y lleva a reprocesar en Planos
d|d-plano.html?p=p1&estado=cargando|Revisión en plano · cargando|Esqueleto del lienzo y del panel
```
