/* Galería: arma una sección por flujo a partir de SECTIONS y convierte cada línea `kind|src|caption|note`
   en un marco (d = laptop 1440 escalada, m = teléfono 390). Query params: ?s=<id> ?bare=1 ?full=1 ?measure=1 */
(function () {
  const SECTIONS = window.GALLERY_SECTIONS || [];
  /* Cada carga de la galería arranca sus marcos desde la semilla. */
  Object.keys(localStorage).filter(k => k.includes(':frame:') || k.includes(':ui:frame:')).forEach(k => localStorage.removeItem(k));
  const q = new URLSearchParams(location.search);
  const only = q.get('s'), bare = q.get('bare') === '1', full = q.get('full') === '1';
  if (bare) document.body.classList.add('bare'); if (full) document.body.classList.add('full');
  document.getElementById('g-mark').innerHTML = L.icon('zap', 18);
  const wrap = document.getElementById('g-wrap'), nav = document.getElementById('g-nav');
  let fid = 0; const withFlags = src => src + (src.includes('?') ? '&' : '?') + 'frame=f' + (++fid) + (full ? '&full=1' : '');
  const frame = ([k, src, t, d]) => k === 'm'
    ? `<figure><div class="phone"><iframe loading="${only ? 'eager' : 'lazy'}" src="${withFlags(src)}" title="${t}"></iframe></div><figcaption>${t} <a href="${src}" target="_blank">abrir</a><small>${d || ''}</small></figcaption></figure>`
    : `<figure><div class="desk"><div class="vp"><iframe loading="${only ? 'eager' : 'lazy'}" src="${withFlags(src)}" title="${t}"></iframe></div></div><figcaption>${t} <a href="${src}" target="_blank">abrir</a><small>${d || ''}</small></figcaption></figure>`;
  SECTIONS.forEach((s, i) => {
    if (only && s.id !== only) return;
    const el = document.createElement('section'); el.className = 'g-sec' + (s.id === 'cobertura' ? ' g-cov' : ''); el.id = s.id;
    el.innerHTML = `<header><h2><small>${String(i).padStart(2, '0')}</small>${s.title}</h2>${(s.caps || []).map(c => L.cap(c)).join(' ')}${(s.chips || []).map(c => `<span class="badge b-muted">${c}</span>`).join(' ')}${s.priority ? `<span class="badge b-copper">prioridad ${s.priority}</span>` : ''}</header>
      <div class="g-desc">${s.desc || ''}</div>
      ${s.tradeoffs ? `<div class="tradeoffs">${s.tradeoffs.map(t => `<div class="card${t.rec ? ' rec' : ''}"><h4>${t.rec ? L.icon('star', 14) : ''}${t.name}</h4><p>${t.text}</p></div>`).join('')}</div>` : ''}
      ${s.states ? `<div class="g-states"><span class="eyebrow">Estados</span>${s.states.map(([u, t]) => `<a href="${u}" target="_blank">${t}</a>`).join('')}</div>` : ''}
      ${s.html || ''}
      ${s.frames ? `<div class="frames${s.id === 'recorrido' ? ' journey' : ''}" data-frames="${s.frames.trim().replace(/"/g, '&quot;')}"></div>` : ''}`;
    wrap.appendChild(el);
    nav.insertAdjacentHTML('beforeend', `<a href="#${s.id}">${s.short || s.title}</a>`);
  });
  const parse = s => s.trim().split('\n').map(l => l.trim().split('|'));
  document.querySelectorAll('[data-frames]').forEach(el => { el.innerHTML = parse(el.dataset.frames).map(frame).join(''); });
  /* ?full=1: cada iframe crece al alto de su contenido */
  window.addEventListener('message', e => { if (!full || !e.data || e.data.type !== 'liard-h') return; document.querySelectorAll('iframe').forEach(f => { if (f.contentWindow === e.source) { const h = Math.max(e.data.h, f.closest('.phone') ? 844 : 994); f.style.height = h + 'px'; const vp = f.closest('.vp'); if (vp) vp.style.height = Math.ceil(h * .5834) + 'px'; } }); });
  if (q.get('measure') === '1') setTimeout(() => { document.title = 'H=' + document.documentElement.scrollHeight; }, 4000);
  /* Estado vivo de la demo */
  const live = document.getElementById('live');
  const draw = () => { const s = L.store.get(); const p1 = L.blockers('p1').length; const req = s.requests.find(r => r.id === 'r-0141'); const offs = s.offers.filter(o => o.requestId === 'r-0141' && o.status === 'ENVIADA').length;
    live.innerHTML = `<span>Clínica San Martín: <b>${p1 ? p1 + ' bloqueos' : 'lista para cotizar'}</b></span><span>SC-0141: <b>${req.status === 'ADJUDICADA' ? 'adjudicada' : offs + ' de 3 ofertas'}</b></span><span>Pedidos: <b>${s.orders.length}</b></span><span>Correos simulados: <b>${s.outbox.length}</b></span><span>IA del mes: <b>${L.usd(L.aiSpent())}</b></span>`; };
  draw(); L.store.subscribe(draw);
  document.getElementById('g-reset').onclick = async () => { if (await L.confirm('Reiniciar la demo', 'Se borran los cambios hechos en este navegador y todas las pantallas vuelven a los datos de ejemplo.', 'Reiniciar', 'danger')) { L.store.reset(); location.reload(); } };
  /* Pill activa según scroll */
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) nav.querySelectorAll('a').forEach(a => a.classList.toggle('on', a.getAttribute('href') === '#' + e.target.id)); }), { rootMargin: '-40% 0px -55% 0px' });
  document.querySelectorAll('section.g-sec').forEach(s => io.observe(s));
})();
