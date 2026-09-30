/* Calidad transversal de todas las pantallas: carga por file:// sin errores, controles con nombre accesible,
   sin desborde horizontal a 1440/1024/390, sin textos en inglés visibles, y tiempo de carga. */
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '../..');
const pages = fs.readdirSync(ROOT).filter(f => /^[dm]-.*\.html$/.test(f)).sort();
const EN = /\b(Loading|Submit|Cancel|Save|Delete|Search|Error:|undefined|NaN|null|\[object Object\]|Click here|Settings)\b/;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--allow-file-access-from-files'] });
  let fails = 0; const rows = [];
  for (const f of pages) {
    const mobile = f.startsWith('m-');
    const widths = mobile ? [390] : [1440, 1024];
    for (const w of widths) {
      const ctx = await b.newContext({ viewport: { width: w, height: mobile ? 844 : 994 } });
      const p = await ctx.newPage(); const errs = [];
      p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errs.push(m.text()); });
      const t0 = Date.now(); await p.goto('file://' + path.join(ROOT, f)); await p.waitForTimeout(900); const ms = Date.now() - t0;
      const r = await p.evaluate(() => {
        const vis = el => { const s = getComputedStyle(el); const r = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0; };
        const unnamed = [...document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, [role=button], [tabindex="0"]')].filter(vis).filter(el => {
          const name = (el.getAttribute('aria-label') || el.getAttribute('aria-labelledby') || el.title || el.textContent || el.placeholder || '').trim();
          const lbl = el.id && document.querySelector('label[for="' + el.id + '"]'); const wrapped = el.closest('label');
          return !name && !lbl && !wrapped;
        }).map(el => el.outerHTML.slice(0, 90));
        const overflow = document.documentElement.scrollWidth - window.innerWidth;
        return { unnamed, overflow, text: document.body.innerText, lang: document.documentElement.lang };
      });
      const en = (r.text.match(EN) || [])[0];
      const issues = [];
      if (errs.length) issues.push('errores: ' + errs.slice(0, 2).join(' | '));
      if (r.unnamed.length) issues.push(r.unnamed.length + ' controles sin nombre: ' + r.unnamed.slice(0, 2).join(' '));
      if (r.overflow > 2) issues.push('desborde horizontal ' + r.overflow + 'px');
      if (en) issues.push('texto en inglés o valor roto: «' + en + '»');
      if (r.lang !== 'es') issues.push('lang=' + r.lang);
      rows.push({ f, w, ms, issues });
      console.log((issues.length ? '✗ ' : '✓ ') + f + ' @' + w + ' ' + ms + 'ms' + (issues.length ? '\n    ' + issues.join('\n    ') : ''));
      fails += issues.length ? 1 : 0; await ctx.close();
    }
  }
  fs.writeFileSync(path.join(ROOT, 'shots', 'calidad.json'), JSON.stringify(rows, null, 1));
  console.log(fails ? `✗ calidad: ${fails} pantallas con problemas de ${rows.length}` : `✓ calidad: ${rows.length} cargas limpias`);
  await b.close(); process.exit(fails ? 1 : 0);
})();
