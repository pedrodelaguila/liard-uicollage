# plataforma · notas

Área: `d-asistentes.html`, `d-automatizaciones.html`, `d-cuenta.html`, `tools/tests/plataforma.test.js`.
No se tocó ningún archivo compartido.

## Pantallas

### d-asistentes.html · Asistentes IA (`propuesto`, ingeniería)
- Hay cuatro asistentes en pestañas (flechas ←/→): **Revisión**, **Estimación**, **Compras** y **Catálogo y materiales**. Cada uno es un chat con 3 o 4 preguntas sugeridas, cada una con su costo (≈ USD 0,01–0,04).
- Las respuestas son **deterministas** y salen del store:
  - Revisión: bloqueos = `L.blockers`, con detalle por línea y por símbolo; líneas `NOT_FOUND` = `L.unmatchedReason`, que propone el atributo si lo encuentra en un comentario; símbolos sin identificar; planos sin procesar o sin revisar.
  - Estimación: margen con otra validez = `L.budget(pid, {validityDays})`, que muestra la inflación y el margen efectivo y propone guardar la validez; procedencia del costo = `L.materialCost`; escenario competitivo.
  - Compras: la oferta más barata = `L.allocate('BARATO')` + `L.allocationSummary` + `L.offerTotal` por oferta, y marca la alternativa más barata que todavía no se puede usar porque no está aprobada; ofertas que vencen en 7 días; stock no confirmado; quién no respondió (propone un recordatorio, que genera correo simulado y aviso).
  - Catálogo: alternativas `SUGERIDA` con una tabla de atributos pedido/alternativa y la propuesta de aprobar o rechazar; marcas equivalentes por atributos esenciales (`L.matches` con `ANY`); marcas excluidas.
- Cada respuesta muestra la etiqueta `L.ai`, `L.sim`, su costo, las **fuentes** (enlaces a pantallas y entidades) y las **propuestas**. Una propuesta se aplica solo con «Revisar y aplicar», que abre `L.confirm`; recién ahí se ejecuta la función del store (`L.updateLine`, `L.resolveSymbol`, `L.processPlans`, `L.saveBudget`, `L.setEquivalence`, `_notify/_mail/_log`). Antes de ejecutar se revalida la propuesta: si alguien ya cambió el dato, queda «Ya no aplica» y no se toca nada. «Descartar» no cambia nada. Todo lo aplicado queda en la actividad.
- El texto libre se resuelve con intenciones por palabras clave, más la obra (por nombre), la solicitud (`SC-0141`), los días (`15 días`) y la línea (`b12`) que aparezcan en la pregunta. Si la pregunta es de otro asistente, se lo deriva sin costo. Si no se reconoce: «No sé responder eso con los datos de la obra», sin costo y con sugerencias.
- Cada consulta cobrada va a `s.ai.ledger` (kind `Asistente`) vía `L.aiSpend`. Las conversaciones se guardan en `s.ui.asist[asistente]` y sobreviven a la recarga.
- Estados:
  - Tope agotado (`!L.aiCan`): el asistente queda deshabilitado, con un aviso con los caminos manuales y un enlace a Uso de IA. Si igual se pregunta, se niega y no cobra.
  - `?estado=limite`: fuerza el mismo estado de tope agotado.
  - `?estado=ia-no-disponible`: servicio caído, «No se perdió nada», botón Reintentar y caminos manuales.
  - `?a=<asistente>&q=<intent>`: hace la pregunta sugerida una sola vez, para la galería. Si esa pregunta ya está en la conversación, no la repite ni la cobra.

