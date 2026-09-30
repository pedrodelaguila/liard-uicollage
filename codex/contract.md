# Contrato integrado del prototipo

Auditoría dev: `04fc813941ec3ae3b0121f12c173ea4a64cd7219`. Investigación consolidada: product-audit, market-strategy, supporting-audit, openai-devday y hallazgos técnicos (86 rutas coinciden; contratos comparados por riesgo, no exhaustivamente). No modificar producción.

## Archivos y propiedad
Coordinador: data.js, app.js, tokens.css, ui.css, index.html, documentos, integración y QA.
Ingeniería: d-projects.html, d-engineering.html, d-panel.html, engineering.js, engineering.css.
Comercio: d-rfq.html, d-supplier.html, d-comparison.html, d-orders.html, commerce.js, commerce.css.
Operaciones: d-operations.html, d-collaboration.html, d-network.html, m-field.html, operations.js, operations.css.

Cada HTML completo usa tokens.css, ui.css, data.js, app.js y su script de dominio con defer. Body data-role="engineer|supplier|field" data-active y data-title. El shell compartido crea sidebar/topbar y envuelve #page; #act admite acciones. No copiar shared ni editar otros archivos. Texto y navegación en español. No dependencias/red externa.

## Diseño
Industrial editorial: fondo #edf0ee, tinta #14231e, acento eléctrico #b8ed57, azul de información #155adb; panel visual verde oscuro. Fuente sistema (offline), títulos grandes compactos, mono para medidas/estados. Bordes finos, tablas claras, radios 10/18, objetos 3D propios sin plano real. Estados accesibles, focus-visible, prefers-reduced-motion. Pantallas desktop 1440×994 y responsive; m-field 390×844.
Clases compartidas: card, grid (grid-2/grid-3), stack, row, between, btn (primary/secondary/ghost/danger), badge (green/blue/amber/red), muted, mono, small, metric, table-wrap, empty, notice, field, toolbar, page-heading, split, progress, stepper, variant-context. Los dominios pueden agregar CSS propio.

## Variantes funcionales
query v=guided|expert|assisted|visual (default expert), proyecto=id conserva contexto. app.js muestra picker y enlaces compatibles. Guided: pasos secuenciales/prerequisitos; Expert: tabla/comparación simultánea; Assisted: panel de sugerencias con evidencia y aprobación individual, fallback manual; Visual: canvas/3D/mapa de vínculos seleccionables, inspector y tabla accesible. Cada etapa ofrece camino completo y mismas reglas compartidas. Variantes jamás redefinen precios/stock/reglas. Estados ?estado=empty|loading|error|limit con recuperación real al estado normal; loading termina localmente.

## API window.L
L.state(): copia actual. L.update(mutator, description): lee última copia, modifica, incrementa version, guarda localStorage y emite liard:change. NO actualizar durante render. L.subscribe(render): evento local y storage. L.reset() seed y evento. L.uid(prefix). L.escape(value). L.money(cents), L.number(value). L.href(file, extraObject) preserva v y proyecto. L.download(filename, text, mime). L.csv(rows): escapa fórmulas/CSV. L.toast(message). L.icon(name). L.page(): nombre archivo. L.variant(): string. L.project(): proyecto seleccionado o primero. L.qty(line, project): quantity*multiplier. L.subtotal(offer, project): suma qty*priceCents. L.costs(project, offer): {materialsCents,laborCents,overheadCents,riskCents,totalCents,revenueCents,marginCents,marginPercent}. L.reviewed(project): todas las líneas technicalApproved && canonicalStatus==='confirmed'. L.error(message, containerId): mensaje accesible; prefer validación nativa también. Custom forms guardan valores normalizados y enteros centavos.

