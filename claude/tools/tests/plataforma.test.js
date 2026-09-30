/* Suite del área «plataforma»: d-asistentes, d-automatizaciones, d-cuenta. node tools/tests/plataforma.test.js */
const { run } = require('../pw');

run('plataforma', async ({ open: rawOpen, shot: rawShot, expect, download, log }) => {
  const open = (rel, o = {}) => rawOpen(rel, Object.assign({ height: 1024 }, o));
  /* Captura sin los toasts acumulados de los pasos anteriores (tapan contenido). */
  const shot = async (p, name) => { await p.evaluate(() => { const t = document.getElementById('toasts'); if (t) t.innerHTML = ''; }); await rawShot(p, name); };
  const confirmDlg = async (p, label) => { await p.click(`dialog.dlg button:has-text("${label}")`); await p.waitForTimeout(150); };
  const lastAnswer = p => p.locator('.msg-a').last();

  /* ───────── Asistentes ───────── */
  let p = await open('d-asistentes.html?p=p1');
  expect(await p.isVisible('.aitag') && await p.isVisible('.sim'), 'asistentes: etiquetas IA y simulación');

  // Revisión: bloqueos = L.blockers
  await p.click('[data-intent="rev-bloqueos"]'); await p.waitForTimeout(150);
  const bl = await p.evaluate(() => L.blockers('p1').map(b => b.text));
  let txt = await lastAnswer(p).innerText();
  expect(bl.every(t => txt.includes(t)), 'revisión: cita cada bloqueo de L.blockers (' + bl.join(' | ') + ')');
  expect(await lastAnswer(p).locator('.msg-src a').count() >= 2, 'revisión: cita fuentes con enlaces');
  expect(/USD 0,02/.test(txt), 'revisión: muestra costo estimado');
  const led1 = await p.evaluate(() => L.store.get().ai.ledger[0]);
  expect(led1.kind === 'Asistente' && led1.usd === 0.02 && led1.projectId === 'p1', 'revisión: la consulta queda en el registro de IA');

  // Acción no confirmada no ejecuta
  const actBtn = lastAnswer(p).locator('.act:has-text("Diferencial 2P") button:has-text("Revisar y aplicar")');
  await actBtn.click(); await p.waitForTimeout(150);
  expect(await p.isVisible('dialog.dlg'), 'acción: pide confirmación explícita');
  await shot(p, 'asistentes-confirmar');
  await confirmDlg(p, 'Cancelar');
  expect(await p.evaluate(() => L.line('b9').brand) === null, 'acción cancelada: b9 sigue sin marca');
  // Acción confirmada ejecuta
  await lastAnswer(p).locator('.act:has-text("Diferencial 2P") button:has-text("Revisar y aplicar")').click(); await p.waitForTimeout(150);
  await confirmDlg(p, 'Definir marca');
  expect(await p.evaluate(() => L.line('b9').brand) === 'Schneider', 'acción confirmada: b9 queda con marca Schneider');
  expect(await p.isVisible('.act.done'), 'acción: se marca como aplicada');
  expect(await p.evaluate(() => L.store.get().activity[0].text.includes('asistente')), 'acción: queda en la actividad');
  await shot(p, 'asistentes-revision-1440');
  await p.setViewportSize({ width: 1024, height: 900 }); await shot(p, 'asistentes-revision-1024'); await p.setViewportSize({ width: 1440, height: 1024 });

  // Estimación: margen con validez 15 días = L.budget override
  await p.click('#tab-estimacion'); await p.click('[data-intent="est-margen"]'); await p.waitForTimeout(150);
  const bud = await p.evaluate(() => { const b = L.budget('p1', { validityDays: 15 }); return { pad: L.ars(b.profitAfterDrift), drift: L.ars(b.driftRisk), price: L.ars(b.price) }; });
  txt = await lastAnswer(p).innerText();
  expect(txt.includes(bud.pad) && txt.includes(bud.drift) && txt.includes(bud.price), 'estimación: margen a 15 días coincide con L.budget (' + bud.pad + ')');
  await shot(p, 'asistentes-estimacion-1440');

  // Compras: más barata = L.allocate/allocationSummary
  await p.click('#tab-compras'); await p.click('[data-intent="com-barata"]'); await p.waitForTimeout(150);
  const cmp = await p.evaluate(() => { const s = L.allocationSummary('r-0141', L.allocate('r-0141', 'BARATO')); return { total: L.ars(s.total), norte: L.ars(L.offerTotal(L.offer('r-0141', 'norte'))) }; });
  txt = await lastAnswer(p).innerText();
  expect(txt.includes('SC-0141') && txt.includes(cmp.total) && txt.includes(cmp.norte), 'compras: más barata en SC-0141 coincide con L.compare (' + cmp.total + ')');
  await shot(p, 'asistentes-compras-1440');

  // Catálogo: alternativa sugerida → aprobar equivalencia
  await p.click('#tab-catalogo'); await p.click('[data-intent="cat-alternativas"]'); await p.waitForTimeout(150);
  txt = await lastAnswer(p).innerText();
  expect(txt.includes('CHI-NXM-250-N') && /igual/.test(txt), 'catálogo: compara atributos de la alternativa');
  await lastAnswer(p).locator('button:has-text("Revisar y aplicar")').first().click(); await p.waitForTimeout(150);
  await confirmDlg(p, 'Aprobar equivalencia');
  expect(await p.evaluate(() => L.offer('r-0141', 'norte').lines.find(l => l.lineId === 'h1').alt.equivalence) === 'APROBADA', 'catálogo: equivalencia aprobada en el store');
  await shot(p, 'asistentes-catalogo-1440');
  await p.setViewportSize({ width: 1024, height: 900 }); await shot(p, 'asistentes-catalogo-1024');

  // Texto libre desconocido
  await p.fill('#q', '¿Cuál es la capital de Francia?'); await p.press('#q', 'Enter'); await p.waitForTimeout(150);
  txt = await lastAnswer(p).innerText();
  expect(txt.includes('No sé responder eso con los datos de la obra') && /sin costo/i.test(txt), 'texto libre desconocido: respuesta honesta sin costo');
  expect(await lastAnswer(p).locator('.chip').count() >= 2, 'texto libre desconocido: ofrece sugerencias');
  // Texto libre con intención
  await p.fill('#q', 'que marcas equivalen para b12'); await p.press('#q', 'Enter'); await p.waitForTimeout(150);
  expect((await lastAnswer(p).innerText()).includes('Térmica 2P · 20 A'), 'texto libre: detecta intención y línea por palabras clave');
  // Persistencia de la conversación
  await p.reload(); await p.waitForTimeout(400);
  expect(await p.locator('.msg-u').count() >= 3, 'conversación persiste tras recargar');

  // Presupuesto agotado
  const lim = await open('d-asistentes.html?p=p1', { keepState: true });
  await lim.evaluate(() => L.store.update(s => { s.ai.monthlyBudgetUSD = Math.floor(L.aiSpent() * 100) / 100; s.ai.hardLimit = true; }));
  await lim.reload(); await lim.waitForTimeout(400);
  expect(await lim.evaluate(() => !L.aiCan(0.01)), 'límite: L.aiCan es falso');
  expect(await lim.isVisible('text=Llegaste al tope de IA del mes') && await lim.isDisabled('#send') && await lim.isDisabled('#sugg .chip >> nth=0'), 'límite: asistente deshabilitado');
  expect(await lim.locator('.note-err a').count() >= 2, 'límite: ofrece caminos manuales');
  const before = await lim.evaluate(() => L.store.get().ai.ledger.length);
  await lim.evaluate(() => { document.getElementById('q').disabled = false; document.getElementById('q').value = 'qué bloquea la cotización'; document.getElementById('ask').requestSubmit(); });
  await lim.waitForTimeout(150);
  expect((await lastAnswer(lim).innerText()).includes('No respondí para no pasar el tope') && await lim.evaluate(() => L.store.get().ai.ledger.length) === before, 'límite: se niega y no cobra');
  await shot(lim, 'asistentes-limite-1440');

  // IA no disponible
  const na = await open('d-asistentes.html?p=p1&estado=ia-no-disponible');
  expect(await na.isVisible('text=El servicio de IA no responde') && await na.isVisible('text=No se perdió nada') && await na.isDisabled('#send'), 'ia-no-disponible: mensaje y entrada deshabilitada');
  await shot(na, 'asistentes-no-disponible-1440');
  await na.setViewportSize({ width: 1024, height: 900 }); await shot(na, 'asistentes-no-disponible-1024');

  // Proponer recordatorio → correo simulado
  const rc = await open('d-asistentes.html?p=p2&a=compras&q=com-pendientes');
  await rc.waitForTimeout(200);
  await lastAnswer(rc).locator('button:has-text("Revisar y aplicar")').click(); await rc.waitForTimeout(100); await confirmDlg(rc, 'Mandar recordatorio');
  expect(await rc.evaluate(() => L.store.get().outbox[0].to === 'ventas@sur-electrica.example'), 'compras: recordatorio confirmado genera correo simulado');

  /* ───────── Automatizaciones ───────── */
  const a = await open('d-automatizaciones.html');
  expect(await a.isVisible('text=cada obra tiene un solo dueño'), 'equipo: aclara dueño único en producción');
  await a.click('button:has-text("Enviar invitación")');
  expect(await a.locator('.field-err').count() === 3, 'invitar: valida los tres campos vacíos');
  await a.fill('#inv-name', 'Sofía Paz'); await a.fill('#inv-mail', 'sofia@@x'); await a.selectOption('#inv-area', 'Compras');
  await a.click('button:has-text("Enviar invitación")');
  expect(await a.isVisible('text=El correo no parece válido') && await a.evaluate(() => L.store.get().team.length) === 3, 'invitar: correo inválido no agrega');
  await a.fill('#inv-mail', 'compras@tablerosandes.example'); await a.click('button:has-text("Enviar invitación")');
  expect(await a.isVisible('text=Esa persona ya está en el equipo'), 'invitar: rechaza duplicado');
  await a.fill('#inv-mail', 'sofia@tablerosandes.example'); await a.click('button:has-text("Enviar invitación")'); await a.waitForTimeout(150);
  const team = await a.evaluate(() => L.store.get().team);
  expect(team.length === 4 && team[3].email === 'sofia@tablerosandes.example' && team[3].area === 'Compras', 'invitar: agrega a s.team');
  expect(await a.evaluate(() => L.store.get().outbox[0].to) === 'sofia@tablerosandes.example', 'invitar: correo de invitación simulado');
  await a.selectOption('[data-role-p="p2"][data-role-u="u-martin"]', 'LECTURA'); await a.waitForTimeout(100);
  expect(await a.evaluate(() => L.store.get().ui.plataforma.roles.p2['u-martin']) === 'LECTURA', 'acceso por obra: se guarda');
  await shot(a, 'auto-equipo-1440'); await a.setViewportSize({ width: 1024, height: 900 }); await shot(a, 'auto-equipo-1024'); await a.setViewportSize({ width: 1440, height: 1024 });

  // Comentarios: responder y resolver
  await a.click('#tab-comentarios');
  await a.fill('#rp-c1', 'Confirmado con el unifilar: 300 mA.'); await a.click('[data-reply="c1"] button[type=submit]'); await a.waitForTimeout(150);
  expect(await a.evaluate(() => L.store.get().comments.some(c => c.replyTo === 'c1' && c.text.includes('300 mA'))), 'comentarios: respuesta con L.addComment');
  await a.click('[data-resolve="c1"]'); await a.waitForTimeout(100);
  expect(await a.evaluate(() => L.store.get().comments.find(c => c.id === 'c1').resolved) === true, 'comentarios: resolver marca resolved');
  await shot(a, 'auto-comentarios-1440');
  await a.click('[data-cmf="resueltos"]'); await shot(a, 'auto-comentarios-resueltos-1440');

  // Aprobaciones
  await a.click('#tab-aprobaciones'); await a.click('[data-sample-ap]'); await a.waitForTimeout(150);
  const apId = await a.evaluate(() => L.store.get().approvals[0].id);
  await a.click(`[data-decide="${apId}"] [data-dec="RECHAZADA"]`);
  expect(await a.isVisible('text=Contale a Compras por qué la rechazás'), 'aprobación: rechazo exige nota');
  await shot(a, 'auto-aprobaciones-1440');
  await a.click(`[data-decide="${apId}"] [data-dec="APROBADA"]`); await a.waitForTimeout(100); await confirmDlg(a, 'Aprobar');
  const ap = await a.evaluate(id => L.store.get().approvals.find(x => x.id === id), apId);
  expect(ap.status === 'APROBADA' && ap.decidedAt, 'aprobación: L.decideApproval deja APROBADA en el store');
  await shot(a, 'auto-aprobaciones-decidida-1440');

  // Reglas: umbral
  await a.click('#tab-reglas');
  await a.fill('#thr', 'mucho'); await a.click('[data-thr] button');
  expect(await a.isVisible('text=Escribí un monto en pesos'), 'umbral: texto no numérico rechazado');
  await a.fill('#thr', '5000'); await a.click('[data-thr] button');
  expect(await a.isVisible('text=El mínimo es ARS 100.000') && await a.evaluate(() => L.store.get().automations.find(x => x.id === 'au4').threshold) === 30000000, 'umbral: menor al mínimo rechazado y no cambia');
  await a.fill('#thr', '25.000.000'); await a.click('[data-thr] button'); await a.waitForTimeout(100);
  expect(await a.evaluate(() => L.store.get().automations.find(x => x.id === 'au4').threshold) === 25000000, 'umbral: 25.000.000 guardado');
  // Toggle
  await a.click('[data-toggle="au3"]'); await a.waitForTimeout(100);
  expect(await a.evaluate(() => L.store.get().automations.find(x => x.id === 'au3').enabled) === true, 'regla: toggle enciende');
  // Nueva regla
  await a.click('#new-rule button[type=submit]');
  expect(await a.locator('#new-rule .field-err').count() === 2, 'nueva regla: valida campos');
  await a.selectOption('#nr-when', 'PEDIDO_RECHAZADO'); await a.selectOption('#nr-area', 'Dirección'); await a.selectOption('#nr-ch', 'mail');
  await a.click('#new-rule button[type=submit]'); await a.waitForTimeout(100);
  const nr = await a.evaluate(() => L.store.get().automations.find(x => x.custom));
  expect(nr && nr.when === 'PEDIDO_RECHAZADO' && nr.area === 'Dirección' && nr.enabled, 'nueva regla: guardada en s.automations');
  const nOut = await a.evaluate(() => L.store.get().outbox.length);
  await a.click(`[data-test="${nr.id}"]`); await a.waitForTimeout(150);
  const out = await a.evaluate(() => L.store.get().outbox);
  expect(out.length === nOut + 1 && out[0].to === 'daniel@tablerosandes.example' && out[0].subject.startsWith('[Prueba]'), 'probar regla: produce correo en el outbox');
  expect(await a.isVisible('.test-out'), 'probar regla: muestra el resultado');
  await shot(a, 'auto-reglas-1440'); await a.setViewportSize({ width: 1024, height: 900 }); await shot(a, 'auto-reglas-1024'); await a.setViewportSize({ width: 1440, height: 1024 });
  // Actividad filtrable
  await a.click('#tab-actividad'); await a.selectOption('#act-f', 'p2'); await a.waitForTimeout(100);
  const act = await a.evaluate(() => ({ shown: document.querySelectorAll('.feed-i').length, p2: L.store.get().activity.filter(x => x.projectId === 'p2').length }));
  expect(act.shown === act.p2 && act.shown > 0, 'actividad: filtro por obra (' + act.shown + ')');
  await shot(a, 'auto-actividad-1440');
  await a.click('#tab-correos');
  expect(await a.isVisible('text=Ningún correo sale de este prototipo'), 'correos: aviso de simulación');
  await shot(a, 'auto-correos-1440'); await a.setViewportSize({ width: 1024, height: 900 }); await shot(a, 'auto-correos-1024');
  // Teclado en pestañas
  await a.focus('#tab-correos'); await a.keyboard.press('ArrowLeft');
  expect(await a.evaluate(() => document.activeElement.id) === 'tab-actividad', 'teclado: flechas entre pestañas');

  /* ───────── Cuenta (ingeniería) ───────── */
  const c = await open('d-cuenta.html');
  const usage = await c.evaluate(() => document.querySelector('[data-k="used"]').textContent);
  const expUsed = await c.evaluate(() => L.store.get().plans.filter(p => (p.status === 'COMPLETED' || p.status === 'STALE') && !p.deleted).reduce((a, p) => a + (p.multiplier || 1), 0));
  expect(usage.startsWith(expUsed + ' de 40'), 'plan: uso computado de planos procesados (' + usage + ')');
  expect(await c.isVisible('text=Precios hipotéticos a validar'), 'plan: precios hipotéticos rotulados');
  await shot(c, 'cuenta-plan-1440'); await c.setViewportSize({ width: 1024, height: 900 }); await shot(c, 'cuenta-plan-1024'); await c.setViewportSize({ width: 1440, height: 1024 });
  await c.click('[data-plan="Planta"]'); await c.waitForTimeout(100); await confirmDlg(c, 'Cancelar');
  expect(await c.evaluate(() => L.store.get().billing.engineer.plan) === 'Estudio', 'cambiar plan: cancelar no cambia');
  await c.click('[data-plan="Planta"]'); await c.waitForTimeout(100); await confirmDlg(c, 'Cambiar a Planta');
  await c.reload(); await c.waitForTimeout(400);
  expect(await c.evaluate(() => L.store.get().billing.engineer.plan) === 'Planta' && (await c.textContent('[data-k="plan"]')) === 'Planta', 'cambiar plan: persiste tras recargar');
  // Medio de pago
  await c.fill('#pay-holder', 'Lucía Ferreyra'); await c.fill('#pay-num', '4111 1111 1111 1112'); await c.fill('#pay-exp', '13/30'); await c.fill('#pay-cvc', '1');
  await c.click('#pay button[type=submit]');
  expect(await c.locator('#pay .field-err').count() === 3 && !(await c.evaluate(() => (L.store.get().ui.plataforma || {}).payment)), 'medio de pago: valida y no guarda');
  await c.fill('#pay-num', '4111 1111 1111 1111'); await c.fill('#pay-exp', '12/28'); await c.fill('#pay-cvc', '123'); await c.click('#pay button[type=submit]'); await c.waitForTimeout(100);
  expect(await c.evaluate(() => L.store.get().ui.plataforma.payment.last4) === '1111', 'medio de pago: guarda solo últimos 4');
  // Factura PDF
  const pdf = await download(c, () => c.click('[data-inv="F-0008"]'));
  const pt = pdf.buf.toString('latin1');
  expect(pt.startsWith('%PDF-1.4') && pt.trim().endsWith('%%EOF') && pt.includes('F-0008') && pt.includes('157,50'), 'factura: PDF válido con número e importe (' + pdf.size + ' B)');
  // Uso de IA
  await c.click('#tab-ia'); await c.waitForTimeout(100);
  const st = await c.evaluate(() => L.usd(L.aiState().spent));
  expect((await c.textContent('[data-k="spent"]')) === st, 'IA: total del mes = L.aiState (' + st + ')');
  await shot(c, 'cuenta-ia-1440'); await c.setViewportSize({ width: 1024, height: 900 }); await shot(c, 'cuenta-ia-1024'); await c.setViewportSize({ width: 1440, height: 1024 });
  await c.selectOption('#f-kind', 'Detección'); await c.waitForTimeout(100);
  const nDet = await c.evaluate(() => L.store.get().ai.ledger.filter(e => e.kind === 'Detección').length);
  expect(await c.locator('#ledger tbody tr').count() === nDet, 'IA: filtro por tipo');
  const csv = await download(c, () => c.click('#csv'));
  const lines = csv.text.replace(/^﻿/, '').trim().split(/\r\n/);
  expect(lines[0] === 'Fecha;Tipo;Obra;Detalle;Costo USD' && lines.length === nDet + 1 && lines.slice(1).every(l => l.split(';')[1] === 'Detección') && csv.text.includes('1,02'), 'IA: CSV con filtro y decimales ES (' + (lines.length - 1) + ' filas)');
  await c.fill('#ai-budget', '0'); await c.click('#ai-form button[type=submit]');
  expect(await c.isVisible('text=El presupuesto tiene que ser mayor a 0') && await c.evaluate(() => L.store.get().ai.monthlyBudgetUSD) === 40, 'IA: presupuesto 0 rechazado');
  await c.fill('#ai-budget', '60'); await c.fill('#ai-alert', '70'); await c.click('#ai-form button[type=submit]'); await c.waitForTimeout(100);
  expect(await c.evaluate(() => { const a = L.store.get().ai; return a.monthlyBudgetUSD === 60 && a.alertAtPct === 70; }), 'IA: presupuesto y aviso guardados');
  // Estado del servicio
  await c.click('#tab-estado'); await c.waitForTimeout(100);
  const p50 = await c.evaluate(() => { const d = L.store.get().plans.filter(p => p.durationS).map(p => p.durationS).sort((a, b) => a - b); return d[Math.ceil(d.length / 2) - 1] + ' s'; });
  expect((await c.textContent('[data-k="p50"]')) === p50, 'estado: p50 computado de durationS (' + p50 + ')');
  await shot(c, 'cuenta-estado-1440');
  const dg = await open('d-cuenta.html?tab=estado&estado=degradado');
  expect(await dg.isVisible('text=La detección está lenta') && (await dg.textContent('[data-svc="Detección de símbolos"]')).includes('Degradado'), 'estado degradado: detección degradada con guía');
  await shot(dg, 'cuenta-estado-degradado-1440'); await dg.setViewportSize({ width: 1024, height: 900 }); await shot(dg, 'cuenta-estado-degradado-1024');
  // Perfil
  await c.click('#tab-perfil');
  await c.fill('#pf-mail', 'lucia@'); await c.click('#profile button[type=submit]');
  expect(await c.isVisible('#profile .field-err'), 'perfil: valida correo');
  await c.fill('#pf-mail', 'lucia.f@tablerosandes.example'); await c.fill('#pf-name', 'Lucía Ferreyra Paz'); await c.click('#profile button[type=submit]'); await c.waitForTimeout(100);
  expect(await c.evaluate(() => L.member('u-lucia').email === 'lucia.f@tablerosandes.example' && L.member('u-lucia').name === 'Lucía Ferreyra Paz'), 'perfil: guarda nombre y correo');
  await c.fill('#del-conf', 'eliminar'); await c.click('#del button[type=submit]');
  expect(await c.isVisible('text=Escribí ELIMINAR, en mayúsculas'), 'baja: exige ELIMINAR');
  await c.fill('#del-conf', 'ELIMINAR'); await c.click('#del button[type=submit]'); await c.waitForTimeout(150);
  expect(await c.isVisible('text=Qué pasaría con la baja') && await c.evaluate(() => !!L.member('u-lucia')), 'baja: solo muestra qué pasaría, no borra');
  await shot(c, 'cuenta-perfil-baja-1440');
  await c.click('dialog.dlg button:has-text("Entendido")');
  await shot(c, 'cuenta-perfil-1440'); await c.setViewportSize({ width: 1024, height: 900 }); await shot(c, 'cuenta-perfil-1024');

  /* ───────── Cuenta (distribuidor) ───────── */
  const s = await open('d-cuenta.html?rol=prov');
  const fee = await s.evaluate(() => { const b = L.store.get().billing.supplier; return L.usd(Math.max(0, b.leadsThisMonth - b.leadsFree) * b.leadFeeUSD); });
  expect((await s.textContent('[data-k="fee"]')) === fee && fee === 'USD 16,00', 'proveedor: comisión por lead del mes (' + fee + ')');
  expect(await s.isVisible('text=Lo que le pagás a liard (suscripción y leads) ≠ el pago de los materiales, que acordás directamente con tu cliente fuera de liard'), 'proveedor: separación de pagos explícita');
  expect(await s.evaluate(() => document.querySelector('.nav-i.on') && document.querySelector('.nav-i.on').textContent.includes('Plan, uso y cuenta') && L.role() === 'SUPPLIER'), 'proveedor: shell de distribuidor');
  await shot(s, 'cuenta-prov-plan-1440'); await s.setViewportSize({ width: 1024, height: 900 }); await shot(s, 'cuenta-prov-plan-1024'); await s.setViewportSize({ width: 1440, height: 1024 });
  const sp = await download(s, () => s.click('[data-sup-pdf]'));
  expect(sp.buf.toString('latin1').startsWith('%PDF') && sp.buf.toString('latin1').includes('136,00'), 'proveedor: detalle del mes en PDF (USD 136,00)');
  await s.click('#tab-ia'); await shot(s, 'cuenta-prov-ia-1440');
  await s.click('#tab-perfil'); await shot(s, 'cuenta-prov-perfil-1440');
  log('listo');
});
