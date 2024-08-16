import "./tailwind.css";

import { createApp } from "vue";
import { createI18n } from "vue-i18n";

import App from "./App.vue";
import createIcons from "./plugins/iconPlugin";
import en from "./translations/en.json";
import vi from "./translations/vi.json";

const i18n = createI18n({
  locale: "en",
  legacy: false,
  fallbackLocale: "en",
  messages: { vi, en },
});

createApp(App).use(createIcons).use(i18n).mount("#app");
