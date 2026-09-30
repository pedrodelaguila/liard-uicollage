/* Capturas de la galería: una PNG por sección (alto medido) + 0-galeria.png + una PNG por pantalla enlazada.
   Uso: node tools/shoot.js v1 [seccion] */
const fs = require('fs'), path = require('path'), http = require('http');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const ver = process.argv[2] || 'v1', only = process.argv[3];
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.md': 'text/plain; charset=utf-8' };
(async () => {
  const srv = http.createServer((q, r) => { const f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(q.url.split('?')[0])); if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) { r.writeHead(404); return r.end(); } r.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(r); }).listen(0);
  await new Promise(r => srv.on('listening', r)); const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const out = path.join(ROOT, 'shots', ver); fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await b.newContext({ viewport: { width: 1840, height: 1000 } });
  const errors = [];
  const g = await ctx.newPage(); g.on('pageerror', e => errors.push('galería: ' + e.message));
  await g.goto(base + 'index.html', { waitUntil: 'load' });
  const sections = await g.$$eval('section[id]', s => s.map(x => x.id));
  if (!only) { await g.waitForTimeout(3000); await g.screenshot({ path: path.join(out, '0-galeria.png') }); }
  for (const id of sections) {
    if (only && id !== only) continue;
    const p = await ctx.newPage(); p.on('pageerror', e => errors.push(id + ': ' + e.message));
    await p.goto(base + 'index.html?s=' + id + '&bare=1', { waitUntil: 'load' });
    await p.waitForTimeout(9000);
    try { await p.screenshot({ path: path.join(out, id + '.png'), fullPage: true }); } catch (e) { errors.push(id + ': captura ' + e.message.split('\n')[0]); } await p.close();
    console.log('✓ ' + id);
  }
  /* Pantallas sueltas a tamaño real */
  const frames = await g.$$eval('[data-frames]', els => els.flatMap(e => e.dataset.frames.trim().split('\n').map(l => l.trim().split('|'))));
  const scr = path.join(out, 'pantallas'); fs.mkdirSync(scr, { recursive: true });
  const seen = new Set();
  for (const [k, src] of frames) {
    if (!src || seen.has(src)) continue; seen.add(src);
    if (only) continue;
    const c = await b.newContext({ viewport: k === 'm' ? { width: 390, height: 844 } : { width: 1440, height: 994 } });
    const p = await c.newPage(); p.on('pageerror', e => errors.push(src + ': ' + e.message));
    p.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errors.push(src + ' · ' + m.text()); });
    await p.goto(base + src, { waitUntil: 'load' }); await p.waitForTimeout(1500);
    const name = src.replace(/[^a-z0-9]+/gi, '_').replace(/_html_?/, '-').replace(/_$/, '');
    try { await p.screenshot({ path: path.join(scr, name + '.png'), fullPage: k !== 'm' }); } catch (e) { await p.screenshot({ path: path.join(scr, name + '.png') }); } await c.close();
  }
  console.log(seen.size + ' pantallas'); errors.forEach(e => console.log('✗ ' + e));
  await b.close(); srv.close(); process.exit(errors.length ? 1 : 0);
})();
