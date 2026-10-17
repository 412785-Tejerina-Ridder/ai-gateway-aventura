import "./styles/base.css";
import "./styles/scenes.css";
import "./styles/narrative.css";
import "./styles/hud.css";
import "./styles/frame.css";
import { createStage } from "./ui/stage";
import { AdventureProgress } from "./state/progress";
import { Celebrations } from "./ui/celebrations";
import { nextChapterAction } from "./state/navigation";
import { gameAudio } from "./audio/engine";
import { chapters } from "./scenes";
import { character } from "./characters/characters";
import { confetti, toggleSound } from "./animations/effects";
const app = document.querySelector<HTMLDivElement>("#app")!;
let current = 0;
let progressState = new AdventureProgress();
let cleanups: (() => void)[] = [];
try {
    progressState = new AdventureProgress(JSON.parse(localStorage.getItem("gati-progress-v1") ?? "{}"));
}
catch { }
const finished = progressState.finished;
const stamps = progressState.stamps;
function save() {
    try {
        localStorage.setItem("gati-progress-v1", JSON.stringify(progressState.serialize()));
    }
    catch {
        /* Progress is optional; the adventure remains fully functional. */
    }
}
app.innerHTML = `<header class="site-header"><a class="brand" href="#ciudad" aria-label="Misión Gati, inicio">${character("gati")}<span>MISIÓN <b>GATI</b><small>UNA AVENTURA EN LA CIUDAD LLM</small></span></a><div class="header-right"><span class="edition">G03 <i>✦</i> UTN CÓRDOBA</span><button id="guide-toggle" class="icon-button" aria-label="Abrir guía de la aventura">?<span>Cómo jugar</span></button><button id="reset-header" class="icon-button" aria-label="Reiniciar mi progreso">↺<span>Reiniciar</span></button><button id="sound-toggle" class="icon-button" aria-pressed="true" aria-label="Desactivar sonido">♫<span>Sonido encendido</span></button></div></header><div class="adventure-bar"><span class="trail-label">TU AVENTURA</span><nav class="chapter-nav" aria-label="Capítulos">${chapters.map((c, i) => `<button data-chapter="${i}" aria-label="Capítulo ${i + 1}: ${c.label}"><span>${String(i + 1).padStart(2, "0")}</span><b>${c.label}</b></button>`).join("")}</nav><div class="progress-summary"><span id="progress-text">0 / 10</span><div class="progress-track"><i id="progress-fill"></i></div></div></div><main id="main" tabindex="-1"><section class="chapter-heading"><span class="eyebrow" id="eyebrow"></span><h1 id="chapter-title"></h1><p id="chapter-subtitle"></p></section><div id="scene"></div><div class="dialogue-bar"><div class="dialogue-avatar">${character("gati")}</div><div><span id="dialogue-speaker">GATI · CENTRAL DE IDEAS</span><p id="dialogue" role="status" aria-live="polite">¡Vamos, que hay una ciudad por conocer!</p></div><span class="dialogue-stars" aria-hidden="true">✦</span></div><footer class="chapter-footer"><button class="text-button" id="prev">← Capítulo anterior</button><span id="chapter-status">Explorá y resolvé la misión</span><button class="btn btn-primary" id="next">Próximo capítulo →</button></footer></main><footer class="site-footer"><span>HECHO PARA APRENDER JUGANDO <b>✦</b> G03 · LLM-SERVICE</span><span>Sin conexión. Sin datos reales. Con mucha curiosidad.</span><button class="text-button" id="credits-open">Sobre esta aventura</button></footer><dialog id="guide-dialog"><button class="dialog-close" aria-label="Cerrar guía">×</button><span class="eyebrow">MAPA EN MANO</span><h2>Se aprende tocando.</h2><p>Recorré los diez capítulos, enviá consultas, provocá fallos y seguí el paseo guiado de los siete edificios del capítulo 5. Cada misión resuelta suma una estrella.</p><ul><li>Volvé a cualquier capítulo desde la ruta superior.</li><li>Los botones funcionan con Tab y Enter o Espacio.</li><li>Podés pausar y repetir la misión final.</li><li>El sonido empieza encendido y podés apagarlo cuando quieras.</li><li>Se respeta tu preferencia de movimiento reducido.</li></ul><p>Los escenarios, importes y tickets son ficticios. Los nombres de modelos reales se usan como ejemplos, sin llamadas comerciales. No hacemos llamadas al backend ni a proveedores.</p><button class="btn btn-primary dialog-close">¡A jugar! →</button></dialog><dialog id="credits-dialog"><button class="dialog-close" aria-label="Cerrar información">×</button><span class="eyebrow">DE G03 PARA G03</span><h2>Una ciudad, muchas especialidades.</h2><p>Experiencia conceptual basada en el código y la arquitectura de llm-service: failover de Sprint 2, configuración y credenciales de #182 y economía durable de #190, referencia b224179.</p><p>Los capítulos económicos son simulaciones del mecanismo interno. No representan tarifas aprobadas, cargos reales ni una activación productiva. Cada módulo conserva su responsabilidad.</p><p>Personajes originales dibujados en SVG. Música original con percusión suave, aplausos y coro de festejos sintetizados localmente. Sin fuentes, imágenes, analítica ni servicios externos.</p><button class="text-button" id="reset-progress">Reiniciar las estrellas de esta aventura</button><p id="reset-result" role="status"></p></dialog>`;
// One document scroll, with sticky navigation and a fixed progress HUD.
const main = document.querySelector<HTMLElement>("#main")!;
const hud = document.querySelector<HTMLElement>(".chapter-footer")!;
main.after(hud);
const chapterContent = document.createElement("div");
chapterContent.id = "chapter-content";
chapterContent.tabIndex = 0;
chapterContent.setAttribute("role", "region");
chapterContent.setAttribute("aria-labelledby", "chapter-title");
while (main.firstChild)
    chapterContent.append(main.firstChild);
