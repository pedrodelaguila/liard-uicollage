/* Tablero 3D (propuesto): render, selección, cámara, explotada, aislar, 2D, descargas, cambio de plano,
   actualización en vivo, móvil y tiempos de cuadro. Correr: node tools/tests/tablero3d.test.js */
const { run } = require('../pw');

/* Píxeles no triviales del lienzo (preserveDrawingBuffer: toDataURL refleja el último cuadro). */
const canvasStats = p => p.evaluate(() => new Promise(res => {
  const c = document.querySelector('.t3-canvas'); if (!c) return res(null);
  const img = new Image(); img.onload = () => { const k = document.createElement('canvas'); k.width = 160; k.height = 120; const x = k.getContext('2d'); x.drawImage(img, 0, 0, 160, 120);
    const d = x.getImageData(0, 0, 160, 120).data; let bright = 0; const colors = new Set(); for (let i = 0; i < d.length; i += 4) { if (d[i] + d[i + 1] + d[i + 2] > 180) bright++; colors.add((d[i] >> 4) + ',' + (d[i + 1] >> 4) + ',' + (d[i + 2] >> 4)); }
    res({ bright, colors: colors.size, len: c.toDataURL('image/png').length }); };
  img.src = c.toDataURL('image/png');
}));
const settle = p => p.waitForTimeout(250);
const top = p => p.evaluate(() => scrollTo(0, 0));

