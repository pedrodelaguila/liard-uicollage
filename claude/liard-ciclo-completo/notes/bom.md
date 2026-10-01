# Área B · BOM, matching y tablero 3D

Usuaria principal: Martina (ingeniera). Hernán (dirección) usa las reglas; Lucas es autor de algunas.

## Archivos

| Archivo | Qué es |
| --- | --- |
| `d-bom-editor.html` | Editor del BOM (existe + s4): trazabilidad, bandeja «Información insuficiente», `?vista=tabla\|por-plano\|guiada` |
| `d-bom-reglas.html` | Reglas de la empresa y accesorios derivados (h1) |
| `d-bom-alternativo.html` | BOM alternativo Schneider → ABB (s5), con aviso IEC 61439 |
| `d-bom-3d.html` | Tablero 3D vinculado al BOM (h2), `?vista=3d\|frente\|tabla` |
| `m-bom-linea.html` | Una línea desde el teléfono, con su pregunta y la trazabilidad (s4) |
| `bom.js` | `window.BOM`: lectura y escritura de las líneas, trazabilidad, reglas, alternativa, preguntas y sugerencias |
| `bom.css` | Estilos del área (solo tokens) |
| `tablero3d.js` | Motor 3D/2D reutilizable (API abajo) |
| `sections/b-bom.js` | 5 secciones: B1 200, B2 210, B3 220, B4 230, B5 240 |

## Pantallas y estados

- **d-bom-editor**: `?linea=<id>`, `?filtro=blocked|det|inf…`, `?vista=por-plano&plano=<id>`, `?vista=guiada`, `?estado=cargando|vacio|sin-ia`.
- **d-bom-reglas**: `?regla=<r1…r8>`, `?tipo=acc|falta`, `?estado=vacio|error`.
- **d-bom-alternativo**: `?vista=lado|diferencias`, `?estado=limite`.
- **d-bom-3d**: `?vista=3d|frente|tabla`, `?linea=<id>`, `?color=estado|compra`, `?estado=sin-3d|vacio` (también pasa solo al frente si no hay WebGL).
- **m-bom-linea**: `?linea=<id>`.

Entre todas: vacío (editor, reglas, 3D), cargando (editor), error (reglas), límite (alternativo), sin IA (editor).

## Estado compartido que escribe el área

- `lineas[i].attrs`, `.faltan`, `.estado`, `.org`, `.motivo` (se borra al destrabar), `.reparo`, `.marca`, `.gama`, `.comprar`, `.regla` y `.manual` (true = «se cotiza a mano»). El estado se recalcula con `BOM.estadoDe` (sin componente base → blocked salvo `manual`; esencial vacío → blocked; `reparo` → warning).
- `avisos.unshift(...)` al destrabar una línea y al pedir cotización con alternativa.
- Privado `x.bom.*`: `historial[lineaId]`, `revisadas`, `consultas`, `reglas[id]` (activa/pausada), `aplicadas`, `alt` (líneas incluidas y qué se envía).
- Lee `compra.adjudicadas` (C) para el color por estado de compra; si no hay, usa un reparto fijo coherente con PED-2026-031 (`REPARTO` en bom.js).

## API de `tablero3d.js` (para el área E, `m-tal-tablero.html`)

Requiere `vendor/three.global.js` antes. No depende de `app.js` ni de `data.js`.

```js
Tablero3D.hayWebGL()                  // bool
Tablero3D.armado(B.tgbt, lineas)      // [{ fila, filaN, linea, l, ref, refs[], cant, mod, ancho, tipo }]
Tablero3D.ocupacion(B.tgbt)           // [{ fila, n, usados, capacidad }]  módulos de 18 mm
Tablero3D.csv(filasDeArmado)          // texto CSV con BOM UTF-8 y «;»
Tablero3D.expandir('Q9–Q14', 6)       // ['Q9', …, 'Q14']
Tablero3D.FAMILIAS, Tablero3D.COLORES // tipo → familia; estado → color

const ctl = Tablero3D.montar(el, {   // lanza Error('Sin WebGL') si no puede: atrapalo y usá frente()
  tablero: B.tgbt, lineas: L.get('lineas'),
  gabinete: 'l18',                    // opcional: línea del gabinete (tocar la envolvente la selecciona)
  color: 'estado' | 'compra', compra: { [lineaId]: 'CONFIRMED'|'SENT'|'NONE'|'SIN'|'REJECTED'|'EXPIRED' },
  etiquetas: true, puerta: 'abierta' | 'cerrada', titulo: 'TGBT · TD-26-0412',
  onSeleccion: (lineaId | null, ref) => {},   // ref = 'Q1', 'TI2', 'X1:3', 'Gabinete', 'Puerta'
});
const ctl2 = Tablero3D.frente(el, { …mismas opciones, cotas: true }); // SVG, sin WebGL
```

El control: `seleccionar(id|null)`, `aislar(familia|null)`, `explotar(bool)`, `puerta(abierta)`, `cotas(bool)`, `color(modo, compra?)`, `reiniciar()`, `rotar(dAz, dPol)`, `zoom(f)`, `png()` (dataURL; `null` en el frente), `svg()` (solo frente), `actualizar(lineas)`, `estado()`, `destruir()`, `lienzo` (canvas).

