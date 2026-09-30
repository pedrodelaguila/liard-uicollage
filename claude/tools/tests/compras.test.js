/* Compras (ingeniería): solicitud → ofertas → comparación → adjudicación → pedidos.
   Correr: node tools/tests/compras.test.js */
const { run } = require('../pw');

run('compras', async ({ open, shot: rawShot, expect, log, download }) => {
  /* Captura limpia: sin toasts y desde arriba (si no, lo sticky queda flotando en la captura de página completa). */
  const shot = async (p, name, full = true) => { await p.evaluate(() => { const t = document.getElementById('toasts'); if (t) t.innerHTML = ''; document.querySelectorAll('.award,.sticky-send,.mtabs').forEach(e => e.style.position = 'static'); if (!document.querySelector('dialog[open]')) window.scrollTo(0, 0); }); await p.waitForTimeout(60); return rawShot(p, name, full); };
  const CMP = 'd-comparar.html?r=r-0141&p=p2';
  const txt = async (p, sel) => (await p.textContent(sel)) || '';

  /* ── 1. Cotización bloqueada en p1 ── */
  let p = await open('d-cotizacion.html?p=p1');
  expect(await p.isVisible('#blockers'), 'p1: se ven los bloqueos');
  expect(await p.isDisabled('#send'), 'p1: «Enviar solicitud» deshabilitado con bloqueos');
  expect((await txt(p, '#blockers')).includes('3 símbolos sin identificar'), 'p1: bloqueo de símbolos con su link');
  expect(await p.isVisible('text=PRECIO DESACT.'), 'p1: precio desactualizado marcado');
  expect(await p.isVisible('text=Falta sensibilidad.'), 'p1: NOT_FOUND con su motivo');
  await shot(p, 'cotizacion-p1-bloqueada');

  /* Arreglar los bloqueos desde el store (como si se hubieran resuelto en plano y BOM) */
  await p.evaluate(() => {
    ['u1', 'u2', 'u3'].forEach(id => { const u = L.store.get().unidentified.find(x => x.id === id); if (u.guess) L.resolveSymbol(id, { typeId: u.guess, attrs: u.guessAttrs }); else L.resolveSymbol(id, { discard: true }); });
    L.updateLine('b9', { brand: 'Schneider' }); L.updateLine('b12', { brand: 'ANY' });
    L.linesOf('p1').filter(l => l.brand == null).forEach(l => L.updateLine(l.id, { brand: 'ANY' }));
  });
  await p.waitForTimeout(200);
  expect(!(await p.isVisible('#blockers')), 'p1: sin bloqueos tras resolver símbolos y marcas');
  expect(!(await p.isDisabled('#send')), 'p1: «Enviar solicitud» habilitado');
  /* Validación de plazo */
  await p.fill('#dl', '2026-09-30'); await p.click('#send');
  expect(await p.isVisible('#dl-err'), 'plazo: hoy no es válido (desde mañana)');
  await shot(p, 'cotizacion-plazo-invalido');
  await p.fill('#dl', ''); await p.click('#send');
  expect((await txt(p, '#dl-err')).includes('Indicá hasta cuándo'), 'plazo: vacío pide la fecha');
  await p.fill('#dl', '2026-10-05');
  expect(!(await p.isVisible('#dl-err')), 'plazo: fecha futura válida');
  await p.fill('#note', 'Entrega en obra Rosario.');
  await shot(p, 'cotizacion-p1-lista');
  await Promise.all([p.waitForURL(/d-comparar\.html/), p.click('#send')]);
  await p.waitForTimeout(400);
  expect((await txt(p, 'h2.mono')) === 'SC-0142', 'nueva solicitud SC-0142 aparece en comparar');
  expect((await p.$$('[data-sim]')).length >= 1, 'SC-0142: distribuidores sin responder con «Simular respuesta»');
  await shot(p, 'comparar-sc0142-nueva');

  /* ── 2. Camino completo en p2 / SC-0141 (umbral por defecto) ── */
  p = await open(CMP);
  expect(await p.isVisible('text=Alternativa sugerida · sin aprobar'), 'Norte h1: alternativa sugerida sin aprobar');
  await shot(p, 'comparar-matriz-inicial');
  /* Adjudicar la alternativa sin aprobar → error de validación listado */
  await p.click('[data-cell="h1|norte"]'); await p.click('#award');
  expect((await txt(p, '#award-errs')).includes('necesita que apruebes la equivalencia técnica'), 'validateAward: alternativa sin aprobar no se adjudica');
  await shot(p, 'comparar-error-alternativa');
  await p.click('#clear');
  /* Simular Sur */
  await p.click('[data-sim="sur"]'); await p.waitForTimeout(200);
  expect(!(await p.$('[data-sim="sur"]')), 'Sur respondió (simulado)');
  /* Aprobar la equivalencia de Norte */
  await p.click('[data-eq^="o-2|h1"]');
  await p.waitForSelector('dialog.dlg[open]');
  expect(await p.isVisible('dialog >> text=Componente base'), 'diálogo: atributos lado a lado');
  await shot(p, 'comparar-equivalencia', false);
  await p.click('dialog >> text=Aprobar equivalencia técnica'); await p.waitForTimeout(250);
  expect(await p.isVisible('text=Equivalencia técnica aprobada'), 'equivalencia aprobada');
  /* Estrategia Más barato */
  await p.click('[data-strat="BARATO"]'); await p.waitForTimeout(150);
  const info = await p.evaluate(() => { const a = L.store.get().ui.alloc['r-0141']; const s = L.allocationSummary('r-0141', a); return { a, total: s.total, sups: Object.keys(s.bySupplier), thr: L.store.get().automations.find(x => x.when === 'ADJUDICACION_SUPERA').threshold }; });
  log('Más barato:', JSON.stringify(info.a), 'total', info.total, 'umbral', info.thr);
  const h1 = await p.evaluate(() => L.compare('r-0141').rows.find(r => r.lineId === 'h1').cheapest.supplierId);
  expect(info.a.h1 === h1 && h1 === 'sur', 'Más barato elige en h1 el más barato adjudicable (Sur 991.870 < alternativa de Norte 998.000)');
  const onlyNorte = await p.evaluate(() => { const c = L.compare('r-0141'); const x = c.rows.find(r => r.lineId === 'h1').opts.find(o => o.supplierId === 'norte'); return x.isAlt && x.equivalence === 'APROBADA'; });
  expect(onlyNorte, 'la alternativa de Norte en h1 quedó adjudicable');
  expect(Object.keys(info.a).length === 7, 'Más barato asigna las 7 líneas');
  await shot(p, 'comparar-matriz-barato');
  /* Persistencia del borrador */
  await p.reload(); await p.waitForTimeout(400);
  const pressed = await p.$$eval('.cell[aria-pressed="true"]', els => els.length);
  expect(pressed === 7, 'borrador persiste tras recargar (7 celdas adjudicadas)');
  /* XLSX de la comparación */
  const x = await download(p, () => p.click('#xlsx'));
  expect(x.buf.slice(0, 2).toString() === 'PK' && x.text.includes('xl/worksheets/sheet2.xml') && x.text.includes('SC-0141') && x.size > 2000, 'XLSX de comparación válido (' + x.name + ', ' + x.size + ' B)');
  /* Variantes */
  await p.click('[data-v="escenarios"]'); await p.waitForTimeout(200);
  expect(await p.isVisible('text=mejor proveedor único'), 'escenarios: compara contra el mejor proveedor único');
  await shot(p, 'comparar-escenarios');
  await p.click('.sc button[data-sc="RAPIDO"]'); await p.waitForTimeout(150);
  const rap = await p.evaluate(() => L.store.get().ui.alloc['r-0141']);
  expect(rap.h2 === 'sur', 'escenario «Más rápido» pasa a ser la asignación');
  await p.click('.sc button[data-sc="BARATO"]'); await p.waitForTimeout(150);
  await p.click('[data-v="asistente"]'); await p.waitForTimeout(200);
  const spent0 = await p.evaluate(() => L.aiSpent());
  await shot(p, 'comparar-asistente-vacio');
  await p.click('#ai-run'); await p.waitForTimeout(250);
  const spent1 = await p.evaluate(() => L.aiSpent());
  expect(Math.abs(spent1 - spent0 - 0.03) < 1e-6, 'asistente: consume USD 0,03 del presupuesto');
  expect((await p.$$('.reco-i')).length === 7, 'asistente: explica las 7 líneas');
  expect(await p.isVisible('text=Riesgos a mirar'), 'asistente: marca riesgos');
  await shot(p, 'comparar-asistente');
  /* Adjudicar (umbral por defecto) */
  const expectsApproval = info.total > info.thr;
  await p.click('#award'); await p.waitForTimeout(300);
  if (expectsApproval) expect(await p.isVisible('#ap-pending'), 'total supera el umbral → esperando aprobación');
  else {
    expect(await p.isVisible('#orders'), 'total ' + info.total + ' ≤ ' + info.thr + ' → pedidos creados sin aprobación');
    const ords = await p.evaluate(() => L.store.get().orders.filter(o => o.requestId === 'r-0141').map(o => [o.code, o.supplierId, o.lines.length]));
    log('pedidos:', JSON.stringify(ords));
    expect(ords.length === info.sups.length && new Set(ords.map(o => o[1])).size === ords.length, 'un pedido por distribuidor (' + ords.length + ')');
  }
  await shot(p, 'comparar-pedidos-emitidos');

  /* Pedidos: PDF y XLSX */
  const code = await p.evaluate(() => L.store.get().orders.find(o => o.requestId === 'r-0141').code);
  const oid = await p.evaluate(() => L.store.get().orders.find(o => o.requestId === 'r-0141').id);
  let q = await open('d-pedidos.html?p=p2&o=' + oid, { keepState: true });
  expect(await q.isVisible('#detail'), 'pedidos: detalle del pedido');
  expect(await q.isVisible('text=Los datos de contacto para coordinar'), 'pedidos: contacto oculto hasta confirmar');
  const pdf = await download(q, () => q.click('#pdf'));
  expect(pdf.text.startsWith('%PDF') && pdf.text.includes(code), 'PDF empieza con %PDF y contiene ' + code);
  expect(pdf.text.includes('Subtotal') && pdf.text.includes('Precio unitario') && pdf.text.includes('liard no lo procesa'), 'PDF con cantidad, unitario y subtotal');
  await shot(q, 'pedidos-detalle');
  const lx = await download(q, () => q.click('#xlsx'));
  expect(lx.buf.slice(0, 2).toString() === 'PK' && lx.text.includes(code), 'XLSX de pedidos válido');
  /* Confirmar un pedido (como distribuidor) y rechazar otro → contacto y readjudicar */
  await q.evaluate(() => { const os = L.store.get().orders.filter(o => o.requestId === 'r-0141'); L.respondOrder(os[0].id, 'CONFIRMED'); if (os[1]) L.respondOrder(os[1].id, 'REJECTED', 'Sin stock de ese gabinete'); });
  await q.waitForTimeout(200);
  expect(await q.isVisible('#detail .contact:not(.locked)'), 'pedido confirmado muestra el contacto');
  await q.selectOption('#fst', 'CONFIRMED'); await q.waitForTimeout(100);
  expect((await q.$$('tr[data-o]')).every ? (await q.$$eval('tr[data-o] .badge', b => b.every(x => x.textContent === 'Confirmado'))) : false, 'filtro por estado: solo confirmados');
  await shot(q, 'pedidos-confirmados');
  await q.selectOption('#fst', ''); await q.selectOption('#fpr', ''); await q.waitForTimeout(100);
  await shot(q, 'pedidos-todos');
  const rejOid = await q.evaluate(() => (L.store.get().orders.find(o => o.status === 'REJECTED') || {}).id);
  if (rejOid) {
    await q.click(`tr[data-o="${rejOid}"]`); await q.waitForTimeout(100);
    expect(await q.isVisible('#reaward'), 'pedido rechazado ofrece readjudicar');
    await shot(q, 'pedidos-rechazado');
    await Promise.all([q.waitForURL(/d-comparar/), q.click('#reaward')]); await q.waitForTimeout(300);
    expect((await q.$$('tr.unas')).length >= 1, 'líneas del pedido rechazado vuelven a la matriz sin asignar');
    await shot(q, 'comparar-readjudicar');
  }

  /* ── 3. Camino con aprobación (umbral bajo) + m-aprobar ── */
  p = await open(CMP);
  await p.evaluate(() => L.store.update(s => { s.automations.find(a => a.when === 'ADJUDICACION_SUPERA').threshold = 1000000; }));
  await p.click('[data-sim="sur"]'); await p.waitForTimeout(150);
  await p.click('[data-strat="BARATO"]'); await p.waitForTimeout(150);
  await p.click('#award'); await p.waitForTimeout(250);
  expect(await p.isVisible('text=Esperando aprobación de Dirección'), 'umbral bajo: «Esperando aprobación de Dirección»');
  expect(await p.isVisible('text=Aprobar como Daniel Ortega (Dirección)'), 'acción demo para aprobar como Dirección');
  const nOrd0 = await p.evaluate(() => L.store.get().orders.filter(o => o.requestId === 'r-0141').length);
  expect(nOrd0 === 0, 'sin pedidos mientras espera aprobación');
  await shot(p, 'comparar-esperando-aprobacion');
  /* Dirección desde el teléfono: aprueba la adjudicación y la equivalencia de Norte */
  const m = await open('m-aprobar.html', { keepState: true });
  await m.setViewportSize({ width: 390, height: 844 });
  expect((await m.$$('[data-ap-ok]')).length === 1, 'm-aprobar: 1 adjudicación pendiente');
  expect((await m.$$('[data-eq-ok]')).length === 1, 'm-aprobar: 1 equivalencia pendiente');
  await shot(m, 'm-aprobar-pendientes');
  await m.click('[data-ap-no]');
  expect(await m.isVisible('.field-err'), 'm-aprobar: rechazar pide nota');
  await m.click('[data-eq-ok]'); await m.waitForTimeout(150);
  await m.fill('textarea[id^="note-"]', 'OK, respetar plazos.');
  await m.click('[data-ap-ok]'); await m.waitForTimeout(150);
  expect(await m.isVisible('text=Nada para aprobar'), 'm-aprobar: queda vacío tras decidir');
  await shot(m, 'm-aprobar-decidido');
  p = await open(CMP, { keepState: true });
  expect(await p.isVisible('#ap-ok') || await p.isVisible('text=Dirección aprobó'), 'd-comparar refleja la aprobación de Dirección');
  expect(await p.isVisible('text=Equivalencia técnica aprobada'), 'd-comparar refleja la equivalencia aprobada en el teléfono');
  /* La equivalencia recién aprobada cambia el más barato: se re-aplica y vuelve a pedir aprobación por el nuevo total */
  const tot = await p.evaluate(() => { const a = L.store.get().ui.alloc['r-0141']; return L.allocationSummary('r-0141', a).total; });
  const apTot = await p.evaluate(() => L.store.get().approvals[0].total);
  log('asignación', tot, 'aprobado', apTot);
  await shot(p, 'comparar-aprobado');
  await p.click('#award'); await p.waitForTimeout(300);
  const nOrd = await p.evaluate(() => L.store.get().orders.filter(o => o.requestId === 'r-0141').length);
  expect(nOrd >= 1 && await p.isVisible('#orders'), 'tras aprobar, se emiten los pedidos (' + nOrd + ')');

  /* ── 4. Estados y otras pantallas ── */
  const lim = await open('d-comparar.html?r=r-0141&p=p2&v=asistente&estado=limite');
  expect(await lim.isVisible('text=Llegaste al límite mensual de IA'), 'asistente: límite rechaza y ofrece camino manual');
  expect(!(await lim.$('#ai-run')), 'asistente: sin botón de IA con el límite');
  await shot(lim, 'comparar-asistente-limite');
  for (const [u, n] of [['d-cotizacion.html?p=p2', 'cotizacion-p2'], ['d-cotizacion.html?p=p1&estado=cargando', 'cotizacion-cargando'], ['d-cotizacion.html?p=p1&estado=error', 'cotizacion-error'], ['d-cotizacion.html?p=p4', 'cotizacion-vacia'],
    ['d-comparar.html?p=p1', 'comparar-sin-solicitud'], ['d-comparar.html?r=r-0127&p=p3', 'comparar-adjudicada'], ['d-comparar.html?r=r-0141&p=p2&dialogo=equivalencia', 'comparar-dialogo-url'],
    ['d-pedidos.html', 'pedidos-inicial'], ['d-pedidos.html?estado=vacio', 'pedidos-vacio'], ['d-directorio.html', 'directorio'], ['d-directorio.html?p=p1', 'directorio-cobertura-p1']]) {
    const x2 = await open(u); await shot(x2, n, !u.includes('dialogo'));
  }
  const d = await open('d-directorio.html');
  await d.fill('#q', 'diferencial'); await d.selectOption('#fb', 'ABB'); await d.waitForTimeout(100);
  const names = await d.$$eval('.dcard h3', els => els.map(e => e.textContent));
  expect(names.length === 2 && names.every(n => n !== 'Distribuidora Sur Eléctrica'), 'directorio: búsqueda + marca ABB filtra (' + names.join(', ') + ')');
  await shot(d, 'directorio-filtrado');
  const d2 = await open('d-directorio.html'); await d2.click('.dcard >> text=Pedirle cotización'); await d2.waitForTimeout(400);
  expect(await d2.$$eval('.sup.on', e => e.length) === 1, 'directorio → cotización con ese distribuidor preseleccionado');
  const me = await open('m-aprobar.html?estado=vacio'); await shot(me, 'm-aprobar-vacio');
});
