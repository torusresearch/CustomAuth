import toruslabsReact from "@toruslabs/eslint-config-react";

export default [
  { ignores: [".next/", "public/", "next-env.d.ts", "**/*.json"] },
  ...toruslabsReact,
  {
    rules: {
      "no-console": "off",
      "simple-import-sort/imports": "off",
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-empty-object-type": "off",
    },
  },
];
