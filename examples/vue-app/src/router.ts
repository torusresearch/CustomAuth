import { createRouter, createWebHistory } from "vue-router";

const Home = () => import("@/views/Home.vue");
const PopupLogin = () => import("@/views/PopupMode/Login.vue");
const RedirectLogin = () => import("@/views/RedirectMode/Login.vue");
const Dashboard = () => import("@/views/RedirectMode/Auth.vue");

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: "/", component: Home },
    { path: "/popupMode", component: PopupLogin },
    { path: "/redirectMode", component: RedirectLogin },
    { path: "/auth", component: Dashboard },
  ],
});

export default router;
