# Compras (ingeniería) · notas

Área: solicitud → ofertas → comparación → adjudicación → pedidos, del lado del tablerista.

## Pantallas

| Archivo | Capacidad | Qué hace |
| --- | --- | --- |
| `d-cotizacion.html` | cotización de referencia `existe`; solicitud a distribuidores `propuesto` | Bloqueos (`L.blockers`) con links y envío deshabilitado; cotización de referencia de catálogos (total, cobertura, plazo máx. y «PRECIO DESACT.» por distribuidor; mejor referencia por línea; motivo NOT_FOUND). Siempre rotulada «precio de referencia, no confirmado». Formulario en 3 bloques: distribuidores (marcas + cobertura de lo pedido), materiales (por defecto los que tienen precio; NOT_FOUND se puede pedir «fuera de catálogo»), plazo ≥ mañana, alternativas, nota; aviso de confidencialidad. `L.createRequest` → navega a comparar. Lista de solicitudes de la obra con estado. |
| `d-comparar.html` | `propuesto` (la app hoy compara en solo lectura) | Encabezado de la solicitud (plazo, estado), tarjeta por oferta (estado, total, validez con aviso < 3 días y vencida, pago, nota, «Simular respuesta» `L.sim`). Alternativas ofrecidas con diálogo de equivalencia técnica (atributos lado a lado, `L.setEquivalence`). Tres variantes. Barra de adjudicación común: total, reparto, errores de `L.validateAward`, aprobación por umbral, pedidos creados. XLSX real (2 hojas). |
| `d-pedidos.html` | `existe` (rediseño) | KPIs por estado (también filtran), filtros estado/obra/distribuidor + búsqueda, tabla ordenable, detalle `?o=` con línea de tiempo, contacto del distribuidor solo si CONFIRMED, PDF real «Orden de compra», XLSX de todos los pedidos filtrados, pedido rechazado → «Readjudicar» (vuelve a comparar con esas líneas sin asignar). |
| `d-directorio.html` | listado `existe`; historial, zona y cobertura por obra `propuesto` | Marcas, ciudad, tiempo de respuesta, tamaño de catálogo, materiales, precios desactualizados, historial de respuestas/pedidos, cobertura para una obra (selector); búsqueda y filtros; «Pedirle cotización» abre cotización con ese distribuidor preseleccionado (`?sup=`). |
| `m-aprobar.html` (390) | `propuesto` | Dirección aprueba/rechaza adjudicaciones pendientes (`L.decideApproval`, nota obligatoria al rechazar) y equivalencias pendientes; historial de decisiones. `?ap=<id>` lleva la adjudicación al tope. |

## Variantes de d-comparar (mismos datos, mismo borrador)

| Variante | Estructura | Sirve para | Costo |
| --- | --- | --- | --- |
| **Matriz** (`v=matriz`) | material × distribuidor; celda = precio unitario, «oferta confirmada» / «precio de referencia» (sin oferta: no adjudicable), stock, plazo, marcas «más barato/más rápido», alternativa; clic adjudica; estrategias Más barato / Más rápido / Único proveedor; totales por distribuidor; filtro «solo sin asignar». | Compras que revisa línea por línea y decide con detalle. | Densa; en 390 no entra (es de escritorio). |
| **Escenarios** (`v=escenarios`) | Dispersión costo × plazo máx. (forma + color + etiqueta, alternativa en barras y tabla), tarjeta por escenario con «qué ganás / qué perdés» contra el **mejor proveedor único**; «Usar este escenario» lo vuelve asignación. | Decidir rápido o justificarlo ante Dirección. | No muestra el porqué por línea. |
| **Asistente de compras** (`v=asistente`) | IA simulada (`L.ai`, `L.sim`, `L.aiSpend` USD 0,03, medidor del mes). Explica por línea con evidencia (delta de precio, stock, plazo, validez), riesgos (stock parcial, a pedido, alternativa pendiente que ahorraría, oferta por vencer, distribuidor sin responder). Checkboxes → «Aplicar las líneas marcadas» al borrador. Con límite: rechaza y ofrece Matriz/Escenarios. Avisa si las ofertas cambiaron desde la recomendación. | Segunda opinión antes de comprar, usuario menos experto. | Cuesta IA; la persona decide. |

Borrador: `s.ui.alloc[rid]` (persistente, se ve entre pestañas/iframes); recomendación IA en `s.ui.aiReco[rid]`. Las líneas con pedido activo quedan bloqueadas; las de un pedido rechazado se reabren sin ese distribuidor.

## URLs para la galería

- `d-cotizacion.html?p=p1` (bloqueada) · `?p=p2` (con solicitud) · `?p=p4` (vacía) · `?p=p1&estado=cargando|error` · `?p=p1&sup=delta`
- `d-comparar.html?r=r-0141&p=p2&v=matriz|escenarios|asistente` · `&estado=limite` (asistente sin presupuesto) · `&dialogo=equivalencia` · `?r=r-0127&p=p3` (adjudicada, solo lectura) · `?p=p1` (sin solicitud) · `&estado=cargando|error`
- `d-pedidos.html` · `?p=p3&o=oc-0098` (confirmado, contacto visible) · `?estado=vacio|cargando|error`
- `d-directorio.html` · `?p=p1` (cobertura) · `?estado=vacio`
- `m-aprobar.html` · `?estado=vacio`. Con el seed no hay aprobaciones pendientes (la de SC-0141 no supera ARS 30 M): el frame muestra la equivalencia pendiente de Norte.

