# 01 — Producto LIARD: lo que dice la documentación

Fuente: repo `lab3-liard`, rama `dev`, commit `04fc8139` (solo lectura). Citas como `archivo §sección`. Abreviaturas: **VIS** = `documentacion/Documento de Visión - LIARD.md`, **DISC** = `documentacion/Entrevistas de discovery.md`, **RM** = `documentacion/Roadmap.md`, **ARQ** = `documentacion/Arquitectura Liard.md`, **D1/D2/D3** = `documentacion/demo-{1,2,3}-sprint-{1,2,3}.md`, **PL** = `documentacion/planos.md`, **SIM** = `documentacion/simbolos-tableros-electricos.md`, **TONO** = `docs/ui-tono-y-mensajes.md`.

Distinción que conviene mantener (la hace DISC §intro): **evidencia directa** (lo dijo un entrevistado), **definición de producto** (decisión del equipo) y **derivación** (cruce de fuentes). Muchos números "de éxito" son del segundo tipo.

---

## 1. Visión, problema, propuesta de valor, objetivos y criterios de éxito

**Problema.** Empresas como Liard reciben planos de terceros en DWG hechos "a mano", sin AutoCAD Electrical: figuras geométricas y texto sueltos, sin bloques/componentes estandarizados; no se les puede imponer un estándar porque el cliente no quiere gastar tiempo (VIS §1.1; D1 §5 "No se pueden pedir planos bien hechos"). Por eso el conteo lo hacen ingenieros a mano para armar el BOM.

**Números del problema (VIS §1.1, D1 §3):**
- La cotización de tableros es ~10 % de todo el proyecto.
- Tablero chico ≈ 30 min; tablero grande ≥ 1 día. Edificio sencillo ≈ 40 tableros. Cada tablero se revisa ≥ 2 veces (con supervisor).
- Equipo de cotización de Liard: 2 presupuestadores full-time, 3 apoyos part-time en picos, 2 de compras, Daniel García revisando por muestreo.
- Costo mensual visible: **$5M–$6.6M/mes** base; **$6.5M–$9.3M/mes** con part-time (ARS; D1 lo redondea a "~ARS 6 millones").
- Tamaños de proyecto (VIS §Glosario): chico 5–10 tableros, mediano 10–40, grande 40–50 en edificio sencillo y >100 en propiedad horizontal compleja (hospitales, edificios).
- Liard no puede asumir más obras: tendría capacidad de cotizar y fabricar tableros, pero son solo parte de la obra y no tiene recursos para cotizar/gestionar el total (VIS §1.1).

**Propuesta de valor.** Dos piezas, en este orden de prioridad (VIS §4.2):
1. **Herramienta contadora** DWG/DXF → BOM, con "automatización asistida con validación humana": la tecnología resuelve lo de alta certeza y deriva lo ambiguo (VIS §2.1). Lema de demos: "Del plano al BOM en segundos. Y del BOM al proveedor." (D1 §14, D2 §7, D3 §10). D1 §8: *Detecta → Cuenta → Avisa*.
2. **Marketplace** empresas ↔ proveedores: el BOM se cotiza con **precios de referencia** de proveedores adheridos; el proveedor **confirma o ajusta** precio, stock y plazo al responder; cierre comercial, pago y flete quedan fuera (VIS §1.1 "Acuerdos Comerciales", §2.2). Nueva unidad de negocio separada de Liard (VIS §1.1, §1.2).
- Premisa de mercado: los proveedores eléctricos "facturan menos de la mitad que en 2023" y estarían dispuestos a sumarse; pero en entrevistas valoraron tanto o más la eficiencia/orden/comunicación que el volumen (VIS §1.1).
- Oportunidad: mejora acotada por proyecto pero replicable en N empresas (VIS §1.2). Inversores/sponsors: Marcelo Glorioso (presidente de Liard) y Adrián Gutman (vicepresidente de CADIME) (VIS §1.2).
- DISC §"El problema" reformula: no es un problema sino tres conectados — interpretar plano → BOM; BOM → productos comerciales de catálogos; conectar con proveedores y comparar. Flujo real: *plano → interpretación → conteo → completar lo faltante → BOM → equivalencias por marca → accesorios derivados → costeo → stock/precio/proveedores → comparación → cotización*.

**Objetivos (VIS §1.3):** herramienta que cuente y distinga componentes y notifique lo no identificado; reducir costo y tiempo de conteo; facilitar encontrar un proveedor que venda todo el BOM; unidad de negocio rentable.

