<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import CourseInfoSidebar from '@/components/course-learning/CourseInfoSidebar.vue'
import Navbar from '@/components/shared/Navbar.vue'
import CourseMainContent from '@/components/course-learning/CourseMainContent.vue'
import LessonNavigation from '@/components/course-learning/LessonNavigation.vue'
import AppFooter from '@/components/shared/AppFooter.vue'
import OfflineBanner from '@/components/course-learning/OfflineBanner.vue'
import { provideCourseLearning } from "@/composables/useCourseLearning"

const route = useRoute()
const courseId = computed(() => String(route.params.courseId ?? ''))

const store = provideCourseLearning()

watch(
  courseId,
  (id) => {
    void store.fetchCourseLearning(id)
  },
  { immediate: true },
)
</script>

<template>
  <div>
    <OfflineBanner />
    <Navbar />
    <!-- Mobile View (< 768px) -->
    <main class="md:hidden">
      <section class="pt-8 px-4 w-full">
        <CourseInfoSidebar :course-id="courseId" />
      </section>
      <section class="py-10 px-4 w-full">
        <CourseMainContent />
      </section>
      <section class="p-4 w-full shadow-1 bg-white">
        <LessonNavigation />
      </section>
    </main>
    <!-- Tablet & Desktop View (>= 768px) -->
    <main class="hidden md:flex md:justify-center">
      <div class="w-full max-w-[1440px]">
        <section class="flex flex-col md:flex-row px-6 pt-12 gap-6 md:px-8 md:pt-16 lg:px-20 lg:pt-[100px] xl:px-40">
          <CourseInfoSidebar :course-id="courseId" />
          <CourseMainContent />
        </section>
        <section class="px-6 md:px-8 lg:px-20 xl:px-40 bg-white">
          <LessonNavigation />
        </section>
      </div>
    </main>
    <AppFooter />
  </div>

</template>
