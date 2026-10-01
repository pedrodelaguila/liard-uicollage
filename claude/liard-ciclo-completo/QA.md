# liard · ciclo completo · informe de QA

Prototipo estático, sin backend. Datos ficticios y detección, IA, correos y pagos simulados. Fecha: 01/10/2026. Base:
rama `dev` de `lab3-liard` (`82300d56`).

## Cómo correrlo

```sh
# Playwright + Chrome del sistema (cualquier carpeta con `npm i playwright`; exportá PW_DIR=<carpeta>/node_modules/playwright)
node tools/qa.mjs d- m-                       # todas las pantallas por file://, a su tamaño (1440×994 / 390×844)
node tools/qa.mjs "d-bom-3d.html?estado=sin-3d"   # un estado
node tools/integracion.mjs                    # recorrido entre roles con un mismo estado
node tools/links.mjs                          # enlaces a pantallas inexistentes
./shoot.sh v1                                 # capturas → shots/v1/
./serve.sh                                    # o abrí index.html por file://
```

## Resultado

| Chequeo | Qué mira | Resultado |
| --- | --- | --- |
| `tools/qa.mjs` | Las 54 pantallas, más cada estado y variante declarados en la galería (183 URL). Revisa: errores de consola o de página, recursos que no cargan, desborde horizontal, texto en inglés o `undefined`/`NaN`/`[object`, controles sin nombre accesible, `lang="es"` | **183/183 limpias** |
| `tools/integracion.mjs` | Recorrido con un estado compartido: la línea l09 bloquea la cotización → ingeniería completa su esencial → la cotización la ve cotizada → el freno del TS-BOMBAS en el taller cambia de «no se pudo cotizar» a «falta pedirlo» → el distribuidor envía la contraoferta de OC-2026-031-1 → Pedidos la muestra → inicio de dirección y avisos del teléfono → un marco de la galería no escribe el estado → «Reiniciar demo» → ⌘K | **12/12 pasos** |
| `tools/links.mjs` | Que cada pantalla nombrada en un `href`, `data-href`, `L.go` o marco exista | **0 rotos** |
| Recorridos por área | Cada subagente recorrió su flujo con Playwright: resolver símbolos, destrabar líneas, aplicar reglas, 3D ↔ lista, escenario → adjudicación → aprobación, contraoferta → aceptación → contacto, protocolo → listo → remito → recepción con faltante, asistente con confirmar/cancelar y tope (detalle en `notes/<área>.md`) | sin errores de consola |
| Revisión visual | Capturas de cada pantalla y estado principal revisadas a ojo por cada área; secciones de la galería revisadas por el coordinador | ver «Defectos corregidos» |

Capturas: `shots/v1/0-galeria.png`, una PNG por sección (`shots/v1/<sección>.png`, con los marcos a su alto real) y
102 pantallas a tamaño real (`shots/v1/pantallas/`). Recorrido de integración: `shots/integracion/`.

## Secciones

| # | Etapa | Funcionalidad | Horizonte | Marcos |
| --- | --- | --- | --- | --- |
| 01 | Ingeniería | Proyectos y camino de la obra | existe | 3 |
| 02 | Ingeniería | Carga de planos y validación de la tabla de referencia | 0–6 m | 3 |
| 03 | Ingeniería | Procesamiento: cola, errores y reintentos | S5 | 2 |
| 04 | Ingeniería | Revisión de símbolos: experta, guiada y asistida por IA | existe | 4 |
| 05 | Ingeniería | Revisión de plano: versión 2 contra versión 1 | 0–6 m | 2 |
| 06 | Ingeniería | Aprender de las correcciones | 6–18 m | 2 |
| 07 | Ingeniería | Editor del BOM con trazabilidad por línea | S4 pendiente | 3 |
| 08 | Presupuesto | Información insuficiente: destrabar la cotización | S4 pendiente | 3 |
| 09 | Ingeniería | Reglas de la empresa y accesorios derivados | 0–6 m | 3 |
| 10 | Presupuesto | BOM alternativo | S5 | 3 |
| 11 | Fabricación | Tablero 3D vinculado al BOM | 6–18 m | 3 |
| 12 | Compras | Cotización de punta a punta | S4 pendiente | 3 |
| 13 | Compras | Escenarios de compra | 0–6 m | 3 |
| 14 | Presupuesto | Presupuesto al comitente | 0–6 m | 3 |
| 15 | Presupuesto | Re-cotizar con precios de hoy | 0–6 m | 3 |
| 16 | Compras | Pedidos, contraofertas y aprobación | existe | 4 |
| 17 | Compras | Notificaciones por email con hilo | S5 | 2 |
| 18 | Comercial | Catálogo del distribuidor: importación .xlsx y lectura con IA | existe | 3 |
| 19 | Compras | Solicitud con respuesta por línea y contraoferta | 0–6 m | 4 |
| 20 | Comercial | Listas por cliente y sincronización con el ERP | 6–18 m | 3 |
| 21 | Comercial | Vidriera del distribuidor y demanda perdida | 6–18 m | 2 |
| 22 | Plataforma | Leads y comisión del distribuidor | S5 | 2 |
| 23 | Compras | Inicio del distribuidor y el vendedor en la calle | 0–6 m | 3 |
| 24 | Obra | Recepción de materiales y entregas parciales | 0–6 m | 3 |
| 25 | Fabricación | Taller: tableros por estado, faltantes y horas | 6–18 m | 4 |
| 26 | Fabricación | Protocolo de ensayos IEC 61439 con placa y QR | 6–18 m | 3 |
| 27 | Obra | Cambios de alcance y entregas a obra | 6–18 m | 2 |
| 28 | Mantenimiento | Mantenimiento, as-built y QR del tablero | concepto | 3 |
| 29 | Plataforma | Inicio por rol y tablero de dirección | 0–6 m | 3 |
| 30 | Plataforma | Asistente IA para revisión, presupuesto y compras | 0–6 m | 4 |
| 31 | Plataforma | Equipo, permisos, aprobaciones y comentarios | 0–6 m | 3 |
| 32 | Plataforma | Automatizaciones «cuando… entonces…» | 6–18 m | 3 |
| 33 | Plataforma | Plan, suscripción y consumo de IA | S5 | 3 |
| 34 | Plataforma | Estado del servicio | S5 | 2 |
| 35 | Plataforma | Avisos y asistente en el teléfono | 0–6 m | 4 |

