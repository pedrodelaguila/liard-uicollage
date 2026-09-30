const { run } = require('../pw');
run('kit', async ({ open, shot, expect, download }) => {
  const p = await open('d-kit.html');
  expect(await p.isVisible('.side'), 'sidebar visible');
  await p.click('text=Guardar obra'); expect(await p.isVisible('.field-err'), 'validation error shown');
  await p.fill('#n', 'Obra X'); await p.click('text=Guardar obra'); expect(await p.isVisible('text=Obra guardada'), 'toast');
  const d = await download(p, () => p.click('#dl')); expect(d.buf.slice(0,2).toString()==='PK' && d.size>1000, 'xlsx zip ' + d.size);
  await shot(p, 'kit');
  const m = await open('d-kit.html', { mobile: true }); await shot(m, 'kit-narrow');
});
