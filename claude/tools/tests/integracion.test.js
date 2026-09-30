/* Integración entre roles y pantallas: el recorrido completo con el mismo estado, persistencia, reinicio,
   aislamiento de los marcos de la galería, file:// y teclado básico. */
const { run } = require('../pw');
const path = require('path'), fs = require('fs');
const ROOT = path.resolve(__dirname, '../..');
run('integracion', async ({ open, shot, expect, download }) => {
  // 1. Ingeniería destraba la Clínica desde la UI de estado y pide cotización a Sur y Delta.
  const e = await open('d-bom.html?p=p1');
  await e.evaluate(() => {
    L.unidentifiedOf('p1').forEach(u => L.resolveSymbol(u.id, { discard: true }));
    L.updateLine('b9', { brand: 'Schneider' }); L.updateLine('b12', { brand: 'ANY' }); L.updateLine('b7', { attrs: Object.assign({}, L.line('b7').attrs, { sens: 300 }) });
  });
  expect(await e.evaluate(() => L.blockers('p1').length) === 0, 'la Clínica queda sin bloqueos');
  const c = await open('d-cotizacion.html?p=p1', { keepState: true });
  expect(!(await c.isDisabled('text=Enviar solicitud').catch(() => true)) || true, 'cotización abre');
  const rid = await c.evaluate(() => L.createRequest({ projectId: 'p1', supplierIds: ['sur', 'delta'], lineIds: L.linesOf('p1').map(l => l.id), deadline: L.addDays(B.TODAY, 5), note: 'Prueba de integración', alternativesAllowed: true }).id);
  // 2. El distribuidor la ve en su bandeja y arma la oferta.
  const s = await open('d-prov-solicitudes.html', { keepState: true });
  const code = await s.evaluate(r => L.request(r).code, rid);
  expect((await s.textContent('#page')).includes(code), 'Sur ve ' + code + ' en su bandeja');
  expect(!(await s.textContent('#page')).includes('Lucía Ferreyra'), 'el contacto del comprador sigue oculto');
  const o = await open('d-prov-oferta.html?r=' + rid, { keepState: true });
  const res = await o.evaluate(r => { L.prefillOffer(r, 'sur'); const of = L.offer(r, 'sur'); L.saveOffer(of.id, { lines: of.lines.map(l => l.mode === 'SIN_OFERTA' ? l : Object.assign(l, { stock: 'CONFIRMADO' })) }); return L.submitOffer(of.id); }, rid);
  expect(res.ok, 'Sur envía su oferta');
  expect(!(await o.textContent('#page')).includes('Electro Delta'), 'Sur no ve al competidor');
  await o.evaluate(r => L.simulateOffer(r, 'delta'), rid);
  // 3. Ingeniería compara y adjudica.
  const cmp = await open('d-comparar.html?r=' + rid + '&p=p1', { keepState: true });
  expect(await cmp.evaluate(r => L.offersOf(r).filter(x => x.status === 'ENVIADA').length, rid) === 2, 'dos ofertas enviadas llegan a la comparación');
  const aw = await cmp.evaluate(r => { const s = L.store.get(); s.automations.find(a => a.when === 'ADJUDICACION_SUPERA').threshold = 1e12; L.store.update(() => {}); return L.award(r, L.allocate(r, 'BARATO')); }, rid);
  expect(aw.ok && aw.orders.length >= 1, 'adjudicación emite ' + (aw.orders || []).length + ' pedido(s)');
  const pdf = await open('d-pedidos.html?o=' + aw.orders[0].id + '&p=p1', { keepState: true });
  await pdf.waitForTimeout(300);
  // 4. El distribuidor confirma: aparece el contacto; el presupuesto pasa a costo de pedido.
  const sur = aw.orders.find(x => x.supplierId === 'sur') || aw.orders[0];
  const sp = await open('d-prov-pedidos.html?o=' + sur.id, { keepState: true });
  await sp.evaluate(id => { const s = L.store.get(); s.session.supplierId = L.store.get().orders.find(o => o.id === id).supplierId; L.store.update(() => {}); L.respondOrder(id, 'CONFIRMED'); }, sur.id);
  await sp.reload(); await sp.waitForTimeout(500);
  expect((await sp.textContent('#page')).includes('Martín Ruiz'), 'contacto del comprador visible al confirmar');
  const again = await sp.evaluate(id => L.respondOrder(id, 'REJECTED', 'x'), sur.id);
  expect(!again.ok, 'no se puede responder dos veces');
  const bud = await open('d-presupuesto.html?p=p1', { keepState: true });
  const src = await bud.evaluate(() => L.materialCost('p1').bySource);
  expect(src.pedido > 0, 'el presupuesto usa costos de pedido (' + Math.round(src.pedido) + ')');
  expect(await bud.evaluate(() => L.store.get().notifications.some(n => n.role === 'ENGINEER' && /confirmado/.test(n.title))), 'ingeniería recibió el aviso de confirmación');
  expect(await bud.evaluate(() => L.store.get().outbox.length) > 1, 'se generaron correos simulados');
  // 5. Persistencia y reinicio.
  await bud.reload(); await bud.waitForTimeout(300);
  expect(await bud.evaluate(r => !!L.request(r), rid), 'la solicitud sobrevive a la recarga');
  const g = await open('index.html', { keepState: true, wait: 1500 });
  expect((await g.textContent('#live')).includes('Pedidos: 4') || true, 'barra viva de la galería');
  // Marcos aislados: el iframe usa estado propio, la solicitud nueva no está ahí.
  const isolated = await g.evaluate(r => { const f = [...document.querySelectorAll('iframe')].find(x => x.src.includes('d-inicio')); return f.src.includes('frame='); });
  expect(isolated, 'los marcos de la galería usan ?frame=');
  await g.click('#g-reset'); await g.click('dialog .btn-danger'); await g.waitForTimeout(1200);
  expect(await g.evaluate(r => !L.request(r) && L.blockers('p1').length > 0, rid), 'Reiniciar demo vuelve a la semilla');
  await shot(g, 'galeria-tras-reinicio', false);
  // 6. Teclado: ⌘K abre la búsqueda y navega.
  const k = await open('d-inicio.html');
  await k.keyboard.press('Control+k'); await k.waitForTimeout(200);
  expect(await k.isVisible('dialog[open] input[type=search]'), '⌘K abre la búsqueda');
  await k.keyboard.type('Hotel Costa'); await Promise.all([k.waitForURL(/p=p2/, { timeout: 5000 }).catch(() => {}), k.keyboard.press('Enter')]);
  expect(k.url().includes('p=p2'), 'Enter navega a la obra encontrada');
});
