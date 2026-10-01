# LIARD — investigación de producto para la galería "ciclo completo"

Fuentes, todas en la rama `dev`: `CLAUDE.md`, `documentacion/` (Visión, Entrevistas de discovery, Roadmap, Arquitectura, demo-1/2/3, planos.md, simbolos-tableros-electricos.md: de esta última solo miré los nombres de las láminas), `docs/price-service/`, `docs/analisis-mejoras/`, `docs/ui-tono-y-mensajes.md` y `back/prisma/schema.prisma` (enums y campos). No abrí ninguna galería ni mock anterior.
Convención: **[E]** lo dijo un entrevistado · **[D]** lo decidió el equipo o está en el código · **[S]** conocimiento del sector que **no figura en el repo**. Lo marcado [S] hay que validarlo antes de mostrarlo como hecho.

---

## 1. Problema, segmentos y roles reales

### El problema (tres, encadenados)
1. Leer un plano no estandarizado y sacar un BOM confiable. Los planos llegan "hechos a mano, con figuras y texto sueltos" y sin AutoCAD Electrical (Visión, demo 1).
2. Convertir el BOM en productos comerciales de catálogos distintos: *"Interruptor tetrapolar de 250 A"* corresponde a muchas referencias según poder de corte, familia, marca y tensión (Meco [E]).
3. Llevar ese requerimiento a proveedores, comparar las respuestas y comprar.

Flujo real que contaron [E]: *plano del cliente → interpretación técnica → conteo → completar lo que falta → BOM → equivalencias por marca → accesorios derivados → costeo → stock, precio y proveedores → comparación → cotización.*

### Cifras que se pueden citar
| Dato | Fuente |
|---|---|
| Tablero chico: 30 min a mano; tablero grande: 1 día; edificio sencillo: ~40 tableros; cada tablero se revisa 2 veces (con supervisor) | Visión, demo 1 |
| Equipo de LIARD que cotiza: 2 presupuestadores full-time, 3 apoyos part-time, 2 personas en compras y Daniel García, que revisa por muestreo. Cuesta $5M–6,6M/mes, y $6,5M–9,3M/mes con part-time | Visión |
| EMEVE: 40 tableros, ~1,5 días solo para contar | [E] |
| Meco: 35–40 presupuestos/semana con 1 responsable y 4 técnicos; uno grande lleva hasta 2 semanas | [E] |
| César Braña: 11 personas cotizando todos los días; un proyecto complejo lleva hasta 2 días | [E] |
| GRAMONT: ~300 cotizaciones/año; responde ~95 % de los pedidos y convierte 10–15 % | [E] |
| Nisamat: cotiza en 2–3 h, 15–20 presupuestos por vendedor por día, ~100.000 productos, plazos de hasta 3 meses | [E] |
| Fundaleu (pedido real): 8 tableros, 31 tipos de material, 394 unidades; 4 h a mano. LIARD: 17 min, 90 % de detección y 100 % de precisión (antes 10 min y 68 %) | demo 3 |
| El mercado argentino tiene ~700.000 componentes distintos. Una "llave" sale de ~15 fábricas × 3 niveles, o sea 45 coincidencias | `informe_bom_cadime.md` |
| Los proveedores facturan "menos de la mitad que en 2023" | Visión |

### Segmentos [E/D]
| Segmento | Quiénes | Dolor principal | Qué valoran |
|---|---|---|---|
| **A — Necesitan contar** | LIARD, EMEVE, Meco | horas-hombre contando | lectura del plano, BOM, revisión rápida |
| **B — Procesos maduros** | GRAMONT (IEC 61439-1/-2, *Golden Rules* de Schneider, EcoXpert; usa EPLAN, macros e IA paga propia) | costeo y personalización, **no** el conteo | matching, actualizar precios, comparar proveedores |
| **C — Proveedores/distribuidores** | Electro HCM (SAP), Q Electric (Electrobase), Nisamat (Electrobase, migrando a Odoo) | demanda desordenada que llega por WhatsApp, mail, portal y visita | pedidos estructurados, trazabilidad, orden. Más volumen no es lo que más piden |

