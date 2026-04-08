<script setup lang="ts">
import { ref, onMounted, computed } from "vue";
import Navbar from "@/components/shared/Navbar.vue";
import CustomTabs from "@/components/base/input/CustomTabs.vue";
import AppFooter from "@/components/shared/AppFooter.vue";
import UserProfileCard from "@/components/my-course/UserProfileCard.vue";
import CourseCard from "@/components/courses/CourseCard.vue"; 
import { api } from "@/lib/api";

// กำหนด Interface ให้ตรงกับ DTO จาก Spring Boot
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

const activeTab = ref("all");
const courses = ref<EnrollmentResponse[]>([]);
const isLoading = ref(true);

const tabs = [
  { value: "all", label: "All Courses" },
  { value: "inprogress", label: "Inprogress" },
  { value: "completed", label: "Completed" },
];

// ฟังก์ชันดึงข้อมูลโดยใช้ Axios ที่มี Bearer Token ติดไปด้วย
const fetchMyCourses = async () => {
  isLoading.value = true;
  try {
    const response = await api.get<EnrollmentResponse[]>("/api/enrollments/my");
    courses.value = response.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchMyCourses();
});

// กรองข้อมูลตาม Tab และจัดการ Mapping Status
const filteredCourses = computed(() => {
  if (activeTab.value === "all") return courses.value;

  const statusMap: Record<string, string> = {
    inprogress: "ACTIVE",
    completed: "COMPLETED",
  };

  return courses.value.filter((c) => c.status === statusMap[activeTab.value]);
});

// นับจำนวนคอร์สสำหรับส่งให้ UserProfileCard
const inProgressCount = computed(() => 
  courses.value.filter(c => c.status === 'ACTIVE').length
);
const completedCount = computed(() => 
  courses.value.filter(c => c.status === 'COMPLETED').length
);
</script>

<template>
  <div class="relative min-h-screen w-full bg-white flex flex-col">
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <img
        src="@/assets/images/background-courses-mobile.svg"
        alt=""
        class="absolute w-full block xl:hidden"
        style="top: 116px"
      />
      <img
        src="@/assets/images/background-courses.svg"
        alt=""
        class="absolute 2xl:w-full hidden xl:block"
        style="top: 196px; left: 43px"
      />
    </div>

    <Navbar />

    <main class="relative z-10 flex-1 flex flex-col items-center px-4 lg:pt-25 pt-10 pb-12">
      <div class="w-full max-w-[1200px] flex flex-col">
        <h1 class="lg:text-headline2 text-headline3 text-gray-900 text-center lg:mb-14 mb-6">
          My Courses
        </h1>

        <CustomTabs v-model="activeTab" :tabs="tabs" class="mb-12" />

        <div class="flex flex-col lg:flex-row gap-10 items-start">
          <aside class="hidden xl:block sticky top-30 shrink-0">
            <UserProfileCard
              name="Parit Menklay" 
              profile-image="/src/assets/images/profile_test.svg"
              :course-inprogress="inProgressCount"
              :course-complete="completedCount"
            />
          </aside>

          <div class="flex-1">
            <div v-if="isLoading" class="flex justify-center py-20">
              <p class="text-gray-500 animate-pulse">Loading your courses...</p>
            </div>

            <div
              v-else-if="filteredCourses.length > 0"
              class="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <CourseCard
                v-for="course in filteredCourses"
                :key="course.enrollmentId"
                :image="course.coverImageUrl"
                :title="course.courseTitle"
                :description="course.courseDescription"
                :lesson="course.lessonCount"
                :duration="`${course.totalHours} Hours`"
                :course-id="course.courseId as any"
              />
            </div>

            <div
              v-else
              class="flex flex-col items-center justify-center py-20 text-gray-400"
            >
              <p>No courses found in this category.</p>
            </div>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
