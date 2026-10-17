import { test } from "node:test";
import assert from "node:assert/strict";
import { AdventureProgress, MODULE_IDS } from "../src/state/progress.ts";
import { BPM, musicBar } from "../src/audio/composition.ts";
// Chapter 03 needs three different finished scenarios before it can complete.
const exploreFailover = (p: AdventureProgress) =>
  ["a", "b", "c"].forEach((id) => p.explore(2, id));

test("9/10 identifica el paseo pendiente y llega a 10/10 al terminar las siete visitas", () => {
  const p = new AdventureProgress({ finished: [0, 1, 2, 3, 5, 6, 7, 8, 9] });
  assert.deepEqual(p.missing, [4]);
  for (const id of MODULE_IDS.slice(0, 6)) p.complete(4, "module-" + id);
  assert.equal(p.finished.size, 9);
  assert.equal(p.complete(4, "module-calibration"), true);
  assert.equal(p.finished.size, 10);
  assert.deepEqual(p.missing, []);
});
test("repetir visitas o un cierre no infla el contador ni la cantidad de capítulos", () => {
  const p = new AdventureProgress();
  exploreFailover(p);
  for (let i = 0; i < 10; i++) p.complete(i);
  assert.equal(p.finished.size, 9); // A generic click cannot complete the city tour.
  for (const id of MODULE_IDS) {
    p.complete(4, "module-" + id);
    p.complete(4, "module-" + id);
  }
  assert.equal(p.finished.size, 10);
  assert.equal(p.complete(4, "tour-done"), false);
  assert.equal(p.complete(9), false);
});
test("recupera las visitas viejas por su identidad y no por contar prefijos arbitrarios", () => {
  const stamps = MODULE_IDS.map((id) => "4:module-" + id);
  const p = new AdventureProgress({ stamps });
  assert.ok(p.finished.has(4));
  const other = new AdventureProgress({
    stamps: Array.from({ length: 7 }, (_, i) => "module-falso-" + i),
  });
  other.complete(4, "tour-done");
  assert.ok(!other.finished.has(4));
});
test("volver a empezar borra visitas y capítulos y permanece en cero al recargar", () => {
  const p = new AdventureProgress({
    finished: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
    stamps: ["module-tutor", "9:done"],
  });
  p.reset();
  const restored = new AdventureProgress(p.serialize());
  assert.equal(restored.finished.size, 0);
  assert.equal(restored.stamps.size, 0);
  assert.equal(restored.missing.length, 10);
});
test("un guardado malformado no rompe el arranque ni cuenta capítulos inválidos", () => {
  assert.equal(
    new AdventureProgress({ finished: { length: 20 }, stamps: null }).finished
      .size,
    0,
  );
  const p = new AdventureProgress({
    finished: [-1, 0, 0, 9, 10, "2"],
    stamps: ["0:done"],
  });
  assert.deepEqual([...p.finished], [0, 9]);
  assert.equal(p.complete(12), false);
});
test("terminar la misión final no inventa capítulos que no se recorrieron", () => {
  const p = new AdventureProgress();
  p.complete(9);
  assert.equal(p.finished.size, 1);
  assert.equal(p.missing.length, 9);
});
test("la composición original tiene un tempo tranquilo y eventos válidos durante todo el bucle", () => {
  assert.ok(BPM >= 72 && BPM <= 90);
  for (let bar = 0; bar < 16; bar++)
    for (const e of musicBar(bar)) {
      assert.ok(e.beat >= 0 && e.beat < 4);
      assert.ok(e.duration > 0 && Number.isFinite(e.duration));
      assert.ok(e.gain > 0 && e.gain <= 0.25);
      if (e.instrument === "mallet") assert.ok(e.note <= 69); // Main melody at or below A4.
    }
  assert.deepEqual(musicBar(0), musicBar(8));
  assert.notDeepEqual(musicBar(0), musicBar(1));
});

