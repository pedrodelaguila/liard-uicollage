/* Galería: arma secciones y marcos a partir de window.SECCIONES (sections/*.js).
   Parámetros: ?s=<id> una sola sección · ?bare=1 sin cabecera · ?full=1 marcos al alto del contenido
   · ?measure=1 escribe H=<px> en el título (shoot.sh) · ?h=<horizonte> · ?rol=<rol> filtros. */
(function () {
  const q = new URLSearchParams(location.search);
  const only = q.get('s');
  const full = q.get('full') === '1';
  const bare = q.get('bare') === '1';
  const HORIZONTES = {
    existe: { t: 'Existe en dev', c: 'h-existe' },
    s4: { t: 'Sprint 4 · pendiente', c: 'h-s4' },
    s5: { t: 'Sprint 5 · planificado', c: 'h-s5' },
    h1: { t: 'Propuesta · 0–6 meses', c: 'h-h1' },
    h2: { t: 'Propuesta · 6–18 meses', c: 'h-h2' },
    h3: { t: 'Concepto', c: 'h-h3' },
  };
  const ETAPAS = ['Ingeniería', 'Presupuesto', 'Compras', 'Fabricación', 'Obra', 'Mantenimiento', 'Comercial', 'Plataforma'];
  const ROLES = { ing: 'Ingeniería', pres: 'Presupuesto', comp: 'Compras', tal: 'Taller', obra: 'Obra', dir: 'Dirección', prov: 'Distribuidor', cli: 'Cliente final' };

  const secciones = (window.SECCIONES || []).slice().sort((a, b) => a.orden - b.orden);
  if (bare) document.body.classList.add('bare');

  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // Los marcos de la galería corren con estado propio (marco=1): mirar no cambia la demo.
  const frameSrc = src => src + (src.includes('?') ? '&' : '?') + 'marco=1';

  function figura([k, src, titulo, nota]) {
    src = src.trim();
    const abrir = `<a href="${esc(src)}" target="_blank" rel="noopener">abrir</a>`;
    const cap = `<figcaption><span class="cap-t">${esc(titulo)}</span> ${abrir}${nota ? `<small>${esc(nota)}</small>` : ''}</figcaption>`;
    const f = esc(frameSrc(src));
    if (k.trim() === 'm') {
      return `<figure class="fig-m"><div class="phone"><div class="notch"></div><div class="sbar" aria-hidden="true"><span>9:41</span><span>5G ▮▮▮</span></div><iframe loading="lazy" src="${f}" title="${esc(titulo)}" width="390" height="844"></iframe></div>${cap}</figure>`;
    }
    return `<figure class="fig-d"><div class="desk"><div class="desk-bar"><i></i><i></i><i></i><span>${esc(src.split('?')[0])}</span></div><div class="vp"><iframe loading="lazy" src="${f}" title="${esc(titulo)}" width="1440" height="994"></iframe></div></div>${cap}</figure>`;
  }

  function seccion(s, i) {
    const h = HORIZONTES[s.horizonte] || HORIZONTES.h1;
    const frames = s.marcos.trim().split('\n').map(l => l.trim()).filter(Boolean).map(l => l.split('|'));
    const estados = (s.estados || []).map(([t, href]) => `<a href="${esc(href)}" target="_blank" rel="noopener">${esc(t)}</a>`).join(' · ');
    const roles = (s.roles || []).map(r => `<span class="chip chip-rol">${esc(ROLES[r] || r)}</span>`).join('');
    return `<section id="${esc(s.id)}" data-etapa="${esc(s.etapa)}" data-h="${esc(s.horizonte)}" data-roles="${esc((s.roles || []).join(' '))}">
      <header class="sec-h">
        <div class="sec-k"><span class="sec-n">${String(i + 1).padStart(2, '0')}</span><span class="chip chip-etapa">${esc(s.etapa)}</span><span class="chip ${h.c}">${h.t}</span>${roles}${(s.refs || []).map(r => `<span class="chip chip-ref">${esc(r)}</span>`).join('')}</div>
        <h2>${esc(s.titulo)}</h2>
        <p class="sec-p">${s.descripcion}</p>
        ${s.existe ? `<p class="sec-existe"><b>Ya existe en dev:</b> ${s.existe}</p>` : ''}
        ${s.reglas ? `<ul class="sec-reglas">${s.reglas.map(r => `<li>${r}</li>`).join('')}</ul>` : ''}
        ${estados ? `<p class="sec-estados"><b>Otros estados:</b> ${estados}</p>` : ''}
      </header>
      <div class="frames">${frames.map(figura).join('')}</div>
    </section>`;
  }

  const visibles = only ? secciones.filter(s => s.id === only) : secciones;
  document.getElementById('secciones').innerHTML = visibles.map((s) => seccion(s, secciones.indexOf(s))).join('');

  // Navegación por etapa
  const nav = document.getElementById('nav');
  if (nav) {
    nav.innerHTML = ETAPAS.filter(e => secciones.some(s => s.etapa === e)).map(e => {
      const items = secciones.filter(s => s.etapa === e);
      return `<div class="nav-g"><span class="nav-e">${e}</span>${items.map(s => `<a class="pill" href="#${s.id}" data-h="${s.horizonte}">${esc(s.corto || s.titulo)}</a>`).join('')}</div>`;
    }).join('');
  }

  // Filtros por horizonte y rol
  const filtros = document.getElementById('filtros');
  if (filtros) {
    const state = { h: q.get('h') || '', rol: q.get('rol') || '' };
    const conteo = k => secciones.filter(s => s.horizonte === k).length;
    filtros.innerHTML =
      `<div class="f-g"><span>Horizonte</span><button data-f="h" data-v="" class="on">Todo · ${secciones.length}</button>${Object.entries(HORIZONTES).filter(([k]) => conteo(k)).map(([k, v]) => `<button data-f="h" data-v="${k}" class="${v.c}">${v.t} · ${conteo(k)}</button>`).join('')}</div>` +
      `<div class="f-g"><span>Rol</span><button data-f="rol" data-v="" class="on">Todos</button>${Object.entries(ROLES).filter(([k]) => secciones.some(s => (s.roles || []).includes(k))).map(([k, v]) => `<button data-f="rol" data-v="${k}">${v}</button>`).join('')}</div>`;
    const aplicar = () => {
      filtros.querySelectorAll('button').forEach(b => b.classList.toggle('on', state[b.dataset.f] === b.dataset.v));
      document.querySelectorAll('#secciones > section').forEach(sec => {
        const okH = !state.h || sec.dataset.h === state.h;
        const okR = !state.rol || sec.dataset.roles.split(' ').includes(state.rol);
        sec.hidden = !(okH && okR);
      });
      document.querySelectorAll('#nav .pill').forEach(p => {
        const sec = document.getElementById(p.getAttribute('href').slice(1));
        p.classList.toggle('off', !!sec && sec.hidden);
      });
    };
    filtros.addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      state[b.dataset.f] = b.dataset.v; aplicar();
    });
    aplicar();
  }

  // Reiniciar demo: borra el estado compartido de todas las pantallas
  const reset = document.getElementById('reset');
  if (reset) reset.addEventListener('click', () => {
    Object.keys(localStorage).filter(k => k.startsWith('liard-cc')).forEach(k => localStorage.removeItem(k));
    reset.textContent = 'Demo reiniciada ✓';
    document.querySelectorAll('iframe').forEach(f => { f.src = f.src; });
    setTimeout(() => { reset.textContent = 'Reiniciar demo'; }, 1800);
  });

  // ?full=1: cada iframe crece al alto que reporta su pantalla
  window.addEventListener('message', e => {
    const d = e.data; if (!d || d.tipo !== 'liard-alto' || !full) return;
    document.querySelectorAll('iframe').forEach(f => {
      if (f.contentWindow !== e.source) return;
      const h = Math.max(d.alto, f.closest('.phone') ? 844 : 994);
      f.style.height = h + 'px';
      const vp = f.closest('.vp'); if (vp) vp.style.height = Math.ceil(h * 0.5834) + 'px';
      const ph = f.closest('.phone'); if (ph) ph.style.height = (h + 56) + 'px';
    });
  });

  if (q.get('measure') === '1') {
    const medir = () => { document.title = 'H=' + Math.ceil(document.documentElement.scrollHeight); };
    setTimeout(medir, 9000); setTimeout(medir, 13000);
  }

  // Resumen en cabecera
  const res = document.getElementById('resumen');
  if (res) {
    const n = secciones.reduce((a, s) => a + s.marcos.trim().split('\n').filter(l => l.trim()).length, 0);
    res.textContent = `${secciones.length} funcionalidades · ${n} marcos`;
  }
})();
