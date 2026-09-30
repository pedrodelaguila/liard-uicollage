# Cobertura y decisiones

Auditoría: dev `04fc813941ec3ae3b0121f12c173ea4a64cd7219`. Fuente consolidada: [producto](research/product-audit.md), [técnica](research/technical-audit.md), [mercado](research/market-strategy.md), [investigaciones históricas](research/supporting-audit.md), [OpenAI actual](research/openai-devday.md).

No se reimplementa producción. El collage explora reorganización de capacidades actuales más extensiones. “Existe” significa observado en código, no disponibilidad comprobada del despliegue. Las etiquetas no convierten propuestas en funcionalidades entregadas de Sprint 5.

| Oportunidad | Rol / horizonte | Páginas y recorrido completo | Decisión / evidencia |
|---|---|---|---|
| O1 Expediente, origen y revisión | Ingeniero / existente + mejora | projects → engineering → RFQ; creación, carga ficticia, revisión humana, error/recuperación y export | P0; cuatro entrevistas valoran reducir retrabajo; referencia opcional, PDF ya existe |
| O2 Accesorios y reglas privadas | Panelista / propuesta | collaboration regla → engineering preview/aplicar → BOM recalculado | P1; hipótesis EMEVE/Meco, nunca inferir que todo accesorio es obligatorio |
| O3 Equivalencia aprobada y variantes BOM | Ingeniero / Sprint 5 | engineering aprobación o rechazo → escenario guardado/restaurado → comparison | P0; matching exacto existente no prueba sustitución técnica |
| O4 Solicitud, oferta editable, pedido | Comprador/proveedor / existente + propuesta | rfq → supplier → comparison → orders → respuesta → field | P0; stock/plazo/pago compiten con precio; RFQ/negociación nueva, pedido/respuesta actual |
| O5 Catálogo asistido | Proveedor / existente + mejora | supplier entrada/import preview → corregir canónico → publicar local → ofertar | P1; reduce esfuerzo al proveedor; import XLSX real no ejecutado (demo simplificada) |
| O6 Costo y margen | Comercial / propuesta | operations editar venta/labor/gastos/riesgo → guardar/comparar escenario → oferta | P1; evaluar margen realizado, no asegurar beneficio |
| O7 Colaboración y eventos | Equipo / propuesta | collaboration nota/regla/alerta → cambios → historial; publicación de oferta genera evento local | P1; versión/BOM CAS existente; permisos colaborativos y outbox pendientes |
| O8 Montaje conceptual 3D | Panelista / propuesta | panel seleccionar/rotar/zoom/explotar → inspector BOM → tabla/revisión | P2; disposición conceptual, no reconstrucción CAD ni validación eléctrica |
| O9 Recepción parcial | Obra / propuesta | orders → field registrar recibido → faltante → completar | P2; prueba logística interna, sin transportista real |
| O10 Instalación y entrega | Obra / propuesta | field recepción → checklist instalación → descarga expediente | P2; checklist humano, no certificado normativo |
| O11 Activo y servicio | Mantenimiento / propuesta | field entrega → activo/serial → solicitud servicio → resolución | P2; continuidad mínima, no reemplazo de CMMS |
| O12 Directorio y demanda consentida | Empresa/proveedor / propuesta | network filtrar proveedor → solicitud opt-in → estado/retirar → export | P2; calidad y cobro deben validarse primero, no vender datos privados |
| O13 Conector interoperable | Administración / propuesta | network contrato/preview → confirmar simulación → archivo local | P1/P2; primero CSV/API estable y piloto ERP; sin conexión real |
| O14 Cálculo/CNC/gemelo autónomo | Fabricante / diferido | Sin control ofrecido | P3; riesgo técnico, licencias, datos y certificación; no ventaja defendible inicial |

## Cuatro variantes sobre datos equivalentes

| Variante | Estructura y mecanismo | Recomendación | Tradeoff |
|---|---|---|---|
| Guiada | Hitos y prerequisitos, una decisión principal por etapa | Usuarios ocasionales, onboarding, comprador con poca experiencia | Más navegación; mantiene salidas hacia las etapas siguientes |
| Experta | Tablas densas, edición y condiciones simultáneas | Ingeniería/compras recurrentes | Mayor carga inicial; requiere conocer vocabulario |
| Asistida | Evidencia, sugerencias individuales y aprobación humana; vía manual visible | Revisión de datos incompletos y triage | IA propuesta requiere presupuesto, evaluación y privacidad; aquí determinista |
| Visual | Relaciones/inspector y tablero 3D con tabla alternativa | Panelista y revisión espacial/comercial | Requiere más pantalla; modelo conceptual no representa distancias reales |

Las once páginas independientes ofrecen el picker global y enlaces al resto del recorrido. La galería muestra dos ejemplos por bloque; el picker cambia todas las páginas conservando contexto. Reset devuelve el mismo seed inicial para comparar variantes. La QA distingue variación real de distribución/acciones frente a diferencias de estilo.

## Estados y límites
Seed incluye una línea por revisar, stock desconocido y sin ofertas confirmadas. Errores y consumo son simulados explícitos. RFQ captura versión/filas; cambiar BOM invalida pedido sobre el expediente viejo. Ofertas vigentes y stock confirmado son condiciones propuestas de control. El prototipo usa un expediente con un plano y multiplicador; producción aplica el multiplicador a cada plano. Moneda USD ficticia neta para comparar sin tipo de cambio implícito; país/impuestos se parametrizarán en producción. No pagos de materiales ni comisión real.

## Diferidos/consolidados
No se incluye una página suelta por cada idea: asistentes especializados se integran en la tarea, leads y conectores comparten red, recepción/instalación/activo comparten expediente móvil. Facturación/suscripción se documenta como modelo comercial y dependencia, sin checkout ficticio que confunda con pagos de materiales. DWG se difiere hasta evaluar conversor/licencia. Segmentación automática de tableros se difiere frente a recorte manual ya disponible. IoT, crédito, CNC, cálculo normativo autónomo, marketplace de precios privados y portal scraping se descartan de esta entrega por riesgo/dependencias y débil validación económica.
