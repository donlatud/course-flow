import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import CoursePage from "@/views/admin/CoursePage.vue";
import CourseCreatePage from "@/views/admin/CourseCreatePage.vue";
import LessonCreatePage from "@/views/admin/LessonCreatePage.vue";
import AdminLoginView from "@/views/admin/AdminLoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import LoginView from "@/views/LoginView.vue";
import Courses from "@/views/Courses.vue";
import CourseDetail from "@/views/CourseDetail.vue";
import CourseLearningPage from "@/views/CourseLearningPage.vue";
import LessonEditPage from "@/views/admin/LessonEditPage.vue";
import CourseEditPage from "@/views/admin/CourseEditPage.vue";
import CheckoutView from "@/views/payment/CheckoutView.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: HomeView,
    },
    {
      path: "/courses",
      name: "courses",
      component: Courses,
    },
    {
      path: "/courses/:id",
      name: "course-detail",
      component: CourseDetail,
    },
    {
      path: "/courses/:courseId/learning",
      name: "course-learning",
      component: CourseLearningPage,
    },
    {
      path: "/courses/:courseId/checkout",
      name: "checkout",
      component: CheckoutView,
    },
    { path: "/register", name: "register", component: RegisterView },
    { path: "/login", name: "login", component: LoginView },
    {
      path: "/admin/course",
      name: "admin-course",
      component: CoursePage,
    },
    {
      path: "/admin/course/create",
      name: "admin-course-create",
      component: CourseCreatePage,
    },
    {
      path: "/admin/login",
      name: "admin-login",
      component: AdminLoginView,
    },
    {
      path: "/admin/course/create/lesson",
      name: "admin-course-create-lesson",
      component: LessonCreatePage,
    },
    {
      path: "/admin/course/:courseId/edit",
      name: "admin-course-edit",
      component: CourseEditPage,
    },
    {
      path: "/admin/course/create/lesson/:lessonId/edit",
      name: "admin-course-create-lesson-edit",
      component: LessonEditPage,
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, left: 0, behavior: "smooth" };
  },
});

export default router;
