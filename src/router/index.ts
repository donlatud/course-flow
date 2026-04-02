import { createRouter, createWebHistory } from 'vue-router'

import HomeView from '@/views/HomeView.vue'
import CoursePage from '@/views/admin/CoursePage.vue'
import CourseCreatePage from '@/views/admin/CourseCreatePage.vue'
import LessonCreatePage from '@/views/admin/LessonCreatePage.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'
import AdminLoginView from '@/views/admin/AdminLoginView.vue'

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
  {
    path: '/admin/course/create/lesson',
    name: 'admin-course-create-lesson',
    component: LessonCreatePage,
  },
  { path: "/admin/login", component: AdminLoginView },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, left: 0, behavior: 'smooth' }
  },
})

export default router