main.append(chapterContent);
const shellObserver = new ResizeObserver(() => {
    const chrome = document.querySelector('.site-header')!.getBoundingClientRect().height + document.querySelector('.adventure-bar')!.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--chrome-height', chrome + 'px');
    document.documentElement.style.setProperty('--header-height', document.querySelector('.site-header')!.getBoundingClientRect().height + 'px');
    document.documentElement.style.setProperty('--hud-height', hud.getBoundingClientRect().height + 'px');
});
[document.querySelector('.site-header')!, document.querySelector('.adventure-bar')!, hud].forEach(el => shellObserver.observe(el));
document
    .querySelector(".progress-summary")!
    .insertAdjacentHTML("beforeend", '<span id="progress-detail"></span>');
document
    .querySelector(".header-right")!
    .insertAdjacentHTML("beforeend", '<label class="music-volume" title="Volumen de música"><span>♫</span><input type="range" id="music-volume" min="0" max="100" value="55" aria-label="Volumen de música"></label>');
document.querySelector('#chapter-status')!.setAttribute('role', 'status');
document.querySelector('#chapter-status')!.innerHTML = '<span id="mission-star" aria-hidden="true">★</span><span id="mission-state">Misión incompleta</span>';
document.querySelector('#next')!.innerHTML = '<span id="next-label">Próximo capítulo →</span><span class="next-particles" aria-hidden="true">' + Array.from({ length: 6 }, (_, i) => '<i style="--n:' + i + '">' + (i % 2 ? '✦' : '•') + '</i>').join('') + '</span>';
// Friendly reminder before skipping a pending mission (shared dialog styles).
document.querySelector('#app')!.insertAdjacentHTML('beforeend', '<dialog class="celebration-dialog skip-dialog" id="skip-dialog" aria-labelledby="skip-title" aria-describedby="skip-text"><button class="dialog-close" data-skip-stay aria-label="Cerrar y volver a mi misión">×</button><span class="skip-star" aria-hidden="true">★</span><span class="eyebrow" id="skip-chapter"></span><h2 id="skip-title">¡Todavía te falta conseguir tu estrella!</h2><p id="skip-text">Podés seguir explorando la ciudad, pero si terminás esta misión primero, te llevás una estrella más.</p><div class="final-actions"><button class="btn btn-primary" data-skip-stay>Volver a mi misión</button><button class="btn btn-secondary" id="skip-chapter-button">Saltar capítulo →</button></div></dialog>');
const skipDialog = document.querySelector<HTMLDialogElement>('#skip-dialog')!;
let skipFrom = -1;
function warnBeforeSkipping() {
    if (skipDialog.open)
        return; // One warning per action, even with repeated clicks or keys.
    skipFrom = current;
    skipDialog.querySelector('#skip-chapter')!.textContent = `CAPÍTULO ${String(current + 1).padStart(2, '0')} · ${chapters[current].label.toUpperCase()}`;
    skipDialog.showModal();
    skipDialog.querySelector<HTMLButtonElement>('.btn-primary')!.focus();
}
skipDialog.querySelectorAll('[data-skip-stay]').forEach(b => b.addEventListener('click', () => skipDialog.close('stay')));
skipDialog.addEventListener('close', () => {
    if (skipDialog.returnValue !== 'skip')
        document.querySelector<HTMLElement>('#next')?.focus({ preventScroll: true });
    skipDialog.returnValue = '';
});
skipDialog.querySelector('#skip-chapter-button')!.addEventListener('click', () => {
    const from = skipFrom;
    skipDialog.close('skip');
    // Plain navigation: no stamp, no star and no celebration for the skipped chapter.
    if (from === current && from < 9)
        navigate(from + 1, true);
});
// Header reset: confirms first, then wipes every star and visit and returns to the start.
document.querySelector('#app')!.insertAdjacentHTML('beforeend', '<dialog class="celebration-dialog skip-dialog" id="reset-dialog" aria-labelledby="reset-title" aria-describedby="reset-text"><button class="dialog-close" data-reset-cancel aria-label="Cerrar sin reiniciar">×</button><span class="skip-star" aria-hidden="true">↺</span><h2 id="reset-title">¿Empezamos de cero?</h2><p id="reset-text">Se borran todas tus estrellas, visitas y escenarios explorados, y volvés al inicio de la aventura.</p><div class="final-actions"><button class="btn btn-primary" data-reset-cancel>Mejor sigo</button><button class="btn btn-secondary" id="reset-confirm">Sí, reiniciar todo</button></div></dialog>');
const resetDialog = document.querySelector<HTMLDialogElement>('#reset-dialog')!;
document.querySelector('#reset-header')!.addEventListener('click', () => {
    if (!resetDialog.open)
        resetDialog.showModal();
    resetDialog.querySelector<HTMLButtonElement>('.btn-primary')!.focus();
});
resetDialog.querySelectorAll('[data-reset-cancel]').forEach(b => b.addEventListener('click', () => resetDialog.close('cancel')));
resetDialog.querySelector('#reset-confirm')!.addEventListener('click', () => {
    resetDialog.close('reset');
    restartAdventure();
});
const celebrations = new Celebrations({
    landed: (ticket) => { if (progressState.acknowledge(ticket))
        progress(); },
    restart: () => restartAdventure(),
    goTo: (index) => navigate(index, true),
});
const scene = document.querySelector<HTMLElement>("#scene")!;
const defaultDialogue = [
    "¡Bienvenido a casa! Sigamos una consulta para ver qué trabajo toma Gati y qué conserva cada módulo.",
    "El Tutor es nuestro ejemplo. Mirá cómo delega la comunicación sin delegar su tarea pedagógica.",
    "Los respaldos no son una excusa para saltear un límite o una respuesta inválida.",
    "Si alguien viene fallando, le damos un descanso. Después probamos con cuidado.",
    "Cada vecino tiene algo que contarte. Seguí las siete visitas guiadas, sin preguntas para adivinar.",
    "La configuración se administra. Yo uso el destino aplicable al contexto.",
    "Costo físico y cargo lógico no son la misma cuenta. Ojo con sumar peras con tickets.",
    "Anotar lo que sabemos también significa reconocer lo que no sabemos.",
    "El número del ticket importa. Un doble clic no es una segunda intención de gasto.",
    "Misma ciudad, diferentes responsabilidades. ¡Vamos con la gran misión!",
];
function progress() {
    document.querySelector("#progress-text")!.textContent =
        `${finished.size} / 10`;
    document.querySelector<HTMLElement>("#progress-fill")!.style.width =
        `${finished.size * 10}%`;
    document.querySelectorAll<HTMLElement>("[data-chapter]").forEach((b, i) => {
        b.classList.toggle("completed", finished.has(i));
        b.classList.toggle("current", current === i);
        if (current === i)
            b.setAttribute("aria-current", "step");
        else
            b.removeAttribute("aria-current");
    });
    const phase = progressState.phase(current);
    const done = phase === 'completed';
    document.querySelector<HTMLElement>('#chapter-status')!.dataset.phase = phase;
    document.querySelector('#chapter-status')!.classList.toggle('mission-complete', done);
    document.querySelector('#mission-state')!.textContent = done ? 'Misión cumplida' : phase === 'celebrating' ? 'Estrella por guardar' : 'Misión pendiente';
    const missing = progressState.missing;
    document.querySelector("#progress-detail")!.textContent =
        missing.length === 1 ? "Falta: " + chapters[missing[0]].label : "";
    document
        .querySelector(".progress-summary")!
        .setAttribute("title", missing.length
        ? "Por recorrer: " + missing.map((i) => chapters[i].label).join(", ")
        : "¡Los diez capítulos completos!");
    document
        .querySelector("#next")!
        .classList.toggle("next-ready", done);
    // Pending missions keep a calmer, still clickable button (never `disabled`).
    document
        .querySelector("#next")!
        .classList.toggle("next-pending", current > 0 && current < 9 && phase === 'pending');
    document.querySelector<HTMLButtonElement>("#next")!.disabled =
        current === 9 && !finished.has(9);
}
function restartAdventure() {
    celebrations.close();
    progressState.reset();
    save();
    navigate(0, true);
}
function presentNewStar(chapterIndex: number) {
    const ticket = progressState.celebration;
    if (!ticket)
        return;
    queueMicrotask(() => {
        if (current === chapterIndex && progressState.celebration?.id === ticket.id)
            celebrations.showChapter(chapterIndex, chapters[chapterIndex].label, ticket);
    });
}
function completeWelcome() {
    const fresh = progressState.complete(0);
    save();
    progress();
    if (fresh)
        presentNewStar(0);
    else
        navigate(1, true);
}
// Sound is on by default: the first gesture starts the music (browser autoplay rules),
// except on the sound button itself so that muting never plays a blip first.
for (const type of ["pointerdown", "pointerup", "keydown", "touchend"])
    document.addEventListener(type, (e) => {
        if (!(e.target as Element | null)?.closest?.("#sound-toggle"))
            void gameAudio.unlock();
    }, { capture: true });
