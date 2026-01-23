import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import eslintPluginUnicorn from "eslint-plugin-unicorn";
import tailwind from "eslint-plugin-tailwindcss";

/** @type {import('eslint').Linter.Config[]} */
const config = [
  {
    ignores: [
      ".next/**",
      "public/**",
      "next.config.js",
      "postcss.config.js",
      "tailwind.config.ts",
      "generated/**",
    ],
  },
  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}"] },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  eslintPluginUnicorn.configs.recommended,
  ...tailwind.configs["flat/recommended"],
  {
    settings: {
      react: {
        version: "detect",
      },
      next: {
        rootDir: ".",
      },
    },
  },
  {
    rules: {
      "no-undef": "off",
      "unicorn/no-single-promise-in-promise-methods": "off",
      "react/react-in-jsx-scope": "off",
      "tailwindcss/no-custom-classname": "off",
      "tailwindcss/enforces-negative-arbitrary-values": "off",
      "react-hooks/rules-of-hooks": "off",
      "unicorn/no-document-cookie": "off",
      "unicorn/explicit-length-check": "off",
      "@typescript-eslint/no-unused-vars": [
        "error", // or "error"
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "unicorn/prevent-abbreviations": "off",
      "unicorn/prefer-string-raw": "off",
      "unicorn/no-null": "off",
      "react-hooks/exhaustive-deps": "off",
      "jsx-a11y/role-supports-aria-props": "off",
      "unicorn/prefer-top-level-await": "off",
      "unicorn/no-process-exit": "off",
      "unicorn/no-lonely-if": "off",
      "unicorn/no-negated-condition": "off",
      "unicorn/no-useless-undefined": "off",
      "unicorn/prefer-ternary": "off",
      "unicorn/no-nested-ternary": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/consistent-function-scoping": "off",
      "unicorn/prefer-array-some": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/no-for-loop": "off",
      "unicorn/prefer-global-this": "off",
      "unicorn/switch-case-braces": "off",
      "unicorn/no-useless-switch-case": "off",
    },
  },
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "no-console": "off",
    },
  },
];
export default config;
