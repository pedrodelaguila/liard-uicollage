# Área «obras» · notas

## Pantallas y estados por URL

| URL | Qué muestra | Capacidad |
| --- | --- | --- |
| `d-inicio.html` | Centro de mando: KPIs, obras por etapa (`L.projectStage`), lo que te toca, aprobaciones, IA del mes, actividad. Vista alternativa en tabla | propuesto |
| `d-obras.html` | Obras en tarjetas o lista, búsqueda, filtro por etapa, orden, nueva obra, eliminar | existe (rediseñada) |
| `d-obras.html?dialogo=nueva` · `?estado=vacio` · `?estado=cargando` · `?estado=error` | Diálogo de alta, vacío, esqueleto, error | |
| `d-obra.html?p=p1&v=guiado` | Flujo en 5 pasos: tabla de referencia, subir, procesar, revisar, cotizar | existe |
| `d-obra.html?p=p1&v=experto` | Tabla de planos (ordenable, selección múltiple) con la cola de procesamiento al costado | existe |
| `d-obra.html?p=p4` | Obra vacía | |
| `d-obra.html?p=p1&dialogo=recortar` · `…&dialogo=repeticiones&plan=pl-tstipo` · `…&dialogo=comentarios&plan=pl-tstipo` · `…&dialogo=renombrar&plan=pl-tsb` · `?estado=cargando` | Diálogos y esqueleto | |
| `m-inicio.html` | Obras y lo que te toca, en el celular | propuesto |
| `m-obra.html?p=p1` | La obra en la obra: planos, progreso, procesar, bloqueos | propuesto |
| `m-avisos.html` · `m-avisos.html?rol=prov` | Avisos del ingeniero o del distribuidor; marcar leído, abrir | propuesto |

## Decisiones

- Las reglas salen de `lab3-liard` (`dev`): como máximo 15 archivos y 10 PDF por subida, y los textos de error son los de la app real
  («Extensión inválida en: … Solo se permiten archivos .dxf o .pdf.», «Máximo 15 planos por subida.»,
  «Se pueden subir hasta 10 PDF por vez: quitá N.»). Repeticiones de 1 a 1000 («Tiene que ser un número entero entre 1 y 1000.»).
  Se permiten hasta 15 zonas de recorte. La tabla de referencia solo acepta DXF.
- Si la subida trae un archivo inválido, se rechaza toda la tanda (así lo hace el backend).
- Reemplazar o eliminar la tabla de referencia pasa los planos `COMPLETED` a `STALE` («Por revisar»), como
  `markAffectedPlansStale` en `project.repository.ts`. Al subir la primera tabla no cambia nada.
  Aclaración: el backend real también marca `PROCESSING`; acá no, para no romper un trabajo simulado que está en curso.
- El nombre de un plano subido es lo que viene después del último `_` en el nombre del archivo (`CSM-E-106_TS-C.dxf` queda `TS-C`).
- El costo estimado de detección es el promedio de las detecciones del mes que figuran en `s.ai.ledger`. Si lo que cuesta
  supera `L.aiCan`, no se procesa.
- «Simular falla de detección» se guarda en `L.pref('obras:falla')` y la comparten `d-obra` y `m-obra`.
- Las miniaturas y el lienzo de recorte son una **vista esquemática generada** a partir del id del plano. No leen el DXF, y la pantalla lo dice.
- Eliminar un plano marca `deleted` y saca su columna `perPlan` de las líneas. Si una línea detectada se queda sin cantidad, se
  elimina. Sus símbolos pendientes pasan a `PLANO_ELIMINADO`. No se puede eliminar una obra que ya tiene solicitudes o pedidos.

## Pedidos al coordinador

1. **`L.processPlans` registra planos que no encoló.** El log dice «Mandó a procesar N planos» con el N de
   los ids **pedidos**, no de los que se encolaron. Para reproducirlo: `L.processPlans(['pl-tgbt'])` registra «Mandó a procesar 1 plano.» aunque no encoló
   nada. Propuesta: contar los que efectivamente pasaron a `PROCESSING`, y no registrar nada si son 0.
2. **Una función de dominio para la próxima acción de una obra.** `nextAction(pid)` está copiada en `d-inicio`, `d-obras` y
   `m-inicio`. Firma propuesta: `L.nextAction(pid) → { t, d, href, ic, tone, w }` (con `w` como prioridad, 0 la más urgente).