**Criterios de éxito (VIS §1.3)** — *solo validados por documentación, no por entrevistas* (DISC §Estado de la evidencia):
- Tableros simples: BOM del software **igual** al del ingeniero.
- Tableros complejos: precisión **≥ 90 %**, avisando qué no pudo identificar.
- Tiempo de análisis **90 % menor** que el de un ingeniero.
- Costo significativamente menor que contratar técnicos; cotizaciones usan bien los catálogos; ROI positivo futuro.

**Mediciones reportadas:**
- D1 §12 (Sprint 1): tablero chico ~1 min, "eficacia" ~95 %, costo $0,1–0,2 por tablero (moneda no aclarada).
- D3 §6–8 (Sprint 3, caso real **Fundaleu**, planta baja): 8 tableros DXF, 31 tipos de material, 394 unidades, conteo manual del técnico del cliente = **4 h**. Antes del sprint: 10 min, precisión 68 %, problema "componentes fantasma". Después: **17 min, detección 90 %, precisión 100 %** (lo no detectado = lo que el detector aún no aprendió).
- RM §Sprint 4.6: PDF detecta 2–3 % menos componentes que el mismo plano en DXF; filtrado de planos grandes bajó de ~10 min a <30 s.
- ARQ §Interfaces: ~121 llamadas a Claude por plano; límite 1.000 req/min con Opus 5.5 ≈ 8 planos/min; desde ~8 usuarios hace falta tier Scale.

## 2. Alcance, exclusiones, riesgos, stakeholders

**Escenarios de alcance (VIS §3):** si los proveedores se integran → marketplace + herramienta; si no → solo herramienta de conteo. Por eso se empezó por el conteo.

**Release inicial / MVP (VIS §3.1):** detectar un set inicial de símbolos frecuentes y asociar especificación cuando haya certeza; lista preliminar para cotizar; validación manual de lo ambiguo; export CSV; base para integrar cotizaciones.

**Releases siguientes (VIS §3.2):** nuevos símbolos/reglas; normalizar nombres de materiales; probar en Liard y luego ofrecer a competidores; solicitudes de cotización desde la plataforma; modelo comercializable; catálogos/listas de precios en marketplace.

**Exclusiones explícitas (VIS §3.3):** planos sin mínimo de convenciones; simbologías/especificaciones inconsistentes sin reglas posibles; bocetos a mano y escaneos malos; **cálculos eléctricos de ingeniería** (caída de tensión, cortocircuito, equilibrio de fases, dimensionamiento de conductores y protecciones); **automatización total sin humano**. También fuera: **pagos** y **fletes** (VIS §1.1 "Cosas a largo plazo", §2.3; ARQ §Marketplace "Sistema de pagos: Fuera del alcance"; Mercado Pago descartado, ARQ §Resumen de decisiones). Sin privilegio de administrador (README §Sembrar datos).

**Suposiciones (VIS §2.3):** los planos no están estandarizados pero conservan estructura mínima; los proveedores tienen interés; el pago se arregla afuera (el proveedor pasa sus datos bancarios). **Dependencias:** planos reales, catálogos actualizados, usuario capaz de identificar símbolos.

**Ambiente operativo (VIS §4.3):** información confidencial, entorno controlado; horario laboral 6–20 h; proceso manual como respaldo al principio.

**Riesgos (VIS §1.5):**
- Técnicos (contador): falta de estandarización; ambigüedad de símbolos/textos; calidad de archivos; complejidad CAD (capas, superposición); confidencialidad; especificaciones incompletas ("interruptor tetrapolar de 250 A" admite muchas referencias).
- Operativos: muchos casos ambiguos; **desconfianza hacia la IA** (el rubro ya probó IA generalista con alucinaciones); error en la revisión manual; adopción.
- Comerciales: herramienta demasiado cara.
- Marketplace — técnicos: mantener la lista de materiales; falla en la devolución del presupuesto. Operativos: uso del contador sin cerrar cotización (se cobraría el uso pasado un rate). Comerciales: atraer proveedores; que no acepten **comisión**; que competidores desconfíen de una plataforma cuyos dueños vienen de Liard.

**Stakeholders (VIS §4.1):**
| Stakeholder | Rol |
| --- | --- |
| Dueño/inversores (Glorioso, Gutman) | Financian, definen prioridades, validan valor |
| Empresas de ingeniería tipo Liard | Usuarios directos (`ENGINEER`) |
| Proveedores de materiales (Schneider, distribuidores) | Usuarios secundarios (`SUPPLIER`): catálogos y respuesta con precio/stock/plazo |
| Clientes finales (hospitales, industrias) | Indirectos; no usan el sistema |

Además: Daniel García (revisor en Liard, VIS §1.1); **Eaton**, "primer cliente de Marcelo", destinatario de un video demo (RM §Sprint 4.12); demo en vivo en oficinas de Liard; deploy demo para **5 primeros usuarios** (RM §Sprint 4.11).

