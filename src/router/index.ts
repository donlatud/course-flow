import { createRouter, createWebHistory } from "vue-router";
import HomeView from "@/views/HomeView.vue";
import CoursePage from "@/views/admin/CoursePage.vue";
import CourseCreatePage from "@/views/admin/CourseCreatePage.vue";
import LessonCreatePage from "@/views/admin/LessonCreatePage.vue";
import AssignmentPage from "@/views/admin/AssignmentPage.vue";
import AdminLoginView from "@/views/admin/AdminLoginView.vue";
import RegisterView from "@/views/RegisterView.vue";
import LoginView from "@/views/LoginView.vue";
import Courses from "@/views/Courses.vue";
import CourseDetail from "@/views/CourseDetail.vue";
import CourseLearningPage from "@/views/CourseLearningPage.vue";
import LessonEditPage from "@/views/admin/LessonEditPage.vue";
import CourseEditPage from "@/views/admin/CourseEditPage.vue";
import PromoCodePage from "@/views/admin/PromoCodePage.vue";
import PromoCodeCreatePage from "@/views/admin/PromoCodeCreatePage.vue";
import AssignmentEditPage from "@/views/admin/AssignmentEditPage.vue";
import AssignmentCreatePage from "@/views/admin/AssignmentCreatePage.vue";
import CheckoutView from "@/views/payment/CheckoutView.vue";
import CompletedView from "@/views/payment/CompletedView.vue";
import FailedView from "@/views/payment/FailedView.vue";
import MyCoursesView from "@/views/MyCoursesView.vue";
import ProfileView from "@/views/ProfileView.vue";
import MyAssignmentsView from "@/views/MyAssignmentsView.vue";
import CourseAssignmentsView from "@/views/CourseAssignmentsView.vue";
import axios from "axios";
import MyWishlistView from "@/views/MyWishlistView.vue";
import { api } from "@/lib/api";
import { hasApiAuthToken } from "@/lib/adminSession";

const ADMIN_LOGIN_PATH = "/admin/login";


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
      name: "payment-checkout",
      component: CheckoutView,
    },
    {
      path: "/courses/:courseId/payment-completed",
      name: "payment-completed",
      component: CompletedView,
    },
    {
      path: "/courses/:courseId/payment-failed",
      name: "payment-failed",
      component: FailedView,
    },
    { path: "/register", name: "register", component: RegisterView },
    { path: "/login", name: "login", component: LoginView },
    { path: "/my-courses", name: "my-courses", component: MyCoursesView },
    { path: "/my-wishlist", name: "my-wishlist", component: MyWishlistView },
    {
      path: "/my-assignments",
      name: "my-assignments",
      component: MyAssignmentsView,
    },
    {
      path: "/my-assignments/:courseId",
      name: "course-assignments",
      component: CourseAssignmentsView,
    },
    { path: "/profile", name: "profile", component: ProfileView },
    {
      path: "/admin/promo-code",
      name: "admin-promo-code",
      component: PromoCodePage,
    },
    {
      path: "/admin/promo-code/create",
      name: "admin-promo-code-create",
      component: PromoCodeCreatePage,
    },
    {
      path: "/admin/promo-code/:promoId/edit",
      name: "admin-promo-code-edit",
      component: PromoCodeCreatePage,
    },
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
    {
      path: "/admin/assignment",
      name: "admin-assignment",
      component: AssignmentPage,
    },
    {
      path: "/admin/assignment/:assignmentId/edit",
      name: "admin-assignment-edit",
      component: AssignmentEditPage,
    },
    {
      path: "/admin/assignment/create",
      name: "admin-assignment-create",
      component: AssignmentCreatePage,
    },
  ],
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) return savedPosition;
    return { top: 0, left: 0, behavior: "smooth" };
  },
});

router.beforeEach(async (to) => {
  const inAdminArea = to.path.startsWith("/admin");
  if (!inAdminArea || to.path === ADMIN_LOGIN_PATH) {
    return true;
  }

  if (!(await hasApiAuthToken())) {
    return { path: ADMIN_LOGIN_PATH, query: { redirect: to.fullPath } };
  }

  try {
    /** ไม่ให้ interceptor ทำ window.location บน 401 — ให้ guard ตัดสิน (กันสับสนกับ 5xx / network) */
    const { data: me } = await api.get<{ role: string }>("/api/users/me", {
      skipAuthRedirect: true,
    });
    if (me.role !== "ADMIN") {
      return { path: "/", replace: true };
    }
  } catch (e) {
    const status = axios.isAxiosError(e) ? e.response?.status : undefined;
    /** เฉพาะ “ไม่ได้รับรองตัวตน” ถึงไป login; 404/5xx/timeout ไม่ใช่ token หมดอายุ */
    if (status === 401) {
      return { path: ADMIN_LOGIN_PATH, query: { redirect: to.fullPath } };
    }
    return true;
  }

  return true;
});

export default router;
