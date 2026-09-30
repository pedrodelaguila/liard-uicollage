document.addEventListener('DOMContentLoaded',()=>{
const params=new URLSearchParams(location.search),selected=params.get('s'),full=params.get('full')==='1';
if(params.get('bare')==='1')document.body.classList.add('bare');
const descriptions={guided:'Guiada: pasos y requisitos explícitos para usuarios ocasionales. Más navegación a cambio de menor carga inicial.',expert:'Experta: tablas y decisiones simultáneas para uso recurrente. Reiniciá para comparar con el mismo expediente inicial.',assisted:'Asistida: sugerencias con evidencia y aprobación individual. Consumo y respuestas simulados; siempre hay una vía manual.',visual:'Visual: vínculos, selección e inspector espacial con alternativa tabular. Modelo conceptual, sin precisión de fabricación.'};
const frames=[];
document.querySelectorAll('[data-frames]').forEach(container=>{
container.dataset.frames.trim().split('\n').map(l=>l.split('|')).forEach(([kind,src,caption,note])=>{
const figure=document.createElement('figure'),device=document.createElement('div');device.className=kind==='m'?'phone':'desk';
const viewport=kind==='m'?device:document.createElement('div');if(kind!=='m'){viewport.className='vp';device.append(viewport);}
const iframe=document.createElement('iframe');iframe.title=caption;iframe.loading='lazy';viewport.append(iframe);figure.append(device);
const cap=document.createElement('figcaption');cap.append(document.createTextNode(caption));const link=document.createElement('a');link.textContent='Abrir pantalla ↗';link.target='_blank';link.rel='noopener';cap.append(link);const small=document.createElement('small');small.textContent=note;cap.append(small);figure.append(cap);container.append(figure);frames.push({iframe,link,src,kind,viewport});
});
});
const changeVariant=v=>{
document.getElementById('variant-tradeoff').textContent=descriptions[v];document.querySelectorAll('[data-v]').forEach(b=>{b.classList.toggle('selected',b.dataset.v===v);b.setAttribute('aria-pressed',String(b.dataset.v===v));});
frames.forEach(frame=>{const url=L.href(frame.src,{v});frame.iframe.src=url;frame.link.href=url;});
document.querySelectorAll('[data-page]').forEach(a=>a.href=L.href(a.dataset.page,{v,estado:a.dataset.state||null}));document.getElementById('start-demo').href=L.href('d-projects.html',{v});
const url=new URL(location.href);url.searchParams.set('v',v);history.replaceState({},'',url);
};
document.querySelectorAll('[data-v]').forEach(b=>b.onclick=()=>changeVariant(b.dataset.v));changeVariant(L.variant());
const filter=()=>{const role=document.getElementById('role-filter').value,horizon=document.getElementById('horizon-filter').value;let count=0;document.querySelectorAll('.gallery-section').forEach(s=>{s.hidden=Boolean((selected&&s.id!==selected)||(role!=='all'&&!s.dataset.roles.split(' ').includes(role))||(horizon!=='all'&&s.dataset.horizon!==horizon));if(!s.hidden)count++;});document.getElementById('no-sections').hidden=count>0;};
document.getElementById('role-filter').onchange=filter;document.getElementById('horizon-filter').onchange=filter;filter();
document.getElementById('load-scenario').onclick=()=>{
const stage=document.getElementById('demo-scenario').value;L.reset();
if(stage!=='initial')L.update(s=>{const p=s.projects[0];p.lines.forEach(l=>{l.technicalApproved=true;l.canonicalStatus='confirmed';});p.version=2;const deadline=new Date(Date.now()+86400000*14).toISOString().slice(0,10);const r={id:'RFQ-MUESTRA',projectId:p.id,projectVersion:2,lines:p.lines.map(l=>({...l,requiredQuantity:L.qty(l,p)})),supplierIds:['s1','s2'],deadline,notes:'Escenario ficticio preparado para explorar. No se enviaron mensajes.',status:'SENT',createdAt:new Date().toISOString()};s.rfqs.push(r);s.offers=s.suppliers.map((supplier,i)=>({id:'OFERTA-MUESTRA-'+(i+1),rfqId:r.id,supplierId:supplier.id,status:'SUBMITTED',validUntil:deadline,leadDays:i?3:7,paymentTerms:i?'Transferencia anticipada':'Transferencia a 15 días',shippingCents:i?1000:5000,lines:r.lines.map(l=>({lineId:l.id,quantity:l.requiredQuantity,priceCents:Math.round(l.referenceCents*(i?1.02:.94)),stockConfirmed:true,stockQuantity:l.requiredQuantity,alternativeId:null})),notes:'Oferta de muestra, datos ficticios.',revision:1}));if(stage==='field'){const o=s.offers[0];o.status='ACCEPTED';const materialsCents=L.subtotal(o,p);s.orders.push({id:'OC-MUESTRA',rfqId:r.id,offerId:o.id,projectId:p.id,supplierId:o.supplierId,status:'CONFIRMED',lines:o.lines.map(l=>({lineId:l.lineId,name:p.lines.find(x=>x.id===l.lineId).name,quantity:l.quantity,priceCents:l.priceCents})),materialsCents,shippingCents:o.shippingCents,taxPercent:0,totalCents:materialsCents+o.shippingCents,createdAt:new Date().toISOString()});}},'Escenario ficticio preparado; sin envío ni confirmación real');
document.getElementById('scenario-feedback').textContent=stage==='initial'?'Inicio restaurado':stage==='offers'?'Dos ofertas ficticias listas para explorar':'Pedido ficticio listo para recepción';
};
document.getElementById('reset-gallery').onclick=()=>{L.reset();document.getElementById('reset-gallery').textContent='Demo reiniciada';setTimeout(()=>document.getElementById('reset-gallery').textContent='Reiniciar demo',2000);};
window.addEventListener('message',event=>{if(event.origin!==location.origin&&location.protocol!=='file:')return;if(event.data?.type!=='liard:height'||!full)return;const frame=frames.find(f=>f.iframe.contentWindow===event.source);if(!frame)return;const height=Math.min(10000,Math.max(frame.kind==='m'?844:994,Number(event.data.height)||994));frame.iframe.style.height=height+'px';frame.viewport.style.height=(frame.kind==='m'?height:height*.583333)+'px';});
if(params.get('measure')==='1')new ResizeObserver(()=>document.title='H='+document.documentElement.scrollHeight).observe(document.body);
});
