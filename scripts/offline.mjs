import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
let html = await readFile("dist/index.html", "utf8");
for (const match of [
  ...html.matchAll(/<script[^>]*src="([^"]+)"[^>]*><\/script>/g),
]) {
  const code = await readFile(join("dist", match[1]), "utf8");
  html = html.replace(match[0], "");
  // A classic inline script must run after #app exists. Vite's module script
  // was deferred automatically; the portable, file-friendly script is not.
  html = html.replace(
    "</body>",
    `<script>${code.replaceAll("</script", "<\\/script")}</script></body>`,
  );
}
for (const match of [
  ...html.matchAll(/<link[^>]*rel="stylesheet"[^>]*href="([^"]+)"[^>]*>/g),
]) {
  const css = await readFile(join("dist", match[1]), "utf8");
  html = html.replace(match[0], `<style>${css}</style>`);
}
html = html.replace(/<link[^>]*rel="modulepreload"[^>]*>/g, "");
await writeFile("dist/index.html", html);
console.log(
  "Aventura portátil: dist/index.html abre con doble clic, sin servidor ni conexión.",
);
