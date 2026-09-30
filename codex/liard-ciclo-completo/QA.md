# LIARD · QA del prototipo v1

30 septiembre 2026. Chrome headless local, HTTP 127.0.0.1:8081 y file://. Repositorio en dev 82300d56 sin cambios; los dos directorios untracked preexistentes permanecen. Esta verificación corresponde a mocks; no prueba producción ni cierra sprints.

| Verificación | Resultado | Evidencia |
| --- | --- | --- |
| Cobertura | 29 secciones, 30 HTML de pantalla, 93 frames, nueve líneas de S5 | coverage.json y SCREENS.md |
| Integración final | 112 estados distintos; 15 comprobaciones; cero errores JS/enlaces rotos/overflow/imágenes ausentes/texto undefined o NaN; estado explícito en todas las pantallas | qa-final.json |
| Galería y comercial | 55/55 comprobaciones, ocho pantallas a 390 px y navegación file:// | qa-coordinator.json |
| Ingeniería | 32 estados por protocolo; siete layouts a 390 px; atributos, DWG, reglas, selección/giro/separación 3D, conflicto y recálculo de polos | qa-engineering.json |
| Plataforma S5 | 58 cargas, 26 interacciones y seis layouts a 390 px, todas correctas | qa-platform.json |
| Operación | 54 cargas y ocho recorridos de estado/persistencia/reset, sin errores | qa-operations.json |
| Capturas | 32 PNG: portada, 29 secciones completas y dos pantallas nativas. Revisadas visualmente; 93 iframes sin contenido vacío, overflow o imágenes rotas | shots/v1 y qa-screenshots.json |
| Sintaxis | node --check en todos los JS; JSON válido; sh -n y compilación Python de shoot | archivos entregados |
| Regeneración CLI | Smoke test de shoot.py: portada, medición y sección 3D, dos pantallas nativas; PNG válidos y procesos cerrados | shoot.sh / shoot.py |

Recorridos comprobados: costo→margen→aprobación→propuesta; alternativa 6/10 kA→comparación→aprobación→solicitud recibida; proveedor→aceptar/rechazar→contacto; importación→advertencia/revisión→confirmar. Margen 30% recalcula venta, 6 kA conserva costo y 10 kA ilustra USD 72 = 36 × 2; invalidar aprobación conserva base. Modal permite cancelar, reabrir y Escape. Se probaron filtros combinados, búsqueda por rol/acento, vacío, altura completa y reset.

En taller/campo se verificaron liberación, reserva única, evidencia, recepción 34 aceptadas + 1 dañada + 1 faltante, FAT/SAT, entrega, visita y borrador de repuesto. Plataforma cubre pago rechazado/reintento, reserva/límite IA, email fallido, recuperación operativa, consentimiento/dataset/reversión y manual como alternativa.

Correcciones de QA: opciones HTML mal cerradas; CTA móvil que invadía navegación; reserva IA fraccional y reversión de dataset; select técnico que no propagaba valores; cálculo sin ahorro ficticio; búsqueda Unicode y cobertura de roles/captions; control de archivo en español; etiquetas de barras, azul nativo, acción de proveedor y enlace duplicado en sidebar.

Accesibilidad básica: etiquetas y foco visible, íconos SVG, selección con controles/tabla, Escape en modal y movimiento reducido. No se realizó auditoría WCAG completa ni pruebas con lector de pantalla, Safari, Firefox o dispositivos físicos.

Límites: estado local y datos ficticios; algunos estados finales se ilustran por query params y no constituyen una aprobación. No existe conversión DWG, motor IA, sincronización offline, pagos, emails, ERP o almacenamiento remoto en este prototipo. 3D conceptual, sin validación física/eléctrica. En file:// localStorage puede aislar documentos: HTTP es la opción para probar continuidad entre pantallas. No se corrieron los gates del producto porque no se modificó su código; están especificados en PLAN-PRODUCCION.md para implementación real. Supuestos completos en ASSUMPTIONS.md.
