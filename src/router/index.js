import Vue from 'vue'
import VueRouter from 'vue-router'
import Main from '@/views/Main.vue'
import AuthResult from "@/components/AuthResult";

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Main',
    component: Main
  },
  {
    path: '/auth-result',
    name: 'Auth',
    component: AuthResult
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
