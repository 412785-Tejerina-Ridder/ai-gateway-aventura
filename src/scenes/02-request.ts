import { actor, button, note } from "../ui/components";
import { introduction, guidance } from "../ui/narrative";
import { character } from "../characters/characters";
import type { Chapter, Character } from "../types";
const jobs = [
  "Elegir el modelo configurado",
  "Resolver el acceso seguro",
  "Hablar el idioma del proveedor",
  "Poner un límite de espera",
  "Reconocer fallos y respaldos",
  "Conservar evidencia de uso",
];
const neighbors: { id: Character; label: string; path: string }[] = [
  { id: "tutor", label: "Tutor", path: "Enseña y prepara el contexto" },
  {
    id: "evaluator",
    label: "Evaluador",
    path: "Evalúa con su perfil; sin cadena TUTOR",
  },
  { id: "rag", label: "RAG", path: "Busca fuentes; usa embeddings y chat" },
  {
    id: "moderation",
    label: "Moderación",
    path: "Clasificadores y caminos especializados",
  },
  {
    id: "agent",
    label: "Agentes",
    path: "Validan menciones; pueden usar TUTOR",
  },
  {
    id: "generator",
    label: "Generación",
    path: "Pide contenido y valida borradores",
  },
  {
    id: "calibration",
    label: "Calibración",
    path: "Compara referencias por su propio puerto",
  },
];
export const requestChapter: Chapter = {
  id: "consulta",
  label: "La consulta",
  title: "Pedir ayuda no debería ser otro trabajo.",
  eyebrow: "02 / UN MÓDULO PIDE AYUDA A UNA IA",
  subtitle:
    "Usamos al Tutor como ejemplo. Lo que vamos a seguir es la comunicación con el modelo.",
  render: () =>
    `${introduction("El Tutor quiere enseñar. Pero una IA no es un botón mágico.", "Para obtener una respuesta hay que saber a qué servicio llamar, cómo enviarle el pedido, qué llave usar y qué hacer si tarda o falla. Si cada módulo resuelve todo eso por su cuenta, repite el mismo trabajo.", "Avanzá la historia: primero veremos ese lío y después cómo Gati se hace cargo de la comunicación.")}<div class="scene-board delegation-board" data-phase="0"><div class="delegation-story"><span class="eyebrow" id="request-phase">1 / EL EJEMPLO</span><h2 id="request-heading">El Profe solo quiere dar una pista.</h2><p id="request-caption" role="status">«Tengo el contexto del alumno y sé qué ayuda es apropiada. Necesito que un modelo genere una respuesta».</p></div><div class="delegation-workbench"><div class="example-module">${actor("tutor", "Tutor · nuestro ejemplo", "request-tutor")}<span class="module-job">MI TRABAJO: AYUDAR A APRENDER</span></div><div class="technical-burden" hidden><span class="burden-label">Y ADEMÁS… ¿TODO ESTO?</span>${jobs.map((x, i) => `<span class="job-slip" style="--order:${i}">${["⚙", "⚿", "✉", "◷", "↪", "▤"][i]} ${x}</span>`).join("")}</div><div class="gateway-workbench" hidden>${actor("gati", "Gati · comunicación compartida", "request-gati")}<div class="gateway-job-slips"></div></div><div class="request-destination" hidden>${actor("provider", "GPT-4.1 (OpenAI)", "request-model", "Ofrecido por OpenAI")}</div><span class="communication-packet" aria-hidden="true">✉</span></div><div class="delegation-result" hidden><span>✓ El módulo prepara el pedido y utiliza la respuesta.</span><span>✓ Gati resuelve la invocación y sus controles técnicos.</span></div><div class="shared-neighborhood" hidden><div class="shared-hub">${character("gati")}<b>Infraestructura compartida</b></div><div class="shared-neighbors">${neighbors.map((m) => `<div class="shared-neighbor">${character(m.id)}<b>${m.label}</b><small>${m.path}</small></div>`).join("")}</div><p><b>La misma necesidad, distintos recorridos.</b> Cada módulo necesita comunicarse con modelos sin perder su especialidad. Evaluador no hereda los respaldos de TUTOR; Moderación y Calibración conservan caminos específicos.</p></div></div><div class="scene-controls">${button("¿Qué implica hablar con una IA? →", "advance")}${button("Volver a empezar ↻", "replay", true)}</div>${guidance("Una historia, paso a paso", "No tenés que configurar nada. El botón hace avanzar la demostración; podés tomarte el tiempo de mirar cada paso.")}${note("El proveedor ofrece el servicio; el modelo es la herramienta concreta. La política pedagógica y la relevancia de las fuentes siguen perteneciendo a sus módulos.")}`,
  mount: (ctx) => {
    let phase = 0;
    const board = ctx.root.querySelector<HTMLElement>(".delegation-board")!;
    const next = ctx.root.querySelector<HTMLButtonElement>(
      '[data-action="advance"]',
    )!;
    const copy = [
      [
        "1 / EL EJEMPLO",
        "El Profe solo quiere dar una pista.",
        "«Tengo el contexto del alumno y sé qué ayuda es apropiada. Necesito que un modelo genere una respuesta».",
        "¿Qué implica hablar con una IA? →",
      ],
      [
        "2 / EL TRABAJO QUE SE REPITE",
        "¡Me vine a enseñar, no a resolver todo esto!",
        "Sin una central compartida, el Tutor tendría que resolver también todos estos detalles técnicos. Y los otros módulos tendrían que repetirlos.",
        "Que Gati se encargue →",
      ],
      [
        "3 / REPARTIMOS RESPONSABILIDADES",
        "El pedido va a Gati. Los problemas de conexión, también.",
        "El Tutor entrega su pedido y contexto. Gati resuelve el modelo configurado, el acceso y los controles de la invocación. Las fichas cambian de dueño; la tarea pedagógica no.",
        "Enviar al modelo ✉",
      ],
      [
        "4 / VIAJA LA CONSULTA",
        "Gati habla con el proveedor.",
        "Sale una invocación hacia el modelo GPT-4.1. El Tutor no tiene que conocer el formato propio de ese proveedor ni resolver por su cuenta esta comunicación.",
        "Traer la respuesta ←",
      ],
      [
        "5 / VUELVE LA RESPUESTA",
        "Una respuesta para que el Tutor haga su trabajo.",
        "Gati devuelve el resultado de la invocación. El Tutor lo usa con su contexto y sus reglas para construir una ayuda apropiada. Gati no pasa a ser el profesor.",
        "Abrir el plano: ¿y los demás? ↗",
      ],
      [
        "6 / ABRIMOS EL PLANO",
        "El Tutor era un ejemplo de una necesidad compartida.",
        "La ciudad completa necesita invocar IA. Compartir infraestructura evita que cada módulo reinvente sus conexiones y controles. Cada uno conserva sus reglas y su recorrido aplicable.",
        "Historia completa ✓",
      ],
    ];
    const show = () => {
      board.dataset.phase = String(phase);
      const c = copy[phase];
      ctx.root.querySelector("#request-phase")!.textContent = c[0];
      ctx.root.querySelector("#request-heading")!.textContent = c[1];
      ctx.root.querySelector("#request-caption")!.textContent = c[2];
      next.textContent = c[3];
      next.disabled = phase === 5;
      ctx.root.querySelector<HTMLElement>(".technical-burden")!.hidden =
        phase !== 1;
      ctx.root.querySelector<HTMLElement>(".gateway-workbench")!.hidden =
        phase < 2;
      ctx.root.querySelector(".gateway-job-slips")!.innerHTML =
        phase >= 2
          ? jobs.map((x) => `<span class="job-slip">✓ ${x}</span>`).join("")
          : "";
      ctx.root.querySelector<HTMLElement>(".request-destination")!.hidden =
        phase < 3;
      ctx.root.querySelector<HTMLElement>(".delegation-result")!.hidden =
        phase !== 4;
      ctx.root.querySelector<HTMLElement>(".shared-neighborhood")!.hidden =
        phase !== 5;
      ctx.root.querySelector<HTMLElement>(".delegation-workbench")!.hidden =
        phase === 5;
      if (phase === 5) {
        ctx.complete();
        ctx.say(
          "El módulo decide para qué necesita IA. Yo aporto infraestructura para invocarla por el camino que corresponda.",
        );
        ctx.sparkle();
      }
    };
    next.addEventListener("click", () => {
      phase = Math.min(5, phase + 1);
      show();
    });
    ctx.root
      .querySelector('[data-action="replay"]')!
      .addEventListener("click", () => {
        phase = 0;
        show();
      });
    show();
  },
};
