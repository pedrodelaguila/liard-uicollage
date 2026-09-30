# 01 · Estrategia de liard

Base: repo `lab3-liard`, rama `dev`, commit `04fc8139` (30/09/2026), leído sin ejecutar nada. Las fuentes se citan como
`research/0N-*.md §sección`, documentos del repo (`documentacion/…`) o URL. Cada cifra lleva una etiqueta: **[medido]** (corrida
del equipo o conteo en código), **[entrevista]** (discovery, 7 empresas, muestra no representativa), **[fuente externa]**
(un tercero la publica y nadie la auditó) o **[estimación]** (cuenta propia, es una hipótesis).

Liderazgo global y ganancias son **hipótesis a validar**, no metas garantizadas. Este documento dice qué tendría que ser
cierto para que lo sean y cómo darnos cuenta rápido si no lo es.

---

## 1. Diagnóstico: qué existe en `dev` y qué dicen los documentos

### 1.1 Lo que existe (verificado en código)

El circuito de punta a punta **está construido pero no está en producción**:

| Tramo | Estado en `dev` | Evidencia |
| --- | --- | --- |
| Plano → BOM | Existe. DXF y PDF vectorial, recorte de hasta 15 tableros por DXF, cola Postgres con lease, detección YOLO (dónde) + Claude (qué), revisión sobre el plano, multiplicador de 1 a 1000 | `research/02-backend.md §4` pasos 3–8 |
| BOM → componente base | Existe. 33 tipos base sembrados, lectura con Haiku que cachea por texto normalizado, corrección humana `MANUAL` | `research/02 §4` paso 9; `research/04 §1` ítems 1–3 |
| Catálogo del proveedor | Existe. Importación xlsx con vista previa, lectura IA, vinculación manual. **Reemplaza el catálogo entero** | `research/02 §4` paso 17; `research/03 §2.3` |
| Cotización | Existe, **100 % desde catálogo**: igualdad de tipo base + atributos `required`, score 100, `CANONICAL` | `research/02 §4` paso 13 |
| Comparación y adjudicación | Existe en modo lectura. La adjudicación vive en `sessionStorage`, así que **si se cierra la pestaña se pierde**. `selectedOfferId` nunca se escribe | `research/03 §2.2` paso 6; `research/02 §3` columnas muertas |
| Pedido | Existe. Un lote por cotización y un `PurchaseOrder` por proveedor. El proveedor acepta o rechaza el pedido entero, una sola vez, sin mandar nada más | `research/02 §4` pasos 15–18 |
| Oferta editable del proveedor, RFQ, plazos, notificaciones, pagos, colaboración, admin | **Ausentes**. `EXPIRED` y `responseDeadlineAt` existen en el schema, pero nada los escribe | `research/02 §4` pasos 19–25 |

### 1.2 Reconciliaciones entre lo que dicen los documentos y lo que hay en el código