### Roles (personas para los mocks)
- **Presupuestista / técnico de cotización** (LIARD tiene 2 más 3 part-time; Meco tiene 4 técnicos): cuenta, completa la "zona gris" y arma el BOM. Es el usuario `ENGINEER` [D].
- **Ingeniero responsable / supervisor** (Daniel García en LIARD; "Dirección revisa y aprueba" en GRAMONT): revisa por muestreo y valida los casos críticos. **Hoy no tiene un rol propio**: `UserRole` solo tiene `ENGINEER | SUPPLIER` [D].
- **Compras** (2 en LIARD; en GRAMONT "consigue materiales y servicios"): compara ofertas, adjudica y emite la OC. En la app es el mismo `ENGINEER`.
- **Dueño de la tablerista / sponsor** (Marcelo Glorioso): quiere rentabilidad, capacidad para tomar más obras y no tener que contratar y despedir con cada pico.
- **Vendedor B2B del distribuidor** (Nisamat: 3 en Pilar, además de los de mostrador): interpreta "el idioma del tablerista" y confirma precio, stock y plazo. Es el usuario `SUPPLIER` [D].
- **Administrador del catálogo del proveedor**: carga Excel, mapea columnas y estandariza filas. También es `SUPPLIER`.
- **Cámara (CADIME, Adrián Gutman)**: canal hacia distribuidores. Su rol en la adopción **no está confirmado** y no hay entrevista individual con él.
- **Cliente final / comitente** (hospital, edificio, Eaton como "primer cliente de Marcelo"): no usa el sistema, pero el pliego y la licitación salen de él.

### Frases para usar casi textuales [E]
- "El ingeniero infiere el tamaño del gabinete, la ventilación, la disipación, las canaletas, el riel DIN, los cables, los terminales, los numeradores, las borneras… y **se juega** a que su interpretación sea la correcta." (EMEVE)
- "Probaron una IA para interpretar unifilares y tuvo demasiados errores y alucinaciones." (EMEVE)
- "Al elegir una térmica de 2 polos y 16 A, el sistema trae tres alternativas de marca, la longitud promedio de cable, los terminales, los numeradores y los accesorios." (EMEVE, su lógica interna)
- "Si falta la capacidad de ruptura, usar tal valor; si falta el tipo de protección, tal opción; si no alcanza, pedir validación." (Meco)
- Muchas veces le llega documentación "especificada con códigos de Schneider" y tiene que convertirla a ABB. (Meco)
- "Un cliente vuelve con una cotización de hace dos años y pide actualizarla." (HCM)
- Rechazo explícito a los pagos en la plataforma: "complejo, engorroso e innecesario". El email es el canal formal "por formalidad y trazabilidad". (Q Electric)
- "El precio de la plataforma es solo una referencia." (Q Electric). "No hay un precio estándar estable." (Nisamat)
- Lo mismo se pide como "térmica" o como "interruptor termomagnético", y "equivocarse puede generar un problema técnico serio". (Nisamat)

---

## 2. Ciclo de vida del sector, etapa por etapa

