// Capturas: node tools/shoot.mjs v1 [--solo-secciones] [seccion...]
// → shots/v1/0-galeria.png, shots/v1/<sección>.png (sección completa, marcos a su alto real),
//   shots/v1/pantallas/<pantalla>.png (cada marco a tamaño real de su dispositivo).
import { createRequire } from 'node:module';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const require = createRequire(import.meta.url);
// Playwright: PW_DIR=<carpeta>/node_modules/playwright, o instalado donde Node lo encuentre.
const { chromium } = require(process.env.PW_DIR || 'playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const V = args.shift() || 'v1';
const soloSec = args.includes('--solo-secciones'); const ids = args.filter(a => !a.startsWith('--'));
const OUT = path.join(ROOT, 'shots', V); fs.mkdirSync(path.join(OUT, 'pantallas'), { recursive: true });
const base = 'file://' + path.join(ROOT, 'index.html');
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--allow-file-access-from-files'] });

const p0 = await browser.newPage({ viewport: { width: 1600, height: 1000 } });
await p0.goto(base); await p0.waitForTimeout(2500);
const secs = await p0.evaluate(() => (window.SECCIONES || []).sort((a, b) => a.orden - b.orden).map(s => ({ id: s.id, marcos: s.marcos.trim().split('\n').map(l => l.trim()).filter(Boolean).map(l => l.split('|')) })));
await p0.screenshot({ path: path.join(OUT, '0-galeria.png') });
await p0.close();

const elegidas = ids.length ? secs.filter(s => ids.includes(s.id)) : secs;
for (const s of elegidas) {
  const p = await browser.newPage({ viewport: { width: 1600, height: 1200 } });
  await p.goto(`${base}?s=${s.id}&bare=1&full=1`);
  await p.waitForTimeout(4000);
  await p.screenshot({ path: path.join(OUT, s.id + '.png'), fullPage: true });
  const h = await p.evaluate(() => document.documentElement.scrollHeight);
  console.log(`${s.id}  ${h}px  ${s.marcos.length} marcos`);
  await p.close();
}

if (!soloSec) {
  const hechas = new Set();
  for (const s of elegidas) for (const [k, src] of s.marcos) {
    const key = src.trim(); if (hechas.has(key)) continue; hechas.add(key);
    const mobile = k.trim() === 'm';
    const p = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 994 } });
    await p.goto('file://' + path.join(ROOT, key.split('?')[0]) + (key.includes('?') ? '?' + key.split('?')[1] + '&marco=1' : '?marco=1'));
    await p.waitForTimeout(1500);
    await p.screenshot({ path: path.join(OUT, 'pantallas', key.replace(/[?&=]/g, '_').replace('.html', '') + '.png') });
    await p.close();
  }
  console.log(hechas.size, 'pantallas');
}
await browser.close();
console.log('listo →', path.relative(ROOT, OUT));
