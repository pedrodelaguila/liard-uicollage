# Área F · Plataforma — notas

Archivos: `d-pla-inicio.html`, `d-pla-asistente.html`, `d-pla-equipo.html`, `d-pla-automatizaciones.html`, `d-pla-plan.html`,
`d-pla-estado.html`, `m-pla-inicio.html`, `m-pla-avisos.html`, `m-pla-asistente.html`, `sections/f-plataforma.js`,
`pla.css`, `pla.js` (cálculos + motor del asistente, `window.PLA`), `data-pla.js` (`window.BP`).

## Pantallas y estados

| Pantalla | Variantes / estados |
| --- | --- |
| `d-pla-inicio` (h1) | `?vista=ingenieria\|compras\|direccion` (mismos datos, otro usuario y orden) · `?estado=vacio` (primeros pasos) · `?estado=cargando`. Obras por etapa con alternativa Tabla; margen con alternativa Tabla. |
| `d-pla-asistente` (h1) | `?modo=revision\|presupuesto\|compras` · `?q=` (⌘K; enruta el modo por palabras) · `?estado=limite` · `?estado=sin-ia`. También entra solo en modo límite si el consumo real del estado llega al tope. |
| `d-pla-equipo` (h1) | `?vista=equipo\|aprobaciones\|actividad` · `?linea=l09` abre el hilo de esa línea. |
| `d-pla-automatizaciones` (h2) | `?vista=reglas\|historial` · `?estado=vacio` · `?estado=error` (email rebotado; también en historial). |
| `d-pla-plan` (s5) | `?vista=consumo\|plan` · `?estado=limite`. |
| `d-pla-estado` (s5) | `?estado=error` (lectura IA caída) · `?vista=operador`. |
| `m-pla-inicio` | aprobar desde una hoja inferior. |
| `m-pla-avisos` | `?rol=obra\|prov` cambia `data-role`/`data-tabs` antes de que arme el shell, y filtra los avisos. Obra ve todo aviso con `rol: 'obra'`, con `href` a `d-tal-*`/`m-tal-*`, o que hable de taller, remito, recepción, entrega o protocolo (pedido del área E). Distribuidor: `rol: 'prov'` o `href` a `d-prov-*`/`m-prov-*`. |
| `m-pla-asistente` | dictado simulado · `?estado=sin-ia\|limite`. |

Galería: 7 secciones (600–660), 22 marcos. Entre todas hay vacío, cargando, error y límite.

## Decisiones de diseño

- **Un solo cálculo para los números que se repiten.** `PLA.presupuesto()` (venta del proyecto p1 − materiales al mejor
  precio − 3 líneas sin cotizar a precio de referencia − mano de obra) da 21,7 %; lo usan el Inicio de dirección, el asistente
  y el teléfono. `PLA.llegaAntes(fecha, excluir)` arma el escenario de compras desde `B.ofertas` (plazo + stock suficiente).
  Con −5 % el margen queda en 17,6 % → choca con la regla de 18 % y el asistente propone pedir aprobación o bajar solo hasta
  $ 68.554.000 (−4,5 %).
- **El asistente nunca escribe claves de otras áreas.** Sus acciones dejan rastro en lo propio (`x.pla.hilos`,
  `x.pla.aprobaciones`, `x.pla.reglas`, `x.pla.propuestas`, `x.pla.ejecuciones`) y en `avisos`. Confirmar ejecuta; cancelar
  escribe «no se hizo nada» y no cobra. Una pregunta repetida sale de `x.pla.cache` y no se cobra (mismo principio que
  BomLineReading).
- **Cobro real contra el tope.** Cada consulta suma a `consumoIA.usadoUsd`, al área «Asistente» y a la persona; al cruzar el
  80 % se publica un aviso. Si no alcanza el saldo no se envía nada y la pantalla pasa a modo manual.
- **Sin IA queda lo que no es IA.** El modo manual muestra «qué falta» calculado desde el estado (es una consulta, no un
  modelo) y atajos a BOM, planos, escenarios, presupuesto, ofertas y estado.
- **Streaming simulado** de a dos palabras con cursor y botón «Mostrar todo»; el resto de la respuesta entra con un
  escalonado de 140 ms (`--ease-out-expo`). Con `prefers-reduced-motion` (y en la carga inicial) sale todo de una.
- **Gráficos**: barras horizontales finas con valor en texto al lado, leyenda, y siempre un selector a tabla. El color sigue
  al dato (azul = real, ámbar = 3 puntos o más debajo de lo presupuestado), nunca solo: también va el número.
- Los marcos que mutan estado usan los `x.pla.*`: ver una pantalla dentro de la galería (marco=1) no cambia la demo.

## Supuestos (lo que inventé donde la doc no decide)

