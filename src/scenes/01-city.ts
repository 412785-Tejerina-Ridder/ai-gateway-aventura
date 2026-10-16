import { city } from "../characters/city";
import { button } from "../ui/components";
import type { Chapter } from "../types";
export const cityChapter: Chapter = {
  id: "ciudad",
  label: "La ciudad",
  title: "Una ciudad. Mil ideas. Un Gati.",
  eyebrow: "01 / BIENVENIDO AL LLM-SERVICE",
  subtitle:
    "Cada equipo tiene su especialidad. Vení a conocer la central que los ayuda a hablar con modelos de IA.",
  render: () =>
    `<div class="welcome-layout"><div class="welcome-copy"><span class="stamp">UTN CÓRDOBA · EQUIPO G03</span><h2>¡Hola! Soy Gati.<br><em>Yo coordino el viaje.</em></h2><p>El Tutor acompaña, RAG encuentra material y el Evaluador analiza el uso de IA. Yo organizo las invocaciones para que puedan concentrarse en lo suyo.</p><p class="handwritten">Una aventura de 10–15 minutos ↗</p>${button("Seguí una consulta →", "start")}<div class="welcome-tags"><span>10 capítulos</span><span>7 personajes</span><span>Cero claves reales</span></div></div><div class="welcome-world">${city()}<div class="world-label">LLM-SERVICE <span>nuestra casa compartida</span></div></div></div>`,
  mount: (ctx) => {
    let acknowledged = ctx.completedKeys.has("0:done");
    ctx.root
      .querySelector('[data-action="start"]')!
      .addEventListener("click", () => {
        if (acknowledged) ctx.goTo(1);
        else {
          acknowledged = true;
          ctx.complete();
        }
      });
  },
};
