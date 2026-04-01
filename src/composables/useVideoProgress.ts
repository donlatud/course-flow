import { computed, onBeforeUnmount, onMounted, ref, unref, watch } from "vue"
import type { MaybeRef } from "vue"
import {
  createMaterialProgress,
  updateMaterialProgress,
} from "@/services/courseLearningApi"
import type {
  MaterialProgressResponse,
  MaterialProgressStatus,
} from "@/types/course-learning/course-learning-api"

type SaveReason = "interval" | "pause" | "ended" | "seeked"

export type UseVideoProgressOptions = {
  /**
   * Ref to the `<video>` element to track.
   */
  videoRef: MaybeRef<HTMLVideoElement | null>
  /**
   * Enable/disable tracking (e.g. when ids are not ready yet).
   */
  enabled?: MaybeRef<boolean>
  enrollmentId?: MaybeRef<string | null | undefined>
  materialId?: MaybeRef<string | null | undefined>
  /**
   * Resume position from another API (e.g. GET /learning) before bootstrap; merged with POST response when `progressId` is missing.
   */
  initialResumeSeconds?: MaybeRef<number | null | undefined>
  /**
   * How often to save while playing (ms).
   */
  saveIntervalMs?: number
  /**
   * Skip update if position changed by less than this many seconds (except on ended).
   */
  minPositionDeltaSeconds?: number
}

