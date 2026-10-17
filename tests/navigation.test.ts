import { test } from "node:test";
import assert from "node:assert/strict";
import { nextChapterAction } from "../src/state/navigation.ts";
import { AdventureProgress } from "../src/state/progress.ts";

test("siguiente con misión pendiente advierte y saltar no la marca completa", () => {
  const progress = new AdventureProgress();
  progress.complete(0);
  for (const chapter of [1, 2, 3, 4, 5, 6, 7, 8])
    assert.equal(nextChapterAction(chapter, progress.finished), "warn");
  // «Saltar capítulo» only navigates: progress is untouched.
  assert.deepEqual([...progress.finished], [0]);
  assert.equal(progress.phase(1), "pending");
  assert.equal(progress.celebration?.chapter, 0); // No new star was issued.
});

test("un capítulo completado avanza directo, también mientras guarda su estrella", () => {
  const progress = new AdventureProgress();
  progress.complete(1);
  assert.equal(progress.phase(1), "celebrating");
  assert.equal(nextChapterAction(1, progress.finished), "navigate");
  progress.acknowledge(progress.celebration!);
  assert.equal(nextChapterAction(1, progress.finished), "navigate");
});

test("volver a un capítulo salteado permite completarlo después", () => {
  const progress = new AdventureProgress();
  assert.equal(nextChapterAction(3, progress.finished), "warn");
  progress.leaveChapter(); // Skip.
  assert.equal(progress.complete(3), true);
  assert.equal(nextChapterAction(3, progress.finished), "navigate");
});

test("la bienvenida y el cierre conservan su comportamiento propio", () => {
  const progress = new AdventureProgress();
  assert.equal(nextChapterAction(0, progress.finished), "complete-welcome");
  progress.complete(0);
  assert.equal(nextChapterAction(0, progress.finished), "navigate");
  assert.equal(nextChapterAction(9, progress.finished), "finale");
});
