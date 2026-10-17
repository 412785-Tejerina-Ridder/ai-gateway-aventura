import { character } from "../characters/characters";
import { button, note } from "../ui/components";
import { introduction, guidance } from "../ui/narrative";
import { reserveBoardHeight, reserveLabelWidth } from "../ui/stability";
import type { Chapter } from "../types";
const tickets = [
  {
    id: "F-101",
    title: "El proveedor informó los tokens",
    text: "GPT-4.1 (OpenAI) · llave GLOBAL-7 · 240 tokens de entrada / 60 de salida · 1,2 s · respuesta válida · precio aplicable.",
    seal: "USO INFORMADO · COSTO CALCULABLE",
    explanation:
      "El proveedor dio los datos de uso y hay un precio aplicable. Gati puede calcular un costo y conservar cómo lo obtuvo. Eso no es una factura conciliada.",
  },
  {
    id: "F-102",
    title: "El uso solo pudo aproximarse",
    text: "Claude Sonnet (Anthropic) · llave COURSE-4 · cantidad aproximada a partir del texto · 1,8 s · precio aplicable.",
    seal: "ESTIMADO",
    explanation:
      "Hay una aproximación del uso. Gati la guarda como estimación, sin convertirla en un dato informado por el proveedor.",
  },
  {
    id: "F-103",
    title: "Se cortó la comunicación",
    text: "GPT-4.1 (OpenAI) · llave GLOBAL-7 · espera agotada · sin tokens conocidos ni un costo defendible.",
    seal: "DESCONOCIDO",
    explanation:
      "No sabemos cuánto trabajó el proveedor antes del corte. Gati conserva esa incertidumbre: un timeout no prueba consumo cero.",
  },
];
export const notebookChapter: Chapter = {
  id: "cuaderno",
  label: "Los tickets",
  title: "El cuaderno que no se olvida.",
  eyebrow: "08 / ANOTAR ANTES, COMPLETAR DESPUÉS",
  subtitle:
    "Un intento deja una huella. Gati guarda lo que sabe y distingue lo que solo estima o desconoce.",
  render: () =>
    `${introduction("El ticket es evidencia, no un papel para decorar.", "En el registro durable, Gati guarda que está por intentar una invocación antes de entrar al adaptador del proveedor. Después completa el resultado, el tiempo y los datos de consumo que pudo obtener. Así una caída del programa no borra la evidencia persistida.", "Solo avanzá la demostración. No elegís sellos ni decidís costos: vamos a observar tres casos y ver por qué Gati los registra de manera diferente.")}<div class="simulation-ribbon">DEMOSTRACIÓN DEL REGISTRO DURABLE · TICKETS FICTICIOS</div><div id="notebook-explanation">${guidance("Antes del primer intento", "Gati prepara una identidad y registra la intención. Todavía no sabe si el proveedor responderá ni cuánto consumirá.")}</div><div class="notebook-layout"><div class="notebook-keeper">${character("gati")}<p>«Anoto primero.<br>No invento después.»</p><div class="notebook-facts"><span>✓ Modelo y proveedor</span><span>✓ Identidad de la credencial</span><span>✓ Tiempo y resultado</span><span>✓ Uso y precio, si se conocen</span><span>⊘ Sin prompts ni secretos</span></div></div><div class="ticket-desk">${tickets.map((t, i) => `<div class="paper-ticket ticket-unobserved" data-ticket="${t.id}"><span class="ticket-number">INTENTO ${t.id}</span><h3>${i + 1} · Esperando observar este intento</h3><p class="ticket-evidence">Todavía no mostramos su resultado.</p><span class="evidence-seal" hidden></span></div>`).join("")}</div></div><div class="scene-controls">${button("1 · Observar el primer intento →", "advance")}${button("Simular un reinicio ⏻", "restart", true)}${button("Repetir la demostración ↻", "replay", true)}</div><p id="notebook-status" class="step-caption" role="status">Los tickets se completan con evidencia. No hay respuestas para adivinar.</p>${note("«Uso informado» permite un costo calculable si hay precio aplicable. No significa factura conciliada ni cargo lógico confirmado.")}<p class="fineprint">Demostración del mecanismo interno con observación durable. Una intención anotada no demuestra que el proveedor la recibió. El registro físico y la reserva lógica conservan estados distintos.</p>`,
  mount: (ctx) => {
    let shown = 0,
      restarting = false,
      generation = 0;
    const next = ctx.root.querySelector<HTMLButtonElement>(
      '[data-action="advance"]',
    )!;
    const restart = ctx.root.querySelector<HTMLButtonElement>(
      '[data-action="restart"]',
    )!;
    const explain = (title: string, text: string) =>
      (ctx.root.querySelector("#notebook-explanation")!.innerHTML = guidance(
        title,
        text,
      ));
    const fill = (row: HTMLElement, t: (typeof tickets)[number]) => {
      row.classList.remove("ticket-unobserved");
      row.classList.add("sorted");
      row.querySelector("h3")!.textContent = t.title;
      row.querySelector(".ticket-evidence")!.textContent = t.text;
      const seal = row.querySelector<HTMLElement>(".evidence-seal")!;
      seal.hidden = false;
      seal.textContent = t.seal;
    };
    // Reserve the space of the fullest desk so revealing tickets never pushes the controls.
    const layout = ctx.root.querySelector<HTMLElement>(".notebook-layout");
    if (layout)
      ctx.onCleanup(
        reserveBoardHeight(
          layout,
          tickets.map((_, current) => (clone: HTMLElement) =>
            tickets.forEach((t, i) => {
              const row = clone.querySelector<HTMLElement>(`[data-ticket="${t.id}"]`)!;
              row.classList.toggle("ticket-current", i === current);
              if (i <= current) fill(row, t);
            }),
          ),
        ),
      );
    ctx.onCleanup(
      reserveLabelWidth(next, [
        "1 · Observar el primer intento →",
        "2 · Observar el siguiente intento →",
        "3 · Observar el siguiente intento →",
        "Tres casos observados ✓",
      ]),
    );
    next.addEventListener("click", () => {
      if (shown >= 3) return;
      const t = tickets[shown];
      const row = ctx.root.querySelector<HTMLElement>(
        `[data-ticket="${t.id}"]`,
      )!;
      ctx.root
        .querySelectorAll(".paper-ticket")
        .forEach((x) => x.classList.remove("ticket-current"));
      row.classList.remove("ticket-unobserved");
      fill(row, t);
      row.classList.add("ticket-current");
      shown++;
      explain(`${shown} · ${t.seal}`, t.explanation);
      ctx.root.querySelector("#notebook-status")!.textContent =
        `${shown} de 3 intentos observados. ${shown === 3 ? "Ahora podés simular un reinicio y mirar qué evidencia reaparece." : "Seguí para comparar con otro tipo de evidencia."}`;
      next.textContent =
        shown === 3
          ? "Tres casos observados ✓"
          : `${shown + 1} · Observar el siguiente intento →`;
      next.disabled = shown === 3;
      restart.disabled = shown !== 3;
      if (shown === 3) {
        ctx.complete();
        ctx.say(
          "El cuaderno conserva tanto las certezas como los límites de lo que sabemos. Desconocido no significa gratis.",
        );
      }
    });
    restart.disabled = true;
    restart.addEventListener("click", () => {
      if (restarting) return;
      restarting = true;
      restart.disabled = true;
      const token = generation;
      ctx.root
        .querySelector(".ticket-desk")!
        .classList.add("notebook-restarting");
      explain(
        "El programa se cierra y vuelve a abrirse…",
        "En esta simulación, la información ya había sido persistida. No necesitamos inventar datos ni llamar otra vez al proveedor para recuperar esa evidencia.",
      );
      ctx.root.querySelector("#notebook-status")!.textContent =
        "⏻ Reabriendo el cuaderno…";
      ctx.later(() => {
        if (token !== generation) return;
        ctx.root
          .querySelector(".ticket-desk")!
          .classList.remove("notebook-restarting");
        explain(
          "Volvió el programa. La evidencia sigue acá.",
          "Reaparecen los mismos tres intentos, con su modelo, credencial y calidad de información. Recuperar registros no convierte un costo desconocido en conocido ni autoriza otro envío.",
        );
        ctx.root.querySelector("#notebook-status")!.textContent =
          "✓ Mismos tickets, misma evidencia. No se creó otro intento.";
        restarting = false;
        restart.disabled = false;
        ctx.sparkle();
      }, 1600);
    });
    ctx.root
      .querySelector('[data-action="replay"]')!
      .addEventListener("click", () => {
        generation++;
        shown = 0;
        restarting = false;
        ctx.root
          .querySelector(".ticket-desk")!
          .classList.remove("notebook-restarting");
        tickets.forEach((t, i) => {
          const row = ctx.root.querySelector<HTMLElement>(
            `[data-ticket="${t.id}"]`,
          )!;
          row.className = "paper-ticket ticket-unobserved";
          row.querySelector("h3")!.textContent =
            `${i + 1} · Esperando observar este intento`;
          row.querySelector(".ticket-evidence")!.textContent =
            "Todavía no mostramos su resultado.";
          row.querySelector<HTMLElement>(".evidence-seal")!.hidden = true;
        });
        next.disabled = false;
        next.textContent = "1 · Observar el primer intento →";
        restart.disabled = true;
        explain(
          "Antes del primer intento",
          "Gati registra la intención y después completa lo que pueda saber. Observá el primer caso para empezar.",
        );
        ctx.root.querySelector("#notebook-status")!.textContent =
          "Nueva demostración. No tenés que elegir ni adivinar sellos.";
      });
  },
};
