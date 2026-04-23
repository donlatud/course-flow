<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/shared/Navbar.vue";
import CustomTabs from "@/components/base/input/CustomTabs.vue";
import AppFooter from "@/components/shared/AppFooter.vue";
import UserProfileCard from "@/components/my-course/UserProfileCard.vue";
import CourseCard from "@/components/courses/CourseCard.vue";
import { api } from "@/lib/api";
import { useAuth } from "@/composables/useAuth";
import profileIcon from "@/assets/icon-profile.svg";

/* ================= TYPES ================= */
const { userProfile } = useAuth();
const profilePic = computed(
  () => userProfile.value?.profilePictureUrl || profileIcon,
);
const displayName = computed(() => userProfile.value?.fullName || "Guest User");

interface EnrollmentResponse {
  enrollmentId: string;
  courseId: string;
  courseTitle: string;
  courseDescription: string;
  coverImageUrl: string;
  progressPercentage: number;
  status: "ACTIVE" | "COMPLETED" | "UNSUBSCRIBED";
  totalHours: number;
  lessonCount: number;
}

/* ================= STATE ================= */

const activeTab = ref("all");
const courses = ref<EnrollmentResponse[]>([]);
const isLoading = ref(true);

const tabs = [
  { value: "all", label: "All Courses" },
  { value: "inprogress", label: "Inprogress" },
  { value: "completed", label: "Completed" },
];

/* ================= API ================= */

const fetchMyCourses = async () => {
  isLoading.value = true;
  try {
    const response = await api.get<EnrollmentResponse[]>("/api/enrollments/my");

    courses.value = response.data;
  } catch (error) {
    console.error(error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchMyCourses);

/* ================= FILTER ================= */

const filteredCourses = computed(() => {
  if (activeTab.value === "all") return courses.value;

  if (activeTab.value === "inprogress") {
    return courses.value.filter(
      (c) => c.progressPercentage >= 0 && c.progressPercentage < 100,
    );
  }

  if (activeTab.value === "completed") {
    return courses.value.filter((c) => c.progressPercentage === 100);
  }

  return courses.value;
});

/* ================= COUNT ================= */

const inProgressCount = computed(
  () =>
    courses.value.filter(
      (c) => c.progressPercentage >= 0 && c.progressPercentage < 100,
    ).length,
);

const completedCount = computed(
  () => courses.value.filter((c) => c.progressPercentage === 100).length,
);
</script>

<template>
  <div class="relative min-h-screen w-full bg-white flex flex-col">
    <!-- Background -->
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <img
        src="@/assets/images/background-courses-mobile.svg"
        class="absolute w-full block xl:hidden"
        style="top: 116px"
      />

      <img
        src="@/assets/images/background-courses.svg"
        class="absolute hidden xl:block 2xl:w-full"
        style="top: 196px; left: 43px"
      />
    </div>

    <Navbar />

    <!-- ================= MAIN ================= -->
    <main
      class="relative z-10 flex-1 flex flex-col items-center px-4 lg:pt-25 pt-10 pb-12"
    >
      <div class="w-full max-w-[1200px] flex flex-col">
        <h1
          class="lg:text-headline2 text-headline3 text-gray-900 text-center lg:mb-14 mb-6"
        >
          My Courses
        </h1>

        <CustomTabs v-model="activeTab" :tabs="tabs" class="mb-12" />

        <div class="flex flex-col lg:flex-row gap-10 items-start">
          <!-- ================= DESKTOP PROFILE ================= -->
          <aside class="hidden xl:block sticky top-30 shrink-0">
            <UserProfileCard
              variant="desktop"
              :name="displayName"
              :profile-image="profilePic"
              :course-inprogress="inProgressCount"
              :course-complete="completedCount"
            />
          </aside>

          <!-- ================= COURSES ================= -->
          <div class="flex-1">
            <div v-if="isLoading" class="flex justify-center py-20">
              <p class="text-gray-500 animate-pulse">Loading your courses...</p>
            </div>

            <div
              v-else-if="filteredCourses.length"
              class="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <CourseCard
                v-for="course in filteredCourses"
                :key="course.enrollmentId"
                :image="course.coverImageUrl"
                :title="course.courseTitle"
                :description="course.courseDescription"
                :lesson="Number(course.lessonCount) || 0"
                :duration="String(course.totalHours || 0) + ' Hours'"
                :course-id="String(course.courseId)"
              />
            </div>

            <div v-else class="flex justify-center py-20 text-gray-400">
              No courses found in this category.
            </div>
          </div>
        </div>

        <!-- Mobile: profile card after course list -->
        <div class="xl:hidden mt-10 flex justify-center">
          <UserProfileCard
            variant="mobile"
            :name="displayName"
            :profile-image="profilePic"
            :course-inprogress="inProgressCount"
            :course-complete="completedCount"
          />
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
