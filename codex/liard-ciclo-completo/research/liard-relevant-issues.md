
# #1010 Épica Polos y tablero — detectar polos por aparato y estimar el tablero físico — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/1010

## Propósito

Que LIARD sepa **cuántos polos tiene cada aparato del plano** y, con eso, **cómo es físicamente el tablero**. Hoy los polos solo llegan si están escritos en la especificación. Sin polos, las protecciones caen a `NOT_FOUND` en la cotización, porque `poles` es un atributo esencial (`back/src/modules/canonical-catalog/seed/components/thermomagnetic-breaker.ts:14-27`, `back/src/modules/quotation/matching/quote-matcher.service.ts:51-55`). Además, sin polos no se puede estimar el tamaño del tablero.

Esto ataca la "zona gris" de las entrevistas: *"El ingeniero infiere el tamaño del gabinete, la ventilación, la disipación, las canaletas, el riel DIN, […] y la disposición física"* (`documentacion/Entrevistas de discovery.md:48`), y las reglas técnicas que ya usa EMEVE para completar el BOM (`:52`, `:153`).

## Orden

1. **#1007 — Polos del texto o de los palitos del símbolo.** Base de todo lo demás: prompt, esquema de respuesta, agrupación del BOM y `poles` en la línea.
2. **#1008 — Polos heredados del aparato de arriba conectado.** Depende de #1007. Si armar la cadena conectada no es confiable, cierra como spike documentado.
3. **#1009 — Resumen del tablero: polos, módulos DIN estimados y vías.** Depende de #1007 y mejora con #1008. Solo cuenta, con la cobertura a la vista.

## Criterio de cierre

La épica se cierra cuando los tres sub-issues están cerrados y la medición de #1007 y #1008 sobre los planos de ajuste muestra el % de protecciones con polos antes y después.

## Fuera de alcance

- **Recomendaciones a partir del resumen**: gabinete, metros de riel, peines, borneras, canal, ventilación. Necesitan reglas y factores validados con LIARD, y *"Nunca inventar un SKU crítico"* (`documentacion/Entrevistas de discovery.md:154`). Cuando estén validados se suman como sub-issues nuevos de esta épica o de una propia.
- Validar la consistencia eléctrica del tablero.


# #1009 Resumen del tablero: polos, módulos DIN estimados y vías a partir del BOM detectado — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/1009

## Propósito

Mostrar, por plano, un **resumen físico del tablero** calculado a partir del BOM detectado: polos totales, módulos DIN estimados y cantidad de vías (salidas). Es el primer paso para ayudar con la "zona gris" que marcaron las entrevistas: *"El ingeniero infiere el tamaño del gabinete, la ventilación, la disipación, las canaletas, el riel DIN, […] y la disposición física, y 'se juega' a que su interpretación sea la correcta"* (`documentacion/Entrevistas de discovery.md:48`). EMEVE ya genera parte del BOM con reglas que parten del componente principal (`:52`), y el hallazgo transversal lo repite (`:153`).

Este ticket **solo cuenta**: no recomienda gabinete, riel ni accesorios. Esas recomendaciones necesitan reglas de negocio que todavía no están escritas ni validadas con LIARD, y *"Nunca inventar un SKU crítico"* (`:154`).

Depende de #1007 (polos propios) y mejora con #1008 (polos heredados): sin esos tickets, a la mayoría de las protecciones les falta el polo.

## Contexto

- **Un plano es un tablero** en el modelo: `ElectricalPlan.multiplier` es "cuántas veces se repite este tablero en el proyecto" (`back/prisma/schema.prisma:358-365`). El resumen es por plano, sin multiplicar. El consolidado del proyecto sí multiplica, pero eso queda fuera de este ticket.
- Los polos de una línea del BOM ya tienen dónde vivir: `ElectricalComponent.canonicalComponentId` (`schema.prisma:542-544`) → `CanonicalComponentAttributeValue.valueNumber` del atributo `poles` (`schema.prisma:784-797`). Diez tipos canónicos tienen `poles`, por ejemplo el termomagnético (`back/src/modules/canonical-catalog/seed/components/thermomagnetic-breaker.ts:14-27`). Leerlo de ahí, y no parsear la especificación, hace que una corrección manual (`MANUAL`) también cuente.
- **Polos no son módulos DIN.** Una térmica ocupa 1 módulo por polo, pero un diferencial o un contactor pueden ocupar más, y una caja moldeada, un medidor o un transformador no van en riel DIN. Los módulos se estiman como polos × un factor por tipo de componente, no como la suma de polos.

## Apetito

Dos días.

## Alcance

### Backend

- Tabla de **ancho en módulos por tipo** (`key` del tipo canónico → módulos por polo, o "no va en riel"), en un archivo de configuración del módulo, no hardcodeada en el servicio. Arranca con los tipos que tienen `poles` y cada valor dice de dónde sale (hoja de datos o criterio de LIARD).
- Cálculo por plano sobre el BOM (`ElectricalComponent`, cantidad × polos del componente canónico):
  - **polos totales**;
  - **módulos DIN estimados** (solo aparatos que van en riel);
  - **vías**: cantidad de protecciones de salida (la definición exacta queda en el PR, ver Riesgos);
  - **conteo por tipo** (termomagnéticos, diferenciales, contactores…) con sus polos;
  - **cobertura**: cuántas líneas cuentan y cuántas no, y por qué (sin componente canónico, sin polos, tipo sin ancho conocido).
- Exponerlo en el detalle del BOM del plano o en una ruta propia bajo `electrical-plan/:planId/bom` (`back/src/modules/electrical-bom/controller/electrical-bom.controller.ts:45`). El DTO lo arma el mapper y el servicio solo calcula. Actualizar `api-endpoints.md`.
- Tests unitarios del cálculo con líneas sin canónico, sin polos, con cantidad > 1 y fuera de riel.

### Frontend

- Tarjeta **"Resumen del tablero"** en el detalle del plano, junto al BOM: polos, módulos DIN estimados, vías y el desglose por tipo. Llamada nueva en `front/src/service/api/` y query en `service/queries/`.
- Etiqueta visible de **inferido / estimado**, y la cobertura en texto ("32 de 35 aparatos con polos"). Si la cobertura es baja, avisarlo en vez de mostrar el número como si fuera exacto.
- Se recalcula al guardar el BOM (invalidar la query).

## Riesgos

- **Un número que parece exacto y no lo es.** Si a 10 aparatos les faltan polos y se suman como cero, el total sale corto y nadie lo nota. Una línea sin polos **no suma**: va a la cobertura. Este es el riesgo principal del ticket.
- **Factores de módulos inventados.** Un factor mal puesto por tipo corre todos los tableros. Cada valor de la tabla lleva su fuente y los dudosos quedan como "desconocido", que va a la cobertura, en vez de suponer 1.
- **"Vía" no tiene una definición única.** Puede ser una salida protegida o un circuito, y un diferencial que cubre varias térmicas no es una vía más. Acordar la definición con LIARD o dejarla escrita en el PR antes de mostrarla.
- **El principal y las salidas**: el interruptor general suma polos y módulos pero no es una vía. Sin la topología de #1008 no se sabe cuál es el general; si no se puede distinguir, las vías se muestran como "protecciones" y no como "vías".
- Un DXF con más de un tablero dibujado rompe "plano = tablero": el resumen mezclaría los dos. No se resuelve acá, pero hay que nombrarlo en la UI si aparece en los planos de ejemplo.

## Criterios de aceptación

### Backend

- [ ] Un plano con 3 termomagnéticos 2P y 1 diferencial 4P da 10 polos y los módulos según la tabla.
- [ ] Una línea con cantidad 3 cuenta 3 veces sus polos.
- [ ] Una línea sin componente canónico, o sin polos, no suma y aparece en la cobertura con su motivo.
- [ ] Un aparato que no va en riel suma polos pero no módulos.
- [ ] Una corrección manual de polos en el BOM cambia el resumen.
- [ ] `api-endpoints.md` actualizado.

### Frontend

- [ ] La tarjeta muestra polos, módulos estimados, vías y el desglose por tipo, con la etiqueta de estimado y la cobertura.
- [ ] Con cobertura baja se ve un aviso, no solo el número.
- [ ] Al guardar el BOM el resumen se actualiza sin recargar.

### Gates

- [ ] `npm run lint:check`, `npm run typecheck`, `npm test` y `npm run test:int` en verde.
- [ ] `npm run lint`, `npm run build` y `npm test` en verde.

## Fuera de alcance

- Recomendar gabinete, metros de riel, peines, borneras, canal o ventilación: épica aparte, después de validar factores y reglas con LIARD.
- Resumen consolidado del proyecto (con `multiplier`).
- Agregar materiales al BOM a partir del resumen.
- Detectar polos: es #1007 y #1008.


# #1008 Detección · polos: heredarlos del aparato de arriba conectado — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/1008

## Contexto

Depende de #1007, que agrega `polos` y `origen_polos` a la respuesta del detector a partir del texto y de los palitos del símbolo.

En un unifilar, un aparato muchas veces no lleva polos propios ni escritos ni dibujados porque **los hereda del aparato de arriba al que está conectado**:

- Debajo de un **bipolar**, todo es bipolar, esté especificado o no.
- Debajo de un **tetrapolar** puede haber tetra, tri o bipolares. Ahí el dibujante sí especifica (texto o palitos) cuando el de abajo **no** es igual al de arriba; si no especifica nada, es igual al de arriba.

Hoy el detector no puede aplicar esa regla: cada caja se clasifica sola, con su recorte y los vecinos que entren en él (`component-detector/classification.py:93-104`), así que el aparato de arriba no siempre está en la imagen y Claude no sabe cuál es. Esas líneas llegan al BOM sin `poles`, que es esencial (`back/src/modules/canonical-catalog/seed/components/thermomagnetic-breaker.ts:14-27`), y caen a `NOT_FOUND` en la cotización (`back/src/modules/quotation/matching/quote-matcher.service.ts:51-55`).

## Apetito

Dos días, incluido medir. Si armar la cadena conectada no es confiable en ese tiempo, el ticket se cierra con el spike documentado (qué se probó, dónde falla) en vez de con una heurística que adivine.

## Alcance

### Servicio de detección

- **Post-proceso después de clasificar**, no en el prompt: para cada protección o maniobra con `polos: null` después de #1007, buscar el aparato inmediatamente arriba en la **misma cadena conectada por trazo**, reutilizando el trazo conectado de `component-detector/ink.py:125-140` si alcanza.
- Regla de herencia:
  - si el aparato tiene polos propios (`origen_polos` = `"texto"` o `"trazos"`), ganan los propios;
  - si no tiene y el de arriba tiene polos (propios o heredados), los hereda: `origen_polos: "heredado"`;
  - la herencia se propaga en cadena (el de arriba puede haberlos heredado a su vez);
  - si no hay aparato de arriba identificable, `polos: null`.
- Sumar `"heredado"` al enum de `origen_polos` y bajar la confianza a no alta cuando el polo es heredado, para que lo mire una persona.
- Recalcular la agrupación de filas (`backend_contract.py:158-167`) después de la herencia, no antes.

### Backend

- Nada nuevo si #1007 ya lleva `poles` a la línea: verificar que un polo heredado viaje igual.

## Riesgos

- **"Arriba" no es "la caja más cercana hacia arriba".** En un tablero con varias columnas, la caja más cercana arriba puede ser de otro circuito. El padre tiene que salir de la conexión por trazo; si solo sale por cercanía, no se hereda.
- **Tetrapolar arriba no implica tetrapolar abajo** cuando el de abajo sí especifica. El orden importa: heredar solo cuando #1007 dejó `null`. Si #1007 no leyó unos palitos que sí estaban, la herencia pone un 4P donde va un 2P, y eso se compra: medir cuántos casos así hay.
- **Bipolar arriba y algo distinto abajo** es una inconsistencia del plano o un error de lectura: no se corrige, se deja el propio y confianza no alta.
- Barras y repartidores cortan la cadena visualmente: el padre de un aparato colgado de una barra es el aparato que alimenta la barra, no la barra.

## Criterios de aceptación

### Servicio de detección

- [ ] Un aparato sin texto ni palitos, colgado de un bipolar, sale con `polos: 2`, `origen_polos: "heredado"`.
- [ ] Un aparato sin texto ni palitos, colgado de un tetrapolar, sale con `polos: 4`, `origen_polos: "heredado"`.
- [ ] Un aparato colgado de un tetrapolar con `"2x10A"` o dos palitos sale con `polos: 2` y su origen propio (gana lo propio sobre lo heredado).
- [ ] La herencia se propaga en cadena (abuelo → padre → hijo).
- [ ] Sin aparato de arriba conectado identificable, `polos: null`.
- [ ] Un aparato en otra columna no hereda del vecino de al lado.
- [ ] Un polo heredado nunca sale con confianza alta.
- [ ] Medición antes/después sobre los planos de ajuste en el PR: % de protecciones con polos y herencias equivocadas.

### Gates

- [ ] `pytest` en `component-detector/tests` en verde.
- [ ] `npm run lint:check`, `npm run typecheck`, `npm test` y `npm run test:int` en verde si se tocó el back.

## Fuera de alcance

- Leer polos del texto o de los palitos: es #1007.
- Validar consistencia eléctrica del tablero (avisar que un tetrapolar cuelga de un bipolar).
- Reconstruir la topología completa del unifilar: solo la relación padre → hijo que hace falta para heredar polos.


# #1007 Detección · polos: leerlos del texto o de los palitos del símbolo — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/1007

## Contexto

La cantidad de polos es un atributo **esencial** de las protecciones en el catálogo canónico: `poles` es `required: true` en el termomagnético (`back/src/modules/canonical-catalog/seed/components/thermomagnetic-breaker.ts:14-27`), y lo mismo en el diferencial (`residual-current-breaker.ts:15-25`) y la caja moldeada (`molded-case-breaker.ts:15-21`). El matcher de cotización marca `NOT_FOUND` toda línea a la que le falta un esencial (`back/src/modules/quotation/matching/quote-matcher.service.ts:51-55`).

Hoy el detector solo trae los polos si están **escritos** en la especificación: el prompt le enseña a leer `"2x16A"` / `"4x40A"` como polos por corriente (`component-detector/classification.py:135-138`, `:163`) y la respuesta es texto libre en `especificacion` (`classification.py:246`, esquema en `:370-385`). Pero en un unifilar los polos muchas veces se dibujan en vez de escribirse: la cantidad de **palitos (trazos) cruzando la línea** del símbolo indica los polos. Esos palitos pueden estar arriba o abajo del símbolo, pegados o algo separados.

Resultado: un `"16A C 6kA"` con dos palitos llega al BOM sin `poles` y cae a `NOT_FOUND` en la cotización, aunque el plano dice que es bipolar.

Este ticket cubre polos **propios** del aparato (texto y palitos). La herencia desde el aparato de arriba conectado va en #1008, que depende de este.

## Apetito

Dos días.

## Alcance

### Servicio de detección

- `classification.py`: sumar al prompt una sección **POLOS** con el orden de prioridad de las fuentes: (1) texto de la especificación (`2x`, `4P`, `bipolar`, …), (2) palitos sobre el símbolo, arriba o abajo, cerca o separados. Con ejemplos correcto/incorrecto al estilo de las reglas existentes (`classification.py:106-145`).
- Agregar al esquema de respuesta un campo `polos` (entero 1–4 o `null`) y `origen_polos` (`"texto" | "trazos" | ""`), para que el origen sea auditable y medible. `null` si no se puede decidir: nunca adivinar (mismo criterio que la regla 4, "contar de más se compra").
- Aclarar en el prompt que los palitos **no son cantidad** (igual que `"4x50A"` hoy, `classification.py:135-138`) y que las rayitas de un cable (`"4x4+4(T)"`, `:165-166`) no son polos de un aparato.
- `backend_contract.py:158-167`: incluir `polos` en la clave de agrupación de filas (un 16A bipolar y un 16A tetrapolar son dos artículos distintos, mismo argumento que el docstring de `:150-155`) y exponerlo en la fila.

### Backend

- `SymbolDetectionResponseMapper`: traducir `polos` → `poles` (ninguna clave en castellano pasa del mapper).
- Llevar `poles` a la línea del BOM de forma que `BomLineReadingService` lo use cuando la especificación no lo trae: el valor detectado completa el atributo, no pisa uno leído del texto.
- Actualizar `api-endpoints.md` si cambia la forma de la respuesta.

## Riesgos

- **Palitos lejos del símbolo**: arriba o abajo, pegados o separados. El riesgo es atribuirle al aparato los palitos del de al lado o de un cable. Si no está claro que son de este símbolo → `polos: null` y confianza no alta.
- **Texto vs. palitos en desacuerdo**: gana el texto, y la confianza no es alta (lo mira una persona).
- **Agrupación**: meter `polos` en la clave de agrupación parte filas que hoy salen juntas; los números de `component-detector/README.md` (perdidos/de más) hay que volver a medir, no suponer.
- Cada cambio de prompt es una corrida paga: medir con el split ajuste/validación existente, sobre los planos de ajuste.

## Criterios de aceptación

### Servicio de detección

- [ ] Un termomagnético con `"2x16A"` sale con `polos: 2`, `origen_polos: "texto"`.
- [ ] Un termomagnético con `"16A C"` y dos palitos dibujados (arriba o abajo del símbolo, pegados o separados) sale con `polos: 2`, `origen_polos: "trazos"`.
- [ ] Sin texto ni palitos, `polos: null`: nunca un valor inventado.
- [ ] Los palitos no cambian `cantidad`.
- [ ] Dos aparatos iguales salvo polos salen en filas distintas del BOM.
- [ ] Medición antes/después sobre los planos de ajuste en el PR: % de protecciones con polos y errores de polos.

### Backend

- [ ] `poles` llega a la línea del BOM y la lectura canónica lo usa cuando la especificación no lo trae.
- [ ] Una línea que antes era `NOT_FOUND` por "Falta el atributo esencial: Polos" y ahora tiene polos detectados matchea.

### Gates

- [ ] `pytest` en `component-detector/tests` en verde.
- [ ] `npm run lint:check`, `npm run typecheck`, `npm test` y `npm run test:int` en verde.

## Fuera de alcance

- Heredar polos del aparato de arriba conectado: #1008.
- Polos de aparatos que no son protección ni maniobra (tomacorrientes, borneras, cables).
- Editar polos a mano en el front: la corrección ya viaja como `canonical` en el guardado del BOM.
- Entrenar YOLO para contar palitos: esto es prompt.


# #1002 Usar la tabla de referencias para resolver las marcas numeradas que reemplazan a la especificación — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/1002

## Contexto

En algunos planos el aparato no lleva su especificación escrita al lado sino una **marca de referencia**: en vez de `2x14A` junto al ITM aparece un `7` dentro de un círculo, y lo que significa ese 7 está en la tabla de referencias del proyecto (la fila 7 dice qué interruptor es). Hoy esa información se pierde:

- **La tabla llega al detector y se descarta.** El backend la manda en cada detección (`back/src/modules/electrical-plan/service/electrical-plan.service.ts:347-357` y `:526-544`), y el servicio la guarda sin leerla: `component-detector/api.py:263-271` ("Se guarda y no se usa"). `factory.create_analyzer` ya no la recibe desde #848 (`component-detector/factory.py:156-159`).
- **El prompt no sabe qué es una marca de referencia.** Pide copiar "el texto del dibujo copiado tal cual" (`component-detector/classification.py:251-253`) y "No corrijas el dibujo" (`:266`), y le dice explícitamente que no mire ninguna tabla (`:330-332`). Frente a un `7` circulado, lo esperable es que conteste `especificacion: "7"` (entra al listado como si fuera una especificación) o que la deje vacía. **No está medido**: es lo primero que hace este ticket.
- **La infraestructura para mandar la tabla existe y está sin usar:** `ClaudeClient.ask_about_image(..., reference_image=...)` pone la imagen de la tabla en el prefijo cacheado (`component-detector/claude_client.py:112-133`), pero ningún llamador la pasa.

Para un plano así, la lista de materiales sale sin especificaciones, y el matcheo de cotización por igualdad no encuentra nada: sin el valor de los atributos `required`, la línea queda `NOT_FOUND`.

## Apetito

Tres días: uno para el baseline, dos para el cambio y la medición contra ese baseline. Si no entra, se corta la resolución automática y queda solo el reconocimiento de la marca (ver Alcance, paso 2).

## Alcance

### Servicio de detección

1. **Baseline antes de tocar nada.** Armar un kit de planos que usen marcas de referencia (con su tabla) y correr el clasificador actual. Por cada caja cuya especificación real es una marca, registrar qué contesta hoy: la marca copiada como especificación, vacía, otra cosa inventada, y con qué confianza. También el costo por plano. El kit y los resultados quedan **fuera del repo** (son planos de clientes); en el repo va, si hace falta, solo el script de medición.
2. **Que el clasificador reconozca la marca.** Agregar al prompt y al esquema de salida la distinción entre una especificación escrita y una marca de referencia (número o letra dentro de un círculo, hexágono o globo), devolviéndola en un campo propio (`referencia`) en vez de en `especificacion`. Esto solo ya evita que un `7` entre al listado como especificación.
3. **Resolver la marca contra la tabla.** Dos caminos; se elige con los números del baseline:
   - **A (recomendado): resolverla en código.** Leer una vez por plano el DXF de la tabla (textos por fila: número → descripción/especificación) y reemplazar la marca por la especificación de esa fila. Determinístico, sin costo por caja y no reintroduce la imagen de la tabla en cada consulta.
   - **B: que Claude la lea de la imagen de la tabla** usando `reference_image`. Más simple de escribir, pero es justo lo que #848 sacó porque empeoraba la elección del nombre, y suma tokens de imagen a cada consulta (cacheados, pero no gratis).
4. **Si la marca no se puede resolver** (no hay tabla, la fila no existe, o la tabla no tiene columna de número), la especificación queda vacía, la marca se conserva en el `motivo`/campo propio y la caja va a revisión (confianza no `alta`). Nunca se inventa.
5. **Dejar de ignorar la tabla en `api.py`** solo si se toma el camino A o B, y actualizar el comentario de `api.py:264-266` y el docstring de `factory.py:156-159`, que pasarían a ser falsos.

### Backend

- Nada si la resolución ocurre dentro del detector y la respuesta sigue llevando la especificación en el mismo campo. Si se agrega `referencia` a la respuesta, pasa por `SymbolDetectionResponseMapper` (traducción español→inglés) y se actualiza `api-endpoints.md`.

## Riesgos

