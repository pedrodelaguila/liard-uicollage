// QA de pantallas: node tools/qa.mjs <glob-prefijo|archivo...> [--shots dir] [--url-extra "?estado=x"]
// Para cada pantalla: carga por file:// al tamaño de su dispositivo (d-* 1440×994, m-* 390×844),
// junta errores de consola y de página, mide desborde horizontal, busca "undefined"/"NaN"/"[object",
// palabras en inglés comunes en la UI, controles sin nombre accesible, íconos faltantes, y saca captura.
// Ejemplo: node tools/qa.mjs d-bom- m-bom- --shots shots/qa
//          node tools/qa.mjs "d-bom-3d.html?vista=frente"
import { createRequire } from 'node:module';
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const require = createRequire(import.meta.url);
// Playwright: PW_DIR=<carpeta>/node_modules/playwright, o instalado donde Node lo encuentre.
const { chromium } = require(process.env.PW_DIR || 'playwright');
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
const shotsIdx = args.indexOf('--shots'); const shots = shotsIdx >= 0 ? path.resolve(ROOT, args.splice(shotsIdx, 2)[1]) : null;
const full = args.includes('--full'); if (full) args.splice(args.indexOf('--full'), 1);
const files = fs.readdirSync(ROOT).filter(f => f.endsWith('.html') && f !== 'index.html');
const targets = [];
for (const a of args) {
  if (a.includes('.html')) targets.push(a);
  else files.filter(f => f.startsWith(a)).forEach(f => targets.push(f));
}
if (!targets.length) { console.error('Sin pantallas para', args.join(' ')); process.exit(1); }
const EN = /\b(Loading|Submit|Cancel|Save|Delete|Edit|Search|Settings|Dashboard|Upload|Download|Error:|Success|Warning|Close|Next|Back|Previous|Total amount|Status|Pending|Approved|Rejected|Quote|Order|Supplier|undefined|NaN|null|\[object)\b/;
if (shots) fs.mkdirSync(shots, { recursive: true });
const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
let bad = 0;
for (const t of targets) {
  const mobile = t.startsWith('m-');
  const page = await browser.newPage({ viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 994 }, deviceScaleFactor: 1 });
  const errs = [];
  page.on('pageerror', e => errs.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || (m.type() === 'warning' && /ícono inexistente/.test(m.text()))) errs.push(m.type() + ': ' + m.text()); });
  page.on('requestfailed', r => errs.push('requestfailed: ' + r.url().replace('file://' + ROOT, '')));
  await page.goto('file://' + path.join(ROOT, t.split('?')[0]) + (t.includes('?') ? '?' + t.split('?')[1] : ''));
  await page.waitForTimeout(1200);
  const info = await page.evaluate((EN_SRC) => {
    const EN = new RegExp(EN_SRC);
    const sw = document.documentElement.scrollWidth, vw = window.innerWidth;
    const text = document.body.innerText;
    const en = (text.match(new RegExp(EN.source, 'g')) || []).slice(0, 6);
    const unnamed = [...document.querySelectorAll('button, a[href], input:not([type=hidden]), select, textarea, [role=button]')].filter(el => {
      if (el.closest('[hidden]') || el.offsetParent === null) return false;
      const n = (el.getAttribute('aria-label') || el.getAttribute('title') || el.innerText || el.value || el.getAttribute('placeholder') || '').trim();
      const lbl = el.id && document.querySelector(`label[for="${el.id}"]`);
      return !n && !lbl && !el.closest('label');
    }).map(el => el.outerHTML.slice(0, 90));
    const over = [...document.querySelectorAll('body *')].filter(el => { const r = el.getBoundingClientRect(); return r.right > vw + 1 && r.width > 0 && getComputedStyle(el).position !== 'fixed' && !el.closest('.tbl-wrap, [data-scroll-x], .cad, canvas'); }).slice(0, 3).map(el => el.tagName.toLowerCase() + '.' + [...el.classList].join('.'));
    return { sw, vw, en, unnamed: unnamed.slice(0, 4), over, lang: document.documentElement.lang, title: document.title, h: document.documentElement.scrollHeight };
  }, EN.source);
  const problems = [];
  if (errs.length) problems.push('consola: ' + errs.slice(0, 4).join(' | '));
  if (info.sw > info.vw + 1) problems.push(`desborde horizontal ${info.sw}px > ${info.vw}px (${info.over.join(', ')})`);
  if (info.en.length) problems.push('texto sospechoso: ' + [...new Set(info.en)].join(', '));
  if (info.unnamed.length) problems.push('sin nombre accesible: ' + info.unnamed.join(' ; '));
  if (info.lang !== 'es') problems.push('lang != es');
  if (shots) await page.screenshot({ path: path.join(shots, t.replace(/[?&=]/g, '_').replace('.html', '') + '.png'), fullPage: full });
  console.log((problems.length ? '✗ ' : '✓ ') + t + `  (alto ${info.h}px)` + (problems.length ? '\n    ' + problems.join('\n    ') : ''));
  if (problems.length) bad++;
  await page.close();
}
await browser.close();
console.log(`\n${targets.length - bad}/${targets.length} pantallas limpias`);
process.exit(bad ? 1 : 0);
