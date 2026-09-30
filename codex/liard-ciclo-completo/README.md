# LIARD · galería de producto v1

Abrir index.html directamente, o ejecutar `python3 -m http.server 8081 --bind 127.0.0.1` en esta carpeta y visitar http://127.0.0.1:8081. No necesita instalación, cuenta ni conexión; fuentes y marca están empaquetadas localmente.

29 flujos · 30 documentos de pantalla · 93 frames de decisiones. Roles: ingeniería, compras, proveedor, dirección, taller, obra, mantenimiento y operación. Estado: Existe/Planificado/Propuesto, independiente del horizonte. Sprint 5: los nueve puntos del Roadmap cubiertos por nueve secciones, no completados por este mock.

En la galería: filtrar por horizonte/rol, buscar, navegar por pills y abrir cada pantalla a tamaño completo. Clicks y formularios modifican el estado local. «Reiniciar demo» elimina solo estado de la demo. Contenido completo permite ver pantallas largas. Query params: `?s=tablero-3d` una sección; `?bare=1` sin cabecera; `?full=1` frames completos; `?measure=1` altura en título.

Recorridos recomendados: ingeniería→cobertura→alternativa→compras→proveedor; costo→aprobación→oportunidad; recepción→reserva→fabricación→móvil de taller→FAT→obra→SAT→activo→visita; presupuesto IA→límite→reserva; reglas→simulación→aprobación→registro; dataset→consentimiento→anotación→medición→versión/reversión.

Capturas: `shots/v1/0-galeria.png`, una por sección y dos pantallas a tamaño nativo. `shoot.sh v2` regenera con Chrome headless local. `coverage.json` enumera cada frame y dependencia. `QA.md`, `PLAN-PRODUCCION.md` y `ASSUMPTIONS.md` contienen gates, decisiones y límites; `research/` conserva investigación y issues.

No se editó el repositorio de LIARD. Ninguna acción de la demo manda mensajes, procesa IA paga, realiza pagos ni cambia sistemas reales. La galería no cierra tickets/sprints. No fue publicada externamente.