| # | Etapa | Qué pasa hoy en el sector | Qué cubre LIARD hoy [D] | Hueco (oportunidad) |
|---|---|---|---|---|
| 1 | **Ingeniería / recepción del pliego** | Llegan DWG, DXF, PDF vectorizado, planillas de carga y EPLAN. El comitente o el estudio dibuja; "no se pueden pedir planos bien hechos" | Proyecto; subir tabla de referencia (opcional desde el sprint 4) y planos DXF/PDF (hasta 15, 100 MB c/u); tijera para recortar varios tableros de un DXF; **multiplicador** para el seccional repetido de cada piso | No entra DWG nativo (sprint 5 evalúa), ni EPLAN, ni planilla de carga. No hay validación de la tabla de referencia al subirla, que `analisis-mejoras` llama "la mejora más valiosa" |
| 2 | **Cómputo / BOM** | Conteo a mano, 2 pasadas. "Zona gris": gabinete, riel DIN, canaletas, borneras, cables | Detección YOLO + Claude en una cola (`QUEUED/RUNNING/SUCCEEDED/FAILED`); BOM por plano (`PENDING_REVIEW` / `COMPLETE`); símbolos no identificados sobre el visor, que se resuelven o descartan en lote; editor del BOM con componente base y atributos; lectura IA por línea; BOM consolidado; exportación XLSX/CSV con la cantidad dibujada separada de la cantidad a comprar | No hay **accesorios derivados por regla** (EMEVE) ni **reglas por empresa** para lo que falta (Meco). No se distingue en pantalla *detectado / inferido / por regla / manual* con su confianza. No aprende de las correcciones |
| 3 | **Presupuesto / costeo** | 2–3 proveedores como mínimo; descuentos por mail; precio según forma de pago (contado, transferencia, cta. cte., 30/60/90) | `BomQuote` (`PENDING→READY/PARTIAL/FAILED/EXPIRED`); matching **por igualdad** (tipo base + atributos `required`), score 100, `CANONICAL`; `NOT_FOUND` con `unmatchedReason`; marcas preferidas y bloqueadas por cuenta o proyecto; matriz comparativa con plazo y opción "optimizar por costo" | **No hay margen, mano de obra, gabinete ni presupuesto al comitente**: LIARD termina en el costo de materiales. Tampoco hay IVA (el código lo excluye a propósito), condición de pago ni re-cotización de una oferta vieja |
| 4 | **Compras** | Pedido por mail o WhatsApp, seguimiento a mano, stock crítico, plazos de hasta 90 días | Adjudicar por ítem o en masa → `PurchaseOrderBatch` → una `PurchaseOrder` por proveedor (`SENT/CONFIRMED/REJECTED/EXPIRED`, `responseDeadlineAt`); el contacto del comprador se muestra recién después de confirmar; directorio de proveedores | El proveedor no puede **modificar** producto, precio, stock ni plazo: solo acepta o rechaza, aunque las entrevistas piden contraoferta. No hay entregas parciales, remito ni recepción. Email recién en el sprint 5. El BOM alternativo está planificado |
| 5 | **Fabricación del tablero** | Armado en taller; los tableros protocolizados se diseñan con el software del fabricante (ABB) | Nada | Lista de armado y de corte por tablero, avance del taller, faltantes que frenan el armado, protocolo de ensayo [S: IEC 61439] |
| 6 | **Instalación / obra** | Entregas a obra, cambios de último momento | Nada | Remitos por tablero y por obra; cambios de alcance que se reflejan en el BOM y en la OC |
| 7 | **Mantenimiento** | Reposición y ampliaciones años después | Nada (los proyectos quedan guardados) | "As-built" del tablero entregado; repuestos; re-cotizar una lista vieja con precios de hoy (HCM) |
| 8 | **Comercial / marketplace** | Los proveedores quieren orden, zona y confianza; nada de pagos | Catálogo del proveedor: import Excel en 3 pasos con mapeo recordado, lectura IA con costo y ETA en vivo, bandeja para estandarizar, historial de importaciones, CRUD | No hay vidriera ni distribuidores por zona. Faltan las señales de confianza (tiempo de respuesta, tasa de confirmación) y las métricas de demanda para el proveedor. La monetización (suscripción + comisión por lead) está **sin validar** |

Principios que no se negocian [E]: no asumir planos estándar; siempre hay revisión humana; un nombre no identifica un producto; el precio de catálogo no es el final; el proveedor no interpreta planos; stock y plazo pesan como el precio; **no ocultar lo que no matcheó**; **nunca inventar un SKU crítico**; el pago y el flete quedan fuera.

---

## 3. Estado real de la app (para no mockear algo que contradiga lo que ya existe)

Páginas del front: Landing, auth (login, registro, confirmar mail, recuperar), onboarding (elegir rol, completar perfil), Proyectos, Detalle de proyecto, Detalle de plano, Editor del BOM, Cotización y su detalle, `MaterialOffersPage`, Pedidos, Pedido por proveedor, Pedido enviado, Cuenta. Del lado proveedor: Catálogo, Importar, Vincular (estandarizar), Solicitudes, Detalle de solicitud y Contacto del comprador.
Estados útiles para pintar chips: plano `PENDING/PROCESSING/COMPLETED/ERROR/STALE`; línea de cotización `QUOTED/NOT_FOUND/STALE_PRICE/ERROR/MANUAL_REQUIRED`; vínculo canónico `UNLINKED/AUTO/MANUAL`; lectura `PENDING/READ/FAILED`; marca `PREFERRED/BLOCKED`.
33 tipos de componente base (`seed/components/`), entre ellos termomagnética, diferencial, interruptor en caja moldeada, motorizado, guardamotor, contactor, contacto auxiliar, seccionador bajo carga y con fusible, fusible, conmutador, selector, ojo de buey, fotocélula, temporizado, descargador, multimedidor, sensor de corriente, transformador, tablero de transferencia automática, grupo electrógeno, celda de MT, puesta a tierra, bornera, caja de tomas y 8 tipos de cable (unipolar, subterráneo, LSOH subterráneo, taller, paralelo, chato, desnudo).
Atributos reales: Polos, Corriente nominal, Curva de disparo, Poder de corte, Sensibilidad, Clase/tipo, Categoría de utilización, Tensión de bobina, Sección, Cantidad de conductores, Material del conductor, Aislación, Norma, Rango de tiempo, Potencia aparente.

