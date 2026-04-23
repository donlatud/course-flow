import { ref, watch } from "vue"
import { useNetworkStatus } from "./useNetworkStatus"
import { toast } from "vue-sonner"

type QueuedRequest = {
  id: string
  execute: () => Promise<void>
  reason: string
  timestamp: number
  retryCount: number
}

const MAX_RETRIES = 3
const RETRY_DELAY_MS = 2000
const queue = ref<QueuedRequest[]>([])
const processing = ref(false)

export function useOfflineQueue() {
  const { isOnline } = useNetworkStatus()

  function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  function addToQueue(execute: () => Promise<void>, reason: string): string {
    const id = generateId()
    queue.value.push({
      id,
      execute,
      reason,
      timestamp: Date.now(),
      retryCount: 0,
    })
    return id
  }

  function removeFromQueue(id: string) {
    queue.value = queue.value.filter((item) => item.id !== id)
  }

  async function processQueue() {
    if (processing.value || queue.value.length === 0 || !isOnline.value) {
      return
    }

    processing.value = true

    try {
      const itemsToProcess = [...queue.value]
      
      for (const item of itemsToProcess) {
        if (!isOnline.value) {
          console.log("[OfflineQueue] Network went offline, pausing queue processing")
          break
        }

        try {
          await item.execute()
          removeFromQueue(item.id)
          console.log(`[OfflineQueue] Successfully processed: ${item.reason}`)
        } catch (error) {
          item.retryCount++
          
          if (item.retryCount >= MAX_RETRIES) {
            console.error(`[OfflineQueue] Failed after ${MAX_RETRIES} retries: ${item.reason}`, error)
            removeFromQueue(item.id)
            toast.error(`Failed to save progress: ${item.reason}`)
          } else {
            console.warn(`[OfflineQueue] Retry ${item.retryCount}/${MAX_RETRIES}: ${item.reason}`, error)
            // Wait before next retry
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY_MS))
          }
        }
      }

      if (queue.value.length === 0 && itemsToProcess.length > 0) {
        toast.success("All pending progress saved successfully")
      }
    } finally {
      processing.value = false
    }
  }

  // Process queue when network comes back online
  watch(isOnline, (online) => {
    if (online && queue.value.length > 0) {
      console.log(`[OfflineQueue] Network back online, processing ${queue.value.length} queued items`)
      toast.info(`Syncing ${queue.value.length} pending progress update(s)...`)
      void processQueue()
    }
  })

  return {
    queue,
    processing,
    isOnline,
    addToQueue,
    removeFromQueue,
    processQueue,
    queueLength: () => queue.value.length,
  }
}
