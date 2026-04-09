<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <main class="flex-1 px-4 py-8 md:px-40">
      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-12">
        <div class="text-body1 text-gray-600">Loading course...</div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="flex justify-center items-center py-12">
        <div class="text-body1 text-red-600">{{ error }}</div>
      </div>

      <!-- Course Detail -->
      <div v-else-if="course" class=" mx-auto ">
          <!-- Back Button -->
          <button
            @click="goBack"
            class="relative flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-4 cursor-pointer"
          >
            <img src="@/assets/icon-arrow-back-blue.svg" alt="arrow back" class="w-4 h-3">
            <span class="text-body2 text-blue-500 font-bold">Back</span>
          </button>

          <!-- Main Content Layout -->
          <div class="flex flex-col lg:flex-row gap-8 w-full pb-25">
            <!-- Left Content -->
            <div class="flex-1">
              <div class="flex flex-col gap-8">
                <!-- Course Video -->
                <div class="w-full  h-[213.5px] md:h-115">
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
                      <img
                        :src="course.coverImageUrl"
                        :alt="course.title"
                        class="w-full h-full object-cover rounded-lg"
                      />
                    </div>
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
                    :modules="course.modules || []"
                    @material-selected="handleMaterialSelected"
                  />
                </div>

              </div>
            </div>

            <!-- Desktop Right Sidebar -->
            <div class="hidden lg:block w-[357px] shrink-0">
              <CourseSidebar 
                :course="course"
                :is-purchased="isPurchased"
              />
            </div>
          </div>

                          <!-- Other Interesting Courses -->
                <div class="flex flex-col items-center gap-15 py-15 bg-gray-100 w-screen ml-[calc(-50vw+50%)] -mb-8">
                  <h2 class="text-2xl font-bold text-gray-900 mb-6 text-center">
                    Other Interesting Courses
                  </h2>
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
import { ref, onMounted, computed, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Navbar from "@/components/shared/Navbar.vue";
import AppFooter from "@/components/shared/AppFooter.vue";
import CourseCard from "@/components/courses/CourseCard.vue";
import CourseContent from "@/components/courses/CourseContent.vue";
import CourseSidebar from "@/components/courses/CourseSidebar.vue";
import { courseService } from "@/services/courseService";
import type { Course, Material } from "@/types/course";
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
const isInitialLoadComplete = ref(false);

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

const handleMaterialSelected = (material: Material) => {
  console.log('Selected material:', material);
  // TODO: Navigate to video player or show material content
};

// Load course by ID
const loadCourse = async (courseId: string) => {
  console.log("CourseDetail loadCourse called with:", courseId)
  console.log("Current route params:", route.params)
  try {
    loading.value = true;
    error.value = null;
    
    // Load current course
    if (!courseId) {
      error.value = "Invalid course ID";
      loading.value = false;
      return;
    }

    const courseData = await courseService.getCourseById(courseId);

    if (!courseData) {
      error.value = "Course not found";
      loading.value = false;
      return;
    }

    course.value = courseData;
    
    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    
  } catch (err) {
    console.error("Error loading course:", err);
    error.value = "Failed to load course. Please try again later.";
  } finally {
    loading.value = false;
  }
};

onMounted(async () => {
  try {
    // Load all courses for recommendations
    const allCoursesData = await courseService.getAllCourses();
    allCourses.value = allCoursesData;

    // Load current course
    const courseId = String(route.params.id);
    await loadCourse(courseId);
  } catch (err) {
    console.error("Error in onMounted:", err);
    error.value = "Failed to load data. Please try again later.";
    loading.value = false;
  } finally {
    isInitialLoadComplete.value = true;
  }
});

// Watch for route changes and reload course (skip initial mount)
watch(() => route.params.id, async (newId, oldId) => {
  // Only reload if initial load is done and route actually changed
  if (isInitialLoadComplete.value && newId && newId !== oldId) {
    await loadCourse(String(newId));
    // Scroll to top when navigating to new course
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
</script>
