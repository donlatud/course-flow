<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useVideoProgress } from "@/composables/useVideoProgress"
import { useKeyboardShortcuts } from "@/composables/useKeyboardShortcuts"
import { useCourseLearning } from "@/composables/useCourseLearning"
import type { MaterialProgressStatus } from "@/types/course-learning/course-learning-api"

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
const videoError = ref(false)
const videoErrorMessage = ref<string>("")
const retryCount = ref(0)
const maxRetries = 3

const trackingEnabled = computed(() => Boolean(props.enrollmentId && props.materialId && props.src))

const { goNext, syncMaterialProgressFromPlayer } = useCourseLearning()

function onVideoProgressSaved(payload: {
  status: MaterialProgressStatus
  lastPosition: number
}) {
  const mid = props.materialId
  if (!mid) return
  const completed = payload.status === "COMPLETED"
  syncMaterialProgressFromPlayer(mid, {
    status: payload.status,
    lastPosition: payload.lastPosition,
    completed,
  })
}

useVideoProgress({
  videoRef: videoEl,
  enabled: trackingEnabled,
  enrollmentId: computed(() => props.enrollmentId ?? null),
  materialId: computed(() => props.materialId ?? null),
  initialResumeSeconds: computed(() => props.initialResumeSeconds ?? null),
  saveIntervalMs: 10_000,
  minPositionDeltaSeconds: 3,
  onProgressSaved: onVideoProgressSaved,
})

useKeyboardShortcuts({
  videoRef: videoEl,
  onNext: () => {
    void goNext()
  },
  enabled: computed(() => Boolean(props.src)),
})

function getErrorMessage(error: MediaError | null): string {
  if (!error) return "Failed to load video"
  
  switch (error.code) {
    case MediaError.MEDIA_ERR_ABORTED:
      return "Video loading was aborted"
    case MediaError.MEDIA_ERR_NETWORK:
      return "Network error while loading video"
    case MediaError.MEDIA_ERR_DECODE:
      return "Video format is not supported or corrupted"
    case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
      return "Video source is not available or format is not supported"
    default:
      return error.message || "Failed to load video"
  }
}

function onVideoError(event: Event) {
  const video = event.target as HTMLVideoElement
  const error = video.error
  
  videoError.value = true
  videoErrorMessage.value = getErrorMessage(error)
  
  console.error("[VideoPlayer] Error loading video:", {
    code: error?.code,
    message: error?.message,
    src: props.src,
    retryCount: retryCount.value,
  })
}

function retryLoadVideo() {
  if (retryCount.value >= maxRetries) {
    videoErrorMessage.value = `Failed to load video after ${maxRetries} attempts. Please check your connection and try again later.`
    return
  }
  
  retryCount.value++
  videoError.value = false
  videoErrorMessage.value = ""
  
  // Force reload by updating video element
  if (videoEl.value) {
    videoEl.value.load()
  }
}

// Reset error state when src changes
watch(() => props.src, () => {
  videoError.value = false
  videoErrorMessage.value = ""
  retryCount.value = 0
})
</script>

<template>
  <div class="w-full h-[214px] overflow-hidden rounded-[8px] bg-gray-900 md:h-[320px] lg:h-[460px]">
    <!-- Video Error State -->
    <div
      v-if="videoError && src"
      class="flex h-full w-full flex-col items-center justify-center gap-4 bg-gray-900 px-6 text-center"
      role="alert"
      aria-live="assertive"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-12 w-12 text-orange-500"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <div class="flex flex-col gap-2">
        <div class="text-body2 font-semibold text-white">
          Video Failed to Load
        </div>
        <div class="text-body3 text-gray-300">
          {{ videoErrorMessage }}
        </div>
      </div>
      <button
        v-if="retryCount < maxRetries"
        class="rounded-lg bg-orange-500 px-6 py-2 text-body3 font-semibold text-white transition-colors hover:bg-orange-600 active:bg-orange-700"
        @click="retryLoadVideo"
      >
        Retry ({{ maxRetries - retryCount }} attempts left)
      </button>
    </div>

    <!-- Video Player -->
    <video
      v-else-if="src"
      ref="videoEl"
      class="h-full w-full object-cover"
      :src="src"
      controls
      playsinline
      @error="onVideoError"
    />

    <!-- Mock Placeholder (no src) -->
    <img
      v-else
      src="@/assets/mock-video.png"
      alt="Mock video player preview"
      class="h-full w-full object-cover"
    />
  </div>
</template>