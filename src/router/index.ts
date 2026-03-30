import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import CoursePage from '@/views/admin/CoursePage.vue'
import CourseCreatePage from '@/views/admin/CourseCreatePage.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
const routes = [
  {
    path: '/',
    component: HomeView,
  },
  {
    path: '/admin/course',
    name: 'admin-course',
    component: CoursePage,
  },
  {
    path: '/admin/course/create',
    name: 'admin-course-create',
    component: CourseCreatePage,
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
  routes,
})

export default router
