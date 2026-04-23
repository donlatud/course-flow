import { onBeforeUnmount, onMounted, ref } from "vue"

export function useNetworkStatus() {
  const isOnline = ref(navigator.onLine ?? true)

  function handleOnline() {
    isOnline.value = true
  }

  function handleOffline() {
    isOnline.value = false
  }

  onMounted(() => {
    window.addEventListener("online", handleOnline)
    window.addEventListener("offline", handleOffline)
  })

  onBeforeUnmount(() => {
    window.removeEventListener("online", handleOnline)
    window.removeEventListener("offline", handleOffline)
  })

  return {
    isOnline,
  }
}
