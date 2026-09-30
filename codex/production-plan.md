# Implementación por dependencias

## Punto de partida
dev auditado tiene auth/ownership, PDF/DXF, cola durable, lectura canónica, matching exacto, BOM/CAS, catálogo propio, alternativas comerciales y pedidos/respuesta. No reemplazar estos módulos. Antes de anunciar Sprint 4 operativo: ejecutar sus gates, comprobar SHA desplegado, salud de front/back/db/detector, SMTP, upload original, acceso cruzado y flujo real con corpus autorizado. El runbook VM pide /api/health que no existe en el inventario; observar y corregir esa dependencia antes del piloto.

## Secuencia con puertas de validación

| Etapa | Depende de | Implementación y frontera | Puerta de salida |
|---|---|---|---|
| A. Calidad y contratos | Auditoría y equipo técnico | Reconciliar docs; corpus holdout privado/autorizado; cobertura por familia, ground truth; fixtures PDF/DXF; CAS/concurrencia y ownership | Métricas por origen/familia publicables con límites; gates actuales pasando y producción medida |
| B. Ledger y operación | A + identidad/costos existentes | Reservas atómicas por usuario/operación, reintentos e idempotencia; costo de fallo/cache; outbox de pedido, plantillas/preferences; health/readiness/correlación | Ningún exceso concurrente, doble cargo ni notificación duplicada en pruebas; alertas y recuperación demostradas |
| C. RFQ y oferta versionada | A + catálogo/pedido | Nuevos inputs/DTO/repo/servicios thin; snapshots y revisiones por proveedor; plazo/pago/vigencia/stock; aceptación humana alternativa | 3 compradores + 3 proveedores completan ida/vuelta con confidencialidad; reducción mediana de tiempo medida |
| D. Variantes BOM/costos/reglas | A + C + canon | Modelo de versiones/escenarios, per-plan multiplier y accesorios privados; costos/labor/gastos/riesgo; margen explícito; conflicto de edición | Restaurar versión reproduce presupuesto; no cambia pedido enviado; técnico detecta y resuelve faltantes |
| E. Asistentes y eventos | B + D + corpus | Structured Outputs/funciones estrechas antes de Agents; schemas seguros, eval semántica, aprobación para compras; outbox interno, luego plugin/eventos si disponible | Mejora de tiempo y cobertura vs manual medida; límite costo/latencia; permisos/eventos y fallos probados |
| F. Obra/activo y conectores | C + D | Recepción acumulada/instalación/handover; historial de activo; CSV/API contract primero; piloto ERP/CMMS sin big-bang | Ninguna sobre-recepción; trazabilidad pedido→activo; reconciliación repetible |
| G. Oferta comercial | B + pilotos C–F | Entitlements y billing organización, separado de compra material; catálogo/conector pago, leads opt-in con calidad/reembolso | Clientes aceptan pagar y margen servicio positivo; ningún cobro por lead inválido/duplicado |
| H. Escala/internacional | A–G con evidencia | Storage remoto, worker/scaler y limiter distribuido antes de multinstancia; packs de país/licencia/idioma/clasificación | Piloto local repetible, soporte/costos unitarios sostenibles; expansión con proveedor ancla y demanda pagada |

Stack/convenios: mantener Nest service/repository/mapper/input/DTO/types, DI por rol y StorageService; Prisma migration+generate+cleanDatabase; nuevas rutas documentadas junto con API frontend. Front api→queries/mutations→hooks→screens; todos los tipos en types/; servidor en Query, UI en store. No convertir las páginas JS de collage directamente en código de producto.

## Validación y permisos técnicos
Backend: lint:check, typecheck, unit y test:int al tocar controller/repository/schema/queue. Front: lint, build, Vitest, verify:crop y Cypress del recorrido. Detector: pytest sin API y evaluación independiente de detección/classificación con corpus lícito cuando corresponde. Tests de invariantes de dinero, stock, versiones y acceso reales, además de a11y/browser. No se ejecutaron esos gates de producción en esta entrega read-only.

Serverless no es un cambio de hosting aislado: CPU Python debe seguir en proceso hijo, leases y timeouts respetados; storage local y limiter por proceso no escalan automáticamente. Elegir VM medida para piloto o cloud workers con evidencia; estimaciones históricas de nube no son presupuesto vigente.

## Experimentos comerciales
Medir minutos desde documento hasta BOM revisado, ciclos de aclaración RFQ, respuesta útil por proveedor, tiempo hasta pedido, costo IA por expediente revisado y margen realizado (separado de margen presupuestado). Probar precio de organización sobre entrevistas/piloto sin prometer ROI. Servicios de catálogo pueden financiar onboarding sin bloquear respuesta básica. Leads solo demandantes consentidos con requisitos/vigencia y reglas de devolución. La internacionalización empieza por mercado actual y una puerta de evidencia por país, como detalla market-strategy.md.

## Riesgos pendientes
Datos de familias/marcas incompletos, equivalencia no inferible solo por nombre, corpus privado y licencias, SLA de oferta/stock, impuestos/tipos de cambio, confidencialidad multitenant, concurrencia/costos de IA, disponibilidad gradual de APIs anunciadas. 3D requiere ensamblajes/fichas medidos para pasar de conceptual a fabricación; no ofrece certificación. Ningún sprint se marca terminado por esta demo.
