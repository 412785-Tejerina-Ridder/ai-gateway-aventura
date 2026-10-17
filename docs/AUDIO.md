# Audio de Misión Gati

La música y los efectos fueron compuestos y programados para esta experiencia. No se descargaron canciones ni samples de terceros, no se usó una melodía de Crash Bandicoot y no se incorporaron grabaciones de personas.

## Música

`src/audio/composition.ts` contiene un bucle original de ocho compases a 84 BPM. Usa una melodía discreta, acordes cálidos, bajo, bombo suave, congas y shaker. `src/audio/engine.ts` genera los instrumentos con Web Audio: senoidales, parciales amortiguados y ruido filtrado; no utiliza ondas cuadradas para la música ni un sonido de consola de 8 bits. El filtro de salida y el compresor suavizan el conjunto.

La música no necesita un archivo remoto. Cambiar de capítulo no corta ni duplica el bucle. Al ocultar la pestaña se detienen las fuentes y se suspende el contexto; al volver se retoma. El volumen de la música es independiente del nivel de los efectos.

## Festejo

El cierre combina ráfagas de aplausos con un pequeño coro caricaturesco de voces de festejo generado por síntesis de formantes. Busca el carácter de un grupo alegre; **no es una grabación de niños reales**. La estrella de cada capítulo tiene un acorde corto y suave.

## Controles

- El sonido empieza activado; como el navegador requiere un gesto para habilitar audio, la música arranca con el primer clic o tecla. Cada botón emite un golpecito suave de tamboril (silenciado junto con el resto al apagar ♫).
- ♫ activa música y efectos. El slider regula la música.
- Apagar ♫ cancela fuentes y programación, no solo oculta el control.
- El popup final ofrece activar música y festejos, o repetir el festejo si el sonido ya está activo.
- Se puede jugar completamente en silencio.

No hay servicios de voz, peticiones de red ni archivos sonoros externos. La comprobación automatizada verificó activación, mute y ausencia de errores de Web Audio; no sustituye una escucha humana en los parlantes o auriculares de la reunión.
