<script setup lang="ts">
import { computed } from "vue"
import PrimaryButton from "@/components/base/button/PrimaryButton.vue"
import GhostButton from "../base/button/GhostButton.vue"
import { useCourseLearning } from "@/composables/useCourseLearning"

const { goPrev, goNext, hasPrev, hasNext, loading, error, navigationPending } =
  useCourseLearning()

const navDisabled = computed(
  () => loading.value || Boolean(error.value) || navigationPending.value,
)
</script>
<template>
  <div class="flex justify-between items-center w-full lg:h-[100px]">
    <GhostButton class="w-[145px]" :disabled="navDisabled || !hasPrev" @click="goPrev">
      Previous Lesson
    </GhostButton>
    <PrimaryButton
      class="w-[161px]"
      :disabled="navDisabled || !hasNext"
      @click="() => void goNext()"
    >
      Next Lesson
    </PrimaryButton>
  </div>
</template>