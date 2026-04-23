<script setup lang="ts">
import { useCourseLearning } from "@/composables/useCourseLearning"
import SkeletonSidebarHeader from "@/components/course-learning/skeleton/SkeletonSidebarHeader.vue"

const { courseTitle, courseDescription, loading } = useCourseLearning()
</script>

<template>
  <SkeletonSidebarHeader v-if="loading" />
  <header v-else class="flex flex-col gap-4">
    <div class="text-body4 text-orange-500">
      Course
    </div>
    <div class="flex flex-col gap-2">
      <div class="text-body2">
        {{ courseTitle }}
      </div>
      <div class="text-body4 text-gray-700">
        {{ courseDescription }}
      </div>
    </div>
  </header>
</template>
