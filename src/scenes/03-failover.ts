import {
  actor,
  route,
  button,
  note,
  choices,
  bindChoices,
} from "../ui/components";
import { introduction, guidance } from "../ui/narrative";
import { simulateTutor, type Failure } from "../simulators/models";
import type { Chapter } from "../types";
const scenarios: Record<string, Failure[]> = {
  a: ["success"],
  b: ["provider-error", "success"],
  c: ["provider-error", "rate-limit", "success"],
  none: ["provider-error", "provider-error", "provider-error"],
  invalid: ["invalid", "success"],
  timeout: ["timeout", "success"],
};
const names: Record<string, string> = {
  a: "A responde",
  b: "A falla → B",
  c: "A y B fallan → C",
  none: "Todos fallan",
  invalid: "Respuesta inválida",
  timeout: "Se agota el tiempo",
};
export const failoverChapter: Chapter = {
  id: "respaldos",
  label: "Los respaldos",
  title: "Plan A. Plan B. ¡Plan C!",
  eyebrow: "03 / EL ARTE DE NO ENTRAR EN PÁNICO",
  subtitle:
    "Si el principal tiene un fallo que lo permite, Gati puede probar el respaldo configurado.",
  render: () =>
    `${introduction("Una alternativa lista antes de que algo salga mal.", "El principal es el primer modelo elegido. Si no está disponible, un respaldo configurado puede atender la misma consulta: eso es failover. Evita que un problema de disponibilidad corte toda la ayuda. No sirve para saltear cualquier error: si la respuesta es inválida, TUTOR se detiene en lugar de buscar otro modelo.", "Primero elegí qué va a pasar. Después enviá una consulta y mirá a quién llama Gati. Cada caso arranca de cero.")}<div class="failover-content"><h2 class="experiment-heading" tabindex="-1">Elegí un caso y mandá una consulta.</h2>${guidance("El reloj es de una consulta completa", "Los 6 segundos ficticios son su límite total de espera: A, B y C comparten ese tiempo. Cambiar de caso inicia otra ejecución, con el reloj lleno.")}${choices(Object.entries(names).map(([value, label]) => ({ value, label })))}<div class="scene-board failover-board"><span class="execution-label" id="execution-label">CASO: A responde · listo para empezar</span><div class="deadline"><span>◷ LÍMITE TOTAL DE ESPERA</span><div class="time-rail" role="meter" aria-label="Tiempo disponible de la consulta" aria-valuemin="0" aria-valuemax="6" aria-valuenow="6"><i id="time-fill"></i></div><b id="time-value">6,0 s disponibles</b></div>${route([actor("provider", "A · Principal", "candidate-A"), actor("provider", "B · Respaldo", "candidate-B"), actor("provider", "C · Respaldo", "candidate-C")])}<div class="gati-conductor">${actor("gati", "Gati coordina")}</div><div class="candidate-delivery" aria-hidden="true">✉</div><div id="failover-log" class="event-log" role="log" aria-label="Recorrido de candidatos"><p>Una nueva consulta. Todavía no llamamos a nadie.</p></div></div><div class="scene-controls">${button("Enviar esta consulta →", "simulate")}${button("Repetir este caso ↻", "repeat", true)}</div><p class="case-conclusion" id="case-conclusion" role="status">Probá primero A responde y después compará con un caso que necesite respaldo.</p>${note("Si la respuesta es inválida o se alcanza un límite del propio Gateway, TUTOR se detiene. Si se termina el tiempo, no se inicia otro candidato.")}<p class="fineprint">Un 429 puede permitir otro candidato sin marcar al proveedor como caído. Esta cadena es de TUTOR: EVALUATOR conserva un único destino y no hereda sus respaldos. Reloj y tiempos ilustrativos.</p></div>`,
  mount: (ctx) => {
    let selected = "a",
      running = false,
      execution = 0;
    const fill = ctx.root.querySelector<HTMLElement>("#time-fill")!;
    const log = ctx.root.querySelector("#failover-log")!;
    const clock = (remaining: number, animate = false) => {
      fill.style.transition = animate ? "width 1.25s linear" : "none";
      fill.style.width = `${(remaining / 6) * 100}%`;
      ctx.root.querySelector("#time-value")!.textContent =
        `${remaining.toFixed(1).replace(".", ",")} s ${animate ? "restantes" : "disponibles"}`;
      fill.parentElement!.setAttribute("aria-valuenow", String(remaining));
    };
    const reset = () => {
      clock(6);
      ctx.root
        .querySelectorAll(".actor")
        .forEach((x) =>
          x.classList.remove("failed", "active", "succeeded", "waiting-result"),
        );
      ctx.root
        .querySelectorAll(".actor-status")
        .forEach((x) => (x.textContent = "Sin llamar"));
      ctx.root.querySelector<HTMLElement>(".candidate-delivery")!.className =
        "candidate-delivery";
      log.innerHTML = "<p>Una nueva consulta. Todavía no llamamos a nadie.</p>";
      ctx.root.querySelector("#execution-label")!.textContent =
        `CASO: ${names[selected]} · listo para empezar`;
      ctx.root.querySelector("#case-conclusion")!.textContent =
        "Ahora pulsá Enviar. Mirá qué modelo recibe el pedido y cuáles quedan sin llamar.";
    };
    bindChoices(ctx.root, (v) => {
      selected = v;
      reset();
    });
    const controls = (disabled: boolean) =>
      ctx.root
        .querySelectorAll<HTMLButtonElement>(
          ".choices button,.scene-controls button",
        )
        .forEach((b) => (b.disabled = disabled));
    const run = () => {
      if (running) return;
      reset();
      running = true;
      controls(true);
      execution++;
      ctx.root.querySelector("#execution-label")!.textContent =
        `EJECUCIÓN ${execution} · ${names[selected]}`;
      const result = simulateTutor(scenarios[selected]);
      log.innerHTML = "";
      const labels: Record<Failure, string> = {
        success: "✓ Respuesta válida. La consulta vuelve al Tutor.",
        "provider-error":
          "✕ Error de disponibilidad. No llegó una respuesta válida.",
        "rate-limit":
          "⌛ Capacidad limitada (429). Podemos pasar al siguiente.",
        invalid: "⛔ Respuesta inválida: este error detiene el recorrido.",
        timeout: "◷ Se agotó la espera total. No iniciamos B.",
        budget: "⛔ Límite del Gateway: detenemos el recorrido.",
        "access-denied":
          "⛔ Acceso rechazado: haría falta un acceso independiente.",
      };
      result.attempts.forEach((a, i) => {
        ctx.later(
          () => {
            const node = ctx.root.querySelector("#candidate-" + a.candidate)!;
            node.classList.add("active", "waiting-result");
            node.querySelector(".actor-status")!.textContent =
              "✉ Recibiendo consulta…";
            const mail = ctx.root.querySelector<HTMLElement>(
              ".candidate-delivery",
            )!;
            mail.className = "candidate-delivery";
            void mail.offsetWidth;
            mail.style.setProperty("--candidate", String(i));
            mail.classList.add("flying");
            log.insertAdjacentHTML(
              "beforeend",
              `<p><span>${a.candidate}</span> Gati envía el pedido${i ? " al siguiente respaldo configurado" : ""}.</p>`,
            );
            clock(Math.max(0, 6 - a.elapsed), true);
          },
          250 + i * 2300,
        );
        ctx.later(
          () => {
            const node = ctx.root.querySelector("#candidate-" + a.candidate)!;
            node.classList.remove("active", "waiting-result");
            node.classList.add(a.result === "success" ? "succeeded" : "failed");
            node.querySelector(".actor-status")!.textContent =
              a.result === "success"
                ? "✓ ¡Respondí!"
                : a.result === "timeout"
                  ? "◷ Se terminó el tiempo"
                  : a.result === "invalid"
                    ? "⛔ Hay que detenerse"
                    : "✕ No pude responder";
            log.insertAdjacentHTML(
              "beforeend",
              `<p><span>${a.candidate}</span> ${labels[a.result]}</p>`,
            );
          },
          1700 + i * 2300,
        );
      });
      ctx.later(() => {
        running = false;
        controls(false);
        const msg =
          result.status === "success"
            ? "Consulta resuelta. Solo se llamó a los candidatos necesarios."
            : result.status === "stopped"
              ? "Nos detenemos: cambiar de modelo no arregla este tipo de error."
              : result.status === "deadline"
                ? "Se terminó el tiempo de esta consulta. No queda permiso para empezar otro intento."
                : "Se agotaron los candidatos. El Tutor recibe una indisponibilidad controlada.";
        ctx.root.querySelector("#case-conclusion")!.textContent =
          msg + " Elegí otro caso: será una nueva ejecución.";
        ctx.say(msg);
        ctx.complete(selected);
      }, result.attempts.length * 2300);
    };
    ctx.root
      .querySelectorAll(".scene-controls button")
      .forEach((b) => b.addEventListener("click", run));
    reset();
  },
};
