/**
 * Counts the different scenarios a visitor has *finished* in a simulation.
 *
 * Selecting a case never counts. A run counts only when the execution that was
 * started is the one reaching its terminal state: changing the case, leaving the
 * chapter or starting another run invalidates the previous token, so a late timer
 * from an older execution can never add progress.
 */
export interface ScenarioRunResult {
  /** The run belonged to the current execution and reached its end. */
  finished: boolean;
  /** First time this scenario counts. */
  counted: boolean;
  scenario?: string;
  /** Distinct scenarios explored, capped at the requirement. */
  count: number;
  /** True only on the run that reaches the requirement for the first time. */
  reachedGoal: boolean;
}

export class ScenarioRunTracker {
  private readonly explored: Set<string>;
  private active: { token: number; scenario: string } | null = null;
  private sequence = 0;
  readonly required: number;
  constructor(explored: Iterable<string> = [], required = 3) {
    this.explored = new Set(explored);
    this.required = required;
  }
  get count() {
    return Math.min(this.explored.size, this.required);
  }
  get complete() {
    return this.explored.size >= this.required;
  }
  get running() {
    return this.active !== null;
  }
  has(scenario: string) {
    return this.explored.has(scenario);
  }
  /** Starts a new execution and returns the token its terminal event must present. */
  start(scenario: string) {
    this.active = { token: ++this.sequence, scenario };
    return this.sequence;
  }
  /** Abandons the current execution (case changed, chapter left, reset). */
  cancel() {
    this.active = null;
    this.sequence++;
  }
  finish(token: number): ScenarioRunResult {
    const active = this.active;
    if (!active || active.token !== token)
      return { finished: false, counted: false, count: this.count, reachedGoal: false };
    this.active = null;
    const before = this.explored.size;
    const counted = !this.explored.has(active.scenario);
    this.explored.add(active.scenario);
    return {
      finished: true,
      counted,
      scenario: active.scenario,
      count: this.count,
      reachedGoal: before < this.required && this.explored.size >= this.required,
    };
  }
}
