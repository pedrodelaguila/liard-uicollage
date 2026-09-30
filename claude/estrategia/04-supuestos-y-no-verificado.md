# 04 · Supuestos y lo que no está verificado

Todo lo que sigue es **supuesto**: un número inventado para el prototipo, una hipótesis de la estrategia o algo que no se
pudo comprobar. Nada de esto se usa como dato en una conversación comercial sin antes validarlo.

## 1. Datos del prototipo (`data.js`, `app.js`): todo es ficticio

`data.js` lo dice en su cabecera: "Toda empresa, persona, obra, código y precio de este archivo es inventado". Las marcas
(Schneider, ABB, Chint, Siemens) son referencias de dominio; **los códigos y los precios no son reales**.

| Dato del prototipo | Valor | Contra qué se puede contrastar | Estado |
| --- | --- | --- | --- |
| Precios base por componente (`basePrice`) | ARS 1.450 (borne de 4 mm²) a ARS 3.150.000 (gabinete IP55 2000×800) | Ningún catálogo real en el repo | **Inventado** |
| Factor por distribuidor | Sur 1,00 · Delta 1,04 · Norte 0,95 | — | Inventado |
| Factor por marca | Schneider 1,00 · ABB 0,97 · Siemens 1,06 · Chint 0,63 | — | Inventado. No usarlo como "Chint es 37 % más barato" |
| Plazos de entrega | Sur 2 · Delta 4 · Norte 9 días hábiles; +5 si es Siemens; +6 para caja moldeada y gabinete | Nisamat: stock con hasta 3 meses de demora [entrevista] | Inventado y **optimista** frente a lo que dice el discovery |
| Precios vencidos y productos que un distribuidor no trabaja | 2 combinaciones vencidas; 4 tipos sin catálogo | — | Inventado, para mostrar los estados |
| Ofertas de SC-0141 | Modos CATALOGO/AJUSTADO/ALTERNATIVA, condición "30 días", vigencia 03–09/10 | El backend actual **no tiene** ofertas editables | Inventado; es el flujo propuesto O-06/O-07 |
| **Tipo de cambio** | `usdArs: 1245`, "Cotización simulada para la demo" | Mayorista ARS 1.522 al 29/09/2026 [fuente externa, `research/05 §4`] | Inventado y **~18 % por debajo** del dato publicado. No usar en ninguna cuenta real |
| **Inflación en el presupuesto** | 2,4 % mensual (obras p1, p2 y p4) y 2,6 % (p3) | IPC de agosto 2026: 1,7 % mensual y 33,5 % interanual [fuente externa, INDEC] | Inventado y **por encima** del último dato. El escenario "cobertura" sobreestima el ajuste |
| Parámetros del presupuesto | 22–30 h de mano de obra por tablero, ARS 20.000–21.500 por hora, extras 5–6 %, contingencia 4–5 %, margen 20–24 %, validez 7–10 días | Margen de tableristas en EE. UU.: 15–25 % estándar y 35–50 % a medida [fuente externa, blog]; no hay dato argentino (`research/05 §5`) | Inventado. ARS 21.500/h ≈ USD 17 al TC ficticio: cae dentro del rango **supuesto** de USD 15–30 de `research/05 §3.2`, que tampoco está verificado |
| Escenario "Competitivo" | −4 puntos de margen | — | Inventado |
| Plan del ingeniero | "Estudio": USD 150/mes, 40 tableros incluidos, USD 2,5 por tablero extra; facturas F-0007/F-0008 | Coincide con la hipótesis H-M1 (`research/05 §3.3`: USD 60/150/400, excedente USD 1,5–3) [estimación] | **Hipótesis mostrada como si fuera un hecho.** No hay precio validado (V1) |
| Plan del distribuidor | "Distribuidor": USD 120/mes, USD 4 por lead, 5 leads gratis | H-M3: USD 100–300/mes o USD 2–10 por RFQ [estimación] | Hipótesis; la comisión nunca se preguntó (V2) |
| Presupuesto de IA | USD 40/mes, alerta al 80 %, tope estricto | — | Inventado |
| Ledger de IA | Detección de TGBT USD 1,02; TS-PB 0,74; TS-P tipo 0,61; TDE 0,88; lectura de BOM 0,04; asistente 0,09 | Medido: USD 1,02 por plano de 221 cajas, ~0,73 por plano medio y ~0,041 por lectura de BOM de un plano (`research/04 §4`) | 1,02 y 0,04 están **anclados en mediciones**; el resto es inventado. El "asistente" no existe |
| Regla de aprobación | Adjudicación > ARS 30.000.000 → aprueba Dirección | — | Inventado |
| Empresa, personas, distribuidores y obras | Tableros Andes SRL, Distribuidora Sur Eléctrica, Clínica San Martín, etc.; CUIT `30-00000000-0`; dominios `.example` | — | Ficticio. Cualquier parecido con empresas reales es casual |
| Detección, lectura IA y tiempos de proceso | Simulados (`L.sim()`, `L.tick()` cada 1 s) | Tiempos reales: mediana de 14 s por plano en la ubicación, ~80 s un plano medio completo (`research/04 §4`) | Simulado; el prototipo es **más rápido** que la realidad |

## 2. Supuestos de la estrategia

