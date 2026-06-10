// ESLint flat config: @eslint/js + typescript-eslint + react-hooks.
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";

export default tseslint.config(
  {
    ignores: [
      "node_modules/",
      ".claude/",
      "dist/",
      "coverage/",
      "docs/",
      "playwright-report/",
      "test-results/",
      // Deno code — typechecked by `deno check` in CI, not part of the TS/Node
      // project ESLint is configured for. The vitest suites for these
      // functions (supabase/functions/tests) ARE linted.
      "supabase/functions/*/index.ts",
      "supabase/functions/_shared/",
      // build artifacts that may appear locally
      "vite.config.js",
      "vite.config.d.ts",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    plugins: { "react-hooks": reactHooks },
    rules: {
      // Core hook correctness rules. The plugin's v7 "recommended" preset
      // also ships React-Compiler diagnostics (purity, set-state-in-effect,
      // …) written for compiler adoption; this app doesn't use the compiler
      // and those flag idiomatic load-in-effect patterns wholesale, so only
      // the two classic rules are enabled — both as errors.
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
      // The codebase types Supabase rows/payloads loosely in places;
      // banning `any` wholesale would be churn without safety gain here.
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
);
