/* liard horizon · runtime compartido
   - L.store: estado persistente (localStorage) sembrado desde data.js; se propaga entre pestañas e iframes.
   - L.* dominio: cantidades, bloqueos, matching por igualdad, cotización de referencia, solicitudes, ofertas,
     comparación, adjudicación, pedidos, presupuesto y margen, IA con presupuesto, notificaciones y automatizaciones.
   - Shell: barra lateral / barra inferior según data-role y class="m"; topbar; notificaciones; menú Demo; ⌘K.
   - UI: íconos, toasts, diálogos, tablas ordenables, descargas reales (CSV, XLSX, PDF, JSON).
   Las pantallas NO editan este archivo: piden lo que les falta al coordinador. */
(function () {
  'use strict';
  const L = (window.L = {});
  const qs = new URLSearchParams(location.search);
  /* Los marcos de la galería (?frame=<id>) usan un estado propio sembrado desde cero: mirar la galería no cambia la demo.
     «abrir» y la navegación normal usan el estado compartido. */
  const KEY = 'liard-horizon:v3' + (qs.get('frame') ? ':frame:' + qs.get('frame') : '');

  /* ─────────── Íconos (trazos lucide, inline para que funcionen en file://) ─────────── */
  const P = {
    home: '<path d="M3 10.5 12 3l9 7.5"/><path d="M5 9.5V21h14V9.5"/><path d="M10 21v-6h4v6"/>',
    folder: '<path d="M3 6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
    file: '<path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><path d="M14 3v6h6"/>',
    layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
    list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    cube: '<path d="M21 16V8l-9-5-9 5v8l9 5z"/><path d="m3.3 7 8.7 5 8.7-5M12 22V12"/>',
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    filter: '<path d="M3 5h18l-7 8v6l-4 2v-8z"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', minus: '<path d="M5 12h14"/>',
    x: '<path d="M18 6 6 18M6 6l12 12"/>', check: '<path d="m5 12 5 5 9-10"/>',
    alert: '<path d="M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    alertc: '<circle cx="12" cy="12" r="9"/><path d="M12 8v4M12 16h.01"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 16v-4M12 8h.01"/>',
    chevr: '<path d="m9 18 6-6-6-6"/>', chevl: '<path d="m15 18-6-6 6-6"/>', chevd: '<path d="m6 9 6 6 6-6"/>', chevu: '<path d="m18 15-6-6-6 6"/>',
    arrowr: '<path d="M5 12h14M13 5l7 7-7 7"/>', arrowl: '<path d="M19 12H5M11 5l-7 7 7 7"/>',
    download: '<path d="M12 3v12M7 10l5 5 5-5M4 21h16"/>', upload: '<path d="M12 21V9M7 14l5-5 5 5M4 3h16"/>',
    send: '<path d="m22 2-7 20-4-9-9-4z"/><path d="M22 2 11 13"/>', inbox: '<path d="M22 12h-6l-2 3h-4l-2-3H2"/><path d="M5.5 5h13L22 12v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2v-6z"/>',
    truck: '<path d="M1 4h14v12H1zM15 9h4l3 3v4h-7"/><circle cx="6" cy="18" r="2"/><circle cx="18" cy="18" r="2"/>',
    store: '<path d="M3 9 5 3h14l2 6"/><path d="M3 9h18v2a3 3 0 0 1-6 0 3 3 0 0 1-6 0 3 3 0 0 1-6 0z"/><path d="M5 13v8h14v-8"/>',
    users: '<circle cx="9" cy="8" r="4"/><path d="M1 21a8 8 0 0 1 16 0"/><path d="M17 4a4 4 0 0 1 0 8M23 21a8 8 0 0 0-5-7.4"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    bell: '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.9 1.9 0 0 0 3.4 0"/>',
    sparkles: '<path d="M12 3 13.9 8.1 19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z"/><path d="M19 3v4M17 5h4M5 17v4M3 19h4"/>',
    zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9z"/>',
    chart: '<path d="M3 3v18h18"/><path d="M7 16v-5M12 16V8M17 16v-8"/>',
    coins: '<circle cx="8" cy="8" r="6"/><path d="M18.1 10.4A6 6 0 1 1 10.3 18M7 6h1v4M16.7 13.9l.7.7-2.8 2.8"/>',
    percent: '<path d="M19 5 5 19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>',
    compare: '<circle cx="5" cy="6" r="3"/><circle cx="19" cy="18" r="3"/><path d="M12 6h5a2 2 0 0 1 2 2v7M12 18H7a2 2 0 0 1-2-2V9"/>',
    message: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    play: '<path d="m6 4 14 8-14 8z"/>', pause: '<path d="M6 4h4v16H6zM14 4h4v16h-4z"/>',
    refresh: '<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
    edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
    eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
    lock: '<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    shield: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
    card: '<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>',
    activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    rotate: '<path d="M16.5 5.5A8 8 0 1 0 20 12"/><path d="M20 4v5h-5"/>',
    maximize: '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>',
    sliders: '<path d="M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6"/>',
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
    table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
    bot: '<rect x="4" y="8" width="16" height="12" rx="2"/><path d="M12 8V4M8 14h.01M16 14h.01M9 18h6"/>',
    workflow: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M6 9v4a2 2 0 0 0 2 2h7"/>',
    mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
    phone: '<rect x="6" y="2" width="12" height="20" rx="2"/><path d="M11 18h2"/>',
    calendar: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
    star: '<path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z"/>',
    link: '<path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7"/><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7"/>',
    unlink: '<path d="m18.8 13.4 1.7-1.7a5 5 0 0 0-7-7l-1.7 1.7M5.2 10.6l-1.7 1.7a5 5 0 0 0 7 7l1.7-1.7M8 2v3M2 8h3M16 22v-3M22 16h-3"/>',
    copy: '<rect x="9" y="9" width="12" height="12" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
    ext: '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
    logout: '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01"/>',
    scissors: '<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>',
    scan: '<path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 12h10"/>',
    target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
    flag: '<path d="M4 22V4M4 4h13l-2 4 2 4H4"/>', tag: '<path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z"/><path d="M7.5 7.5h.01"/>',
    wand: '<path d="m15 4 5 5L9 20l-5-5z"/><path d="M14 5 19 10M4 2v4M2 4h4M20 16v4M18 18h4"/>',
    split: '<path d="M16 3h5v5M8 3H3v5M21 3l-7 7M3 3l7 7M12 22v-8"/>',
    history: '<path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5M12 7v5l3 2"/>',
    receipt: '<path d="M4 2v20l3-2 3 2 3-2 3 2 3-2 1 1V2l-1 1-3-2-3 2-3-2-3 2-3-2z"/><path d="M8 7h8M8 11h8M8 15h5"/>',
    plug: '<path d="M9 2v6M15 2v6M6 8h12v4a6 6 0 0 1-12 0zM12 18v4"/>',
    gauge: '<path d="M12 14 16 10"/><path d="M3.3 19a10 10 0 1 1 17.4 0z"/>',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/>',
    command: '<path d="M18 3a3 3 0 0 0-3 3v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 0 0 0-6z"/>',
  };
  L.icon = (name, size = 16, cls = '') =>
    `<svg class="ic ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${P[name] || P.info}</svg>`;
  L.icons = Object.keys(P);

  /* ─────────── Store ─────────── */
  const clone = o => JSON.parse(JSON.stringify(o));
  let state = null; let reloading = false;
  const subs = new Set();
  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) { const s = JSON.parse(raw); if (s && s.version === B.seed.version) return s; }
    } catch (e) { /* almacenamiento no disponible: se usa la semilla en memoria */ }
    const s = clone(B.seed); persist(s); return s;
  }
  function persist(s) { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch (e) { /* cuota o modo privado */ } }
  L.store = {
    get: () => state || (state = load()),
    /* update(fn): fn recibe el estado y lo muta; se guarda y se avisa a los suscriptores de esta página y de las demás. */
    update(fn) { const s = L.store.get(); const r = fn(s); persist(s); subs.forEach(cb => cb(s)); return r; },
    subscribe(cb) { subs.add(cb); return () => subs.delete(cb); },
    reset() { localStorage.setItem('liard-horizon:resetAt', String(Date.now())); Object.keys(localStorage).filter(k => k.startsWith('liard-horizon:') && k !== 'liard-horizon:resetAt').forEach(k => localStorage.removeItem(k)); state = clone(B.seed); persist(state); },
    export: () => JSON.stringify(L.store.get(), null, 2),
  };
  window.addEventListener('storage', e => {
    /* Reinicio en otra pestaña o marco: los ids que tenía esta página pueden no existir más, así que se recarga. */
    if (reloading) return;
    if (e.key === 'liard-horizon:resetAt' && e.newValue) { reloading = true; location.reload(); return; }
    if (e.key === KEY) { state = null; const s = L.store.get(); subs.forEach(cb => cb(s)); } });
  /* Preferencias de interfaz por pantalla (vista elegida, filtros), también persistentes. */
  L.pref = (k, v) => { const key = 'liard-horizon:ui:' + (qs.get('frame') ? 'frame:' + qs.get('frame') + ':' : '') + k; if (v === undefined) { try { return JSON.parse(localStorage.getItem(key)); } catch (e) { return null; } } localStorage.setItem(key, JSON.stringify(v)); return v; };

  /* ─────────── Formato ─────────── */
  const nf0 = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });
  const nf2 = new Intl.NumberFormat('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  L.ars = v => (v == null || isNaN(v)) ? '—' : 'ARS ' + nf0.format(Math.round(v));
  L.arsShort = v => { if (v == null || isNaN(v)) return '—'; const a = Math.abs(v); if (a >= 1e6) return 'ARS ' + nf2.format(v / 1e6).replace(/,00$/, '') + ' M'; if (a >= 1e3) return 'ARS ' + nf0.format(v / 1e3) + ' mil'; return 'ARS ' + nf0.format(v); };
  L.usd = v => (v == null || isNaN(v)) ? '—' : 'USD ' + nf2.format(v);
  L.num = v => nf0.format(v);
  L.dec = v => nf2.format(v);
  L.pct = (v, d = 0) => (v == null || isNaN(v)) ? '—' : new Intl.NumberFormat('es-AR', { maximumFractionDigits: d }).format(v) + ' %';
  const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  L.date = d => { if (!d) return '—'; const x = new Date(d.length <= 10 ? d + 'T12:00:00' : d); return x.getDate() + ' ' + MONTHS[x.getMonth()] + ' ' + x.getFullYear(); };
  L.dateShort = d => { if (!d) return '—'; const x = new Date(d.length <= 10 ? d + 'T12:00:00' : d); return x.getDate() + ' ' + MONTHS[x.getMonth()]; };
  L.time = d => { const x = new Date(d); return String(x.getHours()).padStart(2, '0') + ':' + String(x.getMinutes()).padStart(2, '0'); };
  L.now = () => { const t = new Date(); const z = n => String(n).padStart(2, '0'); return B.TODAY + 'T' + z(t.getHours()) + ':' + z(t.getMinutes()) + ':' + z(t.getSeconds()); };
  L.daysBetween = (a, b) => Math.round((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 864e5);
  L.addDays = (d, n) => { const x = new Date(d + 'T12:00:00'); x.setDate(x.getDate() + n); return x.toISOString().slice(0, 10); };
  L.esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  L.param = (k, d = null) => qs.has(k) ? qs.get(k) : d;
  L.setParam = (k, v) => { const u = new URL(location.href); if (v == null || v === '') u.searchParams.delete(k); else u.searchParams.set(k, v); history.replaceState(null, '', u); qs.delete(k); if (v != null && v !== '') qs.set(k, v); };
  L.link = (href, extra) => { const u = new URL(href, location.href); const keep = ['p', 'full', 'bare', 'frame']; keep.forEach(k => { if (qs.has(k) && !u.searchParams.has(k)) u.searchParams.set(k, qs.get(k)); }); Object.entries(extra || {}).forEach(([k, v]) => u.searchParams.set(k, v)); return u.pathname.split('/').pop() + u.search; };
  L.uid = p => p + '-' + Math.random().toString(36).slice(2, 8);

  /* ─────────── Dominio: lecturas ─────────── */
  const S = () => L.store.get();
  L.project = id => S().projects.find(p => p.id === id);
  L.currentProjectId = () => { const p = L.param('p'); if (p && L.project(p)) return p; const last = S().session.lastProjectId; return L.project(last) ? last : S().projects[0].id; };
  L.plansOf = pid => S().plans.filter(p => p.projectId === pid && !p.deleted);
  L.plan = id => S().plans.find(p => p.id === id);
  L.linesOf = pid => S().bomLines.filter(l => l.projectId === pid && !l.deleted);
  L.line = id => S().bomLines.find(l => l.id === id);
  L.type = id => S().types[id];
  L.supplier = id => S().suppliers.find(s => s.id === id);
  L.member = id => S().team.find(u => u.id === id);
  L.who = id => { const m = L.member(id); if (m) return m.name; const s = L.supplier(id); if (s) return s.short; return id === 'sistema' ? 'liard' : id; };
  L.unidentifiedOf = pid => S().unidentified.filter(u => { const pl = L.plan(u.planId); return pl && pl.projectId === pid && u.status === 'PENDIENTE'; });

  L.attrText = (typeId, attrs) => { const t = L.type(typeId); if (!t) return ''; return t.attrs.map(a => attrs[a.k] == null || attrs[a.k] === '' ? null : (a.k === 'curva' ? 'curva ' + attrs[a.k] : attrs[a.k] + (a.unit ? ' ' + a.unit : ''))).filter(Boolean).join(' · '); };
  L.lineLabel = l => { const t = L.type(l.typeId); return t ? t.short + ' ' + L.attrText(l.typeId, l.attrs) : (l.freeText || 'Material sin componente base'); };
  L.brandLabel = b => b == null ? 'Sin decidir' : b === 'ANY' ? 'Cualquier marca' : b;
  /* Cantidad dibujada (en los planos) y a comprar (multiplicada por las repeticiones de cada tablero). */
  L.qtyDrawn = l => Object.values(l.perPlan || {}).reduce((a, b) => a + b, 0) + (l.extraQty || 0);
  L.qty = l => Object.entries(l.perPlan || {}).reduce((a, [pid, q]) => { const p = L.plan(pid); return a + q * (p ? p.multiplier || 1 : 1); }, 0) + (l.extraQty || 0);
  L.missingAttrs = l => { const t = L.type(l.typeId); if (!t) return []; return t.attrs.filter(a => a.req && (l.attrs[a.k] == null || l.attrs[a.k] === '')); };
  /* Problemas de una línea. `blocks` = impide solicitar cotización (regla de la app actual: material, cantidad, especificación y decisión de marca). */
  L.lineIssues = l => {
    const out = [];
    if (!l.typeId) out.push({ code: 'SIN_BASE', text: 'Sin componente base: no se puede cotizar por atributos', blocks: false, quote: 'NOT_FOUND' });
    L.missingAttrs(l).forEach(a => out.push({ code: 'FALTA_ATRIBUTO', text: 'Falta ' + a.label.toLowerCase(), blocks: false, quote: 'NOT_FOUND' }));
    if (L.qty(l) <= 0) out.push({ code: 'CANTIDAD', text: 'La cantidad tiene que ser mayor a 0', blocks: true });
    if (l.brand == null) out.push({ code: 'MARCA', text: 'Falta decidir la marca (una marca o «Cualquier marca»)', blocks: true });
    const pr = L.project(l.projectId); if (pr && l.brand && L.effectiveBrandRules(pr.id).blocked.includes(l.brand)) out.push({ code: 'MARCA_EXCLUIDA', text: 'Marca excluida por las reglas de la obra', blocks: false, quote: 'QUOTED' });
    return out;
  };
  /* Reglas de marca efectivas: las de la obra pisan a las de la cuenta (preferidas ordenadas, excluidas). */
  L.effectiveBrandRules = pid => { const acc = (S().company.brandRules) || { preferred: [], blocked: [] }; const pr = L.project(pid); const pj = (pr && pr.brandRules) || { preferred: [], blocked: [] };
    const blocked = [...new Set([...pj.blocked, ...acc.blocked.filter(b => !pj.preferred.includes(b))])];
    const preferred = [...new Set([...pj.preferred, ...acc.preferred])].filter(b => !blocked.includes(b));
    return { preferred, blocked, account: acc, project: pj }; };
  /* Misma identidad canónica: mismo componente base y mismos valores en todos sus atributos (sin importar el orden). */
  L.sameSpec = (typeA, attrsA, typeB, attrsB) => { if (typeA !== typeB) return false; const t = L.type(typeA); const keys = t ? t.attrs.map(a => a.k) : [...new Set([...Object.keys(attrsA || {}), ...Object.keys(attrsB || {})])]; return keys.every(k => String((attrsA || {})[k] ?? '') === String((attrsB || {})[k] ?? '')); };
  L.planStatusLabel = { PENDING: 'Pendiente', PROCESSING: 'En proceso', COMPLETED: 'Listo', ERROR: 'Error', STALE: 'Por revisar' };
  L.planStatusTone = { PENDING: 'muted', PROCESSING: 'info', COMPLETED: 'ok', ERROR: 'err', STALE: 'warn' };

  /* Qué impide pedir cotización en una obra (espejo de las reglas actuales de la app). */
  L.blockers = pid => {
    const out = [];
    const plans = L.plansOf(pid), lines = L.linesOf(pid);
    if (!plans.length) out.push({ code: 'SIN_PLANOS', text: 'La obra no tiene planos.', href: 'd-obra.html' });
    if (plans.some(p => p.status === 'PROCESSING')) out.push({ code: 'PROCESANDO', text: 'Hay planos procesándose.', href: 'd-obra.html' });
    const un = L.unidentifiedOf(pid).length; if (un) out.push({ code: 'SIMBOLOS', text: un + (un === 1 ? ' símbolo sin identificar.' : ' símbolos sin identificar.'), href: 'd-plano.html' });
    if (!lines.length) out.push({ code: 'BOM_VACIO', text: 'El BOM está vacío.', href: 'd-bom.html' });
    const nb = lines.filter(l => L.lineIssues(l).some(i => i.blocks)).length; if (nb) out.push({ code: 'LINEAS', text: nb + (nb === 1 ? ' línea sin decisión de marca o cantidad.' : ' líneas sin decisión de marca o cantidad.'), href: 'd-bom.html' });
    return out;
  };
  L.projectStage = pid => {
    const pr = L.project(pid), plans = L.plansOf(pid);
    const reqs = S().requests.filter(r => r.projectId === pid);
    const ords = S().orders.filter(o => o.projectId === pid);
    if (ords.length) return ords.every(o => o.status === 'CONFIRMED') ? { id: 'pedido', label: 'Pedidos confirmados', tone: 'ok' } : { id: 'pedido', label: 'Pedidos emitidos', tone: 'info' };
    if (reqs.some(r => r.status === 'ABIERTA')) return { id: 'comparacion', label: 'Esperando ofertas', tone: 'info' };
    if (!plans.length) return { id: 'nuevo', label: 'Sin planos', tone: 'muted' };
    if (plans.some(p => p.status === 'PROCESSING')) return { id: 'proceso', label: 'En proceso', tone: 'info' };
    if (plans.some(p => p.status === 'ERROR')) return { id: 'atencion', label: 'Requiere atención', tone: 'err' };
    if (plans.some(p => p.status === 'STALE')) return { id: 'atencion', label: 'Planos por revisar', tone: 'warn' };
    if (L.blockers(pid).length) return { id: 'revision', label: 'En revisión', tone: 'warn' };
    return { id: 'lista', label: 'Lista para cotizar', tone: 'ok' };
  };

  /* ─────────── Matching por igualdad (como el backend): mismo componente base + mismos atributos esenciales;
     la marca filtra solo si la línea pide una. Nunca por texto. ─────────── */
  L.isStale = item => item.priceValidUntil && item.priceValidUntil < B.TODAY;
  L.matches = (l, supplierId) => {
    const t = L.type(l.typeId); if (!t || L.missingAttrs(l).length) return [];
    return S().catalog.filter(c => c.published && c.typeId === l.typeId && (!supplierId || c.supplierId === supplierId)
      && t.attrs.filter(a => a.req).every(a => c.attrs[a.k] != null && c.attrs[a.k] !== '' && String(c.attrs[a.k]) === String(l.attrs[a.k]))
      && (!l.brand || l.brand === 'ANY' || c.brand === l.brand));
  };
  L.unmatchedReason = l => {
    if (!l.typeId) return 'La línea no tiene componente base.';
    const m = L.missingAttrs(l); if (m.length) return 'Falta ' + m.map(a => a.label.toLowerCase()).join(', ') + '.';
    if (!L.matches(Object.assign({}, l, { brand: 'ANY' })).length) return 'Ningún distribuidor tiene este material en su catálogo.';
    if (!L.matches(l).length) return 'Ningún catálogo tiene la marca pedida (' + l.brand + ').';
    return null;
  };
  /* Cotización de referencia: precios de catálogo (no confirmados), mejor ítem por distribuidor y línea. */
  L.referenceQuote = pid => {
    const lines = L.linesOf(pid);
    const bySupplier = S().suppliers.map(s => {
      let total = 0, covered = 0, lead = 0, stale = 0; const rows = [];
      lines.forEach(l => {
        const ms = L.matches(l, s.id).sort((a, b) => a.price - b.price); const best = ms[0];
        if (best) { covered++; total += best.price * L.qty(l); lead = Math.max(lead, best.leadDays); if (L.isStale(best)) stale++; }
        rows.push({ lineId: l.id, item: best || null, alternatives: ms.slice(1) });
      });
      return { supplierId: s.id, total, covered, count: lines.length, coverage: lines.length ? covered / lines.length * 100 : 0, lead, stale, rows };
    });
    const perLine = lines.map(l => { const ms = L.matches(l).sort((a, b) => a.price - b.price); return { lineId: l.id, best: ms[0] || null, count: ms.length, reason: ms.length ? null : L.unmatchedReason(l) }; });
    const bestTotal = perLine.reduce((a, r) => a + (r.best ? r.best.price * L.qty(L.line(r.lineId)) : 0), 0);
    return { bySupplier, perLine, bestTotal, notFound: perLine.filter(r => !r.best).length };
  };

  /* ─────────── Solicitudes, ofertas, adjudicación, pedidos ─────────── */
  L.requestsOf = pid => S().requests.filter(r => r.projectId === pid);
  L.request = id => S().requests.find(r => r.id === id);
  L.offersOf = rid => S().offers.filter(o => o.requestId === rid);
  L.offer = (rid, sid) => S().offers.find(o => o.requestId === rid && o.supplierId === sid);
  L.offerStatusLabel = { PENDIENTE: 'Sin responder', BORRADOR: 'En preparación', ENVIADA: 'Oferta enviada', DECLINADA: 'No cotiza', VENCIDA: 'Vencida' };
  L.offerStatusTone = { PENDIENTE: 'muted', BORRADOR: 'warn', ENVIADA: 'ok', DECLINADA: 'err', VENCIDA: 'err' };
  L.stockLabel = { CONFIRMADO: 'Stock confirmado', PARCIAL: 'Stock parcial', A_PEDIDO: 'A pedido', DESCONOCIDO: 'Disponibilidad sin confirmar' };
  L.stockTone = { CONFIRMADO: 'ok', PARCIAL: 'warn', A_PEDIDO: 'warn', DESCONOCIDO: 'muted' };
  L.orderStatusLabel = { SENT: 'Emitido · esperando respuesta', CONFIRMED: 'Confirmado', REJECTED: 'Rechazado', EXPIRED: 'Vencido' };
  L.orderStatusTone = { SENT: 'info', CONFIRMED: 'ok', REJECTED: 'err', EXPIRED: 'err' };
  L.offerValid = o => o && o.status === 'ENVIADA' && (!o.validUntil || o.validUntil >= B.TODAY);
  /* Precio efectivo de una línea de oferta (si es alternativa, el de la alternativa). */
  L.offerLinePrice = ol => !ol || ol.mode === 'SIN_OFERTA' ? null : ol.mode === 'ALTERNATIVA' ? ol.alt.unitPrice : ol.unitPrice;
  L.offerTotal = o => { const r = L.request(o.requestId); return o.lines.reduce((a, ol) => { const p = L.offerLinePrice(ol); const l = L.line(ol.lineId); return a + (p ? p * L.reqQty(r, l) : 0); }, 0); };
  L.reqQty = (r, l) => (r && r.qtySnapshot && r.qtySnapshot[l.id] != null) ? r.qtySnapshot[l.id] : L.qty(l);

  function notify(s, n) { s.notifications.unshift(Object.assign({ id: L.uid('n'), at: L.now(), read: false }, n)); }
  function mail(s, to, subject, body) { s.outbox.unshift({ id: L.uid('e'), to, at: L.now(), subject, body }); }
  function log(s, pid, who, text) { s.activity.unshift({ id: L.uid('a'), projectId: pid, at: L.now(), who, text }); }
  /* Reglas activas para un evento: las de la semilla usan ids fijos; las creadas en la pantalla usan el mismo campo `when`. */
  function automation(s, when) { return s.automations.find(a => a.when === when && a.enabled); }
  L.fireAutomations = (s, when, ctx) => s.automations.filter(a => a.when === when && a.enabled && a.custom).forEach(a => {
    const m = s.team.find(u => u.area === a.area) || s.team[0];
    if (a.channel === 'app') notify(s, { role: 'ENGINEER', title: a.label, body: ctx.text, href: ctx.href || 'd-inicio.html' }); else mail(s, m.email, a.label, ctx.text);
  });
  L._notify = notify; L._mail = mail; L._log = log;

  L.createRequest = ({ projectId, supplierIds, lineIds, deadline, note, alternativesAllowed }) => L.store.update(s => {
    const seq = Math.max(...s.requests.map(r => +r.code.split('-')[1])) + 1;
    const code = 'SC-' + String(seq).padStart(4, '0');
    const qtySnapshot = {}, altSnapshot = {}; lineIds.forEach(id => { const ln = s.bomLines.find(l => l.id === id); qtySnapshot[id] = L.qty(ln); if (ln.alt) altSnapshot[id] = JSON.parse(JSON.stringify(ln.alt)); });
    const r = { id: 'r-' + String(seq).padStart(4, '0'), projectId, code, createdAt: L.now(), deadline, supplierIds, lineIds, qtySnapshot, altSnapshot, alternativesAllowed: !!alternativesAllowed, note: note || '', status: 'ABIERTA' };
    s.requests.unshift(r);
    const pr = s.projects.find(p => p.id === projectId);
    supplierIds.forEach(sid => {
      s.offers.push({ id: L.uid('o'), requestId: r.id, supplierId: sid, status: 'PENDIENTE', lines: [] });
      const sup = s.suppliers.find(x => x.id === sid);
      notify(s, { role: 'SUPPLIER', supplierId: sid, title: 'Solicitud ' + code + ' recibida', body: s.company.name + ' pide ' + lineIds.length + ' materiales. Vence el ' + L.date(deadline) + '.', href: 'd-prov-oferta.html?r=' + r.id });
      mail(s, sup.email, 'Nueva solicitud de cotización ' + code, s.company.name + ' te pidió cotización de ' + lineIds.length + ' materiales para «' + pr.name + '». Respondé antes del ' + L.date(deadline) + ' desde liard.');
      if (sid === s.session.supplierId) s.billing.supplier.leadsThisMonth++;
    });
    log(s, projectId, s.session.userId, 'Envió la solicitud ' + code + ' a ' + supplierIds.length + (supplierIds.length === 1 ? ' distribuidor.' : ' distribuidores.'));
    return r;
  });
  /* El distribuidor arranca su oferta desde su propio catálogo: precio de referencia, disponibilidad sin confirmar. */
  L.prefillOffer = (rid, sid) => L.store.update(s => {
    const o = s.offers.find(x => x.requestId === rid && x.supplierId === sid); const r = s.requests.find(x => x.id === rid);
    if (!o || o.lines.length) return o;
    o.lines = r.lineIds.map(id => {
      const l = s.bomLines.find(x => x.id === id);
      const m = L.matches(l, sid).sort((a, b) => a.price - b.price)[0];
      return m ? { lineId: id, mode: 'CATALOGO', itemId: m.id, brand: m.brand, code: m.code, refPrice: m.price, unitPrice: m.price, stock: 'DESCONOCIDO', leadDays: m.leadDays, stale: L.isStale(m) }
        : { lineId: id, mode: 'SIN_OFERTA', note: '' };
    });
    o.status = 'BORRADOR'; o.validUntil = L.addDays(B.TODAY, 10); o.paymentTerms = o.paymentTerms || '30 días';
    return o;
  });
  L.saveOffer = (oid, patch) => L.store.update(s => { const o = s.offers.find(x => x.id === oid); Object.assign(o, patch); if (o.status === 'PENDIENTE') o.status = 'BORRADOR'; return o; });
  /* Validación de una oferta antes de enviarla. Devuelve lista de errores por línea o generales. */
  L.validateOffer = o => {
    const errs = [];
    if (!o.validUntil || o.validUntil < B.TODAY) errs.push({ field: 'validUntil', text: 'La validez tiene que ser una fecha de hoy en adelante.' });
    if (!o.paymentTerms) errs.push({ field: 'paymentTerms', text: 'Indicá la condición de pago.' });
    o.lines.forEach(ol => {
      const r = L.request(o.requestId);
      if (ol.mode === 'SIN_OFERTA') { if (ol.declared && !(ol.note || '').trim()) errs.push({ lineId: ol.lineId, text: 'Contá por qué no cotizás esta línea.' }); return; }
      if (ol.mode === 'ALTERNATIVA' && r && !r.alternativesAllowed) errs.push({ lineId: ol.lineId, text: 'Esta solicitud no acepta alternativas.' });
      if (ol.mode === 'ALTERNATIVA') { if (!ol.alt || !ol.alt.code || !(ol.alt.unitPrice > 0)) errs.push({ lineId: ol.lineId, text: 'La alternativa necesita código y precio.' }); if (ol.alt && !ol.alt.reason) errs.push({ lineId: ol.lineId, text: 'Explicá por qué la alternativa es equivalente.' }); }
      else if (!(ol.unitPrice > 0)) errs.push({ lineId: ol.lineId, text: 'El precio tiene que ser mayor a 0.' });
      if (!(ol.leadDays >= 0)) errs.push({ lineId: ol.lineId, text: 'Indicá el plazo de entrega en días.' });
      if (ol.stock === 'PARCIAL' && !(ol.stockQty > 0)) errs.push({ lineId: ol.lineId, text: 'Con stock parcial, indicá cuántas unidades tenés.' });
    });
    if (o.lines.every(ol => ol.mode === 'SIN_OFERTA')) errs.push({ text: 'La oferta no cotiza ningún material. Si no vas a cotizar, usá «No cotizar».' });
    return errs;
  };
  L.submitOffer = oid => L.store.update(s => {
    const o = s.offers.find(x => x.id === oid); const errs = L.validateOffer(o); if (errs.length) return { ok: false, errs };
    o.lines.forEach(ol => { const own = ol.basePrice != null ? ol.basePrice : ol.unitPrice; if (ol.mode === 'CATALOGO' && ol.refPrice && own !== ol.refPrice) ol.mode = 'AJUSTADO'; });
    o.status = 'ENVIADA'; o.submittedAt = L.now();
    const r = s.requests.find(x => x.id === o.requestId); const sup = s.suppliers.find(x => x.id === o.supplierId);
    const alts = o.lines.filter(l => l.mode === 'ALTERNATIVA').length;
    notify(s, { role: 'ENGINEER', title: 'Nueva oferta en ' + r.code, body: sup.short + ' respondió' + (alts ? ' con ' + alts + (alts === 1 ? ' alternativa' : ' alternativas') + ' para revisar.' : '.'), href: 'd-comparar.html?r=' + r.id + '&p=' + r.projectId });
    if (automation(s, 'OFERTA_RECIBIDA')) mail(s, s.team[0].email, 'Llegó la oferta de ' + sup.short + ' (' + r.code + ')', 'Ya podés compararla en liard.');
    L.fireAutomations(s, 'OFERTA_RECIBIDA', { text: sup.short + ' envió su oferta para ' + r.code + '.', href: 'd-comparar.html?r=' + r.id + '&p=' + r.projectId });
    log(s, r.projectId, sup.id, sup.short + ' envió su oferta' + (alts ? ' con ' + alts + ' alternativa' + (alts > 1 ? 's' : '') : '') + '.');
    return { ok: true };
  });
  L.declineOffer = (oid, reason) => L.store.update(s => {
    const o = s.offers.find(x => x.id === oid); o.status = 'DECLINADA'; o.declineReason = reason || ''; o.submittedAt = L.now();
    const r = s.requests.find(x => x.id === o.requestId); const sup = s.suppliers.find(x => x.id === o.supplierId);
    notify(s, { role: 'ENGINEER', title: sup.short + ' no cotiza ' + r.code, body: reason || 'Sin motivo indicado.', href: 'd-comparar.html?r=' + r.id + '&p=' + r.projectId });
    log(s, r.projectId, sup.id, sup.short + ' indicó que no cotiza.');
  });
  /* Respuesta simulada de otro distribuidor (solo demo): arma la oferta desde su catálogo con ajustes chicos. */
  L.simulateOffer = (rid, sid) => { L.prefillOffer(rid, sid); return L.store.update(s => { const o = s.offers.find(x => x.requestId === rid && x.supplierId === sid); o.simulated = true; o.lines.forEach((ol, i) => { if (ol.mode !== 'SIN_OFERTA') { ol.unitPrice = Math.round(ol.unitPrice * (i % 3 === 0 ? 0.96 : 1) / 10) * 10; ol.stock = i % 4 === 3 ? 'A_PEDIDO' : 'CONFIRMADO'; } }); return o; }) && L.submitOffer(L.offer(rid, sid).id); };
  L.setEquivalence = (oid, lineId, decision, who) => L.store.update(s => {
    who = who || s.session.userId;
    const o = s.offers.find(x => x.id === oid); const ol = o.lines.find(x => x.lineId === lineId); ol.alt.equivalence = decision; ol.alt.decidedBy = who; ol.alt.decidedAt = L.now();
    const r = s.requests.find(x => x.id === o.requestId);
    log(s, r.projectId, who, (decision === 'APROBADA' ? 'Aprobó' : 'Rechazó') + ' la equivalencia técnica de ' + ol.alt.code + ' (' + s.suppliers.find(x => x.id === o.supplierId).short + ').');
  });
  /* Comparación: por línea, la opción de cada distribuidor con oferta vigente, más el precio de referencia de catálogo. */
  L.compare = rid => {
    const r = L.request(rid); const offers = L.offersOf(rid);
    const rows = r.lineIds.map(id => {
      const l = L.line(id); const qty = L.reqQty(r, l);
      const opts = offers.filter(o => o.status === 'ENVIADA').map(o => {
        const ol = o.lines.find(x => x.lineId === id); const price = L.offerLinePrice(ol);
        if (!ol || price == null) return { supplierId: o.supplierId, none: true, note: ol && ol.note };
        return { supplierId: o.supplierId, offerId: o.id, price, total: price * qty, stock: ol.stock, stockQty: ol.stockQty, lead: ol.leadDays, brand: ol.mode === 'ALTERNATIVA' ? ol.alt.brand : ol.brand,
          isAlt: ol.mode === 'ALTERNATIVA', equivalence: ol.alt && ol.alt.equivalence, altCode: ol.alt && ol.alt.code, adjusted: ol.mode === 'AJUSTADO', valid: L.offerValid(o), validUntil: o.validUntil };
      });
      const usable = opts.filter(x => !x.none && x.valid && (!x.isAlt || x.equivalence === 'APROBADA'));
      const cheapest = usable.slice().sort((a, b) => a.price - b.price)[0] || null;
      const fastest = usable.slice().sort((a, b) => a.lead - b.lead || a.price - b.price)[0] || null;
      const ref = L.matches(l).sort((a, b) => a.price - b.price)[0];
      return { lineId: id, line: l, qty, opts, cheapest, fastest, refPrice: ref ? ref.price : null };
    });
    return { request: r, offers, rows };
  };
  /* Estrategias de adjudicación sobre la misma comparación. */
  L.allocate = (rid, strategy) => {
    const c = L.compare(rid); const alloc = {};
    if (strategy === 'UNICO') {
      const totals = c.offers.filter(L.offerValid).map(o => ({ sid: o.supplierId, cov: c.rows.filter(r => r.opts.find(x => x.supplierId === o.supplierId && !x.none && (!x.isAlt || x.equivalence === 'APROBADA'))).length, total: c.rows.reduce((a, r) => { const x = r.opts.find(y => y.supplierId === o.supplierId && !y.none); return a + (x ? x.total : 0); }, 0) }))
        .sort((a, b) => b.cov - a.cov || a.total - b.total);
      const best = totals[0]; if (best) c.rows.forEach(r => { const x = r.opts.find(y => y.supplierId === best.sid && !y.none && y.valid && (!y.isAlt || y.equivalence === 'APROBADA')); if (x) alloc[r.lineId] = best.sid; });
    } else c.rows.forEach(r => { const pick = strategy === 'RAPIDO' ? r.fastest : r.cheapest; if (pick) alloc[r.lineId] = pick.supplierId; });
    return alloc;
  };
  L.allocationSummary = (rid, alloc) => {
    const c = L.compare(rid); let total = 0, lead = 0; const bySupplier = {}; let unassigned = 0;
    c.rows.forEach(r => { const sid = alloc[r.lineId]; const x = sid && r.opts.find(y => y.supplierId === sid && !y.none); if (!x) { unassigned++; return; } total += x.total; lead = Math.max(lead, x.lead); (bySupplier[sid] = bySupplier[sid] || { total: 0, lines: 0 }); bySupplier[sid].total += x.total; bySupplier[sid].lines++; });
    return { total, lead, bySupplier, unassigned, count: c.rows.length };
  };
  L.validateAward = (rid, alloc) => {
    const c = L.compare(rid); const errs = [];
    if (!Object.keys(alloc).length) errs.push('Adjudicá al menos un material.');
    c.rows.forEach(r => { const sid = alloc[r.lineId]; if (!sid) return; const x = r.opts.find(y => y.supplierId === sid);
      if (!x || x.none) errs.push(L.lineLabel(r.line) + ': ' + L.supplier(sid).short + ' no lo cotizó.');
      else if (!x.valid) errs.push(L.lineLabel(r.line) + ': la oferta de ' + L.supplier(sid).short + ' está vencida.');
      else if (x.isAlt && x.equivalence !== 'APROBADA') errs.push(L.lineLabel(r.line) + ': la alternativa de ' + L.supplier(sid).short + ' necesita que apruebes la equivalencia técnica.'); });
    return errs;
  };
  /* Adjudicar: valida, pide aprobación si corresponde, y emite un pedido por distribuidor. */
  L.award = (rid, alloc, opts = {}) => {
    const errs = L.validateAward(rid, alloc); if (errs.length) return { ok: false, errs };
    const sum = L.allocationSummary(rid, alloc);
    const rule = L.store.get().automations.find(a => a.when === 'ADJUDICACION_SUPERA' && a.enabled);
    const existing = L.store.get().approvals.find(a => a.requestId === rid && a.status === 'APROBADA' && Math.abs(a.total - sum.total) < 1);
    if (rule && sum.total > rule.threshold && !existing && !opts.skipApproval) {
      const ap = L.store.update(s => { const pend = s.approvals.find(a => a.requestId === rid && a.status === 'PENDIENTE'); if (pend) { Object.assign(pend, { total: sum.total, alloc }); return pend; }
        const a = { id: L.uid('ap'), requestId: rid, total: sum.total, alloc, status: 'PENDIENTE', requestedBy: s.session.userId, at: L.now(), approver: 'u-daniel' }; s.approvals.unshift(a);
        const r = s.requests.find(x => x.id === rid); notify(s, { role: 'ENGINEER', title: 'Aprobación pedida para ' + r.code, body: 'Adjudicación por ' + L.ars(sum.total) + ' espera a Dirección.', href: 'd-comparar.html?r=' + rid + '&p=' + r.projectId });
        log(s, r.projectId, s.session.userId, 'Pidió aprobación de Dirección para adjudicar ' + L.ars(sum.total) + '.'); return a; });
      return { ok: false, needsApproval: true, approval: ap };
    }
    const c = L.compare(rid);
    const created = L.store.update(s => {
      const r = s.requests.find(x => x.id === rid); const out = [];
      let seq = Math.max(...s.orders.map(o => +o.code.split('-')[1]), 99);
      Object.entries(sum.bySupplier).forEach(([sid]) => {
        seq++;
        const lines = c.rows.filter(row => alloc[row.lineId] === sid).map(row => { const x = row.opts.find(y => y.supplierId === sid); return { lineId: row.lineId, qty: row.qty, unitPrice: x.price, brand: x.brand, isAlt: x.isAlt, altCode: x.altCode }; });
        const o = { id: 'oc-' + String(seq).padStart(4, '0'), code: 'OC-' + String(seq).padStart(4, '0'), requestId: rid, projectId: r.projectId, supplierId: sid, createdAt: L.now(), status: 'SENT', lines };
        s.orders.unshift(o); out.push(o);
        const sup = s.suppliers.find(x => x.id === sid);
        notify(s, { role: 'SUPPLIER', supplierId: sid, title: 'Pedido ' + o.code + ' recibido', body: s.company.name + ' te adjudicó ' + lines.length + ' materiales de ' + r.code + '.', href: 'd-prov-pedidos.html?o=' + o.id });
        mail(s, sup.email, 'Pedido ' + o.code + ' de ' + s.company.name, 'Te adjudicaron ' + lines.length + ' materiales. Confirmá o rechazá el pedido desde liard.');
      });
      r.status = 'ADJUDICADA'; r.awardedAt = L.now(); r.alloc = Object.assign({}, r.alloc || {}, alloc);
      s.offers.filter(o => o.requestId === rid && o.status === 'ENVIADA' && !sum.bySupplier[o.supplierId]).forEach(o => { notify(s, { role: 'SUPPLIER', supplierId: o.supplierId, title: r.code + ' se adjudicó a otro distribuidor', body: 'Gracias por cotizar.', href: 'd-prov-solicitudes.html' }); });
      log(s, r.projectId, s.session.userId, 'Adjudicó ' + r.code + ' y emitió ' + out.length + (out.length === 1 ? ' pedido' : ' pedidos') + ' por ' + L.ars(sum.total) + '.');
      return out;
    });
    return { ok: true, orders: created };
  };
  L.decideApproval = (apId, decision, note, who = 'u-daniel') => L.store.update(s => { const a = s.approvals.find(x => x.id === apId); a.status = decision; a.decidedAt = L.now(); a.note = note || ''; a.decidedBy = who; const r = s.requests.find(x => x.id === a.requestId);
    notify(s, { role: 'ENGINEER', title: 'Adjudicación ' + (decision === 'APROBADA' ? 'aprobada' : 'rechazada') + ' · ' + r.code, body: (decision === 'APROBADA' ? 'Ya podés emitir los pedidos.' : 'Motivo: ' + (note || 'sin motivo.')), href: 'd-comparar.html?r=' + r.id + '&p=' + r.projectId });
    log(s, r.projectId, who, (decision === 'APROBADA' ? 'Aprobó' : 'Rechazó') + ' la adjudicación de ' + r.code + '.'); return a; });
  L.ordersOf = pid => S().orders.filter(o => o.projectId === pid);
  L.orderTotal = o => o.lines.reduce((a, l) => a + l.qty * l.unitPrice, 0);
  L.respondOrder = (oid, status, reason) => L.store.update(s => {
    const o = s.orders.find(x => x.id === oid); if (o.status !== 'SENT') return { ok: false, err: 'Este pedido ya fue respondido.' };
    o.status = status; o.respondedAt = L.now(); o.reason = reason || '';
    const sup = s.suppliers.find(x => x.id === o.supplierId);
    notify(s, { role: 'ENGINEER', title: 'Pedido ' + o.code + (status === 'CONFIRMED' ? ' confirmado' : ' rechazado'), body: sup.short + (status === 'CONFIRMED' ? ' confirmó el pedido.' : ' rechazó el pedido: ' + (reason || 'sin motivo.')), href: 'd-pedidos.html?o=' + o.id + '&p=' + o.projectId });
    mail(s, s.team[1].email, 'Pedido ' + o.code + (status === 'CONFIRMED' ? ' confirmado' : ' rechazado') + ' por ' + sup.short, status === 'CONFIRMED' ? 'Ya podés coordinar la entrega.' : 'Motivo: ' + (reason || 'sin motivo') + '.');
    L.fireAutomations(s, status === 'CONFIRMED' ? 'PEDIDO_CONFIRMADO' : 'PEDIDO_RECHAZADO', { text: sup.short + (status === 'CONFIRMED' ? ' confirmó ' : ' rechazó ') + o.code + '.', href: 'd-pedidos.html?o=' + o.id + '&p=' + o.projectId });
    log(s, o.projectId, sup.id, sup.short + (status === 'CONFIRMED' ? ' confirmó ' : ' rechazó ') + o.code + '.');
    return { ok: true };
  });

  /* ─────────── Presupuesto de venta y margen ─────────── */
  /* Costo de materiales con su procedencia: pedidos confirmados > ofertas vigentes > precio de referencia de catálogo. */
  L.materialCost = pid => {
    const lines = L.linesOf(pid); const ords = L.ordersOf(pid).filter(o => o.status !== 'REJECTED');
    const cmps = L.requestsOf(pid).filter(r => r.status === 'ABIERTA').map(r => L.compare(r.id));
    let total = 0; const bySource = { pedido: 0, oferta: 0, referencia: 0, sinPrecio: 0 }; const rows = [];
    lines.forEach(l => {
      const ol = ords.flatMap(o => o.lines.map(x => Object.assign({ status: o.status }, x))).find(x => x.lineId === l.id);
      let unit = null, source = 'sinPrecio';
      if (ol) { unit = ol.unitPrice; source = 'pedido'; }
      else { const best = cmps.map(c => c.rows.find(r => r.lineId === l.id)).filter(r => r && r.cheapest).map(r => r.cheapest.price).sort((a, b) => a - b)[0]; if (best != null) { unit = best; source = 'oferta'; } }
      if (unit == null) { const m = L.matches(l).sort((a, b) => a.price - b.price)[0]; if (m) { unit = m.price; source = 'referencia'; } }
      const sub = unit == null ? 0 : unit * L.qty(l); total += sub; bySource[source] += source === 'sinPrecio' ? 1 : sub; rows.push({ lineId: l.id, unit, qty: L.qty(l), sub, source });
    });
    return { total, bySource, rows };
  };
  L.boardsOf = pid => L.plansOf(pid).filter(p => p.status === 'COMPLETED' || p.status === 'STALE').reduce((a, p) => a + (p.multiplier || 1), 0);
  L.scenarios = {
    base: { label: 'Base', desc: 'Tus parámetros tal cual.', apply: b => b },
    cobertura: { label: 'Cobertura por inflación', desc: 'Suma al costo la inflación esperada durante la validez del presupuesto.', apply: b => Object.assign({}, b, { hedge: true }) },
    competitivo: { label: 'Competitivo', desc: 'Resta 4 puntos de margen para ganar una licitación ajustada.', apply: b => Object.assign({}, b, { marginPct: Math.max(0, b.marginPct - 4) }) },
  };
  L.budget = (pid, override) => {
    const base = Object.assign({}, S().budgets[pid] || S().budgets.p1, override || {});
    const b = (L.scenarios[base.scenario] || L.scenarios.base).apply(base);
    const mat = L.materialCost(pid); const boards = L.boardsOf(pid);
    const labor = b.laborHoursPerBoard * b.laborRate * boards;
    const extras = mat.total * b.extrasPct / 100;
    const hedge = b.hedge ? mat.total * (b.inflationMonthlyPct / 100) * (b.validityDays / 30) : 0;
    const cost = mat.total + labor + extras + hedge;
    const contingency = cost * b.contingencyPct / 100;
    const costTotal = cost + contingency;
    const price = b.marginPct >= 100 ? NaN : costTotal / (1 - b.marginPct / 100);
    const profit = price - costTotal;
    const drift = mat.total * (b.inflationMonthlyPct / 100) * (b.validityDays / 30);
    return { params: b, materials: mat.total, matSources: mat.bySource, rows: mat.rows, boards, labor, extras, hedge, contingency, costTotal, price, profit,
      marginPct: price ? profit / price * 100 : 0, markupPct: costTotal ? profit / costTotal * 100 : 0, driftRisk: drift, profitAfterDrift: profit - (b.hedge ? 0 : drift) };
  };
  L.saveBudget = (pid, patch) => L.store.update(s => { s.budgets[pid] = Object.assign({}, s.budgets[pid], patch); });

  /* ─────────── IA: presupuesto y registro de uso (simulado, sin llamadas reales) ─────────── */
  L.aiSpent = () => S().ai.ledger.filter(e => e.at.slice(0, 7) === B.TODAY.slice(0, 7)).reduce((a, e) => a + e.usd, 0);
  L.aiCan = usd => { const a = S().ai; return !a.hardLimit || L.aiSpent() + usd <= a.monthlyBudgetUSD; };
  L.aiSpend = (kind, usd, projectId, ref) => { if (!L.aiCan(usd)) return false; const before = L.aiState().pct;
    L.store.update(s => { s.ai.ledger.unshift({ at: L.now(), kind, projectId, ref, usd }); const pct = (before / 100 * s.ai.monthlyBudgetUSD + usd) / s.ai.monthlyBudgetUSD * 100;
      if (before < s.ai.alertAtPct && pct >= s.ai.alertAtPct) notify(s, { role: 'ENGINEER', title: 'Uso de IA al ' + Math.round(pct) + ' % del presupuesto', body: 'Revisá el consumo o ajustá el límite mensual.', href: 'd-cuenta.html?tab=ia' }); }); return true; };
  L.aiState = () => { const a = S().ai; const spent = L.aiSpent(); const pct = spent / a.monthlyBudgetUSD * 100; return { spent, pct, budget: a.monthlyBudgetUSD, tone: pct >= 100 ? 'err' : pct >= a.alertAtPct ? 'warn' : 'ok', blocked: a.hardLimit && pct >= 100 }; };

  /* ─────────── Procesamiento simulado de planos (sobrevive recargas: se deriva del reloj) ─────────── */
  const SIM_RESULTS = {
    'pl-tsb': { lines: [
      { typeId: 'gm', attrs: { rango: '4–6,3 A' }, qty: 4, brand: 'Schneider' },
      { typeId: 'cont', attrs: { polos: '3P', in: 12, bobina: '220 Vca' }, qty: 4, brand: null },
      { typeId: 'itm', attrs: { polos: '4P', in: 32, curva: 'C' }, qty: 1, merge: 'b6' },
      { typeId: 'piloto', attrs: { color: 'Verde', tension: '220 V' }, qty: 4, merge: 'b15' },
      { typeId: 'gab', attrs: { ip: 'IP65', medida: '800×600' }, qty: 1, brand: 'ANY', src: 'RULE' } ],
      unidentified: [{ x: .55, y: .58, guess: 'itm', guessAttrs: { polos: '1P+N', in: 10, curva: 'C' }, conf: .64, text: 'Q7 10A' }] },
  };
  L.processPlans = (planIds, opts = {}) => L.store.update(s => {
    let queued = 0;
    planIds.forEach((id, i) => { const p = s.plans.find(x => x.id === id); if (!p || !['PENDING', 'ERROR', 'STALE'].includes(p.status)) return; queued++;
      p.status = 'PROCESSING'; p.job = { startedAt: Date.now() + i * 1500, durationMs: opts.durationMs || 9000, fail: !!opts.fail }; p.lastError = null; });
    const p0 = s.plans.find(x => x.id === planIds[0]); if (p0 && queued) log(s, p0.projectId, s.session.userId, 'Mandó a procesar ' + queued + (queued === 1 ? ' plano.' : ' planos.'));
    return queued;
  });
  L.cancelProcessing = planId => L.store.update(s => { const p = s.plans.find(x => x.id === planId); if (p && p.status === 'PROCESSING' && Date.now() < p.job.startedAt) { p.status = 'PENDING'; delete p.job; return true; } return false; });
  L.jobProgress = p => p.job ? Math.max(0, Math.min(1, (Date.now() - p.job.startedAt) / p.job.durationMs)) : 0;
  L.tick = () => {
    /* Varias pantallas (iframes de la galería) corren el mismo reloj: se relee el estado y se toma un candado corto. */
    try { const lk = +localStorage.getItem('liard-horizon:lock') || 0; if (Date.now() - lk < 1500) return false; } catch (e) { /* sin almacenamiento */ }
    state = null;
    const due = S().plans.filter(p => p.status === 'PROCESSING' && p.job && Date.now() >= p.job.startedAt + p.job.durationMs);
    if (!due.length) return false;
    try { localStorage.setItem('liard-horizon:lock', String(Date.now())); } catch (e) { /* sin almacenamiento */ }
    L.store.update(s => {
      due.forEach(d => {
        const p = s.plans.find(x => x.id === d.id);
        if (p.job.fail) { p.status = 'ERROR'; p.lastError = 'El servicio de detección tardó más de lo permitido (504). El plano no se reintenta solo: probá recortarlo en partes o volvé a procesarlo.'; delete p.job; log(s, p.projectId, 'sistema', p.name + ': la detección no terminó a tiempo.'); return; }
        const cost = 0.6 + (p.id.length % 5) / 10;
        s.ai.ledger.unshift({ at: L.now(), kind: 'Detección', projectId: p.projectId, ref: p.name, usd: +cost.toFixed(2) });
        const res = SIM_RESULTS[p.id] || { lines: [{ typeId: 'itm', attrs: { polos: '1P+N', in: 10, curva: 'C' }, qty: 6, brand: 'ANY' }], unidentified: [] };
        res.lines.forEach((r, i) => {
          const existing = r.merge ? s.bomLines.find(l => l.id === r.merge) : s.bomLines.find(l => l.projectId === p.projectId && !l.deleted && L.sameSpec(l.typeId, l.attrs, r.typeId, r.attrs));
          if (existing) existing.perPlan[p.id] = r.qty;
          else s.bomLines.push({ id: 'b-' + p.id + '-' + i, projectId: p.projectId, typeId: r.typeId, attrs: r.attrs, perPlan: { [p.id]: r.qty }, brand: r.brand === undefined ? null : r.brand, src: r.src || 'DETECTOR', readingStatus: 'READ', linkStatus: 'AUTO', note: '' });
        });
        res.unidentified.forEach((u, i) => s.unidentified.push(Object.assign({ id: 'u-' + p.id + '-' + i, planId: p.id, status: 'PENDIENTE' }, u)));
        p.status = 'COMPLETED'; p.processedAt = L.now(); p.durationS = Math.round(p.job.durationMs / 1000); delete p.job;
        const n = res.lines.reduce((a, r) => a + r.qty, 0);
        L.fireAutomations(s, 'PLANO_PROCESADO', { text: p.name + ' quedó procesado.', href: 'd-plano.html?plan=' + p.id + '&p=' + p.projectId });
        log(s, p.projectId, 'sistema', p.name + ' procesado: ' + n + ' componentes, ' + res.unidentified.length + ' sin identificar.');
        notify(s, { role: 'ENGINEER', title: p.name + ' quedó procesado', body: n + ' componentes detectados' + (res.unidentified.length ? ', ' + res.unidentified.length + ' para revisar.' : '.'), href: 'd-plano.html?plan=' + p.id + '&p=' + p.projectId });
      });
      const pids = [...new Set(due.map(d => d.projectId))];
      pids.forEach(pid => { const pls = s.plans.filter(x => x.projectId === pid && !x.deleted); if (pls.every(x => x.status !== 'PROCESSING') && automation(s, 'PLANOS_PROCESADOS')) { const pr = s.projects.find(x => x.id === pid); mail(s, s.team[1].email, 'Planos listos en ' + pr.name, 'Todos los planos terminaron de procesarse. El BOM está listo para revisar.'); } });
    });
    return true;
  };
  /* Resolver o descartar símbolos sin identificar: asigna a una línea existente o crea una nueva. */
  L.resolveSymbol = (uid, { lineId, typeId, attrs, discard }) => L.store.update(s => {
    const u = s.unidentified.find(x => x.id === uid); const p = s.plans.find(x => x.id === u.planId);
    if (discard) { u.status = 'DESCARTADO'; log(s, p.projectId, s.session.userId, 'Descartó un símbolo en ' + p.name + '.'); return; }
    let line = lineId ? s.bomLines.find(l => l.id === lineId) : s.bomLines.find(l => l.projectId === p.projectId && !l.deleted && L.sameSpec(l.typeId, l.attrs, typeId, attrs));
    if (!line) { line = { id: L.uid('b'), projectId: p.projectId, typeId, attrs, perPlan: {}, brand: null, src: 'MANUAL', readingStatus: 'READ', linkStatus: 'MANUAL', note: 'Creada al resolver un símbolo.' }; s.bomLines.push(line); }
    line.perPlan[p.id] = (line.perPlan[p.id] || 0) + 1; u.status = 'RESUELTO'; u.lineId = line.id;
    log(s, p.projectId, s.session.userId, 'Asignó un símbolo de ' + p.name + ' a «' + L.lineLabel(line) + '».');
  });
  L.updateLine = (id, patch) => L.store.update(s => { const l = s.bomLines.find(x => x.id === id); Object.assign(l, patch); l.updatedAt = L.now(); return l; });
  L.addComment = (entity, projectId, text, opts = {}) => L.store.update(s => { const c = { id: L.uid('c'), entity, projectId, who: opts.who || s.session.userId, at: L.now(), text, resolved: false, replyTo: opts.replyTo || null }; s.comments.unshift(c); log(s, projectId, s.session.userId, 'Comentó: «' + text.slice(0, 60) + (text.length > 60 ? '…' : '') + '»'); return c; });
  L.commentsOf = entity => S().comments.filter(c => c.entity === entity);

  /* ─────────── Descargas reales ─────────── */
  L.download = (name, data, mime) => { const blob = data instanceof Blob ? data : new Blob([data], { type: mime || 'text/plain;charset=utf-8' }); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500); return blob; };
  /* CSV para Excel en español: separador «;», BOM UTF-8. */
  L.csv = rows => '﻿' + rows.map(r => r.map(v => { const s = v == null ? '' : typeof v === 'number' ? String(v).replace('.', ',') : String(v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; }).join(';')).join('\r\n');
  /* ZIP sin compresión (suficiente para XLSX). */
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = u8 => { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
  L.zip = files => {
    const enc = new TextEncoder(); const parts = []; const central = []; let offset = 0;
    const u16 = v => [v & 255, (v >>> 8) & 255], u32 = v => [v & 255, (v >>> 8) & 255, (v >>> 16) & 255, (v >>> 24) & 255];
    files.forEach(f => {
      const name = enc.encode(f.name), data = typeof f.data === 'string' ? enc.encode(f.data) : f.data, crc = crc32(data);
      const head = [...u32(0x04034b50), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0)];
      parts.push(new Uint8Array(head), name, data);
      central.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(crc), ...u32(data.length), ...u32(data.length), ...u16(name.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(offset)]), name);
      offset += head.length + name.length + data.length;
    });
    const csize = central.reduce((a, p) => a + p.length, 0);
    const end = new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(files.length), ...u16(files.length), ...u32(csize), ...u32(offset), ...u16(0)]);
    return new Blob([...parts, ...central, end], { type: 'application/zip' });
  };
  /* XLSX real: sheets = [{ name, rows: [[...], ...] }]; la primera fila va en negrita. */
  L.xlsx = sheets => {
    const x = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    const col = i => { let s = ''; i++; while (i) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
    const sheetXml = rows => '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetData>' + rows.map((r, ri) => '<row r="' + (ri + 1) + '">' + r.map((v, ci) => { const ref = col(ci) + (ri + 1); const st = ri === 0 ? ' s="1"' : ''; if (typeof v === 'number' && isFinite(v)) return '<c r="' + ref + '"' + st + '><v>' + v + '</v></c>'; if (v == null || v === '') return ''; return '<c r="' + ref + '" t="inlineStr"' + st + '><is><t xml:space="preserve">' + x(v) + '</t></is></c>'; }).join('') + '</row>').join('') + '</sheetData></worksheet>';
    const files = [
      { name: '[Content_Types].xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' + sheets.map((_, i) => '<Override PartName="/xl/worksheets/sheet' + (i + 1) + '.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>').join('') + '</Types>' },
      { name: '_rels/.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>' },
      { name: 'xl/workbook.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets>' + sheets.map((s, i) => '<sheet name="' + x(s.name.slice(0, 31)) + '" sheetId="' + (i + 1) + '" r:id="rId' + (i + 1) + '"/>').join('') + '</sheets></workbook>' },
      { name: 'xl/_rels/workbook.xml.rels', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' + sheets.map((_, i) => '<Relationship Id="rId' + (i + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet' + (i + 1) + '.xml"/>').join('') + '<Relationship Id="rId' + (sheets.length + 1) + '" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>' },
      { name: 'xl/styles.xml', data: '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts><fills count="2"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf fontId="0"/><xf fontId="1" applyFont="1"/></cellXfs></styleSheet>' },
      ...sheets.map((s, i) => ({ name: 'xl/worksheets/sheet' + (i + 1) + '.xml', data: sheetXml(s.rows) })),
    ];
    const z = L.zip(files); return new Blob([z], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  };
  /* PDF real (texto y reglas, Helvetica, A4). blocks: {h1|h2|p|small: texto} | {row: [..], widths: [..], bold} | {hr: true} | {gap: n} */
  L.pdf = (blocks, meta = {}) => {
    const W = 595, H = 842, M = 48; const pages = []; let cur = [], y = H - M;
    const win = s => { const map = { '–': 150, '—': 151, '•': 149, '€': 128, '“': 147, '”': 148, '‘': 145, '’': 146, '…': 133 }; let o = ''; for (const ch of String(s)) { const c = map[ch] || ch.charCodeAt(0); o += c < 256 ? String.fromCharCode(c) : '?'; } return o.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)'); };
    const newPage = () => { pages.push(cur); cur = []; y = H - M; };
    const need = h => { if (y - h < M) newPage(); };
    const text = (x, yy, size, s, bold) => cur.push('BT /' + (bold ? 'F2' : 'F1') + ' ' + size + ' Tf ' + x.toFixed(1) + ' ' + yy.toFixed(1) + ' Td (' + win(s) + ') Tj ET');
    const wrap = (s, size, width) => { const max = Math.floor(width / (size * 0.5)); const words = String(s).split(' '); const out = []; let line = ''; words.forEach(w => { if ((line + ' ' + w).trim().length > max) { out.push(line.trim()); line = w; } else line += ' ' + w; }); if (line.trim()) out.push(line.trim()); return out; };
    blocks.forEach(b => {
      if (b.h1) { need(30); text(M, y - 20, 18, b.h1, true); y -= 32; }
      else if (b.h2) { need(24); y -= 6; text(M, y - 12, 12, b.h2, true); y -= 22; }
      else if (b.p || b.small) { const size = b.small ? 8.5 : 10; wrap(b.p || b.small, size, W - 2 * M).forEach(l => { need(size + 5); text(M, y - size, size, l, false); y -= size + 5; }); y -= 3; }
      else if (b.row) { need(16); let x = M; const ws = b.widths || b.row.map(() => (W - 2 * M) / b.row.length); b.row.forEach((c, i) => { const s = String(c == null ? '' : c); const maxc = Math.floor(ws[i] / 4.6); const t = s.length > maxc ? s.slice(0, maxc - 1) + '…' : s; const right = b.align && b.align[i] === 'r'; text(right ? x + ws[i] - t.length * 4.6 - 4 : x, y - 10, 8.5, t, b.bold); x += ws[i]; }); y -= 15; if (b.bold) { cur.push('0.6 w ' + M + ' ' + (y + 2) + ' m ' + (W - M) + ' ' + (y + 2) + ' l S'); } }
      else if (b.hr) { need(10); cur.push('0.5 w 0.7 G ' + M + ' ' + (y - 4) + ' m ' + (W - M) + ' ' + (y - 4) + ' l S 0 G'); y -= 12; }
      else if (b.gap) { y -= b.gap; }
    });
    pages.push(cur);
    const objs = []; const add = s => { objs.push(s); return objs.length; };
    add('<< /Type /Catalog /Pages 2 0 R >>'); add('PAGES');
    const f1 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>');
    const f2 = add('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>');
    const kids = [];
    pages.forEach((ops, i) => {
      const footer = 'BT /F1 7.5 Tf ' + M + ' 24 Td (' + win((meta.footer || 'liard · documento de demostración con datos ficticios') + ' · página ' + (i + 1) + ' de ' + pages.length) + ') Tj ET';
      const stream = ops.concat(footer).join('\n');
      const c = add('<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream');
      kids.push(add('<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ' + W + ' ' + H + '] /Resources << /Font << /F1 ' + f1 + ' 0 R /F2 ' + f2 + ' 0 R >> >> /Contents ' + c + ' 0 R >>'));
    });
    objs[1] = '<< /Type /Pages /Kids [' + kids.map(k => k + ' 0 R').join(' ') + '] /Count ' + kids.length + ' >>';
    let out = '%PDF-1.4\n'; const offs = [];
    objs.forEach((o, i) => { offs.push(out.length); out += (i + 1) + ' 0 obj\n' + o + '\nendobj\n'; });
    const xref = out.length; out += 'xref\n0 ' + (objs.length + 1) + '\n0000000000 65535 f \n' + offs.map(o => String(o).padStart(10, '0') + ' 00000 n \n').join('') + 'trailer\n<< /Size ' + (objs.length + 1) + ' /Root 1 0 R /Info << /Title (' + win(meta.title || 'liard') + ') /Producer (liard horizon demo) >> >>\nstartxref\n' + xref + '\n%%EOF';
    const u8 = new Uint8Array(out.length); for (let i = 0; i < out.length; i++) u8[i] = out.charCodeAt(i) & 255;
    return new Blob([u8], { type: 'application/pdf' });
  };

  /* ─────────── UI: toasts, diálogos, badges ─────────── */
  L.badge = (text, tone = 'muted', ic) => `<span class="badge b-${tone}">${ic ? L.icon(ic, 12) : ''}${L.esc(text)}</span>`;
  L.cap = kind => ({ existe: '<span class="cap cap-existe" title="Ya existe en la app de producción (dev)">existe</span>', planificado: '<span class="cap cap-plan" title="Planificado en el roadmap (Sprint 5 o issue abierto)">planificado</span>', propuesto: '<span class="cap cap-prop" title="Propuesta nueva de esta exploración">propuesto</span>' }[kind] || '');
  L.sim = (text = 'Simulación') => `<span class="sim" title="Resultado simulado en el prototipo: no hay servicio real conectado">${L.icon('zap', 11)}${L.esc(text)}</span>`;
  L.ai = (text = 'IA') => `<span class="aitag">${L.icon('sparkles', 11)}${L.esc(text)}</span>`;
  L.srcTag = src => ({ DETECTOR: '<span class="src src-det" title="Detectado en el plano por el modelo">detectado</span>', RULE: '<span class="src src-inf" title="Inferido por una regla o por IA: revisalo">inferido</span>', MANUAL: '<span class="src src-man" title="Cargado o confirmado por una persona">manual</span>' }[src] || '');
  L.priceTag = kind => ({ referencia: '<span class="src src-ref" title="Precio de catálogo del distribuidor: no es una oferta confirmada">precio de referencia</span>', oferta: '<span class="src src-conf" title="Precio confirmado por el distribuidor en su oferta">oferta confirmada</span>', pedido: '<span class="src src-man" title="Precio del pedido emitido">pedido</span>', sinPrecio: '<span class="src src-err">sin precio</span>' }[kind] || '');
  L.toast = (msg, opts = {}) => {
    let host = document.getElementById('toasts'); if (!host) { host = document.createElement('div'); host.id = 'toasts'; host.setAttribute('role', 'status'); host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
    const t = document.createElement('div'); t.className = 'toast t-' + (opts.kind || 'ok');
    t.innerHTML = L.icon(opts.kind === 'err' ? 'alertc' : opts.kind === 'warn' ? 'alert' : opts.kind === 'info' ? 'info' : 'check', 16) + '<div class="toast-body">' + L.esc(msg) + (opts.detail ? '<small>' + L.esc(opts.detail) + '</small>' : '') + '</div>' + (opts.action ? '<button class="btn btn-sm btn-ghost">' + L.esc(opts.action.label) + '</button>' : '') + '<button class="icon-btn" aria-label="Cerrar aviso">' + L.icon('x', 14) + '</button>';
    host.appendChild(t);
    const close = () => { t.classList.add('out'); setTimeout(() => t.remove(), 250); };
    t.querySelector('.icon-btn').onclick = close; if (opts.action) t.querySelector('.btn').onclick = () => { opts.action.onClick(); close(); };
    setTimeout(close, opts.ms || 4200);
  };
  /* Diálogo modal nativo (foco atrapado y Esc por el navegador). actions: [{label, kind, onClick(dlg) → false para no cerrar}] */
  L.dialog = ({ title, body, actions = [], wide }) => {
    const d = document.createElement('dialog'); d.className = 'dlg' + (wide ? ' dlg-wide' : '');
    d.innerHTML = `<form method="dialog" class="dlg-inner"><header><h2>${L.esc(title)}</h2><button type="button" class="icon-btn" data-x aria-label="Cerrar">${L.icon('x', 16)}</button></header><div class="dlg-body"></div><footer></footer></form>`;
    const b = d.querySelector('.dlg-body'); if (typeof body === 'string') b.innerHTML = body; else if (body) b.appendChild(body);
    const f = d.querySelector('footer');
    actions.forEach(a => { const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'btn ' + (a.kind === 'primary' ? 'btn-primary' : a.kind === 'danger' ? 'btn-danger' : 'btn-secondary'); btn.textContent = a.label; btn.onclick = () => { const r = a.onClick ? a.onClick(d) : undefined; if (r !== false) d.close(); }; f.appendChild(btn); });
    d.querySelector('[data-x]').onclick = () => d.close();
    d.addEventListener('close', () => setTimeout(() => d.remove(), 50));
    document.body.appendChild(d); d.showModal(); return d;
  };
  L.confirm = (title, text, label = 'Confirmar', kind = 'primary') => new Promise(res => L.dialog({ title, body: '<p>' + L.esc(text) + '</p>', actions: [{ label: 'Cancelar', onClick: () => res(false) }, { label, kind, onClick: () => res(true) }] }));
  L.fieldError = (input, msg) => { const f = input.closest('.field') || input.parentElement; let e = f.querySelector('.field-err'); if (!msg) { input.removeAttribute('aria-invalid'); if (e) e.remove(); return; } input.setAttribute('aria-invalid', 'true'); if (!e) { e = document.createElement('div'); e.className = 'field-err'; e.id = L.uid('err'); f.appendChild(e); input.setAttribute('aria-describedby', e.id); } e.innerHTML = L.icon('alertc', 12) + L.esc(msg); };
  /* Ordenar tablas: <th data-sort="key" data-type="num|text">; filas <tr data-key-*>. */
  L.sortable = (table, onSort) => { table.querySelectorAll('th[data-sort]').forEach(th => { th.tabIndex = 0; th.setAttribute('role', 'button'); const go = () => { const dir = th.getAttribute('aria-sort') === 'ascending' ? 'descending' : 'ascending'; table.querySelectorAll('th[data-sort]').forEach(x => x.removeAttribute('aria-sort')); th.setAttribute('aria-sort', dir); onSort(th.dataset.sort, dir === 'ascending' ? 1 : -1); }; th.onclick = go; th.onkeydown = e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } }; }); };
  L.empty = ({ icon = 'inbox', title, text, action }) => `<div class="empty">${L.icon(icon, 28)}<h3>${L.esc(title)}</h3><p>${L.esc(text)}</p>${action || ''}</div>`;

  /* ─────────── Navegación y shell ─────────── */
  /* Registro de pantallas: cada una declara capacidad (existe / planificado / propuesto). */
  L.pages = [
    { id: 'inicio', href: 'd-inicio.html', label: 'Inicio', icon: 'home', role: 'ENGINEER', cap: 'propuesto' },
    { id: 'obras', href: 'd-obras.html', label: 'Obras', icon: 'folder', role: 'ENGINEER', cap: 'existe' },
    { id: 'obra', href: 'd-obra.html', label: 'Planos', icon: 'layers', role: 'ENGINEER', cap: 'existe', project: true },
    { id: 'plano', href: 'd-plano.html', label: 'Revisión en plano', icon: 'scan', role: 'ENGINEER', cap: 'existe', project: true },
    { id: 'bom', href: 'd-bom.html', label: 'BOM', icon: 'list', role: 'ENGINEER', cap: 'existe', project: true },
    { id: 'tablero3d', href: 'd-tablero-3d.html', label: 'Tablero 3D', icon: 'cube', role: 'ENGINEER', cap: 'propuesto', project: true },
    { id: 'cotizacion', href: 'd-cotizacion.html', label: 'Cotización', icon: 'send', role: 'ENGINEER', cap: 'existe', project: true },
    { id: 'comparar', href: 'd-comparar.html', label: 'Comparar ofertas', icon: 'compare', role: 'ENGINEER', cap: 'propuesto', project: true },
    { id: 'presupuesto', href: 'd-presupuesto.html', label: 'Presupuesto y margen', icon: 'percent', role: 'ENGINEER', cap: 'propuesto', project: true },
    { id: 'pedidos', href: 'd-pedidos.html', label: 'Pedidos', icon: 'truck', role: 'ENGINEER', cap: 'existe' },
    { id: 'directorio', href: 'd-directorio.html', label: 'Distribuidores', icon: 'store', role: 'ENGINEER', cap: 'existe' },
    { id: 'asistentes', href: 'd-asistentes.html', label: 'Asistentes IA', icon: 'sparkles', role: 'ENGINEER', cap: 'propuesto' },
    { id: 'automatizaciones', href: 'd-automatizaciones.html', label: 'Equipo y automatizaciones', icon: 'workflow', role: 'ENGINEER', cap: 'propuesto' },
    { id: 'cuenta', href: 'd-cuenta.html', label: 'Plan, uso y cuenta', icon: 'card', role: 'ENGINEER', cap: 'planificado' },
    { id: 'prov-inicio', href: 'd-prov-inicio.html', label: 'Inicio', icon: 'home', role: 'SUPPLIER', cap: 'propuesto' },
    { id: 'prov-solicitudes', href: 'd-prov-solicitudes.html', label: 'Solicitudes', icon: 'inbox', role: 'SUPPLIER', cap: 'existe' },
    { id: 'prov-oferta', href: 'd-prov-oferta.html', label: 'Oferta', icon: 'edit', role: 'SUPPLIER', cap: 'propuesto', hidden: true },
    { id: 'prov-pedidos', href: 'd-prov-pedidos.html', label: 'Pedidos', icon: 'truck', role: 'SUPPLIER', cap: 'existe' },
    { id: 'prov-catalogo', href: 'd-prov-catalogo.html', label: 'Catálogo', icon: 'box', role: 'SUPPLIER', cap: 'existe' },
    { id: 'prov-vinculacion', href: 'd-prov-vinculacion.html', label: 'Vinculación IA', icon: 'link', role: 'SUPPLIER', cap: 'existe' },
    { id: 'prov-cuenta', href: 'd-cuenta.html?rol=prov', label: 'Plan, uso y cuenta', icon: 'card', role: 'SUPPLIER', cap: 'planificado' },
  ];
  L.mobileTabs = {
    ENGINEER: [['m-inicio.html', 'Inicio', 'home'], ['m-obra.html', 'Obra', 'layers'], ['m-aprobar.html', 'Aprobar', 'check'], ['m-avisos.html', 'Avisos', 'bell']],
    SUPPLIER: [['m-prov-inicio.html', 'Inicio', 'home'], ['m-prov-oferta.html', 'Ofertar', 'edit'], ['m-prov-pedidos.html', 'Pedidos', 'truck'], ['m-avisos.html?rol=prov', 'Avisos', 'bell']],
  };
  L.role = () => document.body.dataset.role === 'SUPPLIER' || L.param('rol') === 'prov' ? 'SUPPLIER' : 'ENGINEER';
  L.myNotifications = () => { const s = S(); const r = L.role(); return s.notifications.filter(n => n.role === r && (r !== 'SUPPLIER' || !n.supplierId || n.supplierId === s.session.supplierId)); };

  function shell() {
    const body = document.body; const role = L.role(); const mobile = body.classList.contains('m');
    const page = document.getElementById('page'); if (!page) return;
    const act = document.getElementById('act');
    const active = body.dataset.active; const s = S();
    const pid = L.currentProjectId(); const pr = L.project(pid);
    if (L.param('p')) L.store.update(x => { x.session.lastProjectId = pid; });
    const bare = L.param('bare') === '1';
    const unread = L.myNotifications().filter(n => !n.read).length;
    const me = role === 'SUPPLIER' ? { name: L.supplier(s.session.supplierId).contact, org: L.supplier(s.session.supplierId).name, initials: 'PG' } : { name: L.member(s.session.userId).name, org: s.company.name, initials: L.member(s.session.userId).initials };
    const wrap = document.createElement('div'); wrap.className = 'app' + (mobile ? ' app-m' : '');
    if (!mobile) {
      const pages = L.pages.filter(p => p.role === role && !p.hidden);
      const top = pages.filter(p => !p.project), proj = pages.filter(p => p.project);
      const item = p => `<a class="nav-i${active === p.id ? ' on' : ''}" href="${L.link(p.href, p.project ? { p: pid } : {})}"${active === p.id ? ' aria-current="page"' : ''}>${L.icon(p.icon, 17)}<span>${p.label}</span>${p.cap !== 'existe' ? `<i class="dot dot-${p.cap}" title="${p.cap}"></i>` : ''}</a>`;
      wrap.innerHTML = `<aside class="side" aria-label="Navegación principal">
        <a class="brand" href="${L.link(role === 'SUPPLIER' ? 'd-prov-inicio.html' : 'd-inicio.html')}"><span class="brand-mark">${L.icon('zap', 16)}</span><span class="brand-word">liard</span><span class="brand-sub">horizon</span></a>
        <nav>${top.slice(0, 2).map(item).join('')}
        ${proj.length ? `<div class="nav-proj"><button class="nav-proj-h" data-projsel aria-haspopup="listbox" title="Cambiar de obra"><small>Obra</small><strong>${L.esc(pr.name)}</strong>${L.icon('chevd', 14)}</button>${proj.map(item).join('')}</div>` : ''}
        ${top.slice(2).map(item).join('')}</nav>
        <div class="side-foot"><div class="me"><span class="av">${me.initials}</span><div><strong>${L.esc(me.name)}</strong><small>${L.esc(me.org)}</small></div></div>
        <div class="legend"><i class="dot dot-planificado"></i>planificado <i class="dot dot-propuesto"></i>propuesto</div></div>
      </aside>
      <div class="main"><header class="top">
        <div class="top-t"><h1>${L.esc(body.dataset.title || '')}</h1>${body.dataset.sub ? `<p>${L.esc(body.dataset.sub)}</p>` : ''}</div>
        <div class="top-a"><div class="act-slot"></div>
          <button class="icon-btn" data-cmd title="Buscar (⌘K)" aria-label="Buscar">${L.icon('search', 18)}</button>
          <button class="icon-btn bell" data-bell aria-label="Avisos${unread ? ', ' + unread + ' sin leer' : ''}">${L.icon('bell', 18)}${unread ? `<b>${unread}</b>` : ''}</button>
          <button class="btn btn-ghost btn-sm demo-btn" data-demo aria-haspopup="menu">${L.icon('sliders', 14)}Demo</button>
        </div></header><main class="content" id="main-slot"></main></div>`;
    } else {
      const tabs = L.mobileTabs[role];
      wrap.innerHTML = `<header class="mtop"><a class="brand" href="${tabs[0][0]}"><span class="brand-mark">${L.icon('zap', 14)}</span><span class="brand-word">liard</span></a><div class="mtop-t"><strong>${L.esc(body.dataset.title || '')}</strong>${body.dataset.sub ? `<small>${L.esc(body.dataset.sub)}</small>` : ''}</div>
        <button class="icon-btn bell" data-bell aria-label="Avisos">${L.icon('bell', 18)}${unread ? `<b>${unread}</b>` : ''}</button><button class="icon-btn" data-demo aria-label="Opciones de demo">${L.icon('sliders', 18)}</button></header>
        <main class="content" id="main-slot"></main>
        <nav class="mtabs" aria-label="Navegación">${tabs.map(([h, t, i]) => `<a href="${L.link(h)}" class="${location.pathname.endsWith(h.split('?')[0]) ? 'on' : ''}">${L.icon(i, 20)}<span>${t}</span></a>`).join('')}</nav>`;
    }
    body.prepend(wrap);
    wrap.querySelector('#main-slot').appendChild(page);
    if (act) { const slot = wrap.querySelector('.act-slot'); if (slot) slot.appendChild(act); else page.prepend(act); }
    if (bare) body.classList.add('bare');
    wrap.querySelectorAll('[data-bell]').forEach(b => b.onclick = openBell);
    wrap.querySelectorAll('[data-demo]').forEach(b => b.onclick = openDemo);
    wrap.querySelectorAll('[data-cmd]').forEach(b => b.onclick = openCmd);
    const ps = wrap.querySelector('[data-projsel]'); if (ps) ps.onclick = () => openProjectPicker();
  }
  function openProjectPicker() {
    const s = S(); const cur = L.currentProjectId();
    const d = L.dialog({ title: 'Cambiar de obra', body: `<div class="pick">${s.projects.map(p => `<a class="pick-i${p.id === cur ? ' on' : ''}" href="${L.link(location.pathname.split('/').pop(), { p: p.id })}"><strong>${L.esc(p.name)}</strong><small>${L.esc(p.client)} · ${L.esc(L.projectStage(p.id).label)}</small></a>`).join('')}</div>` });
    return d;
  }
  function openBell() {
    const list = L.myNotifications();
    const body = list.length ? `<div class="notif">${list.map(n => `<a class="notif-i${n.read ? '' : ' unread'}" href="${L.link(n.href)}" data-n="${n.id}"><strong>${L.esc(n.title)}</strong><span>${L.esc(n.body)}</span><small>${L.dateShort(n.at)} · ${L.time(n.at)}</small></a>`).join('')}</div>`
      : L.empty({ icon: 'bell', title: 'No tenés avisos', text: 'Acá aparecen las respuestas de los distribuidores, los planos procesados y las aprobaciones.' });
    const d = L.dialog({ title: 'Avisos', body, actions: list.some(n => !n.read) ? [{ label: 'Marcar todo como leído', onClick: () => { L.store.update(s => s.notifications.forEach(n => { if (list.find(x => x.id === n.id)) n.read = true; })); refreshBell(); } }] : [] });
    d.querySelectorAll('[data-n]').forEach(a => a.addEventListener('click', () => L.store.update(s => { const n = s.notifications.find(x => x.id === a.dataset.n); if (n) n.read = true; })));
  }
  function refreshBell() { const u = L.myNotifications().filter(n => !n.read).length; document.querySelectorAll('[data-bell]').forEach(b => { const x = b.querySelector('b'); if (x) x.remove(); if (u) b.insertAdjacentHTML('beforeend', '<b>' + u + '</b>'); b.setAttribute('aria-label', 'Avisos' + (u ? ', ' + u + ' sin leer' : '')); }); }
  L.refreshBell = refreshBell;
  function openDemo() {
    const s = S(); const role = L.role();
    const other = role === 'SUPPLIER' ? ['d-inicio.html', 'Ver como Ingeniería (Tableros Andes)'] : ['d-prov-inicio.html', 'Ver como Distribuidor (Sur Eléctrica)'];
    const body = `<div class="demo">
      <p class="muted">Prototipo local con datos ficticios. Los cambios se guardan en este navegador y se ven en todas las pantallas y roles.</p>
      <a class="btn btn-secondary" href="${other[0]}">${L.icon('users', 15)}${other[1]}</a>
      <a class="btn btn-secondary" href="index.html">${L.icon('grid', 15)}Volver a la galería</a>
      <button class="btn btn-secondary" data-exp>${L.icon('download', 15)}Descargar estado de la demo (JSON)</button>
      <button class="btn btn-secondary" data-mail>${L.icon('mail', 15)}Ver correos simulados (${s.outbox.length})</button>
      <button class="btn btn-danger" data-reset>${L.icon('refresh', 15)}Reiniciar demo</button></div>`;
    const d = L.dialog({ title: 'Demo', body });
    d.querySelector('[data-reset]').onclick = async () => { d.close(); if (await L.confirm('Reiniciar la demo', 'Se borran todos los cambios hechos en este navegador y se vuelve a los datos de ejemplo.', 'Reiniciar', 'danger')) { L.store.reset(); location.reload(); } };
    d.querySelector('[data-exp]').onclick = () => L.download('liard-demo-estado.json', L.store.export(), 'application/json');
    d.querySelector('[data-mail]').onclick = () => { d.close(); L.dialog({ title: 'Correos simulados', wide: true, body: `<p class="muted">Ningún correo sale de este prototipo. Esto es lo que se enviaría.</p><div class="mail">${S().outbox.map(m => `<article><header><strong>${L.esc(m.subject)}</strong><small>Para ${L.esc(m.to)} · ${L.dateShort(m.at)} ${L.time(m.at)}</small></header><p>${L.esc(m.body)}</p></article>`).join('')}</div>` }); };
  }
  /* Paleta de comandos ⌘K: obras, pantallas, materiales, solicitudes. */
  function openCmd() {
    const role = L.role(); const s = S();
    const items = [
      ...L.pages.filter(p => p.role === role && !p.hidden).map(p => ({ t: p.label, sub: 'Pantalla', href: L.link(p.href), ic: p.icon })),
      ...(role === 'ENGINEER' ? s.projects.map(p => ({ t: p.name, sub: 'Obra · ' + p.client, href: L.link('d-obra.html', { p: p.id }), ic: 'folder' })) : []),
      ...(role === 'ENGINEER' ? s.bomLines.filter(l => !l.deleted).map(l => ({ t: L.lineLabel(l), sub: 'Material · ' + L.project(l.projectId).name, href: L.link('d-bom.html', { p: l.projectId, linea: l.id }), ic: 'list' })) : []),
      ...s.requests.filter(r => role === 'ENGINEER' || r.supplierIds.includes(s.session.supplierId)).map(r => ({ t: r.code, sub: 'Solicitud · ' + L.project(r.projectId).name, href: role === 'ENGINEER' ? L.link('d-comparar.html', { r: r.id, p: r.projectId }) : L.link('d-prov-oferta.html', { r: r.id }), ic: 'send' })),
    ];
    const box = document.createElement('div'); box.innerHTML = `<input class="input" type="search" placeholder="Buscar obras, materiales, solicitudes o pantallas" aria-label="Buscar"><div class="cmd-list" role="listbox"></div>`;
    const inp = box.querySelector('input'), list = box.querySelector('.cmd-list');
    const render = () => { const q = inp.value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, ''); const r = items.filter(i => (i.t + ' ' + i.sub).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q)).slice(0, 12); list.innerHTML = r.length ? r.map((i, k) => `<a class="cmd-i${k === 0 ? ' on' : ''}" href="${i.href}" role="option">${L.icon(i.ic, 16)}<span>${L.esc(i.t)}</span><small>${L.esc(i.sub)}</small></a>`).join('') : '<p class="muted pad">Sin resultados. Probá con el nombre de una obra o un material.</p>'; };
    inp.oninput = render; inp.onkeydown = e => { if (e.key === 'Enter') { const a = list.querySelector('.cmd-i'); if (a) location.href = a.getAttribute('href'); } };
    render(); L.dialog({ title: 'Buscar', body: box }); setTimeout(() => inp.focus(), 30);
  }
  document.addEventListener('keydown', e => { if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openCmd(); } });

  /* Selector de variantes: la misma tarea con distinta estructura. variants: [{id, label, desc}] */
  L.variants = (host, variants, onChange, key) => {
    const cur = L.param('v') || (key && L.pref('v:' + key)) || variants[0].id;
    host.innerHTML = `<div class="variants" role="tablist" aria-label="Variantes de esta pantalla">${variants.map(v => `<button role="tab" aria-selected="${v.id === cur}" data-v="${v.id}" title="${L.esc(v.desc || '')}">${L.esc(v.label)}</button>`).join('')}</div>`;
    host.querySelectorAll('[data-v]').forEach(b => b.onclick = () => { host.querySelectorAll('[data-v]').forEach(x => x.setAttribute('aria-selected', x === b)); L.setParam('v', b.dataset.v); if (key) L.pref('v:' + key, b.dataset.v); onChange(b.dataset.v); });
    onChange(cur); return cur;
  };

  /* Alto del contenido para la galería (?full=1) y para shoot.sh (?measure=1). */
  function reportHeight() { const h = Math.ceil(document.documentElement.scrollHeight); if (window.parent !== window) window.parent.postMessage({ type: 'liard-h', h, src: location.pathname.split('/').pop() + location.search }, '*'); if (L.param('measure') === '1') document.title = 'H=' + h; }
  L.reportHeight = reportHeight;

  L.ready = fn => { if (document.readyState !== 'loading') fn(); else document.addEventListener('DOMContentLoaded', fn); };
  L.ready(() => {
    L.store.get(); L.tick();
    if (document.getElementById('page')) shell();
    L.store.subscribe(() => refreshBell());
    setInterval(() => { L.tick(); }, 1000);
    new ResizeObserver(reportHeight).observe(document.documentElement); setTimeout(reportHeight, 300);
  });
})();
