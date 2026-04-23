<script setup lang="ts">
import { computed } from "vue";

const props = defineProps<{
  /** When true, shows full-screen blocking overlay with progress UI */
  visible: boolean;
  /** Primary line, e.g. "Creating course" */
  title?: string;
  /** Secondary line under the title */
  description?: string;
}>();

const titleText = computed(() => props.title ?? "Please wait");
const descText = computed(() => props.description ?? "");
</script>

<template>
  <Teleport to="body">
    <Transition name="submit-overlay-fade">
      <div
        v-if="visible"
        class="fixed inset-0 z-100 flex items-center justify-center bg-black/45 backdrop-blur-[2px]"
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div
          class="mx-4 w-full max-w-88 rounded-2xl bg-white px-8 py-7 shadow-xl ring-1 ring-black/5"
        >
          <div class="mb-5 flex flex-col items-center gap-3 text-center">
            <div class="relative h-12 w-12 shrink-0">
              <div
                class="absolute inset-0 rounded-full border-2 border-blue-100"
                aria-hidden="true"
              />
              <div
                class="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-blue-500 border-r-blue-500/50"
                aria-hidden="true"
              />
            </div>
            <p class="text-body1 font-semibold text-gray-900">
              {{ titleText }}
            </p>
            <p v-if="descText" class="text-body3 leading-snug text-gray-600">
              {{ descText }}
            </p>
          </div>
          <div
            class="relative h-1.5 w-full overflow-hidden rounded-full bg-gray-100"
            aria-hidden="true"
          >
            <div class="submit-progress-indeterminate h-full w-[38%] rounded-full bg-blue-500" />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.submit-progress-indeterminate {
  animation: submit-progress-slide 1.15s ease-in-out infinite;
}

@keyframes submit-progress-slide {
  0% {
    transform: translateX(-105%);
  }
  100% {
    transform: translateX(280%);
  }
}

.submit-overlay-fade-enter-active,
.submit-overlay-fade-leave-active {
  transition: opacity 0.2s ease;
}

.submit-overlay-fade-enter-from,
.submit-overlay-fade-leave-to {
  opacity: 0;
}
</style>
