<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import Navbar from "@/components/shared/Navbar.vue"
import AppFooter from "@/components/shared/AppFooter.vue"
import PrimaryButton from "@/components/base/button/PrimaryButton.vue"
import SecondaryButton from "@/components/base/button/SecondaryButton.vue"
import GhostButton from "@/components/base/button/GhostButton.vue"
import { courseService } from "@/services/courseService"
import type { Course } from "@/types/course"
import { CheckCircleIcon } from "@heroicons/vue/24/solid"
import backgroundCourses from "@/assets/images/background-courses.svg"

const route = useRoute()
const router = useRouter()
const course = ref<Course | null>(null)

const courseId = computed(() =>
  typeof route.params.courseId === "string" ? route.params.courseId : "",
)

const loadCourse = async (id: string) => {
  if (!id) return
  course.value = await courseService.getCourseById(id)
}

watch(courseId, (id) => {
  loadCourse(id)
}, { immediate: true })

const goBack = () => {
  router.back()
}

const goToCourseDetail = () => {
  router.push({ name: "course-detail", params: { id: courseId.value } })
}

const goToLearning = () => {
  router.push({ name: "course-learning", params: { courseId: courseId.value } })
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <Navbar />

    <main class="relative flex-1 px-4 py-6 lg:px-10 lg:pt-6 lg:pb-24 xl:px-40">
      <div class="mx-auto w-[375px] lg:w-[739px]">
        <GhostButton class="mb-8 inline-flex h-auto! w-auto! items-center gap-2 px-2 py-1 lg:hidden" @click="goBack">
          <span aria-hidden="true">&larr;</span>
          <span>Back</span>
        </GhostButton>

        <img :src="backgroundCourses" alt=""
          class="pointer-events-none absolute left-1/2 top-24 hidden w-full -translate-x-1/2 lg:block" />

        <div class="flex items-center justify-center lg:min-h-[520px]">
          <div class="w-full rounded-[8px] bg-white p-10 gap-12 shadow-1 flex flex-col items-center text-center">
            
              <div class="flex flex-col items-center justify-center gap-6">
              <CheckCircleIcon class="h-21 w-21 text-green" />

              <div class="flex flex-col items-center justify-center gap-2">
              <h1 class="w-[263px] text-headline3 text-black lg:w-auto">
                Thank you for subscribing.
              </h1>
              <p class="w-[263px] text-body2 text-gray-700 lg:w-auto">
                Your payment is complete. You can start learning the course now.
              </p>
              </div>
              </div>

              <div class="flex w-full flex-col gap-4 pt-1 lg:flex-row">
                <SecondaryButton class="w-full! px-8 py-[18px] lg:flex-1" @click="goToCourseDetail">
                  View Course Detail
                </SecondaryButton>
                <PrimaryButton class="w-full! px-8 py-[18px] lg:flex-1" @click="goToLearning">
                  Start Learning
                </PrimaryButton>
              </div>
          </div>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