| # | Lo que dice el documento | Lo que hay en realidad | Qué hacer con eso |
| --- | --- | --- | --- |
| R1 | `Roadmap.md` §Sprint 4.11: "Se desplegó la versión demo… para sus primeros 5 usuarios" | Issue **#985** abierto y con **todas** las casillas sin marcar. No hay `docker-compose.prod.yml`, Caddyfile, workflow de deploy ni IaC. `Arquitectura Liard.md:75` dice "Preparada, no desplegada" y `:76` dice "Hoy, en desarrollo, los archivos viven en el disco local". `research/04 §5`: "Todavía no se desplegó nada" | **Hay cero usuarios externos** [medido]. Hasta que #985 cierre, cualquier métrica de adopción es cero o no existe. Hay que corregir el Roadmap |
| R2 | Issues #832, #930, #931, #970, #987 y la épica #988 figuran abiertos | Su código ya está en `dev` (PRs #957, #989, #990, #971 y #995). Como el repo por defecto es `main`, `Closes #N` no los cierra al mergear a `dev` | Cerrarlos a mano. Sin eso, el tablero de GitHub no sirve para medir avance (`research/04` intro) |
| R3 | Sprint 4.4: el matching por componente base "está hecho" | Está hecho en el backend (PR #995), pero **ningún componente del front muestra `unmatchedReason`** | El usuario ve NOT_FOUND sin saber por qué. Es un hueco de confianza que se arregla con un ticket S |
| R4 | `Documento de Visión` §1.3: precisión ≥ 90 % en tableros complejos | Hay mediciones por etapa: ubicar aparatos 97,3 % en 15 planos y 99,4 % en 25 [medido, `research/04 §4`]; clasificar 51–52 de 56 [medido]; lectura IA 98,6 % y 97,5 % sobre casos **sintéticos** [medido, sintético]. **Del matching de punta a punta sobre datos reales no hay ningún número** | El criterio de éxito no se puede declarar cumplido. Falta medir línea del BOM → oferta correcta (#904) |
| R5 | Sprint 5: "pagos = suscripción + comisión por lead" | Nadie preguntó en el discovery cuánto pagarían las empresas ni si los proveedores aceptarían comisión (`research/01 §3` "Disposición a pagar — ABIERTO"). No hay issue ni código (`research/04 §2`) | Tratarlo como hipótesis y validar precio antes de construir cobro (ver §4) |
| R6 | `CLAUDE.md`: 23 specs de Cypress y 12 módulos | Hay 28 specs y 14 módulos (`research/03 §6`, `research/02 §2`) | Es menor. Muestra que la documentación va detrás del código |
| R7 | Onboarding "Tus proveedores" y contacto del cliente | El paso de favoritos no guarda nada, y los canales de contacto del cliente son un **mock hardcodeado** (WhatsApp 541112345678 para todos los clientes) (`research/03 §2.3`) | Antes de que un proveedor real vea la pantalla, hay que sacar el mock o reemplazarlo por datos reales |
| R8 | "Catálogo por dueño" | Las lecturas del catálogo validan el **rol** y no la propiedad (`Arquitectura Liard.md:260`). `canonical-catalog` acepta escrituras de cualquier rol (`research/02 §1`) | Es riesgo de confidencialidad y de calidad de datos. Se arregla **antes** de sumar distribuidores reales |
| R9 | Preferencias de marca | El editor del front las usa, pero el matcher de cotización no las lee (`research/02 §4` paso 11) | Aclararlo en la UI o hacer que el matcher las lea |
| R10 | North Star / OKRs "definidos" (Roadmap §Sprint 3) | No están en ningún documento (`research/01 §8.3`) | Se proponen en §6 |

**Conclusión del diagnóstico.** El producto técnico va adelante de la validación comercial. Hay un flujo de 86 rutas
(`research/02 §2`) y unas 258 pruebas e2e (`research/04 §1`.10) [medido], pero hay cero usuarios desplegados, cero
evidencia de precio y cero medición de punta a punta del matching. El cuello de botella no es construir más, sino
**poner lo construido frente a usuarios reales y medir**.

---

## 2. Dónde está el valor defendible

El discovery reformula el problema como **tres problemas encadenados**: interpretar el plano, llevar el BOM a productos
comerciales y conectar con proveedores (`research/01 §3`, DISC §"El problema"). Solo la cadena completa es difícil de
copiar:

- **Detectar símbolos no alcanza como foso.** Switchonomy y OpenDrawing ya leen unifilares (`research/05 §2`) [fuente
  externa] y los configuradores de los fabricantes son gratis. Eso deja en cero el precio de ancla de "un BOM a partir de un
  diseño conocido" (`research/05 §2`, fila Schneider).
- **El activo acumulable es el catálogo canónico** (tipo → atributos → valores, sin marca) con equivalencias multimarca y
  los catálogos de varios distribuidores vinculados a él. Ninguna herramienta relevada combina leer el plano de un tercero,
  la equivalencia multimarca y la comparación entre varios distribuidores (`research/05 §2`, "Positioning gap")
  [estimación].
- **Los proveedores no quieren ver planos.** Quieren recibir el BOM ya contado y especificado (Electro HCM), les importan
  eficiencia y orden más que volumen (Q Electric) y **rechazan manejar pagos** (`research/01 §3`) [entrevista]. El valor del
  lado de la oferta es recibir una **solicitud estructurada**, no un canal de venta con comisión.

### Precio, plazo y stock pesan tanto como el precio de lista

El discovery repite que el precio de catálogo es una referencia, que la oferta final depende del volumen, la forma de pago y
el convenio, y que el más barato puede entregar a 90 días (`research/01 §3` principios; Nisamat: stock con hasta 3 meses de
demora) [entrevista]. Hoy el backend cotiza **solo con catálogo**, y el proveedor no puede ajustar precio, stock ni plazo
(`research/02 §4` paso 19). **La brecha de producto más importante del lado comercial es que el proveedor confirme o ajuste
precio, stock y plazo.** Así lo promete el `Documento de Visión` §2.2 y hoy no existe.

---

## 3. Segmento de entrada: el A, no GRAMONT

| Segmento | Quiénes (evidencia) | Qué valoran | Decisión |
| --- | --- | --- | --- |
| **A: alta necesidad de conteo** | Liard, EMEVE (1,5 días por 40 tableros), Meco (35–40 presupuestos/semana con 5 personas) [entrevista] | Conteo + revisión + reglas | **Cabeza de playa.** Es donde el caso Fundaleu (4 h → 17 min) [medido, un caso, `research/01 §1`] tiene sentido |
| **B: procesos maduros** | GRAMONT (EPLAN, IEC 61439, ~300 cotizaciones/año, convierte 10–15 %) [entrevista] | "El conteo no es el problema": costeo, matching, precios al día | **No es el primer cliente.** Se entra después con presupuesto y margen (O-12) e historial de precios (O-15), cuando esas piezas existan |
| **C: distribuidores** | Electro HCM, Q Electric, Nisamat (15–20 presupuestos/día por vendedor, 2–3 h cada uno) [entrevista] | BOM estructurado, trazabilidad por email, sin pagos | **Lado de la oferta del piloto.** Se los recluta por valor operativo, no por comisión |

GRAMONT es la mejor señal de lo que el producto tiene que ser en H2 (costeo), pero no sirve para validar H1: su dolor no
es el que resolvemos hoy.

---

## 4. Monetización: hipótesis, no plan

Nada de esta sección está validado. En el discovery no se preguntó disposición a pagar (`research/05 §3`) [entrevista].

| Hipótesis | Referencia | Riesgo | Cómo se valida |
| --- | --- | --- | --- |
| **H-M1 · Suscripción por empresa con cupo de tableros**, no por usuario | Togal USD 299 por usuario/mes; Kreo USD 35–175 [fuente externa]. Techo por valor: **USD 1–3,5 por tablero** procesado [estimación, `research/05 §3.2`: solo las horas de EMEVE salen del discovery, el resto se supuso] | Cobrar por usuario castiga a la estructura de "11 personas cotizando" (César Braña) [entrevista] | Pilotos pagos con 3 niveles de precio (ver `03-roadmap.md §6`) |
| **H-M2 · Pago por plano** para usuarios ocasionales | Drawer: desde USD 22,20 por detección [fuente externa] | Canibaliza la suscripción si el piso está mal puesto | Ofrecerlo en paralelo y medir qué eligen |
| **H-M3 · Proveedor: suscripción por solicitudes estructuradas o tarifa por RFQ calificada**, no comisión sobre el pedido | Margen neto del distribuidor ~3 % [fuente externa, `research/05 §1.4`]: una comisión > 1–2 % del GMV se come la mitad de su ganancia [estimación] | Q Electric rechazó los pagos; la comisión nunca se preguntó [entrevista] | Preguntarlo explícitamente en la validación V2 |
| **H-M4 · Comisión por lead** (lo que dice el Sprint 5) | Marketplaces B2B 3–15 % [fuente externa]; no se traslada a pedidos de obra [estimación] | Con el pago fuera de la plataforma, se puede esquivar | Diferir hasta que haya volumen de pedidos medido |
| **H-M5 · Tarifa financiada por el fabricante** (participación en especificación) | Representantes: 8–16 % de la venta neta [fuente externa] | Conflicto con la neutralidad multimarca | H3, con reglas de neutralidad publicadas |

**Costo variable a cubrir** [medido, `research/04 §4`]: detección USD 1,02 por plano de 221 cajas (techo USD 1,22;
TSSS USD 1,32); plano medio ~USD 0,73; lectura de BOM ~USD 0,041 por plano; lectura de catálogo USD 3,42 por 2.551 líneas.
**Regla derivada** [estimación]: a USD 1–3,5 por tablero de ingreso y ~USD 1 de costo de IA, **el margen bruto por tablero
es entre fino y negativo** si no se controla el gasto. Por eso el control de costo de IA (O-09) va antes que el cobro
(O-11), y no al revés.

---

## 5. Diferenciales a validar: IA, FX e inflación

- **IA que propone y persona que confirma.** EMEVE ya probó una IA paga que alucinaba (`research/01 §3`) [entrevista].
  El diferencial es mostrar la procedencia (detectado / inferido por regla / manual) y **no inventar un SKU crítico**,
  más que "tener IA". Métrica: la proporción de líneas que el ingeniero acepta sin editar, con umbral ≥ 90 % en tableros
  simples y ≥ 80 % en complejos (`research/05 §4`) [estimación, umbral propuesto].
- **FX e inflación.** Inflación de 1,7 % mensual y 33,5 % interanual (ago. 2026, INDEC); mayorista ARS 1.522 por USD, con
  +4,6 % en el año [fuente externa, `research/05 §4`]. La forma de pago cambia el precio (Nisamat) [entrevista]. Hoy el
  backend convierte a `QUOTATION_CURRENCY` (`research/02 §4` paso 13), pero no guarda la vigencia de la oferta ni recotiza.
  **Hipótesis:** un presupuesto de venta con validez y cobertura por inflación es un motivo de compra para el segmento B.
  **Umbral:** ≥ 40 % de las empresas del piloto pagarían aparte por recotización automática (`research/05 §4`)
  [estimación].
- **Plano en PDF.** Detecta 2,4 % menos aparatos que en DXF [medido]. Amplía el mercado a quien no tiene el DXF.

---

## 6. North Star y métricas de guarda (propuestas)

- **North Star:** *tableros cotizados con oferta confirmada por el proveedor, por semana*. Obliga a que funcione toda la
  cadena y no solo la detección.
- **Guardas:** minutos por tablero **incluida la revisión humana**, contra la línea base manual propia de cada empresa (el
  objetivo ≥ 60 % menos tiempo sale de `research/05 §4` [estimación]); faltantes con precio ≤ 1 por tablero; costo de IA por
  tablero; mediana de respuesta del proveedor (< 30 min contra las 2–3 h de hoy [entrevista]); retención de 3 de 5 empresas
  piloto en la semana 4.

---

## 7. Expansión: LatAm IEC, solo si se cumplen las condiciones

Latinoamérica era el 3,6 % del mercado de tableros de BT en 2022 y la región de mayor crecimiento (4,6 % CAGR 2022–28)
[fuente externa, Frost & Sullivan, `research/05 §1.1`]. En Chile, ~60 % de los tableros de obras grandes pasan por
distribuidores [fuente externa]. Las normas IEC y la base Schneider/ABB/Siemens son comunes a la región, lo que hace
**plausible** reusar el catálogo canónico [estimación].

**Condiciones para salir de Argentina (todas):**
1. En Argentina, ≥ 5 empresas pagando y ≥ 3 distribuidores respondiendo solicitudes dentro de la plataforma durante 3
   meses seguidos.
2. Acierto de matching de punta a punta medido sobre datos reales y por encima del umbral acordado (V4 en
   `03-roadmap.md`).
3. Costo de IA por tablero < 30 % del ingreso por tablero [estimación, umbral propuesto].
4. Resuelto dónde viven los datos: São Paulo cuesta entre 53 % y 113 % más que la región actual de AWS y Chile no figura en
   la lista de precios (`Arquitectura Liard.md:155`) [fuente externa].
5. Un socio local tipo CADIME en el país destino. En Argentina, el rol de CADIME todavía no está validado (`research/01 §8.8`).

Sin estas condiciones, "liderazgo regional" es una aspiración y no se planifica trabajo para eso.

---

## 8. Riesgos principales

| Riesgo | Señal temprana | Mitigación |
| --- | --- | --- |
| Competidores de Liard desconfían de una plataforma asociada a Liard (VIS §1.5) | Rechazos en los pilotos fuera del círculo de Liard | Unidad separada, confidencialidad por diseño (O-22) y política de datos escrita |
| El costo de IA supera el ingreso por tablero | Ledger por tablero > USD 1,5 | Tope por espacio de trabajo (O-09), detección sin repetir y caché |
| Distribuidores que no responden | < 50 % de solicitudes respondidas | Email como canal formal (O-08), solicitud ya estructurada, sin comisión al principio |
| Un competidor que lee unifilares (Switchonomy, OpenDrawing) entra a LatAm | Presencia comercial en AR | Profundidad en catálogos locales y equivalencias; no competir por la detección sola |
| Exceso de alcance: el prototipo sugiere 20 pantallas | Sprints que abren frentes sin cerrar H1 | Aplicar los criterios de salida de `03-roadmap.md` |