- **No sabemos cómo están dibujadas las marcas.** Pueden ser un bloque con ATTRIB, un círculo más un TEXT, o una MTEXT suelta. Para el camino A importa poco (la marca la lee Claude del recorte), pero para el baseline hay que confirmarlo sobre planos reales antes de asumir un formato.
- **No sabemos si todas las tablas tienen una columna de número.** Si la tabla de un cliente no numera las filas, el camino A no tiene contra qué resolver. Revisarlo en las tablas que tenemos antes de elegir camino.
- **La marca puede confundirse con otras cosas numeradas en el unifilar**: número de circuito, marca de conductor, borne (`X2`, ya tratado en `classification.py:112-121`). El prompt tiene que separar la marca de referencia de esos casos, y el baseline tiene que incluir cajas con esos textos para ver que no se rompen.
- **Tocar el prompt puede mover lo que ya anda.** El docstring de `classification.py:22-23` declara 275/278 correctos y 0 invenciones sobre 8 planos: el cambio se mide también sobre esos planos, no solo sobre los que tienen marcas.
- **La tabla del cliente puede tener varias filas por familia** (ya planteado en #901). Este ticket resuelve la especificación por número de fila, no el nombre; no se mezcla con el mapeo fila→familia de #901.

## Criterios de aceptación

### Servicio de detección

- [ ] Hay un baseline documentado (en el PR) de qué contesta hoy el clasificador frente a una marca de referencia, sobre un kit de planos que no está en el repo.
- [ ] Sobre el mismo kit, después del cambio: ninguna marca de referencia queda copiada como especificación.
- [ ] Con tabla y fila existente, la especificación que sale es la de la fila de la tabla.
- [ ] Sin tabla o con una marca que no está en la tabla, la especificación queda vacía y la caja no sale con confianza `alta`.
- [ ] Sobre los planos sin marcas de referencia, la exactitud y las invenciones no empeoran respecto del baseline.
- [ ] El costo por plano no sube más de lo que se mida y se justifique en el PR.
- [ ] Tests en `component-detector/tests/` para la lectura de la tabla y la resolución marca → especificación (con un DXF sintético, no uno de cliente).
- [ ] `pytest` en `component-detector/tests` en verde.

### Backend (solo si cambia la respuesta)

- [ ] `api-endpoints.md` y `SymbolDetectionResponseMapper` actualizados.
- [ ] `npm run lint:check`, `npm run typecheck`, `npm test` y `npm run test:int` en verde.

## Fuera de alcance

- Mapear las filas de la tabla a familias (#901).
- Mostrar la marca de referencia en el front o editarla a mano.
- Tablas de referencia en PDF o como imagen: solo DXF.
- Cambiar la tabla del cliente.


# #1000 Cola de planos: lo que falta del rediseño (un YOLO por proceso, soltar jobs al apagar, protocolo asíncrono con latido por progreso) — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/1000

## Contexto

`docs/aws-deployment/cola-y-concurrencia.md` (23/9) propone rediseñar la cola de planos en 14 tickets (COLA-01…14). Desde entonces, #996 (con #998 y #999) cerró una parte. Este issue junta **solo lo que falta**, revisado contra `feat/detector-filtros` con `dev` mergeado.

### Lo que ya está y no hace falta hacer
| Problema del documento | Cómo quedó |
| --- | --- |
| 6. El detector no limitaba cuántos análisis corren a la vez | `/bom/detectBom` toma un lugar del `render_limiter()` (`component-detector/api.py:312`), el mismo que el recorte (default 4, `common/concurrency.py:24`), y responde 503 si no hay lugar en 60 s (`api.py:78`) |
| 8. matplotlib con `pyplot` desde threads | El render usa la API de objetos (`component-detector/rendering.py:361`) |
| 9. Paralelismo de Claude por plano (8) | Un presupuesto global para todo el proceso (`component-detector/vision_concurrency.py`, `BOM_VISION_CONCURRENCY`, 24) |
| 1 (en parte). El detector seguía llamando a Claude después del corte | Plazo cooperativo `BOM_RENDER_TIMEOUT_S` (300 s) < `SYMBOL_DETECTION_TIMEOUT_MS` (360 s): pasado el plazo no sale ninguna consulta más (504), y un 504 no se reintenta (`back/src/modules/electrical-plan/service/plan-processing-retry.ts:21-30`) |
| 10. Comentarios falsos | El techo de `BOM_RENDER_CONCURRENCY` vuelve a ser cierto (`plan-processing-worker.service.ts:38`, `docker-compose.yml:48`); el comentario del umbral 0,50 ya no está |
| `claimNext` FIFO | Es justo por usuario (`back/src/modules/processing-job/repository/processing-job.repository.ts:203-232`) |
| Transiciones condicionales (parte de COLA-08) | `renewLease`, `retryLater` y `finish` ya filtran por `id + workerId + status RUNNING` (`processing-job.repository.ts:249`, `:270`, `:316`) |

### Lo que sigue mal
- **YOLO compartido entre threads:** una sola instancia por proceso (`component-detector/inference.py:57-72`), y `predict` corre sin lock (`inference.py:111`). Con `BOM_RENDER_CONCURRENCY=4` pueden correr 4 análisis a la vez sobre la misma instancia; Ultralytics dice que eso corrompe su estado interno.
- **La request sigue siendo sincrónica:** el worker espera hasta 360 s, y el lease (10 min) prueba que Nest está vivo, no que el plano avance. Sigue *at-least-once* (`plan-processing-worker.service.ts:365`).
- **Al apagar no se sueltan los jobs:** `onModuleDestroy` solo frena los loops (`plan-processing-worker.service.ts:95-100`); el job queda RUNNING hasta el próximo arranque o hasta que vence el lease.
- **`PLAN_QUEUE_SINGLE_INSTANCE` sigue en `true` por defecto** (`back/.env.example:78`, `plan-processing-recovery.service.ts:133-140`): con dos backends, el que arranca le devuelve a la cola los planos del otro.
- **Plano y job no se escriben juntos:** el BOM, el estado del plano y `finish` del job son escrituras separadas (`plan-processing-worker.service.ts:285-330`), y el barrido de "planos sin job" las reconcilia.
- **Cancelar un plano en curso no corta nada:** solo se cancelan los QUEUED (`processing-job.repository.ts:134-161`).
- **No hay retención ni reintento manual** de jobs FAILED.

## Apetito

Dos semanas, por fases. Cada fase es un PR contra `dev`, desplegable solo. Si no entra, se corta de abajo para arriba: la fase 1 sola ya evita resultados corruptos.

## Alcance

### Fase 1 — Seguridad (ya, sin cambiar el contrato)
**Servicio de detección**
- Un YOLO por worker de detección: pool de procesos (`forkserver`, como `common/child_process.py`), cada proceso con su propio modelo y `torch.set_num_threads(cores / procesos)`, y reciclado con `max_tasks_per_child`. Mientras no esté, un lock alrededor de `predict`.

**Backend**
- `onModuleDestroy` suelta los jobs propios: QUEUED con `workerId = null` y `availableAt = now`, filtrando por `workerId` (`releaseAll(workerId)` en el repositorio).
- `PLAN_QUEUE_SINGLE_INSTANCE=false` por defecto, en el código y en `.env.example`.

### Fase 2 — Protocolo asíncrono y latido por progreso
**Servicio de detección**
- `POST /analyses` con `id = jobId`, idempotente, que devuelve 202 y `Retry-After`; `GET /analyses/{id}` con `state`, `stage`, `boxes_done`, `boxes_total` y el BOM al terminar; `DELETE /analyses/{id}`. 503 pasado `MAX_ANALYSES`. `/bom/detectBom` queda vivo hasta que el backend nuevo esté desplegado.
- Limpieza de análisis terminados y de sus `runs/` después de N horas.

**Backend**
- El worker hace `POST`, sondea `GET` y renueva un latido de 60 s **solo si hubo progreso**. Si `GET` da 404 (el detector se reinició), repite el `POST` con el mismo id.
- BOM, job SUCCEEDED y plano COMPLETED en **una** transacción; el estado del plano se escribe con el del job en cada transición.
- Un solo barrido de latidos vencidos, que reemplaza a `requeueAllRunning` al arrancar y al barrido de "planos sin job".

### Fase 3 — Checkpoint y cancelación
- Cada caja clasificada se guarda con clave `jobId` + hash del recorte; antes de llamar a Claude se busca ahí.
- Cancelar un plano RUNNING pasa el job a CANCELLED, el worker llama a `DELETE` y el pipeline corta entre cajas.

### Fase 4 — Limpieza
- Borrar los jobs SUCCEEDED y CANCELLED cuando su lote termina, y los FAILED a los 30 días.
- Acción "reintentar" en la UI: FAILED → QUEUED con los intentos en cero.
- Borrar lo que el latido deja sin uso: `plan-processing-timeouts.ts`, `MAX_RUN_LEASES`, `RENDER_AND_SAVE_MARGIN_MS`, `SYMBOL_DETECTION_TIMEOUT_MS` para el BOM, `PLAN_QUEUE_SINGLE_INSTANCE` y `/bom/detectBom`. Actualizar `.env.example`, `CLAUDE.md` y `api-endpoints.md`.

## Riesgos
- **La justicia por usuario de `claimNext` hay que llevarla al protocolo nuevo.** Si en la fase 2 `PROCESS_CONCURRENCY` sube a `MAX_ANALYSES`, el orden de entrada al detector lo decide el claim, y tiene que seguir siendo por usuario.
- **El 504 cooperativo y el latido miden cosas distintas.** Si se borra `BOM_RENDER_TIMEOUT_S` sin que el latido esté andando, un plano trabado vuelve a llamar a Claude sin techo.
- **RAM:** un YOLO por proceso multiplica la memoria del modelo. Hay que medir el RSS pico con el plano más grande antes de fijar la cantidad de procesos (`mem_limit` 6 GB, `docker-compose.yml:177`).
- **El pipeline de PDF** (`filters.pdf_pipeline`) corre en el mismo proceso: el pool nuevo tiene que elegirlo igual que hoy (`detection.py`, `pipeline_for`).
- **El límite real de RPM de Anthropic** de la organización sigue sin confirmar: define el presupuesto global y si hace falta un balde de RPM además del semáforo.

## Criterios de aceptación

### Servicio de detección
- [ ] 4 análisis simultáneos dan las mismas cajas que en serie, y `/health` responde en < 1 s durante todo el test.
- [ ] Dos `POST /analyses` con el mismo id generan un solo análisis (una sola carpeta en `runs/`).
- [ ] Matar el detector al 50 % de un plano y reintentarlo no vuelve a llamar a Claude por las cajas hechas (contando llamadas).
- [ ] `pytest` en verde.

### Backend
- [ ] SIGTERM con un job RUNNING lo deja QUEUED en < 5 s, y otro worker lo toma.
- [ ] Con dos backends, arrancar uno no le devuelve a la cola los jobs del otro.
- [ ] Reiniciar el backend a mitad de un plano no dispara un segundo análisis; `docker kill` del detector devuelve el job a la cola en < 90 s.
- [ ] Ningún camino actualiza el plano sin el job, o al revés (un test por transición).
- [ ] Cancelar un plano en curso corta las llamadas a Claude en < 10 s.
- [ ] Un plano FAILED se puede reintentar sin volver a subirlo, y el progreso de "procesar todos" no retrocede mientras el lote corre.
- [ ] `npm run lint:check`, `npm run typecheck`, `npm test` y `npm run test:int` en verde.

### Frontend
- [ ] `npm run lint` y `npm run build` en verde (botón "reintentar" y cancelación de un plano en curso).

## Fuera de alcance
- Cambiar la cola a SQS, Redis o pg-boss: el documento ya justifica que Postgres alcanza (`cola-y-concurrencia.md`, "Hasta dónde aguanta la cola en Postgres").
- La justicia por usuario de `claimNext` y el no reintentar un 504: ya están (#998).
- Prioridades, topes por usuario o más de un tipo de job.


# #988 Épica Matching — catálogo base del lado usuario y match por igualdad al cotizar — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/988

## Propósito

Cerrar el matching entre el BOM del usuario y el catálogo de los proveedores sobre el catálogo base. Los dos lados quedan escritos igual (componente base, atributos con escritura estándar, marca y submarca), así que cada línea del BOM se matchea por igualdad en vez de por parecido de texto.

El lado del catálogo ya está hecho en #977. Esta épica cubre lo que falta: llevar al catálogo base el BOM detectado, dejar que el usuario complete los atributos que faltan, y matchear con eso al solicitar la cotización.

## Apetito

Esta semana. Tiene que estar el jueves 01/10 para entrar en el deploy del domingo 04/10.

## Tickets

Van como sub-issues de esta épica:

- Lado usuario: el BOM detectado pasa al catálogo base y el usuario completa los atributos que faltan.
- Cotización: matchear cada línea del BOM contra el catálogo por componente base y atributos iguales.

## Fuera de alcance

- Extender la lista de componentes base (la investigación ya está hecha, va en otro ticket).
- Optimizaciones de costo de la lectura con IA (Batch API, RAG, respuesta más corta).


# #987 Matcheo · cotización: matchear cada línea del BOM contra el catálogo por componente base y atributos iguales — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/987

## Contexto

- Hoy la cotización matchea cada línea con `QuoteMatcherService` (`back/src/modules/quotation/matching/quote-matcher.service.ts:54`), llamado desde `back/src/modules/quotation/service/quotation.service.ts:793`.
- Los candidatos salen de `ProviderCandidateFinder`, que termina comparando por parecido de texto (`back/src/modules/quotation/matching/provider-candidate-finder.ts:339-347`, similitud Dice).
- Con el catálogo del proveedor (#977) y el BOM del usuario (ticket del lado usuario) llevados al catálogo base, cada línea se puede matchear por igualdad de componente base y atributos.

## Apetito

Un día y medio. Tiene que estar el jueves 01/10 para entrar en el deploy del domingo 04/10.

## Alcance

### Backend

- Al solicitar la cotización, para cada línea del BOM traer los ítems del catálogo con el mismo componente base y los mismos valores en los atributos esenciales.
- La marca y la submarca filtran solo cuando la línea las tiene.
- Devolver todas las coincidencias, de todos los proveedores. No elegir la más barata.
- Una línea sin componente base, o con un atributo esencial faltante, queda sin match y con el motivo.
- Reemplazar el matching por parecido de texto actual, sin dejar dos caminos en paralelo.

## Riesgos

- La igualdad exacta es rígida: un producto equivalente o superior (por ejemplo, con más capacidad de corte) no matchea. Las equivalencias quedan para otro ticket.
- Los ítems del catálogo que siguen en lectura (`readingStatus` `PENDING`) todavía no tienen componente base y no aparecen.

## Criterios de aceptación

- [ ] Una línea con componente base y atributos esenciales completos trae todos los ítems con los mismos valores, de todos los proveedores.
- [ ] Una línea a la que le falta un atributo esencial queda sin match y dice cuál falta.
- [ ] Corregir un atributo en Editar BOM cambia el resultado al volver a cotizar.
- [ ] Tests unitarios del matcher: igualdad, atributo faltante, con marca y sin marca.
- [ ] `npm run lint:check`, `npm run typecheck`, `npm test` y `npm run test:int` en verde.

## Fuera de alcance

- Equivalencias entre valores (aceptar un valor superior).
- Cambios en la pantalla de la matriz de cotización.
- Extender la lista de componentes base.


# #986 Matcheo · lado usuario: el BOM detectado pasa al catálogo base y el usuario completa los atributos que faltan — CLOSED
https://github.com/FacultadDeIngenieria/lab3-liard/issues/986

## Contexto

- El catálogo del proveedor ya se lleva al catálogo base: cada fila queda con su componente base (`ProviderCatalogItem.canonicalComponentId`, `back/prisma/schema.prisma:853`) y su estado de lectura (`:860`). La lee `CatalogReadingService` (`back/src/modules/provider/service/catalog-reading.service.ts:80-116`) y el proveedor la corrige en `front/src/pages/supplier/SupplierCatalogLinkPage.tsx`.
- Del lado usuario eso no existe: una línea del BOM guarda material, especificación, marca y submarca como texto (`ProjectBomItem`, `back/prisma/schema.prisma:298-306`), sin componente base ni atributos.
- La lectura con IA del BOM ya está probada en el spike #938, en la rama `feat/938-lectura-bom-detectado-haiku` (sin mergear): `claude-bom-line-extractor.ts` y `bom-line-extraction-prompt.ts`. Resultado medido: 39/40 casos y US$ 0,16 por un proyecto de 64 líneas distintas.

## Apetito

Tres días. Tiene que estar el jueves 01/10 para entrar en el deploy del domingo 04/10.

## Alcance

### Backend

- Traer a `dev` el extractor del spike #938 y leer cada línea distinta del BOM al terminar de procesar los planos del proyecto, una sola vez por texto distinto.
- Guardar en la línea del BOM su componente base y sus atributos (migración).
- Releer una línea solo cuando el usuario escribe a mano material o especificación y guarda, nunca mientras escribe.
- Endpoint para editar el componente, los atributos, la marca y la submarca de una línea.

### Frontend

- Editar BOM: por componente, mostrar los atributos leídos, marcar los esenciales que faltan y dejar completarlos o corregirlos, con la misma interacción que la vista del proveedor (`SupplierCatalogLinkPage.tsx`).
- Marca y submarca editables desde la misma vista.
- El cambio va en las dos vistas del editor: Por planos y Por componentes.
- `api-endpoints.md` y `front/src/service/api/` actualizados junto con el endpoint.

## Riesgos

- Los casos del spike son sintéticos, y los planos reales casi nunca traen marca: hay que probar con un proyecto real.
- Cada valor de atributo se elige de la lista estándar de ese atributo, nunca como texto libre. Si no, el matching por igualdad falla.

## Criterios de aceptación

### Backend

- [ ] Al terminar de procesar los planos, cada línea distinta del BOM queda con su componente base y sus atributos, o sin componente si no está en la lista base.
- [ ] Reprocesar el mismo plano no vuelve a llamar a la IA.
- [ ] Editar a mano el material o la especificación de una línea relee solo esa línea.

### Frontend

- [ ] En Editar BOM, cada línea muestra sus atributos y cuáles esenciales faltan, en las dos vistas.
- [ ] El usuario completa un atributo eligiendo de su lista y cambia la marca y la submarca, y los cambios siguen ahí al recargar.

### Gates

- [ ] `npm run lint:check`, `npm run typecheck`, `npm test` y `npm run test:int` en verde.
- [ ] `npm run lint` y `npm run build` en verde.

## Fuera de alcance

- El matching contra el catálogo: va en el ticket de matching.
- Extender la lista de componentes base.
- Optimizaciones de costo (Batch API, RAG, respuesta más corta).


# #985 Deploy de prueba para el cliente — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/985

# Deploy de prueba en una VM, con New Relic

## Contexto
El cliente necesita probar LIARD y darnos feedback antes de la arquitectura serverless (Alternativa 2). Para la prueba, la app corre en una sola VM on-demand, encendida solo cuando se usa. El diseño está en `docs/aws-deployment/deploy-vm-prueba.md`.

## Objetivo
Dejar LIARD accesible por HTTPS en una VM de 4 vCPU / 16 GB (GCP `n4-standard-4` o AWS `m7i.xlarge`), que:
- el cliente pueda prender cuando la necesita;
- se apague sola cuando no se usa;
- se despliegue desde GitHub Actions;
- se monitoree con New Relic, incluido el consumo de Claude por servicio.

## Alcance

### 1. Imágenes y compose de producción
- [ ] `back` multi-stage: `npm ci`, `npm run build`, `node dist/main`; `prisma migrate deploy` al arrancar
- [ ] Imagen `caddy` con el `dist/` del front, `dxf-viewer.html` y el `Caddyfile`
- [ ] `docker-compose.prod.yml`:
  - imágenes del registro y volúmenes con nombre (`uploads`, `runs`, `pgdata`, `caddy_data`);
  - solo 80 y 443 publicados;
  - `restart: unless-stopped`.

### 2. Código que hay que ajustar antes
- [ ] COLA-01: un análisis de detección a la vez en `component-detector`
- [ ] COLA-02: soltar los jobs al apagar el worker
- [ ] `COMPONENT_EXTRACTION_CONCURRENCY=25` (Haiku 4.5 tiene 1.000 RPM, no 5.000)
- [ ] `NODE_ENV=production`, `TRUST_PROXY=true`, `JWT_SECRET` generado, throttler de login en 10–20 intentos

### 3. Anthropic
- [ ] Workspaces `liard-deteccion` (Opus 5.5) y `liard-matching` (Haiku 4.5)
- [ ] Una API key por workspace: la de detección solo en `component-detector`, la de matching solo en `back`
- [ ] Tope de gasto mensual por workspace, acordado con el cliente

### 4. Infraestructura
- [ ] VM on-demand x86 de 4 vCPU / 16 GB, disco de 30 GB cifrado, IP pública fija
- [ ] Firewall o security group: entra solo 80 y 443; administración por IAP o SSM Session Manager, sin SSH público
- [ ] Cuenta de servicio o rol de IAM con lectura de secretos y del registro, nada más
- [ ] Secretos en Secret Manager o SSM Parameter Store; el `.env` se arma al arrancar, con permisos `600`
- [ ] DNS: `app.dominio` a la IP de la VM y `encender.dominio` a la página de encendido
- [ ] Runbook de creación de la VM en `docs/`

### 5. Script de arranque
- [ ] Docker, `docker-compose.prod.yml`, `deploy.sh` y un servicio de systemd que corre `deploy.sh` en cada arranque
- [ ] Cron de apagado cada 5 min, que apaga si se cumplen las tres:
  - ninguna request a `/api` en 30 min;
  - ningún job en `QUEUED` o `RUNNING`;
  - ninguna fila de catálogo `PENDING`.
- [ ] Cron semanal que borra las carpetas de `runs/` de más de 30 días

### 6. Encendido
- [ ] Página de encendido con clave (Cloud Run function o Lambda con Function URL). Solo puede hacer `start` y `get` de esa VM, y limita los intentos
- [ ] Horario como techo: apagar a la hora de cierre aunque haya quedado prendida

### 7. CD
- [ ] `.github/workflows/deploy.yml`: se dispara con un tag `v*` o a mano
- [ ] Autenticación por Workload Identity Federation o OIDC, sin claves de nube en GitHub
- [ ] Build `linux/amd64` con caché de capas; imágenes con tag = SHA en Artifact Registry o ECR
- [ ] Guardar el tag en Secret Manager o SSM; si la VM está prendida, correr `deploy.sh` (por IAP o SSM Run Command)
- [ ] Rollback: volver al tag anterior y repetir `deploy.sh`

### 8. New Relic
- [ ] Cuenta gratuita, o gratis mientras seamos estudiantes, por el GitHub Student Developer Pack
- [ ] Agente de infraestructura en la VM: CPU, RAM y disco por contenedor; reenvío de los logs de Docker y del log de acceso de Caddy
- [ ] Agente de Node (`newrelic`) en `back`:
  - APM de la API y del worker;
  - `ai_monitoring.enabled: true`, para registrar las llamadas de `@anthropic-ai/sdk` (Haiku);
  - `ai_monitoring.record_content.enabled: false`, para no mandar contenido.
- [ ] Agente de Python en `component-detector` (FastAPI): APM de `/bom/detectBom` y `/dxf/crop`
- [ ] Evento propio `ClaudeCall` en `claude_client.py`, porque el AI monitoring de Python no soporta Anthropic:
  - lleva modelo, tokens de entrada, de caché y de salida, duración, código de respuesta, `jobId` y alias `deteccion`;
  - sin prompt ni imagen.
- [ ] Nunca mandar la API key: los eventos llevan el alias del servicio
- [ ] Dashboard:
  - tokens y costo estimado de Claude por día y por servicio;
  - llamadas por minuto contra el límite de 1.000, y 429;
  - planos procesados y tiempo por plano;
  - CPU, RAM y disco;
  - horas encendida en el mes.
- [ ] Alertas:
  - más de 5 errores 429 en 5 min;
  - gasto diario de Claude por encima de lo acordado;
  - errores 5xx por encima del 5 % en 10 min;
  - disco por encima del 80 %;
  - memoria del detector por encima del 90 % de su `mem_limit`.

## Criterios de aceptación
- [ ] `https://app.dominio` carga con certificado válido, y solo responden 80 y 443 desde afuera
- [ ] Con la VM apagada, la página de encendido la prende y redirige a la app en menos de 5 min
- [ ] La VM se apaga sola tras 30 min sin uso, y no se apaga con un plano en proceso ni con una carga de catálogo pendiente
- [ ] Un "procesar todos" de 12 planos termina sin errores, con las mismas cajas que procesados de a uno
- [ ] Una carga de catálogo de ~2.500 filas termina sin 429 y sin filas `PENDING`
- [ ] Un tag `v*` deja la versión nueva en la VM; el rollback al tag anterior funciona
- [ ] New Relic muestra, después de procesar un plano:
  - las métricas de la VM y de los contenedores;
  - el APM de `back` y del detector;
  - los tokens de Claude separados por `deteccion` y `matching`.
- [ ] Las alertas de 429 y de disco se prueban forzándolas una vez

## Fuera de alcance
- Backups (decisión del equipo; el cliente queda avisado de que la base y los planos viven en un solo disco)
- Terraform
- Planos en S3 o Cloud Storage y la Alternativa 2
- Rediseño completo de la cola (COLA-03 en adelante)

## Estimación
6 a 7 días de trabajo. Los puntos 1, 2 y 3 se pueden repartir entre dos personas.

## Riesgos y dudas abiertas
- **Cuota:** en el trial de GCP no se pueden pedir aumentos. Hay que confirmar que `us-central1` tenga 4 vCPU disponibles para N4.
- **AWS:** el plan gratuito no permite `m7i.xlarge`; hay que pasar la cuenta al plan pago.
- **Sin medir:**
  - el tiempo de arranque de la VM;
  - el tiempo de YOLO en la VM elegida;
  - el límite real de RPM de la organización de Anthropic.
- **Sin confirmar:** qué pantallas de New Relic ve un usuario básico.

# #984 Catálogo · lectura: costo y tiempo restante medidos, con la vinculación abierta mientras se lee — CLOSED
https://github.com/FacultadDeIngenieria/lab3-liard/issues/984

## Contexto

Con la pantalla de estandarización (#976, PR #982), mientras el catálogo se lee con la AI el proveedor ve cuántas filas van leídas, pero no sabe cuánto falta ni cuánto cuesta. Tampoco queda registrado lo que costó cada lectura. Además, la vista entera se bloquea aunque falte leer una sola fila:

- **No se mide el costo.**
  - Cada llamada a Haiku vuelve con los tokens que usó, pero nadie los mira: el extractor solo pasa la lectura (`back/src/modules/canonical-catalog/extraction/claude-component-text-extractor.ts:48`).
  - La barra muestra solo "Leídos X de Y" y la leyenda (`front/src/components/supplier/canonical-link/CatalogReadingProgress.tsx:53`, `:94`).
- **No hay tiempo restante** ni registro de cuánto duró una lectura.
- **Una sola fila por leer bloquea toda la corrección.**
  - La corrección responde `409` si el catálogo tiene cualquier fila `PENDING` (`back/src/modules/provider/service/provider.service.ts:221-224`).
  - El front deshabilita todas las fichas mientras dura la lectura (`front/src/hooks/supplier/useCatalogStandardization.ts:194`, `:212`; `front/src/components/supplier/canonical-link/CatalogItemSheet.tsx:65`).
  - Editar la descripción de un solo producto deja toda la vinculación sin poder corregirse.
- **Una fila corregida a mano no se vuelve a leer** aunque se le cambie la descripción en Productos (`back/src/modules/provider/repository/provider.repository.ts:385`). Se queda con los atributos de la descripción vieja.
- **La tabla de Productos no se refresca sola.**
  - Un producto editado queda en "Leyendo…" hasta recargar (`front/src/pages/supplier/SupplierCatalogPage.tsx:46`).
  - El aviso al guardar no dice que la descripción se vuelve a leer (`front/src/components/supplier/SupplierCatalogItemModal.tsx:67`).

## Apetito

Un día.

## Alcance

### Backend

- **El precio es una interfaz aparte del extractor: `IComponentReadingPricing`.**
  - Tiene un solo método, `costUsd(usage)`, que recibe un uso normalizado: tokens de entrada, de salida, de escritura en caché y de lectura de caché.
  - Se registra en `CanonicalCatalogModule` con el token `'ComponentReadingPricing'`.
  - Hoy es `ClaudeComponentReadingPricing`, con los precios de `COMPONENT_EXTRACTION_{INPUT,OUTPUT,CACHE_WRITE,CACHE_READ}_USD_PER_MTOK`. Son variables obligatorias, con los valores de Haiku 4.5 en `.env.example`, `.env.test` y `docker-compose.yml`.
- **`IComponentTextExtractor` expone `model` y reporta el costo de cada llamada.**
  - `ClaudeComponentTextExtractor` recibe el pricing inyectado: solo traduce el `usage` de Anthropic al uso normalizado y le pide el precio.
  - Otro modelo con otros precios cambia solo la configuración. Uno que se cobra distinto es otra implementación de `IComponentReadingPricing`, registrada en el módulo. Otro proveedor (por ejemplo Gemini) es otro `IComponentTextExtractor`.
  - Una llamada que respondió pero no se pudo usar igual reporta lo que costó.
- **Modelo `CatalogReadingRun`, con su migración.**
  - Guarda una fila por corrida de lectura de un proveedor: modelo, inicio, fin, filas leídas, llamadas y costo acumulado.
  - Se abre la primera vez que hay filas `PENDING` y se cierra cuando no queda nada por leer. Al abrir una nueva, cierra cualquier otra que ese proveedor tenga abierta.
  - Se suma a `cleanDatabase()`.
- **`GET /providers/catalog/reading` suma `run`**, con `null` si el catálogo nunca se leyó:
  - `costUsd`: lo gastado.
  - `estimatedCostUsd`: lo gastado más el costo promedio por llamada × las descripciones distintas que faltan.
  - `remainingMs`: el tiempo por fila leída × las filas que faltan.
  - `estimatedTotalMs`: lo transcurrido más lo que falta.
  - Las estimaciones son `null` antes de la primera llamada; al terminar pasan a los valores reales.
- **La corrección responde `409` solo si esa fila está `PENDING`.** Las demás se corrigen mientras se lee.
- **Editar el `name` de una fila `MANUAL` desde Productos la vuelve a leer** y pierde la corrección. Una recarga de la planilla sigue sin volver a leer una fila `MANUAL`.
- `api-endpoints.md` se actualiza en el mismo PR.

### Frontend

- **La barra de progreso mantiene su diseño** y suma arriba tres datos con etiqueta:
  - **Leídos:** "11 de 30 · 37%".
  - **Tiempo restante:** "≈ 2 min de 4 min estimados".
  - **Costo:** "US$ 0,004 de US$ 0,042 estimados".
- **La barra se mueve mientras avanza:**
  - avanza de forma continua entre consultas;
  - lleva un brillo sobre lo leído;
  - los números suben de a uno.

  Todo esto se apaga con `prefers-reduced-motion`.
- **La vinculación queda abierta mientras se lee.** Cada fila se corrige apenas termina de leerse, y las que faltan quedan en "Leyendo…" con la ficha bloqueada y su motivo a la vista.
- **La tabla de Productos se refresca sola** mientras hay filas leyéndose.
- **El aviso al guardar** dice "Producto actualizado. Se está leyendo de nuevo la descripción." cuando corresponde.

## Riesgos

- **El costo depende de los precios configurados.** Si cambian las tarifas o el modelo y no se actualizan las variables, el costo que se muestra queda mal sin que nada avise.
- **El backend no arranca sin las cuatro variables de precio.** Un `back/.env` local que no las tenga falla al levantar.
- **Las estimaciones son promedios** de lo que va de la corrida. La primera llamada escribe el caché del system prompt y es más cara que las siguientes, así que al principio el costo estimado queda por arriba del real.
- **Corregir a mano ya no espera al resto del catálogo.** La única protección que queda es el `409` de la fila que se está leyendo y el lock que comparte con la recarga de la planilla.

## Criterios de aceptación

### Backend

- [ ] Cada llamada de la lectura reporta su costo, calculado de los tokens de la respuesta y los precios configurados, también cuando la respuesta no se pudo usar.
- [ ] Cada lectura de un proveedor queda registrada en `CatalogReadingRun` con modelo, inicio, fin, filas, llamadas y costo; una lectura posterior abre otra corrida.
- [ ] `GET /providers/catalog/reading` devuelve `run` con `costUsd`, `estimatedCostUsd`, `remainingMs` y `estimatedTotalMs`, estimados mientras se lee y reales al terminar.
- [ ] Corregir una fila `PENDING` responde `409`; corregir otra fila del mismo catálogo mientras se lee responde `200`.
- [ ] Editar el `name` de una fila `MANUAL` la deja `PENDING` y la vuelve a leer; recargar la planilla no toca una fila `MANUAL`.
- [ ] `npm run lint:check`, `npm run typecheck`, `npm test` y `npm run test:int` en verde.

### Frontend

- [ ] La barra muestra leídos, tiempo restante y costo, con su total estimado.
- [ ] Mientras se lee, la vinculación se puede usar: las filas leídas se corrigen y las pendientes quedan en "Leyendo…" con la ficha bloqueada, y se habilitan solas al leerse.
- [ ] La tabla de Productos pasa de "Leyendo…" al componente leído sin recargar.
- [ ] Probado contra el backend de la rama sin llamar a Haiku.
- [ ] `npm run lint`, `npm run build`, `npm test` y `npm run verify:crop` en verde.

## Fuera de alcance

- Mostrar el historial de corridas o el costo acumulado del proveedor.
- Una implementación de otro modelo o proveedor (Gemini): quedan las dos interfaces.
- Leer las tarifas desde una API de precios.
- Volver a leer una fila `MANUAL` cuando cambia su descripción en una recarga de la planilla.


# #970 Cancelar un diálogo abierto desde un menú deja la página sin clicks — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/970

## El problema

Cancelar la confirmación de "Eliminar plano" abierta desde el menú "Más opciones" de una fila de planos puede dejar el `body` con `style="pointer-events: none;"`, con el menú y el diálogo ya cerrados. La página deja de responder a los clicks hasta recargarla.

Se trata del problema conocido de Radix cuando un `DropdownMenu` modal abre un `Dialog`/`AlertDialog` desde un item:

- El item abre el diálogo **antes** de que el menú se cierre: `DropdownMenuItem onClick={onDelete}` (`front/src/components/project/workspace/PlanRowMenu.tsx:107`) → `ConfirmModal open={!!plans.planToDelete}` (`front/src/components/project/ProjectDetailModals.tsx:58`). Radix despacha la selección con `flushSync`, así que el diálogo se monta con el menú todavía abierto.
- Radix lleva en un solo `Set` las capas que bloquean el puntero, y solo restaura el `body` cuando la capa que se va es la última (`@radix-ui/react-dismissable-layer` 1.1.11, `dist/index.mjs:71-82`). El menú se anota mientras está abierto (`disableOutsidePointerEvents: context.open`, `@radix-ui/react-menu/dist/index.mjs:138`) y el diálogo siempre (`@radix-ui/react-dialog/dist/index.mjs:145`).
- Si el diálogo se desmonta mientras el menú todavía anima su salida, el diálogo ve dos capas y no restaura. Después, el menú se va con `disableOutsidePointerEvents` ya en `false` y tampoco restaura. Nadie devuelve `pointer-events` al `body`.

### Pasos para reproducir

1. `docker compose up --build`, entrar como `ingeniero@liard.dev` (`npm run db:seed`) y abrir un proyecto con al menos un plano.
2. En una fila de la lista de planos, abrir "Más opciones" → "Eliminar plano".
3. Pulsar "Cancelar" antes de que termine la animación de salida del menú (~150 ms). La forma confiable de lograrlo es Cypress en Electron:
   `npx cypress run --browser electron --spec cypress/e2e/project-detail-actions.cy.ts`
4. Inspeccionar `document.body` y hacer click en cualquier parte de la página.

### Esperado vs. real

- **Esperado:** al cerrarse el diálogo, `body` vuelve a `style=""` y la página responde a los clicks.
- **Real:** `body` queda con `pointer-events: none;` al menos 15 s (lo que duró la medición), sin `[role=menu]` ni `[role=alertdialog]` en el DOM. Un segundo click inmediato sobre "Más opciones" no abre el menú.

### Entorno

Docker compose local, `dev` en `eca395bd`, seed `db:seed`, Cypress 16 con Electron 146. A velocidad humana en Chromium no se reproduce: el `body` se restaura. Un usuario real solo lo sufre si cancela casi al instante (por ejemplo Enter y Esc seguidos con el teclado). En Cypress el test pasa en CI con Chrome, pero en local con Electron falla de forma sistemática: el segundo `click` usa `force: true` (`front/cypress/e2e/project-detail-actions.cy.ts:87,99`), que saltea el chequeo de `pointer-events` y esconde el bug.

## Apetito

Una tarde.

## Alcance

### Frontend

- `DropdownMenu modal={false}` en los cuatro menús con items que abren un diálogo. Así el menú no entra en la cuenta de capas y el diálogo bloquea y desbloquea solo, sin importar cuánto dure la animación del menú:
  - fila de plano, `PlanRowMenu.tsx:53` (Eliminar plano, `:107`, y el visor DXF rápido, `:70`);
  - procesamiento masivo, `PlansProcessAction.tsx:111`, cuyos items (`PlansBulkActionsMenu.tsx:27,37,46`) abren la confirmación de `PlansPanel.tsx:429`;
  - tarjeta de proyecto, `ProjectCard.tsx:138` (Eliminar, `:172` → `ConfirmModal` en `:296`);
  - fila del catálogo del proveedor, `SupplierCatalogTable.tsx:154` (Editar, `:165`, y Eliminar, `:170` → `SupplierCatalogPage.tsx:205,207`).
- `project-detail-actions.cy.ts`: afirmar que el `body` no queda con `pointer-events: none;` después de cancelar, y reabrir el menú sin `force: true`.

## Riesgos

- **`modal={false}` cambia la interacción con el menú abierto:** un click afuera cierra el menú *y además* actúa sobre lo que se clickeó (antes solo cerraba), la página scrollea y el resto no queda `aria-hidden`. En `ProjectCard` un click en otra tarjeta navega a ese proyecto.
- **Diferir la apertura del diálogo hasta que el menú termine de cerrarse** (abrirlo en `onCloseAutoFocus`) también lo resuelve y conserva el menú modal, pero agrega estado elevado en cuatro lugares y demora el diálogo lo que dura la animación.
- **En dev, `StrictMode` de React 19 agrega un efecto aparte:** Radix da de baja la capa del diálogo cuando el menú termina de cerrarse, con el diálogo todavía abierto. Con este cambio solo se traduce en que el `body` se desbloquea antes de tiempo. No pasa en el build de producción y queda fuera de este ticket.
- `src/components/ui/dropdown-menu.tsx` es salida generada de shadcn: el `modal` va en cada uso, no en el wrapper.

## Criterios de aceptación

### Frontend

- [ ] Menú → "Eliminar plano" → "Cancelar" deja el `body` sin `pointer-events: none;` y la página clickeable, incluso cancelando antes de que termine la animación del menú.
- [ ] Lo mismo con el visor DXF rápido, el menú de procesamiento masivo, la tarjeta de proyecto y la fila del catálogo del proveedor.
- [ ] Con el diálogo abierto, la página sigue bloqueada y el foco queda dentro del diálogo.
- [ ] `project-detail-actions.cy.ts` falla sin el arreglo y pasa con él, sin reintentos, en `npx cypress run --browser electron --spec cypress/e2e/project-detail-actions.cy.ts`.
- [ ] `npm run lint`, `npm run build`, `npm test` y `npm run verify:crop` en verde.

## Fuera de alcance

- Tocar `src/components/ui/` o actualizar `radix-ui` esperando un arreglo upstream.
- El comportamiento de `StrictMode` en dev descrito en Riesgos.
- Menús sin items que abran diálogos (exportar, marcas, cuenta): siguen modales.


# #945 Matcheo · variantes de descripción: símbolos del unifilar que faltan (potencia, accionamiento y media tensión) — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/945

## Contexto

El insumo principal de LIARD es el unifilar del tablero, y la lista de materiales con variantes de descripción (`evaluation/matching/variantes-descripcion.json`, #915 y #933) llega a 52. Pero hay símbolos comunes de un unifilar que no tienen material, y hoy caen en otro tipo o en ninguno:

- **Ya apareció uno en un plano real.** Una tabla de referencias de un cliente define «Diferencial Corriente de fuga», un relé diferencial con toroide, y el modelo lo eligió para tres diferenciales de verdad (`component-detector/README.md:273-275`). No hay material para él.
- **#933 ya dejó parte afuera a propósito.** Su *Fuera de alcance* manda a «otro ticket» la fuente de alimentación, el arrancador suave, el variador de frecuencia, el capacitor, el regulador de factor de potencia y el relé diferencial con toroide.
- **Hay símbolos de un unifilar que no están en ninguna lista:**
  - el interruptor de bastidor abierto (ACB), que es el general de un tablero grande;
  - el contactor para capacitores;
  - el enclavamiento mecánico entre dos interruptores;
  - la UPS;
  - y, en los unifilares de media tensión, el transformador de tensión, el relé de protección, el descargador y el fusible de MT.
- **La detección de tipo lee mal casi todos**, corriendo `ComponentTypeDetector` sobre los nombres sueltos:
  - «Relé diferencial» → RESIDUAL_CURRENT_BREAKER, por `'diferencial'` (`keyword-component-type-detection.rule.ts:44`);
  - «Interruptor automático abierto» → THERMOMAGNETIC_BREAKER (`:38`);
  - «Transformador de tensión» y «Transformador toroidal» → TRANSFORMER (`:72`);
  - «Contactor para capacitores» → CONTACTOR (`:64`);
  - «Descargador de media tensión» → SURGE_PROTECTION_DEVICE (`:81`);
  - «Relé de protección multifunción MT» → MULTIFUNCTION_METER;
  - el resto (variador, arrancador suave, capacitor, regulador, fuente, UPS, enclavamiento, toroide, fusible HH) → UNKNOWN.

Este ticket suma esos 15 materiales con el mismo formato de #915 y #933.

## Apetito

Dos días, como #933: uno para las variantes y otro para los códigos de las tres marcas. Si no alcanza, se recortan primero los códigos de media tensión y después los de la UPS. Los 15 materiales y la nota sobre la serie `1SDA…` de ABB se hacen igual.

## Alcance

### Datos (`evaluation/matching/`)

- **15 materiales nuevos en `variantes-descripcion.json`**, con el formato de #915: spec fija, variantes de nombre, formas de cada dato, entre 10 y 25 ejemplos etiquetados y notas con las trampas.
  - **Potencia y protección de baja tensión (7):**
    - relé diferencial (el aparato de «Diferencial Corriente de fuga»);
    - toroide (transformador toroidal para ese relé);
    - interruptor de bastidor abierto (ACB);
    - capacitor de potencia;
    - regulador de factor de potencia;
    - contactor para capacitores;
    - enclavamiento mecánico.
  - **Accionamiento y alimentación (4):**
    - variador de frecuencia;
    - arrancador suave;
    - fuente de alimentación;
    - UPS.
  - **Media tensión (4):**
    - transformador de tensión (TV);
    - relé de protección de MT;
    - descargador de MT;
    - fusible de MT (HH).
  - Cada uno con `origen: agregado` y dónde se vio, y `componentType: null` con su `propuestaComponentType`.
  - Las claves reusan las de #915 y #933 cuando significan lo mismo (`rated_current`, `voltage`, `poles`, `breaking_capacity`, `communication`, `mounting`). Solo se agregan las que faltan: potencia reactiva (kVAr), potencia del motor (kW / HP), escalones del regulador, relación del TV, sensibilidad regulable del relé diferencial, diámetro del toroide.
- **Series nuevas para Schneider, ABB y Siemens**, para cada material nuevo que la marca fabrique, con la misma regla de #915: patrón anclado y angosto, ejemplos reales, lectura del código cuando codifica specs, y URL del fabricante con `verificado`. Lo que se busque y no aparezca va a `pendientes`. APC es de Schneider: se carga como gama de Schneider Electric.
- **La serie `Tmax / Formula / Emax (SACE) – código de pedido` de ABB** (`^1SDA\d{6}R1$`) queda bajo «Interruptor de caja moldeada», pero su `notas` dice que también toma los Emax. Los Emax entran como designación comercial, en una serie propia bajo el ACB.
- **`README.md`**:
  - la lista de materiales y la tabla de parejas que se confunden;
  - la tabla de lo que la detección de tipo lee mal, con los nombres nuevos (corriendo `ComponentTypeDetector` como en #915 y #933);
  - el resumen de series por marca.
- **`variantes-descripcion.xlsx` y `.csv`** regenerados con `render_vista.py`.

### Backend

- `back/test/evaluation/variantes-descripcion.spec.ts` ya valida cualquier material nuevo con las mismas reglas. Solo cambia si hace falta una regla para un dato nuevo (por ejemplo, `25kVAr` o `7,5kW/10HP`).

## Riesgos

- **La media tensión puede no ser del alcance del producto.** Los planos medidos hasta hoy son de baja tensión (`evaluation/ground-truth.json:10-16`: ITM, DIF, seccionador, ojo de buey, motorizado, multimedidor). Antes de invertir el segundo día en códigos de MT hay que confirmar que los clientes mandan unifilares de MT. Si no, esos cuatro materiales entran solo con variantes.
- **Cada material nuevo se parece a uno que ya está.** Si las variantes no marcan la diferencia, el extractor y la regla de match los van a mezclar:
  - relé diferencial contra interruptor diferencial: ya pasó en un plano real (`component-detector/README.md:273-275`);
  - ACB contra interruptor de caja moldeada y contra termomagnético;
  - contactor para capacitores contra contactor, que es otro artículo (AC-6b, con resistencias de precarga) y otro precio;
  - transformador de tensión y toroide contra transformador y sensor de corriente;
  - descargador de MT contra descargador de sobretensiones de baja tensión;
  - relé de protección de MT contra instrumento de medición multifunción;
  - fuente de alimentación contra transformador (el Phaseo de Schneider ya está bajo «Transformador» en `codigos-por-marca.json`);
  - arrancador suave contra guardamotor y contactor.

  Cada una de esas parejas lleva en las `notas` de los dos materiales la palabra o el dato que las separa, y al menos un ejemplo que sin eso sería ambiguo.
- **La tensión de un capacitor no es la de la red.** Un capacitor para 380 V se pide de 440 V o 480 V; si el extractor iguala la tensión con la del tablero, matchea mal. Va en las `notas` y en los ejemplos.
- **kW y HP en el mismo texto.** Los variadores y arrancadores se escriben «7,5kW/10HP»; los dos valores son el mismo dato, y solo uno se etiqueta.
- **El toroide y el enclavamiento son accesorios**, y su descripción nombra el aparato con que van («Toroide p/relé diferencial Ø35», «Enclavamiento p/2 Compact NSX»). Los ejemplos traen esa mención sin etiquetarla como dato, igual que las bobinas y el zócalo de #933.
- **La UPS no es un mercado de las tres marcas.** Salvo APC, Schneider, ABB y Siemens venden poco en Argentina; lo esperable es que casi todo vaya a `pendientes`.
- **El código de ABB `1SDA…R1` no dice el producto.** Cubre Tmax, Formula, Emax y sus accesorios. Partirlo exige una lista cerrada o un patrón que hoy no se conoce; por eso se documenta en `notas` en vez de moverse.
- **Lo sintético sigue siendo sintético.** Las variantes nuevas van al seed y al ajuste, nunca a la parte de prueba de #904 ni como few-shot del extractor sin sacarlas antes del set con que se lo evalúa.

## Criterios de aceptación

### Datos

- [ ] Los 15 materiales están en `variantes-descripcion.json`, cada uno con su origen, su `propuestaComponentType`, sus variantes de nombre, sus datos con las formas de escritura, sus ejemplos y sus notas.
- [ ] Cada pareja de materiales parecidos de *Riesgos* tiene, en las `notas` de los dos, qué los separa.
- [ ] Cada material nuevo que Schneider, ABB o Siemens fabrique tiene al menos una serie. Lo que no se pudo verificar queda `verificado: false`, y lo que no se encontró va a `pendientes`.
- [ ] La serie `1SDA…R1` de ABB dice en sus `notas` que también toma los Emax, y los Emax tienen una serie de designación bajo el ACB.
- [ ] El README lista los materiales nuevos, suma sus nombres a la tabla de lo que la detección lee mal y actualiza el resumen de códigos.
- [ ] `variantes-descripcion.csv` y `variantes-descripcion.xlsx` traen los ejemplos de los 15 materiales nuevos, regenerados con `render_vista.py`.
- [ ] Quien pidió el ticket revisó las variantes de nombre de los 15 materiales, y confirmó si la media tensión entra con códigos.

### Backend

- [ ] `variantes-descripcion.spec.ts` pasa con los 67 materiales.
- [ ] `npm run lint:check`, `npm run typecheck` y `npm test` en verde.

## Fuera de alcance

- **La baliza, la sirena y el PLC**, que #933 mandaba al mismo ticket que el variador: no son símbolos del unifilar sino del esquema de comando. Van en un ticket de automatización.
- **Lo que aparece en el unifilar y no se compra para el tablero:** el motor, los circuitos de carga («Iluminación», «Tomas»), el medidor de la distribuidora y los puntos de conexión. No son materiales: los tiene que descartar el clasificador de `component-detector` como «no es un componente», y eso es otro ticket.
- **Armado del tablero:** gabinete, riel DIN, cablecanal, barras, peine, distribuidor de neutro, prensacables, terminales, ventilación.
- **La celda de media tensión completa**, que ya es un material (fila 21 de la tabla base).
- **Sumar los materiales nuevos a la lista del extractor de #932** (`component-materials.ts`).
- **Cambiar la lista de palabras clave, los parsers o el matcher.**
- **Marcas fuera de Schneider (con APC), ABB y Siemens.**

## Depende de

- #929 y #939, porque edita sus archivos. Se trabaja desde `dev` una vez mergeados, o apilado sobre #939 si hace falta empezar antes.


# #856 seed: los 88 componentes desde las plantillas existentes — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/856

.

# #836 Feature: Observabilidad de la Plataforma: Monitoreo de Aplicación (APM) y Trazabilidad de IA — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/836

# OBS-01 — Observabilidad de la Plataforma: Monitoreo de Aplicación (APM) y Trazabilidad de IA

## Resumen y Contexto

El sistema LIARD ejecuta operaciones críticas combinando APIs transaccionales tradicionales (NestJS, Prisma, PostgreSQL, React) con llamadas a modelos de inteligencia artificial (Anthropic Claude API para visión y clasificación) e inferencia local de visión computacional.

Actualmente no existe una capa de observabilidad centralizada: las fallas de backend y las métricas de rendimiento solo se visualizan en los logs locales de cada contenedor. Más aún, las llamadas a la API de Claude no cuentan con un registro unificado que permita auditar tokens consumidos, tiempos de respuesta, tasa de errores ni costos económicos asociados a cada plano o proyecto procesado.

Este ticket tiene como objetivo evaluar e implementar la observabilidad integral de la plataforma, cubriendo tanto el monitoreo de rendimiento y errores de la aplicación (APM) como la trazabilidad de los pipelines de IA.

---

## Problema Detectado

1. **Falta de visibilidad sobre consumo y costos de IA:**
   - No hay trazabilidad de las interacciones con los modelos LLM / visión (Claude).
   - Se desconoce con precisión cuántos tokens y qué costo en USD demanda procesar un plano determinado.
   - Las fallas o degradaciones en las respuestas de la IA no quedan registradas de manera estructurada con su contexto (prompt, imagen enviada, latencia).

2. **Ausencia de monitoreo de errores y rendimiento de la aplicación (APM):**
   - Si un endpoint falla o degrada su tiempo de respuesta (por ejemplo en la generación de cotizaciones o consultas pesadas a Postgres), solo se detecta si el usuario lo reporta o revisando logs crudos de Docker.
   - No hay alertas tempranas ante excepciones no capturadas ni métricas de salud de los servicios en ejecución.

---

## Alcance del Ticket

- **Trazabilidad y Observabilidad de IA:**
  - Evaluar e integrar una solución de observabilidad para LLMs (teniendo como herramienta recomendada **Langfuse**).
  - Registrar trazas de las llamadas a Claude API en los servicios de detección, incluyendo: tokens de entrada y salida, latencia, modelo utilizado, costo estimado y correlación con el plano o proyecto correspondiente.
- **Monitoreo de Aplicación y Errores (APM):**
  - Evaluar e implementar una herramienta de APM y tracking de errores (teniendo como recomendada **New Relic** o alternativa equivalente).
  - Instrumentar el backend (NestJS) y servicios para registrar excepciones, tiempos de respuesta de endpoints y eventos críticos.
- **Configuración desacoplada:**
  - Asegurar que la instrumentación se configure mediante variables de entorno y que, en ausencia de credenciales (ej. desarrollo local), los servicios continúen operando con normalidad sin interrumpir el funcionamiento ni arrojar errores.

---

## Criterios de Aceptación

- [ ] Las llamadas a los modelos de IA quedan registradas en la herramienta de trazabilidad (Langfuse o equivalente), mostrando tokens consumidos, latencia y costo estimado por plano/tarea.
- [ ] Los errores y métricas de rendimiento de los endpoints del backend se reportan en la plataforma de APM (New Relic o equivalente).
- [ ] La configuración de monitoreo se maneja de forma opcional mediante variables de entorno (la aplicación arranca y funciona normalmente si las claves no están provistas).
- [ ] La instrumentación no introduce sobrecarga perceptible ni degrada la latencia normal del sistema.
- [ ] La suite de tests unitarios y de integración del backend y servicios de detección pasa con 0 errores.


# #835 Feature: Estrategia de Actualización de Catálogo: Importación Incremental vs. Reemplazo Total — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/835

# CAT-01 — Estrategia de Actualización de Catálogo: Importación Incremental vs. Reemplazo Total

## Resumen y Contexto

Actualmente, el asistente de importación de catálogo de proveedores (`SupplierCatalogImportPage`) opera bajo una modalidad exclusivamente destructiva: al confirmar una planilla, el sistema reemplaza el catálogo completo del proveedor, despublicando todos los productos que no figuren en el archivo cargado.

En la dinámica comercial real, es muy habitual que un distribuidor maneje listas de precios separadas por fabricante o rubro, o que simplemente necesite actualizar los precios de un grupo de productos sin perder el resto de los artículos que ya tenía cargados y cotizando en la plataforma.

Este ticket implementa la posibilidad de que el proveedor elija entre una **actualización incremental (upsert)** y un **reemplazo total** de su catálogo.

---

## Problema Detectado

1. **Importación destructiva obligatoria:**
   - Cada importación asume que el archivo contiene la totalidad del inventario del proveedor.
   - Si el proveedor sube una lista parcial (por ejemplo, una lista de precios actualizada de una sola marca), todos los demás productos que tenía publicados desaparecen de las cotizaciones.

2. **Falta de opción para actualizar por código (SKU):**
   - No existe un mecanismo para actualizar los datos (precios, plazos, stock) de los ítems existentes que coincidan por código de artículo (`supplierItemCode`) e incorporar los nuevos, conservando intactos los productos previos no mencionados en la planilla.

3. **Inflexibilidad en la gestión de catálogos grandes o segmentados:**
   - Proveedores con catálogos amplios o provenientes de múltiples listas de fabricantes no pueden cargar sus productos de forma progresiva.

---

## Alcance del Ticket

- Permitir que el proveedor elija explícitamente el modo de importación en el asistente:
  1. **Actualizar catálogo existente (Incremental / Upsert):** Actualiza los productos que coinciden por código de artículo (`supplierItemCode`), suma los ítems nuevos y mantiene vigentes los productos que ya estaban publicados y no aparecen en el archivo.
  2. **Reemplazar catálogo completo:** Despublica el catálogo anterior y publica únicamente los artículos válidos de la nueva planilla.
- Adaptar la lógica y endpoints del backend para procesar la importación según el modo seleccionado.
- Ajustar la interfaz de confirmación (`CatalogReplaceWarning` y resúmenes de importación) para que los mensajes y advertencias se correspondan fielmente con el modo elegido.

---

## Criterios de Aceptación

- [ ] El asistente de importación permite al proveedor seleccionar entre "Actualizar catálogo existente" y "Reemplazar catálogo completo".
- [ ] En el modo de actualización incremental, los productos coincidentes por código (`supplierItemCode`) actualizan sus datos y los nuevos se agregan, sin despublicar ni alterar los ítems previos que no estaban en la planilla.
- [ ] En el modo de reemplazo total, se conserva el comportamiento de sustituir la totalidad del catálogo anterior.
- [ ] La interfaz informa con precisión cuántos ítems se actualizarán, cuántos se agregarán y si alguno se despublicará según la opción activa.
- [ ] Los tests de backend y frontend correspondientes a la importación de catálogo pasan con 0 errores.


# #834 Branding: Propuesta y Elección de Nombre Comercial del Producto — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/834

# BRAND-01 — Definición de Naming y Propuesta de Nombre Comercial del Producto

## Resumen y Contexto

Actualmente la plataforma utiliza "LIARD" como nombre provisional y de desarrollo interno. De cara a la presentación formal ante clientes, usuarios finales y comercialización del SaaS, se requiere definir el **nombre comercial y de marca definitivo** del producto.

La plataforma resuelve un problema crítico en la ingeniería eléctrica y de tableristas: automatiza la lectura e interpretación de planos CAD (unifilares), genera el cómputo y lista de materiales (BOM) con inteligencia artificial, y conecta inmediatamente con proveedores para cotizar y comprar. El nombre comercial debe reflejar profesionalismo, agilidad y tecnología en el sector B2B.

Este ticket tiene como objetivo investigar, idear y presentar un abanico de propuestas sólidas de naming para que el cliente pueda evaluar las alternativas y seleccionar la oficial.

---

## Alcance del Ticket

- Desarrollar una serie de propuestas de nombres comerciales (naming) para el producto.
- Cada propuesta debe contemplar:
  - Justificación conceptual / racional del nombre (por qué funciona, qué evoca y cómo se relaciona con la propuesta de valor).
  - Disponibilidad tentativa de dominios web (.com, .io, .app, .tech, .dev, etc.) y que no este en uso ya ese nombre
  - Evaluación de sonoridad, recordabilidad y posicionamiento en el mercado B2B de software de ingeniería.
- Presentar las opciones estructuradas en un documento para revisión y toma de decisión con el cliente.

---

## Fuera de Alcance

- La modificación de código, logos, favicons, rutas o textos en la aplicación (se realizará en un ticket técnico posterior una vez que el cliente elija el nombre definitivo).

---

## Criterios de Aceptación

- [ ] Existe un documento de propuestas de naming con múltiples alternativas fundamentadas.
- [ ] Cada alternativa detalla su justificación de marca, relación con el producto y viabilidad de dominios web.
- [ ] El documento está listo para ser presentado al cliente para la selección del nombre final.


# #833 Feature: Multiplicador de Planos para Consolidación de BOM — CLOSED
https://github.com/FacultadDeIngenieria/lab3-liard/issues/833

# PLANOS-02 — Multiplicador de Planos para Consolidación de BOM

## Resumen y Contexto

En proyectos de ingeniería eléctrica y tableristas, es muy común encontrar planos de tableros "típicos" o repetitivos (por ejemplo, un tablero seccional secundario idéntico que se replica en 10 departamentos o pisos de un edificio).

Actualmente, el sistema no contempla la repetición de un plano: para reflejar esas cantidades en la compra de materiales, el usuario tendría que subir y procesar el mismo archivo múltiples veces (gastando cómputo y tokens de IA innecesariamente), o alterar manualmente las cantidades del BOM consolidado fila por fila.

Este ticket implementa el soporte de un **multiplicador manual por plano**, de modo que el plano se procese una sola vez con IA, pero sus componentes se multipliquen por dicho factor al momento de consolidar el BOM del proyecto.

---

## Problema Detectado

1. **Falta de multiplicador de cantidades por plano:**
   - No existe la posibilidad de indicarle al sistema que los componentes detectados en un plano se repiten N veces en el proyecto.
   - El plano se procesa una única vez: el multiplicador actúa exclusivamente sobre las cantidades numéricas de los componentes que ese plano aporta al BOM consolidado, sin necesidad de reprocesar el plano ni generar planos duplicados en el proyecto.

2. **Consolidación rígida del BOM:**
   - Al consolidar los componentes del proyecto, las cantidades se suman 1 a 1 según lo detectado en el plano, sin considerar factores de escala o multiplicadores del tablero.

3. **Falta de visibilidad e indicación en la interfaz:**
   - La interfaz no dispone de un control para asignar o editar el multiplicador (por ejemplo, desde el detalle o listado de planos).
   - Tampoco existe un aviso o distintivo visual que alerte al usuario de que las cantidades de un plano están siendo afectadas por un multiplicador, lo que puede inducir a confusiones sobre el conteo real de componentes detectados vs. los requeridos para la compra.

---

## Alcance del Ticket

- Incorporar un campo de multiplicador en el plano (número entero `>= 1`, con valor por defecto `1`).
- Permitir la edición del multiplicador desde la interfaz de planos (en la lista o en la vista de detalle del plano, según defina quien lo implemente).
- Modificar la lógica de consolidación del BOM del proyecto para que las cantidades de los componentes detectados en el plano se multipliquen por su factor correspondiente.
- Asegurar que, si el usuario modifica el multiplicador con posterioridad al procesamiento, el BOM consolidado del proyecto se recalcule automáticamente.
- Mostrar una señal o aviso visual claro en la interfaz (badge o indicador de multiplicador, ej. `x3`) para aquellos planos con multiplicador mayor a 1.

---

## Criterios de Aceptación

- [ ] Cada plano cuenta con un multiplicador entero mayor o igual a 1 (por defecto 1).
- [ ] El usuario puede editar el multiplicador desde la interfaz (detalle o listado de planos).
- [ ] Al consolidar el BOM del proyecto, las cantidades de los componentes del plano se multiplican por dicho factor.
- [ ] Si se actualiza el multiplicador de un plano existente, el BOM del proyecto se actualiza dinámicamente reflejando el cambio.
- [ ] La interfaz muestra un indicador o aviso visual explícito cuando un plano tiene un multiplicador asignado.
- [ ] Las pruebas de backend y frontend asociadas a planos y consolidación de BOM pasan sin errores.


# #832 Feature: Soporte y Procesamiento de Planos en Formato PDF — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/832

## Resumen y Contexto

Actualmente, LIARD procesa exclusivamente planos eléctricos en formato DXF. Sin embargo, en la práctica profesional es muy común que los planos se encuentren y distribuyan en formato PDF.

El objetivo de este ticket es permitir que el usuario pueda cargar planos en formato PDF y que la herramienta procese el documento y detecte los componentes eléctricos tal como lo hace hoy con los archivos DXF.

Esto involucra una etapa inicial de evaluación de conversores y procesamiento de imágenes, seguida de la implementación técnica de extremo a extremo en el pipeline de detección y en la interfaz.

---

## Problema Detectado

1. **Incompatibilidad con archivos PDF:**
   - La plataforma no admite la subida ni el procesamiento de archivos PDF en la sección de planos de un proyecto.
   - El pipeline de backend y los servicios de detección asumen que la entrada es un archivo DXF, dejando fuera una gran cantidad de planos reales de clientes que solo existen en PDF.

2. **Evaluación de conversores y estrategia de procesamiento pendiente:**
   - No está determinado cuál es la mejor estrategia técnica para procesar PDFs en el sistema (por ejemplo, convertir el PDF a DXF para reutilizar el lector CAD actual, o procesar el PDF directamente mediante renderizado a imágenes de alta resolución hacia el modelo de detección).
   - Quien realice la tarea debe evaluar las herramientas, conversores y procesamiento de imágenes disponibles para definir la alternativa que asegure mejor fidelidad y rendimiento.

3. **Impacto en el visor del frontend:**
   - Si la solución adoptada no convierte a DXF y opta por trabajar sobre imágenes/raster, el visor de planos del frontend deberá ser adaptado para poder renderizar e inspeccionar las detecciones sobre el PDF o su imagen asociada sin romper la experiencia actual.

---

## Alcance del Ticket

- Investigar y evaluar las opciones de conversión y procesamiento de imágenes para planos en PDF.
- Habilitar la carga de archivos PDF en el modal de subida de planos (`UploadPlansModal`) y endpoints correspondientes.
- Implementar el pipeline necesario para que el sistema procese el PDF y extraiga los componentes eléctricos hacia el BOM.
- Adaptar el visor de planos en el frontend para asegurar la correcta visualización e inspección del plano cargado si la solución técnica lo requiere.

---

## Criterios de Aceptación

- [ ] El usuario puede seleccionar y subir planos en formato PDF en el proyecto.
- [ ] El sistema procesa el archivo PDF y genera las detecciones de componentes eléctricos correspondientes en el BOM.
- [ ] El plano en PDF procesado puede visualizarse e inspeccionarse en el visor de planos de la aplicación.
- [ ] El procesamiento de planos DXF existentes continúa funcionando con normalidad sin regresiones.


# #831 BOM-01C: Resolución de Proveedores y Emisión de Órdenes de Compra del Flujo Alternativo — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/831

# BOM-01C — Resolución de Proveedores y Emisión de Órdenes de Compra del Flujo Alternativo

## Resumen y Contexto

Al contar con una cotización alternativa y ofertas disponibles de los proveedores, se debe resolver la etapa final: cómo se adjudican los componentes y cómo se emite la orden de compra si el usuario decide avanzar con la opción alternativa (o combinar selecciones).

Este ticket aborda la resolución del lado del proveedor y el cierre de la orden de compra.

---

## Problema Detectado

- Al adjudicar y confirmar la compra desde la cotización alternativa, no está definido el mecanismo para que la orden de compra generada especifique inequívocamente la variante alternativa adquirida en lugar de la original.
- El proveedor necesita recibir órdenes con la especificación y código exacto que cotizó, manteniendo para el proyecto la trazabilidad entre el material original solicitado y el componente alternativo comprado.

---

## Alcance del Ticket

- Resolver la adjudicación y emisión de órdenes de compra cuando el ingeniero selecciona la cotización alternativa (o ítems de ella).
- Garantizar que las órdenes de compra emitidas a los proveedores detallen con precisión los ítems, marcas y especificaciones correspondientes.
- Asegurar la trazabilidad en el historial del proyecto y de pedidos sobre qué componentes fueron efectivamente adquiridos.

---

## Criterios de Aceptación

- [ ] El usuario puede ejecutar y confirmar la orden de compra desde la cotización alternativa.
- [ ] Las órdenes de compra generadas para los proveedores detallan los componentes, especificaciones y marcas de la variante seleccionada.
- [ ] La vista de pedidos y órdenes del ingeniero y del proveedor reflejan la información correcta y trazable.
- [ ] Todas las pruebas de emisión de órdenes de compra pasan con 0 errores.


# #830 BOM-01B: Generación y Comparación del Flujo de Cotización Alternativa (Backup) — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/830

# BOM-01B — Generación y Comparación del Flujo de Cotización Alternativa (Backup)

## Resumen y Contexto

Una vez que el BOM cuenta con especificaciones alternativas por componente, el sistema necesita poder generar un segundo pedido de cotización completo ("Cotización Alternativa / Backup"). Esto le permite al ingeniero comparar de forma integral ambos presupuestos: la cotización base vs. la cotización con alternativas.

Este ticket aborda la generación, procesamiento y visualización comparativa de ambas cotizaciones dentro del proyecto.

---

## Problema Detectado

- El motor de cotizaciones (`BomQuote`) solo procesa el set único de materiales base. No existe la lógica para conformar la lista de ítems de la cotización alternativa (compuesta por los componentes alternativos donde se hayan definido, y los componentes normales donde no haya alternativa).
- La pantalla de cotizaciones no permite alternar, visualizar ni comparar una cotización normal contra una cotización de backup para el mismo proyecto.

---

## Alcance del Ticket

- Implementar la lógica de negocio para construir y procesar el set de cotización alternativo (alternativos donde existan + normales restantes).
- Gestionar en base de datos y backend la existencia de dos cotizaciones para un mismo proyecto (normal y alternativa).
- Habilitar en la interfaz de usuario la visualización y comparación entre los resultados de ambas cotizaciones.

---

## Criterios de Aceptación

- [ ] El sistema genera la lista de cotización alternativa correctamente (ítems alternativos definidos + ítems normales donde no hubo alternativa).
- [ ] El backend procesa la cotización alternativa contra los catálogos de proveedores disponibles.
- [ ] El ingeniero puede visualizar y comparar en la interfaz la cotización normal y la cotización alternativa del proyecto.
- [ ] Los tests de cotización y matching pasan con 0 errores.


# #829 BOM-01A: Carga y Gestión de Especificación Alternativa en el Editor de BOM — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/829

# BOM-01A — Carga y Gestión de Especificación Alternativa en el Editor de BOM

## Resumen y Contexto

En el Editor del BOM (`BomEditorPage`), cada ítem de material cuenta únicamente con campos para material, especificación, cantidad y marca. No existe la posibilidad de definir una segunda opción o especificación alternativa para aquellos componentes donde el ingeniero admita un sustituto o backup.

Este ticket cubre la primera parte del flujo: permitir que el usuario pueda cargar, editar y persistir especificaciones y marcas alternativas directamente en el editor del BOM.

---

## Problema Detectado

- La interfaz y el modelo de datos de `ProjectBomItem` no contemplan campos para registrar una especificación alternativa ni una marca alternativa por componente.
- Si el usuario desea considerar un reemplazo técnico admisible, actualmente debe sobrescribir la especificación original o duplicar filas a mano, perdiendo la relación entre el componente principal y su alternativa.

---

## Alcance del Ticket

- Extender el modelo de datos y los endpoints del backend para almacenar la especificación alternativa y la marca alternativa en cada ítem del BOM.
- Adaptar el Editor de BOM en frontend para permitir ingresar, visualizar, editar y eliminar la especificación alternativa de forma clara e intuitiva.
- Asegurar que la carga de alternativas sea totalmente opcional por ítem.

---

## Criterios de Aceptación

- [ ] El modelo de datos y los endpoints de BOM permiten persistir una especificación alternativa y su marca asociada por ítem.
- [ ] La interfaz del Editor del BOM permite cargar, editar y visualizar las especificaciones alternativas por componente.
- [ ] El campo de alternativa es opcional: los ítems sin alternativa se guardan normalmente sin requerir datos adicionales.
- [ ] Los tests unitarios y de integración de BOM pasan con 0 errores.


# #828 Épica: Especificación Alternativa en Editor de BOM y Cotización de Backup — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/828

# Épica: Especificación Alternativa en Editor de BOM y Cotización de Backup

## Resumen y Contexto

En la práctica de compras de ingeniería eléctrica, es habitual que el profesional requiera contar con una **segunda opción o backup de cotización** para ciertos materiales (por ejemplo, especificar una marca o modelo alternativo en caso de falta de stock o diferencia de costos), sin perder el componente original como opción principal.

Hoy el sistema no permite registrar especificaciones alternativas dentro del editor de BOM, ni tampoco generar y gestionar un segundo flujo de cotización alternativa con los proveedores.

Esta épica coordina la implementación integral del flujo dividida en tres partes:

---

## Sub-issues de Implementación

1. **Parte 1 — Editor del BOM:**
   - [ ] [#829 — BOM-01A: Carga y Gestión de Especificación Alternativa en el Editor de BOM](https://github.com/FacultadDeIngenieria/lab3-liard/issues/829)
   - Extensión del modelo de datos de `ProjectBomItem` y soporte en la interfaz para cargar marca y especificación alternativa opcional por ítem.

2. **Parte 2 — Cotización Alternativa:**
   - [ ] [#830 — BOM-01B: Generación y Comparación del Flujo de Cotización Alternativa (Backup)](https://github.com/FacultadDeIngenieria/lab3-liard/issues/830)
   - Lógica de backend para construir y procesar el set de cotización de backup (alternativos + normales restantes), y vista de comparación entre cotización normal y alternativa.

3. **Parte 3 — Proveedores y Órdenes de Compra:**
   - [ ] [#831 — BOM-01C: Resolución de Proveedores y Emisión de Órdenes de Compra del Flujo Alternativo](https://github.com/FacultadDeIngenieria/lab3-liard/issues/831)
   - Adjudicación de ítems, emisión de órdenes de compra con detalle de la variante alternativa elegida y trazabilidad en el proyecto.

---

## Criterios de Aceptación de la Épica

- [ ] Las 3 sub-issues (`#829`, `#830`, `#831`) se encuentran implementadas y verificadas.
- [ ] El flujo completo (desde la carga de alternativas en el editor hasta la emisión de órdenes de compra a proveedores) funciona de extremo a extremo sin errores.


# #827 Feature: Tiempos de Entrega de Proveedores en Matriz de Cotización y Confirmación de Pedidos — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/827

## Resumen y Contexto

En el sistema LIARD, los plazos de entrega (`leadTimeDays` a nivel proveedor y `leadTimeDaysMin` / `leadTimeDaysMax` a nivel ítem de catálogo) ya están presentes en la base de datos y en los catálogos. Sin embargo, en la experiencia del ingeniero al armar y confirmar cotizaciones, los tiempos de entrega están prácticamente invisibilizados y desarticulados del flujo de compra.

Al momento de comparar proveedores, armar la adjudicación del BOM y ejecutar la orden de compra, el usuario solo ve precios y marcas, sin saber cuánto va a tardar en recibir los componentes ni cuál es el tiempo global de demora de su pedido.

---

## Problema Detectado

1. **Invisibilidad de plazos en la Matriz de Cotizaciones:**
   - La tabla/matriz del workspace (`quotation-workspace`) no expone el tiempo de entrega en las celdas ni en la vista principal.
   - El espacio actual de la matriz está muy cargado y no cuenta con un lugar previsto para mostrar los plazos por ítem o proveedor, lo que impide al usuario evaluar la relación precio vs. demora.
   - *Nota de espacio en celda:* Actualmente la celda muestra precio unitario y precio total. Para no sobrecargar la celda ni deformar la altura fija, se puede evaluar mostrar el tiempo de entrega en lugar del precio total (ya que el total es derivable de la cantidad que ya figura en la fila, mientras que el tiempo de entrega es una variable de decisión clave que hoy falta).

2. **Falta de cálculo del tiempo total al ejecutar la cotización:**
   - No se calcula ni se muestra el tiempo total estimado que demorará en completarse el pedido según los proveedores adjudicados.
   - Al momento de confirmar y emitir la orden de compra, el usuario no recibe ninguna confirmación de los plazos de entrega estimados (ni por proveedor individual ni el cuello de botella global de recepción de la compra).

3. **El optimizador "Más Rápido" no funciona adecuadamente:**
   - La lógica existente de auto-adjudicación por rapidez (`allocateFastest`) presenta fallas o no se encuentra integrada de forma funcional con la matriz ni con las variantes de catálogo actuales.

---

## Alcance del Ticket

- Diseñar e implementar la visualización de los tiempos de entrega dentro de la Matriz de Cotizaciones y su panel de detalle (evaluando la adaptación o rediseño necesario de la tabla para que la información conviva de forma clara).
- Implementar el cálculo del tiempo de entrega estimado de la cotización en función de los proveedores e ítems seleccionados.
- Mostrar de forma clara el plazo de entrega estimado al momento de ejecutar/confirmar la cotización y emitir los pedidos.
- Corregir y poner en funcionamiento la optimización por rapidez para que adjudique correctamente según los plazos reales disponibles.

---

## Criterios de Aceptación

- [ ] Los tiempos de entrega son visibles y comprensibles en la Matriz de Cotizaciones y en el detalle de las ofertas.
- [ ] La interfaz calcula e informa el tiempo estimado de entrega total al momento de ejecutar/confirmar la cotización.
- [ ] Al emitir la orden de compra, queda registrado y visible el plazo estimado por cada proveedor involucrado.
- [ ] La funcionalidad de auto-adjudicación por rapidez ("Más Rápido") funciona correctamente considerando stock y plazos reales.
- [ ] Todas las pruebas existentes y nuevas asociadas a cotizaciones y adjudicación pasan con 0 errores.


# #826 UI/UX: Rediseño y Mejora de Experiencia en Pantalla de Perfil y Edición de Entidades — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/826

## Resumen y Contexto

La gestión de perfil y la edición de entidades (nombres de proyectos y pedidos) requieren una experiencia de usuario (UI/UX) moderna, clara y consistente con el diseño general de LIARD (Tailwind v4, componentes accesibles y diseño limpio).

Este ticket aborda el diseño visual, la interacción y el feedback de la pantalla de perfil (tanto para Ingeniero como para Proveedor) y los flujos de renombrado de entidades, asegurando facilidad de uso, estados de carga claros y manejo amigable del avatar.

---

## Alcance del Ticket

1. **Diseño y Layout de la Pantalla de Perfil:**
   - Estructuración visual limpia en secciones (información básica, avatar, configuración de cuenta).
   - Adaptación dinámica según el rol del usuario autenticado (campos de Ingeniero vs. Proveedor).
   - Estados de carga (skeletons / spinners) y manejo de estados vacíos o errores.

2. **Interacción del Avatar / Logo:**
   - Componente visual interactivo para cambiar el avatar/logo con previsualización en tiempo real.
   - Indicador visual mientras la imagen se está subiendo o procesando.

3. **Experiencia de Edición de Proyectos y Pedidos:**
   - Flujo de interacción claro y accesible para editar nombres y descripciones de proyectos y pedidos (ej. edición inline accesible o modal rápido).
   - Prevención de clics duplicados y confirmación no invasiva.

4. **Feedback y Accesibilidad:**
   - Notificaciones toast claras y comprensibles ante cambios guardados o errores de validación.
   - Navegación completa por teclado y etiquetas accesibles (ARIA).
   - Diseño completamente responsivo.

---

## Criterios de Aceptación

- [ ] La pantalla de perfil cuenta con un diseño limpio, moderno y consistente con el sistema de diseño de la app.
- [ ] La interacción con el avatar incluye previsualización inmediata y estados claros de carga y feedback.
- [ ] El flujo para renombrar proyectos y pedidos es intuitivo, ágil y no requiere recargar la página.
- [ ] Se implementan notificaciones visuales (toasts) para confirmar el éxito o error de cada acción.
- [ ] La interfaz es responsiva y accesible mediante teclado.


# #825 Feature: Perfil de Proveedor, Datos Comerciales, Configuración y Depuración de Campos — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/825

## Resumen y Contexto

Los usuarios con rol Proveedor tienen datos particulares asociados a su actividad comercial (nombre de empresa, marcas que distribuye, categorías de componentes, zonas de cobertura, plazos y montos mínimos). Actualmente no disponen de una pantalla de perfil para modificar o mantener al día esta información luego del registro.

Al igual que en el perfil de usuario, se requiere revisar y auditar los datos que se le solicitan al proveedor para eliminar campos innecesarios o redundantes, simplificando la carga y asegurando que solo se conserve la información que efectivamente impacta en el catálogo, cotizaciones y pedidos.

---

## Alcance del Ticket

1. **Auditoría y Depuración de Datos del Proveedor:**
   - Analizar los campos actuales de la entidad de proveedor (categorías, marcas, datos fiscales, web, etc.).
   - Eliminar datos que no tengan uso práctico o que añadan fricción innecesaria al proveedor.

2. **Gestión de Perfil Comercial:**
   - Pantalla de perfil adaptada al rol Proveedor.
   - Edición de información de la empresa (nombre comercial, descripción, logo o avatar de empresa).
   - Configuración de cobertura (zonas de entrega) y marcas representadas.
   - Parámetros comerciales operativos (tiempos de entrega estimados).

3. **Persistencia y Permisos:**
   - Endpoints de actualización con validaciones y control de acceso exclusivo para rol Proveedor (`@Roles(UserRole.PROVIDER)`).
   - Asegurar que los cambios se sincronicen correctamente con los datos visibles en las cotizaciones y órdenes de compra.

---

## Criterios de Aceptación

- [ ] Se revisaron y depuraron los campos solicitados al proveedor, descartando los que no tengan sentido ni uso real.
- [ ] El proveedor puede visualizar y editar sus datos comerciales y de contacto desde su perfil.
- [ ] El proveedor puede gestionar sus marcas, zonas de entrega y condiciones comerciales básicas.
- [ ] El proveedor puede subir o cambiar el logo / avatar de su empresa.
- [ ] Los datos actualizados persisten correctamente y se reflejan en el sistema.


# #824 Feature: Perfil de Usuario (Ingeniero), Avatar, Depuración de Campos y Renombrado de Proyectos/Pedidos — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/824

## Resumen y Contexto

Actualmente, los usuarios con rol Ingeniero cargan información durante el onboarding, pero no cuentan con una sección para consultar o actualizar sus datos personales luego del registro, ni para gestionar su foto de perfil / avatar. 

Además, las entidades principales que crea el usuario (como los Proyectos y los Pedidos u Órdenes de Compra) no permiten editar sus nombres o datos básicos una vez creadas. 

Por último, es necesario realizar una revisión y auditoría de todos los datos que se le solicitan al usuario hoy en día, eliminando aquellos campos innecesarios que agregan complejidad o fricción y no aportan valor a los flujos del sistema.

---

## Alcance del Ticket

1. **Auditoría y Depuración de Datos del Usuario:**
   - Revisar los campos existentes en el modelo `User` y en los formularios de onboarding/perfil.
   - Identificar y remover aquellos datos superfluos que no se utilicen en el sistema ni en el negocio (por ejemplo campos fiscales o cargos innecesarios si no aplican).

2. **Gestión de Perfil de Usuario (Ingeniero):**
   - Habilitar la visualización y edición de los datos de la cuenta desde la aplicación.
   - Permitir actualizar datos personales (nombre completo, datos de contacto relevantes, empresa, etc.).
   - Soporte para avatar / foto de perfil: permitir al usuario cargar o actualizar su imagen (`photoUrl`).

3. **Edición de Entidades Creadas por el Usuario:**
   - **Proyectos:** Permitir editar el nombre y la descripción de proyectos existentes.
   - **Pedidos / Órdenes:** Permitir renombrar o personalizar el nombre/referencia de pedidos u órdenes de compra generadas.

4. **Persistencia y Backend:**
   - Asegurar endpoints para actualización de usuario (`PATCH /users/me`), proyectos (`PATCH /projects/:id`) y pedidos (`PATCH /purchase-orders/:id` o equivalente).
   - Validaciones de entrada y control de pertenencia (un usuario solo edita sus propios proyectos y pedidos).

---

## Criterios de Aceptación

- [ ] Se revisaron y depuraron los datos del usuario, removiendo campos innecesarios en base de datos, DTOs y pantallas.
- [ ] El usuario puede ver y editar sus datos personales desde la sección de perfil.
- [ ] El usuario puede cargar y actualizar su avatar / foto de perfil de manera persistente.
- [ ] El usuario puede renombrar y editar la descripción de sus proyectos.
- [ ] El usuario puede editar el nombre o identificador de sus pedidos / órdenes de compra.
- [ ] Todos los cambios se guardan en backend con las validaciones y permisos correspondientes.


# #823 Spike: Investigación y Diseño de Arquitectura de Despliegue para LIARD — CLOSED
https://github.com/FacultadDeIngenieria/lab3-liard/issues/823

## Resumen y Objetivo

Investigar y diseñar la arquitectura integral de producción para LIARD y su estimación de costos asociada. 

El objetivo es que, al finalizar este ticket, quede completamente definida la infraestructura técnica y económica para presentarla y validarla con el cliente, y a partir de allí comenzar inmediatamente con la implementación de los despliegues.

---

## Contexto de la Aplicación

El sistema LIARD cuenta con los siguientes componentes que deben operar coordinadamente en producción:
- **Frontend:** React 19 + Vite + Tailwind CSS.
- **Backend:** NestJS 11 + Prisma 6.
- **Base de datos:** PostgreSQL 17.
- **Servicio de planos:** `symbol-detection-service` (FastAPI / ezdxf / matplot / Claude API).
- **Detector de componentes con IA:** `component-detector` (FastAPI + PyTorch + Ultralytics YOLO), el cual es intensivo en recursos (cómputo y memoria).
- **Almacenamiento de archivos:** Planos DXF pesados (hasta 100 MB), imágenes y recortes generados.

---

## Puntos a Investigar y Definir

La investigación debe ser libre y evaluar la mejor relación costo-beneficio, performance y simplicidad operativa para el proyecto, definiendo:

1. **Infraestructura y hosting general:**
   - Dónde y cómo alojar el frontend, backend y base de datos.
   - Configuración de red, proxy reverso, dominio y certificados SSL.

2. **Estrategia y dimensionamiento para YOLO (`component-detector`):**
   - Definir cómo y dónde va a correr el modelo (ej. contenedor en la misma máquina, instancia dedicada, instancias Spot, requerimientos de CPU/RAM o aceleración).
   - Manejo de concurrencia y prevención de caídas por consumo de memoria (OOM).

3. **Almacenamiento y persistencia de planos:**
   - Definir la estrategia para persistir los archivos y planos subidos (almacenamiento en disco persistente vs. object storage en la nube).

4. **Automatización y CI/CD:**
   - Flujo para compilar, generar imágenes y desplegar automáticamente ante cambios aprobados.

5. **Estimación de costos:**
   - Desglose detallado del costo mensual proyectado para la operación del sistema, listo para presentar al cliente.

---

## Criterios de Aceptación

- [ ] Existe el documento de arquitectura (`docs/arquitectura/ADR-01-arquitectura-despliegue.md`) con toda la arquitectura técnica definida y lista para implementar.
- [ ] Está definida la infraestructura para cada servicio y el esquema de ejecución de YOLO (tipo de instancia, dimensionamiento y costos).
- [ ] Está definida la solución de almacenamiento persistente para planos y archivos.
- [ ] Se cuenta con el desglose de costos mensuales estimados para presentar al cliente.
- [ ] Quedan definidos los tickets técnicos de implementación derivados para comenzar la ejecución.


# #814 Demo en vivo de la plataforma en las oficinas de Liard — CLOSED
https://github.com/FacultadDeIngenieria/lab3-liard/issues/814

# Demo en vivo en las oficinas de Liard

## Contexto

Fuimos a las oficinas de Liard, la empresa de nuestro cliente, a hacer una demo en vivo
de la plataforma. La audiencia no fue solo nuestro contacto habitual: estuvo la gente que
trabaja ahí y que sería usuaria real de la herramienta, más otros contactos del cliente
que mostraron interés en usarla.

Es la primera vez que la plataforma se presenta fuera del equipo y sobre el flujo completo,
en vivo y sin cortes de edición. Hasta ahora el producto se venía validando contra el
cliente directo; acá se expuso a usuarios finales y a terceros.

- **Fecha:** _(completar)_
- **Lugar:** oficinas de Liard
- **Por nuestro lado:** _(completar)_
- **Por el lado del cliente:** _(completar)_

## Qué se mostró

- [ ] _(completar: recorrido efectivamente mostrado — proyecto, carga de planos,
      procesamiento, símbolos no identificados, BOM, cotización, pedido, lado proveedor)_

## Feedback recibido

Lo que dijeron los asistentes, separado de nuestra interpretación.

- [ ] _(completar: pedidos concretos de funcionalidad)_
- [ ] _(completar: fricciones observadas mientras se mostraba)_
- [ ] _(completar: dudas que aparecieron y no supimos responder en el momento)_

## Qué se lleva de acá

- [ ] Abrir los tickets que salgan del feedback, uno por pedido concreto, en vez de dejarlos
      en esta lista.
- [ ] Usar lo aprendido en vivo — qué partes del flujo hubo que explicar y cuáles se
      entendieron solas — como insumo del guion de los videos comerciales: #787 (flujo
      completo de Usuario) y #788 (flujo completo de Proveedor).
- [ ] Registrar qué nombre de producto y qué identidad visual se usaron frente al cliente,
      porque los dos tickets de video arrancan con esa definición pendiente.

## Criterio de aceptación

El ticket se considera terminado cuando la visita quede registrada con fecha, asistentes,
recorrido mostrado y feedback textual, y cuando cada pedido concreto que salió de la reunión
tenga su propio ticket abierto y enlazado desde acá.

## Fuera de alcance

- No se implementa nada de lo pedido en la reunión dentro de este ticket; cada cosa va a su
  propio ticket.
- No se graba, edita ni produce ningún video acá: eso es #787 y #788.
- No se define el nombre comercial ni la identidad visual del producto; este ticket solo
  registra qué se usó en la demo.


# #813 Spike: recuperar los símbolos que YOLO no recuadra, buscándolos en el tile residual — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/813

## El problema

El detector YOLO de `component-detector/` es la **única** puerta de entrada al BOM: se clasifica un recorte
por cada caja que YOLO propuso (`component-detector/analysis.py:70-95`) y nada más. Un símbolo que YOLO no
recuadra no genera recorte, Claude no lo ve nunca, y desaparece del listado **en silencio** — que es el
único error inaceptable, porque un BOM al que le falta una fila se ve igual que uno completo.

Los dos recuperadores que ya existen están topeados por diseño:

- `agree_by_block` avisa de una inserción sin caja sólo si al menos 2 hermanas del mismo bloque sí salieron
  y se encontró el 70% de la familia (`component-detector/block_vote.py:219-227`). Una familia detectada
  0 de N no genera ninguna alerta. Los SPM son ese caso: el detector «no los ve NUNCA, en ningún umbral»
  (`component-detector/twins.py:21-26`).
- `twins_without_a_box` necesita una caja ya detectada y clasificada como componente con confianza alta o
  media para armar el molde (`component-detector/twins.py:91`, `:123`). Sin un ejemplar detectado de la
  familia no hay semilla.

Y hay algo previo a todo lo demás: **lo que se recupera hoy no se clasifica**. `analyze` corre
`agree_by_block` y `twins_without_a_box` después de clasificar y ya no vuelve al paso de recortes
(`component-detector/analysis.py:105-109`); un `MissingBox` viaja al backend con la nota de que «no hay
recorte, no hay respuesta del modelo y no hay nada que contar» (`component-detector/backend_contract.py:173-201`).

## La forma del problema

El detector no mira el plano entero: lo parte en baldosas de 640 px con paso de 320
(`component-detector/detection.py:66-76`) y descarta las que no tienen tinta
(`component-detector/detection.py:87-89`, `:213`). **Cada tile contiene pocos símbolos.**

Eso define la tarea que todas las alternativas de abajo tienen que resolver, y es la misma para todas:

> Dado un tile de 640 px con las cajas que YOLO ya encontró marcadas sobre la imagen, devolver la caja de
> los símbolos que quedaron **sin** recuadrar. Sin clasificar: sólo localizar.

La salida es entonces idéntica a la de YOLO — una caja en píxeles, trasladable a píxeles del plano — y entra
al mismo recorte y a la misma llamada a Claude que el resto. Claude sigue siendo el único que decide qué es
cada cosa, y por eso los falsos positivos de un recuperador son tolerables y los falsos negativos no.

Medido sobre los 11 runs de `component-detector/runs/`, el denominador de cualquier modelo por tile:

| render | tiles @1.0 | tiles @1.6 | total | cajas YOLO |
| --- | --- | --- | --- | --- |
| 5404×1095 | 30 | 104 | **134** | 208 |
| 2630×977 | 14 | 36 | 50 | 85 |
| 2018×1043 | 10 | 36 | 46 | 44 |
| 810×1042 | 2 | 12 | 14 | 17 |
| 521×866 | 1 | 3 | 4 | 15 |

Mediana 46 tiles por plano, máximo 134, mínimo 4. Una pasada de un modelo barato por todos los tiles del
peor tablero está en el orden de los diez centavos, y limitada a escala 1.0 (30 tiles) en el de los dos.
**El costo no es el problema; la latencia y la calidad sí.**

## Apetito

Una semana.

## Qué hay que probar

### Habilitantes

| | Qué | Para qué |
| --- | --- | --- |
| 1 | **Clasificar los `MissingBox`** | Que lo que encuentra un recuperador genere su recorte y pase por `ComponentClassifier` como cualquier caja de YOLO. Mientras no exista, ningún recuperador agrega una fila al BOM: sólo alarga la revisión manual. |
| 2 | **Banco de tiles residuales y función de medición única** | Que todas las alternativas se puntúen con la misma vara: recall recuperado, falsos positivos, costo USD y segundos, sobre los 10 tableros de `planos/`. Sin esto cada opción se evalúa distinto y no se pueden comparar. |
| 3 | **Techo actual** | Cuántos símbolos reales quedan hoy sin caja, por tablero y por familia de bloque. Es el número que dice si el problema vale una semana o si son dos huecos por tablero. |
| 4 | **Triage por tinta no cubierta** | Fracción de píxeles con tinta del tile que no cae dentro de ninguna caja de YOLO. Un tile cuya tinta está toda cubierta no se manda a nadie. Es el filtro más barato que hay y decide cuántos tiles paga cada modelo. |

### Desde el DXF (USD 0, milisegundos)

No miran el tile, pero producen las mismas cajas y son gratis. Lo que recuperen deja de ser residuo para
todo lo demás.

| | Qué | Para qué |
| --- | --- | --- |
| 5 | **Censo de bloques 0 de N con muestreo por familia** | Recuperar las familias que YOLO no detecta nunca. `_blocks_of` ya enumera cada INSERT con sus extents (`component-detector/block_vote.py:126-146`). La clave es preguntar **una vez por familia y no por inserción**: en el tablero medido hay 82 + 61 inserciones de conductor y planilla (`:224-226`), así que una por una son ~143 llamadas sobre 208; el INSERT ya garantiza que las N son el mismo símbolo, entonces se clasifica un representante y se aplica a todas. ~143 → ~5. |
| 6 | **Filtro por capa + lectura de `ATTRIB`** | Descartar las familias de anotación (conductor, planilla, marco, cotas) antes de gastar la llamada, para que el censo no inunde la revisión. Los atributos además traen la especificación gratis. |
| 7 | **`twins` sembrado desde la tabla de referencias** | Liberar a `twins` de depender de que YOLO acierte al menos una vez: en vez del molde sacado de una caja detectada (`component-detector/twins.py:118-124`), usar la geometría canónica de cada símbolo de `planos/table-ref-fundaleu.dxf`. Cubre el caso SPM y los planos explotados sin INSERT útiles (`hola.dxf`: 13 bloques, los 13 distintos). Es también el «matching vectorial contra la tabla»: el mismo mecanismo, no dos. |
| 8 | **Anclas por texto** | Encontrar especificaciones sueltas (`10A`, `30mA`, `Curva C`, `2x`, `kA`) que no tengan ninguna caja cerca, y proponer una región alrededor. Sin OCR: el texto ya está en el DXF. Es la única red que no depende de la forma del símbolo. |
| 9 | **Caché negativo entre planos del proyecto** | Que una familia juzgada «no es componente» en el plano 1 no se vuelva a preguntar en los planos 2..N. Control de costo, no de recall. |

### Modelos de API, por tile

| | Qué | Para qué |
| --- | --- | --- |
| 10 | **Claude Haiku 4.5** | El candidato más directo: el cliente, el prompt cache y la concurrencia ya existen (`component-detector/claude_client.py`) y no agrega proveedor. Es la comparación natural contra Flash-Lite. |
| 11 | **Gemini 3.1 Flash-Lite** | ~USD 0,25/M entrada y 1,50/M salida. La hipótesis es distinta de la que cerró `#811`: no «Gemini clasifica mejor que Claude» sino «Flash-Lite localiza lo no cubierto en un tile con pocos símbolos». |
| 12 | **Gemini 3.1 Flash** | El escalón de arriba, sólo si Lite no alcanza. |
| 13 | **Claude Sonnet 5 / Opus 5** | No para producción: es el techo de calidad, el número que dice cuánto recall es alcanzable con este planteo. Sin él no se sabe si un modelo barato rinde mal o si la tarea está mal planteada. |

### Modelos locales condicionados por ejemplo o por texto (USD 0, GPU recomendable)

Estos no necesitan que la clase esté en ningún dataset, que es exactamente el problema con los símbolos que
el detector nunca vio.

| | Qué | Para qué |
| --- | --- | --- |
| 14 | **YOLOE con prompt visual** | Buscar en el tile todas las apariciones parecidas a un recorte del símbolo de la tabla de referencias. Más prometedor que describirlo con palabras: «interruptor termomagnético» no describe una forma. |
| 15 | **YOLOE con prompt de texto** | El control barato de 14: dice cuánto del resultado viene del ejemplo visual y cuánto del modelo. |
| 16 | **OWLv2 / OWL-ViT, image-guided detection** | Detección one-shot condicionada por un recorte de ejemplo. Es el planteo más directo de «buscá esto en este tile». |
| 17 | **DINOv2 / DINOv3 + template matching sobre features** | Embeddings densos self-supervised: buscar el parche más parecido al símbolo de la tabla. One-shot, sin entrenar nada, y más robusto que comparar píxeles crudos. |
| 18 | **Grounding DINO** | Open-vocabulary por texto. Pesado, y arrastra el problema de transferencia de imagen natural a simbología CAD, pero es el más maduro de su familia. |
| 19 | **YOLO-World** | Lo mismo que 18, más liviano y más rápido de probar. |
| 20 | **Florence-2, `<REGION_PROPOSAL>`** | Proponer regiones que parezcan contener algo, sin pedir clase. Puede devolver pedazos de cable, tabla o texto; sobre un tile con pocos símbolos el ruido es manejable. |
| 21 | **SAM3 con concept prompt** | Pedirle todas las apariciones de un concepto dado por texto o por ejemplo, y convertir las máscaras en cajas. |
| 22 | **SAM / SAM2 automatic mask generation** | Sirve más para **ajustar** un recuadro que ya se tiene que para encontrarlo: segmenta cables, letras y celdas sin saber cuál es componente. Vale la prueba como refinador de cajas, no como buscador. |
| 23 | **CLIP / SigLIP sobre ventana deslizante** | El más barato y el más débil de esta familia. Sirve de piso: si algo no le gana a esto, no vale su latencia. |

### Clásicos de forma sobre line-art (USD 0, CPU, milisegundos)

`#13` cerró SIFT/ORB, pero el diagnóstico fue **falta de textura y de features**, que es precisamente lo que
estos métodos no necesitan: trabajan sobre la silueta y el contorno, que es todo lo que un símbolo CAD
tiene. Cerrar SIFT/ORB no cierra la familia entera.

| | Qué | Para qué |
| --- | --- | --- |
| 24 | **Chamfer matching / distance transform** | El método clásico para siluetas y line-art. Muy barato y tolerante al trazo incompleto o cortado por un conductor. |
| 25 | **Template matching multiescala y multirrotación** (`cv2.matchTemplate`) | Buscar cada símbolo de la tabla como plantilla sobre el tile binarizado. El más simple de implementar de esta familia. |
| 26 | **Generalized Hough Transform** | Diseñado para formas arbitrarias e invariante a rotación y escala, que es justo lo que varía entre inserciones. |
| 27 | **Hu moments / shape context sobre contornos** | Una firma de forma comparable contra la tabla, barata de calcular y de indexar. |
| 28 | **Contornos y componentes conexos** | Débil solo — los símbolos están conectados a los conductores, así que no forman componentes separados — pero sirve como generador de candidatos baratos que otro filtra. |

### Detectores propios

Estos contestan otra pregunta: son detectores **entrenados** y dependen del dataset. Si el dataset no tiene
SPM etiquetados, ninguna arquitectura entrenada sobre él los encuentra — cambiar de arquitectura cambia el
modelo, no las etiquetas. Como segunda pasada son un detector completo más (~2× latencia) mirando lo mismo
con los mismos sesgos.

| | Qué | Para qué |
| --- | --- | --- |
| 29 | **Ensemble selectivo de los pesos existentes** (`best_componente_v6_J.pt`, `best_componente_nano.pt`) sobre tiles residuales | Doble función: recupera lo que los pesos viejos sí veían, y dice si el modelo actual **regresionó** respecto de los anteriores. Si eso da que sí, cambia la prioridad de todo lo demás. |
| 30 | **YOLO nano de rescate**, una clase, entrenado con falsos negativos históricos + SPM + cajas del DXF + muchos negativos | El de mejor retorno a largo plazo y el de mayor esfuerzo: un detector cuya única misión es proponer regiones que el principal se perdió. |
| 31 | **YOLO26** | Candidato a reemplazar el detector principal. Mismo dataset, mismo split, mismo render, mirando recall por familia. |
| 32 | **RT-DETR** | Lo mismo que 31, y además para ver si sus falsos negativos son **complementarios** a los de YOLO, que es lo que decidiría si vale como segunda pasada. |
| 33 | **TTA y escalas adicionales** | Prioridad baja: el pipeline ya infiere a 1.0 y 1.6 (`component-detector/detection.py:78-82`) y Ultralytics estima 2–3× por TTA. Se mide para poder descartarlo con un número en vez de con una intuición. |

## Cómo se le presenta el tile al modelo

Esto no es un detalle de implementación: cambia la respuesta más que el modelo, así que cada alternativa de
las secciones por tile se prueba con al menos dos de estas presentaciones.

- Tile crudo, con las cajas existentes como lista de coordenadas en el prompt.
- Tile con las cajas dibujadas en color encima.
- Tile con las regiones ya detectadas **blanqueadas**, de modo que lo detectado literalmente no esté.
- Tile con las cajas atenuadas o semitransparentes.
- Con y sin el render de texto (`plano_render_viz.png` contra `plano_render.png`).
- Sólo escala 1.0, o también 1.6 — 30 tiles contra 134 en el peor tablero.

La consigna es siempre la misma: localizar y no clasificar, una caja por símbolo, JSON estricto, `[]` cuando
no falta nada, razonamiento mínimo.

## Riesgos

- **El peso por defecto no es el mismo en Docker que en local, y eso invalida una medición.** En
  `component-detector/detector_yolo/` hay tres `.pt`. El contenedor fija
  `DETECTOR_MODEL=best_componente_v3.pt` (`component-detector/Dockerfile:50`) pero `factory.py` cae por
  defecto en `best_componente_nano.pt` (`component-detector/factory.py:46-50`). Una corrida local mide
  **nano** y una en Docker mide **v3**. Hay que fijar el peso explícitamente y dejarlo escrito en cada
  directorio de salida.
- **El censo sin muestreo por familia rompe el presupuesto.** ~143 llamadas sobre 208 en el tablero medido
  (`component-detector/block_vote.py:224-226`).
- **Un molde de `twins` sacado de la cosa equivocada barre el plano.** Ya se midió: sembrando con todas las
  cajas, en COM se marcaron 30 lugares y los 30 eran la barra con sus marcas de conductor
  (`component-detector/twins.py:83-90`). Sembrar desde la tabla cambia la semilla pero no elimina el riesgo.
- **El censo de bloques y `twins` se pisan donde hay INSERT.** La regla ya existe (`_sits_on_a_block`,
  `component-detector/twins.py:112`) y hay que mantenerla, o se cuentan los mismos símbolos dos veces.
- **La presentación del tile puede dominar el resultado.** Un modelo que fracasa con las cajas dibujadas y
  acierta con las regiones blanqueadas no es un modelo malo: es una prueba mal armada.
- **Los modelos locales vienen de imágenes naturales.** El riesgo no es que no conozcan el concepto sino
  que no reconozcan su representación CAD. El prompt visual (14, 16, 17) evita ese salto; los de texto no.
- **`#802` sigue abierto y toca lo mismo por otro lado** (umbral de YOLO y fusión de cajas). Esto asume
  `MIN_CONFIDENCE = 0.50` como está hoy (`component-detector/detection.py:39-59`).
- **El techo puede matar el ticket, y ese es un resultado válido.**

## Criterios de aceptación

- [ ] Un `MissingBox` genera su recorte, pasa por el clasificador y termina en el BOM o en revisión según lo
      que conteste Claude — verificable en el `components.json` de una corrida.
- [ ] Existe el banco de tiles residuales y una única función de medición, y todas las alternativas
      probadas la usan.
- [ ] Está publicado el techo: cuántos símbolos reales quedan sin caja por tablero y por familia.
- [ ] Cada alternativa probada tiene su fila de resultados y su propio directorio de salida, con el peso del
      detector anotado.
- [ ] Las alternativas que no se llegaron a probar quedan listadas como **no medidas**, no como descartadas.
- [ ] Al menos un modelo por tile se probó con dos presentaciones distintas del tile.
- [ ] La recomendación final dice, con números: qué se adopta, cuánto recall agrega, cuántos centavos y
      cuántos segundos cuesta por plano.
- [ ] `pytest` en verde en `component-detector/tests/`.

## Fuera de alcance

- Bajar el umbral de YOLO o cambiar la fusión de cajas: es `#802`.
- Poner en producción cualquiera de las alternativas. Este ticket mide y recomienda; adoptar sale por
  ticket propio, con su PR y sus gates.
- El grafo vectorial / CADTransformer: alternativa estructural, no una primera prueba.


# #807 UI-COTIZACION — Selección Multi-Marca por Proveedor y Optimización por Costo — CLOSED
https://github.com/FacultadDeIngenieria/lab3-liard/issues/807

## Resumen y Contexto

En la Matriz de Cotizaciones (`quotation-workspace`) y el panel lateral de inteligencia (`ComponentIntelligenceDrawer`), cada celda y tarjeta representaba una única opción por proveedor. Cuando un distribuidor o proveedor ofrecía múltiples marcas o alternativas que cumplían con las especificaciones técnicas de un ítem del BOM (por ejemplo, *Schneider*, *Chint* y *Siemens* simultáneamente para un mismo interruptor), el usuario no podía ver ni elegir entre esas marcas.

Este ticket implementa:
1. **Exposición en Backend y DTOs:** Retorno de todas las alternativas de catálogo compatibles por línea de proveedor y soporte de `catalogItemId` seleccionado al emitir la orden de compra.
2. **Componentización SOLID en Frontend:**
   - Subcomponente accesible `BrandSelectionDropdown.tsx` para la celda de matriz, con altura fija de 54px y aislamiento de propagación de eventos.
   - Subcomponente segmentado `SupplierBrandSelector.tsx` en el Drawer de Inteligencia.
3. **Auto-Optimización por Costo ("Más Barato"):** Conmutación automática a la variante más económica entre todas las alternativas disponibles respetando estrictamente las especificaciones técnicas del BOM.

## PRs Asociadas (Stacked)
- **PR #804 (Backend Base):** https://github.com/FacultadDeIngenieria/lab3-liard/pull/804
- **PR #805 (Frontend UI & Tests):** https://github.com/FacultadDeIngenieria/lab3-liard/pull/805

## Estructura

```
back/src/modules/
  quotation/types/quotation.types.ts                                   [cambia] alternatives en QuoteLineOfferMatch
  quotation/dto/quote-offer-detail.dto.ts                              [cambia] QuoteLineAlternativeDto
  quotation/mapper/quotation.mapper.ts                                 [cambia] mapeo de alternativas compatibles
  quotation/service/quotation.service.ts                               [cambia] persistencia de alternativas en rawData
  purchase-order/input/confirm-quote-order.input.ts                    [cambia] campo catalogItemId opcional
  purchase-order/service/purchase-order-confirmation.helpers.ts        [cambia] resolución de variante de catálogo
front/src/
  types/quotation.types.ts                                             [cambia] QuoteLineAlternativeDto
  types/orders.ts                                                      [cambia] catalogItemId en confirmación
  components/quotation-workspace/
    table/BrandSelectionDropdown.tsx                                   [nuevo]  dropdown accesible de selección de marca en celda
    table/QuotationMatrixCell.tsx                                      [cambia] delegación a BrandSelectionDropdown y semántica ARIA
    shared/SupplierBrandSelector.tsx                                   [nuevo]  botonera de marcas en Drawer de Inteligencia
    shared/ComponentIntelligenceDrawer.tsx                             [cambia] integración con SupplierBrandSelector
  lib/quotationAllocation.ts                                           [cambia] función pura findCheapestAlternative y optimización
  hooks/quotation/useQuotationAllocation.ts                            [cambia] selectedVariants y autoOptimize con alternativas
front/tests/quotation/multibrand-optimization.test.ts                  [nuevo]  7 tests unitarios de optimización
front/cypress/e2e/quotation-multibrand.cy.ts                           [nuevo]  3 tests E2E Cypress de interacción y optimización
```

## Escenario principal

### Conmutación de marca en celda de la matriz sin perder adjudicación

```gherkin
Dado que un proveedor ofrece 2 o más marcas compatibles para un ítem del BOM
Y la celda muestra la marca inicial con el badge de opciones disponibles "[ Marca ▾ N ]"
Cuando el usuario hace clic sobre el selector de marca en la cabecera de la celda
Entonces se despliega un menú flotante con el listado de marcas y sus respectivos precios unitarios
Y la opción activa se encuentra tildada
Cuando el usuario selecciona una marca alternativa
Entonces la celda actualiza en tiempo real su marca visible, precio unitario y precio total
Y el evento no propaga el clic a la tarjeta, conservando el estado de adjudicación
Y los totales del pie de tabla y la cabecera HUD se recalculan de inmediato
```

## Escenarios

### Selección de variante de marca desde el Drawer de Inteligencia

```gherkin
Dado que el usuario abre el Drawer de Inteligencia de un componente
Y una tarjeta de proveedor cuenta con alternativas multimarca
Cuando el usuario hace clic sobre un pill de marca alternativa
Entonces la variante seleccionada se resalta con estilo primario
Y si el proveedor no estaba adjudicado, se adjudica automáticamente con esa variante
Y la celda correspondiente en la matriz de cotizaciones se sincroniza de inmediato
```

### Auto-optimización al presionar "Más Barato"

```gherkin
Dado que un proveedor tiene seleccionada una marca de mayor valor (ej. Siemens a .200)
Y existe otra alternativa con stock del mismo proveedor u otro a menor costo (ej. Chint a .800)
Cuando el usuario pulsa el botón "Más Barato" en la barra de acciones
Entonces el optimizador evalúa todas las alternativas que cumplen la especificación técnica
Y conmuta automáticamente la variante activa de la celda a la opción más económica
Y adjudica la celda a la mejor oferta global actualizando el total de la orden
```

## Criterios de aceptación

- Si un proveedor ofrece más de una marca para una línea, la celda de la matriz presenta el disparador accesible con la marca activa y el contador de alternativas disponibles.
- El dropdown de marcas muestra el nombre del fabricante, la denominación de catálogo y el precio unitario formateado en moneda local.
- La selección de una variante en la celda o en el drawer no rompe el alto de fila ni deforma la tabla (altura fija de 54px).
- La semántica de accesibilidad no anida botones interactivos dentro de otros botones.
- El botón "Más Barato" inspecciona `priceInfo.alternatives` y conmuta la variante activa al menor costo disponible sin violar las especificaciones técnicas del ítem.
- La confirmación de compra transmite el `catalogItemId` seleccionado por línea al backend, quedando guardada la variante exacta en la orden de compra.
- `npm run lint` y `npm run build` tanto en `front/` como en `back/` finalizan con 0 errores.
- La suite de tests unitarios de frontend (`multibrand-optimization.test.ts`) pasa al 100% (7 tests).
- La suite de tests E2E de Cypress (`quotation-multibrand.cy.ts`) pasa al 100% (3 tests).
- Todas las suites de tests de backend relacionadas con cotización y órdenes de compra pasan al 100%.


---

## Ampliación — Submarca (gama comercial)

Una marca tiene gamas comerciales —Schneider vende Acti9 y Easy9— que no son el mismo producto aunque compartan fabricante. El selector multimarca de este ticket resuelve el nivel de la marca; falta el de abajo.

El campo ya existe: `ProviderCatalogItem.productLine` (`back/prisma/schema.prisma:576`), cuyo comentario ya lo define como la gama comercial. Se importa, se edita y se muestra en la tabla del proveedor, pero el módulo `quotation/` **no lo lee nunca**: cero referencias bajo `back/src/modules/quotation/`. No se agrega ninguna columna al schema del catálogo.

**Vocabulario**, porque los nombres se prestan a cruzarse:

| Concepto | Campo | Ejemplo |
| --- | --- | --- |
| Marca / fabricante | `manufacturer` | `Schneider Electric` |
| Submarca / gama comercial | `productLine` | `Acti9` |
| Código específico del producto | `manufacturerPartNo` | `A9N116` |

**La regla de negocio:** marca sola matchea los artículos de esa marca de **cualquier** gama; marca + gama matchea **solo** esa gama.

La partición de la columna `submarca / código` del Excel del proveedor no va acá: es un ticket propio de ingesta, para no mezclar carga de catálogo con cotización.

### Backend

- `productLine` entra en `ProviderCatalogMatchItemInput` y en `toMatchCatalogItemInput` (`quotation.service.ts:1080`), para que el matcher lo vea.
- `CatalogSubBrandGrouper` nuevo en `quotation/market/catalog/`, calcado de `catalog-brand.grouper.ts`: `labelOf`, `idOf`, `canonicalLabels`. **El id se scopea a la marca** (`slug(marca) + ':' + slug(gama)`), o dos fabricantes con una gama homónima ("Plus", "Compact") colapsan en un solo grupo.
- `LineRestriction` (`quotation.service.ts:114-122`) gana `subBrand: string | null`, con la invariante de que si `brand` es `null` la gama también: el fallback legacy por nombre de cuenta (`:1022-1028`) devuelve `brand: null` porque no sabe qué marca lleva la cuenta, y filtrar ahí por gama dejaría la línea con cero candidatos.
- `allows` (`:1034`) e `itemsFor` (`:725`) filtran por gama solo si viene. **`itemsFor` tiene que seguir devolviendo un único array por clave compuesta**: memoiza por identidad para que pegue el `WeakMap` de `ProviderCandidateFinder`, y un segundo `.filter()` lo anula sin error visible, sólo con una cotización mucho más lenta.
- Una gama que ningún catálogo tiene **degrada a marca sola**, no a línea abierta — devolver `null` ahí abriría la línea a cualquier marca mientras `selectedBrand` sigue diciendo Schneider.
- Las alternativas (`quotation.service.ts:466-522`) se agrupan por `(marca, gama)` y dentro de cada grupo gana **la más barata**, no la de mayor score.
- `subBrand String?` en `ElectricalComponent` y `ProjectBomItem`, con migración a mano del índice único de expresión de `ProjectBomItem` (hoy `(projectId, material, specification, COALESCE(brand,'__GENERIC__'))`, en `20260901211500_project_bom_item_unique`). Es un relax del índice, no puede fallar por duplicados preexistentes. `mergeIntoPool` suma la gama a la clave de consolidación.
- La orden falla explícito ante un `catalogItemId` que no reconoce, en vez de descartarlo en silencio, y `PurchaseOrderLine` persiste de qué ítem, marca y gama fue cada línea.

### Frontend

- Selector de gama por fila en el editor de BOM, al lado de `BrandSelect` (`shared/FieldSelects.tsx:123`), deshabilitado mientras no haya una marca concreta elegida.
- **Las columnas de la matriz pasan a ser `Proveedor / Marca / Submarca`.** Un artículo sin gama cargada —el proveedor subió solo el código— se muestra como `Proveedor / Marca`, sin tercer nivel.
- Las columnas se **derivan en el front**, no se persisten: `QuoteProviderOffer` tiene `@@unique([quoteId, providerId])` y persistir una oferta por combinación obligaría a rehacer el modelo de ofertas. Las `alternatives` ya traen `manufacturer` y traerán `productLine`.
- `buildOrderDraft` no cambia de contrato: varias columnas comparten `providerId` y el `catalogItemId` desambigua.

### Riesgos

- **Partición.** Un artículo tiene que caer en una sola columna. Si `Proveedor / Marca` incluyera también los que tienen gama, `useQuotationAllocation` sumaría el mismo ítem dos veces al total del proveedor y la optimización por costo elegiría mal.
- **Explosión de columnas.** `QUOTATION_MAX_PROVIDER_OFFERS` está hoy vacía (sin tope) y topea proveedores, no combinaciones. Con el catálogo actual ya hay 21 combinaciones proveedor × marca contra unas 5 columnas de hoy.
- **`maxCandidates`.** Con marca × gama, diez candidatos por score pueden ser todos de la misma gama y la gama barata del mismo proveedor nunca llega a ser alternativa.
- **Deuda de datos.** Los 156 ítems de `prov@gmail.com` tienen `productLine` cargado con categorías (`Cable unipolar`, `Cable envainado`), no con gamas: en cuanto la cotización lea el campo aparecen como submarcas en el editor y como columnas en la matriz.

### Criterios de aceptación adicionales

- [ ] Una línea que pide solo marca cotiza esa marca en todas sus gamas.
- [ ] Una línea que pide marca + gama cotiza solo esa gama.
- [ ] Un proveedor con la marca pero sin la gama queda afuera, con razón propia.
- [ ] Una gama que nadie tiene degrada a marca sola, no a línea abierta.
- [ ] Un artículo sin gama aparece como columna `Proveedor / Marca`.
- [ ] Ningún artículo aparece en dos columnas ni se cuenta dos veces en el total.
- [ ] Dos artículos de la misma marca y gama dan una alternativa, y es la más barata.
- [ ] La memoización de `itemsFor` sigue pegando entre dos líneas con la misma marca y gama.
- [ ] `api-endpoints.md` actualizado.
- [ ] `npm run lint:check`, `npm run typecheck`, `npm test` y `npm run test:int` en verde.
- [ ] `npm run lint`, `npm run build`, `npm test`, `npm run verify:crop` y `npm run e2e` en verde.

### Decisiones pendientes

- [ ] Política de tope de columnas de la matriz.
- [ ] Qué hacer con los 156 ítems cuyo `productLine` son categorías y no gamas.


# #788 Video Demo editada – flujo completo de Proveedor — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/788

# Demo editada – flujo completo de Proveedor

## Objetivo

Crear y editar un video de demo que muestre de punta a punta la experiencia de un **Proveedor**, desde su registro/acceso a la plataforma hasta la gestión del catálogo y atención de solicitudes realizadas por usuarios.

El video debe funcionar tanto como demostración funcional como **pieza comercial**, mostrando claramente el valor que obtiene un proveedor al formar parte de la plataforma.

## Definición de marca y presentación del producto

Antes de realizar la edición final del video se debe:

- [ ] Definir el **nombre definitivo de la herramienta/producto** que se utilizará comercialmente.
- [ ] Definir cómo se presenta brevemente el producto: nombre + propuesta de valor.
- [ ] Utilizar el nombre definitivo de forma consistente en toda la demo.
- [ ] Definir logo, tipografía, colores y recursos visuales básicos.
- [ ] Preparar una introducción breve que explique qué conecta la plataforma y cuál es el beneficio para proveedores.

La demo debe transmitir la sensación de estar presentando una **plataforma comercial completa**, y no únicamente una grabación de funcionalidades.

## Flujo a mostrar

- [ ] Mostrar el registro de un nuevo proveedor.
- [ ] Iniciar sesión con una cuenta de proveedor.
- [ ] Mostrar brevemente el dashboard/vista principal del proveedor.
- [ ] Entrar a la sección de **Catálogo**.
- [ ] Cargar el catálogo de productos del proveedor.
- [ ] Mostrar el proceso de carga/importación.
- [ ] Mostrar el catálogo una vez procesado.
- [ ] Navegar/buscar productos dentro del catálogo.
- [ ] Editar al menos un producto cargado:
  - descripción
  - precio
  - código
  - disponibilidad
  - u otro dato relevante
- [ ] Guardar los cambios y mostrar el catálogo actualizado.
- [ ] Entrar a la sección de **Pedidos / Solicitudes de usuarios**.
- [ ] Mostrar una solicitud recibida.
- [ ] Abrir el detalle del pedido y revisar los materiales solicitados.
- [ ] Mostrar el estado inicial de la solicitud.
- [ ] Confirmar/aceptar el pedido o solicitud.
- [ ] Mostrar el cambio de estado luego de la confirmación.
- [ ] Mostrar cómo se habilita/genera el **contacto entre proveedor y usuario** para continuar la operación.

## Storytelling y contexto

El video debe explicar por qué la plataforma representa una oportunidad para el proveedor.

- [ ] Introducir brevemente el problema: los proveedores dependen de procesos manuales, consultas dispersas y pedidos que llegan por distintos canales.
- [ ] Mostrar que la plataforma centraliza catálogo, solicitudes y gestión de oportunidades comerciales.
- [ ] Contextualizar cómo el pedido que recibe el proveedor fue generado a partir del flujo del usuario.
- [ ] Mostrar claramente la conexión entre la necesidad detectada en un plano y la oportunidad comercial que recibe el proveedor.
- [ ] Destacar que el proveedor puede gestionar catálogo y pedidos desde un único lugar.

## Puntos que deben quedar claros

1. El proveedor puede registrarse e ingresar a la plataforma.
2. El proveedor administra su propio catálogo de materiales.
3. El catálogo puede cargarse y luego mantenerse/editase desde la plataforma.
4. Las solicitudes de los usuarios llegan directamente al proveedor.
5. El proveedor puede revisar y confirmar los pedidos.
6. Una vez confirmada la operación, la plataforma facilita el contacto entre ambas partes.
7. La herramienta transforma necesidades técnicas detectadas en proyectos reales en oportunidades comerciales para proveedores.

## Edición, animaciones y presentación comercial

La edición debe tener calidad suficiente para utilizar el video frente a proveedores, socios, clientes o potenciales inversores.

- [ ] Eliminar tiempos muertos de registro, carga de catálogo y procesamiento.
- [ ] Utilizar cortes y transiciones limpias.
- [ ] Utilizar **zoom, paneos y focus animations** para destacar las áreas relevantes de la interfaz.
- [ ] Agregar títulos animados para contextualizar cada etapa.
- [ ] Incorporar overlays/callouts explicando el beneficio de las funcionalidades más importantes.
- [ ] Utilizar animaciones que ayuden a explicar la conexión **Usuario → Solicitud → Proveedor**.
- [ ] Mostrar claramente las acciones realizadas sobre el catálogo.
- [ ] Mantener visible el pedido que conecta esta demo con el flujo de Usuario.
- [ ] Utilizar títulos/callouts como:
  - Registro
  - Catálogo
  - Gestión de productos
  - Nueva solicitud
  - Pedido
  - Confirmación
  - Contacto
- [ ] Destacar beneficios mediante textos cortos como:
  - `Catálogo centralizado`
  - `Nuevas oportunidades`
  - `Pedidos directos`
  - `Gestión simplificada`
  - `Contacto con clientes`
- [ ] Mantener una estética consistente con la identidad visual definida para el producto.
- [ ] Mantener una historia coherente entre catálogo, pedido recibido y confirmación.
- [ ] No mostrar credenciales, información sensible ni elementos de debugging.

## Criterio de aceptación

El ticket se considera terminado cuando exista un **video editado, animado y comercialmente presentable del flujo completo de Proveedor**, entendible para alguien que no conoce el producto.

El video debe cubrir:

**Problema → Presentación del producto → Registro/Login → Carga de catálogo → Visualización → Edición → Solicitud de usuario → Revisión → Confirmación → Generación de contacto → Beneficio final.**

El resultado debe poder utilizarse como **demo comercial para presentar la plataforma a proveedores**, y no únicamente como documentación interna de funcionalidades.

# #787 Video Demo – flujo completo de Usuario — OPEN
https://github.com/FacultadDeIngenieria/lab3-liard/issues/787

# Demo editada – flujo completo de Usuario

## Objetivo

Crear y editar un video de demo que muestre de punta a punta el flujo principal de un **Usuario/Cliente**, desde el acceso a la plataforma hasta el seguimiento de una solicitud/pedido enviada a proveedores.

El video debe funcionar no solo como demostración funcional, sino también como **pieza comercial del producto**, dejando claro qué problema resuelve, cuál es su propuesta de valor y cómo simplifica el proceso completo desde un plano eléctrico hasta una solicitud de compra.

## Definición de marca y presentación del producto

Antes de realizar la edición final del video se debe:

- [ ] Definir el **nombre definitivo de la herramienta/producto** que se utilizará comercialmente.
- [ ] Definir cómo se presenta brevemente el producto: nombre + propuesta de valor.
- [ ] Utilizar el nombre definitivo de forma consistente en toda la demo.
- [ ] Definir logo, tipografía, colores y recursos visuales básicos que aparecerán en el video.
- [ ] Preparar una introducción breve que permita entender qué hace la herramienta antes de comenzar el flujo.

La demo debe evitar sentirse únicamente como una grabación de pantalla. Tiene que comunicar claramente que se está presentando un **producto terminado y comercializable**.

## Flujo a mostrar

- [ ] Iniciar sesión con un usuario existente.
- [ ] Mostrar brevemente la vista principal/listado de proyectos.
- [ ] Crear un proyecto nuevo.
- [ ] Cargar uno o más planos dentro del proyecto.
- [ ] Iniciar el procesamiento/análisis de los planos.
- [ ] Mostrar el procesamiento hasta llegar al resultado.
- [ ] Mostrar el listado de planos/proyectos procesados.
- [ ] Entrar a **símbolos no identificados**.
- [ ] Resolver al menos un símbolo no identificado.
- [ ] Mostrar el **BOM generado**.
- [ ] Editar el BOM, modificando al menos un componente, cantidad o dato.
- [ ] Iniciar el flujo de **cotización**.
- [ ] Mostrar las cotizaciones/proveedores disponibles.
- [ ] Seleccionar una opción.
- [ ] Enviar la **solicitud de cotización/pedido**.
- [ ] Entrar al listado de pedidos/solicitudes.
- [ ] Mostrar el pedido recién generado.
- [ ] Mostrar los distintos **estados del pedido** y cómo el usuario puede hacer seguimiento.

## Storytelling y contexto

El video debe ayudar a entender el problema incluso a alguien que nunca utilizó la plataforma.

- [ ] Introducir brevemente el problema actual: analizar planos, armar BOMs y pedir cotizaciones de forma manual consume tiempo y requiere múltiples pasos/herramientas.
- [ ] Contextualizar cada etapa importante antes o mientras ocurre.
- [ ] Mostrar claramente el paso de **plano → análisis → BOM → cotización → pedido**.
- [ ] Destacar visualmente las automatizaciones y ahorros de trabajo manual.
- [ ] Evitar mostrar funcionalidades sin explicar por qué aportan valor.

## Puntos que deben quedar claros

1. La herramienta recibe planos y automatiza la generación del listado de materiales.
2. El usuario puede intervenir sobre el resultado resolviendo símbolos no identificados.
3. El BOM generado puede editarse manualmente.
4. El BOM se conecta directamente con el flujo de cotización.
5. Desde la misma plataforma se puede enviar una solicitud a proveedores.
6. El usuario puede seguir posteriormente el estado de sus pedidos.
7. El producto centraliza en un único flujo tareas que normalmente requieren múltiples herramientas y procesos manuales.

## Edición, animaciones y presentación comercial

La edición debe tener calidad suficiente para utilizar el video en una presentación comercial, demo a potenciales clientes o material institucional.

- [ ] Eliminar esperas largas de procesamiento mediante cortes.
- [ ] Eliminar errores, recargas y navegación que no aporte a la historia.
- [ ] Mantener visibles las acciones importantes del cursor.
- [ ] Utilizar **zoom, paneos y focus animations** para dirigir la atención hacia las acciones relevantes.
- [ ] Agregar transiciones limpias entre etapas.
- [ ] Incorporar títulos y animaciones breves para contextualizar cada parte del flujo.
- [ ] Utilizar overlays/callouts para destacar funcionalidades importantes.
- [ ] Agregar animaciones que expliquen visualmente conceptos cuando la interfaz por sí sola no sea suficiente.
- [ ] Utilizar títulos/callouts como:
  - Proyecto
  - Procesamiento automático
  - Detección de símbolos
  - Resolución de símbolos no identificados
  - Generación de BOM
  - Cotización
  - Pedido
  - Seguimiento
- [ ] Destacar beneficios concretos mediante textos cortos como:
  - `Automatización del análisis`
  - `Menos trabajo manual`
  - `BOM editable`
  - `Cotización centralizada`
  - `Seguimiento de pedidos`
- [ ] Mantener una estética coherente con la identidad visual definida para el producto.
- [ ] Mantener datos coherentes durante toda la demo para que proyecto, BOM, cotización y pedido formen una misma historia.
- [ ] No mostrar credenciales, tokens, debugging ni información sensible.

## Criterio de aceptación

El ticket se considera terminado cuando exista un **video editado, animado y comercialmente presentable del flujo completo de Usuario**, entendible para alguien que no conoce el producto.

El video debe cubrir:

**Problema → Presentación del producto → Login → Proyecto → Carga y procesamiento de planos → Símbolos no identificados → BOM → Edición → Cotización → Solicitud → Seguimiento del pedido → Beneficio final.**

El resultado debe poder utilizarse como **demo comercial del producto**, no únicamente como documentación interna de funcionalidades.

# #764 Feature - El editor del BOM elige marcas, no proveedores — CLOSED
https://github.com/FacultadDeIngenieria/lab3-liard/issues/764

## Contexto

El desplegable del editor del BOM dice "Proveedor" y ofrece **cuentas de proveedor**, no marcas. La columna donde eso se guarda, en cambio, se llama `brand` (`ElectricalComponent.brand`, `ProjectBomItem.brand`), y lo que se persiste es el **nombre del proveedor como texto suelto**: `brandId` se pierde al guardar (`saveBomEditor.ts:36-40`).

Tres hechos que este ticket corrige:

1. **La marca no filtra nada al cotizar.** `component.brand` aparece en un solo lugar de `quotation.service.ts` (linea 114): estampar `selectedProviderId`. La cotizacion le pide precio a todos los proveedores igual, elijas lo que elijas. La marca es una nota al pie.
2. **`selectedProviderId` se resuelve comparando strings** contra el `companyName` de cada cuenta, con una tabla de alias legacy (`quotation.service.ts:41-45, 693-711`). Si el string no matchea ningun nombre de cuenta, devuelve `null` en silencio, que significa "sin preferencia".
3. **El dataset esconde los dos problemas.** En el seed los proveedores se llaman `Schneider Electric`, `ABB` y `Chint`, y sus items tienen ese mismo texto en `manufacturer` (`seed-catalog.ts:25-51, 1714-1717`): marca y proveedor son la misma palabra, asi que la comparacion por nombre acierta de casualidad. El bug solo aparece cuando un proveedor real importa un catalogo multimarca.

Ademas, tres comentarios del backend afirman que `manufacturer` *"no lo escribe ningun importador"* (`bom-catalog.dto.ts:10`, `bom-catalog.controller.ts:25`, `catalog-provider.aggregator.ts:8`). **Es falso**: lo escribe el seed en las 261 filas, lo escribe el importador (`catalog-attribute.ts:137` -> `catalog-row-evaluator.ts:321` -> `catalog-item-data.ts:11`) y lo edita el proveedor a mano en un campo etiquetado "Marca" (`SupplierCatalogItemModal.tsx:244`).

## Alcance tecnico

### Backend

- **Seed mixto**: un proveedor queda como distribuidor oficial de una sola marca (marca = proveedor, el caso donde el matching viejo acierta) y dos pasan a multimarca via `defaultBrand: 'Distribucion Multimarca'`, que activa el `template.baseManufacturer` que hoy es codigo muerto. El dataset pasa a tener marcas distintas de proveedores, que es lo que hace visible el bug.
- **Marcas por componente en market-data**: agrupar los mismos items ya cargados en memoria por `manufacturer` normalizado, ademas de por `providerId`. No requiere query nueva ni migracion: `quotation.repository.ts:67` ya hace un `findMany` sin `select`. Ids sinteticos con `CatalogIdFactory.slug`, cuyo docblock ya dice "Shared by materials, specs and brands".
- **Marcas en `GET /bom-catalog`**: `brands[]` analogo a `providers[]`.
- **Items sin `manufacturer`**: caen en un bucket "Sin marca". El preview de importacion pasa a avisar cuando la columna queda sin mapear (hoy `catalog-mapping-validator.ts:66` solo chequea `REQUIRED`, y `manufacturer` es `OPTIONAL`).
- **La marca filtra la cotizacion**: elegir una marca restringe los candidatos a los items de catalogo con esa marca, en vez de estampar un id por comparacion de nombres. Se borra `LEGACY_PROVIDER_NAME_ALIASES`.
- **`BomQuoteLine.selectedBrand String?`** (migracion): una marca son N proveedores, asi que no hay un `selectedProviderId` que guardar. `selectedProviderId` queda para cuando el ingeniero elige el proveedor concreto al armar la orden.
- Corregir los tres comentarios desactualizados sobre `manufacturer`.
- `api-endpoints.md` actualizado. Unit specs e integration specs.

### Frontend

- `BrandSelect` y `QuickBrandDropdown` se alimentan de la lista de marcas por componente en vez de la de proveedores. `brandCoveragesForLines` ya es generica sobre `{id, name, score, itemsCount}` y no necesita cambios.
- La copy vuelve a decir "Marca" / "Cualquier marca" (revierte `92ac81d0` y `377886ca`).
- `ComboSelect` no se toca: ya soporta `group`, `meta`, `emphasis` y `disabled` con salto de teclado.

### Datos existentes

Los `brand` ya guardados contienen nombres de proveedor y **no se migran**: quedan como marca de texto libre fuera de catalogo y se corrigen al editarse. Adivinar la marca de un distribuidor multimarca seria inventar, y limpiarlos a `null` pisaria una decision real del usuario. Ojo con el indice unico de `ProjectBomItem`, que incluye `COALESCE(brand, '__GENERIC__')` (migracion `20260901211500`): no colisiona porque las filas viejas no se tocan, pero cambia que filas colapsan de ahi en adelante.

## Escenarios (Gherkin)

```gherkin
Caracteristica: El editor del BOM elige marcas
  Como ingeniero de proyectos
  Quiero elegir la marca del componente y no la cuenta que me lo vende
  Para que la cotizacion le pida precio a todos los que venden esa marca.

  Escenario: El desplegable ofrece marcas
    Dado un componente que tres proveedores cotizan con dos marcas distintas
    Cuando el usuario abre el selector de ese componente
    Entonces ve las dos marcas y no las tres cuentas de proveedor.

  Escenario: La marca restringe la cotizacion
    Dado que una linea del BOM tiene la marca "Schneider Electric"
    Y que esa marca la venden dos distribuidores distintos
    Cuando se cotiza el proyecto
    Entonces esa linea recibe ofertas de los dos distribuidores
    Y no recibe ofertas de items de otras marcas.

  Escenario: Items de catalogo sin marca
    Dado un proveedor que importo su catalogo sin mapear la columna de marca
    Cuando el usuario abre el selector de un componente que ese proveedor cotiza
    Entonces esos items aparecen agrupados bajo "Sin marca"
    Y ninguno desaparece del editor.

  Escenario: Aviso al importar sin marca
    Dado un proveedor en el paso de mapeo de columnas de la importacion
    Cuando deja la columna de marca sin mapear
    Entonces el preview le avisa que va a subir articulos sin marca
    Y la importacion sigue siendo posible.
```

## Criterios de aceptacion

### Backend
- [ ] El seed tiene al menos un proveedor multimarca; marca y nombre de proveedor dejan de coincidir para todo el dataset.
- [ ] Market-data devuelve, por componente, las marcas que lo cotizan, con su score y su cantidad de items.
- [ ] `GET /bom-catalog` devuelve las marcas con catalogo activo.
- [ ] Los items sin `manufacturer` caen en "Sin marca" y ninguno se pierde.
- [ ] El preview de importacion avisa cuando la columna de marca queda sin mapear.
- [ ] La cotizacion restringe candidatos por la marca de la linea; `LEGACY_PROVIDER_NAME_ALIASES` ya no existe.
- [ ] `BomQuoteLine.selectedBrand` persiste la marca pedida al cotizar.
- [ ] Los tres comentarios que afirman que nadie escribe `manufacturer` estan corregidos.
- [ ] `api-endpoints.md` actualizado.
- [ ] `npm run lint:check`, `npm run typecheck`, `npm test` y `npm run test:int` en verde.

### Frontend
- [ ] El selector del editor ofrece marcas, acotadas al match de cada componente.
- [ ] La asignacion masiva opera sobre marcas.
- [ ] La copy dice "Marca" en toda la pantalla.
- [ ] `npm run lint` y `npm run build` en verde.

# #760 Épica UI/UX — marca, navegación, cuenta y pulido de pantallas — CLOSED
https://github.com/FacultadDeIngenieria/lab3-liard/issues/760

# Épica UI/UX — marca, navegación, cuenta y pulido de pantallas

> **ESTADO: implementado.** Los 16 tickets están en ramas `ux-NN/…` cortadas en
> cadena desde `dev`, pusheadas y sin mergear. Lo que cambió respecto de lo
> escrito acá está anotado al final, en «Correcciones al relevamiento».
>
> Relevado sobre `dev` `a491505` (2026-09-15). Todas las rutas son relativas a `front/`
> salvo que se indique lo contrario. Los tickets son independientes entre sí salvo donde
> se declara una dependencia explícita.

Orden sugerido de ejecución (cada bloque desbloquea al siguiente):

| # | Ticket | Bloque | Tamaño |
| --- | --- | --- | --- |
| UX-01 | Identidad de marca: logo, wordmark y favicon | Fundaciones | ~200 |
| UX-02 | Escala tipográfica y tokens de texto | Fundaciones | ~250 |
| UX-03 | Componentes shadcn faltantes | Fundaciones | ~150 |
| UX-04 | Sidebar colapsable y responsive | Navegación | ~300 |
| UX-05 | Menú de usuario en el sidebar | Navegación | ~250 |
| UX-06 | Página de cuenta (ABM de perfil) | Cuenta | ~600 |
| UX-07 | Cambio de contraseña y de email (con re-verificación) | Cuenta | ~700 (back + front) |
| UX-08 | Baja de cuenta desde la UI | Cuenta | ~200 |
| UX-09 | Volver a la landing desde login/registro | Auth | ~120 |
| UX-10 | Rework de la landing | Público | ~700 |
| UX-11 | Mensajes y copy de la landing | Público | ~200 |
| UX-12 | Refactor del listado de pedidos | Pantallas | ~500 |
| UX-13 | Encabezados de página consistentes | Pantallas | ~350 |
| UX-14 | Auditoría de botones, cards e iconos | Pantallas | ~400 |
| UX-15 | Revisión del onboarding | Flujo | ~450 |
| UX-16 | Panel de proveedor: tablas y pantallas | Pantallas | ~550 |

---

## UX-01 — Identidad de marca: logo, wordmark y favicon

### Estado actual

La marca está escrita a mano en cuatro lugares distintos y no coinciden entre sí:

- `src/components/auth/shared/AuthBrand.tsx` dibuja `public/liard-mark.svg` con `mask-image`
  y compone el wordmark como texto en Inter, **en mayúsculas** (`LIARD`, `font-extrabold`,
  `tracking-[-0.025em]`).
- `src/components/layouts/AppSidebar.tsx` y `SupplierSidebar.tsx` repiten `LIARD` como
  `<span className="text-lg font-bold tracking-tight text-primary">` más el descriptor
  `BOM Management` en mono.
- `src/components/auth/PublicNavbar.tsx` escribe `Liard AI Tool` como texto plano.
- `src/components/landing/landing-content.ts` usa `Liard AI Tool` en el hero y en el footer.

El logo de referencia que pasó el usuario es **`liard` en minúsculas**, geométrico y redondeado,
con la marca (dos volúmenes tipo edificio) a la izquierda. Ninguna de las cuatro versiones
actuales lo respeta. Además `index.html` sigue con `<title>front</title>` y el favicon es el
`favicon.svg` genérico.

### Qué hacer

1. Crear `src/components/shared/BrandLogo.tsx`, un único componente con props
   `variant: "full" | "mark"`, `tone: "primary" | "inverse" | "foreground"` y `size`.
   Debe reemplazar a `AuthBrand`, al bloque del header de las dos sidebars y al link del
   `PublicNavbar`. `AuthBrand` queda como un wrapper delgado (marca + descriptor) o desaparece.
2. **Decidido:** el wordmark va como SVG vectorizado en `public/liard-wordmark.svg`, en
   minúsculas (`liard`), pintado con `mask-image` igual que la marca, para que sea idéntico
   al logo de referencia y tome el color de `currentColor`. No se compone con una fuente.
   Producir el vector a partir de la imagen del logo antes de empezar el ticket.
3. **Decidido:** el producto se llama **`liard`**, en minúsculas y sin sufijo. Desaparecen
   "LIARD", "Liard AI Tool" y "BOM Management" como nombre. Donde haga falta aclarar qué es,
   va un descriptor aparte ("Gestión de materiales eléctricos"), nunca pegado al nombre.
4. `index.html`: `<title>` real y `<meta name="description">`. Favicon derivado de la marca
   (`public/favicon.svg` + un PNG 180×180 para iOS).
5. Borrar los usos sueltos: ningún archivo nuevo puede escribir la marca como texto.

### Criterios de aceptación

- Un `grep -rni "liard" src` solo devuelve `BrandLogo.tsx` y los archivos de copy.
- La marca se ve igual en la landing, en el login, en las dos sidebars y en el estado colapsado.
- La pestaña del navegador ya no dice "front".

**Tamaño estimado: ~200 líneas.**

---

## UX-02 — Escala tipográfica y tokens de texto

### Estado actual

`src/styles/index.css` define `font: 18px/145% var(--sans)` en `:root`, con `--sans` en
`system-ui` y `--heading` en Inter Variable. Eso hace que **el cuerpo de la app no use Inter**:
Inter solo entra donde alguien escribió `font-heading`. Encima hay tamaños crudos en píxeles
desperdigados, sobre todo en pedidos:

- `src/components/order/OrdersListTable.tsx`: `text-[26px] leading-8`, `text-[18px] leading-6`,
  `text-[16px]`, filas de `h-[100px]`, tabla `min-w-[1180px]`.
- `src/components/order/empty-states/OrdersEmptyState.tsx`: `lg:text-[32px]`.
- `AuthBrand.tsx`: `text-[36px]`.

Con el root en 18px, un `text-sm` (14px) al lado de un `text-[18px]` da la mezcla de alturas de
línea que el usuario describe como "word height" mal.

### Qué hacer

1. Fijar la familia del cuerpo en Inter (`--sans: 'Inter Variable', …`) y bajar el root a 16px,
   que es la base que asumen las utilidades de Tailwind y todos los componentes shadcn.
2. Definir una escala corta y nombrarla en `@theme` de Tailwind v4:
   `display` (36/40), `h1` (30/36), `h2` (24/32), `h3` (18/28), `body` (14/20), `small` (12/16),
   con `--tracking-tight` para los títulos. Documentarla en el propio `index.css`.
3. Reemplazar **todos** los `text-[NNpx]` / `leading-N` crudos por las clases de la escala.
   Empezar por `src/components/order/` y `src/components/auth/`, que son los peores.
4. Revisar altura de línea en títulos multi-línea: `leading-snug` en `h1`/`h2`, nunca `leading-8`
   fijo sobre un tamaño responsive.

### Criterios de aceptación

- `grep -rn "text-\[" src/components` no devuelve nada fuera de `src/components/ui/`.
- El cuerpo de la app renderiza en Inter (verificable en DevTools, `computed font-family`).
- Ninguna pantalla cambia de layout por el cambio de root (revisar proyectos, pedidos,
  cotización y el panel de proveedor a 1280 y a 1440).

**Dependencia:** conviene hacerlo antes que UX-10 y UX-12.
**Tamaño estimado: ~250 líneas.**

---

## UX-03 — Componentes shadcn faltantes

### Estado actual

`src/components/ui/` tiene 19 componentes. Faltan los que estos tickets necesitan y que hoy se
resuelven a mano: no hay `avatar` (las iniciales se dibujan con un `div` redondo en las dos
sidebars), no hay `tabs`, `breadcrumb`, `form`, `avatar`, `switch`, `scroll-area` ni
`alert-dialog` (los confirmar se hacen con `ConfirmModal.tsx` propio).

### Qué hacer

- Agregar vía CLI de shadcn: `avatar`, `tabs`, `breadcrumb`, `switch`, `alert-dialog`,
  `scroll-area`, `form`. No editarlos a mano después (el directorio está eslint-ignored).
- Migrar los dos bloques de iniciales de `AppSidebar` / `SupplierSidebar` a `Avatar` +
  `AvatarFallback`, conservando `getSessionInitials`.
- Dejar `ConfirmModal.tsx` sobre `alert-dialog` en vez de `dialog`, que es lo semánticamente
  correcto para una confirmación destructiva.

### Criterios de aceptación

- `npm run lint && npm run build` en verde.
- Las iniciales del usuario se ven igual que antes, pero salen de `Avatar`.

**Tamaño estimado: ~150 líneas (casi todo generado).**

---

## UX-04 — Sidebar colapsable y responsive

### Estado actual

**El sidebar no se puede colapsar: no existe ningún `SidebarTrigger` en la app.**
`grep -rn "SidebarTrigger\|useSidebar\|toggleSidebar" src --include='*.tsx'` fuera de
`src/components/ui/sidebar.tsx` no devuelve **nada**. `AppSidebar` y `SupplierSidebar` declaran
`collapsible="icon"` y tienen las clases `group-data-[collapsible=icon]:hidden` preparadas,
pero no hay botón ni atajo que dispare el estado. En mobile, `SidebarProvider` renderiza el
sidebar dentro de un `Sheet` que tampoco tiene quién lo abra: en pantallas chicas la navegación
es inalcanzable.

Además, en estado icono el header quedaría mal: el texto `LIARD` no está envuelto en
`group-data-[collapsible=icon]:hidden` (solo el descriptor lo está) y el botón "Nuevo Proyecto"
mantiene el padding de botón ancho con solo el `+` adentro.

### Qué hacer

1. Montar un `SidebarTrigger` visible en la barra superior de cada layout (`AppLayout.tsx` y
   `SupplierLayout.tsx`), fijo arriba a la izquierda del contenido. `SidebarProvider` ya trae
   el atajo `Cmd/Ctrl+B`; documentarlo en el tooltip del trigger.
2. Estado icono, los dos sidebars:
   - Header: mostrar solo la marca (`BrandLogo variant="mark"` de UX-01), ocultar el wordmark
     y el descriptor.
   - "Nuevo Proyecto": pasar a botón cuadrado de icono con `tooltip="Nuevo proyecto"`.
   - Items de menú: ya pasan `tooltip`, verificar que el de proveedor también lo haga
     (`SupplierSidebar` hoy no pasa `tooltip` en ninguno de sus grupos).
   - Footer: el avatar centrado, sin el nombre ni el email.
3. Persistir el estado colapsado. `sidebar.tsx` de shadcn ya escribe la cookie
   `sidebar_state`; verificar que se respete al recargar.
4. Mobile (`< 768px`): el trigger abre el `Sheet`. Verificar que al navegar se cierre solo.
5. El submenú de `SupplierSidebar` (grupos colapsables con `ChevronDown`) tiene que comportarse
   en estado icono: hoy el `SidebarMenuSub` seguiría renderizando debajo del icono.

### Criterios de aceptación

- Se puede colapsar y expandir con el botón y con `Cmd+B`, en las dos sidebars.
- Colapsado, el ancho es el de un icono y no se corta ningún texto a la mitad.
- A 375px de ancho la navegación se abre desde el trigger y el contenido no hace scroll
  horizontal.
- El estado sobrevive a un `F5`.

**Tamaño estimado: ~300 líneas.**

---

## UX-05 — Menú de usuario en el sidebar

### Estado actual

"Cerrar sesión" es una fila suelta del menú, metida con `mt-auto` dentro de `SidebarContent`
(`SidebarLogoutButton.tsx`), separada del bloque de usuario del `SidebarFooter`, que es
puramente informativo y no clickeable. El comentario del propio archivo explica que se dibuja
así para que la línea divisoria del pie cuadre con la de la página: es una decisión de píxeles
sosteniendo una decisión de información.

Encima `SidebarLogoutButton` arrastra un hack de `!important` documentado, porque
`SidebarMenuButton` escribe `data-active` siempre y el hover pierde la especificidad.

### Qué hacer

Reemplazar las dos piezas por **un solo bloque de cuenta en el `SidebarFooter`**, al estilo de
la referencia que pasó el usuario (imagen 3), con los colores y el tono de Liard, no los de la
referencia:

1. El footer pasa a ser un `SidebarMenuButton` que abre un `DropdownMenu` hacia arriba
   (`side="top"`, `align="start"`), mostrando avatar + nombre + email y un `ChevronsUpDown`.
2. Contenido del menú:
   - Cabecera con avatar, nombre completo y el rol ("Ingeniero" / "Proveedor"), no "Gratis".
   - `Perfil` → `/cuenta` (UX-06), icono `CircleUser`.
   - `Configuración` → `/cuenta/preferencias` (UX-06), icono `Settings`.
   - `Ayuda` → placeholder deshabilitado o link al footer de la landing, icono `LifeBuoy`.
   - Separador.
   - `Cerrar sesión`, icono `LogOut`, en `text-destructive`.
3. Eliminar `SidebarLogoutButton.tsx` y con él el hack de `!important`; el hover del
   `DropdownMenuItem` no tiene ese problema.
4. Colapsado, el footer muestra solo el avatar y el menú se abre igual.

### Criterios de aceptación

- No queda ninguna fila "Cerrar sesión" en el cuerpo de la navegación.
- El menú funciona en las dos sidebars (ingeniero y proveedor) y en estado colapsado.
- El estado de carga del logout (`isLoggingOut`) se sigue viendo, ahora dentro del item.

**Dependencia:** UX-03 (avatar) y UX-04 (estado colapsado).
**Tamaño estimado: ~250 líneas.**

---

## UX-06 — Página de cuenta (ABM de perfil)

### Estado actual

No hay ninguna pantalla para ver o editar la cuenta después del onboarding. El item "Usuarios"
del `AppLayout` está `disabled: true`. El backend ya tiene lo necesario:
`PATCH /users/me` (`back/src/modules/users/controller/users.controller.ts`) acepta el perfil
completo — `fullName`, `photoUrl`, `phone`, `companyName`, `taxId` (CUIT), `website`, `state`,
`city`, `position`, y para proveedor `categories`, `brands`, `deliveryZones`,
`shortDescription`, `minOrderAmount`, `leadTimeDays`. El front ya tiene
`src/service/api/users.ts` y los componentes del wizard de onboarding
(`src/components/auth/onboarding/ProfileFieldControl.tsx`, `TagPicker.tsx`) que se pueden
reutilizar tal cual.

### Qué hacer

1. Ruta `/cuenta` dentro de `RequireAuth`, fuera de `RequireRole` (la usan los dos roles),
   renderizada dentro del layout que corresponda al rol del usuario.
2. Estructura con `Tabs` (UX-03):
   - **Perfil**: foto/avatar, nombre completo, email (solo lectura hasta UX-07), teléfono,
     cargo/posición.
   - **Empresa**: razón social, CUIT, sitio web, provincia y ciudad.
   - **Preferencias** (solo `SUPPLIER`): rubros, marcas, zonas de entrega, descripción corta,
     monto mínimo, plazo de entrega. Reutilizar `TagPicker`.
   - **Seguridad**: contraseña (UX-07) y baja de cuenta (UX-08). Se deja el tab armado y vacío
     si esos tickets todavía no entraron.
3. Un `useUpdateMeMutation` por formulario, con guardado explícito (botón "Guardar cambios"
   deshabilitado mientras no haya cambios), toast de éxito y errores de campo desde el 400 de
   validación. Ojo: el `ValidationPipe` es `forbidNonWhitelisted`, mandar un campo de más es 400.
4. Invalidar la query de sesión al guardar, para que el nombre del sidebar se actualice.
5. Cambiar el item "Usuarios" del sidebar por "Mi cuenta" o sacarlo: hoy es un item muerto.

### Criterios de aceptación

- Un ingeniero puede editar nombre, teléfono, cargo, empresa y ubicación, recargar y ver
  los cambios.
- Un proveedor puede editar además sus rubros, marcas y zonas.
- El nombre en el sidebar se actualiza sin recargar.
- Un campo inválido muestra el error debajo del campo, no un toast genérico.

**Dependencia:** UX-03, UX-05 (la entrada al menú).
**Tamaño estimado: ~600 líneas.**

---

## UX-07 — Cambio de contraseña y de email

### Estado actual

**No existe el endpoint.** `AuthController` (`back/src/modules/auth/controller/auth.controller.ts`)
tiene `register`, `login`, `me`, `logout`, `forgot-password` y `reset-password`, y nada más.
Hoy la única forma de cambiar la contraseña es pedir el mail de recuperación. El email tampoco
se puede cambiar: es `@unique` en el modelo `User` y ninguna ruta lo toca.

Esto es **backend + frontend**, a diferencia del resto de la épica.

### Qué hacer

Backend (`back/src/modules/users/`):

- `PATCH /users/me/password` con `currentPassword` + `newPassword`. Verifica la actual, aplica
  las mismas reglas de fortaleza que el registro, e **incrementa `tokenVersion`** para cerrar
  las demás sesiones (el modelo ya tiene el campo y el mecanismo).
- `PATCH /users/me/email` con `newEmail` + `password`. Devuelve 409 si el email ya existe.
  **Con re-verificación (decidido):** el cambio no se aplica de inmediato — se guarda como
  pendiente, se emite un token al mail nuevo (mismo mecanismo que `PasswordResetToken`, tabla
  propia o reutilizada) y recién al confirmarlo se escribe `email` y se pone
  `emailVerified = true`. Hasta entonces la cuenta sigue entrando con el email viejo.
  Requiere migración de Prisma (email pendiente + token) y una ruta pública de confirmación.
- Specs unitarios en `back/test/modules/users/unit/` e integración en `integration/`.
- Actualizar `api-endpoints.md` en el mismo cambio.

Frontend:

- Los dos formularios en el tab "Seguridad" de `/cuenta`, reutilizando `PasswordRules.tsx` de
  `src/components/auth/shared/`.
- Tras cambiar la contraseña, avisar que se cerraron las otras sesiones.
- Tras pedir el cambio de email: estado "pendiente de confirmación" visible en el tab, con el
  mail nuevo, la opción de reenviar y la de cancelar el cambio.
- Pantalla pública de confirmación del token, hermana de `ResetPasswordPage`.

### Criterios de aceptación

- Contraseña actual incorrecta → 401 con mensaje claro, sin cambiar nada.
- Después de cambiarla, una sesión vieja en otro navegador queda deslogueada.
- Email duplicado → 409 y mensaje en el campo.
- Pedir el cambio de email no cambia el email: hasta confirmar el token, el login sigue siendo
  con el viejo. Confirmado el token, el viejo deja de servir y `emailVerified` queda en `true`.
- Un token vencido o ya usado da un mensaje claro y ofrece reenviar.
- `npm run lint:check && npm run typecheck && npm test && npm run test:int` en verde.

**Tamaño estimado: ~700 líneas (≈450 back con migración y tokens, ≈250 front).**

---

## UX-08 — Baja de cuenta desde la UI

### Estado actual

`DELETE /users/me` ya existe y hace baja lógica (`disabledAt`), cierra las sesiones y borra la
cookie. Pide una confirmación literal en el body (`DeleteMeInput`). **No hay ninguna UI que lo
llame.**

### Qué hacer

- En el tab "Seguridad" de `/cuenta`, una zona de peligro al final, separada por `Separator`,
  con el texto que explique qué pasa: la cuenta deja de poder iniciar sesión, los proyectos y
  pedidos siguen existiendo a su nombre, y no es reversible desde la app.
- `AlertDialog` con el campo de confirmación literal que pide el endpoint.
- Al confirmar: redirigir a `/` y limpiar el cache de React Query.

### Criterios de aceptación

- Escribir mal la confirmación deja el botón deshabilitado, no genera un 400.
- Tras la baja, el usuario cae en la landing sin sesión y no puede volver con el botón atrás.

**Tamaño estimado: ~200 líneas.**

---

## UX-09 — Volver a la landing desde login y registro

### Estado actual

`LoginLayout.tsx`, `AuthSheet.tsx` y `RegisterSheet.tsx` no tienen ningún link a `/`.
`AuthBrand` dibuja la marca como un `div`, no como un `Link`. Una vez que el usuario entra a
`/login` la única salida es el botón atrás del navegador, y si llegó por un link directo ni eso.

### Qué hacer

1. `BrandLogo` (UX-01) envuelto en `Link to="/"` en las tres composiciones de auth. Con
   `aria-label="Volver al inicio"` y el foco visible.
2. Además, un link explícito de retorno arriba a la izquierda de la tarjeta:
   `← Volver al inicio`, con `ArrowLeft` de lucide. En `AuthSheet` va sobre la banda azul,
   en `LoginLayout` sobre la columna del formulario.
3. Revisar el cruce entre pantallas: desde `/login` se llega a `/register` y a
   `/forgot-password`, pero desde `/register` no hay link a `/login` visible en el mismo lugar.
   Unificar el pie de las tres tarjetas.

### Criterios de aceptación

- Desde `/login`, `/register`, `/forgot-password` y `/reset-password` se vuelve a `/` con un
  click, sin usar el botón atrás.
- El link funciona con teclado y tiene foco visible.

**Tamaño estimado: ~120 líneas.**

---

## UX-10 — Rework de la landing

### Estado actual

`src/pages/LandingPage.tsx` arma cinco secciones (`LandingSections.tsx`): hero con imagen de
fondo y overlay `bg-neutral-900/70`, una tira de 4 stats, "Nuestros Servicios" (6 cards de puro
título + descripción), "Por qué elegirnos" (imagen + 3 checks), "Nuestro Proceso" (4 pasos) y
un footer. Problemas concretos:

- **Un solo CTA en toda la página**, en el hero, y es un `Button variant="outline"` sobre fondo
  oscuro: el llamado principal se ve como acción secundaria. No hay CTA al final, que es donde
  el visitante decide.
- Ningún card tiene icono. Seis cards de texto plano en grilla son indistinguibles entre sí.
- Los stats (`500+ planos`, `99% precisión`) no salen de ningún dato del sistema. **Decisión
  tomada: se dejan** como proyección; el ticket no los toca más que para aplicarles la
  tipografía nueva.
- No se ve el producto en ninguna parte: no hay captura, ni demo, ni un antes/después de
  plano → listado de materiales, que es exactamente lo que diferencia a Liard.
- El hero usa `role="img"` sobre un `div` con `backgroundImage`, y el `h1` dice solo
  "Liard AI Tool" — el nombre, no la propuesta de valor.
- La navegación (`PublicNavbar`) tiene links a anclas que en mobile desaparecen por completo
  (`hidden md:flex`), sin menú hamburguesa.

### Qué hacer

Rearmar la página siguiendo la estructura que repiten los ejemplos de referencia
(unbounce.com/landing-page-examples/best-landing-page-examples/):

1. **Hero**: titular con el beneficio, no con el nombre ("Del plano al pedido, sin planillas").
   Subtítulo de una línea. **Un CTA primario sólido** (`Registrarse gratis`) y uno secundario
   fantasma (`Ver cómo funciona`, ancla al proceso). A la derecha o debajo, una captura real
   del producto (el editor de BOM o la pantalla de cotización) en un marco de navegador.
2. **Prueba visual del producto**: una sección de "antes/después" — recorte de un plano DXF a
   la izquierda, filas del BOM detectado a la derecha. Es la sección que más convierte y hoy
   no existe.
3. **Servicios**: mantener las 6 cards pero con icono lucide cada una
   (`FolderKanban`, `ScanLine`, `Scale`, `Send`, `BookOpen`, `BarChart3`) y jerarquía tipográfica
   de UX-02.
4. **Beneficios**: se mantiene, pero los tres checks pasan a iconos temáticos y el bloque gana
   un CTA al pie.
5. **Proceso**: los 4 pasos con conector visual entre ellos, no 4 columnas sueltas.
6. **CTA final** antes del footer: banda a color con titular, un botón y una línea de garantía
   ("Sin tarjeta. Cargá un plano y probá").
7. **Stats**: se mantienen con el contenido actual. Solo se les aplica la escala de UX-02.
8. **Navbar responsive**: menú hamburguesa con `Sheet` debajo de `md`, y el CTA de registro
   siempre visible.
9. Accesibilidad: imagen de fondo como `<img>` con `alt` o como decorativa con `aria-hidden`,
   no un `div` con `role="img"`. Un solo `h1` por página, jerarquía `h2`/`h3` correcta.

### Criterios de aceptación

- Hay al menos tres puntos de conversión: hero, medio y cierre.
- La landing muestra el producto con al menos una captura real.
- A 375px no hay scroll horizontal y la navegación es accesible.
- Lighthouse accesibilidad ≥ 95 en `/`.

**Dependencia:** UX-01, UX-02.
**Tamaño estimado: ~700 líneas.**

---

## UX-11 — Mensajes y copy de la landing

### Estado actual

Todo el copy vive en `src/components/landing/landing-content.ts`, que es lo correcto. El
problema es el contenido: el producto se nombra de tres formas distintas ("Liard AI Tool",
"LIARD", "BOM Management"), el CTA dice "Optimiza tus cotizaciones" en un tuteo neutro mientras
el resto de la página vosea ("Cargá", "Subí", "Medí"), y los stats no son verificables.

### Qué hacer

- Aplicar el nombre decidido en UX-01 (**`liard`**, minúsculas, sin sufijo) a todo el copy.
- Unificar el registro: **voseo rioplatense en toda la app**, que es lo que ya usan las
  pantallas internas ("Seguí el estado de cada pedido", "Entrá con la cuenta de tu equipo").
- Reescribir titular y subtítulo con el beneficio adelante.
- CTAs en imperativo y en primera persona del usuario: "Empezar gratis", "Ver una demo".
- Revisar de paso los mensajes de error y vacío del resto de la app contra el mismo criterio:
  `OrdersErrorState` ("No pudimos cargar los pedidos"), `EmptyState`, los toasts. Dejar una
  tabla corta de tono en `docs/` para que no vuelva a divergir.

### Criterios de aceptación

- No queda ningún "tú" ni ningún nombre alternativo del producto.
- Los stats quedan como están (decisión tomada): este ticket no los reescribe.

**Tamaño estimado: ~200 líneas.**

---

## UX-12 — Refactor del listado de pedidos

### Estado actual

`src/components/order/OrdersListTable.tsx` es, como dice el usuario, la peor pantalla de la app,
y su estado vacío (`OrdersEmptyState.tsx`) se ve mejor que la pantalla con datos. Problemas
concretos:

- **Tipografía inflada y arbitraria**: `text-[26px]` en el título de la sección, `text-[18px]`
  en los secundarios y `text-[16px]` en la tabla — el texto secundario es más grande que el
  cuerpo de la app. Filas de `h-[100px]`.
- **No usa `src/components/ui/table.tsx`**: es un `<table>` a mano con `table-fixed` y siete
  anchos porcentuales (`11%`, `16%`, `13%`, `18%`, `13%`, `19%`, `10%`) que suman 100 pero no
  responden a nada.
- **`min-w-[1180px]`**: por debajo de ~1250px la tabla scrollea en horizontal. En mobile es
  inusable.
- **Datos falsos en producción**: `mockConfirmedOrderContacts` de
  `./fixtures/orders.fixtures.ts` se inyecta en cada fila con estado `CONFIRMED`. La columna
  "Contactos" muestra contactos inventados.
- El header de la sección repite información que ya está en `OrdersStatsPanel` justo arriba
  ("N pedidos encontrados"), y "Ordenado por fecha reciente" es texto plano donde debería ser
  un control de orden.
- La columna "Detalle" tiene un ternario roto:
  `onOrderDetailClick ?? onProviderSummaryClick ? () => … : undefined` — por precedencia, la
  condición es siempre truthy, así que el botón nunca queda deshabilitado aunque no haya handler.
- Cinco lugares distintos para hacer click en una fila (código, proveedores, contactos, ver)
  sin que se entienda cuál es la acción principal.

### Qué hacer

1. Reconstruir sobre `Table` de shadcn y la escala de UX-02. Filas de altura natural
   (`py-4`), no `h-[100px]`.
2. Reducir a cinco columnas: Pedido (código + fecha), Proyecto, Estado, Total (+ items),
   Proveedores. "Contactos" pasa a ser una acción dentro del detalle, no una columna — hasta
   que los contactos sean datos reales.
3. **Sacar el fixture.** Si el backend todavía no devuelve contactos, no se muestran.
4. La fila entera es clickeable y lleva al detalle; el botón "Ver" queda como ancla visual con
   `aria-label` pero deja de ser el único destino. Arreglar el ternario de precedencia.
5. Header de la sección: el título y el conteo se van (ya están en el toolbar y en los stats);
   queda un `Select` de orden real (fecha, total, estado).
6. Responsive: debajo de `lg`, la tabla se convierte en lista de cards
   (un card por pedido, código + estado arriba, proyecto y total debajo, proveedores como
   avatares apilados). Es el mismo patrón que hay que aplicar a `SupplierRequestsPage`.
7. Mantener el skeleton y el error state actuales, que están bien.

### Criterios de aceptación

- A 1280px no hay scroll horizontal; a 375px se ven cards legibles.
- `grep -rn "fixtures" src/components/order` no devuelve nada en código de producción.
- El estado con datos se ve de la misma familia visual que `OrdersEmptyState`.
- Ordenar por total reordena la lista.

**Dependencia:** UX-02, UX-03.
**Tamaño estimado: ~500 líneas.**

---

## UX-13 — Encabezados de página consistentes

### Estado actual

Cada página arma su encabezado a mano. `OrdersPage.tsx` usa
`mx-auto w-full max-w-[1600px] px-8 py-8` + `h1 font-heading text-3xl`; otras páginas usan otros
anchos, otros paddings y otros tamaños de título. No hay breadcrumbs en ninguna pantalla de
detalle (`/projects/:id/plans/:planId` está a tres niveles de profundidad sin rastro de dónde
está el usuario), y las acciones de página (exportar, nuevo, procesar) aparecen unas veces
arriba a la derecha y otras dentro del contenido.

### Qué hacer

1. `src/components/shared/PageHeader.tsx`: título, descripción opcional, slot de acciones a la
   derecha y slot de breadcrumb arriba. Un solo contenedor de ancho
   (`mx-auto w-full max-w-[1600px] px-8 py-8`) definido una vez.
2. Migrar las páginas: proyectos, detalle de proyecto, detalle de plano, editor de BOM,
   cotización, pedidos, y las cinco del panel de proveedor.
3. Breadcrumbs (UX-03) en todas las pantallas de detalle.
4. Regla fija: **la acción primaria de la página va arriba a la derecha del header**; las
   secundarias, en un `DropdownMenu` de tres puntos al lado.

### Criterios de aceptación

- Todas las páginas comparten ancho, padding y tamaño de título.
- Desde el detalle de un plano se vuelve al proyecto por el breadcrumb.

**Dependencia:** UX-02.
**Tamaño estimado: ~350 líneas.**

---

## UX-14 — Auditoría de botones, cards e iconos

### Estado actual

Inconsistencias que se ven a simple vista:

- Alturas de botón fijas y distintas por pantalla: `h-10`, `h-11`, `h-12`, `size="lg"`,
  conviviendo (`OrdersPage`, `OrdersEmptyState`, `LandingSections`).
- `cursor-pointer` agregado a mano en algunos botones y no en otros — señal de que el
  `Button` base no lo trae y se parchea por ticket.
- Cards con radios distintos: `rounded-xl` en `OrdersListTable`, `rounded-2xl` en el skeleton
  y el error state de la misma página, `rounded-3xl` en el `EmptyState` filtrado,
  `rounded-[4px]` en `AuthSheet`.
- Orden de acciones en los modales: no hay una regla de cuál va a la izquierda.
- Iconos: la app ya usa lucide, pero queda `public/icons.svg` y `public/excel-logo.png` como
  assets sueltos, y algunos estados vacíos usan emoji o nada.

### Qué hacer

1. Fijar los radios en tokens (`--radius-card`, `--radius-control`) y reemplazar los crudos.
2. Un solo set de tamaños de botón: `sm` / `default` / `lg` de shadcn, sin `h-[N]` a mano.
   Agregar `cursor-pointer` al `Button` base y borrar los parches.
3. Regla de modales: acción destructiva o primaria a la derecha, cancelar a la izquierda, en
   `ConfirmModal` y en todos los `Dialog`.
4. Pasar los iconos restantes a lucide; evaluar si `icons.svg` sigue usándose y borrarlo si no.
5. Cada estado vacío con su icono lucide y su acción, siguiendo el patrón de
   `EmptyStateFeatureCard`, que es el que mejor quedó.

### Criterios de aceptación

- `grep -rn "h-\[1[0-9]px\]\|h-11\|h-12\|rounded-\[" src/components` no devuelve nada fuera de
  `src/components/ui/`.
- Todos los modales ordenan sus botones igual.

**Dependencia:** UX-02.
**Tamaño estimado: ~400 líneas.**

---

## UX-15 — Revisión del onboarding

### Estado actual

El alta es: registro → `/onboarding/role` (elegir ingeniero o proveedor, **se fija una sola
vez**, el backend devuelve 409 si se intenta cambiar después del sello) → `/onboarding/profile`
(wizard con `ProfileStepper` / `ProfileWizard`). Dos cosas que llaman la atención:

- El rol es irreversible y la pantalla que lo fija no lo dice con claridad.
- Terminado el wizard, el usuario cae en su home sin ninguna orientación: no hay tour, ni un
  estado vacío que enseñe el primer paso más allá del de proyectos.
- `ProviderClaimList` y `ProviderFavorites` existen en `src/components/auth/onboarding/` — hay
  que confirmar si siguen en el flujo o son restos.

### Qué hacer

**En alcance (decidido).**

1. `/onboarding/role`: decir de forma explícita que la elección es definitiva, antes de
   confirmar — un `AlertDialog` de confirmación con el rol elegido, no solo una nota al pie.
   El 409 del backend deja de ser la primera vez que el usuario se entera.
2. Permitir **completar después**: el wizard de perfil gana un "Lo completo más tarde" que
   deja `onboardingCompletedAt` sin sellar y lleva a la home. El recordatorio persistente va
   como banner en el header de la home y como punto en el menú de usuario (UX-05), con link
   a `/cuenta`. Revisar `RequireAuth` / los guards: hoy el onboarding incompleto redirige,
   hay que decidir qué rutas quedan habilitadas sin perfil (mínimo: la home del rol y
   `/cuenta`).
3. Checklist de primeros pasos en la home del ingeniero: crear proyecto → subir tabla de
   referencia → subir un plano → procesar → cotizar. Cada paso con su link, tildado según
   datos reales, y descartable. Se apoya en los estados vacíos que ya existen.
4. Confirmar si `ProviderClaimList.tsx` y `ProviderFavorites.tsx` siguen en el flujo. Si son
   restos, borrarlos en este ticket.

### Criterios de aceptación

- Nadie puede fijar su rol sin haber leído que es definitivo.
- Se puede llegar a la home con el perfil incompleto, y el recordatorio es visible hasta
  completarlo.
- El checklist refleja el estado real del proyecto del usuario, no un mock.

**Dependencia:** UX-05, UX-06.
**Tamaño estimado: ~450 líneas.**

---

## UX-16 — Panel de proveedor: tablas y pantallas

### Estado actual

Las cinco pantallas de `src/pages/supplier/` quedaron fuera del pulido. `SupplierRequestsPage`
repite el patrón de `OrdersListTable` (tabla ancha a mano, tipografía inflada, sin versión
mobile), `SupplierCatalogPage` y el asistente de importación en tres pasos
(`SupplierCatalogImportPage`) son las pantallas más nuevas y las que más se usan del lado
proveedor. Además `SupplierSidebar` todavía muestra `mockSupplierProfile.companyName` como
fallback cuando el usuario no tiene `companyName`.

### Qué hacer

1. Aplicar a `SupplierRequestsPage` exactamente lo mismo que UX-12 hace con pedidos: `Table`
   de shadcn, escala de UX-02, colapso a cards debajo de `lg`. Si las dos tablas terminan
   compartiendo estructura, extraer un componente común en `src/components/shared/`.
2. `PageHeader` (UX-13) y breadcrumbs en las cinco pantallas.
3. Revisar el asistente de importación de catálogo contra la regla de acciones de UX-14:
   "Atrás" a la izquierda, "Siguiente"/"Importar" a la derecha, estado del paso siempre visible.
4. Sacar el fallback a `mockSupplierProfile` del sidebar: sin `companyName`, se muestra el
   email, no un nombre inventado.
5. Estados vacíos de solicitudes y de catálogo con el patrón de `EmptyStateFeatureCard`.

### Criterios de aceptación

- A 375px las solicitudes del proveedor se leen como cards, sin scroll horizontal.
- `grep -rn "mockSupplierProfile" src` no devuelve nada fuera de `fixtures/`.
- Las cinco pantallas comparten header, ancho y breadcrumb.

**Dependencia:** UX-02, UX-12, UX-13.
**Tamaño estimado: ~550 líneas.**

---

## Decisiones tomadas (2026-09-15)

1. **Wordmark**: SVG vectorizado (`public/liard-wordmark.svg`), pintado con `mask-image`.
   No se compone con una fuente.
2. **Nombre del producto**: **`liard`**, en minúsculas y sin sufijo, en toda la app.
3. **Stats de la landing**: se dejan como están.
4. **Cambio de email**: con re-verificación del email nuevo. UX-07 incluye la migración, el
   token y la pantalla pública de confirmación.
5. **Onboarding**: entra en la épica como UX-15.
6. **Panel de proveedor**: entra en la épica como UX-16.
7. **Modo oscuro**: **fuera de alcance.** Los tokens y las clases `dark:` que ya existen se
   dejan como están; no se agrega switch ni se completa la paleta oscura en esta épica.


---

## Correcciones al relevamiento (al implementar)

Tres cosas que este documento daba por ciertas y no lo eran, más una decisión
que hubo que tomar con el código delante:

1. **UX-05 y UX-06 se invirtieron.** El menú de cuenta apuntaba a `/cuenta`, que
   no existía: se hizo primero la página y después el menú, así ninguna rama
   queda con un enlace muerto.
2. **UX-07 creció.** El cambio de correo con re-verificación necesitó un modelo
   nuevo (`EmailChangeRequest`), su migración, una ruta pública de confirmación
   y su pantalla. Además, el cambio de contraseña re-firma la cookie de la
   sesión que lo pide: incrementar `tokenVersion` mata todos los tokens, también
   el propio.
3. **UX-15 se entrega a medias, a propósito.** "Completar el perfil después" no
   es un cambio de frontend: `OnboardingGuard` del backend rechaza toda la API
   mientras `onboardingCompletedAt` sea null. Entrar a la home sin perfil
   mostraría una pantalla donde no carga nada. Qué rutas se permiten sin perfil
   es una decisión de backend y necesita su propio ticket.
4. **UX-16 era casi todo imaginario.** El panel de proveedor ya estaba en orden:
   solicitudes en tarjetas responsivas, catálogo sobre `Table`, asistente con
   las acciones bien ordenadas. Lo que sí había, del mismo tipo, estaba en la
   pantalla del ingeniero: `OrderProviderDetailView` mostraba **contactos de
   proveedor inventados** —teléfonos y correos de un fixture, en una pantalla
   donde alguien podía marcarlos— y `OrderProviderMaterialsTable` era otra tabla
   a mano de 1040px. Eso es lo que se arregló.

También quedó fuera, y no se tocó: los `rounded-[3px]` del alta y el login son
27 usos consistentes entre sí —el lenguaje visual de esas pantallas— y no deriva.