---

## 4. Vocabulario y datos verosímiles (casi textuales)

**Tableros (nombres reales de los planos):** TGBT, TSSS (seccional subsuelo, barra normal y de emergencia), TDE, TSA-CT (servicios auxiliares), TSESC, TSUPSEM, TE_UPS_EM_SEC, COM, EST, TSCELS-1. Obras: **OCJ** (edificio con subsuelo, TGBT y grupo electrógeno) y **Fundaleu** (fundación contra la leucemia, cliente real).
**Especificaciones como las escribe el plano:** `4x40A`, `2x25A 30mA`, `2x40A 30mA`, `2x10A`, `2x16A`, `4x160A`, `4x50A`, `10A Curva C 10kA`, `Compact INS 40A`, `TM C-60`, `NSX630F` con accesorios `BA BC MO NCx2 NAx2`, TI `630/5A`, multimedidor `PM5100` / `PM620`, contactor `12A AC3 S1`, selector `M 0 A`, UPS 8 kVA, descargador. Cables: `LSOH 4x10mm+PE`, `LSOH-3x70/35mm+PE`, `LSOH 4x4+4(T)`, formación `2x1,5+T`. Etiquetas: `Q1`, `K1`, `DD1`, `X2`, circuitos `C1`, `C3`; `RES` = reserva. Planilla de circuitos con potencia (0,64 kW) y fases.
**Normas:** IEC 61439-1/-2 (GRAMONT [E]). [S] AEA 90364 (reglamentación AEA para instalaciones en inmuebles) e IRAM: **no aparecen en el repo**; usarlas solo como texto de ambiente, no como función validada.
**Marcas** (menciones en el repo): Schneider (la más frecuente; según Nisamat aparece en "una proporción muy alta" de los tableros), ABB (Meco es integrador), Siemens, CHINT, SICA, Genrod (gabinetes), y menos Prysmian, WEG, Legrand. Gamas: el catálogo separa **código del producto** (la identidad del ítem), **código de la marca** (a nivel marca, p. ej. `SCH` para todo Schneider), marca y **gama** (submarca). [S] Gamas típicas para dar color: Acti9/iC60, Compact NSX, System pro M.
**Moneda y precio:** `currency` vale `"ARS"` por defecto en el catálogo y en la cotización [D]; existe un listado de monedas del catálogo, así que USD es posible [D/S]. El precio se guarda **sin IVA**: el importador reconoce el encabezado "precio sin iva" y el código deja el IVA afuera a propósito ("es una épica de pricing") [D]. [S] IVA 21 % (10,5 % en algunos bienes de capital): si un mock lo muestra, tiene que ir como cálculo de presentación, rotulado. Cada oferta guarda `priceCapturedAt`, `priceValidUntil` y `leadTimeDaysMin/Max`. Usar coma decimal y punto de miles (`$ 1.234.567,89`).
**Siglas del rubro:** BOM / cómputo, OC (orden de compra), RFQ / pedido de cotización, cta. cte., 30/60/90, remito, pliego, protocolizado, tablero "nacional", ITM, DDR, TI, riel DIN, bornera, canal/cablecanal, numeradores, terminales.
**Tono [D, `ui-tono-y-mensajes.md`]:** voseo siempre ("Subí", "Cargá", "Probá"); la app habla en primera persona del plural solo cuando algo le falla a ella ("No pudimos cargar los pedidos"); **"solo se muestran los números que se pueden sostener"**.

---

## 5. Funcionalidades NUEVAS (22), por horizonte

Ninguna existe hoy. Al lado de cada una va la evidencia que la justifica.

