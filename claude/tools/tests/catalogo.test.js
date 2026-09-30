/* Catálogo y vinculación del distribuidor (cuenta `sur`). Uso: node tools/tests/catalogo.test.js */
const { run } = require('../pw');
const fs = require('fs'), path = require('path');

run('catalogo', async ({ open, shot, expect, download, log }) => {
  const st = p => p.evaluate(() => L.store.get());
  const item = (p, id) => p.evaluate(id => L.store.get().catalog.find(c => c.id === id), id);
  const toast = async (p, t) => { await p.waitForSelector(`#toasts >> text=${t}`, { timeout: 3000 }).catch(() => null); return p.isVisible(`#toasts >> text=${t}`); };

  /* ── 1. Pantalla principal ── */
  let p = await open('d-prov-catalogo.html');
  expect(await p.isVisible('.side'), 'shell del distribuidor');
  const n0 = await p.evaluate(() => L.store.get().catalog.filter(c => c.supplierId === 'sur').length);
  expect((await p.textContent('#k-items')).replace(/\D/g, '') === String(n0), 'KPI productos = catálogo de sur (' + n0 + ')');
  expect(await p.isVisible('text=sin componente base'), 'aviso de productos sin vincular');
  const others = await p.evaluate(() => [...document.querySelectorAll('#t tbody tr[data-id]')].map(r => r.dataset.id).filter(id => L.store.get().catalog.find(c => c.id === id).supplierId !== 'sur').length);
  expect(others === 0, 'la tabla solo muestra productos de sur');
  await shot(p, 'catalogo-1440');

  // búsqueda + filtros + orden
  await p.fill('#q', 'ACTI9 SUPERINM'); await p.waitForTimeout(100);
  expect(await p.locator('#t tbody tr[data-id]').count() === 1, 'búsqueda encuentra ci-p1');
  await p.fill('#q', ''); await p.selectOption('#fread', 'FAILED'); await p.waitForTimeout(100);
  expect(await p.locator('#t tbody tr[data-id="ci-p2"]').count() === 1 && await p.locator('#t tbody tr[data-id]').count() === 1, 'filtro de lectura FAILED → solo ci-p2');
  await p.selectOption('#fread', ''); await p.selectOption('#ffam', 'Protección'); await p.waitForTimeout(100);
  const famOk = await p.evaluate(() => [...document.querySelectorAll('#t tbody tr[data-id]')].every(r => { const c = L.store.get().catalog.find(x => x.id === r.dataset.id); return c.typeId && L.type(c.typeId).family === 'Protección'; }));
  expect(famOk, 'filtro de familia');
  await p.selectOption('#ffam', ''); await p.click('#chips [data-f="vencidos"]');
  expect(await p.locator('#t tbody tr[data-id]').count() === 0 || await p.isVisible('text=Ningún producto coincide'), 'filtro precio vencido (sur no tiene vencidos)');
  await p.click('#chips [data-f="todos"]');
  await p.click('th[data-sort="price"]'); await p.click('th[data-sort="price"]');
  const prices = await p.evaluate(() => [...document.querySelectorAll('#t tbody tr[data-id]')].map(r => L.store.get().catalog.find(c => c.id === r.dataset.id).price));
  expect(prices.length === 20 && prices.every((v, i) => i === 0 || prices[i - 1] >= v), 'orden por precio descendente, 20 por página');
  await p.click('#pager [data-pg="1"]'); expect(await p.isVisible('text=Página 2'), 'paginación');
  await p.keyboard.press('Tab');

  /* ── 2. Alta con validación ── */
  await p.click('#b-new'); await p.waitForSelector('dialog[open]'); await p.waitForTimeout(150);
  await p.fill('#f-code', 'sch-a9r-4p40-300'); await p.fill('#f-price', '12,5');
  await p.click('dialog >> text=Guardar producto');
  const errs = await p.$$eval('dialog .field-err', e => e.map(x => x.textContent));
  expect(errs.some(e => /Ya tenés un producto/.test(e)), 'código duplicado (sin distinguir mayúsculas)');
  expect(errs.some(e => /nombre/.test(e)), 'nombre obligatorio');
  expect(errs.some(e => /punto para los decimales/.test(e)), 'precio con coma rechazado');
  await p.fill('#f-price', '0'); await p.fill('#f-lead', '-1'); await p.click('dialog >> text=Guardar producto');
  expect(await p.isVisible('text=mayor que cero'), 'precio > 0');
  expect(await p.isVisible('text=Días enteros'), 'plazo ≥ 0');
  await shot(p, 'catalogo-alta-errores', false);
  await p.fill('#f-code', 'SCH-XB7-ROJ-220'); await p.fill('#f-name', 'PILOTO LED ROJO 220V 22MM HARMONY'); await p.fill('#f-price', '7650.50');
  await p.selectOption('#f-cur', 'ARS'); await p.fill('#f-valid', '2026-12-31'); await p.fill('#f-brand', 'Schneider'); await p.fill('#f-bcode', 'SCH'); await p.fill('#f-gama', 'Harmony XB7'); await p.fill('#f-lead', '3');
  await p.click('dialog >> text=Guardar producto');
  expect(await toast(p, 'Producto agregado'), 'toast Producto agregado');
  const created = await p.evaluate(() => L.store.get().catalog.find(c => c.code === 'SCH-XB7-ROJ-220'));
  expect(created && created.readingStatus === 'PENDING' && created.linkStatus === 'UNLINKED' && created.price === 7650.5 && created.brandCode === 'SCH', 'producto creado PENDING con datos');

  /* ── 3. Editar nombre de un AUTO → PENDING; precio → historial ── */
  const autoId = await p.evaluate(() => L.store.get().catalog.find(c => c.supplierId === 'sur' && c.linkStatus === 'AUTO' && c.typeId === 'itm').id);
  const before = await item(p, autoId);
  await p.evaluate(id => document.querySelector(`[data-edit="${id}"]`) || null, autoId);
  await p.goto(p.url().split('?')[0] + '?dialogo=editar&item=' + autoId); await p.waitForSelector('dialog[open]');
  await p.waitForFunction(n => { const f = document.querySelector('dialog[open] #f-name'); return f && f.value === n; }, before.name);
  await p.waitForTimeout(150);
  await p.fill('#f-name', before.name + ' NUEVO'); await p.fill('#f-price', String(before.price + 1000));
  await p.click('dialog >> text=Guardar cambios');
  expect(await toast(p, 'Producto guardado'), 'toast Producto guardado');
  const after = await item(p, autoId);
  if (after.readingStatus !== 'PENDING') log('autoId', autoId, JSON.stringify(after), await p.url(), await p.locator('dialog[open]').count());
  expect(after.readingStatus === 'PENDING' && after.linkStatus === 'UNLINKED' && after.typeId === null, 'nombre cambiado en AUTO → PENDING');
  expect(after.priceHistory.length === 1 && after.priceHistory[0].price === before.price, 'precio anterior en priceHistory');
  await p.goto(p.url().split('?')[0] + '?dialogo=editar&item=' + autoId); await p.waitForSelector('dialog[open]');
  expect(await p.isVisible('#ph-tbl'), 'historial de precios visible en el diálogo');
  await p.waitForTimeout(400);
  await shot(p, 'catalogo-editar-historial', false);
  await p.keyboard.press('Escape');

  /* ── 4. Despublicar → L.matches deja de devolverlo al ingeniero ── */
  const tgt = await p.evaluate(() => { const l = L.line('b8'); const m = L.matches(l, 'sur'); return m[0] && m[0].id; });
  expect(!!tgt, 'b8 tiene match en sur (' + tgt + ')');
  const tcode = (await item(p, tgt)).code;
  await p.fill('#q', tcode); await p.waitForTimeout(100);
  await p.click(`[data-pub="${tgt}"]`);
  expect(await toast(p, 'Producto despublicado'), 'toast Producto despublicado');
  await shot(p, 'catalogo-despublicado');
  await p.fill('#q', '');
  const eng = await open('d-kit.html', { keepState: true });
  const engMatch = await eng.evaluate(id => L.matches(L.line('b8'), 'sur').some(m => m.id === id), tgt);
  expect(!(await item(p, tgt)).published && !engMatch, 'despublicado: L.matches de b8 para sur ya no lo incluye (visto desde otra página)');
  await eng.close();
  await p.evaluate(id => { L.store.update(s => { s.catalog.find(c => c.id === id).published = true; }); }, tgt);

  /* ── 5. Eliminar con confirmación ── */
  const delId = created.id;
  await p.fill('#q', 'SCH-XB7-ROJ-220'); await p.waitForTimeout(100);
  await p.click(`[data-del="${delId}"]`); await p.waitForSelector('dialog[open]');
  await p.click('dialog footer button:has-text("Cancelar")'); await p.waitForTimeout(100); expect(!!(await item(p, delId)), 'cancelar no elimina');
  await p.click(`[data-del="${delId}"]`); await p.click('dialog footer button:has-text("Eliminar producto")');
  expect(!(await item(p, delId)), 'eliminar con confirmación');
  await p.fill('#q', '');

  /* ── 6. Importación: muestra en modo reemplazo ── */
  await p.click('#b-imp'); await p.waitForSelector('dialog[open]');
  await shot(p, 'catalogo-importar-1', false);
  await p.click('#imp-sample');
  expect(await p.isVisible('text=lista-sur-ejemplo.csv'), 'planilla de ejemplo cargada');
  await p.click('[data-next="2"]');
  const mapped = await p.$$eval('[data-map]', s => Object.fromEntries(s.map(x => [x.dataset.map, x.value])));
  expect(mapped.code === '0' && mapped.name === '1' && mapped.price === '5' && mapped.gama === '4', 'columnas detectadas por encabezado');
  expect(await p.isVisible('text=Aceptada con advertencias'), 'veredicto con advertencias');
  expect(await p.isVisible('text=Sin precio') && await p.isVisible('text=código repetido') && await p.isVisible('text=sin marca'), 'errores por fila: sin precio, duplicado, sin marca');
  await shot(p, 'catalogo-importar-2', false);
  await p.click('[data-next="3"]');
  const nNew = +(await p.textContent('[data-n="created"]')), nUpd = +(await p.textContent('[data-n="updated"]')), nUnp = +(await p.textContent('[data-n="unpub"]'));
  log('reemplazo: nuevos', nNew, 'actualizados', nUpd, 'se despublican', nUnp);
  expect(nNew === 3 && nUpd === 4 && nUnp > 20, 'resumen de reemplazo (3 nuevos, 4 actualizados, resto se despublica)');
  await shot(p, 'catalogo-importar-3-reemplazo', false);
  // marcar ci-p2 como MANUAL antes de confirmar → debe sobrevivir
  await p.evaluate(() => L.store.update(s => { const x = s.catalog.find(c => c.id === 'ci-p2'); x.typeId = 'itm'; x.attrs = { polos: '3P', in: 63, curva: 'C' }; x.linkStatus = 'MANUAL'; }));
  await p.click('#imp-confirm');
  expect(await toast(p, 'Catálogo actualizado'), 'toast Catálogo actualizado');
  let s = await st(p);
  const p2 = s.catalog.find(c => c.id === 'ci-p2');
  expect(p2.linkStatus === 'MANUAL' && p2.typeId === 'itm' && p2.name === 'TERMICA NXB 3X50 CURVA C 6KA' && p2.priceHistory.length === 1, 'vínculo MANUAL sobrevive con mismo código; nombre y precio actualizados');
  const p1 = s.catalog.find(c => c.id === 'ci-p1');
  expect(p1.readingStatus === 'PENDING', 'ci-p1 sigue por leer');
  const unp = s.catalog.filter(c => c.supplierId === 'sur' && !c.published).length;
  expect(unp === nUnp, 'reemplazo despublica lo que no vino (' + unp + ')');
  expect(s.ui.importHistory.length === 1 && s.ui.importHistory[0].mode === 'replace', 'historial de cargas guardado en s.ui.importHistory');
  expect(await p.isVisible('#hist >> text=lista-sur-ejemplo.csv'), 'historial visible');
  await shot(p, 'catalogo-tras-importar');

  /* ── 7. Importación de un CSV real (coma, BOM) en modo actualizar ── */
  const csv = '﻿codigo,descripcion,marca,gama,precio,moneda,plazo,vigencia\n' +
    'SCH-A9F-2P20-C,TERMICA 2X20 C 6KA ACTI9,Schneider,Acti9 iC60N,50100.00,ARS,2,2026-12-15\n' +
    'NEW-001,"BORNE 4MM2, GRIS",Schneider,Linergy,1500.5,ARS,1,\n' +
    'NEW-002,BORNE 10MM2,Schneider,Linergy,abc,ARS,1,\n' +
    'NEW-003,BORNE 35MM2,Schneider,Linergy,6100,EUR,1,\n';
  await p.click('#b-imp'); await p.waitForSelector('dialog[open]');
  await p.check('input[name="imp-mode"][value="update"]');
  await p.setInputFiles('#imp-file', { name: 'lista-real.csv', mimeType: 'text/csv', buffer: Buffer.from(csv, 'utf8') });
  await p.waitForSelector('text=lista-real.csv');
  expect(await p.isVisible('text=separador coma'), 'detecta separador coma');
  await p.selectOption('#imp-fmt', 'punto');
  await p.click('[data-next="2"]');
  expect(await p.isVisible('text=Precio ilegible') && await p.isVisible('text=Moneda «EUR» desconocida'), 'errores: precio inválido y moneda desconocida');
  await p.click('[data-next="3"]');
  const u = { n: +(await p.textContent('[data-n="created"]')), up: +(await p.textContent('[data-n="updated"]')), un: +(await p.textContent('[data-n="unpub"]')) };
  expect(u.n === 1 && u.up === 1 && u.un === 0, 'actualizar: 1 nuevo, 1 actualizado, nada se despublica');
  await shot(p, 'catalogo-importar-3-actualizar', false);
  const unpBefore = (await st(p)).catalog.filter(c => c.supplierId === 'sur' && !c.published).length;
  await p.click('#imp-confirm'); await toast(p, 'Catálogo actualizado');
  s = await st(p);
  const nb = s.catalog.find(c => c.code === 'NEW-001');
  expect(nb && nb.name === 'BORNE 4MM2, GRIS' && nb.price === 1500.5 && nb.readingStatus === 'PENDING', 'CSV con comillas y punto decimal importado');
  expect(s.catalog.filter(c => c.supplierId === 'sur' && !c.published).length === unpBefore, 'modo actualizar no despublica');

  /* ── 8. Mapeo recordado tras recargar (mismos encabezados, columnas cambiadas a mano) ── */
  await p.click('#b-imp'); await p.waitForSelector('dialog[open]');
  await p.setInputFiles('#imp-file', { name: 'lista-real.csv', mimeType: 'text/csv', buffer: Buffer.from(csv, 'utf8') });
  await p.waitForSelector('text=lista-real.csv'); await p.click('[data-next="2"]');
  await p.selectOption('[data-map="gama"]', '-1'); await p.click('[data-next="3"]'); await p.click('#imp-confirm'); await toast(p, 'Catálogo actualizado');
  await p.reload(); await p.waitForTimeout(300);
  await p.click('#b-imp'); await p.waitForSelector('dialog[open]');
  await p.setInputFiles('#imp-file', { name: 'lista-real.csv', mimeType: 'text/csv', buffer: Buffer.from(csv, 'utf8') });
  await p.waitForSelector('text=Usamos el mapeo que guardaste');
  expect(true, 'aviso de mapeo guardado');
  await p.click('[data-next="2"]');
  expect(await p.$eval('[data-map="gama"]', x => x.value) === '-1' && await p.$eval('#imp-fmt', x => x.value).catch(() => 'punto') !== null, 'mapeo recordado tras recarga (gama sin columna)');
  await p.keyboard.press('Escape');

  /* ── 9. Descargas ── */
  const tpl = await download(p, () => p.click('#b-tpl'));
  const tplOk = tpl.buf.slice(0, 2).toString() === 'PK' && tpl.text.includes('Código de producto') && tpl.text.includes('Vigencia');
  expect(tplOk, 'plantilla XLSX: zip con fila de encabezados (' + tpl.size + ' B)');
  const exp = await download(p, () => p.click('#b-exp'));
  expect(exp.buf.slice(0, 2).toString() === 'PK' && exp.text.includes('SCH-A9R-4P40-300') && exp.text.includes('NEW-001'), 'exportación XLSX contiene códigos conocidos');

  /* ── 11. Vinculación: lectura con IA ── */
  let v = await open('d-prov-vinculacion.html?v=bandeja', { keepState: true });
  await shot(v, 'vinculacion-bandeja-antes');
  const pend = await v.evaluate(() => L.store.get().catalog.filter(c => c.supplierId === 'sur' && c.readingStatus === 'PENDING' && c.linkStatus !== 'MANUAL').length);
  expect(await v.isVisible(pend === 1 ? 'text=Leer 1 pendiente' : `text=Leer ${pend} pendientes`), 'botón Leer ' + pend + ' pendientes');
  const spent0 = await v.evaluate(() => L.aiSpent());
  await v.click('#run-go');
  await v.waitForSelector('#prog'); await v.waitForTimeout(700);
  await shot(v, 'vinculacion-leyendo', false);
  expect(await v.isVisible('text=Tiempo restante') && await v.isVisible('text=Transcurrido'), 'progreso con transcurrido y restante');
  await v.click('#run-cancel');
  await toast(v, 'Lectura cancelada');
  const leftAfterCancel = await v.evaluate(() => L.store.get().catalog.filter(c => c.supplierId === 'sur' && c.readingStatus === 'PENDING').length);
  expect(leftAfterCancel > 0 && leftAfterCancel < pend, 'cancelar deja el resto por leer (' + leftAfterCancel + ')');
  await v.click('#run-go');
  await v.waitForSelector('text=Lectura terminada', { timeout: 20000 });
  s = await st(v);
  const r1 = s.catalog.find(c => c.id === 'ci-p1'); const r3 = s.catalog.find(c => c.id === 'ci-p3');
  expect(r1.linkStatus === 'AUTO' && r1.typeId === 'dif' && r1.attrs.polos === '4P' && r1.attrs.in === 40 && r1.attrs.sens === 300, 'ci-p1 → AUTO dif 4P 40 A 300 mA');
  expect(r3.readingStatus === 'FAILED' && /Ámbar/.test(r3.readingNote), 'ci-p3 → FAILED: Ámbar fuera de la lista de colores');
  const edited = s.catalog.find(c => c.id === autoId);
  expect(edited.linkStatus === 'AUTO' && edited.typeId === 'itm', 'producto renombrado vuelve a quedar AUTO');
  const spent = await v.evaluate(() => L.aiSpent()); const cost = +(spent - spent0).toFixed(5);
  expect(Math.abs(cost - pend * 0.00146) < 1e-6, 'costo registrado = ' + pend + ' × USD 0,00146 (' + cost + ')');
  await shot(v, 'vinculacion-bandeja-despues');

  /* ── 12. ci-p2 FAILED con motivo; vínculo manual desde la bandeja ── */
  await v.evaluate(() => L.store.update(s => { const x = s.catalog.find(c => c.id === 'ci-p2'); Object.assign(x, { typeId: null, attrs: {}, linkStatus: 'UNLINKED', readingStatus: 'FAILED', readingNote: 'La lectura no reconoció el valor 50 A: no está en la lista de corrientes del componente base.' }); }));
  await v.goto(v.url().split('?')[0] + '?v=bandeja&item=ci-p2'); await v.waitForTimeout(300);
  expect(await v.isVisible('#reason >> text=50 A'), 'ci-p2 muestra el motivo del FAILED');
  expect(await v.$eval('#ed-type', x => x.value) === 'itm', 'la lectura propone Térmica');
  await v.click('#ed-link');
  expect(await v.isVisible('text=Elegí corriente nominal'), 'vincular sin atributo esencial se rechaza');
  await v.check('#editor input[name="a-in"][value="63"]');
  expect(await v.isVisible('text=Si lo vinculás así'), 'vista previa de impacto');
  await shot(v, 'vinculacion-editor-ci-p2');
  await v.click('#ed-link');
  const m2 = await item(v, 'ci-p2');
  expect(m2.linkStatus === 'MANUAL' && m2.attrs.in === 63 && m2.attrs.polos === '3P' && m2.attrs.curva === 'C', 'ci-p2 vinculado MANUAL 3P 63 A C');
  // impacto real: línea de ingeniería que pide exactamente eso
  const imp = await v.evaluate(() => { const l = { typeId: 'dif', attrs: { polos: '4P', in: 40, sens: 300 }, brand: 'ANY' }; return L.matches(l, 'sur').some(m => m.id === 'ci-p1'); });
  expect(imp, 'ci-p1 AUTO ahora matchea una línea dif 4P 40 300 de ingeniería');
  await v.goto(v.url().split('?')[0] + '?v=bandeja&tab=vinculados&item=ci-p1'); await v.waitForTimeout(300);
  expect(await v.isVisible('#impact-now'), 'mensaje de impacto «Esta fila ahora aparece…»');
  await v.click('#ed-unlink'); expect((await item(v, 'ci-p1')).linkStatus === 'UNLINKED', 'desvincular');

  /* ── 13. Variante tarjetas con teclado ── */
  await v.goto(v.url().split('?')[0] + '?v=tarjetas'); await v.waitForTimeout(300);
  await shot(v, 'vinculacion-tarjetas');
  const cur = await v.$eval('#editor', e => e.dataset.item);
  await v.keyboard.press('j'); await v.waitForTimeout(100);
  const nxt = await v.$eval('#editor', e => e.dataset.item);
  expect(cur !== nxt, 'J pasa a la siguiente tarjeta');
  await v.selectOption('#ed-type', 'piloto');
  await v.check('#editor input[name="a-color"][value="Amarillo"]'); await v.check('#editor input[name="a-tension"][value="24 V"]');
  await v.keyboard.press('Enter');
  expect((await item(v, nxt)).linkStatus === 'MANUAL', 'Enter vincula en tarjetas');

  /* ── 14. Rechazo por presupuesto → camino manual ── */
  const lim = await open('d-prov-vinculacion.html?estado=limite', { keepState: true });
  await lim.evaluate(() => L.store.update(s => { s.catalog.find(c => c.id === 'ci-p1').readingStatus = 'PENDING'; }));
  await lim.waitForTimeout(200);
  expect(await lim.isVisible('#refuse') && await lim.isDisabled('#run-go'), 'límite: se rechaza y queda el camino manual');
  await shot(lim, 'vinculacion-limite');
  await lim.close();
  const full = await open('d-prov-vinculacion.html');
  await full.evaluate(() => L.store.update(s => { s.ai.ledger.unshift({ at: L.now(), kind: 'Detección', usd: 39.999 }); s.catalog.find(c => c.id === 'ci-p1').readingStatus = 'PENDING'; }));
  await full.waitForTimeout(200);
  expect(await full.isVisible('#refuse'), 'L.aiCan false → rechazo real por presupuesto');
  await full.close();
  for (const [q, name] of [['estado=leyendo', 'vinculacion-leyendo-url'], ['estado=vacio', 'vinculacion-vacio'], ['v=tarjetas&item=ci-p3', 'vinculacion-tarjetas-url']]) {
    const x = await open('d-prov-vinculacion.html?' + q); await shot(x, name, false); await x.close();
  }
  const v1024 = await open('d-prov-vinculacion.html?item=ci-p2', { width: 1024 }); await shot(v1024, 'vinculacion-1024'); await v1024.close();

  /* ── 10. Estados por URL ── */
  for (const [q, name] of [['estado=vacio', 'catalogo-vacio'], ['estado=cargando', 'catalogo-cargando'], ['estado=error', 'catalogo-error'], ['dialogo=nuevo', 'catalogo-dialogo-nuevo'], ['dialogo=importar&paso=2&muestra=1', 'catalogo-importar-url']]) {
    const x = await open('d-prov-catalogo.html?' + q); await shot(x, name, false); await x.close();
  }
  const x1024 = await open('d-prov-catalogo.html', { width: 1024 }); await shot(x1024, 'catalogo-1024'); await x1024.close();
  const e0 = await open('d-prov-catalogo.html?estado=vacio'); expect(await e0.isVisible('text=Tu catálogo está vacío'), 'estado vacío invita a importar'); await e0.close();
  const er = await open('d-prov-catalogo.html?estado=error'); await er.click('[data-retry]'); expect(await er.locator('#t tbody tr[data-id]').count() > 0, 'error → reintentar recupera'); await er.close();

  /* ── 15. Persistencia y reinicio ── */
  await p.reload(); await p.waitForTimeout(300);
  expect((await st(p)).ui.importHistory.length === 3, 'historial persiste tras recarga');
  await p.click('[data-demo]'); await p.click('[data-reset]'); await p.click('dialog footer button:has-text("Reiniciar")');
  await p.waitForLoadState('load'); await p.waitForTimeout(400);
  s = await st(p);
  expect(!s.ui.importHistory && s.catalog.find(c => c.id === 'ci-p1').readingStatus === 'PENDING' && !s.catalog.find(c => c.code === 'NEW-001'), 'reiniciar vuelve a la semilla');
  expect(await p.evaluate(() => L.pref('catalogo:mapeo')) === null, 'reiniciar borra el mapeo guardado');
});