El `el` tiene que tener tamaño (posición relativa y alto). El motor le agrega `.t3d` y un tooltip `.t3d-tip`: los estilos están en `bom.css` (`.t3d`, `.t3d-tip`, `.t2d*`). Si E no carga `bom.css`, el canvas igual se dibuja, pero el tooltip y el frente quedan sin estilo. Revisé que la llamada actual de E (`montar` + `onSeleccion(lid, ref)` + `destruir`) siga siendo compatible. **No cambio firmas sin avisar.**

Rendimiento: no hay bucle continuo. Se dibuja un cuadro por cambio de cámara, selección o animación, y con `prefers-reduced-motion` las animaciones son instantáneas. Teclado: con el lienzo enfocado, ← → ↑ ↓ giran, + − acercan y 0 reinicia.

## Decisiones de diseño

- **Trazabilidad como tabla**, no como texto: «De dónde sale · Dibujada · Repet. · A comprar», con filas extra coloreadas por origen (regla, IA, manual) y el total. La diferencia entre dibujada y a comprar siempre se explica.
- **La bandeja hace preguntas, no muestra errores**. Cada línea trabada tiene una pregunta, opciones válidas del componente base, la sugerencia de la IA (fuente, confianza, US$) y una salida humana: preguntar al proyectista o cotizar a mano.
- La **variante guiada** es la misma bandeja, una pregunta por pantalla, con atajos 1–5.
- El selector de vista del editor va dentro de la página (no en el encabezado) para que el título y las acciones no se aprieten.
- **Reglas** como frase («Cuando · Agregá · Cantidad · Si no alcanza») con vista previa del impacto en $ y en líneas antes de aplicar.
- **Alternativo**: la comparación pone lado a lado el total, el plazo de la línea más lenta, el stock y el riesgo de diseño. El aviso IEC 61439 solo aparece para potencia y gabinete, y para enviar hay que confirmarlo.
- **3D**: el color del aparato mezcla blanco con el color de estado para que la referencia se lea; la selección es azul primario y el resto se atenúa (solo si lo seleccionado está en el tablero). La puerta, cerrada, muestra la placa y el «Riesgo eléctrico».
- En las pantallas del área desactivé la animación de entrada de `.page` (en headless queda congelada en opacidad 0; ver pedidos).

## Supuestos (donde la doc no decide)

- La sugerencia de la IA para el NH00 (125 A, confianza 0,62) y el costo de cada lectura (US$ 0,02) son inventados.
- «Gabinete» (`ENCLOSURE`) como componente base nuevo, con Alto, Ancho, Profundidad y Grado de protección esenciales: es mi lectura de «matching para todos los componentes» (S5). No existe en dev.
- Las cantidades de la trazabilidad de l15 (191 polos), l16 (160 salidas × 5 m) y l17 están armadas para que cierren con `data.js`. La regla r2 (cable por térmica) da 320 + 132 × 6 = 1.112 m.
- Alternativa ABB: factores de precio por gama y plazos inventados. El precio original es la mejor oferta **con stock**.
- **Cómo viaja al distribuidor** (para el área D): una sola línea con el original y la alternativa aceptada. El distribuidor elige por línea original, alternativa o ninguna, con precio, stock y plazo; no propone una tercera marca fuera de la contraoferta. El ingeniero adjudica por línea. Si adjudica un aparato de potencia o un gabinete de la alternativa, el aviso IEC 61439 viaja en la OC. La cantidad no se duplica.
- El tope de alternativas por plan (2 en Profesional) es inventado.

## Qué existe en dev y qué es nuevo

Existe: el editor del BOM consolidado (lista + inspector, «Por componentes / Por planos», componente base y atributos esenciales, marca y gama, acciones en lote, localizador, exportar), los estados `blocked / warning / ready` con sus textos, `NOT_FOUND` con `unmatchedReason`, las marcas preferidas y bloqueadas, y el multiplicador por plano.
Nuevo: origen por línea y su filtro, trazabilidad, historial, bandeja «Información insuficiente», vista guiada, consulta al proyectista, reglas, BOM alternativo, tablero 3D/frente/lista de armado y la línea en el teléfono.

## Pedidos al coordinador

1. `ui.css` `.page { animation: enter … both }`: en Chrome headless la animación queda en `currentTime 0` y la página sale en opacidad 0 en `tools/qa.mjs --shots` (las capturas del QA se ven lavadas). Propongo `animation-fill-mode: backwards` o saltearla con `?marco=1`. Mientras tanto la anulo en `bom.css`.
2. Si el área E muestra el 3D en `m-tal-tablero.html`, que cargue `bom.css` (o que se muevan `.t3d*` / `.t2d*` a `ui.css`) para el tooltip y el frente.
3. Que el área C lea `lineas[i].manual` («se cotiza a mano») como línea fuera del matching sin código, y `x.bom.alt.enviada` si quiere mostrar la alternativa en la matriz.

## Qué verifiqué y qué no

Verificado: el QA de `tools/qa.mjs` en todas las pantallas y estados (resultado abajo). Miré las capturas de cada vista. Recorrí con Playwright el 3D: clic en un aparato del lienzo → selecciona su línea en la lista (`?linea=l05`), lista → 3D, vista explotada, puerta, color por compra y teclado, sin errores. El lienzo dibuja (52 colores distintos en una muestra). Revisé que la firma usada por `m-tal-tablero.html` siga igual.
No verificado: el 3D con GPU real (solo SwiftShader), arrastrar con el mouse para girar, la descarga real de PNG/CSV dentro del marco de la galería, ni cómo se ve en la galería armada por el coordinador.
