import { createRouter, createWebHistory } from 'vue-router'


import HomeView from '@/views/HomeView.vue'
import RegisterView from '@/views/RegisterView.vue'
import LoginView from '@/views/LoginView.vue'

import CoursePage from '@/views/admin/CoursePage.vue'
import CourseCreatePage from '@/views/admin/CourseCreatePage.vue'
import CourseEditPage from '@/views/admin/CourseEditPage.vue'
import LessonCreatePage from '@/views/admin/LessonCreatePage.vue'
import LessonEditPage from '@/views/admin/LessonEditPage.vue'
import AdminLoginView from '@/views/admin/AdminLoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
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
      path: '/admin/course/:courseId/edit',
      name: 'admin-course-edit',
      component: CourseEditPage,
    },
    {
      path: '/admin/course/create/lesson',
      name: 'admin-course-create-lesson',
      component: LessonCreatePage,
    },
    {
      path: '/admin/course/create/lesson/:lessonId/edit',
      name: 'admin-course-create-lesson-edit',
      component: LessonEditPage,
    },
    {
      path: '/admin/login',
      name: 'admin-login',
      component: AdminLoginView,
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0, left: 0, behavior: 'smooth' }
  },
})

router.beforeEach((to) => {
  const isAdminRoute =
    typeof to.path === 'string' &&
    to.path.startsWith('/admin') &&
    to.path !== '/admin/login'

  if (isAdminRoute && !localStorage.getItem('admin_user_id')) {
    return { path: '/admin/login' }
  }
})

export default router
