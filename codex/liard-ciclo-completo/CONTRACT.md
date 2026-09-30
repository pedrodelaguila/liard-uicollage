# Contrato compartido · v1 · 30/09/2026
Salida exclusiva: este directorio. No tocar el repo ni publicar. El coordinador posee tokens.css, ui.css, app.js, data.js, index.html, gallery.js y pruebas; cada agente posee sus HTML, JS y manifiesto. No dependencias externas; funciona file:// + HTTP. Los datos son ficticios, no usar planos o clientes reales.

## Documento por pantalla
<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Título · liard</title><link rel="stylesheet" href="tokens.css"><link rel="stylesheet" href="ui.css"></head><body data-role="ingenieria" data-active="ingenieria" data-title="Título" data-sub="Hospital del Parque / TGBT-01" data-status="Propuesto" data-horizon="Visión"><div id="page"></div><div id="act"></div><script src="data.js"></script><script src="app.js"></script><script src="engineering.js"></script></body></html>
Roles: ingenieria, compras, proveedor, direccion, operaciones, taller, obra, mantenimiento. Status exactos: Existe, Planificado, Propuesto. Horizonte: Cierre S4, Sprint 5, Visión. Si un flujo combina existente y nuevo, status Planificado/Propuesto y badge Existe en la pieza que existe. Nuevos menú/tabs llevan Nuevo. No afirmar sprint terminado por prototipo. #1007–1010 son backlog posterior sin milestone, no clasificarlos S4 o S5 confirmados.

## Funciones globales inmutables UI
UI.render(html,actions='') inserta página y acciones; shell ya montado.
UI.icon(name) SVG inline. Nombres: grid, project, file, cube, check, clock, alert, arrow, plus, search, settings, bell, user, chart, package, layers, shield, wrench, link, send, refresh, download, chevron, eye, spark, close.
UI.badge(text,tone='neutral') tone: blue, green, amber, red, neutral.
UI.button(label,href='',variant='primary') retorna anchor si href, botón data-toast si no. variant primary/secondary/ghost/danger.
UI.card(title,body,aside='') retorna tarjeta; UI.kpi(label,value,detail='',tone='') retorna tarjeta indicador.
UI.table(headers,rows) rows arrays HTML strings. UI.money(number,currency='USD').
UI.steps(labels,activeIndex) links? visual; navegación de flujo se implementa explícitamente por agente.
UI.tabs(items,current,param='paso') items [{id,label}], controla query conservando otros parámetros.
UI.note(title,text,tone='blue'). UI.toast(text).
UI.save(key,value)/UI.load(key,fallback) persiste en localStorage con prefijo liard-demo: y memoria fallback file://. UI.reset() resetea datos demo y query. UI.q(name,fallback='') lee query.

## CSS
.row flex gap12 align center, .between justify-between, .stack grid gap16; .grid2/.grid3/.grid4; .split grid 1.6fr 1fr; .card/.card-head/.card-body/.card-footer; .btn/.btn.secondary/.btn.ghost; .badge blue/green/amber/red; .muted/.small/.mono/.eyebrow; .table-wrap/.table; .tabs/.tab.active; .note/.note.amber/.note.red/.note.green; .kpi/.value; .list/.list-row; .progress; .metric; .field; .input; .toolbar; .empty; .timeline/.event; .avatar/.avatars; .selected; .divider; .technical-canvas; .sticky-footer; .mobile-card. Propias clases namespace prefijo del agente, styles locales o CSS propio exclusivo. Tipos/JS dentro closure, no mutable globals. Inputs labels, keyboard, botones útiles, diálogos nativos con Escape, motion reducida. Controles no disponibles disabled + motivo. No 'toast para todo': decisiones deben actualizar/validar estado y pasos de workflow. UI.button sin href útil solo confirmación simple.

## Datos B (solo coordinator edita data.js)
B.project {id:'PR-024',name:'Hospital del Parque',client:'Desarrollos Parque',location:'Córdoba',revision:'R03',panels:24,multiplier:3,deadline:'16 oct 2026'}; B.panel {id:'TGBT-01',revision:'R03',modules:72,poles:62,coverage:92}; B.company='Sur Ingeniería'; B.people: Martina (ingeniería), Tomás (compras), Elena (dirección), Lucas (taller), Sofía (obra). B.bom rows [{id:'QF-01',name,type,spec,qty,unit,price,source,brand,sku,poles,modules,status}]; qty proyecto se explicita vs tablero. B.providers [{id,name,days,total,stock}]. B.finance {materials:18420,labor:4200,overhead:1800,contingency:1200,cost:25620,sale:34160,margin:25}; moneda USD ilustrativa, sin IVA, TC manual 1300 ARS/USD ficticio. B.order {id:'OC-026',status:'Pendiente',provider:'Norte Eléctrico',amount:18420}; B.asset {id:'ACT-TGBT-01',serial:'SUR-2026-024-01'}.

## Navegación fija
Ingeniería d-engineering.html; cobertura d-matching.html; DWG d-dwg.html; 3D d-panel.html; revisión IA d-review-ai.html; revisiones d-revisions.html; reglas d-rules.html; presupuesto d-estimate.html; compras d-procurement.html; alternativas d-alternatives.html; proveedor d-supplier.html; catálogo d-catalog.html; comercial d-commercial.html; despliegue d-rollout.html; pagos d-billing.html; IA costo d-ai-cost.html; emails d-notifications.html; observabilidad d-observability.html; dataset d-dataset.html; fabricación d-fabrication.html y m-workshop.html; logística d-logistics.html; obra m-field.html; mantenimiento d-maintenance.html y m-service.html; colaboración d-collaboration.html; automatización d-automation.html; integración d-integrations.html.

## Manifiesto por agente
manifest-NAME.json = array de secciones: {id,title,role,horizon,status,priority:'P0'|'P1'|'P2',issues:[n],description,frames:[{kind:'d'|'m',src:'d-xx.html?paso=...',caption,note,status:'Planificado'}],states:[{label,src}],dependencies:[id],production:'Resumen concreto de implementación y riesgos'}.
Cada sección 2–4 frames; cada frame es estado significativo con enlace full-size. Incluir inicio → decisión → confirmación/traspaso. Variantes experto/guiado/IA/visual usan mismos ids y cantidades.

## Propiedad
engineering: engineering.js; d-engineering,d-matching,d-dwg,d-panel,d-review-ai,d-revisions,d-rules.html; manifest-engineering.json.
platform: platform.js; d-rollout,d-billing,d-ai-cost,d-notifications,d-observability,d-dataset.html; manifest-platform.json.
operations: operations.js; d-fabrication,m-workshop,d-logistics,m-field,d-maintenance,m-service,d-collaboration,d-automation,d-integrations.html; manifest-operations.json.
coordinator: commercial.js; d-estimate,d-procurement,d-alternatives,d-supplier,d-catalog,d-commercial.html; manifest-commercial.json + todos los compartidos.
