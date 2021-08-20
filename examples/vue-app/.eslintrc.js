module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: ["plugin:vue/essential", "eslint:recommended", "@vue/typescript/recommended", "@vue/prettier", "@vue/prettier/@typescript-eslint"],
  plugins: ["simple-import-sort"],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    "no-console": "off",
    "simple-import-sort/imports": 2,
    "simple-import-sort/exports": 2,
    "prettier/prettier": [
      2,
      {
        singleQuote: false,
        printWidth: 150,
        semi: true,
      },
    ],
  },
};
