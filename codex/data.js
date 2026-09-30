/* Datos ficticios; el contenedor L es dueño del estado de esta demo local. */
window.L = (() => {
  const key = 'liard-collage-v1';
  const copy = value => JSON.parse(JSON.stringify(value));
  const initial = () => ({schema:1,version:1,activeProjectId:'p1',projects:[{
    id:'p1',name:'Hospital del Parque',client:'Fundación Horizonte',site:'Rosario · edificio A',version:1,multiplier:3,
    plans:[{id:'plan1',name:'Tablero general — nivel 01.dxf',format:'DXF',status:'READY',progress:100}],
    lines:[
      {id:'l1',type:'CircuitBreaker',name:'Interruptor termomagnético',spec:'4P · 25 A · 6 kA',quantity:12,unit:'u',referenceCents:4200,canonicalStatus:'confirmed',technicalApproved:true,brand:'Sin preferencia',required:{poles:4,current:25,breakingCapacity:6000}},
      {id:'l2',type:'DifferentialSwitch',name:'Interruptor diferencial',spec:'4P · 40 A · 30 mA',quantity:4,unit:'u',referenceCents:8800,canonicalStatus:'suggested',technicalApproved:false,brand:'Sin preferencia',required:{poles:4,current:40,sensitivity:30}},
      {id:'l3',type:'Contactor',name:'Contactor',spec:'3P · 18 A · bobina 220 V',quantity:2,unit:'u',referenceCents:5300,canonicalStatus:'confirmed',technicalApproved:true,brand:'Sin preferencia',required:{poles:3,current:18,coil:220}},
      {id:'l4',type:'Enclosure',name:'Gabinete metálico',spec:'800 × 600 × 200 mm · IP54',quantity:1,unit:'u',referenceCents:24500,canonicalStatus:'confirmed',technicalApproved:true,brand:'Sin preferencia',required:{height:800,width:600,depth:200,ip:54}},
      {id:'l5',type:'Terminal',name:'Bornera de paso',spec:'2,5 mm² · montaje DIN',quantity:24,unit:'u',referenceCents:180,canonicalStatus:'confirmed',technicalApproved:true,brand:'Sin preferencia',required:{section:2.5}}
    ],
    alternatives:[{id:'a1',lineId:'l1',name:'Serie Vector 25',spec:'4P · 25 A · 6 kA',referenceCents:3800,status:'suggested',reason:'Mismos atributos declarados. Verificar ficha y compatibilidad de montaje.'}],
    scenarios:[],laborCents:180000,overheadCents:65000,riskPercent:5,revenueCents:1800000,notes:[],documents:[]
  }],suppliers:[{id:'s1',name:'Delta Eléctrica',city:'Rosario',verified:false},{id:'s2',name:'Sur Suministros',city:'Córdoba',verified:false}],
  catalog:[
    {id:'c1',supplierId:'s1',name:'Termomagnético Serie Vector',spec:'4P · 25 A · 6 kA',type:'CircuitBreaker',priceCents:3800,stock:null,currency:'USD',readingStatus:'READ',canonicalStatus:'suggested',updatedAt:'2026-09-30'},
    {id:'c2',supplierId:'s1',name:'Diferencial Serie Delta',spec:'4P · 40 A · 30 mA',type:'DifferentialSwitch',priceCents:8100,stock:null,currency:'USD',readingStatus:'READ',canonicalStatus:'confirmed',updatedAt:'2026-09-30'},
    {id:'c3',supplierId:'s2',name:'Contactor Serie Sur',spec:'3P · 18 A · 220 V',type:'Contactor',priceCents:4900,stock:null,currency:'USD',readingStatus:'PENDING',canonicalStatus:'suggested',updatedAt:'2026-09-30'}
  ],rfqs:[],offers:[],orders:[],events:[],budget:{limitCents:2000,spentCents:420,reservedCents:0},automation:{offerAlerts:false},rules:[],leads:[],connectors:[],receipts:[],tasks:[],assets:[],serviceRequests:[]});
  let memory;
  const state = () => {
    try { const saved = JSON.parse(localStorage.getItem(key)); if(saved?.schema===1 && Array.isArray(saved.projects)) return saved; } catch (_) { /* file:// puede restringir almacenamiento según navegador */ }
    return copy(memory || initial());
  };
  const persist = value => { memory=copy(value); try {localStorage.setItem(key,JSON.stringify(value));} catch (_) {window.dispatchEvent(new CustomEvent('liard:storage-error'));} window.dispatchEvent(new CustomEvent('liard:change')); };
  const uid = prefix => `${prefix}-${crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36)+Math.random().toString(36).slice(2)}`;
  const update = (mutator, description) => {
    const next=state(); mutator(next); next.version++;
    if(description) next.events.unshift({id:uid('event'),at:new Date().toISOString(),actor:document.body.dataset.role==='supplier'?'Proveedor demo':'Equipo de ingeniería',description,projectId:project()?.id});
    persist(next); return copy(next);
  };
  const escape = value => String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const variant = () => ['guided','expert','assisted','visual'].includes(new URLSearchParams(location.search).get('v'))?new URLSearchParams(location.search).get('v'):'expert';
  const project = () => {const s=state(); return s.projects.find(p=>p.id===(new URLSearchParams(location.search).get('proyecto')||s.activeProjectId))||s.projects[0];};
  const href = (file, extra={}) => { const q=new URLSearchParams({v:variant(),proyecto:project()?.id || 'p1'});const current=new URLSearchParams(location.search);['rfq','pedido','proveedor','linea'].forEach(k=>{if(current.has(k))q.set(k,current.get(k));});Object.entries(extra).forEach(([k,v])=>v==null?q.delete(k):q.set(k,String(v))); return `${file}?${q}`; };
  const number = value => new Intl.NumberFormat('es-AR',{maximumFractionDigits:2}).format(Number(value)||0);
  const money = cents => new Intl.NumberFormat('es-AR',{style:'currency',currency:'USD',maximumFractionDigits:2}).format((Number(cents)||0)/100);
  const qty = (line,p) => Number(line.quantity)*Number(p.multiplier);
  const subtotal = (offer,p=project()) => offer ? offer.lines.reduce((sum,line)=>sum+Math.round(Number(line.priceCents)*Number(line.quantity)),0) : p.lines.reduce((sum,line)=>sum+Math.round(qty(line,p)*line.referenceCents),0);
  const costs = (p=project(),offer=null) => {
    const materialsCents=subtotal(offer,p),shippingCents=Number(offer?.shippingCents)||0,laborCents=Number(p.laborCents)||0,overheadCents=Number(p.overheadCents)||0;
    const base=materialsCents+shippingCents+laborCents+overheadCents,riskCents=Math.round(base*(Number(p.riskPercent)||0)/100),totalCents=base+riskCents,revenueCents=Number(p.revenueCents)||0,marginCents=revenueCents-totalCents;
    return {materialsCents,shippingCents,laborCents,overheadCents,riskCents,totalCents,revenueCents,marginCents,marginPercent:revenueCents>0?marginCents/revenueCents*100:0};
  };
  const reviewed = p => Boolean(p?.lines.length) && p.lines.every(l=>l.technicalApproved && l.canonicalStatus==='confirmed');
  const csv = rows => '\uFEFF'+rows.map(row=>row.map(v=>{let t=String(v??'');if(/^[\s]*[=+\-@]/.test(t))t="'"+t;return '"'+t.replaceAll('"','""')+'"';}).join(',')).join('\r\n');
  const download = (name,content,mime='text/plain;charset=utf-8') => {const blob=new Blob([content],{type:mime});const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);};
  const subscribe = render => {window.addEventListener('liard:change',render);window.addEventListener('storage',event=>{if(event.key===key)render();});};
  const toast = message => {const el=document.getElementById('toast');if(el){el.textContent=message;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),4500);}};
  const error = (message,containerId='form-error') => {const el=document.getElementById(containerId);if(el){el.textContent=message;el.hidden=false;el.setAttribute('role','alert');el.focus();}else toast(message);};
  const paths={grid:'M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z',project:'M3 7h6l2-3h10v16H3z',plan:'M6 3h9l4 4v14H6z M14 3v5h5 M9 12h7 M9 16h7',cube:'m12 3 9 5v9l-9 5-9-5V8z M3 8l9 5 9-5 M12 13v9',send:'m3 3 19 9-19 9 4-9z M7 12h15',catalog:'M4 3h16v18H4z M8 7h8 M8 12h8 M8 17h5',compare:'M6 3v18 M18 3v18 M2 8h8 M14 16h8',order:'M6 3h12v18H6z M9 8h6 M9 12h6 M9 16h4',chart:'M3 3v18h18 M7 17v-5 M12 17V7 M17 17v-8',users:'M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3 M9 10a4 4 0 1 0 0-8 4 4 0 0 0 0 8 M20 21v-3a4 4 0 0 0-3-4 M16 2a4 4 0 0 1 0 8',network:'M4 5h5v5H4z M15 14h5v5h-5z M4 14h5v5H4z M9 7h8v7 M7 10v4',field:'M5 4h14v16H5z M9 2h6v4H9z m4 11 2 2 4-4',arrow:'M4 12h16 m-6-6 6 6-6 6',check:'m5 12 4 4 10-10',plus:'M12 5v14 M5 12h14',search:'M10 3a7 7 0 1 0 0 14 7 7 0 0 0 0-14 m5 12 6 6',refresh:'M20 7v5h-5 M4 17v-5h5 M20 12a8 8 0 0 0-14-5 M4 12a8 8 0 0 0 14 5',download:'M12 3v12 m-5-5 5 5 5-5 M4 17v4h16v-4',alert:'m12 3 10 18H2z M12 9v5 M12 17v1',spark:'m12 2 3 7 7 3-7 3-3 7-3-7-7-3 7-3z',close:'m6 6 12 12 M6 18 18 6',eye:'M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6',edit:'m15 3 6 6-12 12H3v-6z M12 6l6 6',clock:'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18 M12 7v5l4 2',lock:'M6 10h12v11H6z M8 10V6a4 4 0 0 1 8 0v4',menu:'M3 6h18 M3 12h18 M3 18h18',chevron:'m9 5 7 7-7 7'};
  const icon = name => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[name]||paths.grid}"/></svg>`;
  return Object.freeze({state,update,reset:()=>persist(initial()),uid,escape,variant,project,href,money,number,qty,subtotal,costs,reviewed,csv,download,subscribe,toast,error,icon,page:()=>location.pathname.split('/').pop(),key});
})();
