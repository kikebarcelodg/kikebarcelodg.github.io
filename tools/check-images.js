// Comprueba que cada imagen que usa la web existe con el nombre exacto (mayúsculas incluidas).
// Uso (desde la carpeta del proyecto):  node tools/check-images.js
const fs = require('fs'), path = require('path'), root = path.join(__dirname, '..');
global.window = {}; eval(fs.readFileSync(path.join(root, 'js/projects.js'), 'utf8'));
let ok = 0, miss = [];
function exact(rel) { // comparación sensible a mayúsculas, como GitHub Pages
  const parts = rel.split('/'); let dir = root;
  for (const p of parts) { if (!fs.existsSync(dir) || !fs.readdirSync(dir).includes(p)) return false; dir = path.join(dir, p); }
  return true;
}
window.PROJECTS.forEach(p => {
  const refs = new Set(['cover']);
  (p.gallery || ['1', '2', '3']).forEach(g => typeof g === 'string' ? refs.add(g) : g.morph ? g.morph.forEach(x => refs.add(x)) : refs.add(g.f));
  const miss_p = [...refs].filter(r => !exact(`img/proyectos/${p.slug}/${r}.jpg`));
  ok += refs.size - miss_p.length;
  if (miss_p.length) miss.push(`${p.name} (${p.slug}): faltan ${miss_p.map(r => r + '.jpg').join(', ')}`);
});
if (!exact('img/logo/k.png')) miss.push('falta img/logo/k.png');
console.log(`Imágenes encontradas: ${ok}`);
console.log(miss.length ? 'PROBLEMAS:\n - ' + miss.join('\n - ') : 'Todo correcto.');
