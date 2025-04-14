import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig, globalIgnores } from "eslint/config";
import reactRefresh from "eslint-plugin-react-refresh";

export default defineConfig([
  js.configs.recommended,
  tseslint.configs.recommended,

  globalIgnores([
    "node_modules",
    "dist",
    "tailwind.config.js",
    "vite.config.ts",
  ]),

  {
    languageOptions: {
      globals: {
        browser: true,
        es2020: true,
      },
      parser: tseslint.parser,
    },

    plugins: {
      "react-refresh": reactRefresh,
      "react-hooks": reactHooks,
    },

    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
]);
