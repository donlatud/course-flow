import { onBeforeUnmount, onMounted, type Ref, unref } from "vue"

export type KeyboardShortcutsOptions = {
  videoRef?: Ref<HTMLVideoElement | null>
  onNext?: () => void
  enabled?: Ref<boolean>
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  function handleKeyDown(e: KeyboardEvent) {
    const enabled = options.enabled ? unref(options.enabled) : true
    if (!enabled) return

    const target = e.target as HTMLElement
    if (
      target.tagName === "INPUT" ||
      target.tagName === "TEXTAREA" ||
      target.isContentEditable
    ) {
      return
    }

    const video = options.videoRef ? unref(options.videoRef) : null

    if (e.code === "Space") {
      e.preventDefault()
      if (video) {
        if (video.paused) {
          video.play().catch(() => {})
        } else {
          video.pause()
        }
      }
    } else if (e.code === "ArrowLeft") {
      e.preventDefault()
      if (video) {
        video.currentTime = Math.max(0, video.currentTime - 5)
      }
    } else if (e.code === "ArrowRight") {
      e.preventDefault()
      if (video) {
        video.currentTime = Math.min(video.duration || 0, video.currentTime + 5)
      }
    } else if (e.code === "KeyN") {
      e.preventDefault()
      if (options.onNext) {
        options.onNext()
      }
    }
  }

  onMounted(() => {
    window.addEventListener("keydown", handleKeyDown)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("keydown", handleKeyDown)
  })
}
