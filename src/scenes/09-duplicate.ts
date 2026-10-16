import { character } from "../characters/characters";
import { button, note } from "../ui/components";
import { introduction, guidance } from "../ui/narrative";
import { TicketDemo } from "../simulators/models";
import type { Chapter } from "../types";
export const duplicateChapter: Chapter = {
  id: "duplicados",
  label: "El misterio",
  title: "El caso del doble clic sospechoso.",
  eyebrow: "09 / GATI, DETECTIVE DE TICKETS",
  subtitle:
    "Se perdió la respuesta. ¿Mandamos otra vez el mismo trabajo? Primero, revisemos su identidad.",
  render: () =>
    `${introduction("Se perdió la respuesta, no necesariamente el trabajo.", "Imaginá que mandás una consulta, la pantalla no responde y volvés a tocar Enviar. Antes de autorizar otro envío, Gati busca el número del ticket. La misma identidad permite reconocer que es la misma operación.", "Pulsá Enviar y después volvé a pulsarlo. Mirá cómo aumenta el contador de duplicados sin agregar una autorización. También podés cancelar durante la reserva previa o confirmar cuando llega evidencia.")}<div id="duplicate-guide">${guidance("1 · Empezá con un envío", "Vamos a guardar una reserva antes de autorizar la llamada al proveedor.")}</div><div class="simulation-ribbon">SIMULACIÓN DE IDEMPOTENCIA Y RECUPERACIÓN · SIN COBROS REALES</div><div class="scene-board duplicate-board"><div class="detective">${character("gati")}<span class="magnifier">⌕</span></div><div class="big-ticket"><div class="ticket-top">UNA MISMA IDENTIDAD</div><b>#GATI-0042</b><p>Una consulta · mismo contenido y condiciones</p><strong id="ticket-state">Esperando el primer envío</strong><div class="duplicate-counts"><span><b id="dispatch-count">0</b> autorizaciones de envío</span><span><b id="duplicate-count">0</b> duplicados detectados</span></div></div><p class="step-caption" id="duplicate-status" role="status">Pulsá Enviar: primero reservamos, después intentamos.</p></div><div class="scene-controls">${button("Enviar la misma consulta ✉", "send")}${button("Llegó evidencia válida ✓", "resolve", true)}${button("Cancelar antes de enviar", "release", true)}${button("Nuevo caso ↻", "reset", true)}</div><div class="state-trail"><span data-stage="held">Reserva</span><i>→</i><span data-stage="exposed">Posiblemente enviada</span><i>→</i><span data-stage="confirmed">Confirmada</span><span data-stage="released">Liberada, si corresponde</span></div>${note("Idempotencia: repetir una solicitud con la misma identidad no debería duplicar su efecto. Si cambian sus condiciones, no es un replay válido.")}<p class="fineprint">Una operación posiblemente enviada retiene su reserva mientras falta evidencia; no se libera solo porque pasó el tiempo ni se reenvía automáticamente. Esta escena ilustra el núcleo interno, no un cobro real del Tutor.</p>`,
  mount: (ctx) => {
    let sim = new TicketDemo(),
      generation = 0;
    const status = ctx.root.querySelector("#duplicate-status")!;
    const update = () => {
      const help = {
        idle: [
          "1 · Empezá con un envío",
          "Reservar es apartar capacidad para esta operación antes de autorizar el envío.",
        ],
        held: [
          "2 · La reserva ya tiene identidad",
          "Ahora podés repetir el clic: Gati verá el mismo ticket. O cancelá antes de que pasen los 3,5 segundos ficticios del envío.",
        ],
        exposed: [
          "3 · Puede haberse enviado: no empezamos de cero",
          "Repetí Enviar y mirá el contador: no se autoriza otra vez. El botón de evidencia representa información que llega después y permite confirmar.",
        ],
        confirmed: [
          "4 · Cierre confirmado",
          "Un nuevo clic con la misma identidad conserva este cierre. Nuevo caso abre otra demostración, no reenvía este ticket.",
        ],
        released: [
          "Reserva liberada antes del envío",
          "No se autorizó el trabajo físico. Este ticket queda cerrado; usá Nuevo caso si querés repetir la demostración.",
        ],
      }[sim.state];
      ctx.root.querySelector("#duplicate-guide")!.innerHTML = guidance(
        help[0],
        help[1],
      );
      ctx.root.querySelector("#dispatch-count")!.textContent = String(
        sim.dispatches,
      );
      ctx.root.querySelector("#duplicate-count")!.textContent = String(
        sim.duplicates,
      );
      ctx.root.querySelector("#ticket-state")!.textContent = {
        idle: "Esperando el primer envío",
        held: "Reserva guardada",
        exposed: "Puede haberse enviado · conservamos la reserva",
        confirmed: "Operación confirmada",
        released: "Reserva liberada antes del envío",
      }[sim.state];
      ctx.root
        .querySelectorAll<HTMLElement>("[data-stage]")
        .forEach((x) =>
          x.classList.toggle("current", x.dataset.stage === sim.state),
        );
      ctx.root.querySelector<HTMLButtonElement>(
        '[data-action="resolve"]',
      )!.disabled = sim.state !== "exposed";
      ctx.root.querySelector<HTMLButtonElement>(
        '[data-action="release"]',
      )!.disabled = sim.state !== "held";
    };
    ctx.root
      .querySelector('[data-action="send"]')!
      .addEventListener("click", () => {
        if (sim.send()) {
          const current = generation;
          status.textContent =
            "Reserva guardada. Hay un breve momento para cancelar antes del envío.";
          ctx.later(() => {
            if (current !== generation) return;
            if (sim.dispatch())
              status.textContent =
                "La respuesta se perdió. Pulsá Enviar otra vez: el ticket ya existe.";
            update();
          }, 3500);
        } else {
          status.textContent =
            sim.state === "released"
              ? "Ese ticket ya está cerrado: no lo reabrimos con un doble clic."
              : "¡Un momento! Esa consulta ya tiene ticket. No autorizamos otra vez el mismo trabajo.";
          ctx.complete();
          ctx.sparkle();
        }
        update();
      });
    ctx.root
      .querySelector('[data-action="resolve"]')!
      .addEventListener("click", () => {
        sim.resolve();
        status.textContent =
          "La evidencia permite confirmar una vez. El replay conserva el mismo cierre.";
        update();
      });
    ctx.root
      .querySelector('[data-action="release"]')!
      .addEventListener("click", () => {
        sim.release();
        status.textContent =
          "No hubo autorización física. Podemos liberar la reserva de este caso.";
        update();
      });
    ctx.root
      .querySelector('[data-action="reset"]')!
      .addEventListener("click", () => {
        generation++;
        sim = new TicketDemo();
        status.textContent =
          "Nuevo caso. Podés probar el doble clic o cancelar antes del envío.";
        update();
      });
    update();
  },
};