| Supuesto | Dónde se usa | Qué lo falsaría |
| --- | --- | --- |
| El segmento A (conteo) paga antes que el B | `01 §3` | V1: ninguna empresa del segmento A se compromete; el B sí |
| USD 1–3,5 por tablero como techo de precio por valor | `01 §4` | V1. Sale de las horas de EMEVE [entrevista] y de un costo de ingeniero de USD 15–30/h y un ahorro del 60–75 %, que son **supuestos** (`research/05 §3.2`) |
| El margen bruto por tablero es fino con ~USD 1 de IA | `01 §4` | El ledger real de O-09 |
| Los distribuidores prefieren suscripción o tarifa por RFQ antes que una comisión | `01 §4`, `02` | V2 |
| La comisión > 1–2 % del GMV se come la mitad del margen del distribuidor | `01 §4` | El margen neto de ~3 % es de EE. UU. y Europa (Wesco, Rexel, NAED) [fuente externa]; **el margen argentino no se conoce** |
| La oferta editable (O-06) captura la mayor parte del valor de la RFQ | `02`, `03` | V7 |
| El 3D no aporta en la etapa de cotización | `02` | ≥ 2 de 5 pilotos lo piden sin sugerirlo |
| El catálogo canónico se puede reusar en LatAm IEC | `01 §7` | Diferencias de denominación o de gamas por país que obliguen a rehacer tipos |
| 300 a 1.500 tableristas en Argentina | Tamaño de la cabeza de playa | Es una estimación sin censo (`research/05 §1.2`) |
| Esfuerzos S/M/L y factibilidad del backlog | `02` | Estimaciones de lectura de código, sin ejecutar nada |
| Umbrales de salida (−60 % de tiempo, ≤ 1 faltante con precio, 90/80 % de líneas aceptadas, < 30 min de respuesta, ≥ 40 % pagaría por FX) | `01 §6`, `03 §3` y §6 | Son **propuestas** tomadas de `research/05 §4`; hay que acordarlas con los pilotos (V4) |

## 3. Lo que no está verificado

- **El deploy.** No hay ninguna instancia pública (R1). Ninguna afirmación sobre "usuarios" es válida hasta #985.
- **El acierto del matching de punta a punta** sobre datos reales: no está medido (R4). Las lecturas IA del 98,6 % y el
  97,5 % son sobre casos sintéticos escritos por Claude.
- **El caso Fundaleu** (4 h → 17 min): el listado manual no está en el repo y no se confirmó que los 8 tableros del repo sean
  los de la demo (`research/01 §8.4`).
- El costo de D1 "USD 0,1–0,2 por tablero" no tiene moneda aclarada, y la cifra `EZE4077 US$ 0,66` no se leyó completa
  (`research/01 §8.6`).
- El contacto con Eaton (RM §Sprint 4.12): no hay evidencia en el repo.
- El tamaño del mercado argentino de tableros y de distribución eléctrica, los márgenes locales y el costo por hora de un
  ingeniero (`research/05 §5`).
- La precisión, el precio y la presencia en LatAm de Switchonomy y OpenDrawing.
- La licencia y el costo de un conversor DWG (O-18): no se investigaron.
- El rol de CADIME y la relación LIARD–Marcelo–Adrián–CADIME (`research/01 §3`).
- El contenido del North Star y de los OKRs "definidos" en el Sprint 3: no están escritos en ningún lado.
- **Este documento no ejecutó nada**: ni tests, ni docker, ni el detector. El diagrama mermaid de `03-roadmap.md` no se
  renderizó para verificarlo.

---

## Resumen (~300 palabras)

liard tiene construido en `dev` el circuito completo: plano DXF o PDF → BOM revisado → componente base → cotización por
igualdad contra los catálogos de los distribuidores → pedido por proveedor. Pero **no está desplegado**: el Roadmap dice
que se desplegó para 5 usuarios, y #985 sigue con todas las casillas sin marcar. Tampoco está medido de punta a punta sobre
datos reales. Por eso el próximo paso no es construir más, sino poner lo que ya existe frente a usuarios reales.

Las mediciones por etapa son buenas: 97,3–99,4 % de aparatos ubicados, 51–52 de 56 bien clasificados y alrededor de
USD 1 de IA por plano [medido]. Falta el número que importa para vender, que es cuántas líneas terminan con la oferta
correcta, y falta saber cuánto pagaría alguien: nunca se preguntó. La "suscripción + comisión por lead" del Sprint 5 es
una hipótesis, y con distribuidores que viven con ~3 % de margen neto [fuente externa] una comisión sobre el pedido es
frágil.

El valor defendible está en la cadena completa y en el catálogo canónico multimarca, no en detectar símbolos. Los
distribuidores quieren un BOM ya interpretado y confirmar precio, stock y plazo, cosa que hoy no pueden hacer. Esa
brecha (O-06) es la más importante del lado comercial.

**H1**: deploy, confidencialidad de los catálogos, email, plazos, medición, tope de IA, cobertura de componentes y oferta
editable, con 5 empresas del segmento A y 3 distribuidores. **H2**: RFQ, adjudicación persistente, historial de precios,
reglas de accesorios y presupuesto con FX (se suma el segmento B) y cobro según la validación. **H3**: LatAm IEC y datos,
solo si se cumplen las condiciones de `01 §7`. Tanto el prototipo como los precios, tipos de cambio y tarifas que muestra
son ficticios.

## 5 decisiones que hay que tomar ahora

1. **Corregir el Roadmap** (R1) y terminar #985 antes de abrir cualquier trabajo nuevo del Sprint 5.
2. **Reemplazar "pagos" del Sprint 5 por V1 y V2**, con facturación manual en el piloto.
3. **Agregar O-23 (confidencialidad) como bloqueante** para sumar el primer distribuidor real.
4. **Priorizar la oferta editable (O-06) por delante de la RFQ completa (O-07)** y validarla primero con el prototipo (V7).
5. **Fijar con los pilotos el umbral de precisión (V4)** y publicar la medición de punta a punta (O-04) antes de prometer
   "precisión" en cualquier material comercial.
