<script setup lang="ts">
import { computed, ref } from "vue"
import { useVideoProgress } from "@/composables/useVideoProgress"
import { useAutoNextLesson } from "@/composables/useAutoNextLesson"
import { useKeyboardShortcuts } from "@/composables/useKeyboardShortcuts"
import { useCourseLearning } from "@/composables/useCourseLearning"

const props = defineProps<{
  /**
   * With `src`, renders a real `<video>` and can enable progress tracking.
   * Without `src`, falls back to the mock image preview.
   */
  src?: string
  enrollmentId?: string
  materialId?: string
  /** Last position in seconds from API (e.g. GET /learning) before bootstrap POST */
  initialResumeSeconds?: number | null
}>()

const videoEl = ref<HTMLVideoElement | null>(null)

const trackingEnabled = computed(() => Boolean(props.enrollmentId && props.materialId && props.src))

const { videoEnded } = useVideoProgress({
  videoRef: videoEl,
  enabled: trackingEnabled,
  enrollmentId: computed(() => props.enrollmentId ?? null),
  materialId: computed(() => props.materialId ?? null),
  initialResumeSeconds: computed(() => props.initialResumeSeconds ?? null),
  saveIntervalMs: 10_000,
  minPositionDeltaSeconds: 3,
})

const { hasNext, goNext } = useCourseLearning()

useAutoNextLesson(videoEnded, hasNext, () => {
  void goNext()
})

useKeyboardShortcuts({
  videoRef: videoEl,
  onNext: () => {
    void goNext()
  },
  enabled: computed(() => Boolean(props.src)),
})
</script>

<template>
  <div class="w-full h-[214px] overflow-hidden rounded-[8px] bg-green-400 lg:h-[460px]">
    <video
      v-if="src"
      ref="videoEl"
      class="h-full w-full object-cover"
      :src="src"
      controls
      playsinline
    />
    <img
      v-else
      src="@/assets/mock-video.png"
      alt="Mock video player preview"
      class="h-full w-full object-cover"
    />
  </div>
</template>