## 3. Discovery: empresas y proveedores

**Empresas tipo Liard (DISC §Empresas como LIARD):**

| Empresa (entrevistado) | Proceso / volumen | Dolor y pedido | Implicancia |
| --- | --- | --- | --- |
| **EMEVE** (Maximiliano Vergara; PyME, fundada 2020) | Planos casi siempre AutoCAD; PDF vectorizado lo convierten; peor caso "planilla de carga"; 1 persona dedicada al conteo; pide precio a 2–3 proveedores | Obra de ~40 tableros ≈ **1,5 días** solo de conteo; tablero complejo ≈ 1 día. Símbolos cambian de forma/tamaño/orientación. "Zona gris": inferir gabinete, ventilación, canaletas, riel DIN, cables, terminales, numeradores, borneras. Probaron IA: errores y alucinaciones. Ya tienen reglas: térmica 2P 16 A → 3 alternativas de marca + cable + terminales + numeradores + accesorios | IA + reglas + revisión humana; distinguir **detectado / inferido por regla / agregado a mano**; aprender de correcciones |
| **Meco / Mehcco** (Diego Delfino; ~35 años) | Integrador **ABB**; recibe specs con códigos Schneider y las convierte. Conteo a mano; software ABB para tableros protocolizados. **35–40 presupuestos/semana**, 1 responsable + 4 técnicos; uno grande hasta 2 semanas | Especificaciones incompletas (250 A tetrapolar → muchas referencias). Propuso **reglas por empresa** para lo que falta. Valor del marketplace: listado, valorización, varios proveedores, alternativas sin stock | Equivalencias entre fabricantes (concepto → atributos → familia → SKU), reglas configurables |
| **GRAMONT** (David Igarzabal) | PDF, DXF, DWG, AutoCAD y **EPLAN**; IEC 61439-1/-2, Golden Rules Schneider, EcoXpert. Herramientas propias + IA paga entrenada. ~**300 cotizaciones/año**, responden ~95 %, convierten **10–15 %** | **El conteo no es el problema**: lo es el costeo y la personalización | Segmento B: valen más matching, costeo, actualización de precios, comparación |
| **César Braña** | **11 personas cotizando** a diario; también TGBT, BT/MT, variación de velocidad | Unifilares poco detallados; proyecto complejo hasta 2 días | Aceptar planos incompletos; no reemplazar criterio técnico (elegir marca es parte del trabajo) |

**Proveedores (DISC §Proveedores y distribuidores):**

| Proveedor (entrevistado) | Sistemas | Lo que dijo |
| --- | --- | --- |
| **Electro HCM** (Gustavo; proveedor + armador) | SAP + sistemas del sector; pedidos por SAP, portales, email, WhatsApp, visitas | **No quieren contar desde el plano**: quieren el BOM ya contado y especificado. Marcas: Schneider, Siemens, ABB, CHINT, SICA, Genrod. Re-cotizaciones de hace 2 años → precios actualizables rápido |
| **Q Electric** (Gonzalo Rivas) | EBASE/Electrobase; fabricantes aún mandan Excel+email; descuentos por email | Interés en **eficiencia, orden, comunicación**, no necesariamente volumen. Pidieron: con quién trabaja cada empresa, señales de confianza, distribuidores por zona, alcance acotado a consultas y cotizaciones. **Rechazo explícito a manejar pagos.** Email como canal formal (trazabilidad). Precio de plataforma = solo referencia |
| **Nisamat Group** (Agustina Vázquez) | Electrobase → migrando a Odoo; ~**100.000 productos** | Schneider en proporción muy alta de tableros. Descuentos dinámicos (volumen, convenio, historial, forma de pago 30/60/90). "Idioma del tablerista": "térmica" = interruptor termomagnético; equivocarse es un problema técnico serio. Stock: hasta 3 meses de demora. Responden en **2–3 h**; **15–20 presupuestos/día por vendedor**; precio no siempre decide (cumplimiento, confianza, disponibilidad) |

Adicional (docs/price-service): `informe_bom_cadime.md` — reuniones con Adrián (CADIME): ~**700.000 componentes distintos** en el mercado argentino; interruptores de luz ≈ 15 fábricas × 3 niveles = 45 coincidencias para una consulta genérica; API del proveedor en Zoho CRM, en desarrollo, sync diaria 23:00, búsqueda limitada a 5 palabras. `reunion1.md`: la API agrupa toda la especificación en un único campo de descripción, tiene millones de registros; no es viable traer el catálogo completo; el ID único del proveedor es la clave del match validado. (Hoy la integración por API **no se construyó**; se reemplazó por carga Excel + lectura IA, ARQ §Marketplace.)

