# LIARD — investigación de producto y cobertura, 30/09/2026

Investigación sobre `dev`; sin editar el repositorio. Fuentes primarias: `AGENTS.md`, `api-endpoints.md`, todos los archivos Markdown de `documentacion/`, código citado más abajo; 200 issues GitHub con cuerpos completos obtenidos vía `gh issue list --state all --limit 200 --json …`. Snapshot: `/private/tmp/liard-issues.json`; cuerpos relevantes íntegros: `/private/tmp/liard-relevant-issues.md`.

## Contrato de horizonte

- **Existe · dev** = hay código de la capacidad. No certifica operación en producción.
- **Planificado · Sprint 4 pendiente** = requisito remanente del roadmap/issue, aún no implementado o no verificado. Evitar suponer que un issue OPEN significa ausencia de código.
- **Planificado · Sprint 5** = uno de los nueve puntos explícitos del Roadmap. No adjudicar un issue a un sprint por numeración: ninguno de los 200 tiene milestone; asociación = inferencia por tema.
- **Propuesta · expansión** = evolución de producto y experiencia; necesita discovery, contrato de datos, permisos y verificación. Manufactura, instalación y mantenimiento no forman parte del release actual.

## Lo que hay que conservar como existente

1. Autenticación real, onboarding por ingeniero/proveedor, cuenta por rol con perfil/empresa/seguridad, cambio de contraseña, correo verificado y baja de cuenta (`front/src/pages/account/AccountPage.tsx`, componentes `account/`, `back/src/modules/users/`, `api-endpoints.md:72–88, 435+`). Avatar mostrado desde `photoUrl` no equivale a un flujo de subida.
2. Proyectos, DXF + PDF, tabla opcional, recorte multizona, visualización, procesamiento asíncrono en cola y lotes, reintentos discriminados (`Roadmap.md` S3/S4, `api-endpoints.md:991+`, `component-detector/pdf_plan/`, `back/src/modules/electrical-plan/`).
3. BOM por plano/consolidado, edición manual y canónica, símbolos sobre el plano y corrección individual/grupal, multiplicadores de tablero, exportación Excel/CSV con cantidades dibujadas/compradas (`Roadmap.md` S4; #797/#888/#833/#930/#931 cerrados).
4. Catálogo base con tipos/atributos, lectura Haiku de catálogo y BOM, bandeja de estandarización manual por listas cerradas, consumo/tiempo restante de lectura medidos (#984, #977, #963, #986 cerrados).
5. Igualdad de tipo/atributos esenciales al cotizar. `back/src/modules/quotation/matching/quote-matcher.service.ts` YA no tiene similitud textual; razones explícitas de falta de canónico/esenciales. #987 abierto está desactualizado respecto de `dev`; no reconstruirlo.
6. Marcas/gamas, preferencias a nivel cuenta/proyecto, alternativas comerciales multimarca, matriz y optimización por costo. Esto NO es una especificación alternativa técnicamente aprobada del BOM.
7. Catálogo propio con Excel preview/confirmación, reemplazo total, ABM y registros de importación. NO existe actualización incremental: `catalog-import-confirm.service.ts:73` solo `replaceCatalog`, `CatalogReplaceWarning.tsx` explica que todo faltante se despublica.
8. Envío de órdenes, proveedor acepta/rechaza, contacto revelado después de confirmación. No existe una respuesta del proveedor con precio/stock/plazo editable por línea; es expansión comercial propuesta.
9. Plazos de catálogo/oferta, matriz y detalle, hook `useQuotationAllocation.ts` llama `allocateFastest`. Existe parcialmente #827; completar entrega consolidada seleccionada y snapshot de plazo en OC (schema PurchaseOrder/Line no trae plazos).
10. Identidad, wordmark, navegación plegable/mobile, toast, landing actual: preservar tokens y lenguaje, no volver a diseñar desde cero.

## Sprint 4 — residuales y conflicto de evidencia

| Capacidad/issue | Evidencia | Qué debe mostrar el prototipo |
|---|---|---|
| Igualdad canónica #988/#987 | OPEN pero código implementado | Existente: completar esenciales faltantes → cotizar de nuevo. Planificado: cobertura para todos los tipos, medición de catálogo y BOM. |
| PDF #832 | OPEN pero convertidor + subida + Roadmap entregados | Etiquetar DXF/PDF existentes; DWG planificado S5. No un falso wizard PDF nuevo. |
| Cuenta #824–826 | Perfil/empresa/preferencias/seguridad existen; formulario no incluye subida avatar; no PATCH proyecto/pedido | Existente cuenta; pendiente avatar con previsualización, renombrar proyecto/orden y depuración auditada. |
| Plazos #827 | Campos de oferta y fastest existen; OC no guarda plazo | Existente matriz; planificado confirmar plazo total, desconocidos explícitos y snapshot por proveedor. |
| Catálogo incremental #835 | replaceCatalog exclusivo | Nueva selección actualizar/reemplazar → mapeo → resumen de altas/cambios/despublicaciones → confirmar → lectura. Conservar catálogo base/estandarización existente. |
| Demo comercial #787/#788 | OPEN; demo en vivo #814 CLOSED | Preparar historia reproducible usuario/proveedor, llamada comercial, guion y reset; mock no entrega videos editados. |
| Nombre comercial #834 | OPEN; #760 CLOSED decidió wordmark liard provisional | Mantener liard, no presentar elección de naming comercial como aprobada. |
| Deploy #985 | Roadmap declara demo para 5 usuarios; repo NO tiene docker-compose.prod.yml ni workflow deploy.yml | Declarar piloto reportado / operación pendiente de verificar. Prototipo estado encendido/iniciando/listo/no disponible, y readiness operador. No declarar deploy completo. |
| Cancelar diálogo #970 | OPEN y bug reproducido documentado | Flujo cerrar/cancelar/reabrir operable; QA debe comprobar sin bloquear clics, no afirmar fix a React real. |
| Polos/físico #1007–1010 | OPEN; necesarios para matching y física | Pendiente lectura origen texto/trazos/heredado, cobertura del tablero; nunca sumar desconocidos como cero. #1009 solo cuenta y estima DIN, no recomienda gabinete. |
| Tabla numerada #1002 | OPEN; tabla enviada pero descartada por detector | Pendiente resolver marca 7 → referencia → especificación, revisar evidencia; no convertir marca numérica en spec. |
| Cola #1000 | OPEN, resto #998/#999 CLOSED | Pendiente protocolo asíncrono/latido, un YOLO/proceso, liberar lease; UI recuperación/reanudación sin recalcular cajas ya pagadas es propuesta hasta checkpoints. |

No consta sprint explícito de #835, #827, #824–826 ni #1000/1002/1007–1010. Mostrar 'pendiente del backlog' cuando haga falta en vez de afirmar asignación S4. #945 variantes/potencia/MT y #856 seed heredado siguen abiertos; revisar vigencia antes de invertir (el esquema canónico cambió de identidad textual a tipo→atributos→valores).

## Sprint 5 — cobertura completa, sin sustituir por un subconjunto visible

| Punto explícito del Roadmap | Flujo entero de UI | Dependencias/criterio |
|---|---|---|
| 1. Extender deploy serverless a más usuarios y ambos roles | operador readiness → invita ingeniero/proveedor → acceso en arranque → checklist del rol → primera detección / primer catálogo → estado estable | cuotas/ownership catálogo, storage S3, Lambda/Fargate, cola fiable, resiliencia y logs. Rol irreversible existe; onboarding diferido requiere cambiar backend guards. |
| 2. Matching todos los componentes | cobertura por familia → esenciales faltantes → corrección manual con evidencia → cotejo canónico → ofertas → motivos no match | catálogo canónico + valores, semillas y pruebas para todas las familias. Igualdad ya existe. No confundir cobertura con similitud. |
| 3. BOM alternativo | define alternativa opcional por línea (#829) → aprobación técnica → genera set alternativo = alternativas + base restantes (#830) → compara base/alternativo → adjudica selección mixta → OC SKU/atributos elegidos (#831) → trazabilidad base→comprado en ambos roles | modelo/snapshot alternativa + vínculo a original, revisiones y aprobación. No alterar silenciosamente base. |
| 4. Pagos de plataforma | elige suscripción → calcula uso estimado → confirma plan simulado → factura/renovación/cancelación; proveedor ve lead elegible → comisión propuesta → disputa/revisión | pricing/aceptación NO validada. Etiqueta hipótesis; precios ficticios. Pago de materiales y flete siguen entre partes. No carrito de materiales. |
| 5. Gastos IA | estima antes de ejecutar → presupuesto y tope → procesa → libro de consumo por usuario/tarea → alerta → límite alcanzado → solicita aumento / sigue manual | coste catálogo parcial existe, detección/per-user/ledger/reserva/idempotencia pendientes. No confundir tope con tasa RPM. |
| 6. Email pedidos | evento pedido → preferencia canal → email con link → entrega/rebote/reintento → respuesta proveedor → aviso comprador → historial trazable | SMTP auth existe; eventos pedidos/outbox/dedupe/plantillas no. Consentimientos y notificaciones por rol. |
| 7. Observabilidad #836 / despliegue #985 | tablero servicio → incidencia → detalle job/modelo/tokens/latencia → acciones de contención → seguimiento | correlación jobId y workspace alias, APM opcional. #985 concreto excluye prompts/imágenes; prevalece confidencialidad. |
| 8. DWG | sube DWG → preflight/conversión → capas/unidades/layout → compara original convertido → aprueba → procesa → falla compatible → exporta/usa DXF manual | investigación/conversor/licencia/fidelidad todavía pendientes; no prometer mismo recall. DXF/PDF existentes. |
| 9. Detección y dataset diverso | fallo/corrección → permiso explícito para compartir copia → anonimiza → etiquetado independiente → split ajuste/validación → compara versión → despliegue gradual/retroceso | métricas por estilo/cliente/formato, derechos. QElectroTech SOLO referencia, nunca entrenamiento ni sintéticos. Dataset actual 2 estilos no certifica generalización. |

## Necesidades y expansión del ciclo completo

El core validado es documentación heterogénea → interpretación humana/IA → BOM confiable → producto comercial → proveedor → oferta confirmada. Fuentes: `Entrevistas de discovery.md`, visión. EMEVE: 40 tableros 1,5 días; accesorios por reglas. Meco: 35–40 presupuestos/semana y equivalencias Schneider→ABB. GRAMONT: conteo maduro, cuello costeo y aprobaciones. Q Electric: eficiencia/email/zona/confianza; pagos materiales rechazados. Nisamat: 100.000 productos, descuentos dinámicos, 2–3 h respuesta, stock hasta 3 meses. Estos datos son hallazgos de entrevistas, no KPIs del prototipo.

Propuestas de workflows, cada una con comienzo→decisión→resultado:

1. **Ingreso de oportunidad/licitación**: ficha y pliego → vencimiento/alcance → responsable → documentación → proyecto. Comercializa antes del plano.
2. **Ingeniería y revisiones**: versión de plano → diferencias semánticas → impacto BOM/precio/compra → tareas de revisión → aprobación y baselina. Nunca reemplazar silenciosamente lo comprado.
3. **Reglas de empresa**: faltan esenciales → regla propuesta con fuente → impacto → aprueba ingeniero → aplica a selección → audita/ revierte; asistentes no inventan SKU.
4. **Accesorios derivados**: componente base → regla versionada (terminales, riel, canaleta) → listado inferido separado → revisión → incorpora BOM con origen visible.
5. **Tablero físico 3D**: selecciona aparato ligado a BOM → propiedades y origen → distribución DIN/espacios → mover/pick/zoom/explotado → conflictos de volumen/holgura → tabla/2D equivalente → aprobación. Es modelo conceptual hasta medidas/fichas válidas; no cálculo térmico/cortocircuito.
6. **Revisión IA**: bandeja dudas → evidencia del plano y catálogo → recomendación/inferencia/costo → aprueba/rechaza/límite→modo manual. Auditoría de decisiones.
7. **Costeo de obra**: BOM → costos materiales confirmados + montaje/ingeniería/servicios → gastos/contingencia → escenario margen/precio → aprobación dirección → oferta cliente. Margen = (venta-costo)/venta; no confundir markup.
8. **Compras por escenarios**: mismo BOM/datos → costo/fecha crítica/convenio → filtros moneda/stock → selección simulada → impacto faltantes → adjudica → OC; incertidumbre explicada.
9. **Oferta comercial definitiva**: solicitud estructurada → vendedor revisa SKU/stock/costo/plazo/descuento/pago → contraoferta → comprador compara respuestas → selección → OC snapshot. Completa lo que vision pide y código aún limita a aceptar/rechazar.
10. **Confianza/red de proveedores**: zona/marcas/condiciones/tiempo respuesta → ficha documentada → solicitud; sin ratings inventados ni reputación automática.
11. **Colaboración y aprobaciones**: invita por rol/proyecto → asigna comentario exacto al símbolo/fila → resuelve → aprobación técnica/compras/dirección → historial y permisos. Hoy ownership individual, organizaciones son propuesta.
12. **Recepción/inventario**: OC→ aviso entrega→ recepciona parcial por SKU/lote→ faltante/diferencia→ reserva a tablero→ devolución. No asumir stock confirmado por catálogo.
13. **Manufactura**: baselina liberada → orden fabricación → kit materiales → montaje/cableado → checklist/pruebas por procedimiento interno → no conformidad→reparar→libera y documentación. No certificar IEC automáticamente.
14. **Instalación móvil**: paquete liberado→ QR activo→ tareas asignadas → fotos/medidas→ observación→ revisión responsable→ cierre/as-built. Offline con cola/conflictos visible.
15. **Entrega técnica**: activos/serie→ dossier unifilar/BOM/ensayos/manuales→ destinatario→ entrega/acuse→ mantenimiento.
16. **Mantenimiento**: QR→ historial/componente→ incidente→ triage→ permiso/procedimiento humano→ repuesto compatible aprobado→ orden trabajo→ registro→ cierre; no consejos de trabajo eléctrico en vivo.
17. **Repuestos/obsolescencia**: instalado→ fin vida SKU→ posible equivalente→ compara atributos→ valida ingeniero→ cotiza→ reemplazo→ actualiza as-built.
18. **Automatización**: disparador→ condiciones/alcance→ simulación→ acción con aprobación si crítica→ historial→ pausa/rollback. Nada envía o compra a espaldas del usuario.
19. **Integración ERP**: credenciales canal→ mapear SKUs/monedas→ preview deltas→ conflicto/autoridad→ sincronizar→ registro/reintento; Excel sigue fallback.
20. **Portal cliente comercial**: oferta versionada→ aclaraciones/alternativas→ aceptación del alcance→ cambios de obra→ costo/plazo delta→ firma de revisión. Comercial no implícito en roles actuales.
21. **Analytics de negocio**: oportunidad→ conversión/horas/correcciones/ahorro verificado→ desglose→ acción; ficticios o observados claramente diferenciados.
22. **Soporte/adopción**: onboarding por madurez A/B/C→ plantilla demo→ ayuda contextual→ feedback→ seguimiento; reutiliza roles actuales.

## Fuentes precisas y decisiones

- `documentacion/Roadmap.md`: único contrato explícito de sprint; S4 realizado vs S5 planificado.
- `documentacion/Documento de Visión - LIARD.md`: objetivos 90% precisión/90% tiempo (metas no resultados), confidencialidad, no pagos materiales/flete, cálculo eléctrico fuera release.
- `documentacion/Entrevistas de discovery.md`: evidencia / definición / derivación; monetización, comisión y pricing sin validar.
- `documentacion/Arquitectura Liard.md`: catálogo reads sin ownership, logs jobId pendientes, serverless futura y pagos excluidos; documento refleja selección AWS anterior, mientras #985 más nuevo abre GCP/AWS VM prueba. No elegir proveedor nuevo desde el mock.
- `documentacion/demo-{1,2,3}-sprint-{1,2,3}.md`: memoria histórica, no sustituye `dev`. Claims de segundos y 99% no repetir como métricas productivas.
- `documentacion/planos.md`: dos estilos OCJ/Fundaleu; conteo ground truth solo test5 confirmado en selección; plano = tablero exige recorte previo.
- `documentacion/simbolos-tableros-electricos.md`: licencia CC-BY y prohibición de entrenamiento/sintéticos.
- `back/prisma/schema.prisma`: `ProjectBomItem` sin alternativa; `PurchaseOrderLine` sin plazo; `User.photoUrl` pero no uploader; `ProcessingJob` lease/progreso.
- `back/src/modules/quotation/matching/quote-matcher.service.ts`: igualdad esencial actual.
- `front/src/components/quotation-workspace/shared/ComponentOfferMatrix.tsx`, `OfferDetailPanel.tsx`, `front/src/hooks/quotation/useQuotationAllocation.ts`: plazo/fastest parcialmente actual.
- `front/src/pages/account/AccountPage.tsx`, `front/src/lib/auth/profile-fields.ts`: campos editables de empresa, rubros, marcas, zonas/plazos existentes; no subir logo implementado.
- `back/src/modules/project/controller/project.controller.ts` y `purchase-order/controller/purchase-order.controller.ts`: sin endpoints PATCH renombrado.
- `back/src/modules/provider/service/catalog-import-confirm.service.ts`, `front/src/components/supplier/catalog-import/CatalogReplaceWarning.tsx`: importación replace-only.

## Orden de producción sugerido

P0 asegurar ownership de catálogo y permisos, snapshots/versiones, instrumentación y libro gasto; resolver bug #970 y riesgos cola/piloto. P1 completar todas familias/esenciales y orígenes, catálogo incremental, variantes BOM y snapshot OC/plazo, email outbox, despliegue ambos roles con cuotas. P2 pricing experimental suscripción/leads, métricas de adopción, DWG y dataset con consentimiento. P3 colaboración/organizaciones + reglas + estimación obra + respuestas comerciales confirmadas. P4 medidas/catálogos dimensiones→3D/2D + recepción→manufactura→dossier→instalación. P5 activos/as-built→mantenimiento/repuestos, ERP/automatización/cliente. Cada puerta exige validación domain; un prototipo no cierra tickets/sprints.
