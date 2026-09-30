# LIARD: oportunidades de producto y evidencia de mercado

Investigación de fuentes oficiales: 30/09/2026. Investigación de producto y mercado, sin modificar la aplicación. La palabra «líder» es una aspiración; no hay evidencia para afirmar liderazgo de LIARD ni superioridad frente a los productos mencionados.

## Lectura del mercado

La oportunidad propia de LIARD es convertir documentación eléctrica heterogénea de terceros en decisiones técnicas y comerciales trazables. El discovery interno confirma tres dolores distintos: conteo e interpretación (LIARD, EMEVE, Meco), costeo y comparación (GRAMONT), demanda estructurada y condiciones negociadas (proveedores). El eje diferenciador propuesto es mantener la identidad de cada material desde el plano hasta la oferta, el taller y el activo instalado, con intervención humana en los puntos técnicos inciertos.

La investigación competitiva identifica capacidades ya presentes en plataformas maduras. No demuestra que esas plataformas atiendan de forma equivalente a las PyMEs argentinas, acepten sus planos informales, integren proveedores locales ni resuelvan su disponibilidad comercial. Esas diferencias son hipótesis para validar, no hechos de mercado.

| Fuente oficial | Evidencia observada | Implicación para LIARD (inferencia) |
| --- | --- | --- |
| [EPLAN: paneles 3D](https://www.eplan.com/ca-en/industry-solutions/panel-building/panel-designs-in-3d/) | Vincula diseños 3D de tableros, esquemas, información de compra y asistencia de producción. Su flujo parte de datos de ingeniería estructurados. | El 3D debe resolver revisión y transferencia al taller; requiere dimensiones y ubicaciones reales. No basta extruir cajas de detección del unifilar. |
| [EPLAN Smart Production](https://www.eplan.com/us-en/products/eplan-smart-wiring/) | Ofrece listas de pasos de montaje y cableado, confirmación de avance, consultas al diseñador y diferencias entre versiones. | Una continuidad BOM→kit→paso de armado→evidencia aporta más que un visor 3D aislado. |
| [Siemens Capital X Panel Designer](https://www.siemens.com/en-us/products/capital/offerings/capital-x-panel-designer/) | Diseño de esquemas en la nube, automatizaciones, colaboración y control de versiones. | LIARD puede convivir con el CAD de ingeniería y conservar revisiones y aprobaciones del proyecto. |
| [Siemens SIMARIS](https://www.siemens.com/en-us/products/simaris/) | Herramientas para cálculos de redes, presupuesto y espacio, curvas de protección y planeamiento 3D de barras. | Los cálculos eléctricos requieren herramientas y datos técnicos especializados; el mock de LIARD no debe presentarlos como certificados. |
| [Autodesk: BOM para compras](https://www.autodesk.com/support/technical/article/caas/sfdcarticles/sfdcarticles/Getting-a-purchasing-Bill-of-Materials-including-all-terminals-in-AutoCAD-Electrical.html) | Diferencia el BOM del esquema del BOM físico del panel; este último puede incorporar componentes adicionales. | Distinguir «detectado», «derivado por regla», «manual» y «comprado» evita confundir el dibujo con todos los materiales necesarios. |
| [Trimble Accubid Anywhere](https://www.trimble.com/en/products/trimble-accubid-anywhere) | Estimación eléctrica con materiales y mano de obra; comparación de planos; gestión de cambios; gastos generales y recargos. | Ofrecer escenarios de margen y órdenes de cambio a partir de revisiones, con supuestos explícitos y aprobación comercial. |
| [Procore Materials](https://www.procore.com/materials) y [guía de uso](https://support.procore.com/products/online/materials-user-guide-with-project-financials) | Conecta órdenes aprobadas, recepción, ubicación, inventario y entrega/instalación de materiales. | Después de comprar, LIARD puede seguir cantidades aceptadas, dañadas, pendientes y asignadas por tablero y obra. |
| [Schneider: evolución del registro digital](https://www.se.com/sk/sk/faqs/FAQ000266626/) | Documenta transición de Facility Expert a mySchneider/Energy Hub, acceso por QR y conservación de documentación; advierte que varios datos de mantenimiento no se migran. | El expediente del activo debe ser exportable y conservar derechos de acceso. No basar el roadmap en una integración histórica sin verificar su continuidad local. |
| [Odoo: reposición](https://www.odoo.com/documentation/saas-18.4/applications/inventory_and_mrp/inventory/warehouses_storage/replenishment.html) | Distingue reglas de reposición, compra/fabricación por pedido y plan maestro; puede sugerir o generar órdenes. | Mostrar simulación y borrador antes de activar automatizaciones, sobre todo con presupuestos, variantes y stock de referencia. |
| [Autodesk Assistant: capacidades](https://help.autodesk.com/cloudhelp/ENU/Assistant-User-Guide/files/assistant-topics/AA_Capabilities.html) | Consultas contextuales y tareas sujetas a solicitud/confirmación; documentación como fuente de respuestas de producto. | Los asistentes de LIARD deben producir propuestas revisables, fuentes y acciones concretas; ningún SKU crítico ni certificación se deriva de una respuesta sin evidencia. |

## Contratos de producto para todos los prototipos

- Proyecto y revisión única para todos los roles; por ejemplo, «Centro logístico Norte · revisión R03», datos ficticios.
- Separar BOM técnico, selección comercial/SKU, oferta confirmada, orden, pieza instalada y activo. Mantener los vínculos de procedencia entre ellos.
- Toda cantidad distingue «dibujada», multiplicador y «a comprar»; fabricación distingue planificado, reservado, recibido, consumido y merma.
- Estado de dato: detectado / derivado por regla / inferencia IA / manual / confirmado por proveedor. Estado de producto: existe / planificado Sprint 5 / propuesta. Son dos ejes diferentes.
- No usar «equivalente» porque coincide el nombre. Mostrar atributos esenciales cubiertos, faltantes y validación del ingeniero; no prometer sustitución técnica segura por un precio menor.
- Catálogo = referencia. Oferta = stock, precio, vigencia, moneda y condiciones confirmados. Mostrar fecha de captura y vencimiento en comparación y órdenes.
- IA: mostrar fuente/plano/página/línea, hipótesis, motivo, costo estimado antes de ejecutar, consumo y límite; permitir descartar/corregir/continuar manualmente. La ausencia de fuente queda como «sin evidencia suficiente».
- Confidencialidad por empresa/proyecto/rol. El proveedor accede al requerimiento comercial autorizado; no necesita recibir el plano ni conocer margen de ingeniería.
- Vistas guiada/expert/IA/visual comparten exactamente la misma revisión y datos. El selector cambia presentación y asistencia, no hechos ni totales.
- Las propuestas no convierten un mock en cumplimiento del sprint; los criterios de aceptación y la implementación real se verifican por separado.

## Workflows propuestos, ordenados por dependencia y valor

### A. Completar la decisión técnica y comercial (corto plazo)

1. **Revisión con evidencia y cierre técnico.** Bandeja de pendientes → símbolo o fila → comparar especificación y atributos → pedir dato faltante o aprobar regla de empresa → corregir → validar revisión → bloquear versión para cotizar. La vista experta permite edición tabular; la vista asistida explica contradicciones con fuentes. Estados: falta poder de corte, fuente ilegible, dos personas editan la misma revisión, IA no disponible. Métrica: minutos de revisión y cambios posteriores por BOM validado. Parte del flujo ya existe en dev; los nuevos elementos son aprobación, procedencia enriquecida y colaboración, sujetos al inventario del coordinador.

2. **Reglas de empresa y accesorios derivados.** Elegir regla (térmica→terminales/numeradores/accesorios) → previsualizar cantidades, supuestos y origen → ajustar → aprobar → recalcular BOM → comparar impacto de cambiar regla. Señalar accesorios no presentes en el plano. La inferencia de gabinete/disipación no debe mostrarse como cálculo técnico validado. Evidencia local fuerte: EMEVE y Meco; prioridad alta tras el catálogo canónico.

3. **Alternativas técnicas como grupos de decisión.** BOM base → definir opción A/B mutuamente excluyente → completar atributos → comparar marcas/familias → enviar requerimiento con alternativas permitidas → proveedor responde cada opción o explica incompatibilidad → ingeniero aprueba una → consolidar solo esa opción. Evitar sumar dos variantes como si fueran dos compras. Es parte de Sprint 5 planificado («BOM alternativo»), con contratos todavía por definir.

4. **Comparación integral de ofertas y cobertura.** Referencias → solicitud por proveedor → confirmación con precio/stock/plazo → comparación por cobertura y fecha requerida → sustituciones revisables → adjudicar → revisión final → orden por proveedor. Incluir «menor costo», «llegar a tiempo», «un solo proveedor» con misma base de datos. El flujo base existe; los escenarios de plazo/riesgo y respuesta detallada son propuestas según gap de dev.

5. **BOM alternativo y cambios de presupuesto.** R03→R04 → diferencias por cantidad/atributo/SKU → impacto en solicitudes, ofertas y órdenes → elegir mantener/re-cotizar/cancelar solo afectados → aprobación del cambio → nuevo snapshot. Evitar destruir la evidencia de lo ya pedido. Métrica: tiempo de re-cotización y órdenes con documentación desactualizada.

6. **Escenarios de compra y margen.** Materiales confirmados + mano de obra + servicios + gastos generales + contingencia → elegir fecha/tipo de cambio capturado → comparar escenarios → revisar margen bruto calculado sobre precio de venta → aprobación de dirección → propuesta comercial versionada. «Recargo sobre costo» y «margen sobre venta» se muestran diferentes. Pago/flete de materiales sigue fuera de LIARD; el escenario incluye un costo previsto de flete pero no gestiona su ejecución. Evidencia local: costeo de GRAMONT, negociación/stock de Nisamat; práctica oficial Trimble.

### B. Hacer operable Sprint 5 (en paralelo con A)

7. **Consumo, límites y suscripción transparente.** Resumen por procesamiento/lectura de BOM/catálogo → estimación antes de lote → confirmar máximo → progreso/costo → límite alcanzado sin perder trabajo → ampliar plan o continuar manual → revisar historial. Separar control de costo técnico de suscripción y comisión. La monetización y su precio no están validados por las entrevistas; el mock debe identificarlos como hipótesis.

8. **Lead con valor verificable para proveedor.** Pedido recibido → ver cobertura y condiciones requeridas → aceptar/rechazar lead con motivo → aviso de cargo/condición solo si se define ese modelo → responder → buyer selecciona → historial y disputa. Definir duplicados, pedidos de prueba, cancelaciones y leads sin calidad antes de cobro. No inventar comisión/porcentaje como decisión tomada.

9. **Notificaciones y seguimiento formal.** Configurar eventos y resumen → previsualizar email con revisión y enlace seguro → pedido enviado → proveedor responde → comprador recibe → falla de entrega/reintento → historial. Centro de notificaciones puede existir visualmente; email de pedidos es planificado Sprint 5. Evitar enviar emails reales desde el mock.

10. **Entrada DWG y estado de conversión.** Archivo → verificación de formato/versiones/límites → conversión → revisar fidelidad DXF/PDF → confirmar → detectar → resolver fallo con alternativa manual/exportación DXF. Mostrar «evaluación Sprint 5», no soporte garantizado; herramientas/licencias/conservación de entidades siguen abiertas.

11. **Operación y calidad del modelo.** Cohortes/versiones de pipeline → errores y tiempos por servicio → abrir incidente sin exponer secretos → cancelar/reintentar seguro → comparar métricas anotadas → evaluar dataset consentido → revisión humana → liberar versión. La precisión requiere verdad de referencia; una tasa de éxito HTTP no mide recall.

### C. Continuidad material: taller y obra (medio plazo)

12. **Panel 3D seleccionable vinculado al BOM.** Elegir tablero → alternar 3D/2D/lista → seleccionar dispositivo → resaltar su línea/material/origen/SKU → comparar dimensiones y ubicaciones → revisar incompatibilidades → aprobar disposición → liberar paquete para fabricación. En el mock, geometría ilustrativa declarada. Producción necesita objetos persistentes con IDs, dimensiones certificadas, restricciones, coordenadas y relaciones al BOM; no asumir que la bbox 2D del esquema es su posición física. El 3D debe ser operable por teclado y tener alternativa tabular.

13. **Compras, recepción y kit por tablero.** Orden → aviso de entrega → recepcionar cantidad/código/estado/remito desde móvil → registrar daño/faltante → reclamar → asignar stock a tablero → preparar kit → entregar a taller. Faltantes bloquean los pasos que los requieren, sin paralizar todo proyecto. ERP adapter sincroniza con idempotencia y muestra divergencias.

14. **Orden de fabricación y control de calidad.** Revisión aprobada + kit → ordenar etapas y responsables → montaje visual/lista de pasos → consulta a ingeniería → registrar avance/evidencia → ensayo FAT con resultado y observación → cerrar no conformidad → liberar. Una checklist no declara cumplimiento IEC ni reemplaza ensayos/criterio profesional. Cambio R04 exige revisar tareas afectadas, no borrar historial de R03.

15. **Instalación y puesta en servicio móvil.** Paquete liberado → cuadrilla consulta plano/ubicación → recepción en obra → checklist por tablero → evidencia/firma/reporte → incidencia técnica → corrección aprobada → prueba SAT → entrega documental. Modo sin conexión explícito, cola de sincronización y conflicto; nunca confundir «guardado en dispositivo» con «sincronizado».

16. **Expediente de activo y mantenimiento.** Entrega → generar QR → abrir historial BOM/as-built/manuales/pruebas → plan de mantenimiento → tarea móvil → lectura/evidencia/incidencia → decidir reparación/repuesto → solicitar oferta → cierre de intervención. Escaneo QR respeta acceso del sitio; sin autenticación mostrar solo datos públicos permitidos. No sugerir reparaciones eléctricas autónomas por IA.

### D. Empresa, colaboración y automatización (plataforma)

17. **Colaboración por revisión y aprobaciones.** Invitar con rol → asignar pendiente → comentar en símbolo/línea/activo → resolver con decisión vinculada → aprobación de ingeniería/compras/dirección → bitácora → exportar paquete. Nuevos roles no se presuponen en auth actual. Revisión técnica y aprobación comercial son permisos diferentes.

18. **Automatizaciones revisables.** Plantilla «si oferta vence en 48 h, crear borrador de re-cotización» → seleccionar alcance y excepciones → simular con eventos existentes → ver cantidad/costo/recipientes → activar → ejecución con bitácora → pausa/fallo/reintento. Por defecto las acciones externas costosas/comerciales producen borradores hasta autorización explícita. Reglas de empresa y permisos preceden al motor.

19. **Trabajo comercial y oportunidades.** Licitación/cliente → calificación → documentación y fecha límite → ingeniería/costeo → propuesta con opciones aprobadas → envío → seguimiento → ganado/perdido y motivo → proyecto de ejecución → comparar margen previsto/real → renovar mantenimiento. El MVP no es CRM completo; enlazar clientes y propuestas con sistemas externos primero.

20. **Directorio con confianza verificable.** Buscar proveedor por zona/marca/familia → revisar datos con fuente y actualización → comparar tiempos observados (muestra y período visibles) → crear solicitud estructurada → respuesta → registrar cumplimiento. No crear calificaciones ficticias de proveedores reales ni afirmar stock por estar en catálogo.

21. **Interoperabilidad y gobernanza de datos.** Conectar ERP/catálogo → mapear códigos/unidades/monedas → previsualizar diferencias y errores → importar versión → lectura/clasificación → revisar excepciones → sincronización incremental → resolver divergencia. Dataset: solicitar permiso específico → anonimizar → anotar → medir → versionar. QElectroTech no se usa para entrenamiento; respetar instrucciones del proyecto.

22. **Asistentes por tarea, no chat genérico.** «Revisar estas 6 ambigüedades», «explicar diferencia entre ofertas», «crear borrador de compra que cumpla la fecha», «resumir cambios para taller», «preparar reporte de intervención». Cada tarea → fuentes → propuesta → diferencias revisables → costo/límite → aceptar subconjunto → ejecución en bitácora. Manual fallback reproduce el mismo resultado posible mediante tablas/formularios, sin IA.

## Dependencias recomendadas para producción

1. Confirmar gaps reales en dev y tickets; no rehacer lo implementado.
2. Identidad de empresa/roles/ownership + revisiones y snapshots + procedencia de líneas/cambios.
3. Catálogo canónico completo + alternativas mutuamente excluyentes + reglas derivadas aprobables.
4. Ofertas confirmadas con stock/plazo/vigencia/unidades/moneda + comparación de escenarios + límite de IA + email observable.
5. Costeo comercial y margen + aprobaciones + cambios con impacto trazado.
6. Recepción/reservas/kits + adaptadores ERP.
7. Datos físicos reales + disposición 2D + visor 3D enlazado + paquete de fabricación; luego checklists/ensayos.
8. Campo/offline/as-built + entrega QR + mantenimiento.
9. Automatizaciones y asistentes sobre permisos, bitácora y acciones ya implementadas; no antes.

No hay estimación de fechas en esta investigación. La prioridad debe validarse con pilotos de los tres segmentos; las propuestas de fabricación, campo, mantenimiento y CRM amplían el alcance más allá del release inicial documentado.

## Experimentos que justifican avanzar

- Dos empresas con planos heterogéneos: comparar tiempo/correcciones antes y después; una empresa madura: costeo con BOM importado sin forzar detección.
- Tres proveedores: medir calidad del requerimiento, tiempo de respuesta y condiciones comerciales que rechazan compartir.
- Comparación integral: medir cobertura comprable dentro de la fecha, no solo «ahorro» contra un catálogo preliminar.
- 3D: prueba con ingeniero + técnico de taller usando una misma revisión; medir dudas resueltas y errores de montaje, no tiempo mirando la animación.
- Monetización: entrevistas y prueba de disposición a pagar separadas para usuario y proveedor; no cobrar por leads antes de definir calidad/disputa.
- Campo: prueba real con conectividad intermitente; trazabilidad de faltante/daño/cambio sin pérdida de evidencia.
