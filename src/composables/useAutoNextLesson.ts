import { ref, watch, type Ref } from "vue"
import { toast } from "vue-sonner"

export function useAutoNextLesson(
  videoEnded: Ref<boolean>,
  hasNext: Ref<boolean>,
  onGoNext: () => void,
) {
  const countdownActive = ref(false)
  const countdown = ref(5)
  let countdownTimer: number | null = null
  let toastId: string | number | null = null

  function clearCountdown() {
    if (countdownTimer) {
      window.clearTimeout(countdownTimer)
      countdownTimer = null
    }
    countdownActive.value = false
    countdown.value = 5
    if (toastId) {
      toast.dismiss(toastId)
      toastId = null
    }
  }

  function startCountdown() {
    if (!hasNext.value) return

    countdownActive.value = true
    countdown.value = 5

    const runCountdown = () => {
      countdown.value--
      if (countdown.value <= 0) {
        clearCountdown()
        onGoNext()
      } else {
        toastId = toast(`Next lesson in ${countdown.value}s`, {
          duration: 1000,
          action: {
            label: "Cancel",
            onClick: () => {
              clearCountdown()
            },
          },
        })
        countdownTimer = window.setTimeout(runCountdown, 1000)
      }
    }

    toastId = toast(`Next lesson in ${countdown.value}s`, {
      duration: 1000,
      action: {
        label: "Cancel",
        onClick: () => {
          clearCountdown()
        },
      },
    })
    countdownTimer = window.setTimeout(runCountdown, 1000)
  }

  watch(videoEnded, (ended) => {
    if (ended && hasNext.value && !countdownActive.value) {
      startCountdown()
    }
  })

  return {
    countdownActive,
    countdown,
    clearCountdown,
  }
}
