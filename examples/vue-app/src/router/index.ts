import Vue from "vue";
import VueRouter from "vue-router";

import HomePage from "../HomePage.vue";
import PopupLogin from "../views/PopupMode/Login.vue";
import RedirectLogin from "../views/RedirectMode/Login.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/popupMode",
    name: "PopupLogin",
    component: PopupLogin,
  },
  {
    path: "/redirectMode",
    name: "RedirectLogin",
    component: RedirectLogin,
  },
  {
    path: "/auth",
    name: "Auth",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ "../views/RedirectMode/Auth.vue"),
  },
  {
    path: "/",
    name: "HomePage",
    component: HomePage,
  },
];

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes,
});

export default router;
