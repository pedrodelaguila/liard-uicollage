# liard horizon · Informe de QA

Prototipo local, datos ficticios. Auditado contra `lab3-liard` `dev` @ `04fc8139`. Fecha de la demo: 30 sep 2026.
Probado con Chromium de Playwright 1.x (WebGL por swiftshader). Sin Safari, Firefox, GPU real ni lector de pantalla real.

## Cómo reproducirlo

```sh
cd tools && npm i            # playwright + marked, solo para pruebas y docs
cd .. && for t in tools/tests/*.test.js; do node $t; done
node tools/shoot.js v1       # capturas de la galería → shots/v1/
node tools/docs.js           # estrategia/*.md y research/*.md → HTML
```

## Resultado

| Suite | Qué cubre | Resultado |
| --- | --- | --- |
| `obras` | nueva obra con validación, carga real DXF/PDF y rechazos (tipo, >15, >10 PDF), drag & drop, tabla de referencia (reemplazar → «Por revisar»), procesar/cancelar/falla 504 sin reintento/reintentar, repeticiones 1–1000 y su efecto en cantidades, recorte de 15 zonas por mouse y teclado, comentarios, móvil, persistencia, reinicio | ✓ |
| `revision` | resolver a línea existente y nueva (validación de atributos esenciales), descartar, lote, cola guiada por teclado, tabla ordenable, `?linea=` recorre iguales, marcar revisado, bloqueos a 0, estados error/cargando, 1024 px, movimiento reducido | ✓ |
| `bom` | decisión de marca destraba, atributo faltante habilita matches, asignación rápida, preferidas, línea manual, borrar/deshacer, alternativa, revisión asistida con costo y tope de IA, XLSX abierto y verificado (Térmica 1P+N 10 A: 18 dibujadas, 36 a comprar), propagación a otra pantalla | ✓ |
| `tablero3d` | canvas no vacío, selección por clic ↔ lista ↔ 2D, rotar por teclado, zoom, explotada, aislar familia, 2D forzado sin WebGL, PNG y CSV, cambio de plano con liberación de memoria, móvil, `file://` | ✓ |
| `compras` | cotización bloqueada, solicitud con validación de vencimiento, simular respuesta, aprobar equivalencia, estrategias, adjudicar → un pedido por distribuidor, aprobación por monto desde el celular, PDF de orden de compra (código adentro) y XLSX | ✓ |
| `proveedor` | prefill desde catálogo propio, 4 errores de validación y su corrección, descuento global exacto, borrador persiste, envío notifica y aparece en la comparación, editar y reenviar, no cotizar, confirmar/rechazar una sola vez, contacto recién al confirmar, PDF/XLSX, móvil, **ningún nombre ni precio de la competencia en pantalla** | ✓ |
| `catalogo` | alta con validación y código único, renombrar → pendiente de lectura, despublicar saca el ítem del matching, importación reemplazar/actualizar con errores por fila, CSV real, mapeo recordado, lectura IA con resultado y motivo de falla, vínculo manual con listas cerradas, plantilla y exportación XLSX | ✓ |
| `presupuesto` | números renderizados = `L.budget`, validaciones (margen ≥ 100 %, horas negativas), escenarios, ARS/USD, PDF sin distribuidores ni precios de compra, XLSX interno, costos que pasan de oferta a pedido en vivo al adjudicar | ✓ |
| `plataforma` | cada asistente responde con los números del estado, acción confirmada ejecuta y cancelada no, tope de IA, IA no disponible, invitar con validación, aprobación, regla nueva + «Probar regla» genera correo, cambio de plan persiste, factura PDF, CSV de IA, vista de distribuidor con comisión por lead y separación de pagos | ✓ |
| `integracion` | recorrido completo entre roles con un mismo estado: ingeniería destraba → solicitud → el distribuidor la ve sin el contacto del comprador → oferta → segunda oferta → comparación → adjudicación (2 pedidos) → confirmación → contacto visible → segunda respuesta rechazada → presupuesto usa costo de pedido → avisos y correos → persistencia → aislamiento de marcos → «Reiniciar demo» → ⌘K | ✓ |
| `calidad` | las 25 pantallas por `file://` a 1440 y 1024 (escritorio) o 390 (móvil): sin errores de consola, todos los controles con nombre accesible, sin desborde horizontal, sin texto en inglés ni `undefined/NaN`, `lang=es` | ✓ 50 cargas limpias |
| `kit` | shell, validación, toast, XLSX | ✓ |

Capturas: `shots/v1/0-galeria.png`, una PNG por sección (`shots/v1/<sección>.png`), 58 pantallas a tamaño real en
`shots/v1/pantallas/`, y los estados críticos de cada área en `shots/tests/<área>/` (más de 250 PNG, más PDF/XLSX/CSV
descargados durante las pruebas).

## Defectos encontrados en la integración y corregidos

- `L.resolveSymbol` y el procesamiento comparaban atributos con `JSON.stringify`: el orden de las claves creaba líneas duplicadas. Ahora `L.sameSpec` compara atributo por atributo.
- `L.matches` aceptaba un atributo esencial `null` en ambos lados como coincidencia.
- `L.materialCost` miraba solo la primera solicitud de la obra.
- `L.processPlans` registraba en la actividad los planos pedidos, no los encolados.
- Las reglas de automatización creadas en la pantalla no se disparaban con eventos reales; ahora sí (plano procesado, oferta recibida, pedido confirmado o rechazado).
- «Reiniciar demo» en una pestaña rompía otra abierta en una solicitud que ya no existía (`d-comparar`): ahora las demás páginas se recargan.
- Los marcos de la galería compartían el estado con la demo, así que mirar la galería podía cambiarla. Ahora cada marco usa un estado propio sembrado desde cero (`?frame=`); «abrir» usa el compartido.
- El redireccionamiento de `?demo=ejemplos` del distribuidor perdía los parámetros (el diálogo «Rechazar pedido» no se abría por URL).
- Desbordes horizontales a 1024 px en catálogo y 3D (topbar sin salto de línea, hijos de grilla sin `min-width: 0`).
- La barra lateral quedaba corta en capturas de página completa.
- `boardsUsed` de la semilla (23) no coincidía con los planos procesados (18).

## Lo que queda abierto (no bloquea la revisión)

- Rendimiento 3D medido solo con swiftshader (CPU): 50–100 ms por cuadro animando el tablero más grande; en reposo no dibuja. Falta medir en GPU real.
- En capturas de página completa en móvil, la barra inferior fija tapa el final del contenido (en el teléfono se ve al hacer scroll).
- A 1024 px la tabla de acceso por obra de «Equipo» se desplaza dentro de su tarjeta.
- Algunas funciones se repiten en páginas en lugar de estar en `app.js` (próxima acción por obra, precio manual en el costo, previsualización de matching de un borrador). Están listadas en `notes/*.md` como pedidos al coordinador; no cambian el comportamiento.
- Los marcos de m-aprobar y de la bandeja de aprobaciones muestran el vacío o un ejemplo porque ninguna adjudicación de la semilla supera ARS 30 M.
- No probado: Safari, Firefox, lector de pantalla real, contraste medido con herramienta (se usaron tokens diseñados para AA, sin medición automática).
