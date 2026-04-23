<script setup lang="ts">
import { ref, computed, watch } from "vue"
import StatusTag from "@/components/base/status/StatusTag.vue"
import Textarea from "@/components/ui/textarea/Textarea.vue"
import PrimaryButton from "@/components/base/button/PrimaryButton.vue"
import OpenInCourseLink from "@/components/my-assignments/OpenInCourseLink.vue"
import type { CourseAssignmentDto } from "@/types/my-assignments"
import { computeAssignmentDisplayStatus } from "@/types/my-assignments"

const props = defineProps<{
  assignment: CourseAssignmentDto
  submitting?: boolean
}>()

const emit = defineEmits<{
  submit: [assignmentId: string, answer: string]
}>()

const localAnswer = ref(props.assignment.submittedAnswer ?? "")
const localSubmitLock = ref(false)

const displayStatus = computed(() => computeAssignmentDisplayStatus(props.assignment))

const isSubmitted = computed(() => props.assignment.submitted)

const canSubmit = computed(
  () =>
    !isSubmitted.value &&
    localAnswer.value.trim().length > 0 &&
    !props.submitting &&
    !localSubmitLock.value,
)

function handleSubmit() {
  if (canSubmit.value) {
    localSubmitLock.value = true
    emit("submit", props.assignment.assignmentId, localAnswer.value)
  }
}

watch(
  () => props.submitting,
  (isSubmitting) => {
    if (!isSubmitting) localSubmitLock.value = false
  },
)
</script>

<template>
  <article class="flex flex-col gap-4 rounded-[8px] bg-blue-100 p-5 lg:p-6">
    <header class="flex flex-col gap-4">
      <div class="flex items-start justify-between gap-3">
        <div class="flex flex-col gap-2">
          <p class="text-body1 text-black">
            Course: {{ assignment.courseTitle }}
          </p>
          <p v-if="assignment.moduleName" class="text-body3 text-gray-700">
            {{ assignment.moduleName }}
          </p>
        </div>

        <StatusTag :variant="displayStatus" class="hidden shrink-0 mt-0.5 sm:block" />
      </div>

      <StatusTag :variant="displayStatus" class="sm:hidden w-fit" />
    </header>

    <section class="flex flex-col gap-4 bg-white border border-gray-400 rounded-[8px] p-4">
      <p class="text-body2 text-black">
        {{ assignment.title }}
      </p>

      <template v-if="!isSubmitted">
        <div class="flex flex-col gap-3 sm:flex-row sm:items-start">
          <Textarea v-model="localAnswer" placeholder="Answer..." :disabled="submitting"
            class="min-h-[96px] resize-none rounded-[8px] border border-gray-400 bg-white px-3 py-4 text-body2 text-gray-900 placeholder:text-gray-600 shadow-none ring-0 focus-visible:border-blue-500 focus-visible:ring-2 focus-visible:ring-blue-500/20 sm:flex-1" />

          <PrimaryButton class="h-[48px] w-full sm:w-[126px] sm:shrink-0" :disabled="!canSubmit" @click="handleSubmit">
            {{ submitting ? "Sending…" : "Submit" }}
          </PrimaryButton>
        </div>
      </template>

      <template v-else>
        <div class="rounded-[8px] border border-gray-200 bg-gray-50 px-4 py-3 min-h-[96px]">
          <p class="text-body3 text-gray-700 whitespace-pre-wrap">
            {{ assignment.submittedAnswer }}
          </p>
        </div>
      </template>

      <footer class="flex flex-col items-center gap-2">
        <OpenInCourseLink :course-id="assignment.courseId" :material-id="assignment.moduleId" />
      </footer>
    </section>


  </article>
</template>