**Segmentos (DISC §Segmentos):** A — alta necesidad de conteo (LIARD, EMEVE, Meco); B — procesos maduros (GRAMONT); C — proveedores (HCM, Q Electric, Nisamat).

**Principios de diseño (DISC §Principios):** no asumir planos estandarizados; no asumir 100 % automático; un nombre no identifica un producto; precio de catálogo ≠ precio final; el proveedor no quiere interpretar el plano; stock y plazo pesan como el precio; equivalencias de marca son centrales; **no ocultar lo que no tiene match**; el criterio del ingeniero debería volverse reglas de a poco.

**Comparación de ofertas debe mostrar (DISC §Qué debería mostrar):** proveedor, SKU, marca, precio, stock, plazo, fecha de actualización (alta); condición comercial (media/alta); observaciones (media).

**Hallazgos no incorporados a ningún plan (DISC §Qué ya recoge el producto):** accesorios derivados por regla (EMEVE), reglas por empresa para completar faltantes (Meco), aprender de correcciones, proveedores por zona y señales de confianza (Q Electric), entrada por PDF/planillas/EPLAN (PDF ya se agregó en Sprint 4, RM §4.6).

**Disposición a pagar / monetización — ABIERTO, SIN VALIDAR.** DISC §Estado de la evidencia: *sin validar* monetización, comisión, pricing, rol de CADIME, adopción por competidores de Liard, integración real con ERPs y **disposición a pagar**. DISC §Pendientes: el Roadmap presenta suscripción + comisión por lead como plan del Sprint 5, pero **las entrevistas no preguntaron ni cuánto pagarían las empresas ni si los proveedores aceptarían comisión**. Hipótesis a validar (DISC §Hipótesis): cuánto pagarían; suscripción vs pago por plano vs híbrido; comisión a proveedores; precisión mínima que genera confianza; valor del marketplace frente a procesos existentes; integraciones imprescindibles y datos de precio/stock que compartirían; peso de la confidencialidad y del miedo competitivo; rol de CADIME. Preguntas abiertas alrededor de Marcelo (DISC §Antecedentes): rentabilidad directa vs eficiencia del ecosistema, quién opera el marketplace, relación LIARD–Marcelo–Adrián–CADIME, cómo independizar el producto de Liard. No hay entrevista individual con Adrián Gutman.

**Validado por entrevistas:** conteo manual consume tiempo; planos heterogéneos; interpretación humana necesaria; valor en automatizar; proveedores con varios sistemas; precio y stock cambian; descuentos dinámicos; interés en centralizar pedidos de presupuesto; pagos no prioritarios; equivalencias de marca relevantes. RM §Sprint 3 Discovery agrega: empresas validaron utilidad; proveedores dispuestos a usarla para llegar a nuevos sectores.

**Métricas sugeridas (DISC §Métricas):** técnicas (precisión/recall, % símbolos desconocidos, % BOM corregido, tiempo de revisión); operativas (tiempo antes/después, tableros/h, presupuestos/persona, retrabajos); comerciales (RFQs, proveedores por RFQ, tasa y tiempo de respuesta, tasa de selección, dispersión entre ofertas). RM §Sprint 3 menciona que se definieron visión, misión, North Star y OKRs, pero su contenido **no está** en los documentos leídos.

## 4. Sprints 1–4 entregados y Sprint 5 planificado (RM, D1–D3)

