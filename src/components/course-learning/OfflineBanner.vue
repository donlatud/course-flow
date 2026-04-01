<script setup lang="ts">
import { useNetworkStatus } from "@/composables/useNetworkStatus"

const { isOnline } = useNetworkStatus()
</script>

<template>
  <div
    v-if="!isOnline"
    class="fixed left-0 right-0 top-0 z-50 bg-orange-600 px-4 py-3 text-center text-body3 text-white"
    role="alert"
    aria-live="assertive"
  >
    You are currently offline. Progress may not be saved.
  </div>
</template>
