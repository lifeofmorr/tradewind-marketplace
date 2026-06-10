import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: { port: 5173 },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("react-router")) return "router";
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) return "react";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("@sentry")) return "sentry";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("lucide-react")) return "icons";
          if (id.includes("@radix-ui")) return "radix";
          if (id.includes("@tanstack")) return "query";
          return undefined;
        },
      },
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./src/__tests__/setup.ts"],
    // Map the edge functions' Deno URL imports onto local equivalents so the
    // real function code can run under vitest (see
    // supabase/functions/tests/helpers/edge-harness.ts).
    alias: {
      "https://deno.land/std@0.168.0/http/server.ts": path.resolve(
        __dirname,
        "./supabase/functions/tests/helpers/deno-std-server-shim.ts",
      ),
      "https://esm.sh/@supabase/supabase-js@2.45.4": "@supabase/supabase-js",
      "https://esm.sh/@supabase/supabase-js@2": "@supabase/supabase-js",
    },
    exclude: [
      "**/node_modules/**",
      "**/dist/**",
      "**/.claude/**",
      "e2e/**", // Playwright specs — run via `npm run test:e2e`
      "**/playwright-report/**",
      "**/test-results/**",
      "**/cypress/**",
      "**/.{idea,git,cache,output,temp}/**",
    ],
  },
});
