import Vue from "vue";
import VueRouter from "vue-router";
import Browse from "../views/Browse.vue";

Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    component: Browse
  }
];

const router = new VueRouter({
  routes
});

export default router;
