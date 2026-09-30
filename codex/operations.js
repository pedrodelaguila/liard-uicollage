(() => {
  'use strict';
  const L = window.L;
  if (!L) return;
  const page = document.getElementById('page');
  const route = L.page();
  const view = {step:0,focus:0,scenarioId:null,selectedOrder:null,preview:null,status:new URLSearchParams(location.search).get('estado'),busy:false,result:null,networkSupplier:'s1'};
  const E = L.escape;
  const money = L.money;
  const dollars = cents => (cents / 100).toFixed(2);
  const now = () => new Date().toISOString();
  const itemQty = (line,p) => L.qty(line,p);
  const cents = value => Math.round(Number(value) * 100);
  const project = state => state.projects.find(p => p.id === L.project()?.id) || state.projects[0];
  const badge = (copy,color='blue') => `<span class="badge ${color}">${E(copy)}</span>`;
  const errorBox = () => '<div id="op-error" class="op-error" role="alert" aria-live="assertive"></div>';
  const button = (action,text,kind='secondary',extra='') => `<button type="button" class="btn ${kind}" data-action="${action}" ${extra}>${text}</button>`;
  const link = (file,text,extra={}) => `<a class="btn secondary" href="${L.href(file,extra)}">${E(text)}</a>`;
  const section = (index,title,body) => `<section class="card op-section" data-op-section="${index}"><div class="op-step-caption">${String(index+1).padStart(2,'0')} / DECISIÓN TRAZABLE</div><h2>${title}</h2>${body}</section>`;
  const nav = () => `<nav class="op-nav" aria-label="Continuidad del proyecto">${route==='m-field.html'?link('m-field.html','Recepción y entrega')+link('d-panel.html','Panel conceptual'):link('d-operations.html','Costos y asistencia')+link('d-collaboration.html','Equipo y reglas')+link('d-network.html','Red e integración')+link('m-field.html','Obra y servicio')}</nav>`;
  function heading(kicker,title,description,tag='Propuesto') {
    return `<header class="op-head"><div><div class="op-eyebrow">${E(kicker)}</div><h1>${E(title)}</h1><p class="muted">${E(description)}</p></div><div class="op-chips">${badge(tag)}${badge('Datos ficticios · local','amber')}</div></header>${nav()}`;
  }
  function layout(sections,labels,hint) {
    const variant = L.variant();
    const max = sections.length - 1;
    view.step = Math.min(max,view.step);
    view.focus = Math.min(max,view.focus);
    if (variant === 'guided') {
      return `<div class="notice">Recorrido guiado · ${E(hint)}</div><nav class="op-guided" aria-label="Pasos">${labels.map((l,i)=>`<button type="button" class="${view.step===i?'is-selected':''}" data-action="step" data-index="${i}" aria-current="${view.step===i?'step':'false'}">${i+1}. ${E(l)}</button>`).join('')}</nav>${sections[view.step]}<div class="op-formactions">${view.step>0?button('step','Paso anterior','secondary',`data-index="${view.step-1}"`):''}${view.step<max?button('step','Continuar','primary',`data-index="${view.step+1}"`):''}</div>`;
    }
    if (variant === 'visual') {
      return `<div class="op-linkmap" aria-label="Mapa de decisiones">${labels.map((l,i)=>`<button type="button" data-action="focus" data-index="${i}" class="${view.focus===i?'is-selected':''}" aria-pressed="${view.focus===i}">${String(i+1).padStart(2,'0')}<small>${E(l)}</small></button>`).join('<span aria-hidden="true">→</span>')}</div><div class="op-mini muted">Seleccioná un nodo para abrir su inspector. El mapa muestra relaciones de trabajo; cada formulario tiene una alternativa accesible.</div><br>${sections[view.focus]}`;
    }
    if (variant === 'assisted') {
      return `<div class="op-assist-layout"><aside class="op-assist-aside"><span class="op-badge">IA · SIMULACIÓN</span><h3>Antes de decidir</h3><p class="op-mini">${E(hint)}</p><ol>${labels.map((l,i)=>`<li>${E(l)}<br><button type="button" class="btn ghost" data-action="focus-scroll" data-index="${i}">Revisar evidencia</button></li>`).join('')}</ol><p class="op-mini">El equipo aprueba cada cambio. Podés completar todos los pasos a mano.</p></aside><div class="stack">${sections.join('')}</div></div>`;
    }
    return `<div class="op-grid">${sections.join('')}</div>`;
  }
  function costs(p,s) {
    const rfqIds = new Set((s.rfqs||[]).filter(r=>r.projectId===p.id).map(r=>r.id));
    const offer=(s.offers||[]).find(o=>rfqIds.has(o.rfqId)&&o.status==='ACCEPTED') || (s.offers||[]).find(o=>rfqIds.has(o.rfqId)&&o.status==='SUBMITTED');
    const scenarioOffer=offer?{...offer,lines:p.lines.map(l=>({lineId:l.id,quantity:itemQty(l,p),priceCents:offer.lines.find(ol=>ol.lineId===l.id)?.priceCents??l.referenceCents}))}:null;
    return {...L.costs(p,scenarioOffer),source:offer?'Escenario con precios de oferta · verificar vigencia':'Precio de referencia · no confirmado'};
  }
  function finance(s,p) {
    view.result=p.assistantSuggestion||null;
    const c=costs(p,s),budget=s.budget;
    const remaining=Math.max(0,budget.limitCents-budget.spentCents-budget.reservedCents);
    const scenarioRows=(p.scenarios||[]).map(sc=>{
      const cc=costs({...p,...sc},s);
      return `<tr><td>${E(sc.name)}</td><td>${money(cc.totalCents)}</td><td>${money(cc.revenueCents)}</td><td>${cc.marginPercent.toFixed(1)} %</td><td>${button('apply-scenario','Aplicar','ghost',`data-id="${sc.id}"`)}${button('delete-scenario','Eliminar','ghost',`data-id="${sc.id}"`)}</td></tr>`;
    }).join('');
    const financeBody=`<div class="op-chips">${badge(c.source,c.source.startsWith('Oferta')?'green':'amber')}${badge('USD netos · sin IVA','blue')}</div><form data-form="scenario"><div class="op-inputs"><label>Tableros / multiplicador<input name="multiplier" type="number" min="1" max="100" step="1" required value="${p.multiplier}"></label><label>Mano de obra · USD<input name="labor" type="number" min="0" max="10000000" step="0.01" required value="${dollars(p.laborCents)}"></label><label>Gastos · USD<input name="overhead" type="number" min="0" max="10000000" step="0.01" required value="${dollars(p.overheadCents)}"></label><label>Contingencia · %<input name="risk" type="number" min="0" max="100" step="0.1" required value="${p.riskPercent}"></label><label>Precio de venta · USD<input name="revenue" type="number" min="0.01" max="100000000" step="0.01" required value="${dollars(p.revenueCents)}"></label><label>Nombre del escenario<input name="name" maxlength="70" required value="${E(view.scenarioId?(p.scenarios||[]).find(sc=>sc.id===view.scenarioId)?.name||'Alternativa':'Alternativa de compra')}"></label></div><p class="op-mini muted">El multiplicador afecta cantidades. Cambiarlo exige una nueva revisión antes de pedir ofertas. Los escenarios son borradores; aplicarlos cambia el proyecto.</p><div class="op-formactions"><button class="btn primary" type="submit">Guardar escenario</button>${button('recalculate','Calcular sin guardar')}</div></form><div id="op-preview" aria-live="polite"></div><div class="op-metrics"><div class="op-stat"><small>COSTO TOTAL</small><strong>${money(c.totalCents)}</strong></div><div class="op-stat"><small>CONTRIBUCIÓN</small><strong>${money(c.marginCents)}</strong></div><div class="op-stat"><small>MARGEN / VENTA</small><strong>${c.marginPercent.toFixed(1)} %</strong></div></div><p class="op-mini">Margen = (venta − costo) / venta. El recargo sería (venta − costo) / costo. El modelo incorpora materiales, mano de obra, gastos y contingencia; no garantiza utilidad neta.</p><div class="table-wrap"><table class="op-table"><thead><tr><th>Escenario</th><th>Costo</th><th>Venta</th><th>Margen</th><th>Acciones</th></tr></thead><tbody>${scenarioRows||'<tr><td colspan="5">Todavía no guardaste alternativas.</td></tr>'}</tbody></table></div>${button('export-scenarios','Descargar comparación CSV')}`;
    const reviewable=p.lines.filter(l=>!l.technicalApproved||l.canonicalStatus!=='confirmed');
    const result=view.result?`<div class="op-panel-light"><span class="op-badge">INFERENCIA · REVISIÓN HUMANA</span><h3>${E(view.result.title)}</h3><p>${E(view.result.copy)}</p><p class="op-mini">Fuentes: BOM v${p.version}, atributos de catálogo ficticio y escenario vigente. No se consultó un modelo externo.</p>${view.result.lineId?`<form data-form="review-line"><input name="lineId" type="hidden" value="${view.result.lineId}"><label class="op-check"><input name="verified" type="checkbox" required> Verifiqué el componente y sus atributos en la evidencia técnica. Apruebo esta decisión.</label><button type="submit" class="btn primary">Aprobar con responsabilidad técnica</button></form>`:`<form data-form="approve-advice"><label class="op-check"><input name="verified" type="checkbox" required> Revisé el cálculo y quiero registrar la recomendación como una nota, sin alterar precios ni compras.</label><button class="btn primary" type="submit">Registrar decisión humana</button></form>`}</div>`:'';
    const assistantBody=`<p class="op-mini">Una lectura local ficticia cuesta <strong>USD 3,00</strong>. Se reserva presupuesto antes de ejecutarla; si no alcanza, no se consume. No hay llamadas pagas.</p><div class="op-metrics"><div class="op-stat"><small>DISPONIBLE</small><strong>${money(remaining)}</strong></div><div class="op-stat"><small>CONSUMIDO</small><strong>${money(budget.spentCents)}</strong></div><div class="op-stat"><small>RESERVADO</small><strong>${money(budget.reservedCents)}</strong></div></div><div class="op-budget"><span style="width:${Math.min(100,(budget.spentCents+budget.reservedCents)/Math.max(1,budget.limitCents)*100)}%"></span></div><form data-form="assistant"><label class="op-label">Asistente especializado<select name="specialist"><option value="review">Revisión · faltantes técnicos</option><option value="estimate">Presupuesto · contribución y riesgos</option><option value="procurement">Compras · disponibilidad y oferta</option><option value="catalog">Catálogo · lectura y atributos</option></select></label><div class="op-formactions"><button class="btn primary" type="submit" ${view.busy?'disabled':''}>${view.busy?'Reserva activa · preparando':'Ejecutar simulación · USD 3,00'}</button>${button('manual','Continuar con revisión manual')}</div></form>${errorBox()}${result}${budget.reservedCents>0&&!view.busy?button('release-reservation','Liberar reserva interrumpida · sin consumo','secondary'):''}<hr><form data-form="budget"><label class="op-label">Tope local de demostración · USD<input name="limit" required type="number" min="0" max="10000" step="0.01" value="${dollars(budget.limitCents)}"></label><div class="op-formactions"><button class="btn secondary" type="submit">Actualizar tope de simulación</button>${button('budget-limit','Probar presupuesto agotado','ghost')}</div></form><p class="op-mini muted">Este tope solo configura datos ficticios; no recarga saldo ni genera cargos.</p>${reviewable.length?`<p class="op-status">${reviewable.length} líneas requieren revisión. ${link('d-engineering.html','Abrir evidencia del plano')}</p>`:'<p class="op-status">El BOM está revisado. Cualquier cambio técnico vuelve a requerir aprobación.</p>'}`;
    const nextBody=`<div class="op-statement"><span class="op-eyebrow">DECISIÓN, NO PROMESA</span><strong>${c.marginPercent.toFixed(1)} %</strong><p>Margen bruto estimado del escenario aplicado.</p><p class="muted op-mini">${money(c.materialsCents)} materiales + ${money(c.shippingCents)} flete + ${money(c.laborCents)} mano de obra + ${money(c.overheadCents)} gastos + ${money(c.riskCents)} contingencia.</p></div><h3>Siguiente decisión</h3><p class="op-mini">Compartí el escenario con dirección, pedí una oferta firme y resolvé condiciones antes de ordenar.</p><div class="op-flow">${link('d-collaboration.html','Registrar decisión')}${link('d-comparison.html','Comparar ofertas')}${link('d-orders.html','Ver pedidos')}</div>${button('download-budget','Descargar presupuesto JSON')}`;
    return heading('Economía del proyecto', 'El margen se decide antes.',p.name+' · compará costo, capacidad y condiciones sin perder el criterio técnico.')+layout([section(0,'Construir un escenario',financeBody),section(1,'Asistencia bajo control',assistantBody),section(2,'Aprobar la próxima acción',nextBody)],['Escenario','Evidencia IA','Decisión'],'Guardá una alternativa y contrastá costos antes de aprobar la compra.');
  }
  function collaboration(s,p) {
    const notes=(p.notes||[]).map(n=>`<div class="op-note"><div class="row between"><strong>${E(n.author||'Equipo técnico')}</strong><small class="mono">${E((n.at||'').slice(0,16).replace('T',' '))}</small></div><p class="op-mini">${E(n.text||n.message||String(n))}</p>${badge('Privado · empresa','green')}</div>`).join('');
    const notesBody=`<p class="op-mini">Las notas del proyecto quedan dentro de la empresa. No se incluyen en la solicitud del proveedor ni revelan márgenes.</p><form data-form="note"><label class="op-label">Decisión o aclaración<textarea name="text" required minlength="5" maxlength="1000" placeholder="Ej.: validar poder de corte con el pliego antes de sustituir."></textarea></label><button class="btn primary" type="submit">Registrar nota privada</button></form><div>${notes||'<p class="muted op-mini">Todavía no hay decisiones registradas.</p>'}</div><div class="op-chips">${badge(`BOM versión ${p.version}`,'blue')}${badge(`${(p.notes||[]).length} decisiones`,'green')}</div><form data-form="revision"><label class="op-label">Motivo de nueva revisión<input name="reason" required minlength="5" maxlength="120" placeholder="Ej.: cliente modifica especificación del tablero"></label><button class="btn secondary" type="submit">Crear revisión del proyecto</button></form><p class="op-mini muted">Crear revisión invalida las solicitudes de la versión anterior para nuevas órdenes; conserva su snapshot y el historial.</p>`;
    const rules=(s.rules||[]).filter(r=>r.projectId===p.id);
    const ruleBody=`<p class="op-mini">Reglas privadas propuestas por discovery. Cada aplicación agrega una línea identificada y pendiente de aprobación; no convierte una inferencia en evidencia del plano.</p><form data-form="rule"><div class="op-inputs"><label>Nombre de la regla<input name="name" required maxlength="70" placeholder="Accesorios del contactor"></label><label>Componente origen<select name="source">${p.lines.filter(l=>!l.ruleId).map(l=>`<option value="${l.id}">${E(l.name)}</option>`).join('')}</select></label><label>Accesorio derivado<input name="accessory" required maxlength="70" placeholder="Terminal aislado · revisar sección"></label><label>Unidades por componente<input name="ratio" type="number" min="1" max="100" step="1" required value="2"></label><label>Precio de referencia · USD<input name="price" type="number" min="0" max="1000000" step="0.01" required value="0.80"></label><label>Justificación<input name="reason" required minlength="5" maxlength="180" placeholder="Regla interna; validar con responsable"></label></div><label class="op-check"><input name="consent" type="checkbox" required> Es una regla privada de nuestra empresa y la inferencia se revisará antes de cotizar.</label><button class="btn primary" type="submit">Guardar regla privada</button></form>${rules.map(r=>`<article class="op-supplier"><strong>${E(r.name)}</strong><p class="op-mini">${E(r.accessory)} × ${r.ratio} · ${E(r.reason)}</p><div class="op-chips">${badge('Inferencia · manual','amber')}${badge(r.applied?'Aplicada · revisar':'Sin aplicar','blue')}</div>${button('apply-rule',r.applied?'Ya aplicada':'Aplicar al BOM','secondary',`data-id="${r.id}" ${r.applied?'disabled':''}`)}${button('remove-rule','Eliminar regla','ghost',`data-id="${r.id}"`)}</article>`).join('')}${link('d-engineering.html','Revisar líneas derivadas')}`;
    const ev=(s.events||[]).filter(e=>!e.projectId||e.projectId===p.id).slice(0,15);
    const autoBody=`<p class="op-mini">Automatización de eventos local. Una alerta genera una tarea privada; no envía email, mensajes ni modifica pedidos.</p><form data-form="automation"><label class="op-check"><input type="checkbox" name="offerAlerts" ${s.automation.offerAlerts?'checked':''}> Crear una tarea al detectar oferta próxima a vencer</label><button type="submit" class="btn primary">Guardar automatización</button></form><div class="op-formactions">${button('simulate-event','Simular oferta próxima a vencer')}${button('export-events','Descargar trazabilidad CSV')}</div><div class="op-timeline">${ev.map(e=>`<article><small>${E((e.at||'').slice(0,16).replace('T',' '))} · ${E(e.actor||'Equipo')}</small><p>${E(e.description)}</p></article>`).join('')||'<p class="muted">No hay eventos registrados.</p>'}</div><h3>Tareas de seguimiento</h3>${(s.tasks||[]).filter(t=>t.projectId===p.id&&t.kind==='follow-up').map(t=>`<label class="op-check"><input type="checkbox" data-action="complete-followup" data-id="${t.id}" ${t.completed?'checked':''}>${E(t.text)}</label>`).join('')||'<p class="op-mini muted">Sin tareas automáticas.</p>'}`;
    return heading('Colaboración y cambios','Una versión. Un responsable.',p.name+' · documentá criterio técnico, reglas privadas y consecuencias de cada cambio.')+layout([section(0,'Decisión y revisión',notesBody),section(1,'Conocimiento de tu empresa',ruleBody),section(2,'Eventos que activan trabajo',autoBody)],['Equipo','Reglas privadas','Eventos'],'Toda inferencia necesita un responsable. Compartí solo el requerimiento comercial con el proveedor.');
  }
  function network(s,p) {
    const providers=s.suppliers.map(sup=>`<article class="op-supplier"><div class="row between"><h3>${E(sup.name)}</h3>${badge(sup.verified?'Identidad verificada · demo':'Verificación pendiente','amber')}</div><p class="op-mini">${E(sup.city||'Buenos Aires')} · distribución eléctrica · datos ficticios</p><p class="op-mini muted">La identidad no garantiza stock, capacidad ni equivalencia. Las ofertas deben confirmarse.</p>${button('select-provider','Preparar consulta calificada','secondary',`data-id="${sup.id}"`)}</article>`).join('');
    const dirBody=`<p class="op-mini">Exploración propuesta de proveedores por zona. Sus ofertas y condiciones privadas solo aparecen en los recorridos autorizados.</p><label class="op-label">Buscar proveedor o ciudad<input id="op-provider-search" type="search" placeholder="Nombre o zona" aria-label="Buscar proveedor"></label><div id="op-providers">${providers}</div>`;
    const leads=(s.leads||[]).filter(l=>l.projectId===p.id);
    const leadBody=`<form data-form="lead"><label class="op-label">Proveedor destinatario<select name="supplierId">${s.suppliers.map(sup=>`<option value="${sup.id}" ${sup.id===view.networkSupplier?'selected':''}>${E(sup.name)}</option>`).join('')}</select></label><div class="op-inputs"><label>Obra / zona<input name="zone" required minlength="2" maxlength="80" value="${E(p.site||'Buenos Aires')}"></label><label>Fecha requerida<input name="neededBy" type="date" required min="${new Date().toISOString().slice(0,10)}"></label></div><label class="op-label">Necesidad técnica resumida<textarea name="description" required minlength="10" maxlength="600" placeholder="Familia, cantidades y condición de suministro. No incluyas el margen ni planos privados."></textarea></label><label class="op-check"><input name="consent" type="checkbox" required> Autorizo compartir este resumen con el proveedor seleccionado. No incluye planos, margen ni ofertas de terceros.</label><label class="op-check"><input name="qualified" type="checkbox" required> Confirmo intención de compra y datos suficientes para una respuesta útil.</label><button class="btn primary" type="submit">Crear consulta calificada · simulación</button></form><p class="op-mini muted">Posible modelo comercial: lead aceptado con consentimiento. Su tarifa y disposición a pagar no están validadas. No se cobra ni envía una consulta real.</p>${leads.map(l=>`<article class="op-supplier"><strong>${E(s.suppliers.find(sup=>sup.id===l.supplierId)?.name||'Proveedor')}</strong><p class="op-mini">${E(l.description)}</p>${badge(l.status==='ACCEPTED'?'Aceptada · simulación':'Pendiente · local','blue')}<div class="op-formactions">${l.status==='NEW'?button('accept-lead','Simular aceptación','secondary',`data-id="${l.id}"`):''}${button('export-lead','Descargar resumen JSON','ghost',`data-id="${l.id}"`)}${link('d-rfq.html','Crear solicitud formal')}</div></article>`).join('')}`;
    const preview=view.preview?`<div class="op-panel-light"><h3>Vista previa del intercambio</h3><p class="op-mini">${view.preview.rows.length} filas · ${E(view.preview.name)}. El sistema origen no se modificó.</p><div class="table-wrap"><table class="op-table"><thead><tr><th>Código</th><th>Descripción</th><th>Cantidad</th></tr></thead><tbody>${view.preview.rows.map(r=>`<tr><td>${E(r.code)}</td><td>${E(r.name)}</td><td>${r.quantity}</td></tr>`).join('')}</tbody></table></div>${button('confirm-connector','Confirmar contrato local','primary')}${button('cancel-preview','Descartar vista previa','ghost')}</div>`:'';
    const connectors=(s.connectors||[]).filter(c=>c.projectId===p.id);
    const connectorBody=`<p class="op-mini">Piloto de interoperabilidad. Preparamos un contrato de datos y un archivo; no conectamos ERP, no usamos credenciales y no sincronizamos servicios reales.</p><form data-form="connector"><div class="op-inputs"><label>Sistema destino<select name="system"><option>Odoo · demo</option><option>SAP · demo</option><option>CSV genérico</option></select></label><label>Conjunto de datos<select name="dataset"><option value="bom">BOM aprobado / borrador identificado</option><option value="orders">Pedidos del proyecto</option></select></label><label>Nombre del intercambio<input name="name" required maxlength="70" value="${E(p.name)} · exportación"></label><label>Responsable<input name="owner" required maxlength="60" placeholder="Nombre del responsable"></label></div><label class="op-check"><input name="authorized" required type="checkbox"> Confirmé que soy responsable de estos datos; el paquete no incluye precios de otros clientes.</label><button type="submit" class="btn primary">Inspeccionar contrato y vista previa</button></form>${preview}<h3>Intercambios confirmados</h3>${connectors.map(c=>`<article class="op-supplier"><strong>${E(c.name)}</strong><p class="op-mini">${E(c.system)} · ${E(c.owner)} · snapshot v${c.projectVersion} · ${c.rows.length} filas</p>${button('download-connector','Descargar CSV','secondary',`data-id="${c.id}"`)}${button('delete-connector','Eliminar contrato local','ghost',`data-id="${c.id}"`)}</article>`).join('')||'<p class="op-mini muted">No hay intercambios. Cada confirmación conserva un snapshot.</p>'}`;
    return heading('Red e interoperabilidad','Conectar sin exponer.',p.name+' · una necesidad clara, un destinatario elegido y un contrato de datos explícito.')+layout([section(0,'Encontrar capacidad',dirBody),section(1,'Una consulta con permiso',leadBody),section(2,'Preparar el intercambio',connectorBody)],['Directorio','Consulta','Integración'],'Elegí proveedor, validá la necesidad y prepará un intercambio con responsable.');
  }
  function receiptQty(s,order,lineId) {
    return (s.receipts||[]).filter(r=>r.orderId===order.id).reduce((total,r)=>total+(r.items||[]).filter(i=>i.lineId===lineId).reduce((sum,i)=>sum+i.quantity,0),0);
  }
  function installed(s,order,lineId) {return (s.tasks||[]).some(t=>t.orderId===order.id&&t.lineId===lineId&&t.kind==='installation'&&t.installed);}
  function orderStatus(s,order) {return order.lines.every(l=>receiptQty(s,order,l.lineId)>=l.quantity);}
  function field(s,p) {
    const orders=(s.orders||[]).filter(o=>o.projectId===p.id);
    const order=orders.find(o=>o.id===view.selectedOrder)||orders[0];
    if (!order) return heading('Operación en campo','La obra necesita un pedido.',p.name+' · recepción, montaje, entrega y servicio comparten el mismo expediente.')+`<section class="card op-section"><div class="empty"><h2>Sin pedido para recibir</h2><p>Creá el pedido desde una oferta vigente, con cantidad y disponibilidad confirmadas.</p>${link('d-orders.html','Abrir compras')}${link('d-comparison.html','Comparar ofertas')}</div></section>`;
    const allReceived=orderStatus(s,order),allInstalled=order.lines.every(l=>installed(s,order,l.lineId));
    const assets=(s.assets||[]).filter(a=>a.orderId===order.id),asset=assets[0];
    const selector=`<label class="op-label">Pedido del proyecto<select id="op-order-selector">${orders.map(o=>`<option value="${o.id}" ${o.id===order.id?'selected':''}>${E(o.id)} · ${E(s.suppliers.find(sup=>sup.id===o.supplierId)?.name||'Proveedor')}</option>`).join('')}</select></label><div class="op-chips">${badge(({SENT:'Enviado',CONFIRMED:'Confirmado',PARTIAL:'Recepción parcial',RECEIVED:'Recibido'})[order.status]||'En seguimiento','blue')}${badge('USD ficticios','amber')}</div>`;
    const recBody=`${selector}<p class="op-mini">Registrá únicamente lo recibido. Las cantidades se acumulan y el faltante queda abierto.</p><form data-form="receipt"><input type="hidden" name="orderId" value="${order.id}">${order.lines.map(l=>{
      const got=receiptQty(s,order,l.lineId),remaining=l.quantity-got;
      return `<label class="op-receipt"><span><strong>${E(l.name)}</strong><small>${got} recibidas / ${l.quantity} pedidas · faltan ${remaining}</small></span><input type="number" name="qty-${l.lineId}" min="0" max="${Math.max(0,remaining)}" step="1" required value="0" aria-label="Recibir ${E(l.name)}"></label>`;
    }).join('')}<label class="op-label">Remito / referencia<input name="reference" required maxlength="80" placeholder="Ej.: DEMO-001"></label><div class="op-formactions"><button type="submit" class="btn primary" ${allReceived?'disabled':''}>Registrar recepción</button>${button('receive-remaining','Completar faltantes · simulación','secondary',`data-id="${order.id}" ${allReceived?'disabled':''}`)}</div></form><p class="op-status">${allReceived?'Recepción completa. Podés verificar el montaje.':'Recepción pendiente: ninguna instalación de una línea incompleta puede aprobarse.'}</p>${errorBox()}`;
    const installBody=`<p class="op-mini">Checklist conceptual. Verificá físicamente la pieza, versión y montaje. No constituye ensayo eléctrico ni certificación.</p>${order.lines.map(l=>{
      const available=receiptQty(s,order,l.lineId)>=l.quantity,checked=installed(s,order,l.lineId);
      return `<label class="op-check"><input type="checkbox" data-action="installation" data-order="${order.id}" data-line="${l.lineId}" ${checked?'checked':''} ${!available?'disabled':''}><span><strong>${E(l.name)}</strong><br><small>${available?'Disponible · revisión humana de montaje':'Bloqueado · faltan unidades por recibir'}</small></span></label>`;
    }).join('')}<div class="op-status">${order.lines.filter(l=>installed(s,order,l.lineId)).length} / ${order.lines.length} líneas verificadas</div><div class="op-flow">${link('d-panel.html','Ver panel conceptual')}${link('d-collaboration.html','Registrar incidencia')}</div>`;
    const handoverBody=`<p class="op-mini">El expediente incluye snapshot del pedido, recepción y checklist. Su aprobación es local y ficticia; no certifica cumplimiento normativo.</p><form data-form="handover"><input type="hidden" name="orderId" value="${order.id}"><label class="op-label">Nombre del activo<input name="name" required maxlength="80" value="${E(asset?.name||p.name+' · tablero')}"></label><label class="op-label">Número de serie<input name="serial" required minlength="3" maxlength="60" value="${E(asset?.serial||'')}" placeholder="Identificación física de demostración"></label><label class="op-check"><input type="checkbox" name="approved" required> Revisé recepción, montaje y documentación. Apruebo el expediente demostrativo.</label><button class="btn primary" type="submit" ${!allReceived||!allInstalled?'disabled':''}>${asset?'Actualizar expediente y descargar':'Crear activo y descargar entrega'}</button></form>${!allReceived||!allInstalled?'<p class="op-status">Para entregar, completá recepción y verificación de todas las líneas.</p>':badge('Prerequisitos completos','green')}${asset?`<p class="op-mini">${E(asset.name)} · serie ${E(asset.serial)}</p>${button('download-handover','Volver a descargar expediente','secondary',`data-id="${asset.id}"`)}`:''}`;
    const services=(s.serviceRequests||[]).filter(r=>assets.some(a=>a.id===r.assetId));
    const serviceBody=asset?`<div class="op-panel-light"><span class="op-badge">EXPEDIENTE DEL ACTIVO</span><h3>${E(asset.name)}</h3><p class="mono small">${E(asset.serial)} · ${E(asset.id)}</p><p class="op-mini">Proyecto ${E(p.name)} · pedido ${E(order.id)} · última entrega ${E((asset.updatedAt||asset.createdAt||'').slice(0,10))}</p></div><form data-form="service"><input type="hidden" name="assetId" value="${asset.id}"><label class="op-label">Necesidad de servicio<textarea name="description" required minlength="10" maxlength="600" placeholder="Describí observación y contexto; no manipules equipos energizados desde esta simulación."></textarea></label><label class="op-label">Prioridad<select name="priority"><option value="NORMAL">Programada</option><option value="URGENT">Urgente · requiere revisión</option></select></label><label class="op-check"><input name="consent" type="checkbox" required> Autorizo crear una solicitud local con el contexto del activo.</label><button class="btn primary" type="submit">Crear solicitud de servicio local</button></form>${services.map(r=>`<article class="op-supplier"><strong>${E(r.id)}</strong><p class="op-mini">${E(r.description)}</p>${badge(r.status==='RESOLVED'?'Resuelta · demo':'Pendiente de responsable','blue')}<div class="op-formactions">${r.status!=='RESOLVED'?button('resolve-service','Registrar cierre · simulación','secondary',`data-id="${r.id}"`):''}${button('download-service','Descargar solicitud','ghost',`data-id="${r.id}"`)}</div></article>`).join('')}`:'<div class="empty"><h3>Primero, el expediente</h3><p>La entrega aprobada crea un activo con su serie y documentos. Después podés abrir una solicitud de mantenimiento.</p></div>';
    return heading('Operación en campo','De la pieza al activo.',p.name+' · registrá entregas parciales y conservá el contexto después de la obra.')+layout([section(0,'Recibir materiales',recBody),section(1,'Verificar instalación',installBody),section(2,'Entregar el expediente',handoverBody),section(3,'Mantener el contexto',serviceBody)],['Recepción','Montaje','Entrega','Servicio'],'La recepción habilita montaje; el montaje completo habilita entrega; la entrega crea el activo.');
  }
  function render() {
    if (view.status) {
      const states={empty:['Sin información en esta vista','El estado vacío no elimina los datos del proyecto.'],loading:['Preparando el expediente','Carga simulada local; finaliza automáticamente.'],error:['No pudimos preparar la vista','La recuperación conserva el trabajo guardado.'],limit:['Presupuesto IA insuficiente','Continuá con revisión manual sin consumir presupuesto.']};
      const state=states[view.status];
      if(state){page.innerHTML=`<section class="card op-page-state" role="status"><span class="op-badge">ESTADO DE DEMOSTRACIÓN</span><h1>${state[0]}</h1><p>${state[1]}</p>${button('recover',view.status==='limit'?'Continuar manualmente':'Recuperar vista','primary')}${link('d-projects.html','Ver proyectos')}</section>`;return;}
    }
    const s=L.state(),p=project(s);
    if(!p){page.innerHTML=`<section class="card op-section"><h1>No hay proyecto activo</h1>${link('d-projects.html','Crear proyecto')}</section>`;return;}
    page.innerHTML=route==='d-collaboration.html'?collaboration(s,p):route==='d-network.html'?network(s,p):route==='m-field.html'?field(s,p):finance(s,p);
  }
  function fail(message) {
    const box=document.getElementById('op-error');
    if(box){box.textContent=message;box.focus();}else{L.toast(message);}
  }
  function scenarioValues(form) {
    const d=new FormData(form);
    return {name:String(d.get('name')).trim(),multiplier:Number(d.get('multiplier')),laborCents:cents(d.get('labor')),overheadCents:cents(d.get('overhead')),riskPercent:Number(d.get('risk')),revenueCents:cents(d.get('revenue'))};
  }
  function downloadHandover(asset,s) {
    const order=s.orders.find(o=>o.id===asset.orderId);
    const p=s.projects.find(p=>p.id===asset.projectId);
    L.download(`entrega-${asset.serial.replace(/[^a-z0-9-]/gi,'-')}.json`,JSON.stringify({demo:true,notice:'Expediente ficticio. No constituye certificación normativa.',asset,project:{id:p.id,name:p.name,version:p.version},order,receipts:s.receipts.filter(r=>r.orderId===order.id),installation:s.tasks.filter(t=>t.orderId===order.id&&t.kind==='installation')},null,2),'application/json');
  }
  function currentOrder(s,id) {return s.orders.find(o=>o.id===id&&o.projectId===project(s).id);}
  page.addEventListener('submit',event=>{
    const form=event.target.closest('form[data-form]');
    if(!form)return;
    event.preventDefault();
    if(!form.reportValidity())return;
    const d=new FormData(form),kind=form.getAttribute('data-form'),s=L.state(),p=project(s);
    if(kind==='scenario') {
      const values=scenarioValues(form);if(!values.name)return fail('Ingresá un nombre para el escenario.');
      L.update(st=>{const pr=project(st);pr.scenarios=pr.scenarios||[];pr.scenarios.push({id:L.uid('scenario'),...values});},'Escenario económico guardado · privado');L.toast('Escenario guardado. Compará y aplicá cuando esté aprobado.');
    } else if(kind==='assistant') {
      if(view.busy)return;
      const b=s.budget;
      if(b.limitCents-b.spentCents-b.reservedCents<300)return fail('No hay USD 3,00 disponibles. No se consumió saldo. Podés revisar el BOM a mano.');
      view.busy=true;const specialist=d.get('specialist'),runId=L.uid('run');
      L.update(st=>{st.budget.reservedCents+=300;st.budget.pending=st.budget.pending||[];st.budget.pending.push({id:runId,projectId:p.id,cents:300});},'Reserva de USD 3,00 · simulación IA');
      setTimeout(()=>{
        if(!(L.state().budget.pending||[]).some(r=>r.id===runId)){view.busy=false;render();return;}
        L.update(st=>{st.budget.pending=st.budget.pending.filter(r=>r.id!==runId);st.budget.reservedCents=Math.max(0,st.budget.reservedCents-300);st.budget.spentCents+=300;const pr=project(st);pr.assistantRuns=pr.assistantRuns||[];pr.assistantRuns.push({id:L.uid('run'),specialist,at:now(),costCents:300,status:'COMPLETED',simulated:true});},'Asistente completado · simulación sin llamada externa');
        const updated=project(L.state());const line=updated.lines.find(l=>!l.technicalApproved||l.canonicalStatus!=='confirmed');
        view.result=specialist==='review'&&line?{title:'Revisar '+line.name,copy:'Candidato según atributos: '+line.spec+'. Verificá los valores y el plano antes de confirmar. '+(line.canonicalStatus==='missing'?'Falta un componente canónico; abrí ingeniería para resolverlo.':'La aprobación debe ser humana.'),lineId:line.canonicalStatus==='missing'?null:line.id}:{title:({review:'Revisión sin faltantes pendientes',estimate:'Separar margen de recargo',procurement:'Confirmar oferta y disponibilidad',catalog:'No elegir un SKU solo por el nombre'})[specialist],copy:({review:'El BOM actual no presenta líneas pendientes. Revisá de nuevo si cambia el documento.',estimate:'El costo incluye materiales, mano de obra, gastos y contingencia. Usá el precio de venta como denominador del margen.',procurement:'El precio de referencia no confirma stock ni plazo. Solo una oferta presentada y vigente habilita la compra.',catalog:'La lectura propuesta usa tipo y atributos. El poder de corte, polos y tensión deben verificarse con fuentes técnicas.'})[specialist]};
        view.busy=false;
        const result=view.result;
        L.update(st=>{project(st).assistantSuggestion=result;},'Resultado de asistencia disponible para revisión humana');
        render();
      },850);
    } else if(kind==='budget') {
      const limit=cents(d.get('limit'));if(limit<s.budget.spentCents+s.budget.reservedCents)return fail('El tope no puede ser inferior al gasto y la reserva actuales.');
      L.update(st=>{st.budget.limitCents=limit;},'Tope de presupuesto de simulación actualizado');
    } else if(kind==='review-line') {
      const id=String(d.get('lineId'));
      L.update(st=>{const pr=project(st),l=pr.lines.find(l=>l.id===id);if(!l||l.canonicalStatus==='missing')return;l.technicalApproved=true;l.canonicalStatus='confirmed';pr.version+=1;pr.assistantSuggestion=null;pr.assistantReviews=pr.assistantReviews||[];pr.assistantReviews.push({lineId:id,at:now(),human:true});},'Revisión humana de recomendación IA · BOM actualizado');view.result=null;render();
    } else if(kind==='approve-advice') {
      const result=view.result;if(!result)return;
      L.update(st=>{const pr=project(st);pr.notes=pr.notes||[];pr.notes.push({id:L.uid('note'),author:'Responsable técnico',text:result.title+': '+result.copy,at:now(),private:true});pr.assistantSuggestion=null;},'Recomendación simulada revisada y registrada por una persona');view.result=null;render();
    } else if(kind==='note') {
      const text=String(d.get('text')).trim();if(text.length<5)return fail('La nota necesita al menos cinco caracteres útiles.');
      L.update(st=>{const pr=project(st);pr.notes=pr.notes||[];pr.notes.push({id:L.uid('note'),author:'Equipo de ingeniería',text,at:now(),private:true});},'Nota privada registrada en el proyecto');
    } else if(kind==='revision') {
      const reason=String(d.get('reason')).trim();if(reason.length<5)return fail('Indicá el motivo del cambio.');
      L.update(st=>{const pr=project(st);pr.version+=1;pr.notes=pr.notes||[];pr.notes.push({id:L.uid('note'),text:'Nueva revisión: '+reason,author:'Responsable de proyecto',at:now(),private:true});},'Nueva versión del proyecto; revisar solicitudes anteriores');
    } else if(kind==='rule') {
      const name=String(d.get('name')).trim(),accessory=String(d.get('accessory')).trim(),reason=String(d.get('reason')).trim();if(!name||!accessory||reason.length<5)return fail('Completá nombre, accesorio y justificación.');
      L.update(st=>{st.rules.push({id:L.uid('rule'),projectId:p.id,name,accessory,reason,sourceLineId:String(d.get('source')),ratio:Number(d.get('ratio')),priceCents:cents(d.get('price')),private:true,applied:false,version:1});},'Regla técnica privada guardada · propuesta');
    } else if(kind==='automation') {
      L.update(st=>{st.automation.offerAlerts=d.has('offerAlerts');},'Preferencia de automatización local guardada');
    } else if(kind==='lead') {
      const description=String(d.get('description')).trim(),zone=String(d.get('zone')).trim();if(description.length<10||zone.length<2)return fail('Completá la necesidad y la zona con información útil.');
      L.update(st=>{st.leads.push({id:L.uid('lead'),projectId:p.id,supplierId:String(d.get('supplierId')),zone,neededBy:String(d.get('neededBy')),description,consent:true,qualified:true,status:'NEW',createdAt:now(),simulated:true});},'Consulta calificada creada localmente con consentimiento');L.toast('Consulta local registrada. No se enviaron mensajes.');
    } else if(kind==='connector') {
      const dataset=String(d.get('dataset'));
      const rows=dataset==='orders'?s.orders.filter(o=>o.projectId===p.id).flatMap(o=>o.lines.map(l=>({code:l.lineId,name:l.name,quantity:l.quantity}))):p.lines.map(l=>({code:l.id,name:l.name,quantity:itemQty(l,p)}));
      if(!rows.length)return fail('El conjunto no tiene filas. Creá un pedido o elegí BOM.');
      view.preview={id:L.uid('connector'),projectId:p.id,projectVersion:p.version,system:String(d.get('system')),dataset,name:String(d.get('name')).trim(),owner:String(d.get('owner')).trim(),rows,status:'PREVIEW',simulated:true};render();
    } else if(kind==='receipt') {
      const order=currentOrder(s,String(d.get('orderId')));if(!order)return fail('El pedido no pertenece al proyecto actual.');
      const items=order.lines.map(l=>({lineId:l.lineId,quantity:Number(d.get('qty-'+l.lineId))})).filter(i=>i.quantity>0);
      if(!items.length)return fail('Ingresá al menos una unidad recibida.');
      if(items.some(i=>!Number.isInteger(i.quantity)||i.quantity+receiptQty(s,order,i.lineId)>order.lines.find(l=>l.lineId===i.lineId).quantity))return fail('No podés recibir más unidades que las pendientes.');
      L.update(st=>{const o=currentOrder(st,order.id);st.receipts.push({id:L.uid('receipt'),orderId:o.id,projectId:p.id,items,reference:String(d.get('reference')).trim(),at:now()});o.status=orderStatus(st,o)?'RECEIVED':'PARTIAL';},'Recepción registrada · cantidades acumuladas');
    } else if(kind==='handover') {
      const order=currentOrder(s,String(d.get('orderId')));if(!order||!orderStatus(s,order)||!order.lines.every(l=>installed(s,order,l.lineId)))return fail('Completá recepción y verificación del montaje antes de entregar.');
      const name=String(d.get('name')).trim(),serial=String(d.get('serial')).trim();if(name.length<2||serial.length<3)return fail('El activo necesita nombre y serie.');
      const assetId=s.assets.find(a=>a.orderId===order.id)?.id||L.uid('asset');
      L.update(st=>{const existing=st.assets.find(a=>a.id===assetId);const asset={id:assetId,projectId:p.id,orderId:order.id,name,serial,updatedAt:now(),createdAt:existing?.createdAt||now(),documents:[{kind:'handover',at:now(),projectVersion:p.version,humanApproved:true,simulated:true}]};if(existing)Object.assign(existing,asset);else st.assets.push(asset);},'Activo y expediente de entrega aprobados localmente');downloadHandover(L.state().assets.find(a=>a.id===assetId),L.state());
    } else if(kind==='service') {
      const asset=s.assets.find(a=>a.id===String(d.get('assetId'))&&a.projectId===p.id);if(!asset)return fail('No hay activo autorizado.');
      const description=String(d.get('description')).trim();if(description.length<10)return fail('Describí el servicio con al menos diez caracteres útiles.');
      L.update(st=>{st.serviceRequests.push({id:L.uid('service'),assetId:asset.id,projectId:p.id,description,priority:String(d.get('priority')),status:'OPEN',createdAt:now(),consent:true,simulated:true});},'Solicitud de servicio local creada con contexto del activo');
    }
  });
  page.addEventListener('click',event=>{
    const target=event.target.closest('[data-action]');if(!target)return;
    const action=target.dataset.action,id=target.dataset.id,s=L.state(),p=project(s);
    if(action==='step'){view.step=Number(target.dataset.index);render();}
    else if(action==='focus'){view.focus=Number(target.dataset.index);render();}
    else if(action==='focus-scroll'){page.querySelector(`[data-op-section="${target.dataset.index}"]`)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion:reduce)').matches?'auto':'smooth'});}
    else if(action==='recover'){view.status=null;const url=new URL(location.href);url.searchParams.delete('estado');history.replaceState(null,'',url);render();}
    else if(action==='recalculate'){
      const form=page.querySelector('[data-form="scenario"]');if(!form.reportValidity())return;
      const c=costs({...p,...scenarioValues(form)},s);document.getElementById('op-preview').innerHTML=`<p class="op-status">Vista previa sin guardar: ${money(c.totalCents)} costo · ${money(c.marginCents)} contribución · ${c.marginPercent.toFixed(1)} % margen</p>`;
    } else if(action==='apply-scenario'){
      const sc=p.scenarios.find(sc=>sc.id===id);if(!sc)return;
      L.update(st=>{const pr=project(st),changes=pr.multiplier!==sc.multiplier;for(const key of ['multiplier','laborCents','overheadCents','riskPercent','revenueCents'])pr[key]=sc[key];if(changes){pr.version+=1;pr.lines.forEach(l=>{l.technicalApproved=false;});}},'Escenario aplicado; revisar cantidades si cambió el multiplicador');L.toast('Escenario aplicado. Las solicitudes anteriores conservan su snapshot.');
    } else if(action==='delete-scenario'){L.update(st=>{const pr=project(st);pr.scenarios=pr.scenarios.filter(sc=>sc.id!==id);},'Escenario eliminado');}
    else if(action==='export-scenarios'){
      const rows=[['Escenario','Multiplicador','Materiales USD','Flete USD','Mano de obra USD','Gastos USD','Contingencia USD','Costo USD','Venta USD','Margen USD','Margen sobre venta %'],...p.scenarios.map(sc=>{const c=costs({...p,...sc},s);return [sc.name,sc.multiplier,dollars(c.materialsCents),dollars(c.shippingCents),dollars(c.laborCents),dollars(c.overheadCents),dollars(c.riskCents),dollars(c.totalCents),dollars(c.revenueCents),dollars(c.marginCents),c.marginPercent.toFixed(2)];})];L.download('comparacion-escenarios.csv',L.csv(rows),'text/csv;charset=utf-8');
    } else if(action==='download-budget'){L.download('presupuesto-demo.json',JSON.stringify({demo:true,projectId:p.id,version:p.version,currency:'USD',taxExcluded:true,costs:costs(p,s),limits:'Modelo de contribución estimada. No garantiza utilidad neta.'},null,2),'application/json');}
    else if(action==='manual'){location.href=L.href('d-engineering.html',{manual:'1'});}
    else if(action==='release-reservation'){L.update(st=>{st.budget.reservedCents=0;st.budget.pending=[];},'Reserva interrumpida liberada · sin consumo');}
    else if(action==='budget-limit'){L.update(st=>{st.budget.limitCents=st.budget.spentCents+st.budget.reservedCents;},'Estado de presupuesto agotado · demostración');fail('Presupuesto agotado. La revisión manual sigue disponible y no gasta saldo.');}
    else if(action==='apply-rule'){
      const rule=s.rules.find(r=>r.id===id&&r.projectId===p.id);if(!rule||rule.applied)return;
      L.update(st=>{const pr=project(st),r=st.rules.find(r=>r.id===id),source=pr.lines.find(l=>l.id===r.sourceLineId);if(!source)return;pr.lines.push({id:L.uid('line'),type:'accessory',name:r.accessory,spec:r.reason,quantity:source.quantity*r.ratio,unit:'u',referenceCents:r.priceCents,canonicalStatus:'suggested',technicalApproved:false,brand:'Por definir',required:{},ruleId:r.id,origin:'inference'});r.applied=true;pr.version+=1;},'Accesorio derivado de regla privada · requiere aprobación humana');
    } else if(action==='remove-rule'){L.update(st=>{st.rules=st.rules.filter(r=>r.id!==id);},'Regla privada eliminada; las líneas aplicadas conservan su origen');}
    else if(action==='simulate-event'){
      L.update(st=>{if(st.automation.offerAlerts)st.tasks.push({id:L.uid('task'),projectId:p.id,kind:'follow-up',text:'Revisar vigencia de oferta · evento simulado',completed:false,createdAt:now()});},s.automation.offerAlerts?'Oferta próxima a vencer simulada; tarea privada creada':'Evento simulado; automatización desactivada');
    } else if(action==='complete-followup'){L.update(st=>{const t=st.tasks.find(t=>t.id===id);if(t)t.completed=target.checked;},'Estado de tarea de seguimiento actualizado');}
    else if(action==='export-events'){L.download('trazabilidad.csv',L.csv([['Fecha','Actor','Descripción'],...(s.events||[]).filter(e=>!e.projectId||e.projectId===p.id).map(e=>[e.at,e.actor,e.description])]),'text/csv;charset=utf-8');}
    else if(action==='select-provider'){view.networkSupplier=id;view.step=1;view.focus=1;render();page.querySelector('[data-form="lead"]')?.scrollIntoView({block:'center'});}
    else if(action==='accept-lead'){L.update(st=>{const lead=st.leads.find(l=>l.id===id&&l.projectId===p.id);if(lead)lead.status='ACCEPTED';},'Aceptación de consulta simulada · sin contacto externo');}
    else if(action==='export-lead'){const lead=s.leads.find(l=>l.id===id&&l.projectId===p.id);if(lead)L.download('consulta-'+id+'.json',JSON.stringify({...lead,demo:true,notice:'Resumen consentido. No incluye plano, margen ni ofertas rivales.'},null,2),'application/json');}
    else if(action==='confirm-connector'){
      if(!view.preview)return;const preview=view.preview;view.preview=null;L.update(st=>{st.connectors.push({...preview,status:'CONFIRMED',createdAt:now()});},'Contrato de intercambio local confirmado · sin sincronización real');
    } else if(action==='cancel-preview'){view.preview=null;render();}
    else if(action==='download-connector'){const c=s.connectors.find(c=>c.id===id&&c.projectId===p.id);if(c)L.download('intercambio-'+id+'.csv',L.csv([['Código','Descripción','Cantidad'],...c.rows.map(r=>[r.code,r.name,r.quantity])]),'text/csv;charset=utf-8');}
    else if(action==='delete-connector'){L.update(st=>{st.connectors=st.connectors.filter(c=>c.id!==id);},'Contrato de intercambio local eliminado');}
    else if(action==='receive-remaining'){
      const order=currentOrder(s,id);if(!order)return;const items=order.lines.map(l=>({lineId:l.lineId,quantity:l.quantity-receiptQty(s,order,l.lineId)})).filter(i=>i.quantity>0);if(!items.length)return;
      L.update(st=>{const o=currentOrder(st,id);st.receipts.push({id:L.uid('receipt'),orderId:id,projectId:p.id,items,reference:'SIMULACIÓN · faltantes recibidos',at:now()});o.status='RECEIVED';},'Faltantes recibidos · simulación de recepción completa');
    } else if(action==='installation'){
      const order=currentOrder(s,target.dataset.order),lineId=target.dataset.line;
      if(!order||receiptQty(s,order,lineId)<order.lines.find(l=>l.lineId===lineId).quantity)return fail('La línea necesita recepción completa antes de montar.');
      const checked=target.checked;L.update(st=>{let t=st.tasks.find(t=>t.orderId===order.id&&t.lineId===lineId&&t.kind==='installation');if(!t){t={id:L.uid('task'),kind:'installation',orderId:order.id,projectId:p.id,lineId,installed:false};st.tasks.push(t);}t.installed=checked;t.updatedAt=now();},checked?'Montaje verificado por persona · checklist conceptual':'Verificación de montaje reabierta');
    } else if(action==='download-handover'){const asset=s.assets.find(a=>a.id===id&&a.projectId===p.id);if(asset)downloadHandover(asset,s);}
    else if(action==='resolve-service'){L.update(st=>{const r=st.serviceRequests.find(r=>r.id===id&&r.projectId===p.id);if(r){r.status='RESOLVED';r.resolvedAt=now();r.resolution='Cierre registrado en demostración; no representa una intervención real.';}},'Servicio cerrado · simulación local');}
    else if(action==='download-service'){const r=s.serviceRequests.find(r=>r.id===id&&r.projectId===p.id);if(r)L.download('servicio-'+id+'.json',JSON.stringify({demo:true,...r},null,2),'application/json');}
  });
  page.addEventListener('input',event=>{
    if(event.target.id==='op-provider-search'){
      const query=event.target.value.toLocaleLowerCase('es');page.querySelectorAll('#op-providers .op-supplier').forEach(card=>{card.hidden=!card.textContent.toLocaleLowerCase('es').includes(query);});
    }
  });
  page.addEventListener('change',event=>{
    if(event.target.id==='op-order-selector'){view.selectedOrder=event.target.value;render();}
  });
  L.subscribe(render);
  render();
  if(view.status==='loading')setTimeout(()=>{view.status=null;render();},950);
})();
