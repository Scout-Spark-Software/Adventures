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
    // Disable all strict rules - Prettier handles formatting
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-require-imports": "off",
    "no-unused-vars": "off",
    "unused-imports/no-unused-imports": "off",
    "unused-imports/no-unused-vars": "off",

    "no-console": "off",
    "svelte/no-at-html-tags": "off",
    "svelte/valid-compile": "off",
    "svelte/no-navigation-without-resolve": "off",
    "svelte/require-each-key": "off",
    "svelte/require-event-dispatcher-types": "off",
    "svelte/no-immutable-reactive-statements": "off",
  },
};
