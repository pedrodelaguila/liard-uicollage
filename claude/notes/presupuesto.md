# presupuesto · Presupuesto y margen (`d-presupuesto.html`) · propuesto

El tablerista convierte el costo de materiales en el precio de venta para su cliente final.

## URLs

| Estado | URL |
| --- | --- |
| Calculadora (p1, solo referencia + 1 línea sin precio) | `d-presupuesto.html?p=p1&v=calculadora` |
| Comparador de escenarios | `d-presupuesto.html?p=p1&v=comparador` |
| Guiado (4 pasos; `&paso=1..4`) | `d-presupuesto.html?p=p1&v=guiado` · `d-presupuesto.html?p=p3&v=guiado&paso=3` |
| p2 · ofertas confirmadas (SC-0141) | `d-presupuesto.html?p=p2` |
| p3 · todo con pedidos confirmados | `d-presupuesto.html?p=p3` |
| p4 · obra vacía (explica el flujo) | `d-presupuesto.html?p=p4` |
| Sin precios (forzado) | `d-presupuesto.html?p=p1&estado=sin-precios` |
| En USD | `d-presupuesto.html?p=p1&moneda=USD` |

## Qué hace

- **Procedencia por línea**, con la prioridad de `L.materialCost`: pedido emitido › oferta confirmada vigente › precio de
  referencia › sin precio. Una barra apilada (con leyenda y tabla, y rayado para la referencia, así no depende solo del color)
  muestra cuánto del costo está confirmado.
- **Aviso cuando más del 40 %** del costo de materiales es solo referencia. **El PDF se bloquea** si alguna línea no tiene
  precio, hasta que el usuario le cargue un precio unitario manual (`s.ui.manualPrices[pid][lineId]`, en ARS, lo usa solo esta
  página). Esas líneas figuran como «precio manual», con su propio color.
- Parámetros validados: margen ≥ 100 % o negativo, horas negativas, costo hora ≤ 0, validez de 1 a 90 días enteros, y los
  porcentajes con rango. Con un error, el cálculo se queda en los últimos valores válidos y no se puede guardar.
  `Guardar parámetros` llama a `L.saveBudget`.
- Una cascada del costo al precio, con el riesgo de deriva, el precio mínimo para no perder y la ganancia después de la
  deriva. Un gráfico de margen real contra días de validez, con su tabla. La inflación mensual está marcada «supuesto».
- **Comparador**: de 2 a 4 columnas (Base, Cobertura, Competitivo y los escenarios del usuario, guardados en
  `s.ui.budgetScenarios[pid]`). Lo que difiere de la primera columna se marca con ≠ y su delta. «Elegir para enviar» guarda
  esos parámetros y lo registra en `s.ui.budgetSend[pid]`.
- **Guiado**: costos confirmados → mano de obra → riesgo → margen, con explicaciones (margen contra markup, deriva, cobertura)
  y un resumen que se va completando.
- **ARS/USD** con `billing.fx.usdArs`, rotulado «cotización simulada».
- **PDF para el cliente** (`L.pdf`): cliente, obra, validez, resumen por tablero (× repeticiones), materiales agrupados por
  familia, accesorios, mano de obra, total y condiciones («Precios sujetos a variación después de la validez»). Todos los
  importes están a precio de venta: el costo se escala proporcionalmente y se ajusta el redondeo para que las filas sumen
  el total. No lleva distribuidores ni precios de compra.
- **XLSX interno** (`L.xlsx`), con cinco hojas: Resumen con fórmulas, Materiales (procedencia, distribuidor, referencia,
  vigencia), Tableros, Parámetros y Sensibilidad.
- **En vivo**: con `L.store.subscribe`, cuando se adjudica en otra pantalla las líneas pasan de oferta a pedido, la barra se
  actualiza y sale el toast «Costos actualizados». Un borrador sin guardar se conserva.

## Pruebas

`node tools/tests/presupuesto.test.js`: **todo bien, 0 errores de consola**. Cubre:

- que materiales, mano de obra, accesorios, cobertura, contingencia, costo total, margen, precio, ganancia después de la
  deriva y riesgo de deriva coincidan con `L.budget('p1')`, y que el precio renderizado sea igual a `L.ars(price)`;
- las dos validaciones y la recuperación, el recálculo en vivo y la persistencia tras recargar;
- USD, y el PDF bloqueado, luego habilitado con un precio manual;
- el PDF (`%PDF`, obra y cliente, condiciones, familias, «× 4», **sin** Electro Delta / Norte Materiales / Sur Eléctrica) y
  que el XLSX sea un zip válido con sus hojas;
- guardar, comparar, elegir y quitar escenarios, y los pasos del guiado (también con teclado);
- la adjudicación de SC-0141 (`L.allocate` + `L.award`) en p2, donde la oferta pasa a pedido en vivo y el precio sigue igual a
  `L.budget('p2')`;
- los estados p1, p2, p3, p4 y sin-precios a 1440 y 1024, sin desborde horizontal.

Capturas en `shots/tests/presupuesto/`, revisadas: calculadora, comparador y guiado a 1440 y 1024, p2, p3 y p4.

No verificado: móvil (no hay `m-` para esta área) y `file://` (se probó solo por http).

## Pedidos al coordinador

1. **`L.materialCost(pid, manualPrices?)`**: que acepte precios manuales para las líneas `sinPrecio` y los devuelva con
   `source: 'manual'` y `bySource.manual`. Hoy la página los agrega por su cuenta, con la misma prioridad y replicando
   la fórmula de `L.budget` en un `calc()` local. Si `L.budget` los aceptara, esa réplica desaparece.
2. **`bySource.sinPrecio` cuenta líneas, pero los otros campos suman ARS.** Mezclar unidades confunde. Propuesta:
   `bySource.sinPrecio = 0` más un `missing: n` aparte.
3. `L.materialCost` usa solo `L.requestsOf(pid)[0]`. Si una obra tiene más de una solicitud abierta, se ignoran las
   ofertas de las demás.
4. `L.materialCost` usa el `unitPrice` de pedidos en estado `SENT` (no confirmados) igual que los `CONFIRMED`. Tal vez
   convenga distinguirlos («pedido emitido» contra «pedido confirmado»).
