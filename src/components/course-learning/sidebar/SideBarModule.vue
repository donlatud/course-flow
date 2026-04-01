<script setup lang="ts">
import ModuleAccordion from "./ModuleAccordion.vue"
import SkeletonModuleList from "@/components/course-learning/skeleton/SkeletonModuleList.vue"
import { useCourseLearning } from "@/composables/useCourseLearning"

const { modules, activeLessonId, firstModuleId, setActiveLessonId, loading } = useCourseLearning()
</script>

<template>
  <nav
    class="w-full"
    aria-label="Course modules and lessons"
  >
    <SkeletonModuleList v-if="loading" />
    <ModuleAccordion
      v-else
      :active-lesson-id="activeLessonId"
      :modules="modules"
      :default-open-module-id="firstModuleId"
      @update:active-lesson-id="setActiveLessonId"
    />
  </nav>
</template>
