# Investigación de mercado — LIARD ciclo completo (para la galería de mocks)

Fecha de corte: 2026-10-01. Fuentes web; las afirmaciones de cada proveedor son marketing salvo que se indique otra cosa.
Las cifras de precios vienen de reseñas de terceros cuando el proveedor no publica las suyas.

## 1. Competidores y referentes: qué se puede transferir a la UI

### Takeoff / estimación con IA
| Herramienta | Patrón de UI / flujo notable | Precio |
| --- | --- | --- |
| **Drawer AI** ([home](https://drawer.ai/), [novedades](https://drawer.ai/blog/building-what-electrical-contractors-need-next-whats-new-at-drawer-ai), [11 chequeos de precisión](https://drawer.ai/blog/11-accuracy-checks-for-automated-electrical-takeoff)) | Lee la **leyenda de símbolos** del plano y después detecta cada dispositivo y lo vincula a tablero/circuito. **Modos de QA** separados ("Circuit Grouping QA": revisar, mover y *bloquear* grupos de home run; "Branch Routing QA": las longitudes y secciones se recalculan al editar). Parseo de planillas de tableros, zoom al 1000%, copiar texto del plano, advertencias más claras. | No publicado |
| **Beam AI (Attentive.ai)** ([electrical](https://www.ibeam.ai/subcontractors/electrical), [review](https://contractortoolstack.com/software/beam-ai/)) | Flujo de 4 pasos: subir → **confirmar alcance precargado por rubro** (checkbox + campo "Project-Specific Deviations") → IA → **QA humano** (24–72 h en eléctrica). **Addendum Variance Report**: lado a lado entre versiones, ítems nuevos/quitados, resaltado por hoja. Exporta a Excel/PDF/link compartible. | No publicado; DIY vs. hecho por ellos |
| **Togal.AI** ([pricing](https://www.togal.ai/pricing)) | Búsqueda por imagen: **dibujar un recuadro sobre un símbolo y buscarlo en todo el juego de planos**; chat sobre el plano. | Growth USD 299/usuario/mes (anual); Business a medida (4+ usuarios) |
| **Countfire / Kreo** ([comparativa](https://easytakeoffs.com/blog/best-ai-takeoff-software)) | Countfire: elegís el símbolo una vez y se cuenta en todos los planos; **modo de verificación visual** que pinta lo contado sobre el PDF (rastro de auditoría); comparación entre revisiones con marcadores de color; capas por disciplina. Kreo: "Auto Count" que el usuario entrena con sus símbolos. | Kreo Pro ~USD 175/usuario/mes |
| **Trimble Accubid Anywhere** ([producto](https://www.trimble.com/en/products/trimble-accubid-anywhere), [ChangeOrder](https://www.trimble.com/en/products/trimble-accubid-changeorder)) | Base compartida de ítems/ensambles/precios; **Supplier Xchange**: mandar RFQ a proveedores preferidos e importar las respuestas al presupuesto; precio **de lista vs. neto** con multiplicadores; las órdenes de cambio reutilizan ensambles del presupuesto original; API "Final Price" (presupuestado vs. final). | Por cotización |

### Diseño de tableros / configuradores de fabricantes
| Herramienta | Patrón de UI / flujo notable | Precio |
| --- | --- | --- |
| **Schneider EcoStruxure Power Build – Rapsody** ([comunidad SE](https://community.se.com/t5/c-krefy84679/EcoStruxure+Power+Build+%2525E2%252580%252593+Rapsody/pd-p/ecostruxure-power-build-raspody)) | Unifilar → BOM completo (aparatos + conexiones + montaje) → **vista del frente del tablero** → presupuesto con **condiciones de compra y costo de mano de obra propios** del tablerista. Disposición de módulos automática o manual. Versiones por país con productos y normas locales; dentro de sistemas Prisma ensayados, IEC 61439. | Gratis (atado a la marca) |
| **Siemens SIMARIS create** ([producto](https://www.siemens.com/global/en/products/energy/low-voltage/software/simaris-create.html)) | **"Configuración en 3 vías"**: lista de materiales, vista del sistema y esquema, sincronizadas. Importar tu propia lista de materiales o arrastrar desde el catálogo; chequeo de errores, cálculo de pérdidas de potencia y de cobre. | Gratis |
| **ABB e-Design** ([workflow](https://new.abb.com/low-voltage/support/software/e-design/resources/workflow)) | Módulos encadenados: DOC (cálculo) → CAT (selección y presupuesto) → PDC/EDS (tablero). El unifilar se importa al módulo de presupuesto. | Depende del país |
| **EPLAN Pro Panel + Data Portal** ([Pro Panel](https://www.eplan-software.com/solutions/eplan-pro-panel/), [plataforma](https://www.eplan.com/us-en/products/eplan-platform/)) | **Layout 3D** desde el esquema (canales, rieles DIN, perforaciones, longitudes de cable) → listas de corte/cableado/NC. Data Portal: más de 4 millones de datasets de más de 500 fabricantes, clasificados con ECLASS/ETIM. Hasta 10 vistas guardadas del gabinete. | Licencia anual (alto costo) |

### Campo, mantenimiento, pasaporte digital
| Herramienta | Patrón | Precio |
| --- | --- | --- |
| **Schneider Facility Expert → mySchneider "Equipment Tracker"** ([FAQ](https://www.se.com/es/es/faqs/FAQ000266626/)) | **QR en el tablero** → documentación, historial del activo, plan de mantenimiento, recordatorios; documentos restringidos detrás de login. Bitácora digital compartida entre tablerista y cliente. | Gratis |
| **Rittal ePOCKET** ([producto](https://www.rittal.com/com-en/Software/Digital_Wiring_Plan)) | QR en la placa característica → documentación "siempre actualizada" del equipo; varios QR para tableros de varias secciones. | Ecosistema Rittal/EPLAN |
| **Fieldwire** ([QR](https://www.fieldwire.com/blog/qr-codes-product-updates-2024/)) | QR por tarea/plano, **exportación masiva de 600 etiquetas** (plantilla Avery), punch list sobre el plano, reporte por subcontratista enviado por mail a una hora fija. | Por usuario |
| **ServiceTitan** ([propuestas](https://www.servicetitan.com/industries/electrical-software/proposals)) | **Propuestas Good / Better / Best** desde plantillas, firma y cobro en el momento. | ~USD 245–500/técnico/mes (terceros) |
| **EU Digital Product Passport (ESPR)** ([guía](https://qr-verse.com/en/blog/eu-digital-product-passport-qr-code-guide)) | QR con identificador (GS1 Digital Link), formato abierto. Todavía no hay fecha para tableros de BT. | — |

## 2. Contexto argentino (datos verificados para 2026)

- **Inflación:** IPC de agosto 2026 **1,7% mensual**, 21,3% acumulado en el año, 33,5% interanual; el pico del año fue marzo con 3,4% ([INDEC IPC](https://www.indec.gob.ar/uploads/informesdeprensa/ipc_09_26A1BE2DC4CD.pdf)). ICC junio 2026: el ítem "Instalación eléctrica" subió **4,4%** en el mes y **32,5%** interanual; aparatos de control (tableros, interruptores) +1,0% ([INDEC ICC](https://www.indec.gob.ar/uploads/informesdeprensa/icc_07_266A21F0AB6D.pdf)).
- **Dólar:** BNA venta **$1.540** (1/10/2026), con una brecha con el blue de ~1,3%; banda cambiaria con techo $1.919 ([Cronista](https://www.cronista.com/MercadosOnline/dolar.html)). Si se factura en USD, ARCA convierte al tipo vendedor BNA del día hábil anterior; el vendedor puede pactar otro tipo para el cobro. → Los presupuestos tienen que **nombrar el tipo de cambio** (BNA billete o divisa, fecha) y una **vigencia corta**; el cable sigue el precio del cobre.
- **Listas y bonificaciones:** los distribuidores asignan **una lista por condición comercial** del cliente (p. ej., el portal de [Electrinet](https://electrinet.com.ar/): productos, precios por condición, pedidos, presupuesto en PDF; [MIGLUZ](https://migluz.ar/): área de clientes con la fecha de "última actualización" de la lista y descarga en varios formatos). Hay precios **"+IVA"** con y sin impuestos ([Jalux](https://www.jalux.com.ar/), [Paternal](https://paternalsrl.com.ar/)). Las bonificaciones no se publican: se negocian por distribuidor. Schneider lista las tiendas online de sus distribuidores AR/PY/UY ([SE](https://www.se.com/ar/es/work/campaign/local/distributor-online/)); [LIESA](https://liesa.com.ar/blog/novedades-2/distribuidores-schneider-electric-argentina-1) destaca stock y entrega en 48 h. Cámara: CAMIME.
- **Plazos:** un importado sin stock local tarda 5 a 7 semanas como mínimo; las cargas desde Asia vienen con demoras en el 4.º trimestre de 2026 ([Infobae](https://www.infobae.com/movant/2026/09/29/que-deben-saber-los-importadores-argentinos-sobre-las-demoras-maritimas-desde-asia-antes-de-noviembre/)). La alternativa nacional (Jeluz, etc.) sirve cuando un importado se demora.
- **Normativa:** AEA 90364-7-771, cláusula 771.20 (tableros), basada en IEC 61439-1. Exige reserva de módulos libres (hasta 6 → +1; 7–12 → +2; 13–24 → +4; 25–48 → +6; más de 48 → +8) y el símbolo de riesgo eléctrico IRAM 10005-1 (40 mm o más). Se menciona una Ed. 2024 que hay que confirmar con la AEA ([AEA](https://aea.org.ar/wp-content/uploads/2017/10/aea_90364_7_771_corrigendum_02.pdf)). IEC 61439: el fabricante hace la **verificación de diseño** y el tablerista la **verificación de rutina** de cada tablero; cambiar la marca del interruptor, las barras o la envolvente puede trasladarle al tablerista la responsabilidad del diseño. Componentes: Res. 16/2025 (reemplaza a la 169/18), con certificación acreditada por el OAA. Res. SRT 900/15: puesta a tierra, continuidad, disparo del diferencial.
- **Ciclo de la construcción:** ISAC julio 2026 **−4,5% interanual** (−4,6% contra junio desestacionalizado); acumulado del año +1,7%; permisos de obra junio +31,6% ([INDEC ISAC](https://www.indec.gob.ar/uploads/informesdeprensa/isac_08_260D1D561E94.pdf)). CADIEEL, 2.º trimestre de 2026: el 44% de las firmas bajó producción, con capacidad instalada por debajo del 60% ([Mercado](https://mercado.com.ar/tendencias/cadieel-relevo-caida-de-produccion-y-empleo-en-industrias-electronicas-en-2-trimestre-2026)). Volatilidad: hay que presupuestar rápido y revalidar seguido.
- **Mano de obra de referencia (CABA/GBA, sep. 2026):** tablero seccional de 8 a 36 polos $950.000; de 36 a 54 polos $1.420.000 ([Joule](https://jouletecnologia.com.ar/lista-de-precios-electricista.html)). Usar Schneider/ABB en lugar de genéricos suma entre 30 y 50% al material.

## 3. Patrones de UI recomendados para LIARD (16)

1. **Leyenda primero:** una pantalla para confirmar la tabla de referencia (símbolo → material) antes de detectar, como Drawer AI. LIARD ya sube un DXF de referencia: mostrarlo como "diccionario" editable.
2. **Revisión de la detección por modos de QA** (conteo, agrupación por tablero, no identificados), con **bloqueo** de lo ya revisado.
3. **Superposición de verificación visual:** lo detectado pintado sobre el plano con filtro por tipo; clic en la línea del BOM → zoom al símbolo (rastro de auditoría tipo Countfire).
4. **"Buscar parecidos":** recuadro sobre un símbolo no identificado → buscarlo en todos los planos del proyecto y resolverlos en lote (Togal).
5. **Comparar revisiones de plano:** diff lado a lado de BOM v1 contra v2 (agregados, quitados, cantidades cambiadas, por plano), al estilo del Addendum Variance Report.
6. **Confirmar alcance precargado** por tipo de obra, con un campo de desvíos del proyecto.
7. **Comparador de cotizaciones por proveedor:** columnas por distribuidor con precio de lista, bonificación, neto, +IVA, moneda, **vigencia** y plazo/stock. Resaltar el mejor precio por línea y permitir **adjudicar por línea** (el split genera varias OC).
8. **Precio dual ARS/USD:** cada precio con su moneda de origen, el tipo de cambio aplicado (BNA vendedor, fecha) y un toggle de vista; un aviso de "lista vencida" o "TC desactualizado" cuando corresponda.
9. **Antigüedad de la lista por proveedor** ("actualizada hace 12 días") y alerta de revalidación cuando la inflación del período supera un umbral.
10. **Presupuesto Good/Better/Best:** misma ingeniería en tres variantes de marca (Schneider / ABB / nacional tipo Jeluz) con delta de costo y de plazo, al estilo ServiceTitan.
11. **Advertencia IEC 61439 al sustituir:** si una variante cambia la marca del interruptor o la envolvente, avisar "sale del diseño verificado, requiere nueva verificación de diseño".
12. **Checklist de verificación de rutina** por tablero terminado (IEC 61439 / AEA 771.20): reserva de módulos calculada automáticamente, símbolo de riesgo, PAT, continuidad, disparo del diferencial (SRT 900/15), con firma y fecha.
13. **Vista frontal / layout del tablero** generada desde el BOM (ocupación de módulos y reserva libre), como el frente de Rapsody o el layout 3D de EPLAN, en versión liviana.
14. **QR / pasaporte del tablero:** etiqueta imprimible (lote, plantilla Avery) que abre BOM, unifilar, certificado de rutina, OC y proveedores; vista pública mínima y documentos privados detrás de login. Bitácora de mantenimiento.
15. **RFQ a proveedores preferidos con retorno estructurado** (Supplier Xchange): el proveedor responde dentro de LIARD y las respuestas caen en el comparador.
16. **Presupuestado contra real:** después de la compra, comparar el costo del presupuesto con el de la OC y el final, por proyecto (Final Price API), para la rentabilidad del tablerista.

## 4. Lagunas (no verificado)
- Porcentajes reales de bonificación por canal en Argentina: no son públicos.
- Si la AEA 90364-7-771 Ed. 2024 está vigente: confirmar con la AEA.
- Precios de Drawer AI, Beam, Accubid y EPLAN: no publicados.
- No hay fecha de pasaporte digital (DPP) para tableros de BT en la UE ni en Argentina.
