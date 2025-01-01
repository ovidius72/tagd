import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommended,
  prettierConfig,
  {
    rules: {
      "linebreak-style": "off",
      "jest/no-done-callback": "off",
      "react/react-in-jsx-scope": "off",
      "import/extensions": "off",
      "comma-dangle": ["off", "only-multiline"],
      "@typescript-eslint/comma-dangle": ["off", "only-multiline"],
      "@typescript-eslint/naming-convention": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          vars: "all",
          ignoreRestSiblings: true,
          varsIgnorePattern: "^_",
          argsIgnorePattern: "^_",
        },
      ],
      "import/no-extraneous-dependencies": [
        "off",
        {
          devDependencies: false,
          optionalDependencies: false,
          peerDependencies: false,
        },
      ],
    },
  },
);

// export default [
//   {
//     rules: {
//       semi: "error",
//       "prefer-const": "error",
//     },
//   },
// ];

