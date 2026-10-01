# Área A · Ingeniería: obra → planos → detección → revisión

Usuario principal: martina. Prefijos `d-ing-`, `m-ing-`. Sección `sections/a-ingenieria.js` (6 secciones, órdenes 110–160, 16 marcos).
Archivos propios: `d-ing-proyectos.html`, `d-ing-carga.html`, `d-ing-proyecto.html`, `d-ing-plano.html`, `d-ing-revisiones.html`,
`d-ing-aprendizaje.html`, `m-ing-plano.html`, `ingenieria.css` (importa `ui.css`), `ingenieria.js` (helpers `window.I`),
`data-ingenieria.js` (`window.BI`).

## Pantallas y estados

| Pantalla | Variantes / estados | Horizonte |
| --- | --- | --- |
| `d-ing-proyectos.html` | `?vista=grilla` (defecto) · `lista` · `etapas` · `?estado=vacio` · `?estado=cargando` · sin resultados por filtro | existe + h1 (lo que te toca hoy, etapa, lista, por etapa) |
| `d-ing-carga.html` | `?paso=1..4` · `?estado=cargando` (leyendo la tabla) · `error` (tabla que es un unifilar, 2 materiales) · `sin-ia` · `limite` (15/15 planos) | h1 (validación), s5 (DWG), existe (DXF/PDF, ×N, 15 planos/100 MB) |
| `d-ing-proyecto.html` | normal · `?estado=error` (504 de TS-ASC + 503 de TS-UPS reintentándose) · `?estado=cargando` | existe + s5 (cola con ETA/motivo, zonas sugeridas) + h1 (camino del proyecto) |
| `d-ing-plano.html?plano=tsbombas` | `?vista=experta` (defecto) · `guiada` · `ia` · `&estado=sin-ia` · `&estado=cargando` · `&linea=l07` (localizador) · `?plano=tsasc` (error) · `tsups` (procesando) · `tgbt` (sin pendientes) | existe + h1 (J/K/A/D, guiada, IA) |
| `d-ing-revisiones.html` | `?vista=superpuesta` (defecto) · `lado` · `tabla` · `?estado=vacio` | h1 |
| `d-ing-aprendizaje.html` | normal · `?estado=vacio` | h2 |
| `m-ing-plano.html` | normal · `?estado=vacio` (o cuando ya no quedan pendientes) | h1 |

Estados por área: vacío (proyectos, revisiones, aprendizaje, móvil), cargando (proyectos, carga, proyecto, plano), error
(carga, proyecto, plano tsasc), límite (carga), sin IA (carga, plano).

## Estado compartido que escribe el área

- `planos[i].sinId` y `.status` (STALE → COMPLETED cuando no quedan sin identificar), `.mult` (repeticiones), y en el recorte
  del 504 `status`, `n` y se borra `error`.
- `lineas[i]`: resolver Q0 completa `attrs['Corriente nominal'] = '160 A'` de l09, vacía `faltan`, pasa `estado` a `ready`, borra
  `motivo`, `org = 'man'`. Resolver Q2/Q3 suma `dib` y `comprar` (× repeticiones) a l08 y corrige `fuentes`. Aplicar la rev. 2
  cambia l07, l08, l01, l14, l03 (cantidades) y l09 (NH1 250 A). Todo con deshacer.
- `avisos.unshift(...)` al resolver Q0, al recortar en zonas, al aplicar la revisión, al crear un proyecto y al crear una regla.
- Privado `x.ing.*`: `sim` (estado de cada símbolo), `correcciones` (lo que lee aprendizaje), `cola`, `rev`, `apr`, `nuevos`.

Recorrido verificado con Playwright (localStorage, fuera de marco): proyectos (6 pendientes en «hoy») → visor experta, A + Asignar
en Q0 → l09 `ready` → guiada, Confirmar con «aplicar a los iguales» → l08 4→6, TS-BOMBAS `COMPLETED`, sinId 0 → proyectos («hoy»
baja a 4, ya no aparecen el TS-BOMBAS ni el seccionador) → detalle (fila TS-BOMBAS «Listo» sin chip) → revisiones, aplicar con
cambio de alcance → l09 250 A, l08 7 → aprendizaje (el patrón pasó de 3 a 5 correcciones) → recordar → 5 reglas, 2 sugerencias →
carga, paso 4, crear → vuelve a proyectos con «Clínica San Vicente» primera → detalle, recortar TS-ASC en 4 zonas → «En proceso».
Sin errores de consola.

