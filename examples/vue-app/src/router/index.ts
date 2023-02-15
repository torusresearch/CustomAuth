import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";

const routes: RouteRecordRaw[] = [
  {
    path: "/popupMode",
    name: "PopupLogin",
    component: () => import(/* webpackChunkName: "popupmode" */ "../views/PopupMode/Login.vue"),
  },
  {
    path: "/redirectMode",
    name: "RedirectLogin",
    component: () => import(/* webpackChunkName: "redirectmode" */ "../views/RedirectMode/Login.vue"),
  },
  {
    path: "/auth",
    name: "Auth",
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "auth" */ "../views/RedirectMode/Auth.vue"),
  },
  {
    path: "/",
    name: "HomePage",
    component: () => import(/* webpackChunkName: "root" */ "../HomePage.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
