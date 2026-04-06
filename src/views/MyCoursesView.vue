<script setup lang="ts">
import { ref } from "vue";
import Navbar from "@/components/shared/Navbar.vue";
import CustomTabs from "@/components/base/input/CustomTabs.vue";
import AppFooter from "@/components/shared/AppFooter.vue";
import UserProfileCard from "@/components/my-course/UserProfileCard.vue";
import CourseCard from "@/components/courses/CourseCard.vue";

const activeTab = ref("all");

const tabs = [
  { value: "all", label: "All Courses" },
  { value: "inprogress", label: "Inprogress" },
  { value: "completed", label: "Completed" },
];

// Mock data
const mockCourses = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    title: "Service Design Essentials",
    description: "Lorem ipsum dolor sit amet, conse ctetur adipiscing elit.",
    lesson: 6,
    duration: "6 Hours",
    status: "inprogress",
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800",
    title: "Software Developer",
    description: "Lorem ipsum dolor sit amet, conse ctetur adipiscing elit.",
    lesson: 6,
    duration: "6 Hours",
    status: "inprogress",
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
    title: "UX/UI Design Beginner",
    description: "Lorem ipsum dolor sit amet, conse ctetur adipiscing elit.",
    lesson: 6,
    duration: "6 Hours",
    status: "completed",
  },
  {
    id: 4,
    image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800",
    title: "Service Design Essentials",
    description: "Lorem ipsum dolor sit amet, conse ctetur adipiscing elit.",
    lesson: 6,
    duration: "6 Hours",
    status: "completed",
  },
  {
    id: 5,
    image: "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=800",
    title: "UX/UI Design Beginner",
    description: "Lorem ipsum dolor sit amet, conse ctetur adipiscing elit.",
    lesson: 6,
    duration: "6 Hours",
    status: "inprogress",
  },
];

const filteredCourses = (tab: string) => {
  if (tab === "all") return mockCourses;
  return mockCourses.filter((c) => c.status === tab);
};
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

    <div>
      <Navbar />
    </div>

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
          <aside class="hidden xl:block sticky top-30 shrink-0">
            <UserProfileCard
              name="Max Mayfield"
              profile-image="/src/assets/images/profile_test.svg"
              :course-inprogress="3"
              :course-complete="2"
            />
          </aside>

          <div class="flex-1">
            <div
              v-if="filteredCourses(activeTab).length > 0"
              class="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <CourseCard
                v-for="course in filteredCourses(activeTab)"
                :key="course.id"
                :image="course.image"
                :title="course.title"
                :description="course.description"
                :lesson="course.lesson"
                :duration="course.duration"
                :course-id="course.id"
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

    <div class="relative z-10">
      <AppFooter />
    </div>
  </div>
</template>