## Decisiones de diseño

- Las pantallas que existen copian el layout y el copy de dev (ProjectsPage, ProjectCard, PlansPanel, PlanListRow, PlansToolbar,
  BomSummaryTable, UploadPlansDialog, PlanStatusBadge, UnmappedSymbolsCard, SymbolBulkBar, PlanPager): mismas etiquetas
  («Requiere Atención», «Sin Planos», «Ver proyecto», «Iniciar Nuevo Proyecto», «Reintentar todos», «Cancelar tanda», «Editar
  repeticiones», «Ver página de detalles», «Visor CAD» / «Cómputo BOM», «Asignar material» / «Descartar»). Lo nuevo va marcado
  dentro de la pantalla con `.tag-h1/h2/s5` y lo que existe con `.tag-existe`.
- Un único caso hilado entre pantallas: el TS-BOMBAS. Su símbolo Q0 («NH00 160A» separado del seccionador) es justo lo que le
  falta a la línea l09 que frena al taller (`tableros.tsbombas.frena = 'l09'`), así resolver un símbolo se ve en BOM, cotización
  y taller. La rev. 2 del mismo plano cambia ese seccionador a NH1 250 A.
- El 504 se presenta como «el plano es demasiado grande», con «Recortar en zonas» como acción principal y «Reintentar igual»
  con confirmación y costo; el 503 se explica y no pide nada (regla real de `plan-processing-retry.ts`).
- Revisión IA: lo aceptado queda `org = 'man'` (lo confirmó una persona); la propuesta muestra confianza, fuente clicable al
  plano y costo. El costo ya está gastado al procesar, aceptar no gasta más.
- Validación de la tabla de referencia: render de «lo que vimos» al lado de la lista, chips Leídos / Dudosos / Sin componente
  base, y el botón de confirmar deshabilitado mientras haya algo dudoso. La tabla mala no bloquea: ofrece tres caminos.
- Diff de revisiones: superpuesta con mezcla por deslizador (alternativa: lado a lado y solo tabla), cajas verde/rojo/ámbar
  con prefijos + − ~ para no depender del color.
- El plano unifilar es un SVG propio (`I.planoSvg`) con bloques reales (Q0 NH, guardamotores, contactores, motores 3~, F1, ID1,
  S1, H1, rótulo). Los recortes ampliados reusan el mismo SVG con otro viewBox (`I.cropSvg`), así el recorte coincide con el plano.
- Movimiento: entrada de página del shell, hover de tarjetas con `--ease-out-expo`, pulso en cajas «por revisar», brillo
  (`catalog-reading-sheen`) en lecturas; todo apagado con `prefers-reduced-motion`. Gráfico de precisión con alternativa en tabla.

## Supuestos (lo que la doc no decide)

- Las coordenadas de cajas, los tres símbolos sin identificar, la cola (`BI.cola`), la rev. 2, el diccionario y las cifras de
  precisión mensual (90,1 % → 96,1 %) son inventados y verosímiles. 96 % no sale de ningún documento; la demo 3 dice 90 % de
  detección en Fundaleu.
- Costo por plano US$ 2,66 = 61,20 / 23 planos de septiembre (`consumoIA`). Costo de leer la tabla US$ 0,02 y por propuesta
  US$ 0,04: inventados. «Rev. 2 se procesa solo en las zonas que cambiaron (≈ US$ 0,60)»: supuesto de diseño, no existe.
- Etapa del ciclo por proyecto (`BI.proyEtapa`): inventada para p2–p5; la de p1 sale de los tableros y pedidos.
- La tabla de referencia de Cañuelas «31 materiales»: inventado. Los 23 materiales del proyecto nuevo usan 22 componentes base
  reales + gabinete sin base.
- Zonas sugeridas para recortar (`BI.zonasAsc`) y la sugerencia automática de zonas: propuesta, no existe en el detector.
- Las tres OC del PED-2026-031: la revisión toca l07/l08 y se asume que van en OC-2026-031-2 (Ohm, confirmada); `data.js` no
  dice qué líneas lleva cada OC.