### d-automatizaciones.html · Equipo y automatizaciones (`propuesto`)
Tiene seis pestañas; `?tab=equipo|comentarios|aprobaciones|reglas|actividad|correos`.
- **Equipo:** nota «en producción cada obra tiene un solo dueño» (`existe`). Tabla de miembros y formulario de invitación: pide nombre y apellido, valida el correo (formato y duplicado) y exige área. La invitación agrega a `s.team` con `invited: true` y deja un correo simulado. Debajo, la matriz de acceso por obra (Dueño fijo / Edita / Solo lectura / Sin acceso), que se guarda en `s.ui.plataforma.roles`.
- **Comentarios:** bandeja de todas las obras, con filtro Abiertos/Resueltos/Todos. Se puede responder (`L.addComment` + `replyTo`), marcar resuelto (`resolved`, `resolvedBy`, `resolvedAt`) y reabrir.
- **Aprobaciones:** decidís como Daniel · Dirección (etiquetado como demo). Hay pendientes y decididas. Rechazar exige una nota. Se confirma y se ejecuta `L.decideApproval`. Si no hay pendientes, «Simular un pedido de aprobación» crea uno sobre SC-0141 con la adjudicación más barata; queda marcado «Pedido de ejemplo» y no emite pedidos.
- **Automatizaciones:** cada regla tiene un switch. El monto de `ADJUDICACION_SUPERA` se valida: solo enteros, mínimo ARS 100.000, máximo ARS 10.000.000.000; si el valor es inválido se mantiene el anterior. Se pueden crear reglas nuevas con disparadores cerrados (plano procesado / oferta recibida / pedido confirmado / pedido rechazado / oferta por vencer) y acciones cerradas (avisar a Ingeniería / Compras / Dirección, por correo o en la app). Se rechazan duplicados. Las reglas nuevas se guardan en `s.automations` con `custom: true`, `area` y `channel`, y se pueden borrar. «Probar regla» arma un evento de ejemplo con datos reales y deja el correo `[Prueba]` en `s.outbox`, o el aviso en la campana; el resultado se ve en línea.
- **Actividad:** `s.activity`, filtrable por obra (`L.pref`).
- **Correos:** visor de `s.outbox` con la nota «Ningún correo sale de este prototipo» y la etiqueta planificado, Sprint 5.

### d-cuenta.html · Plan, uso y cuenta (`planificado`, los dos roles)
`?tab=plan|ia|estado|perfil`. Con `?rol=prov` es la vista del distribuidor. `body data-role` queda en ENGINEER; un script inline, antes del shell, cambia `data-active` a `prov-cuenta` para que se resalte el ítem correcto de la barra lateral.
- **Plan (ingeniería):**
  - KPIs: plan, tableros del ciclo, excedente y próxima factura. El uso se calcula de los planos COMPLETED/STALE × repeticiones, con barras por obra; da 18 de 40. `billing.engineer.boardsUsed` (23) se ignora, ver Pedidos al coordinador.
  - Tres planes: Taller USD 60 / Estudio USD 150 / Planta USD 400, rotulados «Precios hipotéticos a validar», con el costo estimado según el uso actual. El cambio de plan pasa por un diálogo de confirmación y persiste en el store.
  - Medio de pago: se valida (Luhn, MM/AA no vencido, CVC) y no se envía nunca; se guardan solo los últimos 4 dígitos en `s.ui.plataforma.payment`.
  - Facturas con PDF real (`L.pdf`), marcadas como documento de demostración.
- **Plan (distribuidor):** caja de separación «Lo que le pagás a liard (suscripción y leads) ≠ el pago de los materiales…». Comisión del mes = (9 − 5) × USD 4 = **USD 16**; total USD 136. Muestra el desglose del cálculo con PDF del detalle y tres planes hipotéticos (Solo leads / Distribuidor / Sucursales).
- **Uso de IA:**
  - Total del mes = `L.aiState`, con desglose por tipo y por obra.
  - Registro con filtros por tipo y por obra (`L.pref`) y total filtrado.
  - Exportación CSV real (con `;`, decimales con coma y BOM UTF-8) que respeta los filtros.
  - Presupuesto (> 0, ≤ 10.000), aviso en % (1–100) y switch de tope duro.
  - En la vista distribuidor, un vacío explica que el consumo va incluido.
