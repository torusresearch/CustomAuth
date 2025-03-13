import toruslabsVue from "@toruslabs/eslint-config-vue";

export default [
  ...toruslabsVue,
  {
    rules: {
      "no-unused-vars": "off",
      "no-implicit-any": "off",
    },
  },
];
