# tablero3d (propuesto)

## Qué es
Un modelo 3D **conceptual** de un tablero, armado a partir de las líneas del BOM de **un** plano. Sirve para revisar cantidades, marcas y precios sobre algo que se parece al tablero que se va a construir. No es un plano de montaje ni un cálculo de gabinete. La leyenda grande lo dice en pantalla, y también la llevan el PNG y el CSV. Motivo: los planos son unifilares, sin geometría física (research/01 §5), y dimensionar un gabinete roza la exclusión de «cálculos de ingeniería».

## Archivos (propios)
- `d-tablero-3d.html`: escritorio.
- `m-tablero-3d.html` (`body.m`): móvil, pensado para el tacto.
- `tablero3d-engine.js`: modelo (layout), motor three.js, vista 2D SVG, CSV, panel de detalle y controlador de pantalla. Lo usan las dos páginas (el coordinador autorizó un archivo propio).
- `tools/tests/tablero3d.test.js`: 78 comprobaciones. Se corre con `node tools/tests/tablero3d.test.js`.
- `shots/tests/tablero3d/*.png`: capturas `desk-cerrado`, `desk-seleccion`, `desk-explotada`, `desk-aislado`, `desk-2d`, `desk-tspb`, `desk-ofertas`, `desk-vacio`, `desk-sin-webgl`, `movil`, `movil-hoja`, `movil-explotada`.

## URLs y estados
| URL | Qué muestra |
| --- | --- |
| `d-tablero-3d.html?p=p1` | TGBT (primer plano COMPLETED) |
| `…&plan=pl-tspb` | el tablero más cargado (61 aparatos, 36 bornes, aviso de que no entra en la placa) |
| `…&plan=pl-tstipo` | × 4 repeticiones (se dibuja uno; «a comprar» multiplica) |
| `…&plan=pl-tde&linea=b4&explotada=60` | plano, selección y explotada por URL |
| `…&familia=Señalización` | familia aislada |
| `…&vista=2d` | vista 2D / tabla |
| `…&plan=pl-tsb` | plano PENDING: explica por qué no se dibuja |
| `d-tablero-3d.html?p=p4` o `?estado=vacio` | vacío, con acción hacia los planos |
| `…&estado=sin-webgl` | sin WebGL: nota más 2D/tabla, todo sigue funcionando |
| `d-tablero-3d.html?p=p2` | obra con solicitud SC-0141: el panel muestra ofertas confirmadas con stock |
| `m-tablero-3d.html?p=p1` (y `&estado=sin-webgl`) | móvil |

## Reglas del modelo (aproximaciones declaradas)
- Cantidad por línea = `line.perPlan[planId]`, es decir los símbolos dibujados en **ese** plano. Las repeticiones del plano no se dibujan: se muestran como «× N» y en el panel «a comprar = dibujada × repeticiones».
- Gabinete: la medida sale de la línea `gab` del plano (`medida` alto×ancho). Si el plano no tiene línea `gab`, se usa 800×600 **por defecto**, y la pantalla, el CSV y la nota lo dicen. El fondo del gabinete es supuesto (250/300/400 mm según el alto).
- Aparatos modulares: el ancho es de 18 mm por módulo según los polos (1P = 1, 1P+N/2P = 2, 3P = 3, 4P = 4); los diferenciales y descargadores de 4P ocupan 4 módulos. Los aparatos de caja moldeada y los seccionadores de más de 125 A van en una fila superior de la placa. Los contactores y guardamotores tienen un ancho fijo. Los rieles se ordenan así: seccionador → DPS → térmicas de 3/4P → diferenciales → térmicas → guardamotor → contactor, y dentro de cada grupo por orden del BOM. Los bornes van en bornera abajo. Los ojos de buey y el multimedidor van en la puerta.
- Líneas sin componente base: no se dibujan, pero se cuentan en el resumen. Símbolos sin identificar del plano: aparece un aviso con link a `d-plano.html`.
- Si no entra en la placa, se avisa «no entran… revisá la medida (el modelo no la calcula)». No se agranda el gabinete solo.

