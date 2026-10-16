import { character } from "../characters/characters";
import { button, note } from "../ui/components";
import type { Chapter } from "../types";
const steps = [
  {
    actor: "tutor",
    title: "El Tutor recibe la duda",
    text: "El alumno pregunta por una condición de salida. El Tutor conserva su contexto y sus reglas pedagógicas.",
  },
  {
    actor: "rag",
    title: "RAG encuentra el respaldo",
    text: "RAG selecciona un fragmento del material de esa cohorte. Gati no decide qué apunte es relevante.",
  },
  {
    actor: "gati",
    title: "Gati resuelve el destino",
    text: "Se aplica la configuración correspondiente a TUTOR y al curso: principal y respaldos elegibles.",
  },
  {
    actor: "gati",
    title: "Una intención durable",
    text: "En esta simulación con observación habilitada, guardamos el ticket antes de entrar al adaptador.",
  },
  {
    actor: "provider",
    title: "El principal A falla",
    text: "Un error de disponibilidad permite considerar el siguiente candidato. El tiempo sigue corriendo.",
  },
  {
    actor: "provider",
    title: "El respaldo B responde",
    text: "Todavía queda plazo. B entrega una respuesta válida y conservamos su evidencia física.",
  },
  {
    actor: "gati",
    title: "Dos intentos, una consulta",
    text: "Guardamos modelo, credencial, resultado, uso y calidad del costo de cada intento; no inventamos consumo cero.",
  },
  {
    actor: "tutor",
    title: "El Tutor entrega una pista",
    text: "«Revisá qué variable cambia y cuándo la condición deja de cumplirse». La decisión pedagógica sigue siendo del Tutor.",
  },
] as const;
export const finaleChapter: Chapter = {
  id: "final",
  label: "La gran misión",
  title: "La ciudad trabaja en equipo.",
  eyebrow: "10 / LA GRAN MISIÓN FINAL",
  subtitle:
    "Un alumno, una duda y varios especialistas. Explorá cada paso o dejá que la misión avance sola.",
  render: () =>
    `<div class="simulation-ribbon">SIMULACIÓN INTEGRADORA · OBSERVACIÓN DURABLE ILUSTRADA</div><div class="scene-board finale-board"><div class="final-route">${["tutor", "rag", "gati", "provider"].map((k, i) => `<button data-final-node="${i}" class="final-node">${character(k as "tutor")}<b>${["Tutor", "RAG", "Gati", "A → B"][i]}</b></button>`).join('<span class="route-arrow">➜</span>')}</div><div class="mission-display"><span id="mission-number">PASO 01 / 08</span><h3 id="mission-title">${steps[0].title}</h3><p id="mission-text">${steps[0].text}</p></div><div class="mission-steps" role="group" aria-label="Explorar pasos">${steps.map((s, i) => `<button data-step="${i}" aria-label="Paso ${i + 1}: ${s.title}" aria-pressed="${i === 0}" class="${i === 0 ? "current" : ""}">${i + 1}</button>`).join("")}</div></div><div class="scene-controls">${button("▶ Reproducir misión", "play")}${button("Siguiente paso →", "step", true)}${button("Repetir ↻", "replay", true)}</div>${note("No todos los módulos recorren el mismo camino: Evaluador, Calibración y Moderación mantienen sus perfiles y circuitos específicos.")}`,
  mount: (ctx) => {
    let step = 0,
      playing = false,
      timer = 0;
    const play = ctx.root.querySelector<HTMLButtonElement>(
      '[data-action="play"]',
    )!;
    const show = (n: number) => {
      step = n;
      ctx.root.querySelector("#mission-number")!.textContent =
        `PASO ${String(n + 1).padStart(2, "0")} / 08`;
      ctx.root.querySelector("#mission-title")!.textContent = steps[n].title;
      ctx.root.querySelector("#mission-text")!.textContent = steps[n].text;
      ctx.root.querySelectorAll<HTMLElement>("[data-step]").forEach((x) => {
        x.classList.toggle("current", Number(x.dataset.step) === n);
        x.setAttribute("aria-pressed", String(Number(x.dataset.step) === n));
      });
      const nodes = ctx.root.querySelectorAll(".final-node");
      nodes.forEach((x) => x.classList.remove("active"));
      nodes[[0, 1, 2, 2, 3, 3, 2, 0][n]].classList.add("active");
      if (n === 7) {
        playing = false;
        clearTimeout(timer);
        play.textContent = "▶ Reproducir misión";
        ctx.complete();
        ctx.finishAdventure();
        ctx.sparkle();
        ctx.say(
          "¡Misión cumplida! Invocar bien también es un trabajo en equipo.",
        );
      }
    };
    const tick = () => {
      if (!playing) return;
      if (step < 7) {
        show(step + 1);
        if (playing) timer = window.setTimeout(tick, 3000);
      }
    };
    play.addEventListener("click", () => {
      if (step === 7) show(0);
      playing = !playing;
      play.textContent = playing ? "Ⅱ Pausar misión" : "▶ Continuar misión";
      if (playing) timer = window.setTimeout(tick, 2000);
      else clearTimeout(timer);
    });
    ctx.root
      .querySelector('[data-action="step"]')!
      .addEventListener("click", () => {
        playing = false;
        clearTimeout(timer);
        play.textContent = "▶ Continuar misión";
        show(Math.min(7, step + 1));
      });
    ctx.root
      .querySelector('[data-action="replay"]')!
      .addEventListener("click", () => {
        playing = false;
        clearTimeout(timer);
        play.textContent = "▶ Reproducir misión";
        show(0);
      });
    ctx.root.querySelectorAll<HTMLElement>("[data-step]").forEach((x) =>
      x.addEventListener("click", () => {
        playing = false;
        clearTimeout(timer);
        play.textContent = "▶ Continuar misión";
        show(Number(x.dataset.step));
      }),
    );
    ctx.root.querySelectorAll<HTMLElement>("[data-final-node]").forEach((x) =>
      x.addEventListener("click", () => {
        playing = false;
        clearTimeout(timer);
        play.textContent = "▶ Continuar misión";
        show([0, 1, 2, 4][Number(x.dataset.finalNode)]);
      }),
    );
    ctx.onCleanup(() => clearTimeout(timer));
    show(0);
  },
};
