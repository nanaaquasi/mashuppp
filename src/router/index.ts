import { createRouter, createWebHistory } from "vue-router";
import Home from "/src/views/Home.vue";
import Redirect from "/src/views/Redirect.vue";
import Welcome from "/src/views/Welcome.vue";
const routes = [
  {
    path: "/",
    name: "Home",
    component: Home,
  },
  {
    path: "/redirect",
    name: "Redirect",
    component: Redirect,
  },
  {
    path: "/welcome",
    name: "Welcome",
    component: Welcome,
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export default router;
