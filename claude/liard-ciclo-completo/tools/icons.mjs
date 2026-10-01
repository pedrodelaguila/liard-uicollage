// Genera icons.js: cada ícono lucide (ISC) como el interior SVG, indexado por su nombre kebab-case.
import fs from 'node:fs'; import path from 'node:path';
const dir = process.argv[2]; const out = process.argv[3];
const icons = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.mjs'))) {
  const src = fs.readFileSync(path.join(dir, f), 'utf8');
  const m = src.match(/const \w+ = (\[[\s\S]*?\]);\s*\n\s*export/);
  if (!m) continue;
  const node = Function('return ' + m[1])();
  icons[f.replace('.mjs', '')] = node.map(([t, a]) => `<${t} ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(' ')}/>`).join('');
}
// Nombres de lucide 0.x que en 1.x cambiaron (la app usa lucide-react con los nombres viejos en algunos lados).
const ALIAS = { history: 'rotate-ccw-clock' };
for (const [a, b] of Object.entries(ALIAS)) if (icons[b] && !icons[a]) icons[a] = icons[b];
fs.writeFileSync(out, '/* Íconos lucide v1.37.0 (ISC, https://lucide.dev), generados por tools/icons.mjs. */\nwindow.LUCIDE=' + JSON.stringify(icons) + ';\n');
console.log(Object.keys(icons).length, 'íconos');
