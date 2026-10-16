# Verificación de la reestructuración UX de Misión Gati

Proyecto: C:\Users\frant\Desktop\apigateway-interactivo. Revisión del 16/10/2026.

## Resultado y estructura

Se reemplazó la compresión general del viewport por una página continua. Los capítulos largos tienen presentación visible, contexto y botón **Comenzar ↓**. El botón desplaza la misma página hacia su escenario, calcula el espacio entre el encabezado y el HUD y centra actividad y controles cuando caben. Si el contenido es más alto, comienza debajo del encabezado y continúa con scroll vertical normal. No se crean rutas, pantallas independientes ni un scroll interno en las tarjetas.

La ciudad inicial sigue apareciendo al ingresar: no exige Comenzar ni abrir un diálogo. En móviles compactos, la explicación larga se conserva debajo del mapa para dejar la ciudad completa a la vista. Los capítulos cortos 5 y 10 usan un acceso compacto al escenario, sin una introducción artificial adicional. El mapa y el teatro del paseo conservan su continuidad; tocar un edificio en pantallas angostas lleva a su personaje.

Se quitaron la apertura automática de introducciones, el estado por visita, los temporizadores de esa apertura y el mecanismo anterior que escondía el ejercicio de respaldos. Guía y explicación sigue siendo opcional. Los listeners y observadores del capítulo se liberan al navegar.

Los tildes de edificios visitados se posicionan sin aumentar el ancho de la etiqueta; se verificaron los dos mapas con el pasaporte completo.

Se preservaron paleta, tipografías locales, personajes SVG, ilustración de la ciudad, texturas, bordes, sombras, animaciones de personajes, hover, contenido pedagógico, reglas de simulación, audio y controles. No se agregaron dependencias ni conexiones de red.

## Progreso y celebración

La fuente de verdad sigue siendo AdventureProgress: capítulos terminados y sellos de visitas. Su formato persistido conserva compatibilidad. La fase de presentación se deriva de esa información y de un único ticket transitorio de celebración:

- Pendiente: estrella y texto grises, Misión pendiente.
- Primera resolución: se persiste la finalización y se muestra la celebración. El HUD permanece gris, con Estrella por guardar.
- Confirmar, X o Escape: se espera el final real de la entrada, se cierra el diálogo y la estrella vuela al HUD.
- Al terminar la animación Web Animations, se reconoce ese ticket y el HUD queda dorado con Misión cumplida. El botón siguiente comienza a palpitar.

No hay un timeout que decida cuándo un capítulo está terminado. Los identificadores de celebración descartan callbacks de vuelos cancelados. Navegar durante el festejo conserva el progreso y cancela su presentación; volver muestra el capítulo completado sin celebrar otra vez. Recargar tampoco pierde lo resuelto. Repetir el último paso durante el vuelo ya no vuelve a abrir el festejo final: este recibe solo el primer evento de finalización. Con prefers-reduced-motion se reconoce la estrella sin desplazamiento.

## Correcciones de escenas

- Ciudad y mapa de módulos: posiciones distribuidas sobre la ilustración original, anclajes centrados y separación vertical adicional en móvil. Las etiquetas permanecen legibles y asociadas con su edificio. No se sustituyó el mapa por tarjetas.
- Consulta: personajes y fichas recuperan escala; la explicación acompaña el tablero y los siete vecinos pueden ocupar filas en móvil. Cada avance reencuadra el tablero tras su cambio de tamaño, evitando que el scroll necesario en un paso deje las cabezas detrás del encabezado en el siguiente. El contenedor no participa del anclaje automático del navegador.
- Respaldos: selector de casos incluido en el destino del scroll, ruta centrada y registro sin scroll interno. El reloj y las reglas del simulador se mantienen.
- Descanso: envío, proveedor, contadores, guía y controles conservan el flujo completo, con espacio para crecer.
- Configuración: consola protagonista; detalles y resultado se muestran al costado o debajo. En móvil los personajes flanquean el título para no consumir una fila vacía adicional.
- Economía: dos cuadernos equilibrados, títulos legibles, monedas y conteos claros. El detalle completo acompaña la escena fuera de las tarjetas.
- Cuaderno: tickets con ancho intrínseco y consulta por pestañas en pantallas angostas; toda la explicación sigue disponible.
- Duplicados: papel con ancho máximo, columnas flexibles, giro moderado y espacio real para sus esquinas. No se oculta el desborde ni se escala la página. Los estados no estiran el ticket fuera de su escena.
- Final: ruta y flechas centradas como un único conjunto, ocho pasos sin fila accidental en móvil, controles distribuidos según el ancho.

## Scripts ejecutados

- pnpm run typecheck: aprobado.
- pnpm run build: aprobado; incluye TypeScript, Vite y empaquetado portátil.
- pnpm test: **30/30 aprobadas**.
- Lint: package.json no define un script de lint.

Las pruebas cubren portabilidad del HTML, casos de failover, plazo compartido, breaker, idempotencia, reserva incierta, cancelación, progreso, recuperación del guardado, reinicio y composición musical. Se agregaron regresiones de las fases de estrella, repetición, navegación durante celebración, recarga, callbacks viejos, visitas parciales y repetición del cierre final durante el vuelo.

## Prueba funcional real del build

Se recorrieron los diez capítulos desde 0/10 hasta 10/10 y el festejo final en escritorio. Se verificaron:

