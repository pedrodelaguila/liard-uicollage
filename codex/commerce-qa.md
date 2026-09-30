# Comercio — implementación y QA del prototipo local

Archivos propios: `d-rfq.html`, `d-supplier.html`, `d-comparison.html`, `d-orders.html`, `commerce.js`, `commerce.css`. Investigación previa: `research/technical-audit.md` e inventario de 86 rutas. No se cambió el repositorio ni se llamó a IA, SMTP, pagos o proveedores reales.

## Cuatro recorridos funcionales distintos

- **Guiada:** revisión → proveedores → solicitud; catálogo → solicitud recibida → respuesta; ofertas → validación → pedido; siguiente paso de pedido.
- **Experta:** BOM y formulario simultáneos, oferta editable por línea, tabla comparativa de precio/stock/plazo/pago, listado y documento del pedido.
- **Asistida:** selección manual junto a sugerencias deterministas con origen/evidencia; aprobación individual de atributos y alternativas; recomendación de menor total con regla explícita y fallback manual.
- **Visual:** nodos seleccionables de invitación y solicitudes recibidas, estantería conceptual de productos con inspector, barras seleccionables de ofertas y mapa de estados de pedido. La tabla permanece como representación accesible.

Catálogo propio por identidad de proveedor ficticia: crear, editar, eliminar, revisión manual de atributos, export CSV, importar CSV con archivo o texto, preview editable y confirmación individual. Import CSV es una propuesta offline; la producción actual importa XLSX. No se simula un Excel real bajo otro formato.

Solicitud guarda cantidades efectivas y versión del BOM. Oferta admite borrador; para presentarla requiere cantidad completa, precio positivo y stock suficiente confirmado por humano. Las alternativas del proveedor quedan como sugeridas hasta decisión humana de ingeniería. El pedido conserva snapshot, calcula flete e impuesto de demo en centavos, emite archivo HTML real, permite CSV real y exige vigencia, versión, stock y cantidades. No se permite emitir dos compras completas de la misma solicitud. Proveedor puede confirmar su pedido; recepción continúa en módulo de obra.

Selecciones proveedor/RFQ/pedido se guardan en query params mediante history, preservando contexto en las variantes y enlaces compartidos. Selección de oferta sigue proveedor en comparación. Supplier solo renderiza catálogo, respuestas y pedidos propios; no muestra ofertas de competidores ni costos/márgenes del comprador. El cambio explícito de rol es navegación de demo, no un control de seguridad de producción.

## Verificación ejecutada

Chrome headless con perfil aislado y CDP, en `file://` y servidor loopback `http://127.0.0.1:8766`. Scripts temporales fuera del producto: `/private/tmp/liard-commerce-smoke.mjs`, `liard-commerce-layout.mjs`, `liard-commerce-context.mjs`.

Los cuatro recorridos pasaron en ambos protocolos:

1. Solicitud bloqueada con BOM sin revisión; creada luego de fixture de revisión técnica aprobado.
2. Snapshot de 36 termomagnéticos = 12 × 3, conservando cantidades de las otras cuatro líneas.
3. Oferta bloqueada sin stock confirmado; presentada luego con cantidades completas y disponibilidad suficiente.
4. Pedido bloqueado por alternativa sin aprobación humana; aprobado individualmente.
5. Pedido bloqueado por cambio de versión BOM, oferta vencida, cantidad incompleta, stock insuficiente y versión global de formulario obsoleta.
6. Pedido emitido válido con impuesto demo 10%; suma en centavos verificada; oferta cambia a adjudicada; proveedor confirma SENT → CONFIRMED.
7. CRUD de catálogo, corrección manual de atributos y preview CSV con precio corregido pasan en todas las variantes.
8. Se verificaron dos proveedores/ofertas, preservación de proveedor al cambiar variante, ausencia de valores privados del competidor/comprador y bloqueo de segunda compra del mismo RFQ.
9. **32 combinaciones de página × variante × ancho** (1440 y 390) sin overflow horizontal del documento. Tablas grandes tienen su propio scroll. Cuatro estados empty/error/limit/loading recuperan una vista normal.
10. **Cero excepciones JavaScript observadas.** `node --check commerce.js` pasa.

Los gates técnicos de ingeniería se prepararon mediante fixture aprobado en este smoke de comercio; no se afirma que este script haya cubierto la revisión de ingeniería real por UI. Ese tramo pertenece a QA integrado del coordinador.

Descargas reales inspeccionadas en `/private/tmp/liard-commerce-downloads/`: HTML contiene tabla, precios y advertencia de datos ficticios; CSV contiene cantidades y precios USD. Comparación de dos ofertas también genera CSV real. No son toasts en lugar de archivos.

## Inspección visual

Se generaron e inspeccionaron las 20 capturas desktop mediante contact sheet y vistas individuales de RFQ, proveedor, comparación, catálogo y móvil. Se corrigieron título duplicado con shell, contraste en canvas, texto contiguo proveedor/ciudad, columnas demasiado estrechas del catálogo guiado y overflow de IDs largos.

Capturas: `shots/rfq-{guided,expert,assisted,visual}.png`, `supplier-*`, `comparison-*`, `orders-*`, `catalog-*`, `commerce-mobile-comparison.png`, `commerce-agent-two-offers.png`. Contact sheet final: `shots/commerce-agent-contact.png`.

## Alcance

RFQ con invitación/negociación, stock confirmado y ciertos gates de adjudicación son **propuestas nuevas**; matching/cotización/pedidos, catálogo propio y respuesta proveedor tienen base existente. La demo no implementa seguridad backend, negociación real, pagos, correo, inventario reservado ni impuestos normativos. Los objetos de estantería son conceptuales y no CAD/certificación eléctrica. Datos y precios son ficticios.
