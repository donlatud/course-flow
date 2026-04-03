<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <main class="flex-1 px-4 py-8">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-body1 text-gray-600">Loading course...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex justify-center items-center py-12">
        <div class="text-body1 text-red-600">{{ error }}</div>
      </div>

      <!-- Course Detail -->
      <div v-else-if="course" class="max-w-7xl mx-auto">
          <!-- Back Button -->
          <button
            @click="goBack"
            class="relative flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
          >
            <img src="@/assets/icon-arrow-back-blue.svg" alt="arrow back" class="w-4 h-3">
            <span class="text-body2 text-blue-500 font-bold">Back</span>
          </button>

          <!-- Main Content Layout -->
          <div class="flex flex-col lg:flex-row gap-8">
            <!-- Left Content -->
            <div class="flex-1">
              <div class="flex flex-col gap-8">
                <!-- Course Image -->
                <div class="w-full">
                  <div class="relative">
                    <img
                      :src="course.coverImageUrl"
                      :alt="course.title"
                      class="w-full h-64 md:h-80 object-cover rounded-lg shadow-lg"
                    />
                  </div>
                </div>

                <!-- Course Info -->
                <div class="flex flex-col gap-4">
                  <span class="text-headline3 font-medium">Course Detail</span>
                  <p class="text-lg text-gray-600 mb-6 leading-relaxed">
                    {{ course.description }}
                  </p>
                </div>

                <!-- Course Content -->
                <div class="mt-8">
                  <CourseContent 
                    :course-id="Number(route.params.id)"
                    @lesson-selected="handleLessonSelected"
                  />
                </div>

                <!-- Other Interesting Courses -->
                <div class="flex flex-col  items-center gap-15 py-15">
                  <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Other Interesting Courses
                  </h2>
                  <div class="flex flex-col md:flex-row gap-6">
                    <CourseCard
                      v-for="course in otherCourses"
                      :key="course.id"
                      :image="course.coverImageUrl"
                      :title="course.title"
                      :description="course.description"
                      :lesson="course.lesson || 0"
                      :duration="course.duration || 'N/A'"
                      :course-id="Number(course.id)"
                    />
                  </div>
                </div>
              </div>
            </div>

            <!-- Desktop Right Sidebar -->
            <div class="hidden lg:block w-80 shrink-0">
              <CourseSidebar 
                :course="course"
                :is-purchased="isPurchased"
              />
            </div>
          </div>

          <!-- Mobile Sticky Sidebar -->
          <div
            class="lg:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 z-50"
          >
            <div class="flex flex-col items-start justify-between gap-2">
              <div class="flex flex-col items-start justify-between w-full">
                <span v-if="showDescription" class="text-body4 text-orange-500 items-start">Course</span>
                <div class="flex items-start justify-between w-full">
                  <h1 class="text-body2 flex-1 pr-2">{{ course?.title }}</h1>
                  <button
                    @click="toggleDescription"
                    class="p-1 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <img
                      src="@/assets/icon-arrow-down.svg"
                      alt="Arrow Down"
                      class="w-[10px] h-[5px] transform transition-transform duration-200"
                      :class="{ 'rotate-180': showDescription }"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                      />
                    </img>
                  </button>
                </div>
                <!-- Course Description (Expandable) -->
                <div
                  v-if="showDescription"
                  class="border-gray-200"
                >
                  <p class="text-body4 text-gray-700 leading-relaxed">
                    {{ course?.description }}
                  </p>
                </div>
              </div>
              <div class="text-body2 text-gray-700">
                THB {{ course?.price }}
              </div>
              <div class="flex gap-2 w-full">
                <SecondaryButton class="w-1/2 h-8.5 text-[12px] font-bold">
                  Add to Wishlist
                </SecondaryButton>
                <PrimaryButton class="w-1/2 h-8.5 text-[12px] font-bold" @click="goToCheckout">
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
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "@/components/shared/Navbar.vue";
import AppFooter from "@/components/shared/AppFooter.vue";
import CourseCard from "@/components/courses/CourseCard.vue";
import CourseContent from "@/components/courses/CourseContent.vue";
import CourseSidebar from "@/components/courses/CourseSidebar.vue";
import { courseService } from "@/services/courseService";
import type { Course, Lesson } from "@/types/course";
import PrimaryButton from "@/components/base/button/PrimaryButton.vue";
import SecondaryButton from "@/components/base/button/SecondaryButton.vue";


const route = useRoute();
const router = useRouter();

const course = ref<Course | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const allCourses = ref<Course[]>([]);
const showDescription = ref(false);
const isPurchased = ref(false); // Set to true if user has purchased this course

const otherCourses = computed(() => {
  if (!course.value) return [];

  return allCourses.value.filter((c) => c.id !== course.value!.id).slice(0, 3);
});

const toggleDescription = () => {
  showDescription.value = !showDescription.value;
};

const goBack = () => {
  router.push("/courses");
};

const goToCheckout = () => {
  router.push({
    name: "checkout",
    params: { courseId: String(route.params.id) },
  });
};

const handleLessonSelected = (lesson: Lesson) => {
  console.log('Selected lesson:', lesson);
  // TODO: Navigate to lesson player or show lesson content
};

onMounted(async () => {
  try {
    loading.value = true;

    // Load all courses for recommendations
    const allCoursesData = await courseService.getAllCourses();
    allCourses.value = allCoursesData;

    // Load current course
    const courseId = String(route.params.id);

    if (!courseId) {
      error.value = "Invalid course ID";
      return;
    }

    const courseData = await courseService.getCourseById(courseId);

    if (!courseData) {
      error.value = "Course not found";
      return;
    }

    course.value = courseData;
  } catch (err) {
    error.value = "Failed to load course";
    console.error("Error loading course:", err);
  } finally {
    loading.value = false;
  }
});
</script>