- **Sprint 1 — investigación y primera versión.** Feature matching (ORB/SIFT), LLM con visión (Claude y GPT), YOLO; DWG→DXF, extracción de entidades, primer BOM, benchmark YOLO multi vs single clase; base NestJS+Prisma+Postgres, React, FastAPI, Docker. Resultado: app web para crear proyectos, subir tabla de referencia + planos, detectar con Claude y generar BOM (RM §Sprint 1; D1 §10).
- **Sprint 2 — BOM y primer catálogo.** Matching con catálogo de **CADIME** (TSV) y primera cotización; visor de planos en la app; separar un DXF con varios planos en archivos individuales; BOM consolidado + export Excel/CSV; entrenamiento YOLO sobre 9 tipos (termomagnética, diferencial, ojo de buey, seccionador bajo carga, interruptor motorizado y temporizado, TTA, grupo electrógeno, multimedidor) y 4 arquitecturas YOLO+Claude; resolución manual de no identificados; gestión de proyectos (RM §Sprint 2; D2 §4).
- **Sprint 3 — circuito de dos lados.** Carga de catálogo Excel en asistente de 3 pasos; usuarios y roles (ingeniería vs proveedor, landing, registro, recuperación, onboarding por rol, datos por dueño); editor de BOM; cotización comparativa con adjudicación por ítem y **órdenes de compra por proveedor**; pedidos enviados/recibidos (el proveedor acepta/rechaza; el contacto del comprador se revela al confirmar); cola de procesamiento en segundo plano; recorte de varios tableros en un DXF y de la tabla de referencia; ubicación de no identificados sobre el visor y resolución en lote; modo revisión; Cypress + review automático con Claude (RM §Sprint 3; D3 §3–4).
- **Sprint 4 — deploy y matching estructurado.** Catálogo base (canónico) de componentes; IA (Haiku) que vincula cada fila del catálogo del proveedor, en vivo con costo y ETA, bandeja de estandarización; lectura del BOM con IA; **matching por componente base + atributos esenciales** (set de prueba: 67 materiales, cientos de variantes, series Schneider/ABB/Siemens); marca separada del proveedor, gamas, preferencias/exclusiones por cuenta o proyecto, opción "optimizar por costo"; pipeline de detección en 2 etapas (YOLO dónde, Claude qué), tabla de referencia opcional, familias fijas de aparatos; **carga de PDF**; ver y corregir componentes sobre el plano desde la fila del BOM; **multiplicador de planos** (tablero tipo repetido por piso); rediseño visual, cuenta de usuario; export distingue cantidad dibujada vs a comprar; 142 tests e2e; deploy demo a 5 usuarios; arquitectura AWS elegida frente a GCP/Azure; demo en Liard; video para Eaton (RM §Sprint 4).
- **Sprint 5 — plan.** Extender deploy (serverless) a más usuarios de los dos perfiles; matching para todos los tipos de componente; **BOM alternativo** y cómo lo resuelve el proveedor; **pagos = definir ingresos: suscripción a la herramienta + comisión al proveedor por lead** (cada solicitud recibida); control de gasto de IA por usuario con límites; notificaciones por email a ambos lados; observabilidad; evaluar DWG sin convertir a DXF; iterar detección y ampliar dataset (RM §Sprint 5).

## 5. Cómo se ven los planos reales (para el prototipo de visualización 3D / plano)

Fuente: los 14 PNG de `documentacion/planos/` (render del `PlanRenderer` del detector, ezdxf+matplotlib, B/N con texto; PL §intro) y PL §§por plano. Dos proyectos, distinguibles por su biblioteca de bloques, no por rótulo (PL §Los dos proyectos): **OCJ** (edificio con subsuelo, TGBT y grupo electrógeno; bloques cuyo nombre dice el tipo; spec corta junto al símbolo `2x25A`, `30mA`) y **Fundaleu** (cliente real; bloques `TM-DIN`, `COND-3P-N`, `PLANILLA-UNI`, `BORNES`; spec en varias líneas con etiqueta `Q1`, `10A`, `Curva C`, `10kA`).

**Gramática visual común (observada en los PNG):**
- Son **esquemas unifilares**, no planos de planta ni vistas frontales del gabinete. Arriba entra la **acometida** (flecha o triángulo) con texto vertical del cable (`LSOH 4x10mm+PE`, `BAND. PORTAC.`) y origen (`DE TSSA/N`, `DE ALIM. DESDE TGBT`).
- El **tablero es un rectángulo punteado** con el nombre arriba a la izquierda en letra grande (`TSCELS-1 (ESTAC. PLANTA SUB-SUELO)`, `TSA-CT TABLERO SERV. AUX. CT`, `TDE TABLERO DISTRIBUCIÓN EMERGENCIA`) y a veces un número en círculo.
- Debajo del interruptor general corre una **barra horizontal** (juego de barras) con texto técnico (`BARRA NORMAL 3x380/220VCA - 50Hz, 4 Cu (R/S/T/N), 1 Cu (PAT)`; en TGBT `In=1500A` normal e `In=1000A` emergencia). Desde la barra bajan **ramas verticales** en árbol: general → diferencial → grupo de 2–3 termomagnéticas por diferencial → salida. Fases rotuladas R/S/T.
- **Símbolos**: línea inclinada = contacto; ganchito = térmica; `x` arriba = interruptor; óvalo/toroide alrededor de la línea = diferencial; tres barras oblicuas = cantidad de polos; círculo con `M` = motorizado; cuadro con `IM` = multimedidor; círculo `GE` = grupo electrógeno; cuadro `TTAB` = transferencia automática; `⊗` = lámpara/indicación luminosa; cuadrado con diagonal = bobina de contactor. Cada símbolo lleva su spec como texto al lado, a veces rotado 90°.
- Al pie, en Fundaleu, una **planilla de circuitos** (tabla): fila por atributo (Circuito Nº, Interruptor `TM C-60 2x10A`, Potencia kW, Fases, Cable formación/tipo `2x1,5+T LS0H`) y una columna por circuito, con "FUNCIÓN / DESTINO" en texto vertical (`ALIMENTACIÓN ILUMINACIÓN GENERAL SUBSUELO`, `RESERVA SIN EQUIPAR`). En OCJ/TGBT, los destinos van al pie de cada salida (`T.S. 3ºPISO NORMAL`).
- Estética: trazo fino gris, líneas punteadas para mando/señal, mucho espacio blanco, tipografía CAD sans-serif en mayúsculas.

