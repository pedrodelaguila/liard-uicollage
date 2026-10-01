// Busca enlaces a pantallas que no existen: href="x.html", data-href, L.go('x.html'), href: 'x.html', marcos de sections/*.js.
import fs from 'node:fs'; import path from 'node:path'; import url from 'node:url';
const ROOT = path.resolve(path.dirname(url.fileURLToPath(import.meta.url)), '..');
const files = fs.readdirSync(ROOT).filter(f => /\.(html|js)$/.test(f)).concat(fs.readdirSync(path.join(ROOT, 'sections')).map(f => 'sections/' + f));
const re = /\b([dm]-[a-z0-9-]+\.html)/g; const miss = {};
for (const f of files) {
  if (f === 'icons.js') continue;
  const s = fs.readFileSync(path.join(ROOT, f), 'utf8');
  for (const m of s.matchAll(re)) { const t = m[1]; if (t === 'dxf-viewer.html') continue; if (!fs.existsSync(path.join(ROOT, t))) (miss[t] ||= new Set()).add(f); }
}
const ks = Object.keys(miss);
ks.forEach(k => console.log('✗', k, '←', [...miss[k]].join(', ')));
console.log(ks.length ? `${ks.length} destinos inexistentes` : 'todos los enlaces apuntan a pantallas que existen');
