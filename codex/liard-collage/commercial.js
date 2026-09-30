(() => {
'use strict';
const domain = document.body.dataset.domain;
const E = value => L.escape(String(value));
const button = (text,action,kind='primary') => L.button(text,action,kind);
const link = (text,file,params={}) => `<a class="btn secondary" href="${L.href(file,params)}">${text}</a>`;
const card = (title,body,extra='') => `<article class="card ${extra}"><div class="card-head"><h2>${title}</h2></div><div class="card-body">${body}</div></article>`;
const field = (label,id,value,type='number',extra='') => `<label class="field" for="${id}"><span>${label}</span><input id="${id}" type="${type}" value="${E(value)}" ${extra}></label>`;
const read = (id,fallback=0) => Number(document.getElementById(id)?.value ?? fallback);
const getOffers = row => {
 const approved=L.get('commercial.approvedOffer',null);
 return B.offers(row).map(o=>{
  const revised=approved?.lines.find(line=>line.id===row.id);
  return o.providerId==='delta'&&revised?{...o,unitPrice:revised.price,days:revised.days,available:revised.stock,validUntil:approved.validUntil}:o;
 });
};
const assignment = () => L.get('commercial.assignments',{});
const chosen = row => getOffers(row).find(o=>o.providerId === assignment()[row.id]);
const selectedTotal = () => bomRows().reduce((sum,row)=>sum+(chosen(row)?.unitPrice ?? row.price)*row.quantity,0);
const request = () => L.get('commercial.requests',{status:'DRAFT',sent:false});
const noteError = () => L.get('commercial.error','') ? L.note('Revisá estos datos',E(L.get('commercial.error','')),'red') : '';
const clearError = () => L.save('commercial.error','');
const scenario = () => new URLSearchParams(location.search || '').get('scenario') || 'base';
const scenarioValid = () => scenario()==='alternative' ? Boolean(L.get('alternative-approved',false)&&L.get('bom-alternative',null)?.approved) : scenario()==='additional' ? Boolean(L.get('revision-approved',false)&&L.get('revision-choice','additional')==='additional') : true;
const bomRows = () => {
 const stored=L.get('engineering-bom',B.bom);
 let result=stored.map(row=>({...row}));
 const coil=L.get('coil-voltage','230 V');
 if(L.get('essentials-complete',false))result=result.map(row=>row.id==='ct'?{...row,specification:row.specification.replace(/bobina\s+[^·]+/, 'bobina '+coil),sku:coil==='230 V'?row.sku:'Por confirmar',canonical:coil==='230 V'?row.canonical:''}:row);
 if(scenario()==='alternative'&&scenarioValid()){
  const alt=L.get('bom-alternative',null);
  result=result.map(row=>row.id===alt.rowId?{...row,brand:alt.brand,specification:alt.specification,sku:alt.sku,price:38540,source:'Alternativa aprobada · '+L.get('alternative-source','Revisión manual')}:row);
 }
 if(scenario()==='additional'&&scenarioValid())result=result.filter(row=>row.id==='tm').map(row=>({...row,quantity:3,qtyPlan:3,source:'Revisión aprobada R04 · adicional'}));
 return result;
};
const requestRows = () => request().lines || bomRows();
const scenarioNote = () => scenario()==='base'?'':L.note(scenario()==='alternative'?'Escenario alternativo':'Adicional de revisión',scenarioValid()?scenario()==='alternative'?'Solo el contactor cambia a la referencia aprobada. Los demás materiales y cantidades permanecen sin duplicarse.':'Nueva solicitud de 3 interruptores termomagnéticos; la versión base permanece intacta.':'Este escenario necesita aprobación en ingeniería antes de enviar una solicitud.','amber');

const providerSelect = row => `<label class="field" for="assign-${row.id}"><span>Adjudicar ${E(row.material)}</span><select id="assign-${row.id}"><option value="">Sin adjudicar</option>${getOffers(row).map(o=>`<option value="${o.providerId}" ${assignment()[row.id]===o.providerId?'selected':''}>${E(o.name)} · ${L.money(o.unitPrice*row.quantity)}</option>`).join('')}</select></label>`;
const offerBlock = (o,row) => `<div class="offer-choice"><strong>${L.money(o.unitPrice)}</strong><small>${L.num(row.quantity)} × unidad · ${o.days} días</small><span>${L.badge(o.available>=row.quantity?'Cantidad cubierta':'Confirmar stock',o.available>=row.quantity?'green':'amber')}</span><small>${E(o.sku)} · hasta ${E(o.validUntil)}</small></div>`;
const offerMatrix = () => `<div class="quote-matrix">${L.table(['Material · cantidad',...B.providers.map(p=>E(p.name)),'Adjudicación'],bomRows().map(row=>[`${E(row.material)}<br><span class="small muted">${E(row.specification)} · ${L.num(row.quantity)} ${E(row.unit)}</span>`,...getOffers(row).map(o=>offerBlock(o,row)),providerSelect(row)]))}</div>`;
const offerSummary = () => {
 const rows=B.providers.map(p=>{const lines=bomRows().filter(r=>chosen(r)?.providerId===p.id);return {p,lines,total:lines.reduce((sum,r)=>sum+chosen(r).unitPrice*r.quantity,0)};});
 return `<div class="grid three">${rows.map(({p,lines,total})=>card(E(p.name),`<p class="amount">${L.money(total)}</p><p>${lines.length} materiales adjudicados</p><p class="muted">Plazo de referencia: ${lines.length?Math.max(...lines.map(r=>chosen(r).days)):0} días</p>`,'allocation-card')).join('')}</div>`;
};
const quoteRender = ctx => {
 const complete=bomRows().every(r=>assignment()[r.id]);
 const n=bomRows().filter(r=>assignment()[r.id]).length;
 const draft=L.get('commercial.offerRevision',null);
 const rev=draft?.submitted?draft:null;
 const base=L.note('Precio de referencia · revisión humana','Importes ficticios del catálogo al 30/09/2026. El proveedor confirma precio, stock, plazo y condiciones. El matching por atributos esenciales no certifica una equivalencia eléctrica.');
 if(ctx.stage==='confirm') return `${noteError()}${card('Revisar antes de solicitar',`<div class="summary"><strong class="amount">${L.money(selectedTotal())}</strong><span>${n} de ${bomRows().length} materiales adjudicados · sin impuestos ni flete</span></div>${complete?L.badge('Lista para enviar','green'):L.badge('Faltan adjudicaciones','amber')}<p>La solicitud conserva cantidades, productos y precios de esta versión. No confirma una compra ni reserva stock.</p>${field('Observaciones para proveedores','request-note','Entrega en Centro Aurora. Confirmar vigencia y disponibilidad.','text')}${button('Enviar solicitud simulada','send-request')} ${link('Ver BOM aprobado','d-bom.html')}`)}${offerSummary()}`;
 const guidance=card('Objetivo de la compra',`${field('Plazo objetivo, en días','deadline',L.get('commercial.deadline',15),'number','min="1" max="180"')}<p class="muted">La fecha objetivo orienta la selección; los plazos son declarados, no una reserva.</p>${button('Elegir ofertas dentro del plazo','optimize')} ${button('Menor costo de referencia','cheapest','secondary')}<p>${n}/${bomRows().length} materiales asignados</p><strong class="amount">${L.money(selectedTotal())}</strong>`);
 const revision=rev?L.note('Oferta propuesta del proveedor','Delta envió una revisión simulada. Los nuevos valores están disponibles para comparar; no se aplican sin tu aprobación.','amber')+L.table(['Material','Precio revisado','Disponible','Plazo'],rev.lines.map(r=>[E(r.material),L.money(r.price),L.num(r.stock),`${r.days} días`]))+button('Aprobar revisión propuesta','apply-offer','secondary'):'';
 const matrix=card(ctx.stage==='assign'?'Asignación por material':'Comparar proveedores',`${offerMatrix()}<div class="footer-actions">${button('Guardar adjudicaciones','save-assign')} ${button('Revisar solicitud','quote-confirm','secondary')}</div>`);
 return `${noteError()}${scenarioNote()}${base}${L.get('commercial.offerApplied',false)?L.note('Revisión aplicada · demo','La adjudicación y el costo de materiales usan los valores aprobados de Delta.','green'):''}${revision}${ctx.variant==='guided'?`<div class="grid two"><div class="stack">${ctx.stage==='goal'?card('Comprar a tiempo',`<h3>Centro Aurora · TS-1P</h3><p>6 materiales · 3 tableros tipo · entrega objetivo ${E(B.project.due)}</p><p>Priorizá plazo o costo y confirmá cada adjudicación.</p>${button('Comparar ofertas','quote-offers')}`):matrix}</div>${guidance}</div>`:`<div class="toolbar">${button('Optimizar por costo','cheapest','secondary')} ${button('Aplicar plazo objetivo','optimize','secondary')}${field('Días objetivo','deadline',L.get('commercial.deadline',15),'number','min="1"')}</div>${matrix}${offerSummary()}`}`;
};
const ordersRender = ctx => {
 const r=request();
 const status={DRAFT:'Borrador',PENDING:'Pendiente',CONFIRMED:'Confirmada',REJECTED:'Rechazada'}[r.status] || 'Pendiente';
 if(ctx.stage==='list') return `${card('Seguimiento de la solicitud',`${L.table(['Solicitud','Proyecto','Materiales','Estado','Acción'],[['SOL-AUR-026',E(B.project.name),String(requestRows().length),L.badge(status,r.status==='CONFIRMED'?'green':'amber'),button('Abrir detalle','order-detail','secondary')]])}<p class="muted">El flujo existente permite enviar solicitudes y recibir aceptación o rechazo.</p>${link('Preparar solicitud','d-quote.html',{stage:'confirm'})}`)}`;
 const details=card('SOL-AUR-026 · Delta Suministros',`${L.badge(status,r.status==='CONFIRMED'?'green':'amber')}<p>Versión R03 · ${r.sent?'Enviada en esta demostración':'Aún no enviada'} · ${L.money(r.total ?? selectedTotal())}</p>${L.table(['Material','Cantidad','Referencia'],requestRows().map(row=>[E(row.material),L.num(row.quantity),`${E(row.brand)} · ${E(row.sku)}<br>${L.money((row.unitPrice??row.price)*row.quantity)}`]))}`);
 const contact=r.status==='CONFIRMED'?card('Contacto habilitado',`<p><strong>Martín Vega · Delta Suministros</strong></p><a href="mailto:martin@delta.example.invalid">martin@delta.example.invalid</a><p class="muted">Contacto ficticio. Pago y flete se acuerdan fuera de la plataforma.</p>`):card('Contacto protegido',`<p>El contacto se habilita cuando el proveedor confirma la solicitud.</p>${L.badge('Pendiente de confirmación','gray')}`);
 return `${noteError()}<div class="grid two"><div class="stack">${details}${L.note('Trazabilidad ampliada · propuesta','El historial por revisión, marca y línea adjudicada es una propuesta de evolución; no está implementado como contrato completo en producción.')} ${link('Comparar respuesta propuesta','d-quote.html',{stage:'offers'})}</div><div class="stack">${contact}${card('Simular la respuesta',`<p>La respuesta se guarda solo en esta demo.</p>${link('Abrir perfil proveedor','d-supplier.html',{stage:'request',variant:'inbox'})}`)}</div></div>`;
};
const supplierLines = () => requestRows().map(row=>L.get('commercial.offerRevision',null)?.lines.find(line=>line.id===row.id) || ({id:row.id,material:row.material,price:row.unitPrice??row.price,stock:row.quantity,days:12}));
const supplierRender = ctx => {
 const r=request();
 if(ctx.stage==='inbox')return card('Solicitudes de presupuesto',`${L.table(['Empresa','Proyecto','Materiales','Estado','Abrir'],[['Azul Ingeniería',E(B.project.name),'6',L.badge(r.status==='CONFIRMED'?'Confirmada':r.status==='REJECTED'?'Rechazada':'Pendiente',r.status==='CONFIRMED'?'green':'amber'),button('Ver solicitud','supplier-request','secondary')]])}${L.note('Datos ya estructurados','El proveedor recibe el listado y sus especificaciones; no necesita interpretar el plano.')}`);
 if(ctx.stage==='sent')return `${card('Respuesta registrada',`${L.badge(L.get('commercial.offerRevision',null)?'Oferta propuesta enviada':r.status==='CONFIRMED'?'Solicitud confirmada':r.status==='REJECTED'?'Solicitud rechazada':'Respuesta pendiente',r.status==='REJECTED'?'red':'green')}<p>${L.get('commercial.offerRevision',null)?'La empresa debe comparar y aprobar la revisión propuesta. La aceptación existente y esta oferta negociada son estados distintos.':r.status==='DRAFT'?'Abrí la etapa Responder para confirmar o rechazar la solicitud del ejemplo.':'El comprador puede consultar tu respuesta en solicitudes enviadas.'}</p>${link('Ver como comprador','d-orders.html',{stage:'detail'})} ${link('Comparar oferta revisada','d-quote.html',{stage:'offers'})}`)}`;
 const existing=card('Aceptar o rechazar · existe',`<p>Azul Ingeniería solicita ${requestRows().length} materiales para Centro Aurora. Esta acción confirma o rechaza la solicitud; no modifica sus precios.</p>${L.table(['Material','Especificación','Cantidad'],requestRows().map(row=>[E(row.material),E(row.specification),L.num(row.quantity)]))}<div class="footer-actions">${button('Aceptar solicitud','accept')} ${button('Rechazar solicitud','reject','danger')}</div>${r.status==='CONFIRMED'?'<p>Contacto comprador: <a href="mailto:elena@azul.example.invalid">elena@azul.example.invalid</a></p>':'<p class="muted">Contacto comprador oculto hasta confirmar.</p>'}`);
 const proposed=card('Oferta negociada por línea · propuesta',`${L.note('Propuesta por validar','En producción la respuesta es aceptación/rechazo. Este editor simula precio, stock, plazo y vigencia, con nueva comparación del comprador.','amber')}<div class="supplier-editor">${L.table(['Material','Precio unitario ARS','Cantidad disponible','Días'],supplierLines().map(row=>[E(row.material),field('Precio de '+row.material,'offer-price-'+row.id,row.price,'number','min="1"'),field('Stock de '+row.material,'offer-stock-'+row.id,row.stock,'number','min="0"'),field('Plazo de '+row.material,'offer-days-'+row.id,row.days,'number','min="1"')]))}</div><div class="grid equal">${field('Vigencia de la oferta','offer-valid',L.get('commercial.offerRevision',null)?.validUntil || '2026-10-07','date')}${field('Condición comercial','offer-terms',L.get('commercial.offerRevision',null)?.terms || 'Transferencia a 30 días','text')}</div><p class="summary">Total propuesto: <strong>${L.money(supplierLines().reduce((sum,line)=>sum+line.price*requestRows().find(r=>r.id===line.id).quantity,0))}</strong></p>${button('Recalcular oferta','recalc-offer','secondary')} ${button('Enviar oferta propuesta','submit-offer')}`);
 return `${noteError()}${ctx.variant==='negotiated'?`<div class="stack">${proposed}${existing}</div>`:`<div class="grid two"><div>${existing}</div><div>${card('Siguiente evolución',`<h3>Responder con precio y disponibilidad</h3><p>No todos los pedidos se pueden confirmar tal como llegaron. Explorar negociación por línea.</p>${button('Abrir propuesta negociada','supplier-negotiate','secondary')}`)}</div></div>`}`;
};
const catalogState = () => L.get('commercial.catalog',{mapped:false,imported:false,reading:false,corrected:false,mode:'replace'});
const catalogRender = ctx => {
 const c=catalogState();
 const rows=[...bomRows().slice(0,3),bomRows().find(row=>row.id==='cab')];
 if(ctx.stage==='summary')return `${card('Catálogo Delta Suministros',`<div class="commercial-funnel"><div><strong>${c.imported&&c.mode==='replace'?'4':'6'}</strong>ítems activos</div><div><strong>${c.corrected?'0':'1'}</strong>requiere revisión</div><div><strong>${c.imported?'30/09':'25/09'}</strong>última importación demo</div></div><p>Excel de muestra · catálogo privado de demostración</p>${button('Importar archivo de muestra','catalog-map')} ${button('Revisar vínculos','catalog-read','secondary')}`)}${L.note('Alcance actual','La importación existente reemplaza el catálogo y luego lee los productos. La sincronización incremental es una propuesta separada.')}`;
 if(ctx.stage==='map')return `${noteError()}${card('1. Mapear columnas',`<p><strong>lista_delta_septiembre.xlsx</strong> · archivo ficticio de muestra precargado</p>${L.table(['Encabezado Excel','Campo destino'],[['Descripción','<label class="field">Campo para Descripción<select id="map-name"><option value="name">Nombre del material</option><option value="sku">Código del producto</option></select></label>'],['Código','<label class="field">Campo para Código<select id="map-sku"><option value="sku">Código del producto</option><option value="name">Nombre del material</option></select></label>'],['Precio','Precio unitario'],['Divisa','Moneda']])}${L.note('Error detectado','La fila 4 tiene “$ 280.000” como texto. Corregí el precio antes de continuar.','amber')}${field('Precio de gabinete · fila 4','import-price',L.get('commercial.importPrice',''),'number','min="1" placeholder="280000"')}${button('Validar y previsualizar','catalog-preview')}`)}`;
 if(ctx.stage==='preview')return `${noteError()}${card('2. Previsualizar importación',`${L.table(['Código','Nombre','Precio','Validación'],rows.map(row=>[E(row.sku),E(row.material),L.money(row.id==='cab'?L.get('commercial.importPrice',row.price):row.price),L.badge('Válido','green')]))}${ctx.variant==='incremental'?`${L.note('Actualización incremental · propuesta','Simula conservar materiales que no están en este archivo. El flujo actual de producción reemplaza el catálogo.','amber')}<p>2 nuevos · 2 actualizados · 2 conservados. Confirmación antes de escribir.</p>`:`${L.note('Reemplazo completo · existe','Este archivo reemplaza los 6 ítems actuales por los 4 previsualizados. Revisá lo que deja de estar disponible.','amber')}<p>Se reemplazan 6 ítems actuales. 4 ítems quedarán activos.</p>`}${button(ctx.variant==='incremental'?'Simular actualización incremental':'Confirmar reemplazo','catalog-import')}`)}`;
 return `${card('3. Lectura y corrección canónica',`${L.badge(c.corrected?'Corrección manual guardada':'3 leídos · 1 requiere revisión',c.corrected?'green':'amber')}<p>La IA relaciona el texto con el catálogo base. Los atributos se corrigen con listas cerradas.</p>${L.table(['Material','Vínculo','Estado'],rows.map((row,i)=>[E(row.material),E(row.canonical || 'Componente base'),L.badge(i===3&&!c.corrected?'Pendiente de completar':'Vinculado',i===3&&!c.corrected?'amber':'green')]))}<label class="field" for="canonical-type"><span>Componente base de gabinete</span><select id="canonical-type"><option value="">Elegir componente</option><option value="cabinet" ${c.corrected?'selected':''}>Gabinete</option></select></label><label class="field" for="canonical-grade"><span>Grado de protección</span><select id="canonical-grade"><option value="">Elegir atributo</option><option value="IP54" ${c.corrected&&c.grade!=='IP65'?'selected':''}>IP54</option><option value="IP65" ${c.grade==='IP65'?'selected':''}>IP65</option></select></label>${button('Guardar corrección manual','catalog-correct')} ${button('Volver al resumen','catalog-summary','secondary')}`)}${noteError()}`;
};
const budget = () => L.get('commercial.budget',{materials:selectedTotal(),labor:B.metrics.labor,overhead:B.metrics.overhead,contingency:B.metrics.contingency,freight:0,tax:0,sale:B.metrics.sale,approved:false});
const budgetCost = b => b.materials+b.labor+b.overhead+b.contingency+b.freight+b.tax;
const budgetSummary = b => `<div class="commercial-funnel"><div><span>Costo total</span><strong>${L.money(budgetCost(b))}</strong></div><div><span>Venta</span><strong>${L.money(b.sale)}</strong></div><div><span>Margen sobre venta</span><strong>${b.sale>0?L.num((b.sale-budgetCost(b))/b.sale*100):'0'} %</strong></div></div><p class="small muted">Margen = (venta − costo) / venta. Recargo sobre costo: ${budgetCost(b)>0?L.num((b.sale-budgetCost(b))/budgetCost(b)*100):'0'} %. Valores ficticios ARS.</p>`;
const budgetRender = ctx => {
 const b=budget();
 const inputs=card('Costos de la propuesta',`${field('Materiales adjudicados ARS','budget-materials',b.materials,'number','min="0"')}${field('Mano de obra ARS','budget-labor',b.labor,'number','min="0"')}${field('Indirectos ARS','budget-overhead',b.overhead,'number','min="0"')}${field('Contingencia ARS','budget-contingency',b.contingency,'number','min="0"')}${field('Flete ARS (0 = excluido)','budget-freight',b.freight,'number','min="0"')}${field('Impuestos ARS (0 = excluidos)','budget-tax',b.tax,'number','min="0"')}${field('Precio de venta ARS','budget-sale',b.sale,'number','min="1"')}${button('Recalcular presupuesto','budget-recalc')}`);
 const preview=card('Escenario de margen',`${budgetSummary(b)}${L.note('Criterio de aprobación','Umbral de ejemplo: margen mínimo del 18 %. Es una hipótesis de política privada, no una regla técnica ni comercial de LIARD.','amber')}${button('Escenario margen 20 %','budget-target','secondary')} ${button('Preparar propuesta','budget-proposal','secondary')}`);
 if(ctx.stage==='approval'||ctx.stage==='proposal')return `${noteError()}${card('Propuesta AUR-026 · R03',`<div class="commercial-preview"><div class="spread"><strong>AZUL INGENIERÍA</strong>${L.badge(b.approved?'Aprobada · demo':'Borrador','blue')}</div><h2>Tableros para Centro Aurora</h2><p>Destinatario: Constructora Aurora · cliente ficticio</p><div class="document-rule"></div><p>Provisión de materiales, armado y revisión de 3 tableros tipo TS-1P, según BOM aprobado R03.</p>${L.table(['Concepto','Total'],[['Materiales',L.money(b.materials)],['Mano de obra e indirectos',L.money(b.labor+b.overhead)],['Contingencia',L.money(b.contingency)],['Flete',b.freight?L.money(b.freight):'Excluido'],['Impuestos',b.tax?L.money(b.tax):'Excluidos']])}<p class="amount">Precio propuesto ${L.money(b.sale)}</p><p>Vigencia de muestra: 7 días. No incluye cambios posteriores al alcance R03. Plazo sujeto a confirmación de proveedores.</p></div><div class="footer-actions">${button('Aprobar propuesta simulada','budget-approve')} ${button('Exportar propuesta de ejemplo','budget-export','secondary')} ${link('Revisar cambios de alcance','d-revisions.html')}</div>`) }${preview}`;
 return `${noteError()}${L.note('Nuevo módulo · hipótesis','El flujo actual termina en solicitudes/órdenes a proveedores. Este presupuesto comercial agrega costos propios y precio de venta; requiere validación con clientes.','amber')}${ctx.variant==='guided'?`<div class="grid two">${inputs}<div class="stack">${preview}${card('Origen de los valores',`<p>Materiales: adjudicación de referencia. Mano de obra: ingreso manual del presupuestador. Indirectos y contingencia: política de empresa.</p>${link('Volver a cotización','d-quote.html',{variant:'guided'})}`)}</div></div>`:`${budgetSummary(b)}<div class="grid equal">${inputs}${preview}</div>`}`;
};
const saveOffer = () => {
 const lines=requestRows().map(row=>({id:row.id,material:row.material,price:read('offer-price-'+row.id),stock:read('offer-stock-'+row.id),days:read('offer-days-'+row.id)}));
 const validUntil=document.getElementById('offer-valid')?.value;
 const terms=document.getElementById('offer-terms')?.value.trim();
 if(lines.some(r=>!Number.isFinite(r.price)||r.price<=0||!Number.isFinite(r.stock)||r.stock<0||!Number.isFinite(r.days)||r.days<1||!Number.isInteger(r.days))||!validUntil||validUntil<'2026-09-30'||!terms){L.save('commercial.error','Completá precios positivos, stock no negativo, días enteros desde 1, vigencia desde 30/09/2026 y condición comercial.');L.refresh();return false;}
 L.save('commercial.offerRevision',{lines,validUntil,terms,submitted:false});return true;
};
const saveBudget = () => {
 const b=budget();const keys=['materials','labor','overhead','contingency','freight','tax','sale'];
 keys.forEach(k=>{b[k]=read('budget-'+k,b[k]);});
 if(keys.some(k=>!Number.isFinite(b[k])||b[k]<0)||b.sale<=0){L.save('commercial.error','Todos los costos deben ser números no negativos y la venta debe ser mayor a cero.');return false;}
 b.approved=false;L.save('commercial.budget',b);return true;
};
const onAction = (action,element,ctx) => {
 clearError();
 if(action==='save-assign'||action==='quote-confirm'){
  const a=assignment();bomRows().forEach(row=>{const input=document.getElementById('assign-'+row.id);if(input)a[row.id]=input.value;});L.save('commercial.assignments',a);if(action==='quote-confirm')L.go({stage:'confirm'});else L.refresh();return;
 }
 if(action==='cheapest'||action==='optimize'){
  const days=read('deadline',15);
  if(!Number.isFinite(days)||days<1||days>180){L.save('commercial.error','Ingresá un plazo de 1 a 180 días.');L.refresh();return;}
  L.save('commercial.deadline',days);
  const a={};bomRows().forEach(row=>{const eligible=getOffers(row).filter(o=>action==='cheapest'||(o.days<=days&&o.available>=row.quantity));const sorted=eligible.slice().sort((x,y)=>x.unitPrice-y.unitPrice);if(sorted[0])a[row.id]=sorted[0].providerId;});L.save('commercial.assignments',a);L.go({stage:'assign'});return;
 }
 if(action==='send-request'){
  if(!scenarioValid()){L.save('commercial.error','Aprobá el escenario en ingeniería antes de enviar.');L.refresh();return;}
  if(bomRows().some(row=>row.sku==='Por confirmar')){L.save('commercial.error','La tensión corregida necesita una referencia comercial verificada. No se conserva el SKU de 230 V para otra tensión.');L.refresh();return;}
  if(!bomRows().every(row=>assignment()[row.id])){L.save('commercial.error','Adjudicá todos los materiales antes de enviar.');L.refresh();return;}
  L.save('commercial.requests',{status:'PENDING',sent:true,note:document.getElementById('request-note')?.value||'',total:selectedTotal(),assignments:assignment(),scenario:scenario(),lines:bomRows().map(row=>({...row,providerId:chosen(row).providerId,providerName:chosen(row).name,unitPrice:chosen(row).unitPrice,offeredSku:row.sku}))});L.save('commercial.budget',{...budget(),materials:selectedTotal(),approved:false});location.href=L.href('d-orders.html',{stage:'detail'});return;
 }
 if(action==='accept'||action==='reject'){L.save('commercial.requests',{...request(),status:action==='accept'?'CONFIRMED':'REJECTED',sent:true});L.go({stage:'sent'});return;}
 if(action==='recalc-offer'||action==='submit-offer'){if(saveOffer()){if(action==='submit-offer'){const r=L.get('commercial.offerRevision',null);r.submitted=true;L.save('commercial.offerRevision',r);L.go({stage:'sent'});}else L.refresh();}return;}
 if(action==='apply-offer'){const r=L.get('commercial.offerRevision',null);if(r){L.save('commercial.approvedOffer',r);L.save('commercial.offerApplied',true);const b=budget();b.materials=bomRows().reduce((sum,row)=>sum+(assignment()[row.id]==='delta'?r.lines.find(line=>line.id===row.id).price:chosen(row)?.unitPrice??row.price)*row.quantity,0);b.approved=false;L.save('commercial.budget',b);}L.refresh();return;}
 if(action==='catalog-preview'){
  const price=read('import-price');const name=document.getElementById('map-name')?.value;const sku=document.getElementById('map-sku')?.value;
  if(price<=0||!Number.isFinite(price)||name===sku){L.save('commercial.error','Corregí el precio de la fila 4 y asigná un campo distinto a cada columna.');L.refresh();return;}
  L.save('commercial.importPrice',price);L.save('commercial.catalog',{...catalogState(),mapped:true});L.go({stage:'preview'});return;
 }
 if(action==='catalog-import'){L.save('commercial.catalog',{...catalogState(),imported:true,reading:true,mode:ctx.variant==='incremental'?'incremental':'replace'});L.go({stage:'reading'});return;}
 if(action==='catalog-correct'){
  if(!document.getElementById('canonical-type')?.value||!document.getElementById('canonical-grade')?.value){L.save('commercial.error','Elegí componente base y atributo para guardar el vínculo manual.');L.refresh();return;}
  L.save('commercial.catalog',{...catalogState(),corrected:true,grade:document.getElementById('canonical-grade').value});L.refresh();return;
 }
 if(action==='budget-recalc'){saveBudget();L.refresh();return;}
 if(action==='budget-target'){const b=budget();b.sale=Math.round(budgetCost(b)/.8);b.approved=false;L.save('commercial.budget',b);L.refresh();return;}
 if(action==='budget-approve'){const b=budget();if((b.sale-budgetCost(b))/b.sale<.18){L.save('commercial.error','El margen está por debajo del umbral de muestra del 18 %. Ajustá el escenario antes de aprobar.');L.refresh();return;}b.approved=true;L.save('commercial.budget',b);L.go({stage:'approval'});return;}
 if(action==='budget-export'){
  const b=budget();if(!b.approved){L.save('commercial.error','Aprobá el presupuesto antes de exportarlo.');L.refresh();return;}
  const text=`PROPUESTA DE EJEMPLO · NO VÁLIDA COMERCIALMENTE\nAzul Ingeniería · Centro Aurora · R03\nCosto ARS ${budgetCost(b)}\nVenta ARS ${b.sale}\nMargen ${((b.sale-budgetCost(b))/b.sale*100).toFixed(2)} %\nFlete ${b.freight?'incluido':'excluido'} · Impuestos ${b.tax?'incluidos':'excluidos'}\nVigencia 7 días · pago y flete externos\n`;
  const url=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='propuesta-aurora-ejemplo.txt';a.click();URL.revokeObjectURL(url);return;
 }
 const routes={'quote-offers':'offers','order-detail':'detail','supplier-request':'request','catalog-map':'map','catalog-read':'reading','catalog-summary':'summary','budget-proposal':'proposal'};
 if(action==='supplier-negotiate'){L.go({variant:'negotiated',stage:'request'});return;}
 if(routes[action])L.go({stage:routes[action]});
};
const configs = {
 quote:{title:'Cotización comparativa',subtitle:'Centro Aurora · ofertas de referencia y adjudicación',role:'engineer',active:'projects',status:'Existe · experiencia refinada',variants:[{id:'guided',label:'Compra guiada',description:'Primero definí el plazo, después revisá ofertas y adjudicá.'},{id:'expert',label:'Matriz experta',description:'Todos los materiales y proveedores a la vez, con asignación directa.'}],steps:[{id:'goal',label:'Objetivo'},{id:'offers',label:'Ofertas'},{id:'assign',label:'Adjudicar'},{id:'confirm',label:'Solicitar'}],render:quoteRender},
 orders:{title:'Solicitudes enviadas',subtitle:'Aceptación, rechazo y contacto por proveedor',role:'engineer',active:'orders',status:'Existe · experiencia refinada',variants:[{id:'tracking',label:'Seguimiento',description:'Lista y detalle de la solicitud con estado visible.'}],steps:[{id:'list',label:'Solicitudes'},{id:'detail',label:'Detalle y contacto'}],render:ordersRender},
 supplier:{title:'Solicitudes recibidas',subtitle:'Delta Suministros · Centro Aurora',role:'supplier',active:'orders',status:'Existe + propuesta identificada',variants:[{id:'inbox',label:'Respuesta actual',description:'Aceptar o rechazar la solicitud; contacto solo al confirmar.'},{id:'negotiated',label:'Oferta por línea · propuesta',description:'Editar precio, disponibilidad y plazo antes de que el comprador compare.'}],steps:[{id:'inbox',label:'Bandeja'},{id:'request',label:'Responder'},{id:'sent',label:'Resultado'}],render:supplierRender},
 catalog:{title:'Mi catálogo',subtitle:'Delta Suministros · importar y estandarizar',role:'supplier',active:'catalog',status:'Existe + propuesta identificada',variants:[{id:'replace',label:'Reemplazo actual',description:'Validar y reemplazar el catálogo completo antes de la lectura.'},{id:'incremental',label:'Cambios incrementales · propuesta',description:'Revisar altas y cambios conservando ítems no incluidos en el archivo.'}],steps:[{id:'summary',label:'Resumen'},{id:'map',label:'Mapear'},{id:'preview',label:'Confirmar'},{id:'reading',label:'Corregir'}],render:catalogRender},
 commercial:{title:'Presupuesto al cliente',subtitle:'Centro Aurora · costo, margen y propuesta',role:'engineer',active:'projects',status:'Propuesta · validar',variants:[{id:'guided',label:'Costeo guiado',description:'Separar origen de costos, probar margen y aprobar la propuesta.'},{id:'expert',label:'Mesa de escenarios',description:'Costos y margen simultáneos para iterar el precio de venta.'}],steps:[{id:'cost',label:'Costos'},{id:'scenario',label:'Escenarios'},{id:'proposal',label:'Propuesta'},{id:'approval',label:'Aprobación'}],render:budgetRender}
};
L.boot({...configs[domain],onAction});
})();
