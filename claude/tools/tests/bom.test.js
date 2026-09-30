const { run } = require('../pw');
const zlibFree = buf => buf.toString('utf8'); // L.zip guarda sin compresión: el XML se lee directo

run('bom', async ({ open, shot, expect, download, log }) => {
  /* 1 · Grilla por componente: bloqueos y marca de b9/b12 */
  const p = await open('d-bom.html?p=p1&v=componente');
  expect(await p.isVisible('#bm-grid'), 'grilla visible');
  expect(await p.locator('#blockers li[data-code="LINEAS"]').count() === 1, 'bloqueo de líneas sin marca presente');
  expect(await p.isDisabled('#blockers button:has-text("Pedir cotización")'), 'Pedir cotización deshabilitado con bloqueos');
  await shot(p, 'a-componente-1440');
  await p.selectOption('select[data-k="b9:brand"]', 'Schneider');
  await p.selectOption('select[data-k="b12:brand"]', 'ANY');
  await p.waitForTimeout(150);
  expect(await p.locator('#blockers li[data-code="LINEAS"]').count() === 0, 'b9/b12 con marca → bloqueo de líneas desaparece');
  const st = await p.evaluate(() => [L.line('b9').brand, L.line('b12').brand]);
  expect(st[0] === 'Schneider' && st[1] === 'ANY', 'marcas guardadas en el store ' + st);

  /* 2 · b7 sensibilidad → aparecen coincidencias */
  const before = await p.evaluate(() => L.matches(L.line('b7')).length);
  expect(before === 0 && /Sin coincidencias/.test(await p.textContent('tr[data-row="b7"] td[data-c="cot"]')), 'b7 sin coincidencias al inicio');
  await p.selectOption('select[data-k="b7:a:sens"]', '300');
  await p.waitForTimeout(150);
  const after = await p.evaluate(() => L.matches(L.line('b7')).length);
  expect(after > 0 && /en catálogo/.test(await p.textContent('tr[data-row="b7"] td[data-c="cot"]')), 'b7 con 300 mA → ' + after + ' coincidencias');

  /* 3 · Selección múltiple y marca en bloque */
  await p.check('input[data-k="b10:sel"]'); await p.check('input[data-k="b11:sel"]'); await p.check('input[data-k="b14:sel"]');
  expect(await p.isVisible('text=3 líneas seleccionadas'), 'barra de selección con 3');
  await p.selectOption('#bm-qa-sel', 'Chint'); await p.click('button[data-act="bulk"]'); await p.waitForTimeout(150);
  const bulk = await p.evaluate(() => ['b10', 'b11', 'b14'].map(id => L.line(id).brand));
  expect(bulk.every(b => b === 'Chint'), 'marca en bloque aplicada ' + bulk);

  /* 4 · Marca excluida: avisa, no bloquea */
  await p.click('button[data-act="rules"]');
  await p.selectOption('#r-addb', 'Chint'); await p.click('dialog [data-r="addb"]'); await p.click('dialog button:has-text("Guardar marcas")');
  await p.waitForTimeout(150);
  expect(await p.evaluate(() => L.project('p1').brandRules.blocked.includes('Chint')), 'Chint excluida en project.brandRules');
  expect(await p.isVisible('.bm-rules >> text=usan una marca excluida'), 'aviso de líneas con marca excluida');
  expect(await p.evaluate(() => L.line('b10').brand === 'Chint'), 'excluir no cambia lo ya guardado');

  /* 5 · Teclado: flechas entre celdas */
  await p.focus('tr[data-row="b1"] td[data-c="mat"]'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowDown');
  const foc = await p.evaluate(() => { const td = document.activeElement; return td.dataset.c + '@' + td.parentElement.dataset.row; });
  expect(foc === 'spec@b2', 'flechas mueven el foco de celda (' + foc + ')');
  await p.keyboard.press('Enter');
  expect(await p.evaluate(() => document.activeElement.tagName === 'SELECT'), 'Enter entra al control de la celda');

  /* 6 · Línea manual: validación y alta */
  await p.click('#act button[data-act="add"]');
  await p.click('dialog button:has-text("Agregar línea")');
  expect(await p.isVisible('dialog .field-err'), 'validación: falta componente base');
  await p.selectOption('#n-type', 'borne'); await p.selectOption('#n-a-seccion', '10');
  await p.selectOption('#n-brand', 'ANY'); await p.fill('#n-qty', '12');
  await p.click('dialog button:has-text("Agregar línea")'); await p.waitForTimeout(200);
  const man = await p.evaluate(() => L.linesOf('p1').filter(l => l.src === 'MANUAL' && l.typeId === 'borne'));
  expect(man.length === 1 && L_qty(man[0]) === 12, 'línea manual creada con 12 u.');
  function L_qty(l) { return Object.values(l.perPlan).reduce((a, b) => a + b, 0) + (l.extraQty || 0); }

  /* 7 · Comentario y alternativa en la línea b5 */
  await p.goto(p.url().split('?')[0] + '?p=p1&v=componente&linea=b5'); await p.waitForTimeout(300);
  expect(await p.isVisible('#det-b5'), '?linea=b5 abre el detalle');
  await p.fill('textarea[data-k="b5:cmt"]', 'Confirmar curva con el cliente'); await p.click('button[data-act="cmt"][data-id="b5"]'); await p.waitForTimeout(150);
  expect(await p.evaluate(() => L.commentsOf('line:b5').length === 1), 'comentario guardado en line:b5');
  await p.click('button[data-act="alt-save"][data-id="b5"]');
  expect(await p.isVisible('#det-b5 .field-err'), 'alternativa sin marca → error');
  await p.selectOption('select[data-k="b5:alt-brand"]', 'ABB'); await p.fill('input[data-k="b5:alt-note"]', 'Misma curva');
  await p.click('button[data-act="alt-save"][data-id="b5"]'); await p.waitForTimeout(150);
  const alt = await p.evaluate(() => L.line('b5').alt);
  expect(alt && alt.brand === 'ABB' && alt.typeId === 'itm' && alt.note === 'Misma curva', 'alternativa guardada en la línea');
  expect(await p.isVisible('tr[data-row="b5"] .bm-alt'), 'etiqueta alt en la fila');
  const dshot = await open('d-bom.html?p=p1&linea=b10&full=1', { keepState: true });
  expect(await dshot.isVisible('#det-b10 >> text=×4'), 'detalle de b10 con repeticiones ×4');
  await shot(dshot, 'a-detalle-linea'); await dshot.close();

  /* 8 · Persistencia tras recarga */
  await p.reload(); await p.waitForTimeout(300);
  expect(await p.evaluate(() => L.line('b9').brand === 'Schneider' && !!L.line('b5').alt), 'persiste tras recargar');

  /* 9 · Exportaciones */
  const x = await download(p, () => p.click('#act button[data-act="xlsx"]'));
  const xt = zlibFree(x.buf);
  expect(x.buf.slice(0, 2).toString() === 'PK', 'xlsx es zip (' + x.name + ', ' + x.size + ' B)');
  expect(xt.includes('name="BOM consolidado"') && xt.includes('name="Por tablero"'), 'xlsx con hojas BOM consolidado y Por tablero');
  expect(['Material', 'Componente base', 'Atributos', 'Marca', 'Cantidad dibujada', 'Repeticiones', 'Cantidad a comprar', 'Origen'].every(h => xt.includes('>' + h + '<')), 'xlsx con las 8 columnas');
  expect(xt.includes('Diferencial 4P · 63 A · 300 mA') && xt.includes('TS-P tipo'), 'xlsx con contenido real (b7 corregida, tablero)');
  // Parseo real con python zipfile: fila de Térmica 1P+N 10 A con cantidad a comprar 36
  const fs = require('fs'), path = require('path'), os = require('os'), { execFileSync } = require('child_process');
  const tmp = path.join(os.tmpdir(), 'bom-test-' + Date.now() + '.xlsx'); fs.writeFileSync(tmp, x.buf);
  const py = `import zipfile,re,json,sys
z=zipfile.ZipFile(sys.argv[1]); out={}
for n in ['xl/worksheets/sheet1.xml','xl/worksheets/sheet2.xml']:
  rows=[]
  for r in re.findall(r'<row[^>]*>(.*?)</row>', z.read(n).decode('utf8')):
    rows.append([ (m[1] if m[1] else m[0]) for m in re.findall(r'<c [^>]*?(?:><v>([^<]*)</v>|><is><t[^>]*>([^<]*)</t></is>)</c>', r)])
  out[n]=rows
print(json.dumps(out))`;
  const parsed = JSON.parse(execFileSync('python3', ['-c', py, tmp]).toString()); fs.unlinkSync(tmp);
  const s1 = parsed['xl/worksheets/sheet1.xml'], s2 = parsed['xl/worksheets/sheet2.xml'];
  const t10 = s1.find(r => r[0] === 'Térmica 1P+N · 10 A · curva C');
  expect(t10 && t10[4] === '18' && t10[6] === '36' && t10[7] === 'detectado', 'python zipfile: Térmica 1P+N 10 A → dibujada 18, a comprar 36 (' + (t10 && t10.join(' | ')) + ')');
  const t10b = s2.find(r => r[0] === 'TS-P tipo' && r[1] === 'Térmica 1P+N · 10 A · curva C');
  expect(t10b && t10b[5] === '6' && t10b[6] === '4' && t10b[7] === '24', 'hoja Por tablero: TS-P tipo 6 × 4 = 24');
  const c = await download(p, () => p.click('#act button[data-act="csv"]'));
  const lines = c.text.replace(/^﻿/, '').split('\r\n');
  expect(lines[0].startsWith('Material;Componente base;Atributos;Marca') && lines.length === 20, 'csv con encabezado y 19 líneas (' + (lines.length - 1) + ')');

  /* 9b · Eliminar con confirmación (cancelar no borra) */
  await p.click('button[data-act="toggle"][data-id="b15"]'); await p.waitForTimeout(100);
  await p.click('button[data-act="del"][data-id="b15"]'); await p.click('dialog button:has-text("Cancelar")'); await p.waitForTimeout(100);
  expect(await p.evaluate(() => !L.line('b15').deleted), 'cancelar no elimina');
  await p.click('button[data-act="del"][data-id="b15"]'); await p.click('dialog button:has-text("Eliminar línea")'); await p.waitForTimeout(150);
  expect(await p.evaluate(() => L.line('b15').deleted === true && !L.linesOf('p1').some(l => l.id === 'b15')), 'eliminar: deleted true');
  expect(await p.locator('tr[data-row="b15"]').count() === 0, 'la fila desaparece');

  /* 9c · Cambio visible en otra pantalla (mismo navegador) */
  const kit = await open('d-kit.html', { keepState: true });
  const other = await kit.evaluate(() => ({ b9: L.lineIssues(L.line('b9')).some(i => i.blocks), b7: L.lineIssues(L.line('b7')).length, alt: L.line('b5').alt && L.line('b5').alt.brand, del: L.line('b15').deleted }));
  expect(!other.b9 && other.b7 === 0 && other.alt === 'ABB' && other.del, 'd-kit.html ve los cambios del BOM ' + JSON.stringify(other));
  await kit.close();

  /* 10 · Resolver símbolos → Pedir cotización habilitado */
  await p.evaluate(() => L.unidentifiedOf('p1').forEach(u => L.resolveSymbol(u.id, { discard: true })));
  await p.waitForTimeout(150);
  const href = await p.getAttribute('#blockers a:has-text("Pedir cotización")', 'href');
  expect(href && href.startsWith('d-cotizacion.html') && href.includes('p=p1'), 'sin bloqueos: Pedir cotización → ' + href);
  await shot(p, 'a-listo-para-cotizar');

  /* 10b · Aplicar mis preferidas (contexto limpio) */
  const pf = await open('d-bom.html?p=p1&v=componente');
  await pf.click('button[data-act="prefs"]'); await pf.waitForTimeout(150);
  expect(await pf.evaluate(() => L.line('b9').brand === 'Schneider' && L.line('b12').brand === 'Schneider'), 'Aplicar mis preferidas completa b9 y b12 con Schneider');
  expect(await pf.isVisible('text=Preferidas aplicadas a 2 líneas'), 'aviso repite la acción');
  await pf.close();

  /* 11 · Por tablero: asignación rápida */
  const t = await open('d-bom.html?p=p1&v=tablero');
  expect(await t.locator('.bm-board').count() >= 5, 'un bloque por tablero');
  expect(await t.isVisible('#board-pl-tstipo >> text=×4 repeticiones'), 'TS-P tipo ×4');
  await t.selectOption('#qa-pl-tstipo', 'Schneider'); await t.click('button[data-act="qa"][data-plan="pl-tstipo"]'); await t.waitForTimeout(150);
  const qa = await t.evaluate(() => [L.line('b9').brand, L.line('b12').brand]);
  expect(qa[0] === 'Schneider' && qa[1] === 'Schneider', 'asignación rápida en TS-P tipo ' + qa);
  expect(await t.getAttribute('#board-pl-tgbt a:has-text("Ver plano")', 'href') === 'd-plano.html?p=p1&plan=pl-tgbt', 'link a d-plano con plan');
  expect((await t.getAttribute('#board-pl-tgbt a:has-text("Ver en 3D")', 'href')).startsWith('d-tablero-3d.html?p=p1&plan=pl-tgbt'), 'link a 3D con plan');
  await t.evaluate(() => scrollTo(0, 0)); await t.waitForTimeout(100);
  await shot(t, 'b-tablero-1440');

  /* 12 · Revisión asistida: costo, fuentes, aplicar/descartar */
  const a = await open('d-bom.html?p=p1&v=asistida');
  const led0 = await a.evaluate(() => L.store.get().ai.ledger.length);
  await shot(a, 'c-asistida-antes');
  await a.click('button[data-act="run"]'); await a.waitForTimeout(200);
  const led = await a.evaluate(() => L.store.get().ai.ledger[0]);
  expect(await a.evaluate(() => L.store.get().ai.ledger.length) === led0 + 1 && led.usd === 0.02 && led.kind === 'Asistente', 'corrida registrada en ai.ledger (USD 0,02)');
  expect(await a.isVisible('[data-prop="attr:b7:sens"] >> text=300 mA'), 'propone 300 mA para b7');
  expect(await a.isVisible('[data-prop="attr:b7:sens"] >> text=Comentario de Daniel Ortega'), 'muestra la fuente (comentario)');
  await shot(a, 'c-asistida-propuestas');
  await a.click('[data-prop="attr:b7:sens"] button[data-act="apply"]'); await a.waitForTimeout(150);
  const b7 = await a.evaluate(() => L.line('b7'));
  expect(b7.attrs.sens === 300 && b7.src === 'MANUAL', 'aplicar: b7 sens 300, src MANUAL');
  await a.click('[data-prop="brand:b9"] button[data-act="apply"]'); await a.waitForTimeout(150);
  expect(await a.evaluate(() => L.line('b9').brand === 'Schneider' && L.line('b9').src === 'MANUAL'), 'aplicar marca preferida en b9');
  await a.click('[data-prop="rule:b16"] button[data-act="dismiss"]'); await a.waitForTimeout(150);
  expect(await a.locator('[data-prop="rule:b16"]').count() === 0 && await a.evaluate(() => L.line('b16').src === 'RULE'), 'descartar no cambia la línea');

  /* 13 · Límite de IA: rechazo sin gasto y camino manual */
  const lim = await open('d-bom.html?p=p1&v=asistida');
  await lim.evaluate(() => L.store.update(s => { s.ai.ledger.unshift({ at: '2026-09-30T08:00:00', kind: 'Detección', projectId: 'p2', ref: 'test', usd: 39.99 }); }));
  await lim.reload(); await lim.waitForTimeout(300);
  const n0 = await lim.evaluate(() => L.store.get().ai.ledger.length);
  expect(await lim.isVisible('text=La revisión asistida no corrió'), 'límite: aviso de rechazo');
  expect(await lim.locator('button[data-act="run"]').count() === 0, 'límite: sin botón de correr');
  expect(await lim.isVisible('text=Revisión manual') && await lim.locator('.list-i').count() > 0, 'límite: lista manual');
  expect(await lim.evaluate(() => L.store.get().ai.ledger.length) === n0, 'límite: no se gastó');
  await shot(lim, 'c-asistida-limite');

  /* 14 · Estados por URL */
  const e = await open('d-bom.html?p=p1&estado=error');
  expect(await e.isVisible('text=No pudimos guardar'), 'error: mensaje');
  expect(await e.isVisible('text=El BOM queda como estaba'), 'error: estado previo intacto');
  expect(await e.evaluate(() => L.line('b9').brand === null), 'error: no se guardó');
  await shot(e, 'estado-error');
  await e.click('button[data-act="retry"]'); await e.waitForTimeout(150);
  expect(await e.evaluate(() => L.line('b9').brand !== null) && !(await e.isVisible('text=No pudimos guardar')), 'reintentar guarda y limpia el error');

  const k = await open('d-bom.html?p=p1&estado=conflicto');
  expect(await k.isVisible('text=Alguien más editó este BOM'), 'conflicto: aviso');
  await k.selectOption('select[data-k="b9:brand"]', 'Schneider'); await k.waitForTimeout(150);
  expect(await k.isVisible('dialog >> text=Recargar el BOM') && await k.evaluate(() => L.line('b9').brand === null), 'conflicto: cambio rechazado, pide recargar');
  await shot(k, 'estado-conflicto', false);

  const v = await open('d-bom.html?p=p4');
  expect(await v.isVisible('text=Todavía no hay BOM en esta obra'), 'vacío real (p4)');
  expect(await v.isDisabled('#blockers button:has-text("Pedir cotización")'), 'vacío: sin cotizar');
  await shot(v, 'estado-vacio-p4');
  const v2 = await open('d-bom.html?p=p1&estado=vacio');
  expect(await v2.isVisible('text=Todavía no hay BOM en esta obra'), '?estado=vacio');

  /* 15 · 1024 px y reducción de movimiento */
  for (const [vid, name] of [['componente', 'a'], ['tablero', 'b'], ['asistida', 'c']]) {
    const s = await open('d-bom.html?p=p1&v=' + vid, { width: 1024, height: 900 });
    const ov = await s.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(ov <= 0, name + ' sin scroll horizontal de página a 1024 (' + ov + ')');
    await shot(s, name + '-' + vid + '-1024');
  }
  log('listo');
});
