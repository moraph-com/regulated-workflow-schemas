// ESLint flat config. TypeScript sources get typescript-eslint's recommended rules; the build scripts and tests are
// plain ESM JavaScript run by Node.js. Formatting is Prettier's job, so no stylistic rules here.
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["dist/", "src/generated/", "types/", "node_modules/"] },
  js.configs.recommended,
  { files: ["**/*.{js,mjs}"], languageOptions: { globals: globals.node } },
  ...tseslint.configs.recommended.map((c) => ({ ...c, files: ["src/**/*.ts"] })),
  {
    files: ["test/**/*.mjs"],
    rules: {
      "@typescript-eslint/no-unused-vars": "off",
      "no-unused-vars": ["error", { varsIgnorePattern: "^_", ignoreRestSiblings: true }],
    },
  },
);