- El 503 en TS-UPS: en la vista normal se cuenta como «el primer intento recibió 503 y se reintentó»; en `?estado=error` se
  fuerza el estado de espera (escribe `x.ing.cola`).
- En la demo no se eliminan planos ni proyectos de Cañuelas (otras áreas los leen): el diálogo avisa con un toast. Los proyectos
  p2–p5 sí se pueden eliminar desde la grilla.

## Existe en dev vs nuevo

- Existe: grilla de proyectos, barra tricolor, filtros, buscar con `/`, primeros pasos, tabla de referencia (ver, descargar,
  eliminar, reemplazar, recortar), subida DXF/PDF hasta 15 de 100 MB, «un archivo por tablero / varios tableros» con tijera,
  repeticiones ×N, chips de estado, procesar/reintentar todos, cancelar tanda, cola Postgres, BOM consolidado con stats,
  exportar, marcas del proyecto, visor con cajas por color, resolver/descartar en lote, reclasificar, localizador, ← → y 1/2.
- Nuevo: lo que te toca hoy, etapa del ciclo, vistas lista y por etapa, camino del proyecto, validación de la tabla de
  referencia, DWG (s5), duplicar proyecto, costo antes de procesar, cola con ETA y motivo, zonas sugeridas para el 504, J/K/A/D,
  revisión guiada, revisión asistida por IA, aplicar a los iguales, revisiones de plano con diff, aprendizaje de correcciones,
  revisión desde el teléfono.

## Pedidos al coordinador

1. **Interlineado global**: `tokens.css` declara `:root { font: 18px/145% … }`; un porcentaje se hereda como 26,1 px fijos, así
   que todo texto de 11–14 px queda con interlineado doble en todas las áreas. Lo resolví en `ingenieria.css` con
   `:root { line-height: 1.45 }`; conviene cambiarlo a `18px/1.45` en `tokens.css` para todos.
2. Enlaces que mis pantallas esperan de otras áreas: `d-bom-editor.html?linea=l09|l11|l07`, `d-com-cotizacion.html`,
   `d-com-pedidos.html`, `d-tal-taller.html`, `d-tal-entregas.html` (recibe el cambio de alcance; leer `x.ing.rev.cambioAlcance`
   o el aviso), `d-pla-plan.html`, `m-pla-avisos.html` (el botón volver del móvil). Sería bueno que el aviso a3 (TS-ASC 504)
   apunte a `d-ing-proyecto.html?estado=error`, y que haya un aviso que lleve a `m-ing-plano.html`.
3. El taller (E) puede leer `lineas.l09.estado === 'ready'` para destrabar el TS-BOMBAS después de que se resuelve Q0.

## Verificado / no verificado

Verificado:
- `node tools/qa.mjs` sobre las 7 pantallas y 27 combinaciones de estado/variante: 34/34 limpias (consola, desborde, inglés,
  nombres accesibles, `lang=es`).
- Miré los PNG de proyectos (grilla, por etapa, vacío), carga (paso 2, paso 3, error, límite, paso 4), proyecto (normal en
  página completa y error), plano (experta, guiada, IA, localizador), revisiones (superpuesta en página completa, lado a lado),
  aprendizaje y móvil, y corregí lo que se veía mal (interlineado, buscador, kanban, filas de planos, márgenes del visor,
  índice de la guiada, fuentes de la IA, encabezado de revisiones).
- El recorrido completo con Playwright descripto arriba (estado entre pantallas por localStorage).

No verificado:
- No miré los PNG de: proyectos lista y cargando, carga paso 1/cargando/sin IA, proyecto cargando, plano sin IA / cargando /
  tsasc / tsups / tgbt, revisiones solo tabla y vacío, aprendizaje vacío, móvil vacío (pasaron el QA automático).
- No probé dentro de la galería (`?marco=1`) ni la sincronización entre pestañas con `L.on`.
- Atajos de teclado (J/K/A/D, 1/2/3/Enter/S, ←/→): solo probé `A` en el recorrido; los demás no.
- Los diálogos secundarios (marcas del proyecto, visor rápido, corregir símbolo, cambiar alcance, olvidar regla) se abren por
  código, pero no los recorrí todos a mano.