## Test

`node tools/tests/compras.test.js` → **✓ compras: todo bien** (0 fallas, sin errores de consola). Capturas en `shots/tests/compras/` (35 PNG, 1440; m-aprobar a 390), todas revisadas.

Cubre: p1 bloqueado (envío deshabilitado, links, PRECIO DESACT., NOT_FOUND); arreglo por evaluate (resolver símbolos, marcar marcas) → envío habilitado; validación de plazo (hoy y vacío fallan); SC-0142 creada y visible en comparar. p2/SC-0141: alternativa sin aprobar da error de `validateAward`; simular Sur; aprobar equivalencia de Norte; Más barato (7/7, total ARS 5.147.680 < umbral 30 M → **pedidos creados sin aprobación**: OC-0100 Sur, OC-0101 Norte, uno por distribuidor); persistencia tras recargar; XLSX válido; escenarios y asistente (cobra 0,03); PDF empieza con `%PDF` y trae el código y la nota de pago; XLSX de pedidos; confirmar/rechazar → contacto y readjudicar. Camino de aprobación con umbral bajado a 1 M: «Esperando aprobación de Dirección», sin pedidos, m-aprobar exige nota para rechazar, aprueba equivalencia + adjudicación, d-comparar lo refleja (keepState) y emite. Límite de IA, directorio (filtro y preselección).

Dato: con Sur simulado, Más barato elige Sur en h1 (991.870 < alternativa Norte 998.000).

## Supuestos

- Sin oferta de un distribuidor, la celda muestra su precio de catálogo como referencia y no es adjudicable (el contrato solo permite adjudicar ofertas).
- El «mejor proveedor único» es el que más materiales cubre con ofertas vigentes y, a igual cobertura, el más barato (mismo criterio que `L.allocate('UNICO')`).
- Aprobar una equivalencia desde m-aprobar queda a nombre de la sesión (Lucía, Ingeniería): `L.setEquivalence` no recibe usuario. Se aclara en pantalla.
- «Aprobar como Daniel Ortega» es un link a `m-aprobar.html?ap=<id>` (demo), no una aprobación en un clic.

## Pedidos al coordinador

1. `L.award` crea un pedido nuevo para cada llamada: tras un rechazo, readjudicar funciona, pero `r.alloc` se sobrescribe con la parte nueva y `r.status` ya es `ADJUDICADA`. Sugerencia: `r.alloc = Object.assign({}, r.alloc, alloc)`.
2. `L.award` busca una aprobación `APROBADA` con el mismo total (±1): si la persona cambia un centavo después de aprobar, vuelve a pedir aprobación (correcto) pero la pendiente anterior no existe y se crea otra; ok. No hay forma de saber qué alocación se aprobó salvo `approval.alloc`. Sin cambio pedido, solo aviso.
3. `L.setEquivalence(oid, lineId, decision, userId?)`: parámetro opcional de quién decide, para que m-aprobar registre a Dirección sin tocar `s.session`.
4. `L.compare` no expone `stale` de las líneas de oferta de catálogo; se lee de la oferta. Opcional.
5. El registro de páginas marca `d-pedidos`/`d-directorio` como `existe` (correcto para la base); las partes nuevas se marcan con `L.cap('propuesto')` dentro de la página.

## Frames de galería (`kind|src|caption|note`)

```
laptop|d-cotizacion.html?p=p1|Cotización bloqueada|Bloqueos con links, referencia de catálogos no confirmada, envío deshabilitado
laptop|d-cotizacion.html?p=p2|Cotización con solicitud abierta|Referencia por distribuidor y SC-0141 en curso
laptop|d-comparar.html?r=r-0141&p=p2&v=matriz|Comparar · Matriz|Material × distribuidor, clic para adjudicar, estrategias
laptop|d-comparar.html?r=r-0141&p=p2&v=escenarios|Comparar · Escenarios|Costo contra plazo; qué ganás y perdés frente al mejor proveedor único
laptop|d-comparar.html?r=r-0141&p=p2&v=asistente|Comparar · Asistente de compras|IA simulada USD 0,03: explica, marca riesgos, vos aplicás
laptop|d-comparar.html?r=r-0141&p=p2&v=asistente&estado=limite|Asistente sin presupuesto|Rechaza por límite mensual y ofrece camino manual
laptop|d-comparar.html?r=r-0141&p=p2&dialogo=equivalencia|Equivalencia técnica|Alternativa sugerida vs pedido, atributo por atributo
laptop|d-comparar.html?r=r-0127&p=p3|Solicitud adjudicada|Solo lectura con los pedidos emitidos
laptop|d-pedidos.html|Pedidos|Filtros, detalle, PDF de orden de compra, XLSX
laptop|d-pedidos.html?p=p3&o=oc-0098|Pedido confirmado|Contacto del distribuidor visible solo al confirmar
laptop|d-directorio.html?p=p1|Distribuidores|Marcas, respuesta, historial y cobertura para la obra
phone|m-aprobar.html|Aprobar desde el teléfono|Dirección decide adjudicaciones y equivalencias pendientes
```
