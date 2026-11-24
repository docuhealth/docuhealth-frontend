/// <reference types="vitest/config" />
import { rmSync } from "node:fs";
import { fileURLToPath, URL } from "node:url";
import babel from "@rolldown/plugin-babel";
import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  return {
    // With VITE_API_PROXY (e.g. `npm run dev:staging`), the app calls its own origin and the dev
    // server forwards /api to the real API: no CORS, and its cookies are kept for this host.
    server:
      env.VITE_API_PROXY === "true"
        ? {
            proxy: {
              "/api": {
                target: env.VITE_API_URL,
                changeOrigin: true,
                secure: true,
                cookieDomainRewrite: "",
              },
            },
          }
        : undefined,
    plugins: [
      // Must run before the React plugin.
      tanstackRouter({ target: "react", autoCodeSplitting: true }),
      react(),
      babel({ presets: [reactCompilerPreset()] }),
      tailwindcss(),
      // public/ is copied into every build; the mock API's service worker is for the dev server.
      {
        name: "drop-mock-service-worker",
        apply: "build",
        closeBundle() {
          rmSync(fileURLToPath(new URL("./dist/mockServiceWorker.js", import.meta.url)), {
            force: true,
          });
        },
      },
    ],
    resolve: {
      alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) },
    },
    test: {
      environment: "jsdom",
      setupFiles: ["./src/test/setup.ts"],
      include: ["src/**/*.test.{ts,tsx}"],
      css: false,
      // The dialog-flow tests click through several steps; 5s is too tight when every file runs at once.
      testTimeout: 15_000,
    },
  };
});
