<script setup lang="ts">
import { computed } from "vue"
import { useOfflineQueue } from "@/composables/useOfflineQueue"

const { isOnline, queue, processing } = useOfflineQueue()

const queueLength = computed(() => queue.value.length)
const showBanner = computed(() => !isOnline.value || (processing.value && queueLength.value > 0))

const bannerMessage = computed(() => {
  if (!isOnline.value) {
    if (queueLength.value > 0) {
      return `You are offline. ${queueLength.value} progress update(s) pending.`
    }
    return "You are offline. Progress may not be saved."
  }
  
  if (processing.value && queueLength.value > 0) {
    return `Syncing ${queueLength.value} pending progress update(s)...`
  }
  
  return ""
})

const bannerColor = computed(() => {
  if (!isOnline.value) return "bg-orange-600"
  if (processing.value) return "bg-blue-600"
  return "bg-green-600"
})
</script>

<template>
  <div
    v-if="showBanner"
    :class="[
      'fixed left-0 right-0 top-0 z-50 px-4 py-3 text-center text-body3 text-white transition-colors duration-300',
      bannerColor
    ]"
    role="alert"
    aria-live="assertive"
  >
    <div class="flex items-center justify-center gap-2">
      <svg
        v-if="processing"
        class="h-4 w-4 animate-spin"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span>{{ bannerMessage }}</span>
    </div>
  </div>
</template>
