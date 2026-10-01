# liard · ciclo completo · propuestas de UI v1

Galería de prototipos clickeables de liard, del plano al tablero en servicio: ingeniería, presupuesto, compras,
fabricación, obra, mantenimiento y comercial. Hecha desde cero (sin mirar las galerías anteriores), sobre el código de la
rama `dev` de `lab3-liard`, con sus tokens y su lenguaje de componentes.

- **Galería:** `index.html` (por `file://` o `./serve.sh` → http://localhost:8765). Filtros por horizonte y por rol, y
  navegación por etapa. Cada marco tiene un enlace «abrir» que muestra la pantalla a tamaño completo.
- **Horizontes:** `existe en dev` · `Sprint 4 pendiente` · `Sprint 5 planificado` · `propuesta 0–6 meses` ·
  `6–18 meses` · `concepto`. Cada sección los lleva arriba y cada pantalla abajo a la izquierda. Dentro de una pantalla, lo
  que ya existe va marcado `existe` y lo nuevo `Nuevo`.
- **Demo:** las pantallas abiertas con «abrir» comparten un estado en `localStorage`. Por ejemplo, lo que destraba
  ingeniería aparece en la cotización, en el taller y en el inicio. Los marcos de la galería corren con un estado propio,
  así que mirarlos no cambia la demo. **Reiniciar demo** vuelve a la semilla.
- **Informe de QA:** `QA.md`. **Plan de construcción**, ordenado por dependencias: `PLAN.md`. Que un flujo funcione acá
  no significa que el sprint esté terminado.
- **Capturas:** `shots/v1/0-galeria.png`, una por sección y 102 pantallas a tamaño real en `shots/v1/pantallas/`.

| Carpeta / archivo | Qué es |
| --- | --- |
| `tokens.css`, `ui.css`, `icons.js` | Tokens reales de `front/src/styles/index.css`, componentes en CSS plano e íconos lucide (ISC) |
| `app.js`, `data.js` | Shell por rol, estado, toasts, diálogos y ⌘K; semilla de datos ficticios compartida |
| `d-*.html` / `m-*.html` | 39 pantallas de escritorio (1440) y 15 de teléfono (390) |
| `<área>.css/js`, `data-<área>.js` | Lo propio de cada área: ingeniería, BOM, compras, proveedor, campo, plataforma |
| `tablero3d.js`, `vendor/` | Motor del tablero 3D/2D (three.js r161, MIT) |
| `sections/*.js`, `gallery.*` | Secciones de la galería, una por funcionalidad |
| `CONTRATOS.md`, `notes/` | Contratos compartidos que siguió cada subagente y las notas de cada área (decisiones, supuestos, qué se verificó) |
| `research/` | Investigación de producto, mercado y código de `dev`, más capturas de la app real |
| `tools/` | QA, recorrido de integración, enlaces, capturas y generador de íconos |

Todo es ficticio: empresas, personas, obras y precios. La detección, la IA, los correos y los pagos son simulados.
