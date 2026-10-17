/**
 * What «Próximo capítulo» does. Pending missions get a friendly reminder instead
 * of a lock: the visitor may still skip, and skipping never stamps a chapter.
 */
export type NextAction = "finale" | "complete-welcome" | "warn" | "navigate";

export function nextChapterAction(
  current: number,
  finished: ReadonlySet<number>,
): NextAction {
  if (current >= 9) return "finale"; // The closing chapter keeps its own flow.
  if (current === 0 && !finished.has(0)) return "complete-welcome";
  return finished.has(current) ? "navigate" : "warn";
}