Total: **35 funcionalidades, 103 marcos, 54 pantallas** (39 de escritorio y 15 de teléfono). El horizonte de la sección
es el de su parte principal; dentro de cada pantalla, lo que ya existe en `dev` lleva la marca `existe` y lo nuevo `Nuevo`
o su horizonte.

## Defectos encontrados y corregidos en la integración

- **El interlineado se heredaba fijo.** `tokens.css` tenía `font: 18px/145%`, como la app, pero en CSS plano el porcentaje se
  hereda como 26 px, así que el texto chico quedaba con interlineado doble. Ahora es `18px/1.45`.
- **La galería se desplazaba sola.** Al cargar, el `focus()` y el `scrollIntoView()` de las pantallas movían también la
  página de afuera hasta el último marco, y la captura general salía vacía. Dentro de un marco, el foco ya no desplaza y el
  scroll queda dentro de la pantalla.
- **La animación de entrada dejaba capturas en blanco.** `.page` arrancaba en opacidad 0; ahora solo se mueve.
- **El canvas 3D del teléfono tapaba el contenido.** Le faltaba un contenedor con `position: relative`. Además, la pantalla
  no cargaba `bom.css`.
- **Faltaba el ícono `history`.** En lucide 1.x se llama `rotate-ccw-clock`; quedó un alias en `tools/icons.mjs`.
- **Los contadores no bajaban.** Los avisos del teléfono y las aprobaciones pendientes ahora salen del estado y bajan al
  leer o aprobar.
- **La píldora de horizonte tapaba contenido.** En escritorio pasó al espacio libre de la barra lateral.
- **Datos que no coincidían entre áreas.** El aviso `a2` hablaba de otra alternativa que la que ofrece el distribuidor, y el
  aviso de TS-ASC no abría el estado de error.
- **Faltaban cosas de forma.** El logo de la cabecera era solo el símbolo, y el marco de teléfono no tenía barra de estado
  y recortaba la barra superior de cada pantalla.

## Lo que no se verificó

- **3D con GPU real:** solo se probó con SwiftShader (headless). Tampoco se probó arrastrar con el mouse para girar ni tocar
  el 3D del teléfono para abrir la ficha.
- **Descargas** (PNG, CSV, XLSX, PDF de presupuesto o protocolo) dentro de los marcos de la galería.
- **Accesibilidad:** el teclado completo y el lector de pantalla, más allá de los nombres accesibles que revisa el QA.
  `prefers-reduced-motion` está en el CSS pero no se corrió con la emulación.
- **Revisión a ojo incompleta:** algunos estados secundarios solo pasaron el QA automático, sin mirar la captura (la lista
  está en `notes/ingenieria.md`).
- **Normativa:** los criterios y capítulos de IEC 61439 / AEA 90364-7-771 del protocolo no están validados contra el texto
  vigente.
- **Números de negocio:** precisión de la detección, costos de IA, precios del plan, comisión por lead, topes de
  aprobación, tarifas de taller y bonificaciones son **inventados** o hipótesis sin validar, y así están rotulados.

## Supuestos que el equipo tiene que revisar

1. **Roles internos de la empresa** (compras, taller, obra, dirección) como membresías de una empresa sobre el rol
   `ENGINEER`, y no como roles nuevos de `UserRole` (`d-pla-equipo`).
2. **«Gabinete» como componente base nuevo** (Sprint 5). Hoy no existe, y por eso la línea l18 bloquea la cotización.
3. **La contraoferta:** el distribuidor responde por línea (confirmar, precio, plazo, equivalente, parcial, sin stock) y el
   comprador acepta o rechaza la contraoferta entera. Un equivalente tiene que coincidir en componente base y esenciales.
4. **El BOM alternativo** viaja una vez por línea, con la original y la alternativa. El distribuidor cotiza una de las dos
   y no propone otra marca fuera de la contraoferta.
5. **Topes de aprobación:** OC de más de $ 20.000.000 o margen menor al 18 %. Margen objetivo del 21,7 %.
6. **Comisión:** 5 leads sin cargo y $ 6.000 + IVA desde el 6.º. La suscripción y sus precios también son hipótesis (Roadmap S5).
7. **El IVA del 21 %** se muestra solo como cálculo de presentación rotulado; el precio se guarda sin IVA, como en dev.
8. **Cupo de 50 etiquetas QR** por plan, y la página pública del QR sin datos comerciales.
