import { defineConfig } from "vite";
export default defineConfig({
  base: "./",
  build: {
    modulePreload: false,
    target: "es2022",
    cssCodeSplit: false,
    rollupOptions: { output: { format: "iife", inlineDynamicImports: true } },
  },
});
