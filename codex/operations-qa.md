# QA de operaciones · prototipo local

Fecha de ejecución: 30 de septiembre de 2026. Alcance: los cuatro recorridos de operaciones en variantes `guided`, `expert`, `assisted` y `visual`. No se evaluó producción ni se conectaron proveedores, ERP o IA reales.

## Resultado observado

Los recorridos de interacción pasaron en **las cuatro variantes tanto por file:// como por http://127.0.0.1:8766** en un Chrome aislado. La verificación adicional con el Playwright incluido generó 16 capturas, comprobó 24 resultados y registró **cero errores de JavaScript**. Se inspeccionaron visualmente las 16 capturas y se volvieron a inspeccionar las cuatro móviles después de corregir el mapa y el estado traducido.

Datos crudos y capturas: [qa-results.json](shots/operations-agent/qa-results.json), [capturas](shots/operations-agent/). El coordinador ejecuta además QA de integración con los recorridos de ingeniería y comercio.

| Área | Comprobaciones ejecutadas | Resultado |
| --- | --- | --- |
| Costos y escenarios | Nombre vacío impide guardar; creación, comparación y aplicación; multiplicador nuevo cambia cantidades y vuelve a exigir aprobación técnica; margen sobre venta. | Pasó en cuatro variantes. |
| Fórmula económica | Escenario 4 tableros, USD 100 mano de obra, USD 20 gastos, 10 % contingencia, venta USD 7.000. | Costo USD 5.632,88; contribución USD 1.367,12; margen 19,5 %. Usa `L.costs`, incluidos fletes cuando hay oferta. |
| Asistencia | Reserva de USD 3,00 antes de ejecución; gasto acumulado 420 → 720 centavos; reserva vuelve a cero; sugerencia persiste al recargar; checkbox y aprobación humana registran nota. | Pasó en cuatro variantes. |
| Límite y recuperación | Presupuesto agotado rechaza ejecución sin gastar; fallback manual navega a ingeniería; reserva interrumpida al recargar se puede liberar sin consumo. | Pasó. |
| Reinicio con IA pendiente | Restablecer seed durante una reserva cancela el resultado pendiente; el timer no vuelve a gastar después de reset. | 420 centavos gastados y cero reservados, como seed. |
| Colaboración | Nota privada; regla con consentimiento, origen y justificación; aplicación agrega línea inferida sin aprobación; automatización opt-in crea tarea ante evento simulado. | Pasó en cuatro variantes. |
| Directorio y consulta | Selección de proveedor; zona/fecha/necesidad y consentimiento; consulta local creada y aceptación simulada. | Pasó en cuatro variantes. |
| Conector | Inspección, preview de filas, confirmación persistente y snapshot. | Pasó en cuatro variantes. |
| Recepción | Una unidad recibida de tres genera estado parcial; instalación bloqueada mientras falten; completar pendientes genera recepción completa. | Pasó en cuatro variantes. |
| Montaje, entrega y servicio | Checklist humano; entrega bloqueada hasta recepción y montaje; serie obligatoria; entrega crea activo y archivo; solicitud consentida y cierre local persistente. | Pasó en cuatro variantes. |
| Descarga verificada | Se interceptó y leyó el archivo `presupuesto-demo.json`. | JSON válido, `demo: true`, costo seed 651.063 centavos. |
| Estados | Vacío, carga que finaliza, error recuperable y límite con vía manual. | Recuperación vuelve a los formularios conservando estado. |
| Responsive | Desktop 1440 × 994, campo 390 × 844, 16 combinaciones de página y variante. | Sin desborde horizontal del documento. Mapa móvil muestra sus cuatro nodos en cuadrícula. |

## Correcciones realizadas a partir de evidencia

- `name="dataset"` en el formulario del conector ocultaba la propiedad nativa `form.dataset`; se cambió la lectura del identificador a `getAttribute('data-form')`. Antes no se creaba preview; luego pasó el recorrido completo.
- Las tres métricas del panel angosto desbordaban por ancho mínimo de contenido. Se ajustaron columnas con `minmax(0,1fr)` y tipografía según el ancho del contenedor; las capturas posteriores muestran valores completos.
- Se retiró el encabezado compartido duplicado en estas cuatro páginas; cada vista conserva un único título principal del dominio.
- La sugerencia IA originalmente vivía solo en memoria de página; ahora queda en el proyecto y reaparece tras reload.
- Se agregó una reserva identificada: reset cancela trabajos pendientes y una reserva interrumpida puede liberarse. No quedan cargos ficticios invisibles después del reinicio.
- El mapa visual móvil ya no corta los nodos tercero y cuarto: usa dos columnas.
- El estado de pedido se presenta en español; los nombres internos siguen el contrato en inglés.
- La navegación propia de campo muestra recepción/entrega y panel conceptual; no ofrece costos ni reglas privadas como accesos del equipo en obra.

## Límites de esta evidencia

El pedido usado por la prueba de campo se creó como **fixture de QA** en el store local para aislar recepción/montaje/entrega/servicio. Esta prueba no demuestra que el recorrido comercial anterior haya funcionado: esa integración corresponde al coordinador. La prueba descargó y validó contenido del presupuesto JSON; la descarga de entrega se disparó en el recorrido, pero aquí no se afirma una lectura automatizada de todos sus contenidos ni de todos los CSV. La inspección de etiquetas, controles nativos, foco y layout no es una certificación completa WCAG ni una prueba con lector de pantalla.

Todas las funciones de IA, comunicación, verificación de identidad, aceptación de consulta, integración ERP y operación física son simulaciones explícitas. El almacenamiento del navegador facilita demostrar continuidad, pero no representa aislamiento de empresas, seguridad o confiabilidad de producción. Las reglas y variantes del prototipo no completan un sprint productivo.
