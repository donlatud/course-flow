import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import ComponentTestView from '@/views/Dev/ComponentTestView.vue'

const routes = [
  {
    path: '/',
    component: HomeView
  },{
  path: '/dev/components',
  component: ComponentTestView
}
]



const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router