/* Área C · Presupuesto y compras */
(window.SECCIONES ||= []).push(
{
  id: 'cotizacion', orden: 300, etapa: 'Compras', horizonte: 's4', roles: ['comp', 'ing'],
  refs: ['Roadmap S4 · BOM → matching → cotización', 'Discovery · stock, plazo, fecha, condición, observaciones', 'QuotationPage.tsx'],
  titulo: 'Cotización de punta a punta', corto: 'Cotización',
  descripcion: 'La matriz de líneas por distribuidor que ya existe, con el recorrido del Sprint 4 visible arriba: planos, BOM, catálogo base, matching y cotización. Cada celda muestra precio, total, stock y plazo; cada columna, la fecha de la lista y la condición comercial. Las líneas sin match no se esconden: van al final con su motivo y un atajo para destrabarlas en el BOM.',
  existe: 'En dev: matriz, estrategia mixta o proveedor único, optimizar por precio o plazo, adjudicar por celda o «Asignar todo», y ejecutar la orden. Lo nuevo: el recorrido de punta a punta, el motivo NOT_FOUND por línea, STALE_PRICE, el stock y el plazo por celda, y las columnas que pidieron en discovery.',
  reglas: ['Todo match es por componente base + atributos esenciales; sin eso la línea es NOT_FOUND con su unmatchedReason, nunca un código inventado.', 'Si el área B destraba una línea, aparece cotizada sola (estado compartido).', 'Una lista vencida se puede adjudicar, pero con aviso; la cotización vencida no se ejecuta.', 'Precios sin IVA; el total lleva «+IVA».', 'Una OC por encima de $ 20.000.000 pasa por dirección antes de salir.'],
  estados: [['Parcial', 'd-com-cotizacion.html?estado=parcial'], ['Cargando', 'd-com-cotizacion.html?estado=cargando'], ['Vencida', 'd-com-cotizacion.html?estado=vencida'], ['Error', 'd-com-cotizacion.html?estado=error'], ['Lista', 'd-com-cotizacion.html?vista=lista']],
  marcos: `
    d|d-com-cotizacion.html|Matriz con recorrido y motivos|Clic en una celda adjudica; «Ejecutar orden» emite un pedido
    d|d-com-cotizacion.html?estado=parcial|Falta una lista|Electro Sur todavía se está leyendo
    d|d-com-cotizacion.html?vista=lista|Lo adjudicado con todas sus columnas|Stock, plazo, fecha, condición, observaciones
  `,
},
{
  id: 'escenarios', orden: 310, etapa: 'Compras', horizonte: 'h1', roles: ['comp'],
  refs: ['Discovery · «llega antes» además de «más barato»', 'Comparadores de RFQ'],
  titulo: 'Escenarios de compra', corto: 'Escenarios',
  descripcion: 'El mismo BOM resuelto de cuatro maneras lado a lado: más barato, llega antes, menos distribuidores y marcas preferidas. Cada uno muestra total, cobertura, plazo máximo, cantidad de OC y riesgos. El «¿qué pasa si…?» recalcula los cuatro en vivo, y elegir uno pre-adjudica la cotización.',
  existe: 'En dev están «más barato» y «más rápido» dentro de la cotización. Lo nuevo: compararlos lado a lado, los filtros en vivo y la recomendación con IA.',
  reglas: ['Elegir escribe `compra = { estrategia, adjudicadas }`; la cotización y el presupuesto lo leen.', 'Por defecto no se adjudican listas vencidas.', 'La IA recomienda con fuentes y marca lo inferido; no adjudica sin confirmación, y sin IA se elige a mano igual.'],
  estados: [['Recomendación IA', 'd-com-escenarios.html?vista=ia'], ['Sin IA', 'd-com-escenarios.html?vista=ia&estado=sin-ia'], ['Tabla', 'd-com-escenarios.html?vista=tabla']],
  marcos: `
    d|d-com-escenarios.html|Cuatro escenarios con «¿qué pasa si…?»|Sacá un distribuidor o exigí stock: todo se recalcula
    d|d-com-escenarios.html?vista=ia|Recomendación explicada|Fuentes, inferencias marcadas y costo de la consulta
    d|d-com-escenarios.html?vista=ia&estado=sin-ia|Sin IA|Tope de consumo alcanzado: se elige a mano
  `,
},
{
  id: 'presupuesto', orden: 320, etapa: 'Presupuesto', horizonte: 'h1', roles: ['pres', 'dir'],
  refs: ['Visión · no hay presupuesto, margen ni IVA', 'Rapsody · mano de obra propia', 'Mercado · inflación y dólar BNA'],
  titulo: 'Presupuesto al comitente', corto: 'Presupuesto',
  descripcion: 'Materiales del escenario elegido, más mano de obra por tablero (horas × repeticiones × tarifa), más gastos y margen objetivo. El IVA 21 % es un cálculo de presentación rotulado, en pesos con referencia al dólar BNA, con una validez corta y una cláusula de ajuste. Tiene vista del cliente sin distribuidores ni costos, versiones con diff, y aprobación de dirección cuando el margen baja del umbral.',
  existe: 'Nada: la app termina en la orden de compra. Las líneas sin match entran «a estimar», con un monto cargado a mano.',
  reglas: ['El margen es sobre el precio de venta.', 'Debajo del 18 % no sale sin la aprobación de dirección.', 'El cliente ve un precio por tablero; nunca el distribuidor ni el precio de compra.', 'Si la adjudicación cambia, el presupuesto se recalcula.'],
  estados: [['Vista del cliente', 'd-com-presupuesto.html?vista=cliente'], ['Versiones', 'd-com-presupuesto.html?vista=versiones'], ['Sin escenario', 'd-com-presupuesto.html?estado=vacio'], ['Cargando', 'd-com-presupuesto.html?estado=cargando']],
  marcos: `
    d|d-com-presupuesto.html|Versión interna con margen e IVA|Mové el margen: con menos del 18 % pide aprobación
    d|d-com-presupuesto.html?vista=cliente|PDF para el comitente|Sin distribuidores ni precios de compra
    d|d-com-presupuesto.html?vista=versiones|v1 → v2 con diff|Qué cambió y por qué
  `,
},
{
  id: 'recotizar', orden: 330, etapa: 'Presupuesto', horizonte: 'h1', roles: ['pres', 'comp'],
  refs: ['Entrevista HCM · re-cotizar una lista vieja', 'INDEC IPC agosto 2026 · 1,7 %'],
  titulo: 'Re-cotizar con precios de hoy', corto: 'Re-cotizar',
  descripcion: 'Una cotización vieja (Torre Alem, septiembre) o el as-built de un tablero (?origen=<tablero>), contra las listas vigentes. Muestra el diff por línea (subió, bajó, salió de catálogo, sin stock), el impacto total y la inflación del período, y deja pedirle la lista actualizada a un distribuidor con lista vieja.',
  existe: 'Nada. Se apoya en priceValidUntil, STALE_PRICE y ProviderPriceHistory, que sí existen.',
  reglas: ['La cotización vieja queda congelada; se crea una nueva.', 'Si una línea salió de catálogo, se ofrece la alternativa con el mismo match canónico en otro catálogo.', 'Comparar contra una lista vencida se avisa.'],
  estados: [['Por distribuidor', 'd-com-recotizar.html?vista=distribuidor'], ['As-built del TGBT', 'd-com-recotizar.html?origen=tgbt'], ['Error', 'd-com-recotizar.html?estado=error']],
  marcos: `
    d|d-com-recotizar.html|Diff por línea contra las listas de hoy|+4,9 % contra 1,5 % de inflación del período
    d|d-com-recotizar.html?vista=distribuidor|Por distribuidor|Pedí la lista actualizada a Casa Volta
    d|d-com-recotizar.html?origen=tsbombas|Desde el as-built de un tablero|Repuestos y ampliaciones
  `,
},
{
  id: 'pedidos', orden: 340, etapa: 'Compras', horizonte: 'existe', roles: ['comp', 'dir'],
  refs: ['OrdersPage.tsx', 'Discovery · contraoferta por línea', 'responseDeadlineAt'],
  titulo: 'Pedidos, contraofertas y aprobación', corto: 'Pedidos',
  descripcion: 'El listado de pedidos que ya existe, con KPIs y el detalle por distribuidor en un panel lateral. Le suma un semáforo de vencimiento de la respuesta, la revisión de la contraoferta del distribuidor línea por línea (precio, plazo, equivalente, entrega parcial) y la aprobación por monto. Dirección aprueba o rechaza desde el teléfono, con comentario.',
  existe: 'En dev: KPIs En espera / Confirmados / Rechazados / Vencidos, la tabla, el pedido por proveedor y el estado vacío. Lo nuevo: el semáforo, la contraoferta (el área D escribe ordenes[].contra), la aprobación por monto y el móvil.',
  reglas: ['Una OC por encima de $ 20.000.000 queda retenida hasta que dirección la apruebe.', 'Para rechazar hay que dejar un comentario.', 'Si cambia la marca de un interruptor, se avisa de IEC 61439 (verificación de diseño).', 'El contacto del comprador se ve recién cuando el distribuidor confirma.'],
  estados: [['Vacío', 'd-com-pedidos.html?estado=vacio'], ['Contraoferta', 'd-com-pedidos.html?vista=contraoferta'], ['Sin pendientes (móvil)', 'm-com-aprobar.html?estado=vacio']],
  marcos: `
    d|d-com-pedidos.html|Pedidos con semáforo de respuesta|Clic en un pedido: panel con cada OC
    d|d-com-pedidos.html?vista=contraoferta|Contraoferta por línea|Aceptá o rechazá cada cambio
    m|m-com-aprobar.html|Dirección aprueba desde el teléfono|Presupuesto con margen bajo, pedido sobre el tope
    m|m-com-aprobar.html?id=apr-ped-033|Detalle y decisión|Aprobar o rechazar con comentario
  `,
},
{
  id: 'correos', orden: 350, etapa: 'Compras', horizonte: 's5', roles: ['comp', 'prov'],
  refs: ['Roadmap S5 · notificaciones por email de los dos lados', 'Entrevista Q Electric · trazabilidad'],
  titulo: 'Notificaciones por email con hilo', corto: 'Correos',
  descripcion: 'Cada OC tiene su hilo de correos: lo que liard le mandó al distribuidor, lo que él respondió, las copias para el comprador y los recordatorios programados, en una línea de tiempo con vista previa. También hay una vista de cómo le llega el correo al distribuidor, en su bandeja de entrada.',
  existe: 'Nada: está planificado para el Sprint 5. Hoy solo se mandan los correos de cuenta (confirmación y recuperación).',
  reglas: ['El hilo se arma a partir del estado de la OC: nunca contradice lo que muestra la pantalla.', 'El primer correo no revela los datos del comprador.', 'Los recordatorios salen el día anterior al vencimiento.'],
  estados: [['Otra OC', 'd-com-pedidos.html?vista=correos&oc=OC-2026-027-2']],
  marcos: `
    d|d-com-pedidos.html?vista=correos|Hilo de la OC con vista previa|Los dos lados, en orden
    d|d-com-correo.html|Así le llega al distribuidor|Bandeja de entrada de Eléctrica Norte
  `,
}
);
