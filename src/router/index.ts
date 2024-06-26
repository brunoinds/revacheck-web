import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'
import Session from '@/views/Session.vue';
import Sessions from '@/views/Sessions.vue';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/sessions'
  },
  {
    path: '/sessions/:connectionId',
    component: Session
  },
  {
    path: '/sessions',
    component: Sessions
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
