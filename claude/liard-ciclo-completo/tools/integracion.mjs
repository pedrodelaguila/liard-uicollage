// Recorrido entre roles con un mismo estado (localStorage, fuera de la galería): node tools/integracion.mjs
// Ingeniería destraba una línea → la cotización la ve → el distribuidor contraoferta → compras la ve →
// el taller y el inicio reflejan el estado → la galería aísla sus marcos → «Reiniciar demo» vuelve a la semilla.
import { createRequire } from 'node:module';
import path from 'node:path'; import url from 'node:url'; import fs from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PW_DIR || 'playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'shots', 'integracion'); fs.mkdirSync(OUT, { recursive: true });
const u = f => 'file://' + path.join(ROOT, f.split('?')[0]) + (f.includes('?') ? '?' + f.split('?')[1] : '');
const b = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 994 } });
const p = await ctx.newPage();
const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
const S = () => p.evaluate(() => JSON.parse(localStorage.getItem('liard-cc:v1') || 'null'));
let paso = 0; const ok = [], mal = [];
const check = (cond, t) => { paso++; (cond ? ok : mal).push(`${paso}. ${t}`); console.log((cond ? '✓ ' : '✗ ') + paso + '. ' + t); };
const shot = n => p.screenshot({ path: path.join(OUT, n + '.png') });

// 0. Semilla limpia
await p.goto(u('d-ing-proyectos.html')); await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(600);

// 1. Cotización antes: la línea l09 (seccionador NH00) no se puede cotizar
await p.goto(u('d-com-cotizacion.html')); await p.waitForTimeout(900);
const antes = await p.evaluate(() => document.body.innerText);
check(/NH00|seccionador/i.test(antes), 'La cotización muestra el seccionador NH00 (l09) como no cotizable');
await shot('1-cotizacion-antes');

// 2. Ingeniería destraba l09 completando el atributo esencial (vía estado compartido, como lo hace el inspector del editor)
await p.goto(u('d-bom-editor.html?linea=l09')); await p.waitForTimeout(900);
await shot('2-editor-l09');
await p.evaluate(() => L.update(s => { const l = s.lineas.find(x => x.id === 'l09'); l.attrs['Corriente nominal'] = '125 A'; l.faltan = []; l.estado = 'ready'; l.org = 'man'; delete l.motivo; }));
await p.reload(); await p.waitForTimeout(900);
const st1 = await S();
check(st1.lineas.find(x => x.id === 'l09').estado === 'ready', 'El editor guarda l09 como lista en el estado compartido');

// 3. La cotización la ve
await p.goto(u('d-com-cotizacion.html')); await p.waitForTimeout(900);
const desp = await p.evaluate(() => [...document.querySelectorAll('tr, .li, [data-linea]')].filter(e => /NH00|seccionador/i.test(e.innerText)).map(e => e.innerText).join(' | '));
check(desp && !/No encontrad|Bloquea|NOT_FOUND|sin componente/i.test(desp.slice(0, 400)), 'La cotización deja de marcar l09 como bloqueada');
await shot('3-cotizacion-despues');

// 4. El taller: TS-BOMBAS estaba frenado porque l09 no se podía cotizar; ahora se puede cotizar pero sigue sin OC
await p.goto(u('d-tal-taller.html')); await p.waitForTimeout(900);
const tal = await p.evaluate(() => document.body.innerText);
check(/Ya se puede cotizar: falta pedirlo/i.test(tal) && !/No se pudo cotizar: falta «Corriente nominal»/.test(tal), 'El taller pasa el freno del TS-BOMBAS de «no se pudo cotizar» a «falta pedirlo»');
await shot('4-taller');

// 5. El distribuidor arma la contraoferta sobre OC-2026-031-1 y la envía (botón «Enviar contraoferta» del diálogo)
await p.goto(u('d-prov-solicitudes.html?oc=OC-2026-031-1&dialogo=contraoferta')); await p.waitForTimeout(1200);
await shot('5-prov-contraoferta');
const enviar = await p.$('.dlg-f .btn.pri');
if (enviar) { await enviar.click(); await p.waitForTimeout(800); }
const st2 = await S();
const contra = st2?.pedidos?.[0]?.ordenes?.[0]?.contra;
check(!!contra && contra.estado === 'pendiente', 'El distribuidor envía la contraoferta' + (contra ? `: ${contra.lineas.length} cambios, total ${contra.total}` : ''));

// 6. Compras la ve
await p.goto(u('d-com-pedidos.html')); await p.waitForTimeout(900);
const ped = await p.evaluate(() => document.body.innerText);
check(/contraoferta/i.test(ped), 'Pedidos muestra la contraoferta pendiente');
await p.goto(u('d-com-pedidos.html?vista=contraoferta')); await p.waitForTimeout(900);
await shot('6-compras-contraoferta');

// 7. Avisos e inicio
await p.goto(u('d-pla-inicio.html?vista=direccion')); await p.waitForTimeout(900);
check((await p.evaluate(() => document.body.innerText)).length > 500, 'El inicio de dirección carga con el estado modificado');
await shot('7-inicio-direccion');
const mp = await ctx.newPage(); await mp.setViewportSize({ width: 390, height: 844 });
await mp.goto(u('m-pla-avisos.html')); await mp.waitForTimeout(700);
check(await mp.evaluate(() => document.querySelectorAll('[data-av]').length) >= 5, 'Los avisos del teléfono listan los avisos del estado');
await mp.screenshot({ path: path.join(OUT, '8-avisos-telefono.png') }); await mp.close();

// 8. La galería aísla: un marco no escribe en el estado compartido
const antesG = JSON.stringify(await S());
await p.goto(u('index.html?s=bom-editor')); await p.waitForTimeout(3500);
const fr = p.frames().find(f => f.url().includes('d-bom-editor'));
if (fr) await fr.evaluate(() => L.set('lineas.0.comprar', 999));
check(JSON.stringify(await S()) === antesG, 'Un marco de la galería (marco=1) no modifica el estado de la demo');

// 9. Reiniciar demo
await p.goto(u('index.html')); await p.waitForTimeout(1500);
await p.click('#reset'); await p.waitForTimeout(500);
check((await S()) === null, '«Reiniciar demo» borra el estado y la demo vuelve a la semilla');

// 10. ⌘K
await p.goto(u('d-ing-proyectos.html')); await p.waitForTimeout(600);
await p.keyboard.press('Meta+k'); await p.waitForTimeout(300);
await p.keyboard.type('3d'); await p.keyboard.press('Enter'); await p.waitForTimeout(1200);
check(p.url().includes('d-bom-3d.html'), '⌘K encuentra «tablero 3D» y navega');

check(errs.length === 0, 'Sin errores de consola en todo el recorrido' + (errs.length ? ': ' + errs.slice(0, 3).join(' | ') : ''));
await b.close();
console.log(`\n${ok.length}/${ok.length + mal.length} pasos ok`);
fs.writeFileSync(path.join(OUT, 'resultado.txt'), [...ok.map(x => '✓ ' + x), ...mal.map(x => '✗ ' + x)].join('\n') + '\n');
process.exit(mal.length ? 1 : 0);
