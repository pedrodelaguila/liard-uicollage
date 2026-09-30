# Material de apoyo revisado por coordinación
Fecha: 30/09/2026. Repositorio de solo lectura en dev `04fc813941ec3ae3b0121f12c173ea4a64cd7219`.

Se abrieron completos los informes ORB, SIFT, límites SIFT, investigación LLM partes I y II, autoscaling/slicing, multi vs single class, resultados YOLO, BOM de ejemplo y README PDF (887 líneas; lectura suplementaria por intervalos para evitar truncamiento). Se extrajeron y leyeron las 44 páginas de los tres PDF en docs/, y se inspeccionaron los renders de todas las páginas y las 54 imágenes de apoyo en hojas de contacto. Los JSON de detecciones son ejemplos históricos, no contratos vigentes. Los scripts en evidencia son reproducción histórica: no se ejecutaron porque incluyen inferencia paga y datos de clientes ausentes.

## Reconciliación
- Un “100% eficacia” en conteo de un tablero simple no equivale a precisión de especificación comprable, validación estadística ni SLA. El informe Gemini (18/09) mide ~50% precisión funcional selectiva en conjuntos pequeños y diferentes; no extrapolar a Claude ni a dev.
- PDF README mezcla experimentos históricos y actualización: la cabecera describe el pipeline implementado; −2,4% respecto de YOLO sobre DXF en 12 pares no incluye validación independiente de clasificación ni garantía de que el PDF contenga todo el modelo CAD. Preservar originales y revisar.
- SIFT/ORB fracasaron en geometrías simples repetidas; no reintroducirlos como automatización confiable. Los valores 64px de documento antiguo no sustituyen la escala actual medida en README/código.
- QElectroTech es referencia visual, nunca entrenamiento. No se copiaron símbolos ni planos de clientes al prototipo: se dibuja un modelo ficticio propio.
- 3D reconstruido de un unifilar no puede validar dimensiones, disipación, coordinación o certificación. Se etiqueta conceptual.

## Acceso y límites
Se intentó abrir la planilla enlazada de tokens (Google Sheets), resultado BOM TSOA/E (Drive), documentación Autodesk enlazada en visión y licencia QElectroTech mediante navegador de investigación: los cuatro retornaron inaccesible. No se asume su contenido. Los archivos privados del corpus PDF y Excel de verdad no están versionados; no se consultaron datos productivos ni se repitieron llamadas pagas. `docs/refactor/01-refactor-changes.md`, citado por AGENTS, no figura en el árbol disponible. No se auditó infraestructura real ni despliegue.