test('una misión nueva permanece pendiente hasta que termina la actividad', () => {
  const progress = new AdventureProgress();
  for (let chapter=0; chapter<10; chapter++) assert.equal(progress.phase(chapter), 'pending');
  assert.equal(progress.celebration, null);
});
test('la primera finalización espera la confirmación y llegada de su estrella', () => {
  const progress = new AdventureProgress();
  exploreFailover(progress);
  assert.equal(progress.complete(2, 'scenarios'), true);
  const ticket = progress.celebration!;
  assert.equal(progress.phase(2), 'celebrating');
  assert.equal(progress.phase(3), 'pending');
  assert.ok(progress.finished.has(2)); // Persist completion even if the browser closes now.
  assert.equal(progress.acknowledge({...ticket,id:ticket.id+1}), false);
  assert.equal(progress.phase(2), 'celebrating');
  assert.equal(progress.acknowledge(ticket), true);
  assert.equal(progress.phase(2), 'completed');
  assert.equal(progress.acknowledge(ticket), false);
});
test('repetir una actividad terminada no vuelve a gris ni abre otra celebración', () => {
  const progress = new AdventureProgress();
  progress.complete(8); progress.acknowledge(progress.celebration!);
  for(let click=0;click<5;click++) {
    assert.equal(progress.complete(8), false);
    assert.equal(progress.phase(8), 'completed');
    assert.equal(progress.celebration, null);
  }
});
test('navegar durante el festejo preserva el progreso y descarta la llegada anterior', () => {
  const progress = new AdventureProgress(); progress.complete(1);
  const oldFlight=progress.celebration!;progress.leaveChapter();
  assert.equal(progress.phase(1), 'completed');
  assert.equal(progress.phase(2), 'pending');
  exploreFailover(progress);progress.complete(2);const currentFlight=progress.celebration!;
  assert.equal(progress.acknowledge(oldFlight), false);
  assert.equal(progress.phase(2), 'celebrating');
  assert.equal(progress.acknowledge(currentFlight), true);
});
test('recargar y volver a visitar conservan el cierre sin celebrar accidentalmente', () => {
  const progress = new AdventureProgress(); progress.complete(6);
  const restored = new AdventureProgress(progress.serialize());
  assert.equal(restored.phase(6), 'completed');
  assert.equal(restored.phase(7), 'pending');
  assert.equal(restored.celebration, null);
  assert.equal(restored.complete(6), false);
});
test('reiniciar invalida una animación anterior incluso al resolver el mismo capítulo', () => {
  const progress = new AdventureProgress();progress.complete(0);
  const oldFlight=progress.celebration!;progress.reset();
  assert.equal(progress.phase(0),'pending');
  progress.complete(0);const newFlight=progress.celebration!;
  assert.notEqual(oldFlight.id,newFlight.id);
  assert.equal(progress.acknowledge(oldFlight),false);
  assert.equal(progress.phase(0),'celebrating');
  assert.equal(progress.acknowledge(newFlight),true);
});
test('el paseo entrega una sola estrella tras las siete visitas y nunca por visitas parciales', () => {
  const progress=new AdventureProgress();
  for(const id of MODULE_IDS.slice(0,6))progress.complete(4,'module-'+id);
  assert.equal(progress.phase(4),'pending');assert.equal(progress.celebration,null);
  assert.equal(progress.complete(4,'module-calibration'),true);
  const ticket=progress.celebration!;
  assert.equal(progress.complete(4,'tour-done'),false);
  assert.equal(progress.celebration,ticket);
  progress.acknowledge(ticket);progress.leaveChapter();
  assert.equal(progress.phase(4),'completed');
});


test('repetir el cierre final durante el vuelo no vuelve a autorizar su celebración', () => {
  const progress = new AdventureProgress();
  assert.equal(progress.complete(9), true);
  const flight = progress.celebration!;
  for (let replay = 0; replay < 3; replay++) {
    assert.equal(progress.complete(9), false);
    assert.equal(progress.celebration, flight);
    assert.equal(progress.phase(9), 'celebrating');
  }
  progress.acknowledge(flight);
  assert.equal(progress.phase(9), 'completed');
  assert.equal(progress.complete(9), false);
});
