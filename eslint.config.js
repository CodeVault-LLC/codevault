//  @ts-check

import { tanstackConfig } from "@tanstack/eslint-config"

export default [
  ...tanstackConfig,
  {
    rules: {
      "import/no-cycle": "off",
      "import/order": "off",
      "sort-imports": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/require-await": "off",
      "pnpm/json-enforce-catalog": "off",
    },
  },
  {
    // .output is the Nitro build — bundled JS that is not in any tsconfig
    // project, so the typed parser errors on every file in it.
    ignores: ["eslint.config.js", ".prettierrc", ".output", "dist", "drizzle"],
  },
]
