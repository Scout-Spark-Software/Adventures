module.exports = {
  root: true,
  extends: ["eslint:recommended", "plugin:svelte/recommended", "prettier"],
  parser: "@typescript-eslint/parser",
  plugins: ["@typescript-eslint", "unused-imports"],
  parserOptions: {
    sourceType: "module",
    ecmaVersion: 2020,
    extraFileExtensions: [".svelte"],
  },
  env: {
    browser: true,
    es2017: true,
    node: true,
  },
  overrides: [
    {
      files: ["*.svelte"],
      parser: "svelte-eslint-parser",
      parserOptions: {
        parser: "@typescript-eslint/parser",
      },
    },
  ],
  rules: {
    // Turn off strict TypeScript rules - we're focusing on functional code
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-require-imports": "off",
    "no-unused-vars": "off",

    // Use unused-imports plugin with warnings only
    "unused-imports/no-unused-imports": "warn",
    "unused-imports/no-unused-vars": "off", // Too noisy, disabled for now

    // General rules
    "no-console": ["warn", { allow: ["warn", "error"] }],

    // Svelte-specific rules
    "svelte/no-at-html-tags": "off", // We use {@html} safely with escaped content
    "svelte/valid-compile": "warn", // Downgrade a11y errors to warnings
    "svelte/no-navigation-without-resolve": "off", // Not using SvelteKit resolve in all cases
  },
};
