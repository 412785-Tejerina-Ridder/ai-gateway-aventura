import { test } from "node:test";
import assert from "node:assert/strict";
import {
  AdventureProgress,
  FAILOVER_CHAPTER,
  FAILOVER_REQUIRED,
} from "../src/state/progress.ts";
import { ScenarioRunTracker } from "../src/state/scenarios.ts";

/** Mirrors the chapter 03 scene: a run ends, counts once, and only the goal completes. */
function finishRun(tracker: ScenarioRunTracker, progress: AdventureProgress, scenario: string) {
  const token = tracker.start(scenario);
  const outcome = tracker.finish(token);
  if (outcome.counted) progress.explore(FAILOVER_CHAPTER, outcome.scenario!);
  const fresh = outcome.reachedGoal ? progress.complete(FAILOVER_CHAPTER, "scenarios") : false;
  return { outcome, fresh };
}

test("cap. 03: seleccionar un escenario no cuenta; ejecutarlo hasta el final sí (1/3, sin estrella)", () => {
  const progress = new AdventureProgress();
  const tracker = new ScenarioRunTracker([], FAILOVER_REQUIRED);
  // Choosing a case is only UI state: nothing has started.
  assert.equal(tracker.count, 0);
  const { outcome, fresh } = finishRun(tracker, progress, "a");
  assert.equal(outcome.counted, true);
  assert.equal(tracker.count, 1);
  assert.equal(fresh, false);
  assert.equal(progress.phase(FAILOVER_CHAPTER), "pending");
  assert.equal(progress.celebration, null);
});

test("cap. 03: repetir el mismo escenario sigue en 1/3", () => {
  const progress = new AdventureProgress();
  const tracker = new ScenarioRunTracker();
  finishRun(tracker, progress, "b");
  for (let i = 0; i < 4; i++) {
    const { outcome } = finishRun(tracker, progress, "b");
    assert.equal(outcome.finished, true);
    assert.equal(outcome.counted, false);
  }
  assert.equal(tracker.count, 1);
  assert.deepEqual(progress.failoverExplored, ["b"]);
  assert.equal(progress.finished.has(FAILOVER_CHAPTER), false);
});

test("cap. 03: segundo distinto 2/3; tercero distinto 3/3 y una sola celebración", () => {
  const progress = new AdventureProgress();
  const tracker = new ScenarioRunTracker();
  finishRun(tracker, progress, "none");
  assert.equal(finishRun(tracker, progress, "timeout").outcome.count, 2);
  assert.equal(progress.phase(FAILOVER_CHAPTER), "pending");
  const third = finishRun(tracker, progress, "invalid");
  assert.equal(third.outcome.count, 3);
  assert.equal(third.outcome.reachedGoal, true);
  assert.equal(third.fresh, true);
  assert.equal(progress.phase(FAILOVER_CHAPTER), "celebrating");
  assert.equal(progress.celebration?.chapter, FAILOVER_CHAPTER);
});

test("cap. 03: cambiar de escenario o salir antes del final no cuenta la ejecución incompleta", () => {
  const progress = new AdventureProgress();
  const tracker = new ScenarioRunTracker();
  const abandoned = tracker.start("c");
  tracker.cancel(); // The visitor picked another case.
  assert.equal(tracker.finish(abandoned).finished, false);
  const left = tracker.start("timeout");
  tracker.cancel(); // The chapter was left during the simulation.
  assert.equal(tracker.finish(left).counted, false);
  assert.equal(tracker.count, 0);
  assert.deepEqual(progress.failoverExplored, []);
});

test("cap. 03: un evento tardío de una ejecución anterior no completa otra", () => {
  const tracker = new ScenarioRunTracker(["a", "b"]);
  const old = tracker.start("c");
  const current = tracker.start("none"); // A new run replaces the previous one.
  const late = tracker.finish(old);
  assert.equal(late.finished, false);
  assert.equal(late.reachedGoal, false);
  assert.equal(tracker.has("c"), false);
  assert.equal(tracker.finish(current).reachedGoal, true);
  assert.equal(tracker.finish(current).finished, false); // A token ends only once.
});

test("cap. 03: repetir un capítulo completado no duplica la celebración ni quita la estrella", () => {
  const progress = new AdventureProgress();
  const tracker = new ScenarioRunTracker();
  ["a", "b", "c"].forEach((id) => finishRun(tracker, progress, id));
  progress.acknowledge(progress.celebration!);
  progress.leaveChapter();
  const restored = new AdventureProgress(progress.serialize());
  const again = new ScenarioRunTracker(restored.failoverExplored);
  for (const id of ["a", "none", "invalid", "timeout"]) {
    const { outcome, fresh } = finishRun(again, restored, id);
    assert.equal(outcome.reachedGoal, false);
    assert.equal(fresh, false);
    assert.equal(restored.phase(FAILOVER_CHAPTER), "completed");
    assert.equal(restored.celebration, null);
  }
  assert.equal(restored.failoverExplored.length, 6);
});

test("cap. 03: el progreso parcial sobrevive a la recarga y no se convierte en estrella", () => {
  const progress = new AdventureProgress();
  progress.explore(FAILOVER_CHAPTER, "a");
  progress.explore(FAILOVER_CHAPTER, "b");
  assert.equal(progress.complete(FAILOVER_CHAPTER, "scenarios"), false);
  const restored = new AdventureProgress(progress.serialize());
  assert.deepEqual(restored.failoverExplored, ["a", "b"]);
  assert.equal(restored.finished.has(FAILOVER_CHAPTER), false);
  assert.equal(restored.phase(FAILOVER_CHAPTER), "pending");
});

test("cap. 03: solo los escenarios conocidos cuentan y solo en su capítulo", () => {
  const progress = new AdventureProgress();
  assert.equal(progress.explore(FAILOVER_CHAPTER, "inventado"), false);
  assert.equal(progress.explore(3, "a"), false);
  assert.equal(progress.explore(FAILOVER_CHAPTER, "a"), true);
  assert.equal(progress.explore(FAILOVER_CHAPTER, "a"), false);
  assert.deepEqual(progress.failoverExplored, ["a"]);
});

test("cap. 03: una estrella ganada con la versión anterior se conserva", () => {
  const legacy = new AdventureProgress({ finished: [2], stamps: ["2:a"] });
  assert.equal(legacy.phase(FAILOVER_CHAPTER), "completed");
  assert.equal(legacy.complete(FAILOVER_CHAPTER, "scenarios"), false);
});
