/* liard · área A (Ingeniería) · helpers compartidos por las pantallas d-ing-* y m-ing-*.
   Lee el estado con L.get y escribe solo las claves del contrato: planos[i].status/.sinId/.mult,
   lineas[i].attrs/.faltan/.estado/.org/.comprar/.dib/.spec/.motivo, avisos, y x.ing.* (privado). */
(function () {
  // Estado del plano (ElectricalPlanStatus) con la etiqueta y el color de PlanStatusBadge (dev).
  const ST = {
    PENDING: { t: 'Pendiente', c: 'gr', i: 'clock', bar: 'gr' },
    PROCESSING: { t: 'En proceso', c: 'pr', i: 'refresh-cw', bar: 'pr' },
    COMPLETED: { t: 'Listo', c: 'ok', i: 'circle-check', bar: 'ok' },
    ERROR: { t: 'Error', c: 'er', i: 'triangle-alert', bar: 'er' },
    STALE: { t: 'Por revisar', c: 'wa', i: 'circle-alert', bar: 'wa' },
  };
  // Estado de la tarjeta de proyecto (ProjectCard.tsx).
  const PST = {
    'Listo': 'ok', 'En Proceso': 'pr', 'Requiere Atención': 'er', 'Pendiente': 'gr', 'Sin Planos': 'gr',
  };
  const LST = { ready: ['ok', 'circle-check', 'Lista'], warning: ['wa', 'circle-alert', 'Con reparos'], blocked: ['er', 'triangle-alert', 'Bloquea'] };
  const ORG = { det: 'Detectado', inf: 'Inferido', reg: 'Por regla', man: 'Manual' };

  const priv = (k, def) => { const v = L.get('x.ing.' + k); return v === undefined ? def : v; };
  const linea = id => L.get('lineas').find(l => l.id === id);
  const plano = id => L.get('planos').find(p => p.id === id);

  // Conteo de planos de p1 a partir del estado (los demás proyectos traen su conteo fijo de data.js).
  function conteo(planos) {
    const c = { total: planos.length, completed: 0, processing: 0, pending: 0, error: 0, stale: 0 };
    planos.forEach(p => { const k = { COMPLETED: 'completed', PROCESSING: 'processing', PENDING: 'pending', ERROR: 'error', STALE: 'stale' }[p.status]; c[k]++; });
    return c;
  }
  function etiqueta(c) {
    if (!c.total) return 'Sin Planos';
    if (c.error || c.stale) return 'Requiere Atención';
    if (c.processing) return 'En Proceso';
    if (c.completed === c.total) return 'Listo';
    return 'Pendiente';
  }
  function proyectos() {
    const base = L.get('proyectos').map(p => (p.id === 'p1' ? { ...p, planos: conteo(L.get('planos')) } : p));
    const nuevos = priv('nuevos', []);
    return nuevos.concat(base).map(p => ({ ...p, label: etiqueta(p.planos), pct: p.planos.total ? Math.round(p.planos.completed / p.planos.total * 100) : 0 }));
  }
  // Barra tricolor: listos (emerald), en proceso (primary), error (rose), por revisar (amber), espera (gris).
  function tri(c, h) {
    if (!c.total) return `<div class="tri" style="${h ? 'height:' + h + 'px' : ''}" aria-hidden="true"><i class="gr" style="width:100%"></i></div>`;
    const seg = [['ok', c.completed], ['pr', c.processing], ['er', c.error], ['wa', c.stale], ['gr', c.pending]].filter(s => s[1] > 0);
    return `<div class="tri" style="${h ? 'height:' + h + 'px' : ''}" role="img" aria-label="${c.completed} de ${c.total} planos listos">${seg.map(([k, n]) => `<i class="${k}" style="width:${n / c.total * 100}%"></i>`).join('')}</div>`;
  }
  function badge(status, extra = '') {
    const s = ST[status];
    return `<span class="st ${s.c} ${extra}">${L.icon(s.i)}${s.t}</span>`;
  }
  function pbadge(label) { return `<span class="st ${PST[label]} ing-pst"><span class="dot ${PST[label] === 'gr' ? '' : PST[label]}"></span>${L.esc(label)}</span>`; }

  // Mejor precio sin IVA entre las ofertas de una línea (null si no tiene match).
  function mejorPrecio(id) {
    const o = L.get('ofertas')[id]; if (!o) return null;
    const ps = Object.values(o).map(x => x.precio); return ps.length ? Math.min(...ps) : null;
  }

  // ---------- Símbolos sin identificar ----------
  function simbolos(pid) {
    const est = priv('sim.' + pid, {});
    return (window.BI.simbolos[pid] || []).map(s => ({ ...s, estado: est[s.id] || 'pendiente' }));
  }
  function aviso(a) { L.update(s => { s.avisos.unshift({ id: 'ai' + Date.now(), cuando: 'recién', ...a }); }); }
  // Resolver un símbolo: marca el símbolo, baja planos[].sinId y, si corresponde, corrige la línea del BOM.
  function resolver(pid, sid, opts = {}) {
    const s = (window.BI.simbolos[pid] || []).find(x => x.id === sid); if (!s) return;
    const via = opts.via || 'manual';
    L.update(st => {
      st.x ??= {}; st.x.ing ??= {}; st.x.ing.sim ??= {}; st.x.ing.sim[pid] ??= {};
      if (st.x.ing.sim[pid][sid] && st.x.ing.sim[pid][sid] !== 'pendiente') return;
      st.x.ing.sim[pid][sid] = 'resuelto';
      const pl = st.planos.find(p => p.id === pid);
      pl.sinId = Math.max(0, pl.sinId - 1);
      const l = st.lineas.find(x => x.id === s.linea);
      if (l && s.accion === 'attr') {
        l.attrs[s.attr] = s.valor; l.faltan = l.faltan.filter(a => a !== s.attr);
        if (!l.faltan.length && l.estado === 'blocked') { l.estado = 'ready'; delete l.motivo; }
        l.org = 'man';
      }
      if (l && s.accion === 'qty') {
        l.dib += 1; l.comprar += 1 * (pl.mult || 1); l.org = 'man';
        l.fuentes = l.fuentes.map(f => f.startsWith(pl.cod + ' ') ? f.replace(/\d+/, n => String(+n + 1)) : f);
      }
      if (!pl.sinId && pl.status === 'STALE') pl.status = 'COMPLETED';
      st.x.ing.correcciones ??= [];
      st.x.ing.correcciones.push({ plano: pid, sim: sid, grupo: s.grupo || (s.accion === 'attr' ? 'texto-corriente' : null), via, linea: s.linea, f: L.get('HOY') });
    });
    if (s.accion === 'attr') aviso({ t: 'La línea del seccionador NH00 ya se puede cotizar', d: 'Martina completó la corriente nominal (160 A) desde el TS-BOMBAS', i: 'circle-check', tipo: 'ok', href: 'd-bom-editor.html?linea=l09' });
  }
  function descartar(pid, sid) {
    L.update(st => {
      st.x ??= {}; st.x.ing ??= {}; st.x.ing.sim ??= {}; st.x.ing.sim[pid] ??= {};
      if (st.x.ing.sim[pid][sid] && st.x.ing.sim[pid][sid] !== 'pendiente') return;
      st.x.ing.sim[pid][sid] = 'descartado';
      const pl = st.planos.find(p => p.id === pid);
      pl.sinId = Math.max(0, pl.sinId - 1);
      if (!pl.sinId && pl.status === 'STALE') pl.status = 'COMPLETED';
      st.x.ing.correcciones ??= []; st.x.ing.correcciones.push({ plano: pid, sim: sid, grupo: null, via: 'descarte', f: L.get('HOY') });
    });
  }
  function deshacer(pid, sid) {
    const s = (window.BI.simbolos[pid] || []).find(x => x.id === sid);
    L.update(st => {
      const cur = st.x?.ing?.sim?.[pid]?.[sid]; if (!cur || cur === 'pendiente') return;
      st.x.ing.sim[pid][sid] = 'pendiente';
      const pl = st.planos.find(p => p.id === pid); pl.sinId += 1; if (pl.status === 'COMPLETED') pl.status = 'STALE';
      if (cur === 'resuelto') {
        const l = st.lineas.find(x => x.id === s.linea);
        if (l && s.accion === 'attr') { l.attrs[s.attr] = ''; if (!l.faltan.includes(s.attr)) l.faltan.push(s.attr); l.estado = 'blocked'; l.org = 'det'; l.motivo = window.B.lineas.find(x => x.id === l.id).motivo; }
        if (l && s.accion === 'qty') { l.dib -= 1; l.comprar -= 1 * (pl.mult || 1); l.fuentes = l.fuentes.map(f => f.startsWith(pl.cod + ' ') ? f.replace(/\d+/, n => String(+n - 1)) : f); }
      }
      st.x.ing.correcciones = (st.x.ing.correcciones || []).filter(c => !(c.plano === pid && c.sim === sid));
    });
  }

  // Cambiar las repeticiones de un plano: recalcula «a comprar» de las líneas que salen de ese plano.
  function multiplicar(pid, mult) {
    L.update(st => {
      const pl = st.planos.find(p => p.id === pid); const old = pl.mult || 1; if (old === mult) return;
      pl.mult = mult;
      st.lineas.forEach(l => {
        l.fuentes = l.fuentes.map(f => {
          const m = f.match(new RegExp('^' + pl.cod.replace(/[-]/g, '\\-') + ' (\\d+)(?: ×\\d+)?$')); if (!m) return f;
          const n = +m[1]; l.comprar += n * (mult - old);
          return pl.cod + ' ' + n + (mult > 1 ? ' ×' + mult : '');
        });
      });
    });
  }

  // ---------- Dibujo del plano (visor CAD simplificado, viewBox 1000×560) ----------
  // opts.bombas: 3 | 4 · opts.nh: 'NH00' | 'NH1' · opts.sinId1: sin el diferencial ID1 · opts.capa: clase extra
  function planoSvg(opts = {}) {
    const b = opts.bombas || 3; const xs = [230, 380, 530, 680].slice(0, b);
    const nh = opts.nh || 'NH00'; const amp = nh === 'NH1' ? '250A' : '160A';
    const t = (x, y, s, a = 'middle', sz = 13) => `<text x="${x}" y="${y}" text-anchor="${a}" font-size="${sz}">${s}</text>`;
    const gir = opts.girados || [];
    const gm = (c, i) => `<g ${gir.includes(i) ? `transform="rotate(90 ${c} 260)"` : ''}><rect x="${c - 22}" y="232" width="44" height="56" rx="3"/><path d="M${c - 12} 246v28M${c} 246v28M${c + 12} 246v28M${c - 18} 260h36"/>${t(c - 27, 252, 'Q' + i, 'end', 11)}</g>`;
    const km = (c, i) => `<g><rect x="${c - 22}" y="338" width="44" height="52" rx="3"/><path d="M${c - 12} 348l8 14M${c} 348l8 14M${c + 12} 348l8 14M${c - 16} 380h32"/>${t(c - 27, 358, 'KM' + i, 'end', 11)}</g>`;
    const mot = (c, i) => `<g><path d="M${c} 390v40"/><circle cx="${c}" cy="456" r="26"/>${t(c, 452, 'M', 'middle', 15)}${t(c, 468, '3~', 'middle', 11)}${t(c, 506, 'BOMBA ' + i + ' · ' + (i === 4 ? '1,1' : '5,5') + ' kW', 'middle', 11)}</g>`;
    const feeds = xs.map(c => `<path d="M${c} 170v62M${c} 288v50"/>`).join('');
    const aux = [790, 860, 930];
    return `<svg class="ing-plano ${opts.capa || ''}" viewBox="0 0 1000 560" role="img" aria-label="Plano ${L.esc(opts.titulo || 'TS-BOMBAS')}" preserveAspectRatio="xMidYMid meet">
      <g fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
        <path d="M130 0v40M130 134v36"/>
        <rect x="96" y="58" width="68" height="60" rx="4"/><path d="M118 70v36M142 70v36M108 88h44"/><rect x="122" y="78" width="16" height="20"/>
        <path d="M130 170H960" stroke-width="5"/>
        ${feeds}
        ${xs.map((c, i) => gm(c, i + 1) + km(c, i + 1) + mot(c, i + 1)).join('')}
        <path d="M790 170v48M790 291v101"/>
        <rect x="770" y="226" width="40" height="58" rx="3"/><path d="M780 240l20 30M800 240l-20 30"/>
        ${b > 3 ? '<path d="M860 170v48M860 291v101"/><rect x="840" y="226" width="40" height="58" rx="3"/><path d="M850 240l20 30M870 240l-20 30"/>' : ''}
        ${opts.sinId1 ? '' : '<path d="M930 170v48M930 291v101"/><rect x="910" y="226" width="40" height="58" rx="3"/><circle cx="930" cy="255" r="12"/>'}
        <rect x="775" y="398" width="30" height="44" rx="3"/><path d="M782 420h16M790 408v24"/>
        ${b > 3 ? '<rect x="845" y="398" width="30" height="44" rx="3"/><path d="M852 420h16M860 408v24"/>' : ''}
        <circle cx="930" cy="420" r="16"/><path d="M919 409l22 22M941 409l-22 22"/>
        <rect x="760" y="504" width="230" height="48" stroke-width="1.5"/><path d="M760 528h230M880 504v48" stroke-width="1"/>
      </g>
      <g fill="currentColor" stroke="none" font-family="var(--mono)" class="ing-plano-t">
        ${t(176, 52, 'Q0 · ' + nh, 'start', 12)}
        ${t(215, 92, nh + ' ' + amp, 'start', 14)}
        ${t(950, 160, 'BARRA 3×380 V + N', 'end', 11)}
        ${t(790, 214, 'F1', 'middle', 12)}${b > 3 ? t(860, 214, 'F2', 'middle', 12) : ''}${opts.sinId1 ? '' : t(930, 214, 'ID1', 'middle', 12)}
        ${t(790, 460, 'S1', 'middle', 12)}${b > 3 ? t(860, 460, 'S2', 'middle', 12) : ''}${t(930, 452, 'H1', 'middle', 12)}
        ${t(768, 521, 'TS-BOMBAS', 'start', 12)}${t(888, 521, opts.rev || 'Rev. 1', 'start', 12)}
        ${t(768, 545, 'Tableros Delta', 'start', 10)}${t(888, 545, opts.fecha || '29/09/2026', 'start', 10)}
      </g>
    </svg>`;
  }
  const pos = o => `left:${o.x}%;top:${o.y}%;width:${o.w}%;height:${o.h}%`;
  // Recorte ampliado de una zona del plano (o en % del visor), con la zona resaltada.
  function cropSvg(o, opts = {}, pad = 7) {
    const x = (o.x - pad) * 10, y = (o.y - pad) * 5.6, w = (o.w + 2 * pad) * 10, h = (o.h + 2 * pad) * 5.6;
    return planoSvg(opts).replace('viewBox="0 0 1000 560"', `viewBox="${x} ${y} ${w} ${h}"`)
      .replace(/<\/svg>\s*$/, `<rect x="${o.x * 10}" y="${o.y * 5.6}" width="${o.w * 10}" height="${o.h * 5.6}" rx="3" style="fill:color-mix(in srgb, var(--amber-400) 10%, transparent);stroke:var(--amber-500);stroke-width:3"/></svg>`);
  }

  // ---------- Shell de un recuadro de plano sin datos: estados ----------
  function skel(n = 3, h = 72) { return Array.from({ length: n }, () => `<div class="skel" style="height:${h}px"></div>`).join(''); }

  window.I = { ST, LST, ORG, PST, conteo, etiqueta, proyectos, tri, badge, pbadge, mejorPrecio, simbolos, resolver, descartar, deshacer, multiplicar, planoSvg, pos, cropSvg, skel, linea, plano, priv, aviso };
})();
