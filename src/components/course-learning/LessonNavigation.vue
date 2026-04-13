<script setup lang="ts">
import { computed } from "vue"
import PrimaryButton from "@/components/base/button/PrimaryButton.vue"
import GhostButton from "../base/button/GhostButton.vue"
import { useCourseLearning } from "@/composables/useCourseLearning"

const {
  goPrev,
  goNext,
  completeCurrentLesson,
  hasPrev,
  hasNext,
  activeMaterial,
  loading,
  error,
  navigationPending,
  modules,
} = useCourseLearning()

const navDisabled = computed(
  () => loading.value || Boolean(error.value) || navigationPending.value,
)

const isEmpty = computed(() => modules.value.length === 0)

const primaryLabel = computed(() => {
  if (hasNext.value) return "Next Lesson"
  if (activeMaterial.value?.completed) return "Completed"
  return "Complete"
})

const primaryDisabled = computed(() => {
  if (navDisabled.value) return true
  if (hasNext.value) return false
  if (!activeMaterial.value) return true
  return Boolean(activeMaterial.value.completed)
})

function onPrimaryClick() {
  if (hasNext.value) void goNext()
  else void completeCurrentLesson()
}
</script>
<template>
  <div 
    v-if="!isEmpty"
    class="flex justify-between items-center w-full gap-3 lg:h-[100px] lg:gap-0"
  >
    <GhostButton 
      class="flex-1 max-w-[180px] lg:flex-initial lg:w-[145px]" 
      :disabled="navDisabled || !hasPrev" 
      @click="goPrev"
    >
      Previous Lesson
    </GhostButton>
    <PrimaryButton
      class="flex-1 max-w-[180px] lg:flex-initial lg:min-w-[161px] lg:w-auto lg:px-4"
      :disabled="primaryDisabled"
      @click="onPrimaryClick"
    >
      {{ primaryLabel }}
    </PrimaryButton>
  </div>
</template>