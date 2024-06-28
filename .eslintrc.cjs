const { resolve } = require("node:path");

const project = resolve(__dirname, "tsconfig.json");

module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "plugin:react-hooks/recommended",

    require.resolve("@vercel/style-guide/eslint/browser"),
    require.resolve("@vercel/style-guide/eslint/react"),
  ],
  rules: {
    "unicorn/filename-case": "off",
    "react/function-component-definition": [
      2,
      {
        namedComponents: "arrow-function",
        unnamedComponents: "arrow-function",
      },
    ],
  },
  parserOptions: {
    project,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  parser: "@typescript-eslint/parser",
  plugins: ["react-refresh"],
};
