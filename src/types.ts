export type Character =
  | "gati"
  | "tutor"
  | "evaluator"
  | "rag"
  | "moderation"
  | "agent"
  | "generator"
  | "calibration"
  | "admin"
  | "provider";
export interface Chapter {
  id: string;
  title: string;
  label: string;
  eyebrow: string;
  subtitle: string;
  render: () => string;
  mount: (ctx: SceneContext) => void;
}
export interface SceneContext {
  root: HTMLElement;
  goTo: (index: number) => void;
  finishAdventure: () => void;
  complete: (key?: string) => boolean;
  completedKeys: ReadonlySet<string>;
  say: (text: string, speaker?: string) => void;
  sparkle: () => void;
  later: (fn: () => void, delay: number) => void;
  onCleanup: (fn: () => void) => void;
}
