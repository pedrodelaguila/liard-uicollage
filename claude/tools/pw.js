/* Arnés de prueba compartido. Cada suite levanta su propio servidor estático en un puerto libre,
   así varias suites corren en paralelo sin pisarse.
   Uso:
     const { run } = require('./pw');
     run('mi-area', async ({ open, shot, expect, log }) => {
       const p = await open('d-bom.html?p=p1', { mobile: false });   // página nueva con estado de demo limpio
       await p.click('text=Guardar cambios'); expect(await p.isVisible('text=Cambios guardados'), 'toast');
       await shot(p, 'bom-guardado');                                   // → shots/tests/mi-area/bom-guardado.png
     });
   Falla (exit 1) si hubo expect fallido o errores de consola/página. */
const http = require('http'), fs = require('fs'), path = require('path');
const { chromium } = require('playwright');
const ROOT = path.resolve(__dirname, '..');
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.json': 'application/json', '.woff2': 'font/woff2' };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const u = decodeURIComponent(req.url.split('?')[0]); const f = path.join(ROOT, u === '/' ? 'index.html' : u);
      if (!f.startsWith(ROOT) || !fs.existsSync(f) || fs.statSync(f).isDirectory()) { rsp.writeHead(404); return rsp.end('404'); }
      rsp.writeHead(200, { 'Content-Type': MIME[path.extname(f)] || 'application/octet-stream' }); fs.createReadStream(f).pipe(rsp);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

async function run(area, fn) {
  const srv = await serve(); const base = 'http://127.0.0.1:' + srv.address().port + '/';
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const outDir = path.join(ROOT, 'shots', 'tests', area); fs.mkdirSync(outDir, { recursive: true });
  let fails = 0; const errors = [];
  const expect = (cond, msg) => { if (cond) console.log('  ✓ ' + msg); else { fails++; console.log('  ✗ ' + msg); } };
  const contexts = [];
  /* Abre una página. keepState: true reutiliza el contexto anterior (mismo localStorage) para probar persistencia entre pantallas. */
  let lastCtx = null;
  const open = async (rel, opts = {}) => {
    const mobile = opts.mobile || /(^|\/)m-/.test(rel);
    let ctx = opts.keepState && lastCtx ? lastCtx : null;
    if (!ctx) { ctx = await browser.newContext({ viewport: mobile ? { width: 390, height: 844 } : { width: opts.width || 1440, height: opts.height || 994 }, deviceScaleFactor: 1, hasTouch: mobile, acceptDownloads: true, reducedMotion: opts.reducedMotion || 'no-preference' }); contexts.push(ctx); lastCtx = ctx; }
    const p = await ctx.newPage();
    p.on('console', m => { if (m.type() === 'error' && !/fonts\.g(oogleapis|static)/.test(m.text())) errors.push(rel + ' · console: ' + m.text()); });
    p.on('pageerror', e => errors.push(rel + ' · pageerror: ' + e.message));
    await p.goto(base + rel, { waitUntil: 'load' }); await p.waitForTimeout(opts.wait || 400);
    return p;
  };
  const shot = async (p, name, full = true) => { if (full) await p.evaluate(() => window.scrollTo(0, 0)); await p.screenshot({ path: path.join(outDir, name + '.png'), fullPage: full }); };
  /* Captura una descarga disparada por `trigger` y devuelve { name, size, text? } */
  const download = async (p, trigger) => { const [d] = await Promise.all([p.waitForEvent('download'), trigger()]); const f = path.join(outDir, d.suggestedFilename()); await d.saveAs(f); const buf = fs.readFileSync(f); return { name: d.suggestedFilename(), size: buf.length, buf, text: buf.toString('utf8') }; };
  const log = (...a) => console.log('   ', ...a);
  console.log('▶ ' + area);
  try { await fn({ open, shot, expect, log, download, base }); }
  catch (e) { fails++; console.log('  ✗ excepción: ' + (e.stack || e.message)); }
  errors.forEach(e => console.log('  ✗ ' + e)); fails += errors.length;
  for (const c of contexts) await c.close(); await browser.close(); srv.close();
  console.log(fails ? `✗ ${area}: ${fails} fallas` : `✓ ${area}: todo bien`);
  process.exit(fails ? 1 : 0);
}
module.exports = { run };
