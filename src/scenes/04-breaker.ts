import { character } from "../characters/characters";
import { button, note } from "../ui/components";
import { introduction, guidance } from "../ui/narrative";
import { BreakerDemo } from "../simulators/models";
import type { Chapter } from "../types";
export const breakerChapter: Chapter = {
  id: "descanso",
  label: "Un descanso",
  title: "Hasta los proveedores necesitan una siesta.",
  eyebrow: "04 / NO MOLESTAR, POR FAVOR",
  subtitle:
    "Una falla aislada puede pasar. Si un proveedor viene fallando, Gati deja de insistir por un rato.",
  render: () =>
    `${introduction("Probemos qué pasa cuando insistir ya no ayuda.", "Cada sobre representa un pedido al proveedor en esta simulación. Gati observa las respuestas: después de varios fallos evita nuevos envíos, espera y permite una prueba de recuperación. Así no agranda el problema con más tráfico.", "Mandá tres pedidos, uno por vez. Después probá mandar otro: vas a ver a Gati frenarlo. La guía te indica cómo seguir.")}<div class="breaker-instruction">${guidance("1 · Mandá el primer pedido", "Este proveedor está fallando. Mirá el sobre viajar y la respuesta volver con error.")}</div><div class="scene-board breaker-board"><div class="breaker-gati">${character("gati")}<span>Gati observa las respuestas.</span><div class="failure-beads" aria-label="Fallos observados"><i>1</i><i>2</i><i>3</i></div></div><div class="vacation-house"><div class="vacation-sign" id="breaker-sign">ABIERTO · trabajando</div><div id="breaker-character">${character("provider")}</div><span class="sleep-z" aria-hidden="true">z Z z</span></div><div class="breaker-request-lane" aria-hidden="true"><span class="lane-track"></span><span class="breaker-envelope">✉</span><span class="breaker-stop">✋</span></div><div class="breaker-stats"><span><b id="physical-count">0</b> pedidos enviados</span><span><b id="skipped-count">0</b> pedidos evitados</span></div><p id="breaker-status" class="step-caption" role="status">Todavía no enviamos pedidos. Cada clic hace un envío.</p></div><div class="scene-controls">${button("Enviar pedido 1 de 3 ✉", "call")}${button("Dejar pasar la espera ◷", "wait", true)}${button("Enviar una prueba de recuperación ✉", "probe", true)}${button("Reiniciar la demostración ↻", "reset", true)}</div><div class="state-trail"><span data-state="working">01 · Trabajando</span><i>→</i><span data-state="resting">02 · Descansando</span><i>→</i><span data-state="probing">03 · Probando</span></div>${note("Circuit breaker: evita insistir con un servicio que falla. Trabaja por proveedor y por instancia. Los tres fallos y la espera comprimida son parte del ejemplo, no valores de producción.")}`,
  mount: (ctx) => {
    let sim = new BreakerDemo(),
      busy = false,
      recovered = false,
      generation = 0;
    const board = ctx.root.querySelector<HTMLElement>(".breaker-board")!;
    const status = ctx.root.querySelector("#breaker-status")!;
    const call = ctx.root.querySelector<HTMLButtonElement>(
      '[data-action="call"]',
    )!;
    const guide = (title: string, text: string) =>
      (ctx.root.querySelector(".breaker-instruction")!.innerHTML = guidance(
        title,
        text,
      ));
    const update = () => {
      ctx.root.querySelector("#physical-count")!.textContent = String(
        sim.calls,
      );
      ctx.root.querySelector("#skipped-count")!.textContent = String(
        sim.skipped,
      );
      ctx.root.querySelector("#breaker-sign")!.textContent = {
        working: recovered ? "ABIERTO · ¡volví!" : "ABIERTO · trabajando",
        resting: "NO MOLESTAR · recuperándome",
        probing: "UNA SOLA PRUEBA · ¿volví?",
      }[sim.state];
      board.dataset.breaker = sim.state;
      ctx.root
        .querySelectorAll<HTMLElement>("[data-state]")
        .forEach((x) =>
          x.classList.toggle("current", x.dataset.state === sim.state),
        );
      ctx.root
        .querySelectorAll(".failure-beads i")
        .forEach((x, i) => x.classList.toggle("observed", i < sim.failures));
      call.disabled = busy || sim.state === "probing";
      call.textContent = recovered
        ? "Enviar otro pedido: ya responde ✉"
        : sim.state === "resting"
          ? "Intentar otro pedido: Gati lo frena ✋"
          : `Enviar pedido ${Math.min(3, sim.calls + 1)} de 3 ✉`;
      ctx.root.querySelector<HTMLButtonElement>(
        '[data-action="wait"]',
      )!.disabled = busy || sim.state !== "resting" || sim.skipped === 0;
      ctx.root.querySelector<HTMLButtonElement>(
        '[data-action="probe"]',
      )!.disabled = busy || sim.state !== "probing";
    };
    const animate = (blocked: boolean, done: () => void) => {
      busy = true;
      const token = generation;
      board.classList.remove("request-sent", "request-blocked");
      void board.offsetWidth;
      board.classList.add(blocked ? "request-blocked" : "request-sent");
      update();
      ctx.later(() => {
        if (token !== generation) return;
        busy = false;
        done();
        update();
      }, 1050);
    };
    call.addEventListener("click", () => {
      const blocked = sim.state === "resting";
      status.textContent = blocked
        ? "Llega otro pedido a Gati… ¿lo dejará pasar?"
        : "✉ Gati envía el pedido y espera la respuesta…";
      animate(blocked, () => {
        const r = sim.request(recovered);
        if (r === "skipped") {
          status.textContent =
            "✋ El sobre no llegó al proveedor. Aumentó “evitados”, no “enviados”.";
          guide(
            "3 · Dejamos que se recupere",
            "Ya comprobaste que Gati evita insistir. Ahora dejá pasar la espera para habilitar una única prueba.",
          );
        } else if (recovered) {
          status.textContent =
            "✓ El proveedor respondió otra vez. Los pedidos vuelven a circular normalmente.";
          guide(
            "¡Recorrido completo!",
            "Observamos fallos, evitamos insistir, probamos la recuperación y volvimos a trabajar. Podés reiniciar la escena.",
          );
        } else if (sim.state === "resting") {
          status.textContent =
            "✕ Tercer fallo. Gati pone el cartel: vamos a dejarlo descansar.";
          guide(
            "2 · Probá mandar un cuarto pedido",
            "El servicio sigue mal. Tocá “Intentar otro pedido” y mirá dónde se detiene el sobre.",
          );
        } else {
          status.textContent = `✕ Falló el pedido ${sim.calls}. Gati conserva esa señal de disponibilidad.`;
          guide(
            `1 · Mandá el pedido ${sim.calls + 1} de 3`,
            "Una falla no basta para contar toda la historia. Volvé a enviar y mirá cómo Gati reúne señales.",
          );
        }
      });
    });
    ctx.root
      .querySelector('[data-action="wait"]')!
      .addEventListener("click", () => {
        sim.wait();
        status.textContent =
          "Pasó la espera. Abrimos una oportunidad de prueba, no todo el tráfico de golpe.";
        guide(
          "4 · Mandá una sola prueba de recuperación",
          "En este caso el proveedor se recuperó. Enviá la prueba para comprobarlo antes de retomar el tráfico habitual.",
        );
        update();
      });
    ctx.root
      .querySelector('[data-action="probe"]')!
      .addEventListener("click", () => {
        status.textContent =
          "✉ Una única consulta de prueba viaja al proveedor…";
        animate(false, () => {
          sim.request(true);
          recovered = true;
          status.textContent =
            "✓ La prueba respondió. Sacamos el cartel y el proveedor vuelve a trabajar.";
          guide(
            "5 · Ya podemos enviar normalmente",
            "Mandá otro pedido para ver que el tráfico vuelve a pasar. Si la prueba hubiera fallado, volvería al descanso.",
          );
          ctx.complete();
          ctx.sparkle();
        });
      });
    ctx.root
      .querySelector('[data-action="reset"]')!
      .addEventListener("click", () => {
        generation++;
        sim = new BreakerDemo();
        busy = false;
        recovered = false;
        board.classList.remove("request-sent", "request-blocked");
        status.textContent = "Nuevo ejemplo. Ningún pedido enviado todavía.";
        guide(
          "1 · Mandá el primer pedido",
          "Cada clic envía un pedido. Vamos a observar tres fallos consecutivos.",
        );
        update();
      });
    update();
  },
};
