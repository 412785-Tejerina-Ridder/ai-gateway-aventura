# Misión Gati

Una aventura ilustrada para conocer el AI Gateway de llm-service. Diez capítulos, siete vecinos y simulaciones locales. Español argentino, SVG originales y sonido sintetizado opcional. Sin backend, cuentas, claves ni conexiones a proveedores.

## Abrir y compartir

**Abrí `dist/index.html` con doble clic**, o ejecutá `abrir-aventura.cmd` en Windows. El HTML compilado contiene su CSS, JavaScript e ilustraciones: podés compartir **solo ese archivo**, renombrarlo y abrirlo sin conexión. No compartas `index.html` de la raíz: es la entrada de desarrollo.

Recomendados: Chrome, Edge, Firefox o Safari actuales. JavaScript debe estar habilitado. La aventura requiere interacción; no avanza sola por los diez capítulos. Duración orientativa: 10–15 minutos, según exploración.

## Desarrollo

Requisitos: Node.js 22.12+ y pnpm 11. También es compatible con npm si está instalado.

```powershell
cd C:\Users\frant\Desktop\apigateway-interactivo
pnpm install
pnpm dev
```

Abrí la dirección local que imprime Vite (habitualmente `http://127.0.0.1:5173`). Para compilar y verificar:

```powershell
pnpm run typecheck
pnpm run build
pnpm test
pnpm preview --port 4173
```

Equivalentes con npm: `npm install`, `npm run dev`, `npm run typecheck`, `npm run build`, `npm test`, `npm run preview -- --port 4173`.

Las pruebas del archivo portátil requieren ejecutar el build primero. Instalar dependencias requiere conexión; jugar con el HTML compilado no.

## Diez capítulos y sus interacciones

1. **La ciudad:** mapa visible desde el ingreso, bienvenida y paso directo a seguir una consulta.
2. **La consulta:** historia en seis momentos: trabajo que se repetiría en cada módulo, delegación en Gati, ida y vuelta con el modelo y ampliación a los siete módulos. Tutor es el ejemplo; se preservan sus diferencias de recorrido.
3. **Los respaldos:** introducción previa, seis casos independientes y sobres, resultados y estados por candidato. Al cambiar o repetir un caso se reinician tanto la barra como la etiqueta del reloj y el registro. La estrella pide **probar 3 escenarios diferentes**: cada uno cuenta una sola vez y solo cuando su consulta llega al final; el contador «Escenarios explorados» acompaña la simulación.
4. **Un descanso:** guía que cambia con cada envío; tres fallos, cuarto sobre frenado, espera, una prueba de recuperación y vuelta al tráfico normal.
5. **Los módulos:** paseo guiado sin cuestionarios. Cada personaje se presenta, anima su ejemplo y explica su relación con el Gateway. Un botón invita a la siguiente visita. El mapa conserva su estética y permite entrar libremente a cualquier edificio.
6. **Las llaves:** elegir el origen de una consulta de ejemplo y seguir tres pasos: contexto, configuración aplicable y modelo con acceso seguro. No es un menú para editar configuraciones.
7. **Las monedas:** avanzar cuatro momentos de una consulta y comparar qué cuenta cada cuaderno: dos intentos físicos y una operación educativa, con costo parcialmente desconocido.
8. **Los tickets:** demostración guiada sin cuestionario. Gati completa tres tickets según la evidencia y permite simular un reinicio para recuperar los mismos registros.
9. **El misterio:** introducción y guía por estado; doble clic, reserva previa, operación incierta, evidencia de confirmación y cancelación antes del envío. Ventana ficticia de 3,5 segundos para poder explorar la cancelación.
10. **La gran misión:** ocho pasos explorables, reproducción, pausa, avance manual, repetición y celebración final.