// A soft tap for every enabled button.
document.addEventListener("click", (e) => {
    const button = (e.target as Element | null)?.closest?.("button");
    if (button && !button.disabled)
        gameAudio.tap();
});
document
    .querySelector("#music-volume")!
    .addEventListener("input", (e) => gameAudio.setVolume(Number((e.target as HTMLInputElement).value) / 100));
function navigate(index: number, focus = false) {
    progressState.leaveChapter();
    celebrations.close();
    if (skipDialog.open)
        skipDialog.close('skip');
    cleanups.forEach((fn) => fn());
    cleanups = [];
    current = Math.max(0, Math.min(9, index));
    const c = chapters[current];
    document.querySelector("#eyebrow")!.textContent = c.eyebrow;
    document.querySelector("#chapter-title")!.textContent = c.title;
    document.querySelector("#chapter-subtitle")!.textContent = c.subtitle;
    document.querySelector("#dialogue")!.textContent = defaultDialogue[current];
    document.querySelector("#dialogue-speaker")!.textContent =
        "GATI · CENTRAL DE IDEAS";
    scene.innerHTML = c.render();
    scene.className = `scene scene-${c.id}`;
    const stage = createStage(scene, current, c);
    cleanups.push(stage.dispose);
    const chapterIndex = current;
    const timers = new Set<number>();
    cleanups.push(() => timers.forEach(clearTimeout));
    c.mount({
        goTo: (index) => navigate(index, true),
        finishAdventure: () => {
            const ticket = progressState.celebration;
            if (ticket?.chapter === 9)
                celebrations.showFinal(progressState, chapters.map(c => c.label), ticket);
        },
        root: scene,
        completedKeys: new Set(stamps),
        complete: (key = "done") => {
            const fresh = progressState.complete(chapterIndex, key);
            save();
            progress();
            if (fresh && chapterIndex !== 9)
                presentNewStar(chapterIndex);
            return fresh;
        },
        explore: (key) => {
            const fresh = progressState.explore(chapterIndex, key);
            if (fresh)
                save();
            return fresh;
        },
        isComplete: () => finished.has(chapterIndex),
        say: (text, speaker = "Gati") => {
            document.querySelector("#dialogue")!.textContent = text;
            document.querySelector("#dialogue-speaker")!.textContent =
                speaker.toUpperCase();
        },
        sparkle: confetti,
        later: (fn, delay) => {
            const id = window.setTimeout(() => {
                timers.delete(id);
                if (current === chapterIndex)
                    fn();
            }, delay);
            timers.add(id);
        },
        onCleanup: (fn) => cleanups.push(fn),
    });
    document.querySelector<HTMLButtonElement>("#prev")!.disabled = current === 0;
    document.querySelector("#next-label")!.textContent =
        current === 9 ? "Ver el festejo final ★" : "Próximo capítulo →";
    progress();
    document.title = `${c.label} · Misión Gati`;
    window.scrollTo({ top: 0, behavior: "instant" });
    if (focus) {
        document
            .querySelector<HTMLElement>("#chapter-content")!
            .focus({ preventScroll: true });
    }
    if (location.hash.slice(1) !== c.id) {
        try {
            history.replaceState(null, "", "#" + c.id);
        }
        catch {
            // Some file URL policies restrict history. Chapter buttons still work.
        }
    }
}
document
    .querySelectorAll<HTMLElement>("[data-chapter]")
    .forEach((b) => b.addEventListener("click", () => navigate(Number(b.dataset.chapter), true)));