**Por plano (densidad):**
| Plano | Tamaño | Aspecto | Qué se ve |
| --- | --- | --- | --- |
| TSCELS-1 (OCJ) | Chico, 10 aparatos, 1400×1030 | Árbol limpio de 3 niveles | General 4x40A, 3 diferenciales, 6 térmicas 2x10A/2x16A; PAT a tierra. "Caso fácil" (PL §TSCELS-1) |
| test5 (OCJ) | Mediano, 32 | Ancho, repetitivo | Alimentado del TGBT barra emergencia; UPS 8 kVA, descargador, general 4x50A, 5 diferenciales 2x40A 30mA con 3 térmicas c/u. Único con ground truth: **22 ITM, 8 diferenciales, 1 seccionador, 1 ojo de buey** (PL §test5) |
| TGBT (OCJ) | Grande, 901 entidades, 476×141 u | **Muy ancho y bajo** (≈3,4:1); texto diminuto a escala | Dos mitades: barra normal (S1, motorizado 4x1250A 50kA, IM, indicación R-S-T) con ~15 salidas 4x100–400A y barra emergencia (S2 4x800A, TTAB, GE 630 kVA) con ~15 salidas; acoplamiento S3; cables en texto vertical; destinos a pie |
| TSA-CT (Fundaleu) | Chico, 18, 900×1973 | **Vertical** | Compact INS 40A, diferencial 25A 30mA `DD1`, Q1 10A Curva C 10kA + 2 reservas `RES`, borneras X2, planilla al pie |
| TDE (Fundaleu) | Mediano, 37, 1600×1424 | Casi cuadrado, tablero de potencia | Dos GE 313 kVA arriba en recuadros punteados (TGE-1/2, COMAP), interruptores caja moldeada `630A NSX630F Micrologic 5.3E 36kA`, acoplamiento IAC, **grilla de accesorios** `BA/BC/MO/U</NCx2/NAx2` junto a cada interruptor (son opciones del interruptor, no aparatos sueltos), TI `630/5A x3`, multimedidores PM5100, descargador 3P+N, salida "A BMS Y PLC EN TGBT" |
| TS-SS (Fundaleu) | Grande, 363, 5128×1042 | **Extremadamente alargado (5:1)**, decenas de columnas casi iguales | Tres barras (emergencia, normal con contactor kC 115A, estabilizada desde TS-UPS-S); por circuito: diferencial `DD#` 25A 30mA → térmica `Q#` 10A Curva C 10kA → selector `M 0 A` (control de iluminación SCI) → contactor `K#` 12A AC3 → borne X2 → columna de planilla; nota de texto sobre diferenciales súper inmunizados |

**Dificultades que la visualización debería reflejar (PL):** repetición densa de aparatos iguales (test5, TS-SS); proporciones extremas (TGBT 9,6 px/unidad vs ~70 del resto → texto chico); spec partida en varias líneas y cable en texto vertical lejos del símbolo; mezcla de cosas que se compran (térmicas, diferenciales, contactores) con cosas que no se cuentan igual (bornes, selectores, etiquetas); accesorios como grilla de texto. Detección: bboxes normalizadas a 2 decimales que incluyen el texto de spec, solo para revisión humana, nunca para mapeo CAD (CLAUDE.md §Gotchas).

**Implicancia para un prototipo 3D de tablero (derivación):** el plano **no trae geometría física** del gabinete (ni tamaño, ni disposición en riel, ni ventilación): EMEVE lo llama "zona gris" que el ingeniero infiere (DISC §EMEVE). Un 3D del tablero sería **inferido** desde el BOM (tipo, polos, amperaje → ancho en módulos DIN), no leído del plano; y dimensionar gabinetes roza la exclusión de "cálculos de ingeniería" (VIS §3.3). Lo que sí es fiel al plano es una vista 2D del unifilar con árbol barra→ramas y la planilla al pie.

## 6. Glosario y símbolos