La ruta superior y la navegación inferior forman un **HUD siempre visible**. Los capítulos extensos tienen una presentación integrada y un botón **Comenzar ↓** que lleva suavemente al escenario, considerando el encabezado y el HUD. Es una misma página: podés volver a la explicación desplazándote hacia arriba. La ciudad del capítulo 1 aparece desde la entrada. En móvil, los capítulos se distribuyen verticalmente y las secciones largas usan el scroll de la página, sin comprimir personajes ni encerrar las tarjetas en scrolls internos. **Guía y explicación** conserva una consulta opcional de las instrucciones; nunca se abre sola. Los tickets tienen pestañas para releer evidencia.

El HUD empieza con **Misión pendiente**, en gris. Al completar una actividad aparece la celebración con **Capítulo completado**. Confirmá **Guardar mi estrella ★**, cerrá con la X o usá Escape: la estrella viaja al HUD y, al llegar, lo pinta de dorado y cambia a **Misión cumplida**. Después, **Próximo capítulo** palpita y emite partículas. Mientras la misión está pendiente, el botón se ve más sereno (con una pequeña estrella gris) y, al pulsarlo, un aviso amable permite **Volver a mi misión** o **Saltar capítulo**; saltar no otorga la estrella y se puede volver a completarla después. La ruta superior navega sin avisos. Con movimiento reducido se omite el vuelo. El progreso se conserva al navegar o recargar; repetir una actividad terminada no vuelve a abrir su celebración ni pone la estrella gris. La barra cuenta los diez capítulos y, en el capítulo 5, exige las siete visitas completas.

El último capítulo abre automáticamente el festejo final. **Volver a empezar** lleva al inicio y borra capítulos y visitas guardadas: queda en 0/10 incluso después de recargar. También se puede reiniciar desde **Sobre esta aventura**. El progreso solo se guarda en el navegador cuando hay almacenamiento local disponible.

El sonido comienza apagado. Activá **♫** para escuchar una composición original tranquila con percusión suave, bajo y notas cálidas, sin estética de 8 bits. El pequeño control contiguo regula la música; apagar ♫ silencia también los efectos. El cierre incluye aplausos y un coro de festejos sintetizados; también se pueden activar desde el popup final. Todo se genera localmente, sin canciones, grabaciones de niños ni samples descargados. Más detalles en [Audio](docs/AUDIO.md).

Tab y Enter/Espacio permiten operar los controles; Escape cierra los diálogos. Las animaciones respetan `prefers-reduced-motion`. Los modelos de ejemplo ahora usan nombres reales, como GPT-4.1 de OpenAI y Claude Sonnet de Anthropic. Los escenarios, consumos y configuraciones siguen siendo ilustrativos.

## Organización

```text
src/
  scenes/       Diez capítulos y relatos de los siete módulos
  characters/  Personajes SVG y ciudad interactiva
  simulators/  Reglas didácticas de respaldos, breaker y tickets
  animations/  Partículas y sonido local
  audio/       Composición original y síntesis de música, aplausos y coro
  state/       Progreso validado, recuperación de visitas y reinicio
  ui/          Controles reutilizables
  styles/      Base visual, escenas y movimiento
  main.ts      Navegación, progreso y ciclo de vida
scripts/       Empaquetado del HTML portátil
tests/         Pruebas de simuladores y portabilidad
docs/          Fuentes y verificación de la entrega
capturas/      Capturas reales del navegador de verificación
dist/          Build estático listo para compartir
```

## Alcance y límites

Los escenarios, modelos, importes, umbrales y tickets son ficticios. La experiencia explica mecanismos y distingue los recorridos de cada módulo; no es un emulador del backend ni una interfaz administrativa. Los capítulos económicos ilustran infraestructura interna, sin afirmar cobros reales o activación productiva. No se modificó el backend ni la PR #190.

El navegador automatizado permitió revisar el build por HTTP local, pero bloqueó `file://` por su política de seguridad. La apertura con doble clic no pudo comprobarse visualmente en esa herramienta. El build se entrega autocontenido, con script clásico después del contenedor, sin imports de módulo, recursos externos ni APIs de red; esas condiciones tienen pruebas automáticas.

Consultá [las fuentes](docs/FUENTES.md) y [la verificación realizada](docs/VERIFICACION.md).