## Interacción
- Girar: arrastrar, flechas, o un dedo en móvil. Desplazar: Mayús+arrastrar, clic derecho, Mayús+flechas, o dos dedos. Zoom: rueda, `+`/`−`, botones, o pellizcar. `0` vuelve a la vista inicial. `N`/`P` recorren las líneas. `Esc` quita la selección.
- Seleccionar (clic o toque): material emisivo volt, contorno, y bornes instanciados recoloreados. La selección se sincroniza entre el 3D, la lista, el SVG y la tabla, y pasa a `?linea=`. El panel (hoja inferior en móvil) muestra el componente base, los atributos (con «Falta» si falta uno esencial), la marca, la procedencia, la ubicación estimada, dibujada/rep./a comprar, y el rango de **precio de referencia** del catálogo (no confirmado). Si la hay, también muestra la **oferta confirmada** con su stock, vencimiento y estado de la alternativa, y el **pedido**. Tiene links a `d-plano.html?p=&plan=&linea=` y a `d-bom.html?p=&linea=`.
- Explotada: control de 0 a 100 con easing cúbico. La placa, los rieles, los aparatos y la puerta se separan en profundidad; en pantallas anchas la puerta además se corre al costado. «Animar» solo corre al pedirlo: nunca hay animación automática, y con `prefers-reduced-motion` salta al valor final.
- Aislar familia: lo demás queda fantasma (8 % de opacidad) y no se puede tocar.
- Descargas reales: el PNG del lienzo (`preserveDrawingBuffer`) sale con una franja al pie que lleva la leyenda (o el PNG del SVG en la vista 2D). El CSV «lista del tablero» (`L.csv`, `;`, BOM UTF-8) trae una fila por línea (familia, material, marca, dibujada, repeticiones, a comprar, ubicación, módulos, medidas estimadas, procedencia, precio de referencia mín./máx.) y la leyenda al pie.
- En vivo: con `L.store.subscribe`, si cambia la firma del dibujo (líneas, atributos, perPlan, marca, procedencia o repeticiones) se reconstruye conservando la cámara; si no, solo se refresca el panel. Probado en la misma página y en otra pestaña (evento `storage`).

## Rendimiento (medido con `tools/pw.js`, Chromium swiftshader, 1440×994, DPR 1)
- DPR tope 2. Render a demanda: 0 cuadros en reposo (verificado). Se pausa con la pestaña oculta (rAF cancelado, y la animación reanuda desde donde quedó). Al cambiar de plano se liberan geometrías, materiales y texturas: 43 geometrías / 8 texturas, luego 42 / 8 tras ida y vuelta.
- Bornes: un `InstancedMesh` por línea. Llamadas de dibujo: TGBT 68 (2190 triángulos); TS-PB 82 (1902 triángulos, 61 aparatos).
- CPU por cuadro (JS más envío de comandos, `bench(60)`): unos 0,13 ms de media y 0,5 ms como máximo en los dos tableros.
- Cuadro real (intervalo de rAF) animando la explotada en TS-PB con swiftshader, que rasteriza en CPU: mediana de 50 a 100 ms, p95 de 100 a 250 ms según la carga de la máquina, en varias corridas. El umbral del test es laxo (6 o más cuadros en 1,5 s y mediana menor a 300 ms) porque swiftshader varía; con GPU real no lo medí.
- `toDataURL` del lienzo tarda unos 225 ms en swiftshader, y solo se usa al descargar.

## Verificado y no verificado
- Verificado: la suite completa pasa en las últimas 4 corridas, sin errores de consola. Una corrida anterior falló con un umbral de rAF de 100 ms (salió 166 ms por carga de la máquina), y por eso ese umbral quedó laxo. Las dos páginas abren por `file://` sin errores (WebGL activo). Revisé todas las capturas de arriba y corregí el encuadre, el tamaño de los rótulos, la puerta que tapaba el interior en la explotada, el scroll que saltaba al seleccionar, la hoja móvil demasiado alta y la explotada en pantallas angostas.
- No verificado: GPU real, Safari/Firefox y lector de pantalla real (solo la semántica: `role=application` más `aria-label` con los atajos en el lienzo, `aria-pressed`/`aria-selected`, `aria-live` en el panel). En la galería como iframe, el alto lo reporta `app.js`; no lo probé dentro de `index.html`.
- Límite conocido: en TS-PB (que desborda la placa) el rótulo del primer riel queda detrás de la franja superior de la puerta desde el ángulo inicial. Se ve girando o en la explotada. Es coherente con el aviso de desborde.

## Pedidos al coordinador
- Ninguno. No edité archivos compartidos.
