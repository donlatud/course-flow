<script setup lang="ts">
import { useCourseLearning } from "@/composables/useCourseLearning"
import SkeletonContentHeader from "@/components/course-learning/skeleton/SkeletonContentHeader.vue"

const { activeLesson, loading } = useCourseLearning()
</script>

<template>
  <SkeletonContentHeader v-if="loading" />
  <header v-else class="text-headline3 text-black lg:text-headline2">
    {{ activeLesson?.title ?? "" }}
  </header>
</template>