export function useVideoProgress(options: UseVideoProgressOptions) {
  const enabled = computed(() => Boolean(unref(options.enabled) ?? true))
  const enrollmentId = computed(() => unref(options.enrollmentId) ?? null)
  const materialId = computed(() => unref(options.materialId) ?? null)
  const initialResumeSeconds = computed(() => {
    const v = unref(options.initialResumeSeconds)
    if (v == null || !Number.isFinite(v)) return null
    return Math.max(0, Math.floor(v))
  })

  const saveIntervalMs = options.saveIntervalMs ?? 10_000
  const minDelta = options.minPositionDeltaSeconds ?? 3

  const progressId = ref<string | null>(null)
  const lastSavedPosition = ref<number>(0)
  const status = ref<MaterialProgressStatus>("NOT_STARTED")
  const isSaving = ref(false)
  const error = ref<string | null>(null)
  const resumeApplied = ref(false)
  /** Suppress one `seeked` save after programmatic resume seek */
  const suppressNextSeekedSave = ref(false)
  /** Event emitter for video ended (for auto-next feature) */
  const videoEnded = ref(false)

  let intervalId: number | null = null
  /** Serialize saves so PUT requests do not overlap */
  let saveSerializeChain: Promise<void> = Promise.resolve()
  /** Deduplicate concurrent POST bootstrap until `progressId` exists */
  let ensureInFlight: Promise<string | null> | null = null
  /** Serialize resume work (loadedmetadata vs watchers) */
  let resumeSerializeChain: Promise<void> = Promise.resolve()

  function getVideo(): HTMLVideoElement | null {
    return unref(options.videoRef) ?? null
  }

  function currentPositionSeconds(): number {
    const v = getVideo()
    if (!v) return 0
    if (!Number.isFinite(v.currentTime)) return 0
    return Math.max(0, Math.floor(v.currentTime))
  }

  function resetProgressForNewMaterial() {
    progressId.value = null
    lastSavedPosition.value = 0
    status.value = "NOT_STARTED"
    resumeApplied.value = false
    suppressNextSeekedSave.value = false
    videoEnded.value = false
    ensureInFlight = null
    resumeSerializeChain = Promise.resolve()
  }

  async function ensureProgressExists(initialStatus: MaterialProgressStatus) {
    if (progressId.value) return progressId.value
    if (!enrollmentId.value || !materialId.value) return null

    if (ensureInFlight) return ensureInFlight

    ensureInFlight = (async () => {
      try {
        const res = (await createMaterialProgress({
          enrollmentId: enrollmentId.value!,
          materialId: materialId.value!,
        })) as MaterialProgressResponse

        progressId.value = res.id
        status.value = res.status ?? initialStatus
        const fromApi = res.lastPosition ?? 0
        const fromInitial = initialResumeSeconds.value ?? 0
        lastSavedPosition.value = Math.max(fromApi, fromInitial)
        return progressId.value
      } finally {
        ensureInFlight = null
      }
    })()

    return ensureInFlight
  }

  async function saveImpl(reason: SaveReason): Promise<void> {
    if (!enabled.value) return
    if (!enrollmentId.value || !materialId.value) return

    const v = getVideo()
    if (!v) return

    const pos = currentPositionSeconds()
    const delta = Math.abs(pos - lastSavedPosition.value)

    if (reason !== "ended" && delta < minDelta) return

    error.value = null
    isSaving.value = true
    try {
      const id = await ensureProgressExists("IN_PROGRESS")
      if (!id) return

      const nextStatus: MaterialProgressStatus =
        reason === "ended" ? "COMPLETED" : "IN_PROGRESS"

      const payload = {
        status: nextStatus,
        lastPosition: pos,
        completedAt: reason === "ended" ? new Date().toISOString() : undefined,
      }

      const res = (await updateMaterialProgress(id, payload)) as MaterialProgressResponse
      status.value = res.status ?? nextStatus
      lastSavedPosition.value = res.lastPosition ?? pos
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to save video progress"
    } finally {
      isSaving.value = false
    }
  }

  function save(reason: SaveReason) {
    saveSerializeChain = saveSerializeChain
      .then(() => saveImpl(reason))
      .catch(() => {
        // Errors handled in saveImpl; keep the chain alive
      })
  }

  async function applyResumeImpl(): Promise<void> {
    if (!enabled.value) return
    if (!enrollmentId.value || !materialId.value) return
    if (resumeApplied.value) return

    const v = getVideo()
    if (!v || !Number.isFinite(v.duration) || v.duration <= 0) return

    error.value = null
    try {
      const id = await ensureProgressExists("NOT_STARTED")
      if (!id) return

      const resumeAt = lastSavedPosition.value
      if (resumeAt <= 0) {
        resumeApplied.value = true
        return
      }

      const clamped = Math.min(resumeAt, Math.max(0, v.duration - 0.25))
      suppressNextSeekedSave.value = true
      v.currentTime = clamped
      resumeApplied.value = true
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Failed to load video progress for resume"
    }
  }

  function scheduleResume() {
    resumeSerializeChain = resumeSerializeChain
      .then(() => applyResumeImpl())
      .catch(() => {})
  }

  function onLoadedMetadata() {
    scheduleResume()
  }

  function clearIntervalIfAny() {
    if (intervalId == null) return
    window.clearInterval(intervalId)
    intervalId = null
  }

  function startInterval() {
    clearIntervalIfAny()
    intervalId = window.setInterval(() => {
      save("interval")
    }, saveIntervalMs)
  }

  function onPlay() {
    if (!enabled.value) return
    status.value = "IN_PROGRESS"
    startInterval()
  }

  function onPause() {
    clearIntervalIfAny()
    save("pause")
  }

  function onEnded() {
    clearIntervalIfAny()
    videoEnded.value = true
    save("ended")
  }

  function onSeeked() {
    if (suppressNextSeekedSave.value) {
      suppressNextSeekedSave.value = false
      return
    }
    save("seeked")
  }

  function bind() {
    const v = getVideo()
    if (!v) return
    v.addEventListener("loadedmetadata", onLoadedMetadata)
    v.addEventListener("play", onPlay)
    v.addEventListener("pause", onPause)
    v.addEventListener("ended", onEnded)
    v.addEventListener("seeked", onSeeked)
  }

  function unbind() {
    const v = getVideo()
    if (!v) return
    v.removeEventListener("loadedmetadata", onLoadedMetadata)
    v.removeEventListener("play", onPlay)
    v.removeEventListener("pause", onPause)
    v.removeEventListener("ended", onEnded)
    v.removeEventListener("seeked", onSeeked)
  }

  onMounted(() => {
    bind()
  })

  onBeforeUnmount(() => {
    clearIntervalIfAny()
    unbind()
  })

  watch(
    () => unref(options.videoRef),
    (next, prev) => {
      if (prev) unbind()
      if (next) {
        // New element, same material: keep progressId; run resume again on loadedmetadata
        resumeApplied.value = false
        suppressNextSeekedSave.value = false
        bind()
      }
    },
  )

  watch([enrollmentId, materialId], () => {
    resetProgressForNewMaterial()
    const v = getVideo()
    if (v && enabled.value) {
      scheduleResume()
    }
  })

  watch(
    enabled,
    (isEnabled) => {
      if (!isEnabled) {
        clearIntervalIfAny()
      } else {
        const v = getVideo()
        if (v && v.readyState >= 1) {
          scheduleResume()
        }
      }
    },
    { immediate: true },
  )

  return {
    status,
    progressId,
    lastSavedPosition,
    isSaving,
    error,
    videoEnded,
    save: (reason: SaveReason) => {
      save(reason)
    },
  }
}