## Estado schema seed
{schema:1,version:1,activeProjectId:'p1',projects:[{id,name,client,site,version:1,multiplier:3,plans:[{id,name,format,status:'READY',progress:100}],lines:[{id,type,name,spec,quantity,unit:'u',referenceCents,canonicalStatus:'confirmed|suggested|missing',technicalApproved:boolean,brand,required:{...}}],alternatives:[{id,lineId,name,spec,referenceCents,status:'suggested|approved|rejected',reason}],scenarios:[{id,name,multiplier,laborCents,overheadCents,riskPercent,revenueCents}],laborCents:180000,overheadCents:65000,riskPercent:5,revenueCents:1800000,notes:[],documents:[]}],suppliers:[{id,name,city,verified:false}],catalog:[{id,supplierId,name,spec,type,priceCents,stock:null|number,currency:'USD',readingStatus:'PENDING|READ',canonicalStatus:'confirmed|suggested',updatedAt}],rfqs:[],offers:[],orders:[],events:[],budget:{limitCents:2000,spentCents:420,reservedCents:0},automation:{offerAlerts:false},rules:[],leads:[],connectors:[],receipts:[],tasks:[],assets:[],serviceRequests:[]}

Line ids: l1 termomagnético4P25A6kA qty12 ref4200; l2 diferencial4P40A30mA qty4 ref8800; l3 contactor3P18A220V qty2 ref5300; l4 gabinete800x600x200 qty1 ref24500; l5 bornera2.5mm qty24 ref180. l2 necesita aprobación humana inicial. Proveedores s1 Delta Eléctrica y s2 Sur Suministros (ficticios). Ningún stock ni oferta confirmada inicial. Precios USD ficticios netos, sin IVA (impuesto demo configurable en pedido no norma fiscal).

rfq: {id,projectId,projectVersion,lines:[snapshot line + requiredQuantity],supplierIds,deadline,notes,status:'DRAFT|SENT|CLOSED',createdAt}
offer: {id,rfqId,supplierId,status:'DRAFT|SUBMITTED|ACCEPTED',validUntil,leadDays,paymentTerms,shippingCents,lines:[{lineId,quantity,priceCents,stockConfirmed:false,stockQuantity:0,alternativeId:null}],notes,revision:1}
order: {id,rfqId,offerId,projectId,supplierId,status:'SENT|CONFIRMED|PARTIAL|RECEIVED',lines:[{lineId,name,quantity,priceCents}],materialsCents,shippingCents,taxPercent:0,totalCents,createdAt}
events: {id,at,actor,description,projectId?}. L.update agrega evento description automáticamente. El dominio puede completar más campos con compatibilidad. No nuevos nombres para equivalentes.

## Reglas
RFQ requiere revisión técnica; snapshot evita que cambio BOM altere oferta enviada. Pedido solo oferta presentada/vigente, stock confirmado suficiente, cantidad completa y alternativa aprobada humana. Bloquear RFQ obsoleto si project.version cambió. Solo información de propio proveedor visible a supplier. Margen=(venta-costo)/venta; recargo separado si se ofrece. Simulaciones IA/detección/mail/servicios explícitas; reserva de presupuesto antes del consumo, rechazo sin gasto y fallback manual. No pago real. Cambios cruzan todas las páginas mediante el store; reset deja recorrido reproducible. Exportar archivos reales, nunca solo toast.

## Cobertura
Ingeniería: proyecto, carga simulada DXF/PDF, revisión BOM/canon, cantidades multiplicadas, accesorios/reglas, alternativas y variantes BOM, export CSV, modelo conceptual seleccionable/rotación/zoom/explosión + tabla2D.
Comercio: catálogoCRUD/import preview/corrección manual, crear/enviar RFQ, respuesta editable proveedor, comparar condiciones y aprobar alternativas, pedido real local/archivo, seguimiento estados.
Operaciones: costos/margen escenarios, presupuesto IA/revisión asistida, reglas privadas y colaboración/eventos, directorio/leads consentimiento, contrato de conector simulado; recepción parcial/instalación/handover/activo/servicio móvil persistente.
Descartado por ahora: cálculos eléctricos normativos autónomos, CNC/gemelo certificado, crédito/custodia pagos/logística, scraping portales/venta de datos privados. Documentar hipótesis de monetización; prototipo no implementación de sprint.
