import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
const routes = [
  {
    path: '/',
    component: HomeView
  },
  {
    path: '/courses',
    component: () => import('@/views/Courses.vue')
  },
  {
    path: '/courses/:id',
    component: () => import('@/views/CourseDetail.vue')
  }
  ,
  { path: "/register", component: RegisterView },
  { path: "/login", component: LoginView },
]



const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router