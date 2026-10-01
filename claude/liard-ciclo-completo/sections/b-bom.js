/* Área B · BOM, matching y tablero 3D (orden 200–299). */
(window.SECCIONES ||= []).push(
  {
    id: 'bom-editor', orden: 200, etapa: 'Ingeniería', horizonte: 's4', roles: ['ing'],
    refs: ['Discovery · origen y confianza por línea', 'Roadmap S4 · BOM → matching → cotización'],
    titulo: 'Editor del BOM con trazabilidad por línea', corto: 'Editor del BOM',
    descripcion: 'Cada línea dice de dónde sale: <b>Detectado</b> en el plano, <b>Inferido por IA</b>, <b>Por regla</b> de la empresa o <b>Manual</b>. Y por qué tiene esa cantidad: lo dibujado en cada plano × las repeticiones del tablero, más lo que agregó una regla o una persona. El estado es el mismo que calcula la app: «Lista», «Se puede cotizar con reparos», «Bloquea la cotización».',
    existe: 'El editor del BOM consolidado (lista + inspector, vista por planos, componente base y atributos, marca y gama, acciones en lote, localizador en el plano) y los tres estados de línea de <code>lineState.ts</code>. Lo nuevo: el origen por línea, la tabla «Por qué esta cantidad», el historial y el filtro por origen.',
    reglas: [
      'Dibujada ≠ a comprar: la diferencia siempre se explica en filas (plano × repeticiones, regla, corrección manual).',
      'Una corrección de una persona pasa la línea a «Manual» y queda en el historial con su nombre.',
      'Lo inferido por la IA se muestra con su confianza y se marca como revisado a mano.',
      '<code>?linea=l09</code> abre el inspector en esa línea; ↑ ↓ recorren la lista y <kbd>/</kbd> busca.',
    ],
    estados: [['Cargando', 'd-bom-editor.html?estado=cargando'], ['Vacío', 'd-bom-editor.html?estado=vacio'], ['Sin IA', 'd-bom-editor.html?estado=sin-ia'], ['Cable inferido (l16)', 'd-bom-editor.html?linea=l16'], ['Desde el teléfono', 'm-bom-linea.html?linea=l09']],
    marcos: `
      d|d-bom-editor.html?linea=l16|Trazabilidad de una línea inferida|1.120 m de cable: 320 acotados + 800 estimados por la IA
      d|d-bom-editor.html?vista=por-plano&plano=tspiso|Por planos: el piso tipo se repite 6 veces|Dibujada × 6 = a comprar
      d|d-bom-editor.html?estado=cargando|Cargando el BOM consolidado|
    `,
  },
  {
    id: 'bom-insuficiente', orden: 210, etapa: 'Presupuesto', horizonte: 's4', roles: ['ing', 'pres'],
    refs: ['Roadmap S4 · cerrar BOM → matching → cotización', 'Roadmap S5 · matching para todos los componentes', 'Discovery · nunca inventar un SKU'],
    titulo: 'Información insuficiente: destrabar la cotización', corto: 'Información insuficiente',
    descripcion: 'Las líneas que bloquean la cotización llegan a una bandeja con la pregunta concreta, no con un error: «¿de qué corriente es el NH00 del TS-BOMBAS?» (falta Corriente nominal), «¿el PM5100 va en la puerta o en riel DIN?» (falta Formato), «¿cómo cotizamos el gabinete?» (no hay componente base). Se destraba eligiendo el valor, confirmando una sugerencia de la IA con su fuente y su costo, preguntándole al proyectista o cotizando a mano. Al destrabar, la línea pasa a «Lista» y la cotización la toma.',
    existe: 'El motivo <code>NOT_FOUND</code> (<code>unmatchedReason</code>) y el panel de componente base que avisa «Faltan atributos esenciales». La bandeja, la pregunta, la variante guiada y la consulta al proyectista son nuevas.',
    reglas: [
      'Nada se completa solo: cada valor lo elige una persona, lo confirma de una sugerencia o sale de una regla, y queda el origen.',
      'La sugerencia de la IA trae confianza, costo en US$ y la fuente; con la IA apagada queda el camino manual.',
      'Destrabar escribe <code>lineas[i].attrs</code>, <code>.faltan</code>, <code>.estado</code> y <code>.org</code>: la cotización (área C) lo refleja sin recargar.',
      '«Gabinete» como componente base es la propuesta del Sprint 5; hasta entonces, «cotizar a mano», sin código.',
    ],
    estados: [['Sin IA', 'd-bom-editor.html?estado=sin-ia'], ['Guiada', 'd-bom-editor.html?vista=guiada']],
    marcos: `
      d|d-bom-editor.html|Bandeja con las 3 preguntas|Elegí un valor y la línea pasa a «Lista»
      d|d-bom-editor.html?vista=guiada|Destrabá la cotización en 3 pasos|Una pregunta por pantalla, con atajos 1–5
      m|m-bom-linea.html?linea=l09|La misma pregunta desde el teléfono|
    `,
  },
  {
    id: 'bom-reglas', orden: 220, etapa: 'Ingeniería', horizonte: 'h1', roles: ['ing', 'dir'],
    refs: ['Discovery · EMEVE: accesorios derivados', 'Discovery · Meco: reglas para lo que falta'],
    titulo: 'Reglas de la empresa y accesorios derivados', corto: 'Reglas del BOM',
    descripcion: 'La «zona gris» del plano se resuelve con reglas que define dirección o presupuesto: <b>accesorios derivados</b> («cada térmica 2×16 A → 6 m de cable de 2,5 mm²», «1 bornera por polo + 10 % de reserva», «riel DIN por fila», «ventilación para gabinetes IP55») y <b>valores para lo que falta</b> («si falta el poder de corte → 6 kA», «si falta la corriente del NH → no completar y preguntar»). Cada regla muestra qué cambiaría en el BOM del Hospital antes de activarla.',
    existe: 'Nada: hoy las borneras y el cable se cuentan a mano. La regla de borneras (l15) ya aparece en el BOM como «Por regla» en esta galería.',
    reglas: [
      'Una regla nunca inventa un código: si el accesorio no tiene componente base, entra como «se cotiza a mano».',
      'Vista previa del impacto (líneas, cantidades y $ sin IVA) y simulación antes de aplicar.',
      'Pausar no borra lo que ya agregó; cada regla tiene versión, autor e historial.',
      'Aplicar «Formato de multimedidor» destraba el PM5100 en el editor y en la cotización.',
    ],
    estados: [['Vacío', 'd-bom-reglas.html?estado=vacio'], ['Error', 'd-bom-reglas.html?estado=error']],
    marcos: `
      d|d-bom-reglas.html|Cable por térmica: reemplaza una inferencia por una regla|1.120 m → 1.112 m
      d|d-bom-reglas.html?regla=r6&tipo=falta|Valor para lo que falta: formato del PM5100|Aplicarla destraba la línea l11
      d|d-bom-reglas.html?estado=vacio|Sin reglas todavía|
    `,
  },
  {
    id: 'bom-alternativo', orden: 230, etapa: 'Presupuesto', horizonte: 's5', roles: ['ing', 'pres', 'prov'],
    refs: ['Roadmap S5 · BOM alternativo', 'Discovery · Meco: de Schneider a ABB', 'IEC 61439 · verificación de diseño'],
    titulo: 'BOM alternativo', corto: 'BOM alternativo',
    descripcion: 'La misma ingeniería con otra marca: el BOM alternativo cambia marca y gama línea por línea (Schneider → ABB), con los mismos componentes base y atributos esenciales, y se compara contra el original en costo, plazo y stock. Si cambia un interruptor de potencia o el gabinete, avisa que según IEC 61439 la verificación de diseño de esa parte pasa al tablerista.',
    existe: 'Marcas y gamas por línea, marcas preferidas y bloqueadas, y la matriz que compara marcas de cada proveedor. El BOM alternativo como objeto propio es del Sprint 5.',
    reglas: [
      'Cada línea que cambia viaja una vez, con el original y la alternativa al lado; la cantidad no se duplica.',
      'El distribuidor elige por línea original, alternativa o ninguna; no propone una tercera marca fuera de la contraoferta (área D).',
      'El aviso IEC 61439 se confirma antes de enviar y queda en la OC si se adjudica un aparato de potencia de la alternativa.',
      'El plan limita la cantidad de alternativas por proyecto.',
    ],
    estados: [['Límite del plan', 'd-bom-alternativo.html?estado=limite']],
    marcos: `
      d|d-bom-alternativo.html|Original contra alternativa ABB|−2,6 % y 2 aparatos a verificar
      d|d-bom-alternativo.html?vista=diferencias|Solo lo que cambia|
      d|d-bom-alternativo.html?estado=limite|Tope de alternativas del plan|
    `,
  },
  {
    id: 'bom-3d', orden: 240, etapa: 'Fabricación', horizonte: 'h2', roles: ['ing', 'tal'],
    refs: ['Siemens SIMARIS · configuración en 3 vías', 'Schneider Rapsody · frente del tablero', 'EPLAN Pro Panel · layout 3D'],
    titulo: 'Tablero 3D vinculado al BOM', corto: 'Tablero 3D',
    descripcion: 'El TGBT del Hospital armado desde su BOM: gabinete 1800×800×400 sobre zócalo, riel DIN por fila, cada aparato con su ancho en módulos de 18 mm y su referencia (Q0, Q1…). Tocar un aparato selecciona su línea del BOM y al revés. Se puede aislar una familia, explotar las filas, abrir o cerrar la puerta, ver cotas y ocupación por fila, y pintar por estado del BOM o por estado de compra. Las mismas líneas y la misma selección en un frente 2D con cotas (sin WebGL) y en la lista de armado.',
    existe: 'Nada: la app no tiene vista física del tablero. El motor es <code>tablero3d.js</code> (lo reutiliza el área de taller).',
    reglas: [
      'Sin WebGL pasa solo al frente 2D (<code>?estado=sin-3d</code>).',
      'Un cuadro por cambio: el render se detiene cuando no hay interacción.',
      'Teclado: flechas giran, + − acercan, 0 reinicia; la lista se recorre con ↑ ↓.',
      'Exporta PNG del 3D y la lista de armado en CSV (separador «;»).',
    ],
    estados: [['Sin WebGL', 'd-bom-3d.html?estado=sin-3d'], ['Vacío', 'd-bom-3d.html?estado=vacio'], ['Lista de armado', 'd-bom-3d.html?vista=tabla']],
    marcos: `
      d|d-bom-3d.html?linea=l05|Vista 3D seleccionable|Clic en un aparato → su línea del BOM
      d|d-bom-3d.html?vista=frente&linea=l11|Frente 2D con cotas|Misma selección, sin WebGL
      d|d-bom-3d.html?vista=tabla&color=compra|Lista de armado con estado de compra|
    `,
  }
);
