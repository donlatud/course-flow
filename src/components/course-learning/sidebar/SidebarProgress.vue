<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { ProgressBar } from "@/components/base/progress-bar"
import SkeletonProgress from "@/components/course-learning/skeleton/SkeletonProgress.vue"
import { useCourseLearning } from "@/composables/useCourseLearning"

const props = withDefaults(
  defineProps<{
    /** Completion value (0 … max). */
    modelValue?: number
    /** Scale maximum (default 100). */
    max?: number
    /** Extra classes merged onto the base progress bar. */
    barClass?: HTMLAttributes["class"]
  }>(),
  { modelValue: undefined, max: 100 },
)

const { progressValue, loading } = useCourseLearning()

const effectiveValue = computed(() => {
  if (props.modelValue != null) return props.modelValue
  if (loading.value) return 0
  return progressValue.value
})

const label = computed(() => {
  const pct =
    props.max > 0 ? Math.round((effectiveValue.value / props.max) * 100) : 0
  return `${pct}% Complete`
})
</script>

<template>
  <SkeletonProgress v-if="loading" />
  <section v-else class="flex flex-col gap-2" aria-labelledby="sidebar-progress-label">
    <p id="sidebar-progress-label" class="text-body4 text-gray-700">
      {{ label }}
    </p>
    <ProgressBar
      :model-value="effectiveValue"
      :max="max"
      :class="barClass"
    />
  </section>
</template>
