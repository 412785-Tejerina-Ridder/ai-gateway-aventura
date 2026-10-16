import { gameAudio } from "../audio/engine";
export function confetti() {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const layer = document.createElement("div");
  layer.className = "confetti";
  layer.setAttribute("aria-hidden", "true");
  for (let i = 0; i < 38; i++) {
    const p = document.createElement("i");
    p.style.cssText = `--x:${Math.random() * 100}vw;--r:${Math.random() * 720}deg;--d:${Math.random() * 0.5}s;background:${["#ed9c82", "#69bda9", "#e6c775", "#b5a1d4"][i % 4]}`;
    layer.append(p);
  }
  document.body.append(layer);
  setTimeout(() => layer.remove(), 2400);
}

export const toggleSound = () => gameAudio.toggle();
export const tone = () => gameAudio.tone();
