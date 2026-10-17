/**
 * Layout stability helpers. Activities that change their text or reveal parts of
 * a board keep their controls in place by reserving, up front, the space their
 * largest state needs. Measurements use the real styles and the current width,
 * and are repeated when the viewport changes, so nothing is clipped on small
 * screens and no arbitrary pixel value is hard-coded.
 */

/**
 * Measures a hidden clone of `board` in each state and lets `pick` decide the
 * reserved min-height (or null to leave the natural height).
 * The clone is inserted next to the board so the same selectors apply.
 */
export function reserveBoardHeight(
  board: HTMLElement,
  states: ((clone: HTMLElement) => void)[],
  pick: (heights: number[]) => number | null = (heights) => Math.max(...heights),
) {
  const measure = () => {
    const width = board.getBoundingClientRect().width;
    if (!width || !board.parentElement) return;
    const clone = board.cloneNode(true) as HTMLElement;
    clone.removeAttribute("id");
    clone.querySelectorAll("[id]").forEach((n) => n.removeAttribute("id"));
    clone.setAttribute("aria-hidden", "true");
    clone.inert = true;
    clone.style.position = "absolute";
    clone.style.visibility = "hidden";
    clone.style.pointerEvents = "none";
    clone.style.width = `${width}px`;
    clone.style.minHeight = "";
    // The live board is never resized while measuring, so the page cannot jump.
    board.after(clone);
    const heights = states.map((apply) => {
      apply(clone);
      return clone.getBoundingClientRect().height;
    });
    clone.remove();
    const reserved = pick(heights);
    board.style.minHeight = reserved ? `${Math.ceil(reserved)}px` : "";
    board.dataset.reserved = String(Boolean(reserved));
  };
  measure();
  let size = `${innerWidth}x${innerHeight}`;
  const onResize = () => {
    const next = `${innerWidth}x${innerHeight}`;
    if (next === size) return;
    size = next;
    measure();
  };
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}

/**
 * A button whose label changes keeps the width of its longest label, so a centred
 * row of controls does not slide sideways under the pointer, nor grow when a
 * label wraps. The width is capped at 100%, so nothing overflows.
 */
export function reserveLabelWidth(button: HTMLElement, labels: string[]) {
  const measure = () => {
    const current = button.textContent;
    button.style.minWidth = "0px";
    button.style.minHeight = "";
    let widest = 0;
    for (const label of labels) {
      button.textContent = label;
      widest = Math.max(widest, button.getBoundingClientRect().width);
    }
    if (widest) button.style.minWidth = `min(${Math.ceil(widest)}px, 100%)`;
    else button.style.minWidth = "";
    // In narrow columns a long label wraps: keep the tallest box as well.
    let tallest = 0;
    for (const label of labels) {
      button.textContent = label;
      tallest = Math.max(tallest, button.getBoundingClientRect().height);
    }
    button.textContent = current;
    if (tallest) button.style.minHeight = `${Math.ceil(tallest)}px`;
  };
  measure();
  let width = innerWidth;
  const onResize = () => {
    if (innerWidth === width) return;
    width = innerWidth;
    measure();
  };
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}

/** Space between the sticky header and the fixed HUD. */
export function availableViewport() {
  const style = getComputedStyle(document.documentElement);
  const chrome = Number.parseFloat(style.getPropertyValue("--chrome-height")) || 130;
  const hud = Number.parseFloat(style.getPropertyValue("--hud-height")) || 80;
  return innerHeight - chrome - hud;
}

/**
 * A status line that cycles through known messages keeps the height of the
 * longest one at the current width, so the controls below it stay in place.
 */
export function reserveTextHeight(element: HTMLElement, texts: string[]) {
  const measure = () => {
    const current = element.textContent;
    element.style.minHeight = "";
    let tallest = 0;
    for (const text of [current ?? "", ...texts]) {
      element.textContent = text;
      tallest = Math.max(tallest, element.getBoundingClientRect().height);
    }
    element.textContent = current;
    if (tallest) element.style.minHeight = `${Math.ceil(tallest)}px`;
  };
  measure();
  let width = innerWidth;
  const onResize = () => {
    if (innerWidth === width) return;
    width = innerWidth;
    measure();
  };
  window.addEventListener("resize", onResize);
  return () => window.removeEventListener("resize", onResize);
}
