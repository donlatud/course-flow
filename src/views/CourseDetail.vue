<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <main class="flex-1 px-4 py-8 md:px-40">
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-body1 text-gray-600">Loading course...</div>
      </div>

      <div v-else-if="error" class="flex justify-center items-center py-12">
        <div class="text-body1 text-red-600">{{ error }}</div>
      </div>

      <div v-else-if="course" class="mx-auto">
        <button
          @click="goBack"
          class="relative flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
        >
          <img src="@/assets/icon-arrow-back-blue.svg" alt="arrow back" class="w-4 h-3">
          <span class="text-body2 text-blue-500 font-bold">Back</span>
        </button>

        <div class="flex flex-col lg:flex-row gap-8 w-full pb-25">
          <div class="flex-1">
            <div class="flex flex-col gap-8">
              <div class="w-full h-[213.5px] md:h-115">
                <div class="relative h-[213.5px] md:h-115">
                  <video
                    v-if="course.trailerVideoUrl"
                    :src="course.trailerVideoUrl"
                    controls
                    class="w-full h-[213.5px] md:h-115 rounded-lg shadow-lg bg-black"
                  >
                    Your browser does not support the video tag.
                  </video>
                  <div
                    v-else
                    class="w-full h-[213.5px] md:h-115 rounded-lg shadow-lg bg-gray-200 flex items-center justify-center"
                  >
                    <img :src="course.coverImageUrl" :alt="course.title" class="w-full h-full object-cover rounded-lg" />
                  </div>
                </div>
              </div>

                <!-- Course Info -->
                <div class="flex flex-col gap-4">
                  <span class="md:text-headline2 text-headline3 font-medium">Course Detail</span>
                  <p class="md:text-body2 text-body3 text-gray-600 mb-6 leading-relaxed">
                    {{ course.description }}
                  </p>
                </div>

              <div class="mt-8">
                <CourseContent :modules="course.modules || []" @material-selected="handleMaterialSelected" />
              </div>
            </div>
          </div>

          <!-- Desktop Right Sidebar -->
          <div class="hidden lg:block w-[357px] shrink-0">
            <CourseSidebar
              :course="course"
              :is-purchased="isPurchased"
              :is-in-wishlist="isInWishlist"
              @subscribe="goToCheckout"
              @start-learning="goToLearning"
              @wishlist="onWishlist"
            />
          </div>
        </div>

        <!-- Other Interesting Courses -->
        <div class="flex flex-col items-center gap-15 py-15 bg-gray-100 w-screen ml-[calc(-50vw+50%)] -mb-8">
          <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">Other Interesting Courses</h2>
          <div class="flex flex-col md:flex-row gap-6 2xl:gap-10">
            <CourseCard
              v-for="course in otherCourses"
              :key="course.id"
              :image="course.coverImageUrl"
              :title="course.title"
              :description="course.description"
              :lesson="course.lessonCount || 0"
              :duration="course.totalLearningTime || 'N/A'"
              :course-id="course.id"
            />
          </div>
        </div>

        <!-- Mobile Sticky Sidebar -->
        <div class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50">
          <div class="flex flex-col items-start justify-between gap-2">
            <div class="flex flex-col items-start justify-between w-full">
              <span v-if="showDescription" class="text-body4 text-orange-500 items-start">Course</span>
              <div class="flex items-start justify-between w-full">
                <h1 class="text-body2 flex-1 pr-2">{{ course?.title }}</h1>
                <button @click="toggleDescription" class="p-1 text-gray-600 hover:text-gray-900 transition-colors">
                  <img
                    src="@/assets/icon-arrow-down.svg"
                    alt="Arrow Down"
                    class="w-[10px] h-[5px] transform transition-transform duration-200"
                    :class="{ 'rotate-180': showDescription }"
                  />
                </button>
              </div>
              <div v-if="showDescription" class="border-gray-200">
                <p class="text-body4 text-gray-700 leading-relaxed">{{ course?.description }}</p>
              </div>
            </div>
            <div v-if="!isPurchased" class="text-body2 text-gray-700">THB {{ course?.price }}</div>
            <div v-if="isPurchased" class="flex w-full">
              <PrimaryButton class="w-full h-8.5 text-[12px] font-bold" type="button" @click="goToLearning">
                Start Learning
              </PrimaryButton>
            </div>
            <div v-else class="flex gap-2 w-full">
              <SecondaryButton
                v-if="!isInWishlist"
                class="w-1/2 h-8.5 text-[12px] font-bold"
                type="button"
                @click="onWishlist"
              >
                Add to Wishlist
              </SecondaryButton>
              <PrimaryButton
                :class="isInWishlist ? 'w-full' : 'w-1/2'"
                class="h-8.5 text-[12px] font-bold"
                type="button"
                @click="goToCheckout"
              >
                Subscribe This Course
              </PrimaryButton>
            </div>
          </div>
        </div>
      </div>
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "@/components/shared/Navbar.vue";
import AppFooter from "@/components/shared/AppFooter.vue";
import CourseCard from "@/components/courses/CourseCard.vue";
import CourseContent from "@/components/courses/CourseContent.vue";
import CourseSidebar from "@/components/courses/CourseSidebar.vue";
import { courseService } from "@/services/courseService";
import { api } from "@/lib/api";
import type { Course, Material } from "@/types/course";
import PrimaryButton from "@/components/base/button/PrimaryButton.vue";
import SecondaryButton from "@/components/base/button/SecondaryButton.vue";
import { useAuth } from "@/composables/useAuth";

