import { character } from "./characters";
import type { Character } from "../types";
export const buildings: {
  id: Character;
  label: string;
  number: string;
  color: string;
  x: number;
  y: number;
}[] = [
  { id: "tutor", label: "Tutor", number: "01", color: "#f0b89a", x: 18, y: 33 },
  {
    id: "evaluator",
    label: "Evaluador",
    number: "02",
    color: "#c6b6e6",
    x: 50,
    y: 20,
  },
  {
    id: "rag",
    label: "Biblioteca RAG",
    number: "03",
    color: "#a5c9a7",
    x: 82,
    y: 33,
  },
  {
    id: "moderation",
    label: "Moderación",
    number: "04",
    color: "#a5c3e2",
    x: 14,
    y: 66,
  },
  {
    id: "agent",
    label: "Agentes",
    number: "05",
    color: "#e9b4cd",
    x: 37,
    y: 83,
  },
  {
    id: "generator",
    label: "Generación",
    number: "06",
    color: "#e9c877",
    x: 64,
    y: 83,
  },
  {
    id: "calibration",
    label: "Calibración",
    number: "07",
    color: "#a6c2d4",
    x: 86,
    y: 66,
  },
];
function tree(x: number, y: number, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M0 0V41" stroke="#718d75" stroke-width="6"/><circle cx="0" cy="-8" r="22" fill="#9bbda2"/><circle cx="-10" cy="-17" r="15" fill="#b2cfaa"/></g>`;
}
export function city(interactive = false): string {
  return `<div class="city ${interactive ? "city-playable" : ""}"><svg class="city-land" viewBox="0 0 880 650" aria-hidden="true"><defs><pattern id="grass" width="29" height="29" patternUnits="userSpaceOnUse"><path d="M4 18l2-3 2 3" stroke="#9ab79f" stroke-width="1.3" fill="none"/></pattern></defs><ellipse cx="440" cy="397" rx="420" ry="204" fill="#8ead93" opacity=".18"/><path d="M43 315 Q73 126 426 155 Q779 110 846 319L845 433Q772 620 434 603Q93 607 34 440Z" fill="#c6dbb7" stroke="#9fbd9f" stroke-width="2"/><path d="M43 315 Q73 126 426 155 Q779 110 846 319L845 433Q772 620 434 603Q93 607 34 440Z" fill="url(#grass)"/><path d="M170 251L443 342 686 236 M443 342L153 466 M443 342L444 533 M443 342L727 466" stroke="#f8e5bd" stroke-width="35" fill="none" stroke-linecap="round"/><path d="M170 251L443 342 686 236 M443 342L153 466 M443 342L444 533 M443 342L727 466" stroke="#fff4d7" stroke-width="2" stroke-dasharray="5 12" fill="none"/>${tree(69, 350, 0.8)}${tree(786, 355, 0.9)}${tree(338, 212, 0.6)}${tree(560, 222, 0.6)}${tree(232, 521, 0.7)}${tree(678, 543, 0.8)}<g fill="#f1b082"><circle cx="348" cy="488" r="5"/><circle cx="557" cy="526" r="4"/><circle cx="92" cy="427" r="4"/></g><path d="M389 322L443 295 502 323V372L443 401 389 371Z" fill="#5aa998" stroke="#345f55" stroke-width="2"/><path d="M389 322L443 350 502 323 443 295Z" fill="#93d4c0"/><path d="M405 342V368L431 381V355Z M456 354V380L481 368V341Z" fill="#f7e2a6"/><path d="M443 289V266" stroke="#345f55" stroke-width="3"/><path d="M444 266h37l-9 9 9 9h-37" fill="#f3a38a"/><text x="443" y="426" text-anchor="middle" font-size="19" font-weight="800" fill="#355b50">CENTRAL GATI</text></svg><span class="cloud cloud-a"></span><span class="cloud cloud-b"></span><span class="map-sun">✦</span>${buildings.map((b) => `<${interactive ? "button" : "div"} ${interactive ? `type="button" data-module="${b.id}" aria-label="Entrar a ${b.label}"` : ""} class="building building-${b.id}" style="--x:${b.x}%;--y:${b.y}%;--house:${b.color}"><span class="building-house"><i class="roof"></i><span class="house-window"></span>${character(b.id)}<span class="house-door"></span></span><span class="building-label">${b.label}${interactive ? " <b>↗</b>" : ""}</span></${interactive ? "button" : "div"}>`).join("")}<div class="city-gati">${character("gati")}</div><span class="map-pin pin-one">✦</span><span class="map-pin pin-two">✦</span></div>`;
}
