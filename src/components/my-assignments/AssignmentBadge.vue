<script setup lang="ts">
import { computed } from "vue"

const props = defineProps<{
  submitted: number
  total: number
}>()

const label = computed(() => `${props.submitted}/${props.total} Submitted`)
</script>

<template>
  <span
    class="inline-flex items-center rounded-[8px] bg-white px-3 py-1 text-body4 font-semibold text-blue-800"
    aria-label="Assignment submission progress"
  >
    {{ label }}
  </span>
</template>
