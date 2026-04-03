<script setup lang="ts">
import { computed } from "vue"
import ModuleAccordion from "./ModuleAccordion.vue"
import SkeletonModuleList from "@/components/course-learning/skeleton/SkeletonModuleList.vue"
import { useCourseLearning } from "@/composables/useCourseLearning"

const { modules, activeLessonId, firstModuleId, setActiveLessonId, loading } = useCourseLearning()

const isEmpty = computed(() => !loading.value && modules.value.length === 0)
</script>

<template>
  <nav
    class="w-full"
    aria-label="Course modules and lessons"
  >
    <SkeletonModuleList v-if="loading" />
    
    <!-- Empty State -->
    <div
      v-else-if="isEmpty"
      class="flex flex-col items-center justify-center gap-4 py-12 px-4 text-center"
      role="status"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-16 w-16 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
        />
      </svg>
      <div class="flex flex-col gap-2">
        <div class="text-body2 font-semibold text-gray-900">
          No Content Yet
        </div>
        <div class="text-body3 text-gray-600">
          This course doesn't have any lessons or modules yet. Check back later!
        </div>
      </div>
    </div>

    <ModuleAccordion
      v-else
      :active-lesson-id="activeLessonId"
      :modules="modules"
      :default-open-module-id="firstModuleId"
      @update:active-lesson-id="setActiveLessonId"
    />
  </nav>
</template>
