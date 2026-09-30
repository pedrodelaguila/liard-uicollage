const { run } = require('../pw');
/* Área proveedor: Sur Eléctrica arma, valida, guarda, envía y reedita su oferta; no cotiza otra solicitud;
   responde pedidos una sola vez; descargas; móvil; confidencialidad. */
const RIVALS = ['Electro Delta', 'Norte Materiales', 'Hernán Sosa', 'Valeria Quiroga', 'electrodelta', 'nortemateriales'];
const RIVAL_PRICES = ['1.653.540', '119.800', '99.370', '22.400', '24.820', '998.000', '78.350', '58.950', '14.240', '14.720', '290.900'];
const digits = s => +String(s).replace(/[^0-9]/g, '');

run('proveedor', async ({ open, shot: rawShot, expect, download }) => {
  /* Captura desde arriba: si la página quedó desplazada, el shell fijo se corre en la captura completa. */
  /* keepState reutiliza el contexto anterior (1440 px): para 390 se achica el viewport de esa página. */
  const narrow = async (url) => { const pg = await open(url, { keepState: true }); await pg.setViewportSize({ width: 390, height: 844 }); await pg.waitForTimeout(150); return pg; };
  const shot = async (pg, name, full) => { await pg.evaluate(() => window.scrollTo(0, 0)); await pg.waitForTimeout(60); await rawShot(pg, name, full); };
  const confidential = async (p, where) => {
    const t = await p.evaluate(() => document.body.innerText);
    const leak = RIVALS.filter(x => t.includes(x)).concat(RIVAL_PRICES.filter(x => t.includes('ARS ' + x)));
    expect(!leak.length, 'confidencialidad en ' + where + (leak.length ? ' · filtra: ' + leak.join(', ') : ''));
  };

  /* ── 1. Inicio, bandeja y estados ── */
  const home = await open('d-prov-inicio.html');
  expect(await home.isVisible('text=Cotizar SC-0141'), 'inicio: SC-0141 aparece para responder');
  expect(await home.isVisible('text=Leads del mes'), 'inicio: leads del mes');
  await confidential(home, 'inicio'); await shot(home, 'inicio-1440');
  await shot(await open('d-prov-inicio.html', { mobile: true }), 'inicio-390');
  await shot(await open('d-prov-inicio.html?estado=cargando'), 'inicio-cargando');

  const inbox = await open('d-prov-solicitudes.html');
  expect(await inbox.locator('#t tbody tr').count() === 1, 'bandeja: solo las solicitudes que me incluyen (1, no SC-0127)');
  expect(await inbox.isVisible('text=contacto al confirmar'), 'bandeja: contacto del comprador oculto');
  await confidential(inbox, 'bandeja'); await shot(inbox, 'solicitudes-1440');
  await shot(await open('d-prov-solicitudes.html', { mobile: true }), 'solicitudes-390');
  for (const e of ['vacio', 'cargando', 'error']) await shot(await open('d-prov-solicitudes.html?estado=' + e), 'solicitudes-' + e);

  /* ── 2. Oferta SC-0141: prefill, validaciones, arreglo, descuento, borrador ── */
  const p = await open('d-prov-oferta.html?r=r-0141&v=planilla');
  expect(await p.isVisible('text=Armar oferta desde mi catálogo'), 'oferta: arranca sin responder');
  await shot(p, 'oferta-sin-responder');
  await p.click('[data-act="start"]'); await p.waitForTimeout(200);
  const pre = await p.evaluate(() => L.offer('r-0141', 'sur'));
  expect(pre.status === 'BORRADOR' && pre.lines.length === 7, 'prefill: borrador con 7 líneas');
  expect(pre.lines.every(l => l.stock === 'DESCONOCIDO' && l.refPrice > 0 && l.unitPrice === l.refPrice), 'prefill: precio de referencia del catálogo de Sur y disponibilidad sin confirmar');
  expect(await p.isVisible('text=precio de referencia'), 'prefill: etiqueta precio de referencia visible');
  await shot(p, 'oferta-planilla-prefill');

  // Errores: precio 0, parcial sin cantidad, alternativa sin motivo, validez vencida
  await p.fill('#f-h1-base', '0');
  await p.selectOption('#f-h2-stock', 'PARCIAL');
  await p.selectOption('#f-h3-mode', 'ALTERNATIVA');
  const altOpt = await p.$$eval('#f-h3-altItem option', os => os.map(o => o.value).filter(v => v && v !== 'MANUAL'));
  await p.selectOption('#f-h3-altItem', altOpt[0]);
  await p.fill('#validUntil', '2026-09-01'); await p.dispatchEvent('#validUntil', 'change');
  await p.click('[data-act="submit"]'); await p.waitForTimeout(200);
  const errTxt = await p.textContent('#errsum');
  expect(/precio tiene que ser mayor a 0/.test(errTxt), 'validación: precio 0');
  expect(/stock parcial, indicá cuántas/.test(errTxt), 'validación: parcial sin cantidad');
  expect(/por qué la alternativa es equivalente/.test(errTxt), 'validación: alternativa sin motivo');
  expect(/validez tiene que ser una fecha/.test(errTxt), 'validación: validez vencida');
  expect(await p.locator('tr.has-err').count() >= 3, 'validación: errores marcados por línea');
  expect(await p.evaluate(() => L.offer('r-0141', 'sur').status) === 'BORRADOR', 'validación: no se envió');
  await shot(p, 'oferta-errores');

  // Arreglo
  await p.fill('#f-h1-base', '1000000');
  await p.fill('#f-h2-stockQty', '4');
  await p.fill('#f-h3-altReason', 'Mismo diferencial 2P 25 A 30 mA, gama Schneider en lugar de Chint.');
  await p.fill('#validUntil', '2026-10-15'); await p.dispatchEvent('#validUntil', 'change');
  await p.selectOption('#paymentTerms', '60 días');
  const delta = await p.textContent('[data-delta="h1"]');
  expect(/−/.test(delta) && /vs catálogo/.test(delta), 'precio ajustado muestra diferencia con el catálogo: ' + delta.trim());
  await p.fill('#discountPct', '10'); await p.waitForTimeout(100);
  expect(!(await p.isVisible('#errsum')) || !/precio tiene que ser/.test(await p.textContent('#errsum')), 'arreglo: sin error de precio');
  // Teclado: Enter baja a la misma columna de la línea siguiente
  await p.focus('#f-h4-lead'); await p.keyboard.press('Enter');
  expect(await p.evaluate(() => document.activeElement.id) === 'f-h5-lead', 'teclado: Enter en planilla baja a la misma columna');
  // Acción masiva: confirmar stock de todo (la parcial queda confirmada)
  await p.click('[data-act="stock-all"]');
  await p.selectOption('#f-h2-stock', 'PARCIAL'); await p.fill('#f-h2-stockQty', '4');
  await p.fill('#bulkLead', '3'); await p.click('[data-act="lead-all"]');
  // Guardar con Ctrl+S
  await p.focus('#discountPct'); await p.keyboard.press('Control+s'); await p.waitForTimeout(200);
  const saved = await p.evaluate(() => { const o = L.offer('r-0141', 'sur'); const r = L.request('r-0141');
    const expected = o.lines.reduce((a, ol) => { const b = ol.mode === 'ALTERNATIVA' ? ol.alt.basePrice : ol.basePrice; return a + (ol.mode === 'SIN_OFERTA' ? 0 : Math.round(b * 0.9) * L.reqQty(r, L.line(ol.lineId))); }, 0);
    return { o, expected, total: L.offerTotal(o) }; });
  expect(saved.o.discountPct === 10 && saved.o.paymentTerms === '60 días' && saved.o.validUntil === '2026-10-15', 'borrador guardado con condiciones');
  expect(saved.o.lines.find(l => l.lineId === 'h1').unitPrice === 900000, 'descuento: 1.000.000 − 10 % = 900.000 neto');
  expect(Math.abs(saved.total - saved.expected) < 1, 'descuento: total del store = Σ round(base × 0,9) × cant (' + saved.total + ')');
  expect(digits(await p.textContent('#t-total')) === Math.round(saved.total), 'descuento: total en pantalla = total calculado');
  expect(saved.o.lines.filter(l => l.mode !== 'SIN_OFERTA').every(l => l.leadDays === 3), 'plazo aplicado a todo');
  expect(saved.o.lines.filter(l => l.lineId !== 'h2').every(l => l.stock === 'CONFIRMADO'), 'stock confirmado en todo');
  await confidential(p, 'oferta en edición'); await shot(p, 'oferta-planilla-arreglada');

  // Recarga: persiste
  const p2 = await open('d-prov-oferta.html?r=r-0141&v=planilla', { keepState: true });
  expect(await p2.inputValue('#discountPct') === '10', 'recarga: descuento persiste');
  expect(await p2.inputValue('#f-h1-base') === '1000000', 'recarga: precio base persiste');
  expect(await p2.inputValue('#f-h3-altReason') !== '', 'recarga: alternativa y motivo persisten');
  await shot(p2, 'oferta-borrador-recargado');
  await p2.click('[data-v="lineas"]'); await p2.waitForTimeout(150);
  expect(await p2.isVisible('text=líneas revisadas'), 'variante línea por línea');
  await p2.click('[data-next="0"]'); await p2.waitForTimeout(150);
  expect(await p2.isVisible('text=1 de 7 líneas revisadas'), 'línea por línea: progreso');
  await shot(p2, 'oferta-lineas');
  await shot(await narrow('d-prov-oferta.html?r=r-0141&v=lineas'), 'oferta-lineas-390');
  await shot(await narrow('d-prov-oferta.html?r=r-0141&v=planilla'), 'oferta-planilla-390');

  // Descargas
  const pdf = await download(p2, () => p2.click('[data-act="pdf"]'));
  expect(pdf.buf.slice(0, 4).toString() === '%PDF' && pdf.text.includes('SC-0141') && pdf.text.includes('900.000'), 'PDF de oferta: %PDF, código y precio neto');
  const xl = await download(p2, () => p2.click('[data-act="xlsx"]'));
  expect(xl.buf.slice(0, 2).toString() === 'PK' && xl.text.includes('xl/worksheets/sheet1.xml') && xl.size > 1000, 'XLSX válido (' + xl.size + ' bytes)');

  // Enviar
  const p3 = await open('d-prov-oferta.html?r=r-0141&v=planilla', { keepState: true });
  await p3.click('[data-act="submit"]'); await p3.waitForTimeout(250);
  const after = await p3.evaluate(() => ({ st: L.offer('r-0141', 'sur').status, n: L.store.get().notifications.filter(n => n.role === 'ENGINEER' && /Nueva oferta en SC-0141/.test(n.title) && /Sur/.test(n.body)).length,
    cmp: L.compare('r-0141').rows.map(r => r.opts.find(x => x.supplierId === 'sur')), alt: L.offer('r-0141', 'sur').lines.find(l => l.lineId === 'h3') }));
  expect(after.st === 'ENVIADA', 'envío: estado Oferta enviada');
  expect(after.n === 1, 'envío: aviso a ingeniería');
  expect(after.cmp.every(x => x && !x.none && x.price > 0), 'envío: d-comparar (L.compare) incluye precios de Sur en las 7 líneas');
  expect(after.cmp[0].price === 900000, 'envío: comparación usa el precio neto con descuento');
  expect(after.alt.mode === 'ALTERNATIVA' && after.alt.alt.equivalence === 'SUGERIDA', 'envío: alternativa queda sugerida, la aprueba ingeniería');
  expect(await p3.isVisible('text=Tu oferta enviada') && await p3.isVisible('[data-act="edit"]'), 'solo lectura con Editar oferta');
  await confidential(p3, 'oferta enviada'); await shot(p3, 'oferta-enviada');
  await p3.click('[data-act="edit"]'); await p3.waitForTimeout(150);
  await p3.fill('#f-h4-base', '14000'); await p3.click('[data-act="submit"]'); await p3.waitForTimeout(250);
  const re = await p3.evaluate(() => { const o = L.offer('r-0141', 'sur'); return { st: o.status, rev: o.revision, p: o.lines.find(l => l.lineId === 'h4').unitPrice }; });
  expect(re.st === 'ENVIADA' && re.rev === 1 && re.p === 12600, 'reenvío: revisión 2 con precio nuevo (14.000 − 10 %)');
  await shot(p3, 'oferta-reenviada');

  /* ── 3. No cotizar otra solicitud ── */
  const rid = await p3.evaluate(() => L.createRequest({ projectId: 'p2', supplierIds: ['sur', 'delta'], lineIds: ['h2', 'h4'], deadline: '2026-10-06', note: 'Reposición', alternativesAllowed: false }).id);
  const dp = await open('d-prov-oferta.html?r=' + rid, { keepState: true });
  await dp.click('[data-act="decline"]'); await dp.waitForTimeout(100);
  await dp.click('dialog .btn-danger'); await dp.waitForTimeout(100);
  expect(await dp.isVisible('dialog .field-err'), 'no cotizar: motivo obligatorio');
  await shot(dp, 'no-cotizar-dialogo', false);
  await dp.selectOption('#dr', 'Sin stock para estos plazos'); await dp.click('dialog .btn-danger'); await dp.waitForTimeout(200);
  const dec = await dp.evaluate(rid => ({ o: L.offer(rid, 'sur'), n: L.store.get().notifications.some(n => n.role === 'ENGINEER' && /no cotiza/.test(n.title)) }), rid);
  expect(dec.o.status === 'DECLINADA' && /Sin stock/.test(dec.o.declineReason) && dec.n, 'no cotizar: DECLINADA con motivo y aviso');
  expect(!(await dp.isVisible('[data-act="decline"]')), 'no cotizar: no se puede repetir');
  await shot(dp, 'no-cotizar-hecho');

  /* ── 4. Adjudicación y pedidos ── */
  const award = await dp.evaluate(() => { const a = {}; ['h1', 'h2', 'h4', 'h5', 'h6', 'h7'].forEach(id => { a[id] = 'sur'; }); return L.award('r-0141', a, { skipApproval: true }); });
  expect(award.ok && award.orders.length === 1, 'adjudicación a Sur emite 1 pedido');
  const oid = award.orders[0].id;
  const won = await open('d-prov-oferta.html?r=r-0141', { keepState: true });
  expect(await won.isVisible('text=Te adjudicaron 6 de 7') && !(await won.isVisible('[data-act="edit"]')), 'oferta adjudicada: resultado visible y ya no se edita');
  await shot(won, 'oferta-adjudicada');
  const inbox2 = await open('d-prov-solicitudes.html', { keepState: true });
  expect(await inbox2.isVisible('text=Adjudicada a mí'), 'bandeja: resultado adjudicada a mí');

  const op = await open('d-prov-pedidos.html?o=' + oid, { keepState: true });
  expect(!(await op.evaluate(() => document.body.innerText.includes('compras@tablerosandes.example'))), 'pedido: contacto oculto antes de confirmar');
  await confidential(op, 'pedido'); await shot(op, 'pedido-por-responder');
  await shot(await narrow('d-prov-pedidos.html?o=' + oid), 'pedido-390');
  await op.click('[data-confirm]'); await op.waitForTimeout(100); await shot(op, 'pedido-confirmar-dialogo', false);
  await op.click('dialog .btn-primary'); await op.waitForTimeout(200);
  const txt = await op.evaluate(() => document.body.innerText);
  expect(txt.includes('compras@tablerosandes.example') && txt.includes('Martín Ruiz'), 'pedido: contacto real de Compras tras confirmar');
  expect(!(await op.isVisible('[data-confirm]')), 'pedido: ya no se puede responder');
  const second = await op.evaluate(oid => L.respondOrder(oid, 'REJECTED', 'x'), oid);
  expect(second.ok === false && (await op.evaluate(oid => L.store.get().orders.find(o => o.id === oid).status, oid)) === 'CONFIRMED', 'pedido: segundo intento rechazado');
  await shot(op, 'pedido-confirmado');
  const opdf = await download(op, () => op.click('[data-pdf]'));
  expect(opdf.text.startsWith('%PDF') && opdf.text.includes(award.orders[0].code) && opdf.text.includes('compras@tablerosandes.example'), 'PDF de pedido con código y contacto');

  // Rechazo de otro pedido (ejemplos creados con el flujo de dominio)
  const ex = await open('d-prov-solicitudes.html?demo=ejemplos', { keepState: true }); await ex.waitForTimeout(300);
  await shot(ex, 'solicitudes-con-ejemplos');
  await ex.click('[data-f="cerradas"]'); await shot(ex, 'solicitudes-filtro-cerradas');
  await ex.fill('#q', 'zzz'); expect(await ex.isVisible('text=Ninguna solicitud con este filtro'), 'bandeja: vacío por búsqueda'); await shot(ex, 'solicitudes-sin-resultados');
  const sent = await ex.evaluate(() => L.store.get().orders.filter(o => o.supplierId === 'sur' && o.status === 'SENT').map(o => o.id));
  expect(sent.length === 2, 'ejemplos: 2 pedidos para responder');
  const rp = await open('d-prov-pedidos.html?o=' + sent[0], { keepState: true });
  await rp.click('[data-reject]'); await rp.click('dialog .btn-danger'); await rp.waitForTimeout(100);
  expect(await rp.isVisible('dialog .field-err'), 'rechazo: motivo obligatorio');
  await shot(rp, 'pedido-rechazar-dialogo', false);
  await rp.selectOption('#rr', 'Me quedé sin stock'); await rp.click('dialog .btn-danger'); await rp.waitForTimeout(200);
  const rej = await rp.evaluate(id => L.store.get().orders.find(o => o.id === id), sent[0]);
  expect(rej.status === 'REJECTED' && rej.reason === 'Me quedé sin stock', 'rechazo registrado con motivo');
  expect(!(await rp.evaluate(() => document.body.innerText.includes('compras@tablerosandes.example'))), 'rechazo: sin contacto');
  await shot(rp, 'pedido-rechazado');
  await shot(await open('d-prov-inicio.html', { keepState: true }), 'inicio-con-actividad');
  await shot(await open('d-prov-pedidos.html?estado=vacio'), 'pedidos-vacio');
  await shot(await open('d-prov-pedidos.html?estado=error'), 'pedidos-error');
  await shot(await open('d-prov-oferta.html?estado=cargando'), 'oferta-cargando');
  await shot(await open('d-prov-oferta.html?estado=error'), 'oferta-error');

  /* ── 5. Móvil ── */
  const m = await open('m-prov-oferta.html?r=r-0141');
  await m.click('[data-start]'); await m.waitForTimeout(150); await shot(m, 'm-oferta-prefill');
  await m.fill('#p-h1', '0'); await m.click('[data-send]'); await m.waitForTimeout(150);
  expect(await m.isVisible('#errsum') && await m.evaluate(() => L.offer('r-0141', 'sur').status) === 'BORRADOR', 'móvil: precio 0 bloquea el envío');
  await shot(m, 'm-oferta-error');
  await m.fill('#p-h1', '1100000'); await m.click('[data-all]');
  await m.click('[data-line="h7"] [data-stock="NO"]'); await m.selectOption('#nq-h7', 'No trabajo ese material');
  await m.click('[data-send]'); await m.waitForTimeout(200);
  const mo = await m.evaluate(() => L.offer('r-0141', 'sur'));
  expect(mo.status === 'ENVIADA' && mo.lines[0].unitPrice === 1100000 && mo.lines.find(l => l.lineId === 'h7').mode === 'SIN_OFERTA' && mo.lines.filter(l => l.mode !== 'SIN_OFERTA').every(l => l.stock === 'CONFIRMADO'), 'móvil: oferta enviada con stock confirmado y una línea sin cotizar');
  await confidential(m, 'móvil oferta'); await shot(m, 'm-oferta-enviada');
  const mi = await open('m-prov-inicio.html'); await shot(mi, 'm-inicio');
  const mp = await open('m-prov-pedidos.html?demo=ejemplos'); await mp.waitForTimeout(400);
  expect(await mp.isVisible('[data-ok]'), 'móvil pedidos: pedido para responder'); await shot(mp, 'm-pedidos');
  await mp.click('[data-ok]'); await mp.click('dialog .btn-primary'); await mp.waitForTimeout(200);
  expect(await mp.isVisible('text=compras@tablerosandes.example'), 'móvil pedidos: confirmado muestra contacto'); await shot(mp, 'm-pedidos-confirmado');
  await shot(await open('m-prov-pedidos.html'), 'm-pedidos-vacio');
});
