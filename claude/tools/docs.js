/* Convierte estrategia/*.md y research/*.md en HTML estático navegable (funciona por file://).
   Uso: node tools/docs.js */
const fs = require('fs'), path = require('path');
const { marked } = require('marked');
const ROOT = path.resolve(__dirname, '..');
const groups = [
  { dir: 'estrategia', title: 'Estrategia, oportunidades y roadmap' },
  { dir: 'research', title: 'Investigación y auditoría' },
];
const all = groups.flatMap(g => fs.readdirSync(path.join(ROOT, g.dir)).filter(f => f.endsWith('.md')).sort().map(f => ({ g, f })));
const title = md => (md.match(/^#\s+(.+)$/m) || [, ''])[1].replace(/[`*]/g, '');
const css = `body{margin:0;display:grid;grid-template-columns:280px 1fr;min-height:100vh}
aside{position:sticky;top:0;height:100vh;overflow:auto;background:var(--stage);color:var(--stage-ink);padding:20px 14px}
aside a{display:block;color:var(--stage-ink-2);text-decoration:none;padding:6px 10px;border-radius:6px;font-size:13px}
aside a.on,aside a:hover{background:var(--stage-3);color:#fff} aside h4{font:600 10.5px var(--font-mono);text-transform:uppercase;letter-spacing:.12em;color:var(--stage-ink-2);margin:18px 10px 6px}
article{max-width:1060px;padding:40px 48px 80px;background:var(--surface);min-height:100vh;box-shadow:var(--shadow-1)}
article h1{font-size:32px;margin-bottom:18px} article h2{margin:34px 0 12px;padding-top:12px;border-top:1px solid var(--line)} article h3{margin:22px 0 8px}
article table{border-collapse:collapse;width:100%;font-size:12.5px;margin:12px 0 18px;display:block;overflow-x:auto}
article th,article td{border:1px solid var(--line);padding:6px 8px;vertical-align:top;text-align:left} article th{background:var(--surface-2);font-family:var(--font-mono);font-size:11px}
article code{font-family:var(--font-mono);font-size:.9em;background:var(--surface-3);padding:1px 4px;border-radius:4px} article pre{background:var(--stage);color:var(--stage-ink);padding:14px;border-radius:10px;overflow:auto;font-size:12px}
article pre code{background:none;color:inherit} article blockquote{border-left:3px solid var(--volt);margin:12px 0;padding:6px 14px;background:var(--volt-soft)}
article li{margin:3px 0} .back{display:inline-flex;margin:0 10px 14px;color:var(--volt)!important}
@media(max-width:900px){body{grid-template-columns:1fr}aside{position:static;height:auto}article{padding:20px}}`;
const side = cur => `<aside><a class="back" href="../index.html">← Galería</a>${groups.map(g => `<h4>${g.title}</h4>` + all.filter(x => x.g === g).map(x => { const md = fs.readFileSync(path.join(ROOT, g.dir, x.f), 'utf8'); const href = (g.dir === cur.g.dir ? '' : '../' + g.dir + '/') + x.f.replace('.md', '.html'); return `<a href="${href}" class="${x === cur ? 'on' : ''}">${title(md) || x.f}</a>`; }).join('')).join('')}</aside>`;
for (const x of all) {
  const md = fs.readFileSync(path.join(ROOT, x.g.dir, x.f), 'utf8');
  let html = marked.parse(md).replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (_, c) => `<pre class="mermaid-src" aria-label="Diagrama de dependencias (fuente mermaid)"><code>${c}</code></pre>`);
  fs.writeFileSync(path.join(ROOT, x.g.dir, x.f.replace('.md', '.html')), `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>liard · ${title(md)}</title><link rel="stylesheet" href="../ui.css"><style>${css}</style></head><body>${side(x)}<article>${html}</article></body></html>`);
}
for (const g of groups) { const first = all.find(x => x.g === g); fs.writeFileSync(path.join(ROOT, g.dir, 'index.html'), `<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=${first.f.replace('.md', '.html')}"><a href="${first.f.replace('.md', '.html')}">Abrir</a>`); }
console.log('docs: ' + all.length + ' páginas');