### 0–6 meses (cierran huecos del flujo actual)
1. **Origen y confianza por línea del BOM**: chips *detectado alta/baja · inferido · por regla · manual*, con filtro "lo que tengo que mirar" [E: hallazgo transversal].
2. **Validación de la tabla de referencia al subirla**: preview de los materiales leídos sobre el render, y "Confirmar catálogo" antes de procesar [D: `analisis-mejoras`, la "única mejora a elegir"].
3. **Reglas de la empresa para lo que falta** ("si falta el poder de corte → 6 kA; si falta la curva → C; si no alcanza → pedir validación"), con aviso en la línea donde se aplicó una regla [E: Meco].
4. **Accesorios derivados**: térmica 2P 16 A → cable, terminales, numeradores; gabinete → ventilación, riel DIN, canaleta. Van como líneas "por regla", que se pueden apagar [E: EMEVE].
5. **Bandeja "información insuficiente"**: líneas que no pueden cotizarse sin una decisión técnica, con la pregunta concreta. Nunca un SKU inventado [E].
6. **Contraoferta del proveedor**: confirmar o modificar producto, equivalente, precio, stock, plazo y condición por línea, en lugar de aceptar o rechazar todo [E: flujo comercial, paso 5].
7. **Comparador con stock y fecha de actualización**: columnas de la tabla de discovery (stock, plazo, fecha, condición comercial, observaciones), y ordenar por "llega antes" además de por precio [E].
8. **Re-cotizar con precios de hoy**: diff de una cotización vieja contra los catálogos vigentes, por línea, con lo que subió o salió de catálogo [E: HCM].
9. **Notificaciones por email con hilo trazable**: quién pidió qué y cuándo, qué respondió cada proveedor, todo en una línea de tiempo dentro de la OC [E: Q Electric; D: sprint 5].
10. **Equivalencias Schneider ↔ ABB ↔ Siemens**: pegar un código de marca y ver los equivalentes por atributos [E: Meco].
11. **Panel de consumo de IA**: costo por plano y por usuario, con límite mensual [D: sprint 5].
12. **Rol "revisor"**: aprueba el BOM o la cotización antes de que salga la OC (Daniel García / Dirección) [E/Visión].

### 6–18 meses (ciclo completo y marketplace)
13. **Presupuesto al comitente**: materiales + gabinete + mano de obra + margen, IVA desglosado y PDF con logo; separa el costo de lo que se le vende al cliente [S, se infiere del flujo: hoy LIARD termina en el costo].
14. **Condiciones de pago en la oferta** (contado, cta. cte., 30/60/90) que cambian el precio comparado [E: Nisamat].
15. **Recepción y remitos**: entregas parciales, faltantes por OC y alerta de "frena el armado del tablero X" [S].
16. **Tablero en taller**: lista de armado por tablero, avance y checklist de protocolo IEC 61439 [E: GRAMONT; S para el checklist].
17. **Aprender de las correcciones**: "corregiste 5 veces el símbolo X → Y, ¿lo recordamos para este cliente / esta familia de planos?" [E].
18. **Vidriera del proveedor**: zona, marcas, especialidades, tiempo de respuesta medido y tasa de confirmación [E: Q Electric; D: demo 3, "vidriera"].
19. **Demanda para el proveedor**: qué le piden y no tiene, y qué pierde por stock o por plazo [E: Nisamat, el stock como problema].
20. **Entrada DWG, planilla de carga y EPLAN** [E: EMEVE, GRAMONT; D: DWG en el sprint 5].
21. **Integración ERP del proveedor** (SAP, Electrobase, Odoo): sincronizar precio y stock en vez de cargar Excel [E; D: "adapters" en la Visión].
22. **Plan y facturación de LIARD**: suscripción del tablerista y comisión por lead al proveedor, con un contador de leads visible [D: sprint 5; **hipótesis sin validar**].

---

## 6. Para decidir la galería (resumen)

- El hueco más grande del producto está **después** de la OC (fabricación, obra, mantenimiento) y **al costado** del costeo: no hay presupuesto al comitente, margen ni IVA. Una galería de "ciclo completo" tiene que mockear esas etapas como propuesta y marcarlas como tal.
- El diferencial creíble no es "IA que detecta". Es **IA + reglas + revisión humana con trazabilidad**, y hay que mostrarlo en cada línea.
- Hay dos personas que no tienen pantalla propia: el revisor/dueño y el vendedor que contraoferta.
- Pintar siempre un caso con `NOT_FOUND`/información insuficiente: ocultar lo que no matcheó contradice la evidencia.
- No mostrar pagos dentro de la app.
- Los números tienen que salir de este documento o rotularse como ejemplo.
