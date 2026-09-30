import {chromium} from '/Users/pedrodelaguila/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import path from 'node:path';
const root=path.dirname(new URL(import.meta.url).pathname),base='http://127.0.0.1:8766';
await fs.mkdir(path.join(root,'shots','verified'),{recursive:true});
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--allow-file-access-from-files','--no-sandbox']});
const pages=['d-projects','d-engineering','d-panel','d-rfq','d-supplier','d-comparison','d-orders','d-operations','d-collaboration','d-network','m-field'];
const variants=['guided','expert','assisted','visual'];
const report={startedAt:new Date().toISOString(),checks:[],screens:[],errors:[],overflow:[],accessibility:[],timings:[]};
function pass(name,detail=''){report.checks.push({name,result:'PASS',detail});}
async function shoot(page,name){const file='shots/verified/'+name+'.png';await page.screenshot({path:path.join(root,file),fullPage:true});report.screens.push({name,file});}
async function goto(page,file,v,extra=''){await page.goto(base+'/'+file+'.html?v='+v+'&proyecto=p1'+extra);await page.waitForFunction(()=>window.L&&document.querySelector('#page'));await page.waitForTimeout(120);}
try{
 const context=await browser.newContext({viewport:{width:1440,height:994},acceptDownloads:true,locale:'es-AR'});
 const page=await context.newPage();page.on('pageerror',e=>report.errors.push(e.message));
 for(const v of variants){
  await goto(page,'d-projects',v);await page.evaluate(()=>L.reset());
  for(const file of pages){
   await page.setViewportSize(file==='m-field'?{width:390,height:844}:{width:1440,height:994});
   const start=Date.now();await goto(page,file,v);report.timings.push({file,v,loadMs:Date.now()-start});
   const info=await page.evaluate(()=>({overflow:document.documentElement.scrollWidth>innerWidth+2,h1:document.querySelectorAll('h1').length,labels:[...document.querySelectorAll('input:not([type=hidden]),select,textarea')].filter(el=>!el.labels?.length&&!el.getAttribute('aria-label')&&!el.getAttribute('aria-labelledby')).map(el=>el.name||el.id)}));
   if(info.overflow)report.overflow.push(file+':'+v);
   if(info.labels.length)report.accessibility.push({file,v,unlabeled:info.labels});
   await shoot(page,file+'-'+v);
  }
 }
 pass('44 páginas × variante cargadas',report.errors.length+' errores JavaScript');
 // Responsive every desktop workflow, every variant. Record and capture.
 for(const v of variants){for(const file of pages.filter(p=>p!=='m-field')){
  await page.setViewportSize({width:390,height:844});await goto(page,file,v);
  if(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2))report.overflow.push(file+':'+v+':mobile');
  await shoot(page,file+'-'+v+'-mobile');
 }}
 await page.setViewportSize({width:1440,height:994});
 // UI end-to-end across each variant, including supplier stock validation and recovery.
 for(const v of variants){
  await goto(page,'d-projects',v);await page.evaluate(()=>L.reset());
  await goto(page,'d-rfq',v);
  if(v==='guided'){await page.locator('[data-action="rfq-next"]').click();assert.match(await page.locator('#commerce-error').innerText(),/aprobá|revisión|revis/);}
  else {await page.locator('input[name="suppliers"][value="s1"]').check();await page.locator('#rfq-form button[type="submit"]').click();assert.match(await page.locator('#commerce-error').innerText(),/revis|canónico/);}
  assert.equal(await page.evaluate(()=>L.state().rfqs.length),0);pass(v+': revisión requerida antes de RFQ');
  await goto(page,'d-engineering',v);
  if(v==='guided')await page.locator('[data-action="step"][data-step="1"]').click();
  await page.locator('[data-action="select"][data-id="l2"]').first().click();
  await page.locator('#canonical-form input[name="approved"]').check();
  await page.locator('#canonical-form button[type="submit"]').click();
  assert.equal(await page.evaluate(()=>L.reviewed(L.project())),true);pass(v+': revisión humana guardada');
  await page.reload();assert.equal(await page.evaluate(()=>L.reviewed(L.project())),true);pass(v+': persistencia tras reload');
  await goto(page,'d-rfq',v);
  if(v==='guided'){await page.locator('[data-action="rfq-next"]').click();await page.locator('input[name="suppliers"][value="s1"]').check();await page.locator('input[name="suppliers"][value="s2"]').check();await page.locator('[data-action="rfq-next"]').click();}
  else{await page.locator('input[name="suppliers"][value="s1"]').check();await page.locator('input[name="suppliers"][value="s2"]').check();}
  await page.locator('#rfq-form textarea[name="notes"]').fill('Entrega en Rosario; confirmar stock por línea.');
  await page.locator('#rfq-form button[type="submit"]').click();
  const rfq=await page.evaluate(()=>L.state().rfqs.at(-1));assert.equal(rfq.lines[0].requiredQuantity,36);assert.equal(rfq.supplierIds.length,2);pass(v+': snapshot RFQ cantidades efectivas');await shoot(page,'journey-rfq-'+v);
  for(const supplier of ['s1','s2']){
   await goto(page,'d-supplier',v,'&rfq='+rfq.id+'&proveedor='+supplier);
   if(v==='guided')await page.locator('[data-action="step"][data-step="3"]').click();
   await page.locator('#offer-form button[value="submit"]').click();
   assert.match(await page.locator('#commerce-error').innerText(),/stock|cantidad/);assert.equal(await page.evaluate(()=>L.state().offers.length),supplier==='s1'?0:1);pass(v+': '+supplier+' stock desconocido bloquea oferta');
   for(const line of rfq.lines){await page.locator('[name="stock-'+line.id+'"]').fill(String(line.requiredQuantity));await page.locator('[name="confirmed-'+line.id+'"]').check();await page.locator('[name="price-'+line.id+'"]').fill((line.referenceCents/100*(supplier==='s1'?.94:1.02)).toFixed(2));}
   await page.locator('[name="shipping"]').fill(supplier==='s1'?'50':'10');
   await page.locator('#offer-form button[value="submit"]').click();
   assert.equal(await page.evaluate(id=>L.state().offers.find(o=>o.supplierId===id).status,supplier),'SUBMITTED');pass(v+': '+supplier+' oferta editable presentada');
   assert.equal(await page.locator('.sidebar .nav-link').count(),1);assert.equal(await page.locator('body').innerText().then(t=>t.includes('Margen actual')),false);pass(v+': portal propio sin márgenes');
   await shoot(page,'journey-offer-'+supplier+'-'+v);
  }
  await goto(page,'d-comparison',v,'&rfq='+rfq.id);
  if(v==='guided')await page.locator('[data-action="step"][data-step="3"]').click();
  const c=await page.evaluate(()=>L.costs(L.project(),L.state().offers[0]));assert.equal(c.marginCents,c.revenueCents-c.totalCents);assert.ok(Math.abs(c.marginPercent-c.marginCents/c.revenueCents*100)<1e-8);pass(v+': margen calculado sin confundir recargo');
  await shoot(page,'journey-comparison-'+v);
  await page.locator('#order-form [name="approved"]').check();
  const downloadPromise=page.waitForEvent('download');await page.locator('#order-form button[type="submit"]').click();const download=await downloadPromise;const downloadedPath=await download.path();const html=await fs.readFile(downloadedPath,'utf8');assert.match(html,/Datos ficticios|DEMO/);assert.match(html,/Cantidad/);pass(v+': descarga pedido real con contenido');
  await page.waitForURL('**/d-orders.html?**');const order=await page.evaluate(()=>L.state().orders[0]);assert.equal(order.lines[0].quantity,36);assert.equal(order.totalCents,order.materialsCents+order.shippingCents);pass(v+': pedido consistente con oferta');await shoot(page,'journey-order-'+v);
  await goto(page,'d-supplier',v,'&rfq='+rfq.id+'&proveedor='+order.supplierId);
  if(v==='guided')await page.locator('[data-action="step"][data-step="3"]').click();
  await page.locator('[data-action="supplier-accept"]').first().click();assert.equal(await page.evaluate(()=>L.state().orders[0].status),'CONFIRMED');pass(v+': proveedor confirma pedido');
  await goto(page,'m-field',v);await page.setViewportSize({width:390,height:844});await shoot(page,'journey-field-'+v);
  const fieldStep=async i=>{if(v==='guided')await page.locator('.op-guided [data-action="step"][data-index="'+i+'"]').click();if(v==='visual')await page.locator('.op-linkmap [data-action="focus"][data-index="'+i+'"]').click();};
  await page.locator('[data-form="receipt"] [name="reference"]').fill('REMITO-QA-'+v);
  await page.locator('[data-form="receipt"] [name="qty-l1"]').fill('1');await page.locator('[data-form="receipt"] button[type="submit"]').click();
  assert.equal(await page.evaluate(()=>L.state().orders[0].status),'PARTIAL');pass(v+': recepción parcial desde pedido comercial real local');await shoot(page,'field-partial-'+v);
  await fieldStep(1);assert.equal(await page.locator('[data-action="installation"][data-line="l1"]').isDisabled(),true);pass(v+': faltante bloquea montaje');
  await fieldStep(0);await page.locator('[data-action="receive-remaining"]').click();assert.equal(await page.evaluate(()=>L.state().orders[0].status),'RECEIVED');pass(v+': recepción acumulada completa');
  await fieldStep(1);for(const line of order.lines)await page.locator('[data-action="installation"][data-line="'+line.lineId+'"]').check();pass(v+': montaje humano registra cada línea');await shoot(page,'field-installation-'+v);
  await fieldStep(2);await page.locator('[data-form="handover"] [name="serial"]').fill('TG-QA-'+v);await page.locator('[data-form="handover"] [name="approved"]').check();
  const handoverPromise=page.waitForEvent('download');await page.locator('[data-form="handover"] button[type="submit"]').click();const handover=await handoverPromise;const handoverContent=JSON.parse(await fs.readFile(await handover.path(),'utf8'));assert.equal(handoverContent.demo,true);assert.equal(handoverContent.order.id,order.id);assert.equal(handoverContent.order.lines[0].quantity,36);assert.equal(handoverContent.installation.length,5);assert.equal(handoverContent.receipts.reduce((sum,r)=>sum+r.items.reduce((sum,i)=>sum+(i.lineId==='l1'?i.quantity:0),0),0),36);pass(v+': entrega descargada contiene pedido recepción y montaje');await shoot(page,'field-handover-'+v);
  await fieldStep(3);await page.locator('[data-form="service"] [name="description"]').fill('Revisar identificación de borneras en visita programada.');await page.locator('[data-form="service"] [name="consent"]').check();await page.locator('[data-form="service"] button[type="submit"]').click();await page.locator('[data-action="resolve-service"]').click();assert.equal(await page.evaluate(()=>L.state().serviceRequests[0].status),'RESOLVED');pass(v+': activo conserva servicio cerrado');await shoot(page,'field-service-'+v);
  await page.setViewportSize({width:1440,height:994});
  // Actual cross-tab propagation.
  const other=await context.newPage();await goto(other,'d-orders',v);await page.evaluate(()=>L.update(s=>{s.projects[0].name='Hospital del Parque · revisión compartida';},'QA multiventana'));
  await other.waitForFunction(()=>document.querySelector('#project-context').textContent.includes('compartida'));pass(v+': almacenamiento propaga entre ventanas');await other.close();
  // Generic error states and recovery on every domain entry.
  for(const file of ['d-engineering','d-rfq','d-operations','m-field']){
   await goto(page,file,v,'&estado=error');assert.ok(await page.locator('[data-action="recover"]').isVisible());await shoot(page,'error-'+file+'-'+v);await page.locator('[data-action="recover"]').click();await page.waitForURL(url=>!url.searchParams.has('estado'));pass(v+': '+file+' error recuperable');
  }
  await goto(page,'d-panel',v);const before=await page.locator('.eng-cabinet').getAttribute('style');
  await page.locator('#angle').fill('40');await page.locator('#angle').dispatchEvent('input');const after=await page.locator('.eng-cabinet').getAttribute('style');assert.notEqual(before,after);
  await page.locator('#zoom').fill('120');await page.locator('#zoom').dispatchEvent('input');await page.locator('[data-action="explode"]').click();await page.locator('[data-action="flat"]').click();assert.equal(await page.locator('.eng-stage.flat').count(),1);pass(v+': giro zoom despiece y 2D funcionales');await shoot(page,'3d-controls-'+v);
  await page.locator('#reset-demo').click();assert.equal(await page.evaluate(()=>L.state().orders.length),0);assert.equal(await page.evaluate(()=>L.reviewed(L.project())),false);pass(v+': reset restaura seed');
 }
 // Gallery rendered iframe links and role/roadmap filters.
 await page.setViewportSize({width:1440,height:994});await page.goto(base+'/index.html');assert.equal(await page.locator('iframe').count(),14);
 await page.locator('[data-v="visual"]').click();assert.ok((await page.locator('iframe').first().getAttribute('src')).includes('v=visual'));pass('Gallery picker cambia todas las pantallas');
 await page.locator('#role-filter').selectOption('field');assert.equal(await page.locator('.gallery-section:visible').count(),2);await page.locator('#role-filter').selectOption('all');pass('Filtros rol y horizonte funcionales');await page.locator('#demo-scenario').selectOption('offers');await page.locator('#load-scenario').click();assert.equal(await page.evaluate(()=>L.state().offers.length),2);pass('Escenario comparación comparte dos ofertas ficticias');await shoot(page,'0-gallery');await page.locator('#demo-scenario').selectOption('field');await page.locator('#load-scenario').click();assert.equal(await page.evaluate(()=>L.state().orders[0].status),'CONFIRMED');pass('Escenario obra prepara pedido consistente');
 await page.goto(base+'/index.html?s=engineering&bare=1&full=1&measure=1');await page.waitForTimeout(700);assert.equal(await page.locator('.gallery-section:visible').count(),1);assert.match(await page.title(),/^H=/);pass('Gallery s bare full measure compatibles');await shoot(page,'gallery-engineering');
 for(const section of ['panel','procurement','supplier','operations','collaboration','field']){await page.goto(base+'/index.html?s='+section+'&bare=1&full=1&v=expert');await page.waitForTimeout(500);await shoot(page,'gallery-'+section);}
 // File scheme smoke independent context.
 const fileContext=await browser.newContext({viewport:{width:1440,height:994}});const filePage=await fileContext.newPage();
 await filePage.goto('file://'+path.join(root,'index.html'));assert.equal(await filePage.locator('iframe').count(),14);await filePage.goto('file://'+path.join(root,'d-engineering.html')+'?v=expert');assert.ok(await filePage.locator('#canonical-form').count());pass('file:// galería e ingeniería cargan');await fileContext.close();
 await context.close();
}catch(error){report.errors.push(error.stack);console.error(error.stack);process.exitCode=1;}
finally{report.finishedAt=new Date().toISOString();await fs.writeFile(path.join(root,'qa-results.json'),JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify({checks:report.checks.length,screens:report.screens.length,errors:report.errors,overflow:report.overflow,a11y:report.accessibility},null,2));}
