# liard horizon

Propuesta de producto para liard: estrategia, oportunidades priorizadas, roadmap por dependencias, sistema visual y una
galería de prototipos funcionales locales. Todo con datos ficticios; detección, IA, correos y pagos simulados.

- **Galería**: `index.html`. Abre por `file://` o con `./serve.sh` → http://localhost:8765
- **Estrategia**: `estrategia/index.html` (fuentes en `estrategia/*.md`)
- **Investigación y auditoría del repo**: `research/index.html`
- **Mapa de cobertura**: sección «Cobertura» de la galería (`index.html#cobertura`)
- **QA**: `QA.md` · capturas en `shots/v1/`
- **Contratos compartidos** (datos, dominio, UI): `CONTRATOS.md` · notas por área en `notes/`

Estructura: `tokens.css` + `ui.css` (sistema visual), `data.js` (semilla), `app.js` (estado persistente, reglas de dominio,
shell, descargas), `sections.js` + `gallery.js` (galería), `d-*.html` escritorio 1440, `m-*.html` teléfono 390,
`tablero3d-engine.js` + `vendor/three.global.js` (three.js r161, MIT) para el 3D.

El estado vive en `localStorage` de este navegador y se comparte entre pantallas y roles; «Reiniciar demo» vuelve a la
semilla. Los marcos de la galería usan un estado propio para que mirar no cambie la demo.

Esto no es código de producción. Que un flujo funcione acá no completa ningún sprint: ver `estrategia/03-roadmap.html` §5.
