import { city } from "../characters/city";
import { character } from "../characters/characters";
import { modules } from "./modules";
import { MODULE_IDS } from "../state/progress";
import { reserveBoardHeight, availableViewport } from "../ui/stability";
import type { Chapter } from "../types";
const demos: Record<string, { visual: string; text: string }> = {
  tutor: {
    visual:
      '<span class="lesson-bubble">¿Qué variable cambia en cada vuelta?</span><span class="tour-travel">✉ → Gati → IA → ✉</span>',
    text: "El principal falló con un error elegible. Gati coordinó el respaldo y el Profe pudo seguir dando una pista. Cambiar de proveedor no cambia las reglas de enseñanza.",
  },
  evaluator: {
    visual:
      '<span class="rubric-stamp">A · 4</span><span class="rubric-stamp">B · 4</span>',
    text: "Eva mira dos conversaciones con la misma evidencia y aplica la misma rúbrica. El ejemplo da 4 y 4. Gati ejecuta la invocación; la consistencia del criterio pertenece al Evaluador.",
  },
  rag: {
    visual:
      '<span class="book-fragment">BUCLES<br>Mientras la condición se cumple…</span><span class="meaning-dots">● · ● · ●<small>Cerca por significado</small></span>',
    text: "Biblio encontró un fragmento relevante del curso y lo sumó al contexto. Un embedding ayuda a ubicar textos por significado. RAG elige las fuentes; Gati no decide qué apunte es relevante.",
  },
  moderation: {
    visual:
      '<span class="review-stamp">REVISAR</span><span class="tour-travel">Mensaje → Mora → revisión</span>',
    text: "Mora marca un ataque personal para revisión según sus reglas de convivencia. Sus clasificadores tienen recorridos especializados: no todo su pipeline es el camino común de TUTOR.",
  },
  agent: {
    visual: '<span class="mail-delivery">@agente ✉ → 🤖</span>',
    text: "Una persona del curso menciona al agente. Ari valida la mención y prepara contexto con fuentes; puede usar TUTOR para la invocación. Los bots no se llaman entre sí en un bucle sin fin.",
  },
  generator: {
    visual:
      '<span class="draft-sheet">✎ BORRADOR<br>Pregunta ✓ Fuente ✓ Formato ✓</span>',
    text: "Geno pide una pregunta por el camino GENERATOR. Cuando vuelve el resultado, valida formato y respaldo, y lo deja como borrador para revisión. Responder bien técnicamente no aprueba el contenido.",
  },
  calibration: {
    visual: '<span class="calibration-ruler">80 ← <b>Δ 2</b> → 78</span>',
    text: "Cali compara una referencia humana de 80 con una salida de 78. Esa diferencia aporta evidencia al conjunto de casos. Calibrar no es elegir al primero que responde ni entrenar los pesos del modelo.",
  },
};
export const modulesChapter: Chapter = {
  id: "modulos",
  label: "Los módulos",
  title: "Siete vecinos. Siete especialidades.",
  eyebrow: "05 / PASEO GUIADO POR LA CIUDAD",
  subtitle:
    "Gati te lleva de visita. Cada vecino cuenta su trabajo y muestra cómo se relaciona con la IA. Sin preguntas ni respuestas para adivinar.",
  render: () =>
    `<div class="module-exploration"><div class="module-map">${city(true)}<div class="passport" aria-label="Pasaporte de visitas">${modules.map((m) => `<span data-stamp="${m.id}" title="${m.place}">○</span>`).join("")}<b id="module-count">0 / 7</b></div></div><div class="module-theatre" id="module-theatre" tabindex="-1"></div></div><p class="scene-note">✦ Seguí el paseo con los botones de cada personaje. También podés entrar a cualquier edificio del mapa.</p>`,
  mount: (ctx) => {
    const visited = new Set<string>(
      MODULE_IDS.filter((id) => ctx.completedKeys.has(`module-${id}`)),
    );
    let active = modules.findIndex((m) => !visited.has(m.id));
    if (active < 0) active = 0;
    let part = 0;
    const touringAgain = visited.size === 7;
    const sessionVisited = new Set<string>();
    const done = (id: string) =>
      touringAgain ? sessionVisited.has(id) : visited.has(id);
    const passport = () => {
      modules.forEach((m) => {
        const done = visited.has(m.id);
        const stamp = ctx.root.querySelector(`[data-stamp="${m.id}"]`)!;
        stamp.textContent = done ? "★" : "○";
        stamp.classList.toggle("stamped", done);
        ctx.root
          .querySelector(`[data-module="${m.id}"]`)!
          .classList.toggle("visited", done);
      });
      ctx.root.querySelector("#module-count")!.textContent =
        `${visited.size} / 7`;
    };
    const open = (index: number, scroll = false) => {
      active = index;
      part = 0;
      render();
      if (scroll && innerWidth < 800)
        ctx.root
          .querySelector<HTMLElement>("#module-theatre")!
          .focus({ preventScroll: true });
    };
    // One template for the live theatre and for measuring every stop.
    const story = (active: number, part: number, nextId?: string) => {
      const m = modules[active],
        demo = demos[m.id],
        next = nextId ? { id: nextId } : undefined;
      return `<div class="module-story module-${m.id} tour-part-${part}"><div class="tour-body"><span class="eyebrow">PARADA ${active + 1} DE 7 · ${part === 0 ? "CONOCEMOS AL VECINO" : "MIRÁ CÓMO TRABAJA"}</span><div class="module-story-head tour-character">${character(m.id)}<div><span class="eyebrow">${m.place}</span><h3>${m.title}</h3></div></div><p class="module-line">${m.line}</p>${part === 0 ? `<div class="responsibilities"><p><b>MI ESPECIALIDAD</b>${m.job}</p><p><b>LO QUE CONSERVO YO</b>${m.own}</p></div><p class="tour-invitation">Vení, te muestro mi recorrido con IA.</p>` : `<div class="module-reward tour-demo">${demo.visual}</div><p class="tour-explanation">${demo.text}</p><div class="responsibilities"><p><b>MI RELACIÓN CON EL GATEWAY</b>${m.gateway}</p></div>`}</div><div class="tour-controls">${part ? '<button class="text-button" data-tour-back>← Volver a la presentación</button>' : ""}<button class="btn btn-primary" data-tour-advance>${part === 0 ? "Ver mi recorrido →" : next ? `Siguiente visita: ${next.id === "rag" ? "RAG" : ({ tutor: "Tutor", evaluator: "Evaluador", moderation: "Moderación", agent: "Agente", generator: "Generador", calibration: "Calibración" } as Record<string, string>)[next.id]} →` : "Terminar el paseo ★"}</button></div></div>`;
    };
    // Reserve the tallest stop so «Ver mi recorrido» and «Siguiente visita» stay put.
    const theatre = ctx.root.querySelector<HTMLElement>("#module-theatre")!;
    ctx.onCleanup(
      reserveBoardHeight(
        theatre,
        modules.flatMap((_, index) =>
          [0, 1].map((p) => (clone: HTMLElement) => {
            clone.innerHTML = story(index, p, "calibration");
          }),
        ),
        // On phones the theatre stacks under the map: reserve only when the
        // tallest stop fits, otherwise short stops would push the button below the fold.
        (heights) => {
          const tallest = Math.max(...heights);
          return tallest <= availableViewport() || !matchMedia("(max-width:760px)").matches
            ? tallest
            : null;
        },
      ),
    );
    // Same width for every label of the main tour button (right-aligned row).
    const scratch = document.createElement("template");
    const advanceLabels = [
      ...new Set(
        modules.flatMap((_, index) =>
          [0, 1].flatMap((p) =>
            [...modules.map((x) => x.id), undefined].map((nextId) => {
              scratch.innerHTML = story(index, p, nextId);
              return scratch.content.querySelector("[data-tour-advance]")!.textContent!;
            }),
          ),
        ),
      ),
    ];
    let advanceWidth = "";
    const measureAdvance = () => {
      const button = theatre.querySelector<HTMLElement>("[data-tour-advance]");
      if (!button) return;
      const current = button.textContent;
      button.style.minWidth = "0px";
      let widest = 0;
      for (const label of advanceLabels) {
        button.textContent = label;
        widest = Math.max(widest, button.getBoundingClientRect().width);
      }
      button.textContent = current;
      advanceWidth = widest ? `min(${Math.ceil(widest)}px, 100%)` : "";
      button.style.minWidth = advanceWidth;
    };
    let measuredWidth = innerWidth;
    const remeasure = () => {
      if (innerWidth === measuredWidth) return;
      measuredWidth = innerWidth;
      measureAdvance();
    };
    window.addEventListener("resize", remeasure);
    ctx.onCleanup(() => window.removeEventListener("resize", remeasure));
    const render = () => {
      const m = modules[active];
      ctx.root
        .querySelectorAll<HTMLElement>("[data-module]")
        .forEach((b) =>
          b.classList.toggle("chosen", b.dataset.module === m.id),
        );
      const next = modules.find(
        (m) => !done(m.id) && m.id !== modules[active].id,
      );
      theatre.innerHTML = story(active, part, next?.id);
      const advance = theatre.querySelector<HTMLElement>("[data-tour-advance]");
      if (advance) {
        if (!advanceWidth) measureAdvance();
        else advance.style.minWidth = advanceWidth;
      }
    };
    const click = (e: Event) => {
      const b = (e.target as HTMLElement).closest<HTMLElement>(
        "[data-tour-advance],[data-tour-back],[data-tour-finish]",
      );
      if (!b) return;
      if (b.hasAttribute("data-tour-finish")) {
        ctx.goTo(5);
        return;
      }
      if (b.hasAttribute("data-tour-back")) {
        part = 0;
        render();
        return;
      }
      if (part === 0) {
        part = 1;
        render();
        return;
      }
      const m = modules[active];
      visited.add(m.id);
      sessionVisited.add(m.id);
      ctx.complete(`module-${m.id}`);
      passport();
      const next = modules.findIndex((x) => !done(x.id));
      if (next >= 0) open(next, innerWidth < 800);
      else {
        ctx.complete("tour-done");
        ctx.root.querySelector("#module-theatre")!.innerHTML =
          `<div class="theatre-invitation tour-finished">${character("gati")}<span class="eyebrow">SIETE VISITAS · MISMA CIUDAD</span><h3>¡Ya conocés al equipo!</h3><p>Cada módulo conserva su especialidad. Gati aporta infraestructura para usar IA por el recorrido que corresponda.</p><button class="btn btn-primary" data-tour-finish>Seguir al capítulo 6 →</button></div>`;
        ctx.say(
          "¡Pasaporte completo! Siete especialidades, sin siete formas de reinventar las conexiones.",
        );
      }
    };
    ctx.root.addEventListener("click", click);
    ctx.onCleanup(() => ctx.root.removeEventListener("click", click));
    ctx.root.querySelectorAll<HTMLElement>("[data-module]").forEach((b) =>
      b.addEventListener("click", () =>
        open(
          modules.findIndex((m) => m.id === b.dataset.module),
          true,
        ),
      ),
    );
    passport();
    open(active);
  },
};