- Etapa del ciclo de cada obra, mano de obra del Hospital ($ 15.400.000), márgenes reales de p2/p3, carga del taller
  (132 h/semana, 3 armadores), conversión 9 de 64 (el sector dice 10–15 %, GRAMONT).
- Perfiles dentro de la empresa (dirección, ingeniería, presupuesto, compras, taller, obra) y su matriz de permisos.
- Reglas de aprobación con los montos del brief; la regla de marca protocolizada (IEC 61439) viene apagada.
- Planes Inicial US$ 150 / Profesional US$ 390 / Empresa, IA incluida y facturas: **hipótesis sin validar**, rotuladas.
  Topes por persona (60/30/15/15) que suman el de la empresa (US$ 120).
- p50/p95 por servicio y por tamaño de plano, disponibilidad 99,2 % e incidentes. Los límites (504 no se reintenta, 503 sí,
  3 intentos, 5 min, 2 a la vez, lease 10 min) salen del código de dev.
- Contenido de los hilos de comentarios y de las ejecuciones de reglas; avisos propios de obra y distribuidor en el teléfono.
- OC-2026-034-1 (Data center Pilar, $ 14.250.000) como aprobación pendiente: no está en `B.pedidos`, vive solo en `x.pla`.

## Qué existe en dev y qué es nuevo

Existe: roles ENGINEER/SUPPLIER, estados de plano y de OC, cola de procesamiento con reintentos y sus límites, lectura IA por
línea con caché, costo de lectura IA del catálogo, barra tricolor, BOM/ofertas/planos que usa el asistente.
Nuevo: Inicio por rol y dirección, asistente, perfiles/permisos/aprobaciones/comentarios, automatizaciones, vistas de teléfono.
Sprint 5: plan y facturación, control de gasto de IA, email, observabilidad visible.

## Pedidos al coordinador

1. `B.navCounts` (Pedidos 2, Taller 1) aparece también en `d-pla-inicio.html?estado=vacio` (empresa nueva). Si se quiere
   coherente, que `app.js` lea los contadores del estado o deje que la pantalla los apague.
2. `app.js` `TABS` usa los ids `m-inicio`, `m-avisos`, `m-asistente`; mis pantallas los respetan. El badge de avisos del
   teléfono (`B.avisosSinLeer`) es fijo: no baja cuando se marcan leídos (leo y escribo `x.pla.leidos`).
3. La píldora de horizonte (`.hz`, fija abajo a la izquierda) tapa contenido en algunas capturas; en teléfono subí la barra
   del asistente a 104 px para no quedar debajo.
4. Sería útil una clase compartida para «número que no se corta» en tablas (`.tbl td.mono` hoy parte «300 s»); lo resolví
   con `white-space: nowrap` en línea.
5. Enlaces a pantallas de otras áreas que asumo: `d-bom-editor.html?linea=…` y `?filtro=bloquea`,
   `d-com-cotizacion.html?linea=…`, `d-com-escenarios.html`, `d-com-presupuesto.html`, `d-com-recotizar.html`,
   `d-ing-plano.html?plano=…`, `d-tal-taller.html`, `m-tal-tablero.html`, `m-tal-recibir.html`, `m-com-aprobar.html`,
   `m-prov-*`, `d-prov-integraciones.html`.

## Qué verifiqué y qué no

Verificado:
- `node tools/qa.mjs` sobre las 9 pantallas y 24 estados/variantes: 33/33 limpias. Miré los PNG de todas las pantallas
  principales y corregí cortes (cabecera del margen, insignias de etapa, celdas mono, tabla del asistente en teléfono, la
  barra del dictado debajo de la píldora).
- Recorrido con Playwright (fuera de la galería, con localStorage): cancelar una acción del asistente no cambia nada;
  confirmar crea el hilo en l11 y un aviso; recargar no vuelve a cobrar; «pedir aprobación» aparece en Equipo › Aprobaciones
  con la marca «preparado con IA»; comentar con @sofia publica un aviso; el Inicio de dirección lo muestra y aprobar baja
  de 3 a 2 pendientes; probar una regla genera el email con OC-2026-031-1; pausar y crear reglas; bajar el tope a US$ 80 pone
  el asistente en modo límite; el teléfono muestra el aviso del cambio de tope. Streaming y dictado simulado andan. Sin
  errores de consola.

No verificado:
- Con avisos reales de E en el estado (probé con uno sembrado a mano, ver arriba). Que los enlaces a pantallas de otras áreas existan (dependen de A–E) ni que esas áreas lean mis `avisos`.
- La galería armada (`index.html`) con mi sección: solo validé que `sections/f-plataforma.js` carga y da 7 secciones / 22 marcos.
- `prefers-reduced-motion` emulado: lo respeta el código (y `tokens.css`), pero no lo corrí con la emulación.
- Teclado completo y lector de pantalla más allá de los nombres accesibles que chequea el QA.