run('tablero3d', async ({ open, shot, expect, log, download }) => {
  /* ── Escritorio: TGBT por defecto ── */
  const p = await open('d-tablero-3d.html?p=p1', { wait: 1200 });
  const s0 = await p.evaluate(() => window.__t3d.state());
  expect(s0.webgl && s0.planId === 'pl-tgbt', 'arranca en el primer plano COMPLETED (TGBT) con WebGL: ' + s0.planId);
  expect(await p.isVisible('text=Modelo conceptual: disposición aproximada derivada del BOM, no un plano de montaje ni un cálculo de gabinete.'), 'leyenda de modelo conceptual visible');
  const cs = await canvasStats(p);
  expect(cs && cs.bright > 1500 && cs.colors > 25, 'el lienzo no está en blanco (' + JSON.stringify(cs) + ')');
  const m0 = await p.evaluate(() => window.__t3d.model());
  expect(m0.items === 45 && m0.enc.H === 2000 && m0.enc.lineId === 'b16', 'TGBT: 45 aparatos (suma de perPlan sin gabinete) y gabinete 2000×800 del BOM');
  const b6 = m0.lines.find(l => l[0] === 'b6'); expect(b6 && b6[1] === 6, 'cantidad por línea = perPlan del plano (b6 ×6)');
  expect(await p.isVisible('.t3-hud-t >> text=× 1 repetición'), 'HUD muestra × repeticiones');
  await top(p); await shot(p, 'desk-cerrado', false);

  /* Clic real sobre un aparato → selecciona su línea */
  const pt = await p.evaluate(() => window.__t3d.screenOf('b1'));
  await p.mouse.click(pt.x, pt.y); await settle(p);
  expect(await p.evaluate(() => window.__t3d.selected()) === 'b1', 'clic en el aparato selecciona la línea b1');
  expect(await p.isVisible('[data-det="b1"] >> text=Interruptor automático en caja moldeada'), 'panel lateral con componente base');
  expect(await p.isVisible('[data-det="b1"] >> text=precio de referencia'), 'panel con precio de referencia');
  const hrefP = await p.getAttribute('[data-det="b1"] a:has-text("Ver en el plano")', 'href');
  const hrefB = await p.getAttribute('[data-det="b1"] a:has-text("Editar en el BOM")', 'href');
  expect(/d-plano\.html\?.*p=p1.*plan=pl-tgbt.*linea=b1/.test(hrefP) && /d-bom\.html\?.*p=p1.*linea=b1/.test(hrefB), 'links con p, plan y linea: ' + hrefP + ' · ' + hrefB);
  expect((await p.evaluate(() => window.__t3d.highlighted())).join() === 'b1', 'en 3D se resalta solo b1');
  expect(await p.getAttribute('.t3-li[data-line="b1"]', 'aria-pressed') === 'true', 'la lista marca b1');

  /* Lista → 3D (varias instancias) */
  await p.click('.t3-li[data-line="b6"]'); await settle(p);
  expect(await p.evaluate(() => window.__t3d.selected()) === 'b6' && (await p.evaluate(() => window.__t3d.highlighted())).join() === 'b6', 'fila de la lista resalta b6 en 3D');
  await top(p); await shot(p, 'desk-seleccion', false);

  /* Tooltip al pasar */
  const pt5 = await p.evaluate(() => window.__t3d.screenOf('b5'));
  await p.mouse.move(pt5.x, pt5.y); await p.waitForTimeout(150); await p.mouse.move(pt5.x + 1, pt5.y); await p.waitForTimeout(250);
  expect(await p.isVisible('[data-t3="tip"] >> text=Térmica'), 'tooltip al pasar el mouse');

  /* Teclado rota y hace zoom */
  const c0 = await p.evaluate(() => window.__t3d.camera());
  await p.focus('.t3-canvas'); await p.keyboard.press('ArrowRight'); await p.keyboard.press('ArrowUp');
  const c1 = await p.evaluate(() => window.__t3d.camera());
  expect(c1.theta !== c0.theta && c1.phi !== c0.phi, 'flechas giran la cámara (theta ' + c0.theta + '→' + c1.theta + ')');
  await p.keyboard.press('+'); const c2 = await p.evaluate(() => window.__t3d.camera()); expect(c2.r < c1.r, 'tecla + acerca');
  await p.keyboard.press('Shift+ArrowLeft'); const c2b = await p.evaluate(() => window.__t3d.camera()); expect(c2b.target.join() !== c2.target.join(), 'Mayús+flecha desplaza');
  await p.keyboard.press('0'); const c3 = await p.evaluate(() => window.__t3d.camera()); expect(c3.theta === c0.theta && c3.r === c0.r, 'tecla 0 vuelve a la vista inicial');
  /* Botones de zoom, rueda, arrastre */
  await p.click('[data-t3="zoom-in"]'); const c4 = await p.evaluate(() => window.__t3d.camera()); expect(c4.r < c3.r, 'botón + acerca');
  await p.click('[data-t3="zoom-out"]'); await p.click('[data-t3="zoom-out"]'); const c5 = await p.evaluate(() => window.__t3d.camera()); expect(c5.r > c4.r, 'botón − aleja');
  const box = await p.locator('.t3-canvas').boundingBox();
  await p.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await p.mouse.wheel(0, -300); await settle(p);
  const c6 = await p.evaluate(() => window.__t3d.camera()); expect(c6.r < c5.r, 'rueda acerca');
  await p.mouse.move(box.x + 200, box.y + 300); await p.mouse.down(); await p.mouse.move(box.x + 320, box.y + 340, { steps: 6 }); await p.mouse.up();
  const c7 = await p.evaluate(() => window.__t3d.camera()); expect(c7.theta !== c6.theta, 'arrastrar gira');
  await p.mouse.move(box.x + 200, box.y + 300); await p.mouse.down({ button: 'right' }); await p.mouse.move(box.x + 300, box.y + 250, { steps: 6 }); await p.mouse.up({ button: 'right' });
  const c8 = await p.evaluate(() => window.__t3d.camera()); expect(c8.target.join() !== c7.target.join() && c8.theta === c7.theta, 'arrastrar con botón derecho desplaza');
  expect(await p.evaluate(() => window.__t3d.selected()) === 'b6', 'girar y desplazar no cambian la selección');
  await p.click('[data-t3="reset"]');

  /* Vista explotada: el control mueve capas en profundidad */
  const L0 = await p.evaluate(() => window.__t3d.layers()); const w0 = await p.evaluate(() => window.__t3d.worldOf('b1'));
  await p.fill('[data-t3="explode"]', '100'); await settle(p);
  const L1 = await p.evaluate(() => window.__t3d.layers()); const w1 = await p.evaluate(() => window.__t3d.worldOf('b1'));
  expect(L1.door > L1.devices && L1.devices > L1.rails && L1.rails > L1.plate && L0.door === 0, 'explotada separa puerta > aparatos > rieles > placa: ' + JSON.stringify(L1));
  expect(w1[2] > w0[2] + 100, 'el aparato b1 se mueve en profundidad (z ' + w0[2] + '→' + w1[2] + ')');
  expect(await p.textContent('[data-t3="explode-out"]') === '100 %', 'la salida del control dice 100 %');
  await p.fill('[data-t3="explode"]', '50'); const Lh = await p.evaluate(() => window.__t3d.layers()); expect(Math.abs(Lh.door - L1.door / 2) <= 1, 'a 50 % el easing deja la puerta en la mitad (' + Lh.door + ')');
  await p.fill('[data-t3="explode"]', '25'); const Lq = await p.evaluate(() => window.__t3d.layers()); expect(Lq.door < L1.door * .25, 'el easing es suave al inicio (25 % → ' + Lq.door + ')');
  await p.fill('[data-t3="explode"]', '100'); await p.evaluate(() => window.__t3d.pick('b1')); await settle(p);
  await top(p); await shot(p, 'desk-explotada', false);
  /* Animación: el botón la lleva de 1 a 0 */
  await p.click('[data-t3="play"]'); await p.waitForTimeout(300);
  const mid = await p.evaluate(() => window.__t3d.state()); expect(mid.animating && mid.explode < 1 && mid.explode > 0, 'Animar recorre la explotada (' + mid.explode.toFixed(2) + ')');
  await p.waitForTimeout(1700); const end = await p.evaluate(() => window.__t3d.state()); expect(!end.animating && end.explode === 0, 'la animación termina cerrada');

  /* Aislar familia */
  await p.click('[data-t3="chips"] [data-fam="Señalización"]'); await settle(p);
  const op = await p.evaluate(() => ({ lamp: window.__t3d.opacityOf('b14'), itm: window.__t3d.opacityOf('b5') }));
  expect(op.lamp === 1 && op.itm < .2, 'aislar Señalización deja fantasma las térmicas (' + JSON.stringify(op) + ')');
  expect((await p.getAttribute('.t3-li[data-line="b5"]', 'class')).includes('ghost'), 'la lista atenúa lo no aislado');
  await top(p); await shot(p, 'desk-aislado', false);
  await p.click('[data-t3="chips"] [data-fam=""]');
  expect(await p.evaluate(() => window.__t3d.opacityOf('b5')) === 1, 'Todas vuelve a mostrar todo');

  /* Descargas */
  await p.evaluate(() => window.__t3d.pick('b6'));
  const png = await download(p, () => p.click('[data-t3="png"]'));
  expect(png.name === 'tablero-tgbt-3d.png' && png.buf.slice(1, 4).toString() === 'PNG' && png.size > 20000, 'PNG 3D real (' + png.name + ', ' + png.size + ' bytes)');
  const csv = await download(p, () => p.click('[data-t3="csv"]'));
  const rows = csv.text.replace(/^﻿/, '').split('\r\n');
  expect(csv.name === 'tablero-tgbt-lista.csv' && /^Tablero;Línea;Familia;Material/.test(rows[0]), 'CSV con encabezado: ' + rows[0].slice(0, 60));
  const r6 = rows.find(r => r.split(';')[1] === 'b6');
  expect(r6 && r6.split(';')[5] === '6' && /Riel/.test(r6), 'CSV: b6 con 6 unidades y riel: ' + r6);
  expect(rows.filter(r => /^TGBT;/.test(r)).length === 11 && csv.text.includes('Modelo conceptual'), 'CSV con las 11 líneas del TGBT y la leyenda');

  /* Vista 2D / tabla con la misma selección */
  await p.click('[data-view="2d"]'); await settle(p);
  expect(await p.isVisible('.t3-svg') && !(await p.isVisible('.t3-canvas')), 'toggle muestra la vista 2D');
  expect(await p.getAttribute('.tbl tr[data-line="b6"]', 'aria-selected') === 'true', 'la tabla conserva la selección (b6)');
  await p.click('.t3-svg g.t3-hit[data-line="b4"]'); await settle(p);
  expect(await p.evaluate(() => window.__t3d.selected()) === 'b4', 'clic en el SVG selecciona b4');
  await p.click('.tbl tr[data-line="b2"]'); expect(await p.evaluate(() => window.__t3d.selected()) === 'b2', 'clic en la tabla selecciona b2');
  await p.focus('.tbl tr[data-line="b3"]'); await p.keyboard.press('Enter'); expect(await p.evaluate(() => window.__t3d.selected()) === 'b3', 'Enter en una fila selecciona b3');
  await shot(p, 'desk-2d', true);
  const png2 = await download(p, () => p.click('[data-t3="png"]'));
  expect(png2.name === 'tablero-tgbt-2d.png' && png2.buf.slice(1, 4).toString() === 'PNG', 'PNG de la vista 2D (' + png2.size + ' bytes)');
  await p.click('[data-view="3d"]');
  expect((await p.evaluate(() => window.__t3d.highlighted())).join() === 'b3', 'al volver a 3D sigue resaltada b3');

  /* Cambio de plano: libera memoria y rearma */
  const memA = await p.evaluate(() => window.__t3d.memory());
  await p.selectOption('[data-t3="plan"]', 'pl-tstipo'); await p.waitForTimeout(400);
  const st2 = await p.evaluate(() => ({ s: window.__t3d.state(), m: window.__t3d.model(), url: location.search }));
  expect(st2.s.planId === 'pl-tstipo' && st2.m.enc.H === 800 && /plan=pl-tstipo/.test(st2.url), 'cambio a TS-P tipo (gabinete 800×600, ?plan en la URL)');
  expect(await p.isVisible('.t3-hud-t >> text=× 4 repeticiones'), 'TS-P tipo muestra × 4 repeticiones');
  expect(st2.s.sel === null, 'el cambio de plano limpia la selección');
  await p.evaluate(() => window.__t3d.pick('b10')); await settle(p);
  expect((await p.textContent('[data-det="b10"] .t3-qty')).replace(/\s+/g, ' ').includes('24'), 'b10: 6 dibujadas × 4 = 24 a comprar');
  await p.selectOption('[data-t3="plan"]', 'pl-tgbt'); await p.waitForTimeout(300);
  const memB = await p.evaluate(() => window.__t3d.memory());
  expect(memB.geometries <= memA.geometries + 2 && memB.textures <= memA.textures + 1, 'sin fugas al cambiar de plano ida y vuelta (' + JSON.stringify(memA) + ' → ' + JSON.stringify(memB) + ')');
  expect(await p.locator('select[data-t3="plan"] option[value="pl-tsb"][disabled]').count() === 1, 'el plano PENDING aparece deshabilitado');

  /* Rendimiento: TGBT y TS-PB (el de más bornes) */
  const benchT = await p.evaluate(() => window.__t3d.bench(60));
  await p.selectOption('[data-t3="plan"]', 'pl-tspb'); await p.waitForTimeout(3500);
  log('frame TGBT', JSON.stringify(benchT));
  /* Tiempo real entre cuadros (rAF) mientras anima la explotada en TS-PB: incluye raster en CPU de swiftshader */
  await p.waitForTimeout(600);
  const fr = await p.evaluate(() => new Promise(res => { const ts = []; let last = 0; const t0 = performance.now(); document.querySelector('[data-t3="play"]').click();
    const tick = t => { if (last) ts.push(t - last); last = t; if (performance.now() - t0 < 1500) requestAnimationFrame(tick); else { ts.sort((a, b) => a - b); res({ frames: ts.length, medianMs: +ts[Math.floor(ts.length / 2)].toFixed(1), p95Ms: +ts[Math.floor(ts.length * .95)].toFixed(1), renders: window.__t3d.state().renders }); } };
    requestAnimationFrame(tick); }));
  log('rAF TS-PB animando', JSON.stringify(fr));
  expect(fr.frames >= 6 && fr.medianMs < 300, 'TS-PB animando sigue respondiendo: ' + fr.frames + ' cuadros en 1,5 s, mediana ' + fr.medianMs + ' ms (swiftshader rasteriza en CPU y varía con la carga; umbral laxo, el número real se registra)');
  await p.waitForTimeout(900); await p.fill('[data-t3="explode"]', '0');
  await p.waitForTimeout(500); const benchP = await p.evaluate(() => window.__t3d.bench(60)); const mP = await p.evaluate(() => window.__t3d.model());
  log('frame TS-PB (' + mP.items + ' aparatos)', JSON.stringify(benchP)); await p.waitForTimeout(3500);
  expect(benchP.calls < 160, 'TS-PB: bornes instanciados, ' + benchP.calls + ' draw calls');
  expect(benchP.avgMs < 16, 'TS-PB: costo de CPU por cuadro (JS + envío) ' + benchP.avgMs + ' ms');
  const idle0 = (await p.evaluate(() => window.__t3d.state())).renders; await p.waitForTimeout(700); const idle1 = (await p.evaluate(() => window.__t3d.state())).renders;
  expect(idle1 === idle0, 'render a demanda: sin cuadros en reposo (' + idle0 + '→' + idle1 + ')');
  await top(p); await shot(p, 'desk-tspb', false);

  /* Actualización en vivo: otra pantalla cambia la marca y la cantidad */
  await p.evaluate(() => window.__t3d.pick('b10'));
  const before = (await p.evaluate(() => window.__t3d.model())).items;
  await p.evaluate(() => { L.updateLine('b10', { brand: 'Chint', perPlan: Object.assign({}, L.line('b10').perPlan, { 'pl-tspb': 10 }) }); });
  await settle(p);
  const after = (await p.evaluate(() => window.__t3d.model())).items;
  expect(after === before + 2 && (await p.textContent('[data-det="b10"]')).includes('Chint'), 'cambio del store se refleja: ' + before + '→' + after + ' aparatos, marca Chint');
  const other = await open('d-tablero-3d.html?p=p1&plan=pl-tspb', { keepState: true, wait: 900 });
  await p.evaluate(() => L.updateLine('b11', { brand: 'ABB' }));
  await other.waitForTimeout(400); await other.evaluate(() => window.__t3d.pick('b11'));
  expect((await other.textContent('[data-det="b11"]')).includes('ABB'), 'otra pestaña (evento storage) ve la marca editada');
  await other.close();

  /* Estados por URL */
  const q = await open('d-tablero-3d.html?p=p1&plan=pl-tde&linea=b4&explotada=60', { wait: 1000 });
  const qs = await q.evaluate(() => window.__t3d.state());
  expect(qs.planId === 'pl-tde' && qs.sel === 'b4' && Math.abs(qs.explode - .6) < .01, 'URL abre plano, línea y explotada (' + JSON.stringify([qs.planId, qs.sel, qs.explode]) + ')');
  expect((await q.evaluate(() => window.__t3d.model())).enc.H === 800, 'TDE toma el gabinete 800×600 de b17');
  const q2 = await open('d-tablero-3d.html?p=p4', { wait: 700 });
  expect(await q2.isVisible('text=Todavía no hay un tablero para armar'), 'obra sin planos: estado vacío con acción');
  await shot(q2, 'desk-vacio', false);
  const q3 = await open('d-tablero-3d.html?p=p1&plan=pl-tsb', { wait: 700 });
  expect(await q3.isVisible('text=está pendiente'), 'plano pendiente explica por qué no se dibuja');
  const q4 = await open('d-tablero-3d.html?p=p2', { wait: 900 });
  await q4.evaluate(() => window.__t3d.pick('h2')); await settle(q4);
  expect(await q4.isVisible('[data-det="h2"] >> text=oferta confirmada') && await q4.isVisible('[data-det="h2"] >> text=Stock confirmado'), 'obra con solicitud: precios ofertados con stock');
  await shot(q4, 'desk-ofertas', false);

  /* Sin WebGL (forzado) → 2D con nota */
  const n = await open('d-tablero-3d.html?p=p1&estado=sin-webgl', { wait: 700 });
  const ns = await n.evaluate(() => window.__t3d.state());
  expect(!ns.webgl && ns.view === '2d' && await n.isVisible('.t3-svg') && await n.isVisible('text=No pudimos iniciar la vista 3D'), 'sin WebGL: vista 2D y nota');
  expect(await n.isDisabled('[data-view="3d"]'), 'el botón Vista 3D queda deshabilitado');
  await n.click('.t3-li[data-line="b1"]'); expect(await n.isVisible('[data-det="b1"]'), 'sin WebGL la selección funciona');
  const csvN = await download(n, () => n.click('[data-t3="csv"]')); expect(csvN.size > 500, 'sin WebGL el CSV funciona');
  await shot(n, 'desk-sin-webgl', false);

  /* Movimiento reducido: no anima */
  const r = await open('d-tablero-3d.html?p=p1', { wait: 900, reducedMotion: 'reduce' });
  await r.click('[data-t3="play"]'); await r.waitForTimeout(60);
  const rs = await r.evaluate(() => window.__t3d.state()); expect(!rs.animating && rs.explode === 1, 'reduced-motion: Animar salta al final sin animar');

  /* ── Móvil ── */
  const m = await open('m-tablero-3d.html?p=p1', { wait: 1200 });
  expect(await m.evaluate(() => document.body.classList.contains('m')) && await m.isVisible('.mtabs'), 'móvil con shell móvil');
  const mc = await canvasStats(m); expect(mc && mc.bright > 800, 'móvil: el lienzo dibuja (' + JSON.stringify(mc) + ')');
  await shot(m, 'movil', false);
  const mp = await m.evaluate(() => window.__t3d.screenOf('b1'));
  await m.touchscreen.tap(mp.x, mp.y); await settle(m);
  expect(await m.evaluate(() => window.__t3d.selected()) === 'b1', 'móvil: tocar el aparato lo selecciona');
  await m.waitForTimeout(500);
  expect(await m.evaluate(() => document.querySelector('.t3-sheet').getBoundingClientRect().top < innerHeight - 100), 'móvil: la hoja inferior sube');
  await shot(m, 'movil-hoja', false);
  await m.click('[data-close]'); await settle(m); expect(await m.evaluate(() => window.__t3d.selected()) === null, 'móvil: cerrar la hoja quita la selección');
  /* Un dedo gira, dos dedos pellizcan (eventos táctiles por CDP) */
  const cdp = await m.context().newCDPSession(m);
  const cb = await m.locator('.t3-canvas').boundingBox(); const cx = cb.x + cb.width / 2, cy = cb.y + cb.height / 2;
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y], i) => ({ x, y, id: i })) });
  const mc0 = await m.evaluate(() => window.__t3d.camera());
  await touch('touchStart', [[cx - 60, cy]]); for (let i = 1; i <= 6; i++) await touch('touchMove', [[cx - 60 + i * 20, cy]]); await touch('touchEnd', []);
  const mc1 = await m.evaluate(() => window.__t3d.camera()); expect(mc1.theta !== mc0.theta, 'móvil: un dedo gira');
  await touch('touchStart', [[cx - 40, cy], [cx + 40, cy]]); for (let i = 1; i <= 6; i++) await touch('touchMove', [[cx - 40 - i * 15, cy], [cx + 40 + i * 15, cy]]); await touch('touchEnd', []);
  const mc2 = await m.evaluate(() => window.__t3d.camera()); expect(mc2.r < mc1.r, 'móvil: pellizcar acerca (' + mc1.r + '→' + mc2.r + ')');
  await m.fill('[data-t3="explode"]', '100'); expect((await m.evaluate(() => window.__t3d.layers())).door > 0, 'móvil: control de explotada');
  await m.click('[data-view="2d"]'); expect(await m.isVisible('.t3-svg'), 'móvil: vista 2D');
  await m.click('[data-view="3d"]'); await m.click('[data-t3="reset"]'); await m.evaluate(() => window.__t3d.pick(null)); await m.waitForTimeout(500);
  await shot(m, 'movil-explotada', false);
  const ms = await open('m-tablero-3d.html?p=p1&estado=sin-webgl', { wait: 600 });
  expect(await ms.isVisible('.t3-svg') && await ms.isVisible('text=No pudimos iniciar la vista 3D'), 'móvil sin WebGL: 2D');
});