3. **Dos funciones de dominio para los planos.** Propuestas:
   `L.uploadPlans(pid, files) → {ok, errs, plans}` (valida extensión, tope de 15, tope de 10 PDF, duplicados),
   `L.setReferenceTable(pid, file|null)` (con la regla de STALE), `L.deletePlan(id)`, `L.renamePlan(id, name)` y
   `L.setMultiplier(id, n) → {ok, err}`. Hoy las escribo en la página con `L.store.update`.
4. **`L.projectStage` no tiene en cuenta `STALE`.** Una obra con todos sus planos «Por revisar» queda «En revisión» o «Lista para cotizar». Propuesta: que
   `STALE` cuente como la etapa `revision`, con su propio texto («Planos por revisar»).

## Pruebas

`node tools/tests/obras.test.js`: 82 comprobaciones, 0 errores de consola. Capturas en `shots/tests/obras/`. Las revisé a 1440, a 1024 (sin desborde horizontal) y a 390.
El procesamiento usa la duración por defecto (9 s + 1,5 s por plano) y la prueba lo espera con `waitForFunction`.

## Variantes de `d-obra` (`L.variants`, clave `obra`)

| Variante | Para qué tarea | A favor | En contra |
| --- | --- | --- | --- |
| **Guiado** | Obra nueva o persona que entra poco; «¿qué falta para cotizar?» | Cada paso muestra su estado real (Hecho / Paso actual / Bloqueado / Opcional) y lo que lo bloquea, con un link a la solución. Las tarjetas con la miniatura del tablero se leen de un vistazo | Con más de 10 planos hay que scrollear mucho. Para procesar una selección parcial hay que hacerlo plano por plano |
| **Experto** | Obra grande, reprocesar tandas, seguir la cola | Tabla densa y ordenable con selección múltiple y «Procesar seleccionados». La cola, la tabla de referencia y los bloqueos quedan siempre a la vista | Hay menos contexto sobre qué hacer después, y hay que conocer el flujo |

## Etiquetas de capacidad

- `existe`: la lista de obras, la tabla de referencia, la subida con sus límites, procesar, cancelar lo que está en cola, los estados del plano, las repeticiones, el recorte y los bloqueos antes de cotizar.
- `propuesto`: Inicio (el centro de mando completo), los comentarios por plano, las aprobaciones, el medidor de IA, el móvil (inicio, obra y avisos) y las notificaciones.
- `L.sim('Detección simulada')`: en la zona de carga, en la cola y en el lienzo de recorte (el archivo nunca se lee).

## Supuestos

- «Cliente» y «ciudad» son opcionales al crear una obra. El pedido no decía si eran obligatorios, y la app real solo pide el nombre.
  Topes: nombre de 3 a 80 caracteres y sin repetir, cliente hasta 100, ciudad hasta 60, descripción hasta 500.
- El presupuesto de una obra nueva copia los parámetros de `budgets.p4`.
- En el celular no se suben planos (el texto lo aclara): procesar y cancelar sí se puede.
- La fecha de alta de una obra es `B.TODAY`.

## Cuadros de la galería

```
d|d-inicio.html|Inicio del ingeniero: obras por etapa, lo que te toca, aprobaciones, IA|propuesto · reacciona en vivo al store
d|d-obras.html|Obras: tarjetas con tira de planos, próximo paso y total de referencia|existe (rediseño)
d|d-obras.html?dialogo=nueva|Nueva obra con validación|existe
d|d-obras.html?estado=vacio|Obras sin obras: vacío que invita a crear|existe
d|d-obra.html?p=p1&v=guiado|Obra guiada: 5 pasos con estado y bloqueos reales|existe · variante Guiado
d|d-obra.html?p=p1&v=experto|Obra experta: tabla de planos y cola de procesamiento|existe · variante Experto
d|d-obra.html?p=p1&dialogo=recortar|Recortar tableros: zonas con mouse o teclado, hasta 15|existe · vista esquemática
d|d-obra.html?p=p1&dialogo=repeticiones&plan=pl-tstipo|Repeticiones con vista previa de la cantidad a comprar|existe
d|d-obra.html?p=p1&dialogo=comentarios&plan=pl-tstipo|Comentarios de un plano|propuesto
d|d-obra.html?p=p4|Obra vacía: subir planos o recortar|existe
m|m-inicio.html|Inicio en el celular: lo que te toca y obras|propuesto
m|m-obra.html?p=p1|La obra en el celular: planos, progreso, procesar, bloqueos|propuesto
m|m-avisos.html|Avisos del ingeniero|propuesto
m|m-avisos.html?rol=prov|Avisos del distribuidor|propuesto
```
