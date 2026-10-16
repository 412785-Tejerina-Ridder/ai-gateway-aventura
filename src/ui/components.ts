import { character } from "../characters/characters";
import type { Character } from "../types";
export function button(label: string, action: string, secondary = false) {
  return `<button type="button" class="btn ${secondary ? "btn-secondary" : "btn-primary"}" data-action="${action}">${label}</button>`;
}
export function actor(kind: Character, label: string, id = "", detail = "") {
  return `<div class="actor" ${id ? `id="${id}"` : ""}>${character(kind)}<strong>${label}</strong>${detail ? `<small>${detail}</small>` : ""}<span class="actor-status"></span></div>`;
}
export function route(nodes: string[], id = "") {
  return `<div class="route" ${id ? `id="${id}"` : ""}>${nodes.join('<span class="route-arrow" aria-hidden="true">···➜</span>')}</div>`;
}
export function note(text: string) {
  return `<p class="scene-note"><span>✦</span> ${text}</p>`;
}
export function choices(
  options: { label: string; value: string }[],
  id = "options",
) {
  return `<div class="choices" id="${id}" role="group">${options.map((o, i) => `<button type="button" class="choice ${i === 0 ? "selected" : ""}" data-value="${o.value}" aria-pressed="${i === 0}">${o.label}</button>`).join("")}</div>`;
}
export function bindChoices(
  root: HTMLElement,
  callback: (value: string) => void,
) {
  root.querySelectorAll<HTMLButtonElement>(".choice").forEach((b) =>
    b.addEventListener("click", () => {
      b.parentElement?.querySelectorAll(".choice").forEach((x) => {
        x.classList.remove("selected");
        x.setAttribute("aria-pressed", "false");
      });
      b.classList.add("selected");
      b.setAttribute("aria-pressed", "true");
      callback(b.dataset.value!);
    }),
  );
}
export function feedback(root: HTMLElement, text: string, good = true) {
  const el = root.querySelector<HTMLElement>(".feedback");
  if (el) {
    el.textContent = text;
    el.className = `feedback ${good ? "good" : "try-again"}`;
  }
}
