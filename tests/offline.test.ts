import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const html=readFileSync(new URL('../dist/index.html',import.meta.url),'utf8');
test('el HTML portátil incluye estilos y script clásico después del contenedor',()=>{
  assert.match(html,/<style>/);
  assert.match(html,/<script>/);
  assert.ok(html.indexOf('<script>')>html.indexOf('id="app"'));
  assert.doesNotMatch(html,/<script[^>]+(?:src=|type="module")/);
});
test('la aventura compilada no necesita recursos externos ni APIs de red',()=>{
  assert.doesNotMatch(html,/<(?:script|img|iframe|audio)[^>]+src=/);
  assert.doesNotMatch(html,/<link[^>]+(?:stylesheet|modulepreload)/);
  assert.doesNotMatch(html,/\bfetch\s*\(|new\s+(?:WebSocket|XMLHttpRequest|EventSource)\s*\(/);
  assert.doesNotMatch(html,/@import|url\(\s*["']?https?:/);
});
