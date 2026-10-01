/* Área E · Fabricación, obra y mantenimiento (orden 500–599). Nada de esto existe en dev: todo es propuesta. */
(window.SECCIONES ||= []).push(
  {
    id: 'campo-recepcion', orden: 500, etapa: 'Obra', horizonte: 'h1', roles: ['obra', 'comp', 'tal'],
    refs: ['research/producto.md §5 · 15 Recepción y remitos', 'Entrevistas: Electrobase carga remito al ingresar mercadería', 'Fieldwire (QR y reporte por subcontratista)'],
    titulo: 'Recepción de materiales y entregas parciales', corto: 'E1 Recepción',
    descripcion: 'El jefe de obra o de taller recibe el remito en el teléfono: escanea (la IA lo lee), tilda lo que llegó por línea y saca la foto del remito firmado. Lo que falta sale como aviso a compras con la OC y el distribuidor. En escritorio, cada OC muestra pedido / recibido / pendiente por línea, quién lo frena y a qué tableros afecta.',
    existe: 'Existen las OC (PurchaseOrder SENT/CONFIRMED/REJECTED/EXPIRED) y su detalle por proveedor. No hay remito, recepción ni entregas parciales.',
    reglas: [
      'La recepción nunca cambia la OC: registra lo que llegó contra lo pedido (cantidad «a comprar», no la dibujada).',
      'Faltante = pedido − recibido acumulado de todos los remitos; genera un aviso a compras con OC y distribuidor.',
      'La foto del remito firmado es obligatoria para confirmar.',
      'Sin IA (o si la lectura falla) se carga el remito a mano: se precargan las líneas pendientes de la OC.',
      'Una OC sin confirmar se puede recibir igual (llegó mercadería), con advertencia.',
    ],
    estados: [['Escanear (sin IA)', 'm-tal-recibir.html?estado=sin-ia'], ['Hoy vacío', 'm-tal-hoy.html?estado=vacio'], ['Error de carga', 'd-tal-entregas.html?estado=error'], ['Cargando', 'd-tal-entregas.html?estado=cargando']],
    marcos: `
      m|m-tal-hoy.html|Hoy, en el teléfono del jefe de obra|Qué llega, qué está frenado, qué sale a obra
      m|m-tal-recibir.html?paso=lineas|Remito leído: tildar cantidades|Faltante → aviso a compras
      d|d-tal-entregas.html|Pedido, recibido y pendiente por OC|Quién frena cada línea y a qué tablero afecta
    `,
  },
  {
    id: 'campo-taller', orden: 510, etapa: 'Fabricación', horizonte: 'h2', roles: ['tal', 'dir'],
    refs: ['research/producto.md §2 etapa 5 y §5 · 16 Tablero en taller', 'Entrevista GRAMONT (IEC 61439-1/-2)', 'Visión: capacidad para fabricar más tableros'],
    titulo: 'Taller: tableros por estado, faltantes y horas', corto: 'E2 Taller',
    descripcion: 'Tablero kanban de los tableros físicos de la obra (por armar · armando · en ensayo · frenado · listo para entregar). Cada tarjeta muestra avance, armadores, materiales en el taller y, si está frenado, la línea del BOM que lo frena y quién lo destraba. Al abrirla: lista de armado con el origen de cada aparato (stock, OC, sin OC), lista de corte de cables y horas reales contra presupuestadas, que alimentan el margen.',
    existe: 'Nada: los tableros son planos (ElectricalPlan) con su BOM. No hay estado de fabricación, armadores ni horas.',
    reglas: [
      'Un plano sin BOM aprobado queda en «por armar» con el motivo (error, en proceso, en cola).',
      'Un tablero pasa a «listo para entregar» solo con el protocolo firmado.',
      'Frenar pide la línea que falta y avisa a compras; destrabar una línea que sigue sin poder cotizarse pide una nota.',
      'El taller no edita el BOM: «Completar en el BOM» lleva a ingeniería.',
      'Desvío del margen = (horas reales ÷ avance − horas presupuestadas) × costo hora; la espera por faltantes va aparte.',
    ],
    estados: [['Vacío', 'd-tal-taller.html?estado=vacio'], ['Cargando', 'd-tal-taller.html?estado=cargando'], ['Tabla', 'd-tal-taller.html?vista=lista'], ['Panel del TS-PISO', 'd-tal-taller.html?tablero=tspiso']],
    marcos: `
      d|d-tal-taller.html|Kanban del taller con faltantes|Arrastrá una tarjeta; a «listo» solo con protocolo
      d|d-tal-taller.html?tablero=tgbt|Lista de armado del TGBT|De dónde sale cada aparato
      m|m-tal-tablero.html|Frente del tablero en el teléfono|Tocá un aparato → línea del BOM, OC, garantía
      m|m-tal-tablero.html?ref=Q0|Ficha del aparato Q0|Marcar montado o reportar
    `,
  },
  {
    id: 'campo-protocolo', orden: 520, etapa: 'Fabricación', horizonte: 'h2', roles: ['tal', 'ing'],
    refs: ['IEC 61439-1/-2 cap. 11 (verificaciones de rutina)', 'AEA 90364-7-771 · 771.20', 'research/mercado.md · 12 Checklist de verificación de rutina'],
    titulo: 'Protocolo de ensayos IEC 61439 con placa y QR', corto: 'E3 Protocolo',
    descripcion: 'Checklist de las verificaciones de rutina del tablero terminado, con mediciones cargadas o importadas del megóhmetro, fotos, observaciones y dos firmas (realizó y controló). Un valor fuera de criterio marca el ensayo como fallido y bloquea la firma; la no conformidad queda registrada. Al emitir se genera el PDF, la placa de características con QR y el tablero pasa a «listo para entregar».',
    existe: 'Nada.',
    reglas: [
      'Es una guía basada en la norma, no un reemplazo: los criterios numéricos son del taller y se revisan con la especificación del comitente.',
      'Aislación < 1 MΩ o continuidad PE > 0,10 Ω = falla: no se puede firmar hasta repetir la medición.',
      'Se firma con todas las verificaciones aprobadas o «no aplica»; el protocolo emitido no se edita (un cambio abre revisión).',
      'El QR de la placa abre la ficha pública del tablero, sin datos comerciales.',
    ],
    estados: [['Ensayo fallido', 'd-tal-protocolo.html?estado=fallido'], ['Hoja PDF', 'd-tal-protocolo.html?vista=hoja'], ['Tablero aún en armado', 'd-tal-protocolo.html?tablero=tgbt']],
    marcos: `
      d|d-tal-protocolo.html|Checklist del TSG-PB en ensayo|Cargá la aislación que falta y firmá
      d|d-tal-protocolo.html?estado=fallido|Aislación baja en Q7|Bloquea la firma · no conformidad
      d|d-tal-protocolo.html?vista=hoja|Así sale el PDF|
    `,
  },
  {
    id: 'campo-alcance', orden: 530, etapa: 'Obra', horizonte: 'h2', roles: ['obra', 'ing', 'comp', 'pres'],
    refs: ['research/producto.md §2 etapa 6 · cambios de alcance', 'Beam AI · Addendum Variance Report', 'Trimble Accubid ChangeOrder'],
    titulo: 'Cambios de alcance y entregas a obra', corto: 'E4 Alcance y entregas',
    descripcion: 'Un pedido de la obra (minuta) se convierte en tres impactos encadenados: líneas que suman cantidad en el BOM (lo aplica ingeniería), un pedido adicional a la OC ya enviada (no se edita la OC original) y un adicional al comitente con materiales a precio de hoy, mano de obra, margen e IVA rotulado. Los tableros listos salen a obra con remito propio y protocolo anexo.',
    existe: 'Nada: la OC enviada no se puede modificar en dev (solo aceptar o rechazar).',
    reglas: [
      'La OC enviada no se toca: el material extra va como PED-…-A con una OC por distribuidor, a los precios de la cotización vigente.',
      'El adicional al comitente toma el margen del presupuesto de la obra; el IVA se muestra como cálculo de presentación.',
      'Los pasos se habilitan en orden: BOM → OC → adicional.',
      'Solo se puede sumar a un remito de entrega un tablero «listo» (protocolo firmado).',
    ],
    estados: [['Sin tableros listos', 'd-tal-entregas.html?vista=entregas']],
    marcos: `
      d|d-tal-entregas.html?vista=alcance|CA-01: 2 circuitos más en el TGBT|BOM → pedido adicional → adicional al comitente
      d|d-tal-entregas.html?vista=entregas|Remitos de entrega a obra|Con protocolo firmado y QR
    `,
  },
  {
    id: 'campo-mantenimiento', orden: 540, etapa: 'Mantenimiento', horizonte: 'h3', roles: ['dir', 'ing', 'cli'],
    refs: ['Entrevista HCM: «un cliente vuelve con una cotización de hace dos años»', 'Schneider mySchneider Equipment Tracker', 'Rittal ePOCKET', 'research/mercado.md · 14 QR / pasaporte del tablero'],
    titulo: 'Mantenimiento, as-built y QR del tablero', corto: 'E5 As-built y QR',
    descripcion: 'Los tableros entregados por obra y cliente, con su as-built (lo instalado de verdad, con contraofertas y cambios de obra), documentos e historial. Plan preventivo sugerido (termografía anual, reapriete, prueba de diferenciales), pedidos de repuesto y ampliaciones que re-cotizan la lista vieja con precios de hoy, y oportunidades por antigüedad o aparatos discontinuados. El QR pegado en el tablero abre una ficha pública: placa, documentación, historial y «pedir servicio».',
    existe: 'Nada: los proyectos quedan guardados, pero no hay entrega, as-built ni vista pública.',
    reglas: [
      'Se re-cotiza el as-built, no el presupuesto original.',
      'Discontinuado = ningún catálogo vigente ofrece ese componente base con esos atributos; el reemplazo se propone por atributos esenciales, nunca por nombre.',
      'La vista del QR no muestra precios, distribuidores ni OC; los planos de obra quedan detrás de un enlace al responsable.',
      'Las etiquetas QR consumen el cupo del plan; los tableros ya etiquetados siguen funcionando al llegar al límite.',
    ],
    estados: [['Vacío', 'd-tal-mantenimiento.html?estado=vacio'], ['Límite de QR', 'd-tal-mantenimiento.html?estado=limite'], ['QR no reconocido', 'm-cli-tablero.html?estado=error'], ['As-built de Libertador', 'd-tal-mantenimiento.html?tablero=lib-tg']],
    marcos: `
      d|d-tal-mantenimiento.html|Tableros entregados por obra|Vencidos, discontinuados, pedidos de servicio
      d|d-tal-mantenimiento.html?vista=oportunidades|Repuestos y oportunidades|Re-cotizar con precios de hoy
      m|m-cli-tablero.html?tablero=lib-tg|Lo que abre el QR del tablero|Vista pública, sin datos comerciales
    `,
  },
);
