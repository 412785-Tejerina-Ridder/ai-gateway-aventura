import { test } from "node:test";
import assert from "node:assert/strict";
import {
  simulateTutor,
  BreakerDemo,
  TicketDemo,
} from "../src/simulators/models.ts";
test("el principal exitoso no invoca respaldos", () => {
  const r = simulateTutor(["success", "success"]);
  assert.equal(r.attempts.length, 1);
  assert.equal(r.status, "success");
});
test("A503 y B429 permiten C sin duplicar candidatos", () => {
  const r = simulateTutor(["provider-error", "rate-limit", "success"]);
  assert.deepEqual(
    r.attempts.map((a) => a.candidate),
    ["A", "B", "C"],
  );
  assert.equal(r.status, "success");
});
test("una respuesta inválida detiene la operación", () => {
  assert.equal(simulateTutor(["invalid", "success"]).attempts.length, 1);
  assert.equal(simulateTutor(["invalid", "success"]).status, "stopped");
});
test("un límite económico no se evade con un respaldo", () => {
  assert.equal(simulateTutor(["budget", "success"]).status, "stopped");
  assert.equal(simulateTutor(["budget", "success"]).attempts.length, 1);
});
test("el timeout consume el plazo compartido y no inicia B", () => {
  const r = simulateTutor(["timeout", "success"]);
  assert.equal(r.elapsed, 6);
  assert.equal(r.attempts.length, 1);
  assert.equal(r.status, "deadline");
});
test("se respeta el máximo de intentos", () => {
  assert.equal(
    simulateTutor(["provider-error", "provider-error", "success"], 2).attempts
      .length,
    2,
  );
});
test("todos fallan sin superar la cantidad configurada", () => {
  assert.equal(
    simulateTutor(["provider-error", "provider-error", "provider-error"])
      .status,
    "exhausted",
  );
});
test("breaker descansa, evita red y permite una prueba", () => {
  const b = new BreakerDemo();
  b.request();
  b.request();
  b.request();
  assert.equal(b.state, "resting");
  assert.equal(b.request(), "skipped");
  assert.equal(b.calls, 3);
  b.wait();
  assert.equal(b.state, "probing");
  b.request(true);
  assert.equal(b.state, "working");
});
test("una prueba fallida vuelve a abrir el breaker", () => {
  const b = new BreakerDemo();
  b.request();
  b.request();
  b.request();
  b.wait();
  b.request();
  assert.equal(b.state, "resting");
});
test("el doble clic conserva una sola autorización", () => {
  const t = new TicketDemo();
  assert.equal(t.send(), true);
  assert.equal(t.send(), false);
  t.dispatch();
  assert.equal(t.dispatch(), false);
  assert.equal(t.dispatches, 1);
  assert.equal(t.duplicates, 1);
});
test("la incertidumbre no libera por sí sola la reserva", () => {
  const t = new TicketDemo();
  t.send();
  t.dispatch();
  t.release();
  assert.equal(t.state, "exposed");
  t.resolve();
  assert.equal(t.state, "confirmed");
  t.send();
  assert.equal(t.dispatches, 1);
});
test("se puede liberar antes de la autorización física", () => {
  const t = new TicketDemo();
  t.send();
  t.release();
  assert.equal(t.state, "released");
  assert.equal(t.dispatch(), false);
  assert.equal(t.dispatches, 0);
});
test('un acceso rechazado no habilita respaldos sin identidad independiente', () => {
  const result=simulateTutor(['access-denied','success']);
  assert.equal(result.status,'stopped');
  assert.equal(result.attempts.length,1);
});
