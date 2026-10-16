import { character } from "../characters/characters";
import { button, note, choices, bindChoices } from "../ui/components";
import { introduction, guidance } from "../ui/narrative";
import type { Chapter } from "../types";
export const configChapter: Chapter = {
  id: "configuracion",
  label: "Las llaves",
  title: "La llave correcta. El modelo correcto.",
  eyebrow: "06 / ¿A DÓNDE VA ESTA CONSULTA?",
  subtitle:
    "La misma función puede usar una configuración general o una específica del curso. Gati resuelve cuál corresponde.",
  render: () =>
    `${introduction("El destino se prepara antes de que llegue la consulta.", "Los responsables de administración dejan modelos y accesos configurados. Cuando llega un pedido, Gati mira su función y su curso para usar la configuración aplicable. Una llave es el permiso seguro para acceder al proveedor.", "Elegí de dónde viene una consulta TUTOR y seguí sus tres pasos. Este menú cambia el ejemplo que estás mirando; no modifica ninguna configuración real.")}<div class="config-steps state-trail"><span data-config-step="1">1 · Identificar curso</span><i>→</i><span data-config-step="2">2 · Resolver configuración</span><i>→</i><span data-config-step="3">3 · Usar modelo y llave</span></div><div class="scene-board config-board"><div class="config-admin">${character("admin")}<b>Administración ya preparó los destinos</b></div><div class="toy-console"><span class="console-lights">● ● ●</span><h3>¿De dónde viene el pedido TUTOR?</h3>${choices(
      [
        { label: "Ejemplo general", value: "global" },
        { label: "Curso Jardín", value: "course" },
        { label: "Curso sin personalización", value: "inherit" },
      ],
    )}<div class="config-resolution"><span id="config-origin">CONFIGURACIÓN QUE VAMOS A CONSULTAR</span><strong id="config-model">Todavía no resuelta</strong><div class="key-shape">⚿ <span id="config-key">La llave aparecerá al resolver</span><small>El secreto nunca se muestra</small></div></div>${button("1 · Seguir esta consulta →", "resolve")}</div><div class="config-gati">${character("gati")}<span id="config-result" role="status">Elegí un origen y arrancá el recorrido.</span></div></div><div id="config-explanation">${guidance("Tres consultas de ejemplo, no un panel de edición", "Curso Jardín tiene un destino propio: Claude Sonnet y su llave. Un curso sin personalización usa la configuración general: GPT-4.1 y la llave de la plataforma.")}</div>${note("Una credencial propia del curso no vuelve gratuita la IA. Identifica qué acceso se utilizó.")}<p class="fineprint">Se respeta la configuración específica aplicable. Si una función está deshabilitada, no se elude usando la general. El evaluador por curso conserva sus reglas de calibración.</p>`,
  mount: (ctx) => {
    let selected = "global",
      step = 0;
    const next = ctx.root.querySelector<HTMLButtonElement>(
      '[data-action="resolve"]',
    )!;
    const explain = (title: string, text: string) =>
      (ctx.root.querySelector("#config-explanation")!.innerHTML = guidance(
        title,
        text,
      ));
    const reset = () => {
      step = 0;
      next.textContent = "1 · Seguir esta consulta →";
      ctx.root.querySelector("#config-origin")!.textContent =
        "CONFIGURACIÓN QUE VAMOS A CONSULTAR";
      ctx.root.querySelector("#config-model")!.textContent =
        "Todavía no resuelta";
      ctx.root.querySelector("#config-key")!.textContent =
        "La llave aparecerá al resolver";
      ctx.root.querySelector("#config-result")!.textContent =
        "Nueva consulta de ejemplo. Empezamos por su origen.";
      ctx.root
        .querySelectorAll("[data-config-step]")
        .forEach((x) => x.classList.remove("current"));
      explain(
        "1 · ¿Qué contexto trae el pedido?",
        selected === "course"
          ? "Este pedido viene del Curso Jardín. Vamos a ver cómo eso cambia el destino."
          : selected === "inherit"
            ? "Este curso no tiene una personalización. Mirá cómo Gati encuentra la configuración general."
            : "Esta consulta usa el contexto general de la plataforma. Seguí para ver cómo se resuelve.",
      );
    };
    bindChoices(ctx.root, (v) => {
      selected = v;
      reset();
    });
    next.addEventListener("click", () => {
      if (step === 3) {
        reset();
        return;
      }
      step++;
      ctx.root
        .querySelectorAll<HTMLElement>("[data-config-step]")
        .forEach((x) =>
          x.classList.toggle("current", Number(x.dataset.configStep) === step),
        );
      if (step === 1) {
        ctx.root.querySelector("#config-origin")!.textContent =
          selected === "course"
            ? "PEDIDO DEL CURSO JARDÍN"
            : selected === "inherit"
              ? "PEDIDO DE UN CURSO SIN AJUSTE PROPIO"
              : "PEDIDO GENERAL";
        explain(
          "1 · Primero, saber para quién es",
          "El pedido identifica la función TUTOR y su contexto. Así Gati puede buscar la configuración correcta sin pedirle al módulo que elija un proveedor a mano.",
        );
        next.textContent = "2 · Buscar la configuración →";
      }
      if (step === 2) {
        ctx.root.querySelector("#config-model")!.textContent =
          selected === "course"
            ? "Claude Sonnet (Anthropic)"
            : "GPT-4.1 (OpenAI)";
        explain(
          "2 · Encontramos la regla aplicable",
          selected === "course"
            ? "Jardín tiene su configuración específica: corresponde Claude Sonnet. No usamos GPT-4.1 solo porque sea el modelo general."
            : "No hay un ajuste específico que corresponda en este caso: se utiliza la configuración general, que indica GPT-4.1.",
        );
        next.textContent = "3 · Resolver el acceso seguro →";
      }
      if (step === 3) {
        ctx.root.querySelector("#config-key")!.textContent =
          selected === "course"
            ? "Llave propia del curso · ••••"
            : "Llave de la plataforma · ••••";
        ctx.root.querySelector("#config-result")!.textContent =
          selected === "course"
            ? "✓ TUTOR · Jardín → Claude Sonnet → acceso del curso"
            : "✓ TUTOR → GPT-4.1 → acceso general";
        explain(
          "3 · Destino y acceso listos para invocar",
          "Gati ya sabe qué modelo corresponde y con qué credencial acceder. El módulo no maneja el secreto. El registro puede identificar la credencial usada sin copiar su contenido.",
        );
        next.textContent = "Repetir esta consulta ↻";
        ctx.complete();
        ctx.sparkle();
        ctx.say(
          "Probá ahora otro origen: la misma función, con otro contexto, puede resolver un destino distinto.",
        );
      }
    });
  },
};
