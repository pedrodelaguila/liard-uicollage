/* Área D · Distribuidor (rol SUPPLIER). Eléctrica Norte S.A. = proveedor «en» de data.js. */
(window.SECCIONES ||= []).push(
  {
    id: 'prov-catalogo', orden: 400, etapa: 'Comercial', horizonte: 'existe', roles: ['prov'],
    refs: ['front/src/pages/supplier/SupplierCatalog*', 'Arquitectura · integración con proveedores', 'Visión · catálogo canónico'],
    titulo: 'Catálogo del distribuidor: importación .xlsx y lectura con IA', corto: 'Catálogo e importación',
    descripcion: 'El distribuidor sube su lista de precios en Excel con su propio formato. Se lee en tres pasos (elegir planilla, revisar la lectura, confirmar) y nada se importa hasta el último. Después, una lectura con IA vincula cada producto a su componente base del catálogo canónico, con progreso, costo y tiempo restante en vivo; lo que no se pudo leer o le falta un atributo esencial queda en una bandeja para completarlo a mano.',
    existe: 'Mis productos (tabla, publicar/despublicar, alta y edición), Cargar catálogo en 3 pasos con mapeo de columnas recordado por encabezado, reglas de catálogo, historial de cargas, Vinculación con CatalogReadingProgress, conteos Todas/Listas/Les falta un atributo/Sin vincular y ficha por producto. Refinado acá: el subtítulo ya no dice «undefined productos», la columna de precio no se corta, la bandeja muestra primero lo pendiente, el costo estimado de la lectura aparece antes de confirmar y hay atajos (J siguiente pendiente).',
    reglas: ['El precio se guarda sin IVA; una importación nueva no cambia el precio de las solicitudes ya enviadas.', 'Corregido a mano (MANUAL) no se vuelve a leer en una carga nueva.', 'Sin componente base o con un atributo esencial vacío, el producto no entra en el matching: nunca se inventa un vínculo.', 'Cada lectura con IA muestra su costo en US$ y descuenta del tope mensual; sin IA, se vincula a mano.'],
    estados: [['Leyendo (recién importado)', 'd-prov-catalogo.html?vista=vincular&estado=leyendo'], ['Sin IA (tope alcanzado)', 'd-prov-catalogo.html?vista=vincular&estado=sin-ia'], ['Planilla rechazada', 'd-prov-catalogo.html?vista=importar&estado=error'], ['Catálogo vacío', 'd-prov-catalogo.html?estado=vacio'], ['Error al cargar', 'd-prov-catalogo.html?estado=error'], ['Confirmar importación', 'd-prov-catalogo.html?vista=importar&paso=3']],
    marcos: `
      d|d-prov-catalogo.html|Mis productos|Lectura en curso arriba; editar, despublicar, ir a vincular
      d|d-prov-catalogo.html?vista=importar&paso=2|Revisar la lectura de la planilla|Mapeo recordado del 29/09 y reglas de catálogo
      d|d-prov-catalogo.html?vista=vincular|Vinculación con lectura IA en vivo|Completá el atributo de la bornera y pasa a «Listas»
    `,
  },
  {
    id: 'prov-solicitud', orden: 410, etapa: 'Compras', horizonte: 'h1', roles: ['prov', 'comp'],
    refs: ['Entrevistas · flujo comercial, paso 5', 'Roadmap S5 · BOM alternativo', 'front/src/pages/supplier/SupplierRequest*'],
    titulo: 'Solicitud con respuesta por línea y contraoferta', corto: 'Contraoferta por línea',
    descripcion: 'Hoy el distribuidor solo acepta o rechaza la solicitud entera. Acá responde cada línea: confirmar, cambiar precio, cambiar plazo, ofrecer un equivalente (otra marca o gama con el mismo componente base y los mismos atributos esenciales, con la advertencia de verificación de diseño IEC 61439), entrega parcial o sin stock. El total se recalcula sin IVA. En las líneas donde el comprador armó un BOM alternativo, el vendedor elige si cotiza la principal, la alternativa o las dos. Al enviar se escribe <code>pedidos[0].ordenes[0].contra</code> (OC-2026-031-1) y un aviso, que lee el área de Compras.',
    existe: 'Tarjetas Recibidas/Aceptadas/Rechazadas con filtros, detalle con Datos de la solicitud y tabla de líneas, Aceptar/Rechazar con sus modales y el contacto del comprador que se revela recién al aceptar (antes la ruta responde 409). Refinado: la tarjeta dice «Proyecto» (en dev muestra el proyecto bajo «Nombre del cliente») y suma el comprador anónimo, el vencimiento y el motivo del rechazo.',
    reglas: ['El contacto del comprador se ve cuando el distribuidor acepta, o cuando el comprador acepta su contraoferta.', 'Un equivalente solo se ofrece si coinciden componente base y todos los atributos esenciales.', 'El total adjudicable cuenta la principal o la alternativa, nunca las dos.', 'Las sugerencias del ERP (stock comprometido, reposición) se proponen pero no se aplican solas.', 'Atajos: A aceptar, R rechazar, E enviar contraoferta.'],
    estados: [['Contraoferta enviada', 'd-prov-solicitudes.html?oc=OC-2026-031-1&estado=contraoferta'], ['Ofrecer equivalente (panel)', 'd-prov-solicitudes.html?oc=OC-2026-031-1&linea=l06'], ['Rechazar con motivo', 'd-prov-solicitudes.html?oc=OC-2026-031-1&dialogo=rechazar'], ['Como en dev', 'd-prov-solicitudes.html?oc=OC-2026-031-1&vista=dev'], ['Aceptada con contacto', 'd-prov-solicitudes.html?oc=OC-2026-025-1'], ['Sin solicitudes', 'd-prov-solicitudes.html?estado=vacio'], ['Cargando', 'd-prov-solicitudes.html?estado=cargando'], ['Error', 'd-prov-solicitudes.html?estado=error']],
    marcos: `
      d|d-prov-solicitudes.html|Solicitudes recibidas|Tarjetas como en dev, con vencimiento y BOM alternativo
      d|d-prov-solicitudes.html?oc=OC-2026-031-1|Responder línea por línea|Aplicá lo que dice el ERP, cambiá un precio, elegí la alternativa
      d|d-prov-solicitudes.html?oc=OC-2026-031-1&estado=contraoferta|Contraoferta enviada|Diferencias por línea; retirar o editar
      d|d-prov-solicitudes.html?oc=OC-2026-031-1&linea=l06|Ofrecer un equivalente técnico|Tmax XT5 por Compact NSX630F, atributo por atributo
    `,
  },
  {
    id: 'prov-erp', orden: 420, etapa: 'Comercial', horizonte: 'h2', roles: ['prov'],
    refs: ['Visión · adaptadores', 'Entrevistas · HCM (SAP), Q Electric y Nisamat (Electrobase, Odoo)', 'Mercado · listas por condición comercial'],
    titulo: 'Listas por cliente y sincronización con el ERP', corto: 'Listas y ERP',
    descripcion: 'Un conector de solo lectura trae precio, stock y plazo de Electrobase, Odoo o SAP Business One con la frecuencia que elija el distribuidor; lo que no se resuelve solo (precio corregido a mano, producto sin componente base, baja con solicitudes abiertas) queda para decidir. Las listas por cliente aplican una bonificación sobre la lista general, general o por marca, en ARS o USD al dólar BNA, con vigencia; nunca son públicas. Un historial muestra cada cambio de precio con su origen.',
    existe: 'Nada de la sincronización. Existen la carga por planilla y el historial de precios (ProviderPriceHistory) sin pantalla.',
    reglas: ['El conector solo lee: no escribe en el ERP.', 'Cada cliente ve su lista; nadie ve la de otro.', 'Una lista nueva no cambia las solicitudes ya enviadas.', 'Si la sincronización falla, se publica el último precio con su fecha visible y se avisa.'],
    estados: [['Falla de conexión', 'd-prov-integraciones.html?estado=error'], ['Sin ERP conectado', 'd-prov-integraciones.html?estado=vacio'], ['Sincronizando', 'd-prov-integraciones.html?estado=cargando'], ['Historial de precios', 'd-prov-integraciones.html?vista=historial']],
    marcos: `
      d|d-prov-integraciones.html|Electrobase conectado|Frecuencia, qué manda el ERP y lo que hay que decidir
      d|d-prov-integraciones.html?vista=listas&lista=ld|Lista de Tableros Delta|Bonificación por marca, borrador que rige desde el 02/10
      d|d-prov-integraciones.html?estado=error|La sincronización falló|Se mantiene el último precio y se reintenta
    `,
  },
  {
    id: 'prov-vidriera', orden: 430, etapa: 'Comercial', horizonte: 'h2', roles: ['prov', 'comp'],
    refs: ['Entrevistas · Q Electric (zona y confianza)', 'Entrevistas · Nisamat (stock)', 'Demo 3 · vidriera'],
    titulo: 'Vidriera del distribuidor y demanda perdida', corto: 'Vidriera y demanda',
    descripcion: 'La ficha pública como la ve un tablerista al elegir a quién pedir cotización: zona de entrega, marcas, especialidades y métricas medidas por liard (tiempo de respuesta, tasa de respuesta y de confirmación, antigüedad de la lista), que no se pueden editar. Al lado, la demanda perdida: lo que le pidieron por liard y no cotizó (sin stock, por plazo, por la marca, porque no estaba vinculado), con el monto y una acción sugerida por fila.',
    existe: 'Nada. Hay datos del perfil de venta (marcas, zonas, pedido mínimo) en la cuenta del proveedor.',
    reglas: ['Las métricas salen de las solicitudes reales; el distribuidor no las escribe.', 'La demanda perdida cuenta solo lo que llegó por liard: no se ve qué distribuidor ganó ni a qué precio.', 'Sumar una marca a la vidriera no la pone en el matching: hace falta cargar su lista.'],
    estados: [['Sin demanda perdida', 'd-prov-vidriera.html?vista=demanda&estado=vacio']],
    marcos: `
      d|d-prov-vidriera.html|Tu vidriera, como la ve un tablerista|Editá zonas y marcas; sumá Siemens
      d|d-prov-vidriera.html?vista=demanda|Demanda perdida de septiembre|$ 20.955.240 por motivo, con la acción de cada fila
    `,
  },
  {
    id: 'prov-leads', orden: 440, etapa: 'Plataforma', horizonte: 's5', roles: ['prov'],
    refs: ['Roadmap S5 · Pagos: comisión por lead', 'Entrevistas · hipótesis sin validar', 'Arquitectura · pagos fuera de alcance'],
    titulo: 'Leads y comisión del distribuidor', corto: 'Leads y comisión',
    descripcion: 'Cada solicitud recibida por la plataforma es un lead. El contador del mes, el detalle por solicitud con su cargo, la factura de la comisión con su IVA y la disputa de un lead (duplicado, marcas que no trabaja, fuera de zona). Marcado como hipótesis sin validar: en discovery los distribuidores no confirmaron que la pagarían, y los montos son un ejemplo.',
    existe: 'Nada: el Sprint 5 planifica la suscripción y la comisión por lead.',
    reglas: ['La compra de materiales y el flete se pagan por fuera de liard; solo se factura la comisión.', 'Un lead cuenta aunque no se responda; se puede disputar y, si se acepta, no se cobra.', 'Tope mensual de comisión configurable por el distribuidor.'],
    estados: [['Tope alcanzado', 'd-prov-leads.html?estado=limite'], ['Cobro rechazado', 'd-prov-leads.html?estado=error'], ['Mes en curso', 'd-prov-leads.html?mes=oct']],
    marcos: `
      d|d-prov-leads.html|Septiembre: 18 leads, factura A 0004-00000127|Disputá el duplicado OC-2026-021-4
      d|d-prov-leads.html?estado=limite|Tope de comisión alcanzado|Los leads siguen llegando y no se facturan
    `,
  },
  {
    id: 'prov-inicio', orden: 450, etapa: 'Compras', horizonte: 'h1', roles: ['prov'],
    refs: ['Entrevistas · demanda desordenada por WhatsApp y mail', 'Entrevistas · métricas comerciales'],
    titulo: 'Inicio del distribuidor y el vendedor en la calle', corto: 'Inicio y móvil',
    descripcion: 'Lo primero que ve el vendedor: las solicitudes que vencen, su tasa de respuesta y de confirmación (las mismas que ve el tablerista), la lista más vieja, la demanda perdida del mes y la lectura del catálogo en curso. En el teléfono, la lista de solicitudes y una respuesta línea por línea con tres botones grandes (confirmar, plazo, sin stock) que comparte el borrador con la computadora.',
    existe: 'Nada: en dev el proveedor entra directo a Solicitudes recibidas y no hay vista de teléfono propia.',
    reglas: ['El borrador de la respuesta es uno solo: lo empezado en el teléfono sigue en la computadora.', 'Precio y equivalentes se responden desde la computadora; en el teléfono solo confirmar, plazo y sin stock.', 'Sin señal, la respuesta se guarda y se manda al volver.'],
    estados: [['Distribuidor nuevo', 'd-prov-inicio.html?estado=vacio'], ['Cargando', 'd-prov-inicio.html?estado=cargando'], ['Vista de gerencia', 'd-prov-inicio.html?vista=gerencia'], ['Teléfono sin conexión', 'm-prov-responder.html?estado=error'], ['Teléfono sin solicitudes', 'm-prov-solicitudes.html?estado=vacio']],
    marcos: `
      d|d-prov-inicio.html|Inicio del vendedor|Vencimientos, tasas, listas viejas, demanda perdida
      m|m-prov-solicitudes.html|Solicitudes en el teléfono|La que vence mañana, marcada
      m|m-prov-responder.html?i=1|Responder una línea|Plazo de 12 días para el Compact NSX 250
    `,
  },
);
