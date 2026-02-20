import prettier from "eslint-config-prettier";
import path from "node:path";
import { includeIgnoreFile } from "@eslint/compat";
import js from "@eslint/js";
import svelte from "eslint-plugin-svelte";
import unusedImports from "eslint-plugin-unused-imports";
import { defineConfig } from "eslint/config";
import globals from "globals";
import ts from "typescript-eslint";
import svelteConfig from "./svelte.config.js";

const gitignorePath = path.resolve(import.meta.dirname, ".gitignore");

export default defineConfig(
  // Ignore patterns (migrated from .eslintignore)
  {
    ignores: [
      "build/**",
      ".svelte-kit/**",
      "package/**",
      ".vercel/**",
      ".netlify/**",
      ".output/**",
      "dist/**",
      "drizzle/meta/**",
      "drizzle/schema.ts",
      "drizzle/relations.ts",
      "tailwind.config.js",
      "postcss.config.js",
      "scripts/migrate*.ts",
      "scripts/check*.ts",
      "scripts/fix*.ts",
      "scripts/test*.ts",
      "scripts/run*.ts",
    ],
  },
  includeIgnoreFile(gitignorePath),
  js.configs.recommended,
  ...ts.configs.recommended,
  ...svelte.configs.recommended,
  prettier,
  ...svelte.configs.prettier,
  // Rules for TS/JS files (not Svelte)
  {
    files: ["**/*.ts", "**/*.js", "**/*.mts", "**/*.mjs"],
    plugins: {
      "unused-imports": unusedImports,
    },
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      // typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
      // see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
      "no-undef": "off",

      // Unused imports / vars
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        {
          vars: "all",
          varsIgnorePattern: "^_",
          args: "after-used",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "@typescript-eslint/no-unused-vars": "off", // handled by unused-imports above

      // TypeScript quality rules
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
  // Global rules (all files)
  {
    languageOptions: { globals: { ...globals.browser, ...globals.node } },
    rules: {
      "no-undef": "off",
    },
  },
  // Svelte-specific config
  {
    files: ["**/*.svelte", "**/*.svelte.ts", "**/*.svelte.js"],
    languageOptions: {
      parserOptions: {
        projectService: true,
        extraFileExtensions: [".svelte"],
        parser: ts.parser,
        svelteConfig,
      },
    },
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      // These rules require the new Svelte 5 navigation resolve() API - disable for now
      "svelte/no-navigation-without-resolve": "off",
      // URLSearchParams is fine without SvelteURLSearchParams in non-reactive contexts
      "svelte/prefer-svelte-reactivity": "off",
    },
  }
);