- **Unifilar**: esquema de una línea que representa todas las fases. **BOM**: lista de materiales. **Tabla de referencia**: leyenda de símbolos del proyecto (opcional desde Sprint 4).
- **TGBT**: Tablero General de Baja Tensión (ocj-tgbt: "TABLERO GENERAL DE BAJA TENSION (SUB SUELO)"). **TDE**: Tablero de Distribución de Emergencia (PL §TDE). **TS / T.S.**: tablero seccional (TS-SS "Tablero seccional subsuelo"; salidas `T.S. 1ºPISO`). **TSA-CT**: tablero de servicios auxiliares CT. **TTAB/TTA**: tablero de transferencia automática. **GE**: grupo electrógeno. **IM**: multimedidor. **ITM**: interruptor termomagnético ("térmica"). **PAT**: puesta a tierra. **LSOH/LS0H**: cable libre de halógenos. **Curva C / 10kA**: curva de disparo / poder de corte. **AC3**: categoría de uso de contactor. **BA/BC/MO/U</NC/NA**: bobina de apertura, de cierre, motorización, mínima tensión, contactos auxiliares NC/NA.
- **Catálogo QElectroTech (SIM):** 399 símbolos en 35 subcategorías, filtrados de 941 de la sección `10_electric/10_allpole` (descargado 29/9/2026): protecciones, contactores/relés, transformadores y fuentes, TI, señalización y mando, medición, PLC, bornes. Excluye motores, cables, sensores de campo, luminarias, etc. **Licencia CC-BY 3.0**: se puede consultar y redistribuir citando "© colaboradores de QElectroTech"; la versión inglesa del `ELEMENTS.LICENSE` **prohíbe usarlos para construir modelos de ML** → **nunca** como dataset de entrenamiento ni para datos sintéticos (SIM §Licencia; CLAUDE.md §Product documentation). Las marcas rojas/azules de las láminas son bornes y no aparecen en AutoCAD; muchas entradas repiten nombre (9 "Dispositivo diferencial residual") porque son la misma función con distinto nº de polos o estilo — "esas son justamente las variantes"; varios nombres en español son traducciones comunitarias poco usadas en Argentina ("disyuntor" por térmica, "clema" por borne) (SIM §Cómo leerlo).
- **Láminas vistas (10):** termomagnéticos GV (10, bloques con `I>` por polo, 1P+N a 4P, mando manual/rotativo/palanca); diferenciales (21, toroide óvalo atravesado por 2–4 polos, o bloque `ID`/`IΔ`); seccionadores (9); contactos de potencia (11, 1–4 polos, NC); TI (8, toroide 1–4 polos); señalización óptica (12, `⊗` con color); medidores (31: A, V, Hz, kWh, Wh, varh, h); bornes (16); bobinas (28, rectángulo A1/A2 con marca lateral por tipo); protecciones de sobretensión (8). **Contraste clave:** QElectroTech dibuja estilo IEC/multifilar con bornes numerados (1-3-5 / 2-4-6), mientras los planos reales son unifilares con símbolo mínimo + texto; la variación real entre estudios es mayor que entre láminas.

## 7. Tono de UI (TONO)

- Nombre: **liard**, minúsculas, sin sufijo (no "LIARD", no "Liard AI Tool"); descriptor aparte "Gestión de materiales eléctricos"; la marca se dibuja con `BrandLogo`, nunca como texto.
- **Voseo rioplatense** siempre ("Cargá", "Subí", "Probá"). Primera persona plural solo cuando algo falló del lado de la app ("No pudimos cargar los pedidos"); si no, sujeto = usuario u objeto ("El plano quedó procesado").
- Botones dicen lo que va a pasar ("Guardar cambios", "Emitir pedidos"), nunca "Enviar" genérico; el nombre de la acción se mantiene en todo el recorrido ("Emitir pedidos" → "Pedidos emitidos").
- Vacíos explican de dónde salen las cosas y ofrecen el primer paso; vacío por filtros ≠ vacío real.
- **Números: solo los que se pueden sostener**; nada que no salga del sistema o de una fuente citable.
- Referencias: `front/src/components/landing/landing-content.ts`, `front/src/components/order/empty-states/`, `front/src/components/auth/shared/AuthFormAlert.tsx`.
- Strings de usuario y `docs/` en español; identificadores y API en inglés (CLAUDE.md §Gotchas).

## 8. Abierto / a verificar