document
    .querySelector("#prev")!
    .addEventListener("click", () => navigate(current - 1, true));
document.querySelector("#next")!.addEventListener("click", () => {
    const action = nextChapterAction(current, finished);
    if (action === "finale")
        celebrations.showFinal(progressState, chapters.map((c) => c.label), progressState.celebration ?? undefined);
    else if (action === "complete-welcome")
        completeWelcome();
    else if (action === "warn")
        warnBeforeSkipping();
    else
        navigate(current + 1, true);
});
document
    .querySelector("#sound-toggle")!
    .addEventListener("click", async (e) => {
    const b = e.currentTarget as HTMLButtonElement;
    b.disabled = true;
    const enabled = await toggleSound();
    b.disabled = false;
    b.setAttribute("aria-pressed", String(enabled));
    b.setAttribute("aria-label", enabled ? "Desactivar sonido" : "Activar sonido");
    b.querySelector("span")!.textContent = enabled
        ? "Sonido encendido"
        : "Sonido apagado";
});
document.addEventListener("gati-audio-change", () => {
    const b = document.querySelector<HTMLButtonElement>("#sound-toggle")!;
    b.setAttribute("aria-pressed", String(gameAudio.enabled));
    b.setAttribute("aria-label", gameAudio.enabled ? "Desactivar sonido" : "Activar sonido");
    b.querySelector("span")!.textContent = gameAudio.enabled
        ? "Sonido encendido"
        : "Sonido apagado";
});
for (const [trigger, id] of [
    ["guide-toggle", "guide-dialog"],
    ["credits-open", "credits-dialog"],
])
    document
        .getElementById(trigger)!
        .addEventListener("click", () => document.querySelector<HTMLDialogElement>("#" + id)!.showModal());
document
    .querySelectorAll("#guide-dialog .dialog-close,#credits-dialog .dialog-close")
    .forEach((b) => b.addEventListener("click", () => b.closest("dialog")!.close()));
document.querySelector("#reset-progress")!.addEventListener("click", () => {
    restartAdventure();
    document.querySelector("#reset-result")!.textContent =
        "Estrellas reiniciadas. Podés volver a descubrirlas.";
});
window.addEventListener("hashchange", () => {
    const i = chapters.findIndex((x) => x.id === location.hash.slice(1));
    if (i >= 0)
        navigate(i, true);
});
navigate(Math.max(0, chapters.findIndex((x) => x.id === location.hash.slice(1))));
