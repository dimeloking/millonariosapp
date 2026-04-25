import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierConfig from "eslint-config-prettier";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Must be last: disables ESLint rules that conflict with Prettier formatting.
  prettierConfig,
  globalIgnores([
    ".next/**",
    ".agents/**",
    "AppWeb-React/**",
    "docs/AppWeb-React/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "drizzle/**",
  ]),
]);

export default eslintConfig;
