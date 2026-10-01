# Brief común para cada subagente de pantallas

Sos el diseñador/desarrollador de UN workflow de una galería de prototipos de alta fidelidad de **liard** (planos eléctricos DXF → BOM → cotización con distribuidores → órdenes de compra; sector de tableros eléctricos en Argentina). Objetivo de producto: que liard sea la plataforma líder del sector eléctrico a lo largo de todo el ciclo (ingeniería, presupuesto, compras, fabricación, obra, mantenimiento, comercial).

Carpeta de trabajo (O): esta galería (`claude/liard-ciclo-completo/`)

Leé primero, completos: `O/CONTRATOS.md` (obligatorio), `O/_plantilla-d.html`, `O/_plantilla-m.html`, `O/ui.css`, `O/app.js`, `O/data.js`, `O/PLAN-FEATURES.md`. Investigación: `O/research/producto.md`, `O/research/mercado.md`, `O/research/codigo.md`, `O/research/sistema-visual.md`, y mirá las capturas reales de la app en `O/research/shots-app/*.png` (Read) para clavar el lenguaje visual. El repo real (solo lectura, rama dev) es `lab3-liard` podés leer `front/src/**` para copiar el layout y el copy de una pantalla que ya existe, y `documentacion/` y `api-endpoints.md` para reglas de dominio.

PROHIBIDO: abrir o leer las galerías anteriores fuera del repo, `lab3-liard/claude-uicollague/`, `O/../../codex/` o cualquier otra galería/mocks anterior (esta galería se hace desde cero). Modificar el repo lab3-liard. Editar archivos compartidos (`ui.css tokens.css app.js data.js icons.js gallery.* index.html CONTRATOS.md _plantilla-*`) o archivos de otra área. Publicar nada, hacer commits o push.

Tus archivos (exclusivos): los que empiezan con tu prefijo (abajo), `sections/<tu-sección>.js`, `notes/<área>.md`, y opcionalmente `<área>.css`, `<área>.js`, `data-<área>.js`. Si necesitás algo de un archivo compartido, anotalo en `notes/<área>.md` bajo «Pedidos al coordinador» y resolvelo localmente en tus archivos (por ejemplo, CSS propio en `<área>.css`).

Calidad esperada: pantallas completas y recorribles, no capturas estáticas; cada botón hace algo (cambia estado compartido, abre panel/diálogo, toast, navega). Datos coherentes con `data.js` (mismas líneas, precios, proveedores, tableros: los números tienen que cerrar entre pantallas). Copy en español rioplatense del rubro. Marcá en cada pantalla lo que existe (`tag-existe`) vs lo nuevo. Variantes con los mismos datos cuando valga la pena (selector `.seg[data-param=vista]`). Estados por query param (vacío, cargando, error, límite, sin IA). Movimiento sutil y nativo con las curvas reales; alternativa 2D/tabla; `prefers-reduced-motion`.

Antes de terminar: QA (§7 de CONTRATOS) en TODAS tus pantallas y estados hasta que den ✓, mirá cada PNG con Read y corregí. Escribí `notes/<área>.md` con: pantallas y estados, decisiones de diseño, supuestos (lo que inventaste donde la doc no decide), qué existe en dev vs qué es nuevo, pedidos al coordinador, y una lista de lo que verificaste y lo que no.

Tu respuesta final (≤250 palabras): archivos creados, secciones y marcos, resultado del QA (n/n limpias), supuestos clave y pedidos al coordinador.