1. Bienvenida, HUD gris, celebración, confirmación, vuelo y dorado posterior.
2. Cinco avances hasta la vista conjunta de los siete módulos. Revisión adicional del envío y la vuelta de respuesta en escritorio y móvil después del cambio de altura del tablero.
3. Fallos A/B y éxito C; cambio a respuesta inválida, reloj nuevamente en 6 segundos y detención sin respaldo.
4. Tres fallos, cuarto pedido evitado, espera y prueba de recuperación exitosa.
5. Catorce avances del paseo y pasaporte 7/7.
6. Tres pasos del caso Curso Jardín y resolución de Claude Sonnet con credencial del curso.
7. Cuatro momentos, dos intentos físicos y una consulta.
8. Tres evidencias y reinicio que recupera los mismos tickets.
9. Cancelación antes de enviar; caso nuevo, doble clic, reserva, operación posiblemente enviada, evidencia y confirmación. Se mantuvo una sola autorización. Otro clic y un reinicio de la escena conservaron el progreso sin otra celebración.
10. Reproducción, pausa, repetición, pasos manuales, apertura automática del festejo, cierre y repetición sin reapertura accidental. Volver a empezar eliminó el progreso local de QA.

También se verificaron navegación por el HUD, regreso a capítulos completados, recarga conservando estado, cierre de la guía con Escape y controles de audio. El registro observado no mostró errores ni advertencias de aplicación. Las pruebas de navegador usan un origen localhost de QA y no reinician el progreso del archivo abierto por el usuario.

## Revisión visual y responsive

Se recorrieron y capturaron los diez capítulos en estas seis dimensiones reales de viewport:

| Tamaño | Capítulos | Revisiones |
|---|---|---|
| 1920 × 1080 | 1–10 | Entrada y escenario |
| 1536 × 864 | 1–10 | Entrada y escenario |
| 1366 × 768 | 1–10 | Entrada, escenario y recorrido funcional completo |
| 768 × 1024 | 1–10 | Entrada y escenario |
| 390 × 844 | 1–10 | Entrada y escenario |
| 375 × 667 | 1–10 | Entrada, escenario y ajustes específicos de móvil compacto |

Se inspeccionaron capturas individuales y hojas conjuntas. Se buscaron recortes, superposiciones, etiquetas ocultas, centrado, scroll horizontal, tamaño de lectura, controles, encabezado y HUD. Las escenas ajustadas después de la primera pasada se volvieron a comprobar. Las mediciones de las seis dimensiones no encontraron overflow horizontal, el ticket quedó dentro de su escena y el eje del recorrido final coincide con el del tablero. La comprobación final de la ciudad inicial confirma que cabe sobre el HUD en las seis dimensiones y que ninguna etiqueta invade otro edificio.

Las capturas de estados interactivos complementan esta matriz; no se afirma haber recorrido cada combinación de estado y resolución. En móviles bajos, los capítulos con mucha información pueden continuar debajo de la vista mediante scroll normal de página. Esa distribución es intencional: no se recorta contenido para forzar un único viewport.

## Evidencia

- Índice comparativo: ../capturas/ux-integral/revision.html
- Antes: ../capturas/ux-integral/antes/
- Después, por resolución y capítulo: ../capturas/ux-integral/despues/
- Comunicación durante el envío: ../capturas/ux-integral/despues/consulta-final.jpg y consulta-mobile-envio.jpg
- Celebración: ../capturas/ux-integral/despues/celebracion-confirmar.jpg
- Festejo 10/10: ../capturas/ux-integral/despues/final-10-de-10.jpg
- Ciudad final: ../capturas/ux-integral/ciudad-final.json
- Ambos mapas, incluyendo siete edificios visitados: ../capturas/ux-integral/mapas-final.json
- Ticket móvil en seis estados: ../capturas/ux-integral/ticket-estados-final.json
- Matrices JSON de la pasada responsive: ../capturas/ux-integral/matriz-*.json. Conservan mediciones intermedias de esa pasada; ciudad-final.json contiene el control posterior a los ajustes del mapa inicial.

## Archivos modificados

- src/styles/frame.css y hud.css: estructura, escala, responsive, HUD y vuelo.
- src/ui/stage.ts y narrative.ts: introducciones visibles y scroll guiado; reorganización de los mismos nodos y controles.
- src/ui/celebrations.ts: confirmación y sincronización con la animación real.
- src/main.ts y state/progress.ts: progreso y ciclo de vida sin estados contradictorios.
- src/characters/city.ts: coordenadas de los edificios; SVG originales conservados.
- src/scenes/03-failover.ts: retiro del antiguo paso que escondía el juego.
- src/types.ts y scenes/10-finale.ts: distinguir primera finalización de repetición al abrir el festejo.
- tests/progress.test.ts: regresiones del progreso.
- README.md y este documento: comportamiento y evidencia actualizados.
- dist/: build portátil regenerado. capturas/ux-integral/: evidencia y hojas de revisión.

## Límites y preservación del backend

La política del navegador automatizado bloquea file:// incluso al intentar inspeccionar la pestaña ya abierta. Por eso se verificó visualmente el mismo HTML compilado servido por HTTP local, y mediante tests su estructura autocontenida: estilos y script clásico incluidos, sin imports externos ni APIs de red. No se afirma una prueba visual de doble clic.

No se realizó una auditoría WCAG completa, una matriz de todos los navegadores ni un cambio de la preferencia de movimiento del sistema operativo. Se conservó el soporte existente y se revisó su rama de ejecución sin animación.

El checkout backend conserva HEAD d773ee82c4d386421aa9c7a1390d1a78ef68112c y su carpeta preexistente sin seguimiento labs/ai-gateway-failover-demo/. El worktree de #190 conserva b224179e498874c1197bffa1341475c0ad4038b6. No se modificaron backend, migraciones, documentación oficial, ramas ni PR #190. No se ejecutaron Maven, Docker, commits, push ni publicaciones.
