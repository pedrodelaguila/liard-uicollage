/* Suite del área «obras»: inicio, obras, obra (guiado y experto), recorte, móvil.
   node tools/tests/obras.test.js */
const { run } = require('../pw');
const buf = s => Buffer.from(s);
const dlg = '.dlg[open]';
const dlgBtn = (p, label) => p.click(`${dlg} footer button:has-text("${label}")`);
const st = (p, fn, arg) => p.evaluate(fn, arg);

run('obras', async ({ open, shot, expect, log }) => {
  /* ── 1. Nueva obra: validaciones y alta ── */
  let p = await open('d-obras.html');
  await shot(p, '01-obras');
  expect(await p.locator('.oc').count() === 4, 'lista las 4 obras de la demo');
  await p.click('#btn-new');
  await dlgBtn(p, 'Crear obra');
  expect((await p.textContent(`${dlg} .field-err`)).includes('Escribí el nombre'), 'nombre vacío: error');
  await p.fill('#np-name', 'ab'); await dlgBtn(p, 'Crear obra');
  expect((await p.textContent(`${dlg} .field-err`)).includes('al menos 3'), 'nombre corto: error');
  await p.fill('#np-name', 'x'.repeat(81)); await dlgBtn(p, 'Crear obra');
  expect((await p.textContent(`${dlg} .field-err`)).includes('como máximo 80'), 'nombre largo: error');
  await p.fill('#np-name', 'Clínica San Martín · Etapa 1'); await dlgBtn(p, 'Crear obra');
  expect((await p.textContent(`${dlg} .field-err`)).includes('Ya tenés una obra'), 'nombre duplicado: error');
  await shot(p, '02-nueva-obra-error', false);
  await p.fill('#np-name', 'Torre Pellegrini · TGBT'); await p.fill('#np-client', 'Desarrollos Litoral'); await p.fill('#np-city', 'Santa Fe');
  await dlgBtn(p, 'Crear obra');
  await p.waitForTimeout(300);
  const np = await st(p, () => { const pr = L.store.get().projects.find(x => x.name === 'Torre Pellegrini · TGBT'); return pr && { id: pr.id, city: pr.city, budget: !!L.store.get().budgets[pr.id] }; });
  expect(np && np.city === 'Santa Fe' && np.budget, 'obra creada en el store con su presupuesto');
  expect(await p.isVisible('text=Obra creada'), 'aviso «Obra creada»');
  expect(await p.locator('.oc').count() === 5, 'la tarjeta nueva aparece');
  /* búsqueda, filtros, orden, vacío por filtros */
  await p.fill('#q', 'rafaela'); expect(await p.locator('.oc').count() === 1, 'buscar por ciudad');
  await p.fill('#q', 'zzz'); expect(await p.isVisible('text=Sin resultados'), 'vacío por filtros');
  await shot(p, '03-obras-sin-resultados', false);
  await p.click('[data-clear]'); expect(await p.locator('.oc').count() === 5, 'limpiar filtros');
  await p.click('[data-stage="nuevo"]'); expect(await p.locator('.oc').count() === 2, 'filtro «Sin planos»: Alvear + nueva');
  await p.click('[data-stage="todas"]');
  await p.selectOption('#sort', 'total');
  const firstByTotal = await p.textContent('.oc h3');
  expect(firstByTotal.includes('Clínica'), 'orden por total de referencia: Clínica primero (' + firstByTotal.trim() + ')');
  await p.selectOption('#sort', 'nombre'); expect((await p.textContent('.oc h3')).includes('Clínica'), 'orden por nombre');
  await p.click('[data-view="list"]'); expect(await p.isVisible('table.tbl'), 'vista lista');
  await shot(p, '04-obras-lista', false);
  await p.click('[data-view="grid"]');
  const pv = await open('d-obras.html?estado=vacio'); expect(await pv.isVisible('text=No hay obras todavía'), 'vacío real por ?estado=vacio'); await shot(pv, '05-obras-vacio', false);
  /* abrir la obra nueva desde su tarjeta */
  await p.click(`[data-proj="${np.id}"] h3 a`); await p.waitForLoadState('load'); await p.waitForTimeout(400);
  expect(p.url().includes('d-obra.html') && p.url().includes('p=' + np.id), 'navega a la obra nueva');
  expect(await p.isVisible('text=Todavía no hay planos'), 'obra nueva sin planos, guiado');
  await shot(p, '06-obra-nueva-guiado');

  /* ── 2. Subida de planos ── */
  p = await open('d-obra.html?p=p1&v=guiado');
  await p.setInputFiles('#file-plans', [{ name: 'notas.txt', mimeType: 'text/plain', buffer: buf('hola') }, { name: 'X-01_TS-C.dxf', mimeType: 'application/octet-stream', buffer: buf('0\nSECTION') }]);
  expect(await p.isVisible('[data-upmsg] >> text=No se subió ningún plano'), 'tipo inválido: rechaza toda la subida');
  expect((await p.textContent('[data-upmsg]')).includes('Solo se permiten archivos .dxf o .pdf'), 'mensaje dice el porqué');
  expect(await st(p, () => L.plansOf('p1').length) === 5, 'no se agregó ningún plano');
  await shot(p, '07-subida-error', false);
  const many = Array.from({ length: 16 }, (_, i) => ({ name: `M-${i}.dxf`, mimeType: 'application/octet-stream', buffer: buf('x') }));
  await p.setInputFiles('#file-plans', many);
  expect((await p.textContent('[data-upmsg]')).includes('Máximo 15'), 'más de 15 archivos: error');
  const pdfs = Array.from({ length: 11 }, (_, i) => ({ name: `P-${i}.pdf`, mimeType: 'application/pdf', buffer: buf('%PDF') }));
  await p.setInputFiles('#file-plans', pdfs);
  expect((await p.textContent('[data-upmsg]')).includes('hasta 10 PDF'), 'más de 10 PDF: error');
  await p.setInputFiles('#file-plans', [{ name: 'CSM-E-106_TS-C.dxf', mimeType: 'application/octet-stream', buffer: buf('0\nSECTION') }, { name: 'CSM-E-107_TS-D.pdf', mimeType: 'application/pdf', buffer: buf('%PDF-1.4') }]);
  expect(await p.isVisible('[data-upmsg] >> text=2 planos subidos'), 'subida válida: 2 planos');
  const up = await st(p, () => L.plansOf('p1').filter(x => /TS-C|TS-D/.test(x.name)).map(x => x.status + ':' + x.format));
  expect(up.join() === 'PENDING:DXF,PENDING:PDF', 'quedan Pendiente con su formato (' + up + ')');
  /* arrastrar y soltar */
  await p.evaluate(() => { const dt = new DataTransfer(); dt.items.add(new File(['0'], 'CSM-E-108_TS-E.dxf')); const z = document.querySelector('[data-dz]'); z.dispatchEvent(new DragEvent('dragenter', { dataTransfer: dt, bubbles: true })); z.dispatchEvent(new DragEvent('drop', { dataTransfer: dt, bubbles: true })); });
  expect(await st(p, () => !!L.plansOf('p1').find(x => x.name === 'TS-E')), 'arrastrar y soltar crea el plano');
  await shot(p, '08-subida-ok');

  /* ── 3. Cancelar antes de arrancar ── */
  await p.click('[data-procall]');
  await p.waitForTimeout(300);
  const queuedId = await st(p, () => L.plansOf('p1').filter(x => x.status === 'PROCESSING').sort((a, b) => b.job.startedAt - a.job.startedAt)[0].id);
  await p.click(`[data-cancel="${queuedId}"]`);
  expect(await st(p, id => L.plan(id).status, queuedId) === 'PENDING', 'cancelar uno que no arrancó lo vuelve Pendiente');
  await shot(p, '09-procesando-guiado');
  /* esperar a que termine la tanda (TS-B arranca primero: 9 s) */
  await p.waitForFunction(() => !L.plansOf('p1').some(x => x.status === 'PROCESSING'), null, { timeout: 30000 });
  await p.waitForTimeout(1200);
  const tsb = await st(p, () => ({ status: L.plan('pl-tsb').status, lines: L.linesOf('p1').filter(l => l.perPlan['pl-tsb'] != null).length, un: L.store.get().unidentified.filter(u => u.planId === 'pl-tsb' && u.status === 'PENDIENTE').length, gm: !!L.linesOf('p1').find(l => l.typeId === 'gm') }));
  expect(tsb.status === 'COMPLETED', 'TS-B quedó Listo');
  expect(tsb.lines === 5 && tsb.gm, 'TS-B sumó 5 líneas al BOM (guardamotor nuevo) · ' + tsb.lines);
  expect(tsb.un === 1, 'TS-B dejó 1 símbolo sin identificar');
  expect((await p.textContent('#paso-rev')).includes('4 símbolos sin identificar'), 'el paso Revisar muestra 4 símbolos');
  expect(await p.locator('[data-plan="pl-tsb"] .badge:has-text("Listo")').count() === 1, 'etiqueta «Listo» en TS-B');
  await shot(p, '10-procesado');

  /* ── 4. Falla simulada y reintento (experto) ── */
  p = await open('d-obra.html?p=p1&v=experto');
  await shot(p, '11-experto');
  await p.check('[data-fail]');
  const failId = 'pl-tsb';
  await p.click(`[data-proc="${failId}"]`);
  await p.waitForTimeout(1500);
  const pc = await p.getAttribute(`[data-prog="${failId}"] [role=progressbar]`, 'aria-valuenow');
  expect(+pc > 0, 'barra de progreso avanza (' + pc + ' %)');
  await shot(p, '12-experto-procesando', false);
  await p.waitForFunction(id => L.plan(id).status === 'ERROR', failId, { timeout: 20000 });
  await p.waitForTimeout(1200);
  expect((await p.textContent(`[data-plan-err="${failId}"]`)).includes("504"), 'error muestra el 504');
  expect(await p.locator(`tr[data-plan="${failId}"] .badge:has-text("Error")`).count() === 1, 'etiqueta «Error»');
  await p.waitForTimeout(2500);
  expect(await st(p, id => L.plan(id).status, failId) === 'ERROR', 'el 504 no se reintenta solo');
  await shot(p, '13-experto-error');
  await p.uncheck('[data-fail]');
  await p.click(`[data-proc="${failId}"]:has-text("Reintentar")`);
  await p.waitForFunction(id => L.plan(id).status === 'COMPLETED', failId, { timeout: 20000 });
  expect(true, 'reintentar recupera: Listo');

  /* ── 5. Repeticiones ── */
  const qBefore = await st(p, () => L.qty(L.line('b9')));
  await p.click('[data-mult="pl-tstipo"]');
  for (const bad of ['0', '1001', 'abc', '2.5', '']) { await p.fill('#mult-in', bad); await dlgBtn(p, 'Guardar'); expect(await p.isVisible(`${dlg} .field-err`), `repeticiones «${bad}» rechazado`); }
  await p.fill('#mult-in', '5');
  expect((await p.textContent('#mult-prev')).includes('→'), 'vista previa antes → después');
  await shot(p, '14-repeticiones', false);
  await dlgBtn(p, 'Guardar');
  const qAfter = await st(p, () => L.qty(L.line('b9')));
  expect(qBefore === 18 && qAfter === 21, `L.qty(b9) ${qBefore} → ${qAfter}`);

  /* ── 6. Renombrar, comentar, eliminar ── */
  await p.click('[data-ren="pl-tsb"]'); await p.fill('#ren-in', 'TGBT'); await dlgBtn(p, 'Guardar');
  expect(await p.isVisible(`${dlg} .field-err`), 'renombrar a un nombre existente: error');
  await p.fill('#ren-in', 'TS-Bombas'); await dlgBtn(p, 'Guardar');
  expect(await st(p, () => L.plan('pl-tsb').name) === 'TS-Bombas', 'plano renombrado');
  await p.click('[data-cmt="pl-tstipo"]');
  expect(await p.isVisible(`${dlg} >> text=Son 4 pisos iguales`), 'comentario existente visible');
  await p.fill('#cmt-in', 'Confirmado con el cliente: los 5 pisos son iguales.'); await dlgBtn(p, 'Comentar');
  expect(await st(p, () => L.commentsOf('plan:pl-tstipo').length) === 2, 'comentario agregado con L.addComment');
  await shot(p, '15-comentarios', false);
  await p.click(`${dlg} footer button:has-text("Cerrar")`);
  const teId = 'pl-tde';
  await p.click(`[data-del="${teId}"]`); await dlgBtn(p, 'Cancelar');
  expect(await st(p, id => !L.plan(id).deleted, teId), 'cancelar no elimina');
  await p.click(`[data-del="${teId}"]`); await dlgBtn(p, 'Eliminar plano');
  expect(await st(p, id => L.plan(id).deleted, teId), 'plano eliminado tras confirmar');

  /* ── 7. Tabla de referencia: reemplazar (STALE) y eliminar ── */
  await p.setInputFiles('#file-ref', [{ name: 'refs.pdf', mimeType: 'application/pdf', buffer: buf('%PDF') }]);
  expect(await p.isVisible('text=Solo se permiten archivos .dxf para la tabla'), 'tabla no DXF: error');
  await p.setInputFiles('#file-ref', [{ name: 'CSM-E-100_referencias_v2.dxf', mimeType: 'application/octet-stream', buffer: buf('0') }]);
  await dlgBtn(p, 'Reemplazar');
  const stale = await st(p, () => L.plansOf('p1').filter(x => x.status === 'STALE').length);
  expect(stale === 4, 'reemplazar marca los planos listos como Por revisar (' + stale + ')');
  expect(await p.locator('.badge:has-text("Por revisar")').count() >= 4, 'etiqueta «Por revisar»');
  await shot(p, '16-por-revisar');
  await p.click('[data-ref-del]'); await dlgBtn(p, 'Eliminar');
  expect(await st(p, () => L.project('p1').referenceTable === null), 'tabla eliminada');

  /* ── 8. Recortar tableros ── */
  p = await open('d-obra.html?p=p4&v=guiado');
  await p.click('[data-crop]');
  await dlgBtn(p, 'Crear planos');
  expect(await p.isVisible(`${dlg} .field-err`), 'sin DXF de origen: error');
  await p.setInputFiles('#crop-file', [{ name: 'ALV-unifilar.dxf', mimeType: 'application/octet-stream', buffer: buf('0') }]);
  await dlgBtn(p, 'Crear planos');
  expect(await p.isVisible(`${dlg} >> text=Marcá al menos una zona`), 'sin zonas: error');
  const box = await p.locator('[data-cs] > svg').boundingBox();
  const drag = async (x0, y0, x1, y1) => { await p.mouse.move(box.x + box.width * x0, box.y + box.height * y0); await p.mouse.down(); await p.mouse.move(box.x + box.width * x1, box.y + box.height * y1, { steps: 5 }); await p.mouse.up(); };
  await drag(.03, .06, .43, .92); await drag(.46, .06, .71, .92);
  expect(await p.locator('[data-zl] [data-zname]').count() === 2, 'dos zonas dibujadas con el mouse');
  await p.click('details.kb summary');
  await p.fill('#zx', '74'); await p.fill('#zw', '40'); await p.click('[data-zadd]');
  expect(await p.isVisible('text=se sale del plano'), 'zona por teclado fuera del plano: error');
  await p.fill('#zw', '23'); await p.fill('#zn', 'TS-2'); await p.click('[data-zadd]');
  expect(await p.locator('[data-zl] [data-zname]').count() === 3, 'zona agregada por formulario');
  await p.fill('[data-zname="0"]', 'TGBT'); await p.fill('[data-zname="1"]', 'TS-1');
  await shot(p, '17-recorte', false);
  await p.fill('[data-zname="1"]', 'TGBT'); await dlgBtn(p, 'Crear');
  expect(await p.isVisible(`${dlg} >> text=Hay dos zonas llamadas`), 'nombres repetidos: error');
  await p.fill('[data-zname="1"]', 'TS-1'); await dlgBtn(p, 'Crear 3 planos');
  const crops = await st(p, () => L.plansOf('p4').map(x => x.name + ':' + x.status));
  expect(crops.join() === 'TGBT:PENDING,TS-1:PENDING,TS-2:PENDING', 'un plano Pendiente por zona (' + crops + ')');
  /* máximo 15 zonas */
  await p.click('[data-crop]');
  for (let i = 0; i < 16; i++) await drag(.01 + i * .06, .1, .05 + i * .06, .5);
  expect(await p.locator('[data-zl] [data-zname]').count() === 15, 'tope de 15 zonas por recorte');
  expect(await p.isVisible('text=Llegaste a 15 zonas'), 'aviso de tope');
  await dlgBtn(p, 'Cancelar');
  await shot(p, '18-obra-recortada');

  /* ── 9. Persistencia y reinicio ── */
  await p.reload(); await p.waitForTimeout(500);
  expect(await st(p, () => L.plansOf('p4').length) === 3, 'persistencia tras recargar');
  expect(await p.locator('[data-plan]').count() === 3, 'los planos recortados siguen en pantalla');
  await p.click('[data-demo]'); await p.click(`${dlg} [data-reset]`); await p.waitForTimeout(100);
  await dlgBtn(p, 'Reiniciar'); await p.waitForLoadState('load'); await p.waitForTimeout(600);
  expect(await st(p, () => L.plansOf('p4').length === 0 && L.plansOf('p1').length === 5 && L.plan('pl-tsb').status === 'PENDING' && L.plan('pl-tstipo').multiplier === 4), 'reiniciar demo vuelve a la semilla');

  /* ── 10. Inicio reacciona en vivo a cambios de otra pantalla ── */
  const home = await open('d-inicio.html');
  await shot(home, '19-inicio');
  const obra = await open('d-obra.html?p=p1', { keepState: true });
  const kpi = () => home.textContent('.kpis .kpi:nth-child(2) strong');
  expect((await kpi()).trim() === '0', 'Inicio: 0 planos procesándose');
  await obra.click('[data-proc="pl-tsb"]'); await home.waitForTimeout(1200);
  expect((await kpi()).trim() === '1', 'Inicio se actualiza por el store (1 procesándose)');
  expect(await home.locator('.lane:has-text("En proceso") .tok').count() === 1, 'la obra pasa al carril «En proceso»');
  await shot(home, '20-inicio-en-vivo');
  await home.click('[data-mode="tabla"]'); expect(await home.isVisible('.pipe-tbl'), 'alternativa en tabla de la tubería'); await shot(home, '21-inicio-tabla', false);

  /* ── 11. Móvil ── */
  const m1 = await open('m-inicio.html'); expect(await m1.isVisible('text=Lo que te toca'), 'm-inicio'); await shot(m1, '22-m-inicio');
  const m2 = await open('m-obra.html?p=p1', { keepState: true }); expect(await m2.isVisible('text=Qué bloquea la cotización'), 'm-obra bloqueos');
  await shot(m2, '23-m-obra');
  const m3 = await open('m-avisos.html'); const unread0 = await st(m3, () => L.myNotifications().filter(n => !n.read).length);
  await m3.click('[data-read]'); expect(await st(m3, () => L.myNotifications().filter(n => !n.read).length) === unread0 - 1, 'marcar un aviso como leído');
  await shot(m3, '24-m-avisos');
  const m4 = await open('m-avisos.html?rol=prov'); expect((await m4.textContent('.ni strong')).includes('SC-0141'), 'avisos del distribuidor con ?rol=prov');
  await m4.click('[data-all]'); expect(await m4.isVisible('text=No tenés avisos sin leer') || await st(m4, () => L.myNotifications().every(n => n.read)), 'marcar todo leído');
  await shot(m4, '25-m-avisos-prov');
  const m5 = await open('m-obra.html?p=p4'); expect(await m5.isVisible('text=La obra no tiene planos'), 'm-obra vacía'); await shot(m5, '26-m-obra-vacia');

  /* ── 12. Anchos 1024 y 390 en escritorio ── */
  for (const [u, n] of [['d-inicio.html', 'inicio'], ['d-obras.html', 'obras'], ['d-obra.html?p=p1&v=guiado', 'obra-guiado'], ['d-obra.html?p=p1&v=experto', 'obra-experto']]) {
    const w = await open(u, { width: 1024 }); await shot(w, '30-1024-' + n);
    const ov = await w.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(ov <= 0, `sin desborde horizontal a 1024: ${n} (${ov})`);
  }
  const dlgShot = await open('d-obra.html?p=p1&dialogo=recortar'); await shot(dlgShot, '31-dialogo-recortar', false);
  const kb = await open('d-obras.html'); await kb.keyboard.press('Tab'); await kb.keyboard.press('Tab');
  expect(await kb.evaluate(() => document.activeElement && document.activeElement !== document.body), 'foco por teclado');
  log('listo');
});