interface EnrollmentItem {
  enrollmentId: string;
  courseId: string;
}

const route = useRoute();
const router = useRouter();
const { user, isReady } = useAuth();

const course = ref<Course | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const allCourses = ref<Course[]>([]);
const showDescription = ref(false);
const isPurchased = ref(false);
const isInWishlist = ref(false);
const isInitialLoadComplete = ref(false);

const checkEnrollment = async (courseId: string) => {
  if (!user.value) { isPurchased.value = false; return; }
  try {
    const res = await api.get<EnrollmentItem[]>("/api/enrollments/my");
    isPurchased.value = res.data.some((e) => e.courseId === courseId);
  } catch {
    isPurchased.value = false;
  }
};

const checkWishlistStatus = async (courseId: string) => {
  console.log("checkWishlistStatus called, user:", user.value)
  if (!user.value) { isInWishlist.value = false; return; }
  try {
    const res = await api.get(`/api/wishlists/${courseId}/status`);
    console.log("wishlist status:", res.data)
    isInWishlist.value = res.data.isInWishlist;
  } catch {
    isInWishlist.value = false;
  }
};

const otherCourses = computed(() => {
  if (!course.value) return [];
  return allCourses.value.filter((c) => c.id !== course.value!.id).slice(0, 3);
});

const toggleDescription = () => { showDescription.value = !showDescription.value; };
const goBack = () => { router.push("/courses"); };

const pushLoginWithRedirect = (fullPath: string) => {
  router.push({ name: "login", query: { redirect: fullPath } });
};

const goToCheckout = async () => {
  if (!course.value || !isReady.value) return;
  if (!user.value) {
    pushLoginWithRedirect(router.resolve({ name: "payment-checkout", params: { courseId: String(route.params.id) } }).fullPath);
    return;
  }
  // ลบออกจาก wishlist ก่อนไป checkout
  if (isInWishlist.value) {
    try {
      await api.delete(`/api/wishlists/${course.value.id}`);
      isInWishlist.value = false;
    } catch { /* ignore */ }
  }
  router.push({ name: "payment-checkout", params: { courseId: String(route.params.id) } });
};

const goToLearning = () => {
  if (!course.value) return;
  router.push({ name: "course-learning", params: { courseId: String(route.params.id) } });
};

const onWishlist = async () => {
  if (!course.value || !isReady.value) return;
  if (!user.value) {
    pushLoginWithRedirect(router.resolve({ name: "course-detail", params: { id: String(route.params.id) } }).fullPath);
    return;
  }
  try {
    await api.post(`/api/wishlists/${course.value.id}`);
    isInWishlist.value = true;
    router.push("/my-wishlist");
  } catch (err: any) {
    if (err?.response?.status === 409) {
      isInWishlist.value = true;
    }
  }
};

const handleMaterialSelected = (material: Material) => {
  console.log("Selected material:", material);
};

const loadCourse = async (courseId: string) => {
  try {
    loading.value = true;
    error.value = null;
    if (!courseId) { error.value = "Invalid course ID"; loading.value = false; return; }
    const courseData = await courseService.getCourseById(courseId);
    if (!courseData) { error.value = "Course not found"; loading.value = false; return; }
    course.value = courseData;
    await new Promise((resolve) => setTimeout(resolve, 500));
  } catch (err) {
    error.value = "Failed to load course. Please try again later.";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    const allCoursesData = await courseService.getAllCourses();
    allCourses.value = allCoursesData;
    const courseId = String(route.params.id);
    await loadCourse(courseId);

    // รอ isReady ก่อน
    if (!isReady.value) {
      const unwatch = watch(isReady, async (ready) => {
        if (ready) {
          unwatch()
          await checkEnrollment(courseId);
          await checkWishlistStatus(courseId);
        }
      })
    } else {
      await checkEnrollment(courseId);
      await checkWishlistStatus(courseId);
    }
  } catch (err) {
    error.value = "Failed to load data. Please try again later.";
    loading.value = false;
  } finally {
    isInitialLoadComplete.value = true;
  }
});

watch(() => route.params.id, async (newId, oldId) => {
  if (isInitialLoadComplete.value && newId && newId !== oldId) {
    await loadCourse(String(newId));
    await checkEnrollment(String(newId));
    await checkWishlistStatus(String(newId));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
});

watch([isReady, user], async ([ready]) => {
  if (ready && isInitialLoadComplete.value && route.params.id) {
    await checkEnrollment(String(route.params.id));
    await checkWishlistStatus(String(route.params.id));
  }
});
</script>