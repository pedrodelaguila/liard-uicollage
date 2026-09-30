const { run } = require('../pw');
run('revision', async ({ open, shot, expect, log }) => {
  const st = p => p.evaluate(() => JSON.parse(JSON.stringify(L.store.get())));
  const un = (s, id) => s.unidentified.find(u => u.id === id);
  const line = (s, id) => s.bomLines.find(l => l.id === id);
  const dlgBtn = (p, t) => p.locator('dialog[open] footer button', { hasText: t });

  // ── Plano por defecto: primer plano de la obra con símbolos pendientes
  let p = await open('d-plano.html?p=p1');
  expect(await p.inputValue('#pv-plan') === 'pl-tstipo', 'por defecto abre el primer plano con pendientes (TS-P tipo)');
  expect(await p.isVisible('text=Vista esquemática generada desde las detecciones (simulada)'), 'rótulo de vista simulada');
  const nsym = await p.locator('#pv-svg [data-sym]').count();
  const s0 = await st(p);
  const drawn = s0.bomLines.filter(l => l.projectId === 'p1' && !l.deleted).reduce((a, l) => a + (l.perPlan['pl-tstipo'] || 0), 0);
  expect(nsym === drawn + 1, `un glifo por símbolo dibujado + 1 sin identificar (${nsym} = ${drawn}+1)`);
  const lbl = await p.getAttribute('#pv-svg [data-sym="u:u3"]', 'aria-label');
  expect(/sin identificar/i.test(lbl) && (await p.getAttribute('#pv-svg [data-sym="u:u3"]', 'tabindex')) === '0', 'símbolo sin identificar enfocable con aria-label');

  // ── Resolver u1 a línea existente (b12, sugerencia exacta): +1 en TDE
  p = await open('d-plano.html?p=p1&plan=pl-tde');
  await shot(p, 'experto-1440', false);
  const before = line(await st(p), 'b12').perPlan['pl-tde'] || 0;
  await p.click('[data-resolve="u1"][data-fk="res:u1"]');
  expect(await p.isChecked('input[name=pv-line][value=b12]'), 'la línea que coincide con la sugerencia viene elegida');
  await shot(p, 'resolver-dialogo-1440', false);
  await dlgBtn(p, 'Asignar símbolo').click(); await p.waitForTimeout(200);
  let s = await st(p);
  expect(un(s, 'u1').status === 'RESUELTO' && un(s, 'u1').lineId === 'b12', 'u1 resuelto a b12');
  expect((line(s, 'b12').perPlan['pl-tde'] || 0) === before + 1, 'b12 suma 1 en TDE (' + before + ' → ' + line(s, 'b12').perPlan['pl-tde'] + ')');
  expect(await p.locator('#pv-svg [data-sym="r:u1"]').count() === 1, 'u1 queda en el plano como asignado a mano');

  // ── Crear línea nueva desde u2 con validación
  await p.click('[data-fk="res:u2"]');
  await p.click('dialog[open] [data-m="new"]');
  await dlgBtn(p, 'Asignar símbolo').click();
  expect(await p.isVisible('dialog[open] .field-err:has-text("componente base")'), 'valida componente base obligatorio');
  await p.selectOption('#pv-type', 'cont');
  await dlgBtn(p, 'Asignar símbolo').click();
  expect(await p.locator('dialog[open] .field-err').count() === 3, 'valida los 3 atributos esenciales del contactor');
  await shot(p, 'crear-linea-validacion-1440', false);
  await p.selectOption('#pv-a-polos', { label: '3P' }); await p.selectOption('#pv-a-in', { label: '9 A' }); await p.selectOption('#pv-a-bobina', { label: '24 Vca' });
  await dlgBtn(p, 'Asignar símbolo').click(); await p.waitForTimeout(200);
  s = await st(p);
  const nl = line(s, un(s, 'u2').lineId);
  expect(nl && nl.typeId === 'cont' && nl.attrs.in === 9 && nl.src === 'MANUAL' && nl.brand === null && nl.perPlan['pl-tde'] === 1, 'u2 crea línea manual Contactor 3P 9 A 24 Vca sin marca, 1 en TDE');
  expect(await p.isVisible('text=No quedan símbolos sin identificar en TDE'), 'TDE sin pendientes');
  expect(/1 símbolo sin identificar/.test(await p.textContent('#pv-blk-sym')), 'bloqueos en vivo: queda 1 (u3)');

  // ── Persistencia tras recargar
  p = await open('d-plano.html?p=p1&plan=pl-tde', { keepState: true });
  s = await st(p);
  expect(un(s, 'u1').status === 'RESUELTO' && un(s, 'u2').status === 'RESUELTO', 'resoluciones persisten tras recargar');
  expect(await p.locator('#pv-svg [data-sym="r:u2"]').count() === 1, 'símbolo asignado sigue dibujado tras recargar');

  // ── Descartar u3 (individual) → bloqueos de símbolos a 0
  p = await open('d-plano.html?p=p1&plan=pl-tstipo', { keepState: true });
  await p.click('[data-fk="dis:u3"]'); await p.waitForTimeout(200);
  s = await st(p);
  expect(un(s, 'u3').status === 'DESCARTADO', 'u3 descartado');
  expect(/^0 símbolos sin identificar/.test((await p.textContent('#pv-blk-sym')).trim()), 'bloqueos: 0 símbolos sin identificar');
  expect(await p.evaluate(() => !L.blockers('p1').some(b => b.code === 'SIMBOLOS')), 'L.blockers sin SIMBOLOS');

  // ── Marcar revisado + persistencia
  await p.click('#pv-rev'); await p.waitForTimeout(150);
  expect((await st(p)).plans.find(x => x.id === 'pl-tstipo').reviewed === true, 'TS-P tipo marcado como revisado');
  p = await open('d-plano.html?p=p1&plan=pl-tstipo', { keepState: true });
  expect(await p.isVisible('.pv-meta :text("Revisado")') && await p.isVisible('#pv-rev:has-text("Reabrir revisión")'), 'revisado persiste tras recargar');

  // ── Revisado con pendientes pide confirmación
  p = await open('d-plano.html?p=p1&plan=pl-tde');
  await p.click('#pv-rev');
  expect(await p.isVisible('dialog[open] :text("Quedan 2 símbolos sin identificar")'), 'marcar revisado con pendientes advierte');
  await dlgBtn(p, 'Marcar como revisado').click(); await p.waitForTimeout(150);
  expect((await st(p)).plans.find(x => x.id === 'pl-tde').reviewed === true, 'confirmado: TDE revisado');

  // ── Lote: elegir los dos de TDE y descartar con confirmación
  p = await open('d-plano.html?p=p1&plan=pl-tde');
  await p.check('#pv-chk-all');
  expect(await p.isVisible('#pv-bulk-dis:has-text("Descartar 2")'), 'barra de lote con 2 elegidos');
  await shot(p, 'lote-1440', false);
  await p.click('#pv-bulk-dis');
  await dlgBtn(p, 'Cancelar').click(); await p.waitForTimeout(100);
  expect(un(await st(p), 'u1').status === 'PENDIENTE', 'cancelar no descarta');
  await p.click('#pv-bulk-dis'); await dlgBtn(p, 'Descartar 2 símbolos').click(); await p.waitForTimeout(200);
  s = await st(p);
  expect(un(s, 'u1').status === 'DESCARTADO' && un(s, 'u2').status === 'DESCARTADO', 'descarte en lote de u1 y u2');

  // ── Lote: asignar dos a una misma línea
  p = await open('d-plano.html?p=p1&plan=pl-tde');
  const b10 = line(await st(p), 'b10').perPlan['pl-tde'];
  await p.check('[data-chk="u1"]'); await p.check('[data-chk="u2"]');
  await p.click('#pv-bulk-res'); await p.check('input[name=pv-line][value=b10]');
  await dlgBtn(p, 'Asignar 2 símbolos').click(); await p.waitForTimeout(200);
  expect(line(await st(p), 'b10').perPlan['pl-tde'] === b10 + 2, 'asignación en lote suma 2 a b10 en TDE');

  // ── Lienzo experto: zoom y pan por teclado, selección, filtros
  p = await open('d-plano.html?p=p1&plan=pl-tgbt');
  const vb0 = await p.getAttribute('#pv-svg', 'viewBox');
  await p.focus('#pv-stage'); await p.keyboard.press('+'); await p.waitForTimeout(50);
  const z1 = await p.textContent('#pv-zl');
  expect(parseInt(z1) > 100, 'tecla + acerca (' + z1 + ')');
  const vb1 = await p.getAttribute('#pv-svg', 'viewBox'); await p.keyboard.press('ArrowRight');
  expect(await p.getAttribute('#pv-svg', 'viewBox') !== vb1 && vb1 !== vb0, 'flecha mueve la vista');
  await p.mouse.move(700, 700); await p.mouse.wheel(0, -300); await p.waitForTimeout(50);
  expect(parseInt(await p.textContent('#pv-zl')) > parseInt(z1), 'rueda acerca');
  await p.click('[data-z="fit"]'); await p.waitForTimeout(400);
  expect(await p.textContent('#pv-zl') === '100 %', 'encuadrar vuelve a 100 %');
  await p.focus('#pv-svg [data-sym="b7:0"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(450);
  expect(await p.isVisible('.pv-card h3:has-text("Diferencial 4P · 63 A")'), 'Enter sobre un símbolo abre su línea');
  expect(await p.isVisible('text=Completá: Sensibilidad'), 'línea con atributo esencial faltante ofrece completarlo');
  await shot(p, 'experto-seleccion-1440', false);
  await p.selectOption('#pv-miss-sens', { label: '300 mA' }); await p.click('[data-saveattr="sens"]'); await p.waitForTimeout(150);
  expect(line(await st(p), 'b7').attrs.sens === 300, 'guardar atributo faltante actualiza la línea');
  await p.click('[data-st="inf"]');
  expect(await p.locator('#pv-svg .sym.dim').count() > 0 && await p.locator('#pv-svg .sym.s-inf:not(.dim)').count() === 25, 'filtro por estado atenúa lo demás');
  await p.click('[data-st="all"]'); await p.click('[data-fam="Señalización"]');
  expect(await p.locator('#pv-svg .sym:not(.dim)').count() === 6, 'filtro por familia (6 ojos de buey)');
  await p.click('[data-fam=""]');

  // ── ?linea= abre encuadrando el primer símbolo; "Ver todos los iguales"
  p = await open('d-plano.html?p=p1&linea=b6');
  expect(await p.inputValue('#pv-plan') === 'pl-tgbt', '?linea=b6 elige el plano donde está (TGBT)');
  expect(await p.getAttribute('#pv-svg [data-sym="b6:0"]', 'aria-pressed') === 'true', 'primer símbolo de b6 seleccionado');
  expect(/1 de 6/.test(await p.textContent('#pv-step-lbl')), 'Ver todos los iguales: 1 de 6');
  await p.waitForTimeout(400);
  expect(parseInt(await p.textContent('#pv-zl')) > 100, 'la vista encuadra el símbolo');
  await p.click('[data-step="1"]'); await p.waitForTimeout(100);
  expect(/2 de 6/.test(await p.textContent('#pv-step-lbl')) && await p.getAttribute('#pv-svg [data-sym="b6:1"]', 'aria-pressed') === 'true', 'siguiente igual: 2 de 6');
  expect(/linea=b6/.test(await p.getAttribute('#pv-to-bom', 'href')), 'enlace al BOM lleva la línea');
  expect(/d-tablero-3d\.html\?.*plan=pl-tgbt/.test(await p.getAttribute('#act a[href^="d-tablero-3d"]', 'href')), 'enlace a 3D con plan');
  await shot(p, 'experto-linea-1440', false);

  // ── Revisión una por una con teclado
  p = await open('d-plano.html?p=p1&plan=pl-tde&v=guiada');
  expect(await p.isVisible('text=Símbolo 1 de 2 por decidir'), 'cola guiada: 2 por decidir');
  await shot(p, 'guiada-1440', false);
  await p.keyboard.press('ArrowRight');
  expect(await p.isVisible('#pv-g-title:has-text("K1 (?)")'), '→ pasa a K1 (?)');
  await p.keyboard.press('ArrowLeft');
  await p.click('#pv-g-disall');
  expect(await p.isVisible('dialog[open] :text("Descartar 2 símbolos")'), 'descartar todos pide confirmación');
  await dlgBtn(p, 'Cancelar').click(); await p.waitForTimeout(100);
  expect(un(await st(p), 'u1').status === 'PENDIENTE', 'cancelar descartar todos no cambia nada');
  await p.keyboard.press('a'); await p.waitForTimeout(200);
  s = await st(p);
  expect(un(s, 'u1').status === 'RESUELTO' && un(s, 'u1').lineId === 'b12', 'A acepta la sugerencia (u1 → b12)');
  expect(await p.isVisible('#pv-g-title:has-text("K1 (?)")'), 'pasa solo al siguiente');
  await p.keyboard.press('d'); await p.waitForTimeout(200);
  expect(un(await st(p), 'u2').status === 'DESCARTADO', 'D descarta u2');
  expect(await p.isVisible('text=No queda nada por decidir en TDE'), 'estado vacío de éxito al terminar la cola');
  await shot(p, 'guiada-vacio-1440', false);
  p = await open('d-plano.html?p=p1&plan=pl-tstipo&v=guiada');
  await p.keyboard.press('1'); await p.waitForTimeout(200);
  s = await st(p);
  expect(un(s, 'u3').status === 'RESUELTO' && un(s, 'u3').lineId === 'b14', '1 asigna u3 a la primera candidata (ojo de buey rojo, b14)');
  p = await open('d-plano.html?p=p1&plan=pl-tgbt&v=guiada');
  expect(await p.isVisible('#pv-g-title:has-text("Lectura incompleta")'), 'la cola incluye lecturas incompletas (b7 sin sensibilidad)');

  // ── Tabla accesible: ordenar y acciones
  p = await open('d-plano.html?p=p1&plan=pl-tde&v=tabla');
  const first = async () => (await p.locator('#pv-tbl tbody tr').first().getAttribute('data-row'));
  await p.click('th[data-sort="conf"]'); await p.waitForTimeout(80);
  expect(await first() !== 'u:u1' && await p.getAttribute('th[data-sort="conf"]', 'aria-sort') === 'ascending', 'orden ascendente por confianza');
  await p.click('th[data-sort="conf"]'); await p.waitForTimeout(80);
  expect(await first() === 'u:u1', 'descendente: u1 (58 %) primero');
  await p.focus('th[data-sort="tag"]'); await p.keyboard.press('Enter'); await p.waitForTimeout(80);
  expect(await p.getAttribute('th[data-sort="tag"]', 'aria-sort') === 'ascending', 'ordenar con teclado');
  await shot(p, 'tabla-1440', false);
  await p.click('[data-fk="tdis:u2"]'); await p.waitForTimeout(150);
  expect(un(await st(p), 'u2').status === 'DESCARTADO', 'descartar desde la tabla');
  await p.click('[data-fk="tres:u1"]'); await dlgBtn(p, 'Asignar símbolo').click(); await p.waitForTimeout(150);
  expect(un(await st(p), 'u1').status === 'RESUELTO', 'resolver desde la tabla');
  await p.click('[data-fk="tsee:b6:0"]'); await p.waitForTimeout(200);
  expect(await p.getAttribute('[data-v="experto"]', 'aria-selected') === 'true' && await p.isVisible('#pv-step-lbl'), '"Ver" en la tabla abre el lienzo con el símbolo');

  // ── Comentarios
  p = await open('d-plano.html?p=p1&plan=pl-tstipo');
  expect(await p.isVisible('text=¿Son 4 pisos iguales'), 'lista comentarios existentes del plano');
  await p.click('#pv-com-f button');
  expect(await p.isVisible('#pv-com-f .field-err'), 'comentario vacío valida');
  await p.fill('#pv-com-in', 'Confirmado con Martín: los 4 pisos son iguales.'); await p.click('#pv-com-f button'); await p.waitForTimeout(150);
  expect((await st(p)).comments.some(c => c.entity === 'plan:pl-tstipo' && /4 pisos son iguales/.test(c.text)), 'comentario guardado en plan:pl-tstipo');
  expect(await p.isVisible('.pv-com-i:has-text("4 pisos son iguales")'), 'comentario visible en la lista');

  // ── Estados
  p = await open('d-plano.html?p=p1&plan=pl-tde&estado=error');
  expect(await p.isVisible('text=No pudimos procesar TDE') && /d-obra\.html/.test(await p.getAttribute('a:has-text("Volver a procesar")', 'href')), 'estado error explica y enlaza a reprocesar');
  await shot(p, 'error-1440', false);
  p = await open('d-plano.html?p=p1&estado=cargando');
  expect(await p.locator('.skel').count() > 3, 'estado cargando con esqueleto');
  await shot(p, 'cargando-1440', false);
  p = await open('d-plano.html?p=p1&plan=pl-tsb');
  expect(await p.isVisible('text=TS-B todavía no se procesó'), 'plano sin procesar explica y enlaza');

  // ── 1024
  for (const [n, u] of [['experto', 'plan=pl-tde'], ['experto-linea', 'linea=b6'], ['guiada', 'plan=pl-tde&v=guiada'], ['tabla', 'plan=pl-tde&v=tabla'], ['error', 'plan=pl-tde&estado=error'], ['cargando', 'estado=cargando']]) {
    const q = await open('d-plano.html?p=p1&' + u, { width: 1024, height: 768, wait: 600 }); await shot(q, n + '-1024', false);
  }
  const q = await open('d-plano.html?p=p1&plan=pl-tde&v=guiada', { width: 1024, height: 768 });
  await q.keyboard.press('a'); await q.keyboard.press('d'); await q.waitForTimeout(200); await shot(q, 'guiada-vacio-1024', false);
  const rm = await open('d-plano.html?p=p1&linea=b6', { reducedMotion: 'reduce' });
  expect(parseInt(await rm.textContent('#pv-zl')) > 100, 'con movimiento reducido encuadra sin animar');
  log('listo');
});