1. **`docs/producto/` está vacío** (directorio sin archivos, nada versionado). No hay documento de producto más allá de `documentacion/`.
2. **Monetización y disposición a pagar**: no preguntadas en discovery; suscripción + comisión por lead es plan de Sprint 5 sin evidencia (DISC §Pendientes). Riesgo VIS §1.5: proveedores que no acepten comisión.
3. **North Star / OKRs**: RM §Sprint 3 dice que se definieron; no aparecen en ningún documento leído.
4. **Números de éxito** (≥90 %, −90 % tiempo) solo validados por documentación; la medición Fundaleu es un caso (8 tableros) y PL §Qué falta dice que **el listado manual de Fundaleu no está en el repo** y no se confirmó que los 8 tableros del repo sean los de la demo. Ground truth solo para `test5` (y probablemente TGBT ≈ `test4`, no confirmado).
5. D3 §8 reporta **tiempo 17 min** después vs 10 min antes (subió), a contrastar con el criterio de −90 % de tiempo (4 h manual → 17 min ≈ −93 %, cumple para ese caso).
6. Costo D1 "$0,1 a $0,2 por tablero" sin moneda (D1 §12). `docs/investigacion_posibles_soluciones/pdf/README.md` menciona un plano `EZE4077` con "US$ 0,66" en un fragmento que no leí completo: verificar a qué se refiere antes de usarlo. No hay un costo por plano consolidado en la documentación de producto (el control de gasto de IA es tarea del Sprint 5).
7. **Scoping de catálogo**: lecturas del catálogo validan rol, no propiedad — pendiente antes de abrir a proveedores reales (ARQ §Manejo de datos; CLAUDE.md).
8. Rol de CADIME y adopción por competidores de Liard (miedo competitivo): sin validar; sin entrevista con Adrián Gutman.
9. Entradas DWG/EPLAN/planillas de carga: DWG se evalúa en Sprint 5; EPLAN y planillas en ningún plan.
10. Reglas por empresa, accesorios derivados, aprender de correcciones, proveedores por zona y confianza: pedidos del discovery sin plan.
11. `README.md` describe un épico de auth con ramas "en la pila, esperando merge" y dice que `LoginPage` usa store simulado; RM §Sprint 3–4 dice que auth y roles están entregados. El README parece desactualizado — verificar contra el código antes de citarlo.
12. `AGENTS.md` es el mismo contenido que `CLAUDE.md` (difieren solo en el encabezado).

---

## Resumen para decidir (~400 palabras)

LIARD ataca un dolor real y confirmado del lado de la demanda: contar a mano componentes en unifilares no estandarizados. Los números son consistentes entre fuentes — 30 min por tablero chico, 1 día por uno grande, ~40 tableros por edificio, doble revisión, ~ARS 6M/mes en Liard (VIS §1.1); EMEVE tarda 1,5 días en 40 tableros; Meco hace 35–40 presupuestos por semana (DISC). El caso Fundaleu (4 h manuales frente a 17 min, 100 % de precisión sobre lo detectado y 90 % de detección) es la mejor evidencia de producto, pero es un solo proyecto y su ground truth no está en el repo.

La demanda no es homogénea. El segmento A (Liard, EMEVE, Meco) quiere conteo. El segmento B (GRAMONT) ya resolvió el conteo y quiere costeo y matching. Los proveedores (C) **no quieren ver planos**: quieren BOMs estructurados, trazabilidad por email y no quieren pagos en la plataforma. Por eso el valor defendible está en toda la cadena plano → BOM → componente canónico → oferta confirmada, y no en "IA que detecta símbolos" (DISC §Conclusión). El producto ya sigue esa línea: el Sprint 4 cambió el matching por texto por un catálogo canónico con atributos.

La mayor incógnita es comercial, no técnica. Nadie preguntó cuánto pagarían las empresas ni si los proveedores aceptarían una comisión, pero el Sprint 5 da por hecho "suscripción + comisión por lead". Tampoco están validados el rol de CADIME ni si los competidores de Liard adoptarían una plataforma que asocian a Liard. Antes de construir monetización conviene validar precio y modelo, en especial la opción suscripción, pago por plano o híbrido (DISC §Hipótesis).

Hay reglas que el diseño tiene que respetar: siempre revisión humana; nunca inventar un SKU crítico; no ocultar lo que no tiene match; el precio de catálogo es referencia y el proveedor confirma precio, stock y plazo; stock y plazo pesan tanto como el precio; las equivalencias de marca son centrales. En la interfaz: voseo, "liard" en minúsculas y **solo números que se puedan sostener** (TONO).

Para una visualización o un "3D del tablero": los planos reales son unifilares 2D. Tienen una acometida arriba, un recuadro punteado con el nombre, una barra horizontal, ramas verticales en árbol (general → diferencial → térmicas), la especificación como texto junto a cada símbolo y, en Fundaleu, una planilla de circuitos al pie. Las proporciones pueden ser extremas (TS-SS 5:1, TGBT ~3,4:1) y los aparatos iguales se repiten mucho. El plano **no trae la disposición física del gabinete**, así que un 3D sería inferido desde el BOM (módulos DIN por tipo y polos) y tendría que presentarse como aproximación, no como lectura del plano. Además, el dimensionamiento de gabinetes está cerca de la exclusión de "cálculos de ingeniería" (VIS §3.3). Los símbolos de QElectroTech se pueden mostrar citando CC-BY, pero **nunca** se pueden usar para entrenar.
