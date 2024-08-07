import "./tailwind.css";
import { createApp } from "vue";
import App from "@/App.vue";
import router from "@/router";
import createIcons from "@/plugins/iconPlugin";

createApp(App).use(router).use(createIcons).mount("#app");
