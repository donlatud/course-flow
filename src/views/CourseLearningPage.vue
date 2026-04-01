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
    <!-- Mobile View -->
    <main class=" lg:hidden">
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
    <!-- Desktop View -->
    <main class="flex justify-center">
      <div class="hidden lg:block lg:max-w-[1440px]">
        <section class="flex px-[160px] pt-[100px] gap-6">
          <CourseInfoSidebar :course-id="courseId" />
          <CourseMainContent />
        </section>
        <section class="px-15 bg-white">
          <LessonNavigation />
        </section>
      </div>
    </main>
    <AppFooter />
  </div>

</template>
