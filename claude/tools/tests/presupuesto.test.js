const { run } = require('../pw');

/* Lee los valores numéricos que la página expone en data-v (no el texto formateado). */
const vals = p => p.evaluate(() => { const o = {}; document.querySelectorAll('[data-k][data-v]').forEach(el => { if (!(el.dataset.k in o)) o[el.dataset.k] = +el.dataset.v; }); return o; });
const near = (a, b) => Math.abs(a - b) < 0.01;

run('presupuesto', async ({ open, shot, expect, log, download }) => {
  /* 1 · p1 base: los números de la cascada son los de L.budget */
  let p = await open('d-presupuesto.html?p=p1&v=calculadora');
  const ref = await p.evaluate(() => L.budget('p1'));
  let v = await vals(p);
  for (const k of ['materials', 'labor', 'extras', 'hedge', 'contingency', 'costTotal', 'profit', 'price', 'profitAfterDrift'])
    expect(near(v[k], ref[k]), `p1 base · ${k} = L.budget (${Math.round(v[k])} vs ${Math.round(ref[k])})`);
  expect(near(v.driftRisk, ref.driftRisk), 'p1 base · riesgo de deriva = L.budget.driftRisk');
  const shown = await p.textContent('.wf-r[data-k="price"] .wf-v');
  const fmt = await p.evaluate(x => L.ars(x), ref.price);
  expect(shown.trim() === fmt, `precio renderizado "${shown.trim()}" = ${fmt}`);
  expect(await p.isVisible('text=supuesto'), 'inflación marcada como supuesto');
  expect(await p.isVisible('.pz-bar'), 'barra apilada de procedencia');
  const mix = await p.evaluate(() => [...document.querySelectorAll('.pz-leg li')].map(li => li.dataset.src + ':' + li.dataset.v).join(' '));
  log('procedencia p1 · ' + mix);
  expect(await p.isVisible('text=es precio de referencia de catálogo'), 'aviso > 40 % referencia (p1)');
  expect(await p.isVisible('text=Equivale a un markup de'), 'markup equivalente visible');
  await shot(p, 'p1-calculadora-1440');

  /* 2 · Validación: margen ≥ 100 % y horas negativas */
  await p.fill('#f-marginPct', '100');
  expect(await p.isVisible('text=Con 100 % o más de margen'), 'error de margen ≥ 100 %');
  v = await vals(p); expect(near(v.price, ref.price), 'con error, el cálculo mantiene el último valor válido');
  expect(await p.isDisabled('[data-act="save"]'), 'guardar deshabilitado con error');
  await p.fill('#f-laborHoursPerBoard', '-3');
  expect(await p.isVisible('text=Las horas no pueden ser negativas'), 'error de horas negativas');
  expect(await p.isVisible('text=Hay 2 campos con error'), 'resumen de errores');
  await shot(p, 'p1-validacion');

  /* 3 · Recalcular y persistir */
  await p.fill('#f-marginPct', '30'); await p.fill('#f-laborHoursPerBoard', '32');
  const exp = await p.evaluate(() => L.budget('p1', { marginPct: 30, laborHoursPerBoard: 32 }));
  v = await vals(p);
  expect(near(v.price, exp.price) && near(v.labor, exp.labor), `recalcula en vivo (${Math.round(v.price)} = ${Math.round(exp.price)})`);
  expect(await p.isVisible('text=Cambios sin guardar'), 'marca cambios sin guardar');
  await p.click('[data-act="save"]');
  expect(await p.isVisible('text=Parámetros guardados'), 'toast de guardado');
  p = await open('d-presupuesto.html?p=p1&v=calculadora', { keepState: true });
  expect(await p.inputValue('#f-marginPct') === '30' && await p.inputValue('#f-laborHoursPerBoard') === '32', 'parámetros persisten tras recargar');
  v = await vals(p); expect(near(v.price, exp.price), 'precio persiste tras recargar');

  /* 4 · Moneda ARS/USD */
  await p.click('[data-act="cur"][data-id="USD"]');
  const usdTxt = (await p.textContent('.wf-r[data-k="price"] .wf-v')).trim();
  const usdExp = await p.evaluate(x => L.usd(x / L.store.get().billing.fx.usdArs), exp.price);
  expect(usdTxt === usdExp, `USD con cotización simulada (${usdTxt})`);
  expect(await p.isVisible('text=cotización simulada'), 'rótulo cotización simulada');
  await p.click('[data-act="cur"][data-id="ARS"]');

  /* 5 · PDF bloqueado por línea sin precio, precio manual lo habilita */
  expect(await p.getAttribute('#act [data-act="pdf"]', 'aria-disabled') === 'true', 'botón PDF marcado como no disponible');
  await p.click('#act [data-act="pdf"]', { force: true });
  expect(await p.isVisible('text=No se generó el PDF'), 'PDF bloqueado con línea sin precio');
  const manId = await p.evaluate(() => document.querySelector('input[data-man]').dataset.man);
  await p.fill(`#man-${manId}`, '255000'); await p.press(`#man-${manId}`, 'Enter');
  await p.waitForTimeout(150);
  const stored = await p.evaluate(id => L.store.get().ui.manualPrices.p1[id], manId);
  expect(stored === 255000, 'precio manual guardado en s.ui.manualPrices');
  v = await vals(p); const withMan = await p.evaluate(() => L.budget('p1').materials);
  const qty = await p.evaluate(id => L.qty(L.line(id)), manId);
  expect(near(v.materials, withMan + 255000 * qty), 'el precio manual suma a materiales');
  await shot(p, 'p1-precio-manual');
  const pdf = await download(p, () => p.click('#act [data-act="pdf"]'));
  const pt = pdf.buf.toString('latin1');
  expect(pt.startsWith('%PDF'), 'PDF válido (%PDF) ' + pdf.size + ' B');
  expect(pt.includes('Clínica San Martín') && pt.includes('Constructora Paraná SA'), 'PDF con obra y cliente');
  expect(pt.includes('Precios sujetos a variaci') && pt.includes('lido hasta'), 'PDF con condiciones y validez');
  expect(pt.includes('Materiales · Protecci') && pt.includes('TS-P tipo') && pt.includes('× 4'), 'PDF con familias y tableros × repeticiones');
  expect(!/Electro Delta|Norte Materiales|Sur El[ée]ctrica/.test(pt), 'PDF sin nombres de distribuidores');
  const xl = await download(p, () => p.click('[data-act="xlsx"]'));
  expect(xl.buf.slice(0, 2).toString() === 'PK' && xl.size > 2000, 'XLSX es un zip ' + xl.size + ' B');
  expect(xl.text.includes('xl/worksheets/sheet2.xml') && xl.text.includes('Precio de referencia') && xl.text.includes('Procedencia'), 'XLSX con procedencias');

  /* 6 · Escenarios: guardar propio y comparar */
  await p.click('.pz-params [data-act="savescn"]');
  await p.click('.dlg footer .btn-primary'); expect(await p.isVisible('text=Escribí un nombre'), 'nombre de escenario requerido');
  await p.fill('#scn-name', 'Licitación 30 días');
  await p.click('.dlg footer .btn-primary');
  expect(await p.evaluate(() => L.store.get().ui.budgetScenarios.p1[0].name) === 'Licitación 30 días', 'escenario en s.ui.budgetScenarios');
  await p.click('[role="tab"][data-v="comparador"]'); await p.waitForSelector('.pz-cmp');
  const cols = await p.$$eval('.pz-cmp th.sc', t => t.length);
  expect(cols === 4, 'comparador: 3 escenarios + el propio (' + cols + ')');
  const cmpPrices = await p.evaluate(() => [...document.querySelectorAll('.pz-cmp td[data-k="price"]')].map(td => [td.dataset.col, +td.dataset.v]));
  const scnRef = await p.evaluate(() => ({ base: L.budget('p1', { scenario: 'base' }).price, cobertura: L.budget('p1', { scenario: 'cobertura' }).price, competitivo: L.budget('p1', { scenario: 'competitivo' }).price }));
  const man = await p.evaluate(id => 255000 * L.qty(L.line(id)), manId);
  log('comparador · ' + cmpPrices.map(([c, x]) => c + '=' + Math.round(x)).join(' '));
  expect(cmpPrices[1][1] > cmpPrices[0][1] && cmpPrices[2][1] < cmpPrices[0][1], 'cobertura > base > competitivo');
  expect(await p.$$eval('.pz-cmp td.diff', t => t.length) > 3, 'resalta diferencias');
  await p.click('.pz-cmp [data-act="choose"][data-id="competitivo"]');
  expect(await p.isVisible('.pz-cmp th.chosen >> text=Presupuesto a enviar'), 'escenario elegido para enviar');
  expect(await p.evaluate(() => L.store.get().budgets.p1.scenario) === 'competitivo', 'elegir guarda el escenario');
  await shot(p, 'p1-comparador-1440');
  await p.click('.pz-cols [data-act="col"][data-id="cobertura"]');
  expect(await p.$$eval('.pz-cmp th.sc', t => t.length) === 3, 'quitar una columna');
  void scnRef; void man;

  /* 7 · Guiado: 4 pasos */
  await p.click('[role="tab"][data-v="guiado"]'); await p.waitForSelector('.pz-guide');
  expect(await p.isVisible('text=Paso 1 de 4'), 'guiado paso 1');
  await shot(p, 'p1-guiado-paso1-1440');
  await p.click('.pz-gnav .btn-primary'); expect(await p.isVisible('text=Paso 2 de 4'), 'guiado paso 2');
  await p.click('.pz-gnav .btn-primary'); expect(await p.isVisible('text=Paso 3 de 4'), 'guiado paso 3');
  await shot(p, 'p1-guiado-paso3-1440');
  await p.click('.pz-gnav .btn-primary'); expect(await p.isVisible('text=Paso 4 de 4'), 'guiado paso 4');
  await shot(p, 'p1-guiado-paso4-1440');
  /* teclado: los pasos son botones */
  await p.focus('.pz-steps [data-n="2"]'); await p.keyboard.press('Enter');
  expect(await p.isVisible('text=Paso 2 de 4'), 'pasos operables con teclado');

  /* 8 · p2: adjudicar SC-0141 en otra "pantalla" mueve oferta → pedido en vivo */
  const q = await open('d-presupuesto.html?p=p2&v=calculadora');
  const before = await q.evaluate(() => [...document.querySelectorAll('.pz-leg li')].reduce((o, li) => (o[li.dataset.src] = +li.dataset.v, o), {}));
  expect(before.oferta > 0 && before.pedido === 0, 'p2 antes: costo por oferta confirmada');
  await shot(q, 'p2-ofertas-1440');
  const aw = await q.evaluate(() => { const a = L.allocate('r-0141', 'BARATO'); let r = L.award('r-0141', a); if (r.needsApproval) { L.decideApproval(r.approval.id, 'APROBADA', 'test'); r = L.award('r-0141', a); } return { ok: r.ok, n: r.orders && r.orders.length, errs: r.errs }; });
  expect(aw.ok, 'adjudicación de SC-0141 (' + aw.n + ' pedidos)' + (aw.errs ? ' ' + aw.errs.join(' ') : ''));
  await q.waitForTimeout(200);
  const after = await q.evaluate(() => [...document.querySelectorAll('.pz-leg li')].reduce((o, li) => (o[li.dataset.src] = +li.dataset.v, o), {}));
  expect(after.pedido > 0 && after.oferta === 0, `p2 después: costo por pedido (${Math.round(after.pedido)})`);
  expect(await q.isVisible('text=Costos actualizados'), 'aviso de cambio de procedencia');
  const vq = await vals(q); const rq = await q.evaluate(() => L.budget('p2'));
  expect(near(vq.price, rq.price), 'p2 precio = L.budget tras adjudicar');
  const pdf2 = await download(q, () => q.click('#act [data-act="pdf"]'));
  const t2 = pdf2.buf.toString('latin1');
  expect(t2.startsWith('%PDF') && t2.includes('Hotel Costa Serena') && !/Electro Delta|Norte Materiales|Sur El[ée]ctrica/.test(t2), 'PDF p2 sin distribuidores');

  /* 9 · Estados y capturas a 1440 y 1024 */
  const states = [
    ['p1-calculadora', 'd-presupuesto.html?p=p1&v=calculadora'], ['p1-comparador', 'd-presupuesto.html?p=p1&v=comparador'], ['p1-guiado', 'd-presupuesto.html?p=p1&v=guiado'],
    ['p2-ofertas', 'd-presupuesto.html?p=p2'], ['p3-pedidos', 'd-presupuesto.html?p=p3'], ['p4-vacia', 'd-presupuesto.html?p=p4'], ['sin-precios', 'd-presupuesto.html?p=p1&estado=sin-precios'],
    ['p3-guiado-riesgo', 'd-presupuesto.html?p=p3&v=guiado&paso=3'],
  ];
  for (const [n, u] of states) for (const w of [1440, 1024]) {
    const s = await open(u, { width: w });
    if (n === 'p3-pedidos' && w === 1440) { const m = await s.evaluate(() => [...document.querySelectorAll('.pz-leg li')].reduce((o, li) => (o[li.dataset.src] = +li.dataset.v, o), {})); expect(m.pedido > 0 && m.oferta === 0 && m.referencia === 0, 'p3: todo por pedido'); }
    if (n === 'p4-vacia' && w === 1440) expect(await s.isVisible('text=Todavía no hay costos para presupuestar'), 'p4 vacía explica el flujo');
    if (n === 'sin-precios' && w === 1440) expect(await s.isVisible('text=Subí los planos'), 'estado sin-precios');
    const ow = await s.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(ow <= 0, `${n} @${w}: sin desborde horizontal`);
    await shot(s, `${n}-${w}`);
  }
  const u = await open('d-presupuesto.html?p=p1&v=calculadora&moneda=USD');
  await shot(u, 'p1-usd-1440');
});
