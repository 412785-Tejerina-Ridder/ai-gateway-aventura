import { actor, route, button, note } from "../ui/components";
import { introduction, guidance } from "../ui/narrative";
import type { Chapter } from "../types";
export const economyChapter: Chapter = {
  id: "economia",
  label: "Las monedas",
  title: "Una consulta. Dos intentos. Dos cuentas distintas.",
  eyebrow: "07 / LA IA TAMBIÉN CONSUME",
  subtitle:
    "Una pregunta del alumno puede necesitar más de una llamada a proveedores. Esas dos cosas no se cuentan igual.",
  render: () =>
    `${introduction("Vamos a seguir una pregunta y mirar dos cuadernos.", "A la izquierda contamos el trabajo enviado a proveedores: cada intento puede generar consumo. A la derecha seguimos la operación educativa: la única consulta que hizo el alumno. Su reserva y un posible cargo interno tienen reglas propias.", "Avanzá cuatro momentos de una misma consulta: llega la pregunta, falla A, responde B y comparamos los registros. Las monedas son ficticias; no estás eligiendo ni aplicando un cobro.")}<div class="simulation-ribbon">LABORATORIO DIDÁCTICO · SIN DESCUENTOS REALES A ALUMNOS</div><div class="scene-board economy-board">${route([actor("tutor", "Consulta del alumno", "economy-student"), actor("provider", "Intento A", "economy-A"), actor("provider", "Intento B", "economy-B")])}<div class="economy-ledgers"><div class="physical-wallet"><span class="ledger-icon">◉</span><h3>¿Cuántos intentos hicieron los proveedores?</h3><div id="physical-coins" class="coins"></div><b id="physical-total">0 intentos</b><p id="physical-detail">Todavía no enviamos nada a ningún proveedor.</p></div><div class="logical-wallet"><span class="ledger-icon">▤</span><h3>¿Qué operación educativa estamos siguiendo?</h3><div id="logical-ticket" class="one-ticket">ESPERANDO UNA CONSULTA</div><b id="logical-total">0 consultas</b><p id="logical-detail">Este registro sigue la operación y su reserva, no suma automáticamente un cargo por cada intento.</p></div></div><p class="step-caption" id="economy-step" role="status">Todavía no empezó el ejemplo. Tocá “Llega una consulta”.</p></div><div class="scene-controls">${button("1 · Llega una consulta →", "play")}${button("Volver al inicio ↻", "replay", true)}</div><div id="economy-explanation">${guidance("Primero mirá los títulos de los dos cuadernos", "Cada uno responde una pregunta distinta. Los vamos a completar juntos, sin decidir tarifas ni descuentos.")}</div>${note("Tokens: pequeñas unidades que miden texto procesado. Con el uso y un precio aplicable podemos calcular un costo, distinguiendo datos informados, estimados o desconocidos.")}<p class="fineprint">Simulación del mecanismo interno. No representa tarifas aprobadas ni cargos reales. Una autorización única del Gateway no garantiza una sola request dentro de un SDK externo.</p>`,
  mount: (ctx) => {
    let step = 0;
    const next = ctx.root.querySelector<HTMLButtonElement>(
      '[data-action="play"]',
    )!;
    const explain = (title: string, text: string) =>
      (ctx.root.querySelector("#economy-explanation")!.innerHTML = guidance(
        title,
        text,
      ));
    const reset = () => {
      step = 0;
      next.disabled = false;
      next.textContent = "1 · Llega una consulta →";
      ctx.root
        .querySelectorAll(".actor")
        .forEach((x) => x.classList.remove("active", "failed", "succeeded"));
      ctx.root.querySelector("#physical-coins")!.innerHTML = "";
      ctx.root.querySelector("#physical-total")!.textContent = "0 intentos";
      ctx.root.querySelector("#physical-detail")!.textContent =
        "Todavía no enviamos nada.";
      ctx.root.querySelector("#logical-total")!.textContent = "0 consultas";
      ctx.root.querySelector("#logical-ticket")!.textContent =
        "ESPERANDO UNA CONSULTA";
      ctx.root
        .querySelector("#logical-ticket")!
        .classList.remove("ticket-stamped");
      ctx.root.querySelector("#economy-step")!.textContent =
        "Nueva demostración. Empezamos sin consultas ni intentos.";
      explain(
        "Empezamos por la pregunta del alumno",
        "Después vamos a separar cuántos intentos generó de cuántas consultas educativas hizo.",
      );
    };
    next.addEventListener("click", () => {
      step++;
      if (step === 1) {
        ctx.root.querySelector("#economy-student")!.classList.add("active");
        ctx.root.querySelector("#logical-total")!.textContent =
          "1 sola consulta";
        ctx.root.querySelector("#logical-ticket")!.textContent =
          "CONSULTA #F-042";
        ctx.root.querySelector("#economy-step")!.textContent =
          "El alumno hizo una pregunta. Abrimos una operación educativa para seguirla.";
        explain(
          "1 · Una consulta todavía no es un intento físico",
          "El cuaderno de la derecha ya tiene una identidad. El de la izquierda sigue vacío: aún no hablamos con el proveedor.",
        );
        next.textContent = "2 · Gati intenta con A →";
      }
      if (step === 2) {
        ctx.root.querySelector("#economy-A")!.classList.add("failed");
        ctx.root.querySelector("#physical-coins")!.innerHTML =
          '<span class="coin">A</span>';
        ctx.root.querySelector("#physical-total")!.textContent =
          "1 intento físico";
        ctx.root.querySelector("#physical-detail")!.textContent =
          "A falló. Su consumo es desconocido: ?";
        ctx.root.querySelector("#economy-step")!.textContent =
          "A recibió un intento, pero no conseguimos una respuesta válida.";
        explain(
          "2 · Que falle no demuestra que sea gratis",
          "El proveedor pudo haber trabajado antes del error. Guardamos el intento y reconocemos que no sabemos su costo. La consulta del alumno sigue siendo la misma.",
        );
        next.textContent = "3 · El respaldo B responde →";
      }
      if (step === 3) {
        ctx.root.querySelector("#economy-B")!.classList.add("succeeded");
        ctx.root
          .querySelector("#physical-coins")!
          .insertAdjacentHTML("beforeend", '<span class="coin">B</span>');
        ctx.root.querySelector("#physical-total")!.textContent =
          "2 intentos físicos";
        ctx.root.querySelector("#physical-detail")!.textContent =
          "A = ? · B = 3 fichas ficticias. Conocemos una parte, no el costo total.";
        ctx.root.querySelector("#economy-step")!.textContent =
          "B responde. Se agregó un intento, no una segunda pregunta del alumno.";
        explain(
          "3 · Dos trabajos físicos para resolver una consulta",
          "La izquierda suma A y B. A la derecha no aparece otra consulta: seguimos dentro de #F-042.",
        );
        next.textContent = "4 · Comparar los cuadernos →";
      }
      if (step === 4) {
        ctx.root
          .querySelector("#logical-ticket")!
          .classList.add("ticket-stamped");
        ctx.root.querySelector("#economy-step")!.textContent =
          "Dos intentos físicos. Una operación educativa. Dos registros con propósitos diferentes.";
        explain(
          "4 · Registrar consumo no equivale a decidir un cobro",
          "El costo del proveedor describe el trabajo físico. La reserva y un posible cargo lógico siguen la identidad y las reglas de la operación. No se deduce un descuento al alumno contando sobrecitos.",
        );
        next.textContent = "Recorrido completo ✓";
        next.disabled = true;
        ctx.complete();
        ctx.say(
          "Una consulta puede necesitar dos intentos. Eso no convierte automáticamente una operación educativa en dos cargos.",
        );
      }
    });
    ctx.root
      .querySelector('[data-action="replay"]')!
      .addEventListener("click", reset);
  },
};
