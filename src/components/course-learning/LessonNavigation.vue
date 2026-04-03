<script setup lang="ts">
import { computed } from "vue"
import PrimaryButton from "@/components/base/button/PrimaryButton.vue"
import GhostButton from "../base/button/GhostButton.vue"
import { useCourseLearning } from "@/composables/useCourseLearning"

const { goPrev, goNext, hasPrev, hasNext, loading, error, navigationPending, modules } =
  useCourseLearning()

const navDisabled = computed(
  () => loading.value || Boolean(error.value) || navigationPending.value,
)

const isEmpty = computed(() => modules.value.length === 0)
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
      class="flex-1 max-w-[180px] lg:flex-initial lg:w-[161px]"
      :disabled="navDisabled || !hasNext"
      @click="() => void goNext()"
    >
      Next Lesson
    </PrimaryButton>
  </div>
</template>