- **Estado del servicio** (#836 planificado, simulado):
  - p50 y p95 calculados de `durationS` (41 s / 66 s).
  - Cola = planos PROCESSING (y cuántos están arrancados); planos con error.
  - Cinco servicios, e incidentes de ejemplo.
  - `?estado=degradado`: detección degradada, con guía (procesar primero los chicos, recortar, seguir con BOM y cotización; el 504 no se reintenta solo).
- **Perfil:** nombre, correo y empresa validados. En ingeniería guarda en `team` y `company`; en proveedor, en `suppliers`. La baja exige escribir ELIMINAR y después solo muestra qué pasaría, sin borrar nada.

## Capacidades etiquetadas
- existe: dueño único por obra, camino manual, perfil y baja con ELIMINAR.
- planificado (Sprint 5): pagos (suscripción + lead), control de gasto de IA, correos a los dos lados, observabilidad #836.
- propuesto: asistentes, equipo y roles por obra, comentarios, aprobaciones, reglas, actividad.
- Todo lo simulado lleva `L.sim`; las respuestas de IA llevan `L.ai`.

## Variantes y tradeoffs
- Asistentes: intenciones cerradas con respuestas calculadas, en lugar de un chat libre simulado. Pierde naturalidad y gana que cada número se pueda verificar contra `L.*` y que «no sé» sea honesto. Se descartó un asistente único con router porque con cuatro especialistas se ve qué datos mira cada uno y el costo por consulta.
- Las propuestas de acción aparecen en línea y se confirman con un diálogo, en lugar de ejecutarse al responder: la IA propone y la persona confirma (regla 4). La revalidación antes de ejecutar evita pisar un cambio hecho desde otra pantalla.
- Uso del plan: se calcula de los planos procesados en lugar de mostrar el número de la semilla. Así es coherente con lo que se ve en Obras y cambia al procesar TS-B.
- Aprobaciones de ejemplo: el pedido simulado (ARS 5,8 M) queda por debajo del umbral de 30 M. Está rotulado «Pedido de ejemplo», porque ninguna adjudicación real de la demo supera el monto.

## Estados para la galería
Ojo: estos estados modifican el store de la demo, que es compartido. Los `?q=` cobran una vez por navegador (USD 0,02–0,04 en el registro de IA) y `estado=con-aprobacion` crea una aprobación de ejemplo, que queda pendiente hasta «Reiniciar demo».

- `d-asistentes.html?p=p1&a=revision&q=rev-bloqueos`
- `d-asistentes.html?p=p1&a=estimacion&q=est-margen`
- `d-asistentes.html?p=p2&a=compras&q=com-barata`
- `d-asistentes.html?p=p2&a=catalogo&q=cat-alternativas`
- `d-asistentes.html?estado=limite` · `d-asistentes.html?estado=ia-no-disponible`
- `d-automatizaciones.html?tab=equipo|comentarios|reglas|actividad|correos`
- `d-automatizaciones.html?tab=aprobaciones&estado=con-aprobacion`
- `d-cuenta.html?tab=plan|ia|estado|perfil` · `d-cuenta.html?tab=estado&estado=degradado`
- `d-cuenta.html?rol=prov` · `d-cuenta.html?rol=prov&tab=perfil`

## Prueba
`node tools/tests/plataforma.test.js` → **✓ plataforma: todo bien**: 68 checks, 0 errores de consola. Capturas en `shots/tests/plataforma/` (35 PNG, 1440 y 1024). Cubre:
- los cuatro asistentes contra `L.blockers`, `L.budget(…,{validityDays:15})`, `L.allocate/allocationSummary/offerTotal` y la equivalencia;
- acciones: cancelar no cambia b9, confirmar deja Schneider; texto libre desconocido y reconocido; persistencia;
- tope agotado sin cobro; ia-no-disponible; recordatorio que genera correo;
- invitación (vacío, correo inválido, duplicado, alta en `s.team` y correo); acceso por obra; comentario (responder y resolver);
- aprobación (el rechazo exige nota; aprobar deja APROBADA); umbral (texto, mínimo, guardado); toggle; nueva regla y «Probar regla» con correo en el outbox; filtro de actividad; teclado en pestañas;
- cambio de plan (cancelar y confirmar) que persiste tras recargar; medio de pago; PDF de factura (`%PDF…%%EOF`, F-0008, 157,50);
- total de IA = `L.aiState`; filtro y CSV (encabezado, filas y decimales); presupuesto 0 rechazado y guardado; p50; estado degradado;
- perfil; baja con ELIMINAR que no borra;
- proveedor: comisión USD 16, texto de separación, shell de distribuidor y PDF de detalle USD 136.

Revisé las capturas principales: las pestañas de los tres archivos y los estados límite, no-disponible, degradado y baja. Corregí nombres cortados en la tabla de miembros, toasts que tapaban contenido en las capturas y plurales. No revisé por `file://` con el arnés; el smoke inicial de asistentes sí corrió por `file://` sin errores.

## Supuestos
- El ciclo de facturación son los 30 días previos a `cycleEnds`. Los planos sin `processedAt` (p2, p3) se cuentan dentro del ciclo.
- Precios de los planes: rangos de `research/05-mercado.md` §3.3 (USD 60/150/400 con cupo y excedente; distribuidor USD 100–300 o USD 2–10 por lead). La disposición a pagar nunca se preguntó.
- El costo de cada respuesta de un asistente es fijo por intención (USD 0,01–0,04), dentro del rango del brief.
- Qué hace el backend real al dar de baja una cuenta no se verificó. La pantalla lo dice así y no afirma que la baja sea blanda.
- Los incidentes del estado del servicio son ejemplos (rotulados). El de «622 s → 26 s» sale de research/04.

## Pedidos al coordinador
1. **`billing.engineer.boardsUsed: 23` no coincide con los planos procesados** (18 = TGBT 1 + TS-PB 1 + TS-P tipo 4 + TDE 1 + p2 7 + p3 4). La pantalla calcula el uso. Sugerencia: borrar el campo o agregar `L.boardsBilled(fromDate) → number` en app.js para que Inicio y otras pantallas usen el mismo número.
2. **`L.aiSpend` no avisa al cruzar `alertAtPct`.** Firma sugerida: dentro de `L.aiSpend`, si el gasto pasa el umbral, `notify(s, {role:'ENGINEER', title:'Usaste el N % de la IA del mes', href:'d-cuenta.html?tab=ia'})` una sola vez por mes.
3. **Automatizaciones creadas por usuarios no se disparan en los eventos reales.** `automation(s, when)` solo mira `when` y el `then` fijo del seed. Pedido: que `submitOffer`, `respondOrder` y `tick` recorran `s.automations.filter(a => a.custom && a.enabled && a.when === EVENTO)` y avisen a `s.team.filter(m => m.area === a.area)` por `a.channel` (`'mail'` → `mail()`, `'app'` → `notify()`). Eventos: `PLANO_PROCESADO`, `OFERTA_RECIBIDA`, `PEDIDO_CONFIRMADO`, `PEDIDO_RECHAZADO`; `OFERTA_POR_VENCER` necesitaría un chequeo diario en `tick`. Hoy «Probar regla» simula el correo pero la regla no corre sola.
4. **`L.addComment` no tiene `replyTo`.** Uso `L.addComment` y después seteo `replyTo` con un `update`. Firma sugerida: `L.addComment(entity, pid, text, { replyTo })`.
5. **Bug menor, `L.decideApproval`:** el log siempre dice `'u-daniel'` y no guarda `decidedBy`. Si se agregan más personas de Dirección (por ejemplo, invitadas), queda mal atribuido.
6. **Bug menor, `L.award`:** cuando la regla `ADJUDICACION_SUPERA` está apagada no pide aprobación, y eso es correcto. Pero `existing` compara el total con una tolerancia `< 1`, así que si cambia el umbral después de aprobar sigue valiendo. Solo lo anoto.

## Marcos para la galería
```
d|d-asistentes.html?p=p1&a=revision&q=rev-bloqueos|Asistente de Revisión|Qué bloquea la Clínica: cita L.blockers y propone marcas que confirmás
d|d-asistentes.html?p=p1&a=estimacion&q=est-margen|Asistente de Estimación|Margen si la validez es 15 días, con inflación y fuentes
d|d-asistentes.html?p=p2&a=compras&q=com-barata|Asistente de Compras|La oferta más barata en SC-0141 por línea y por oferta completa
d|d-asistentes.html?p=p2&a=catalogo&q=cat-alternativas|Asistente de Catálogo|Alternativa Chint comparada por atributos esenciales; aprobarla es tuyo
d|d-asistentes.html?estado=limite|Asistentes · tope de IA|Pausa al llegar al presupuesto, con caminos manuales
d|d-asistentes.html?estado=ia-no-disponible|Asistentes · IA caída|Servicio no disponible: no se pierde nada ni se cobra
d|d-automatizaciones.html?tab=equipo|Equipo|Invitar y acceso por obra (hoy: un solo dueño por obra)
d|d-automatizaciones.html?tab=comentarios|Comentarios|Bandeja de todas las obras: responder y resolver
d|d-automatizaciones.html?tab=aprobaciones&estado=con-aprobacion|Aprobaciones|Dirección aprueba o rechaza adjudicaciones sobre el monto
d|d-automatizaciones.html?tab=reglas|Automatizaciones|Reglas cerradas, monto editable, crear y probar una regla
d|d-automatizaciones.html?tab=actividad|Actividad|Qué pasó en cada obra, filtrable
d|d-automatizaciones.html?tab=correos|Correos simulados|Ningún correo sale del prototipo: esto se enviaría
d|d-cuenta.html?tab=plan|Plan y facturación|Cupo de tableros calculado, planes hipotéticos, factura PDF
d|d-cuenta.html?rol=prov|Plan del distribuidor|Comisión por lead del mes ≠ pago de materiales
d|d-cuenta.html?tab=ia|Uso de IA|Registro, por obra, tope y aviso, CSV
d|d-cuenta.html?tab=estado&estado=degradado|Estado del servicio|p50/p95 de los planos, cola y detección degradada con guía
d|d-cuenta.html?tab=perfil|Perfil|Datos validados; la baja con ELIMINAR solo muestra qué pasaría
```
