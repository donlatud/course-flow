<script setup lang="ts">
import { computed } from "vue"
import ContentHeader from "./content/ContentHeader.vue"
import MaterialRenderer from "./content/MaterialRenderer.vue"
import AssignmentSection from "./content/AssignmentSection.vue"
import { useCourseLearning } from "@/composables/useCourseLearning"

const {
  activeMaterial,
  enrollmentId,
  loading,
  error,
  activeAssignment,
  assignmentsLoading,
  assignmentsError,
  assignmentText,
  assignmentStatus,
  assignmentSubmitting,
  assignmentSubmitError,
  assignmentSubmitted,
  submittedAnswerText,
  submitActiveAssignment,
} = useCourseLearning()

const materialBlocks = computed(() => {
  const m = activeMaterial.value
  if (!m?.fileUrl) {
    return [{ type: "VIDEO" as const }]
  }
  if (m.fileType === "VIDEO") {
    return [
      {
        type: "VIDEO" as const,
        src: m.fileUrl,
        id: m.materialId,
      },
    ]
  }
  if (m.fileType === "IMAGE") {
    return [
      {
        type: "IMAGE" as const,
        src: m.fileUrl,
        title: m.title,
        alt: m.title,
        id: m.materialId,
      },
    ]
  }
  return [{ type: "PDF" as const, id: m.materialId }]
})

const videoEnrollmentId = computed(() => enrollmentId.value ?? undefined)
const videoMaterialId = computed(() => activeMaterial.value?.materialId)
const videoInitialResumeSeconds = computed(() => activeMaterial.value?.lastPosition ?? undefined)
</script>

<template>
  <div class="flex flex-col gap-8 lg:w-[739px] lg:gap-[33px]">
    <section
      v-if="error"
      class="rounded-[8px] bg-gray-100 px-4 py-3 text-body4 text-gray-900"
      role="alert"
    >
      {{ error }}
    </section>
    <ContentHeader />
    <section
      v-if="loading"
      class="min-h-[214px] w-full rounded-[8px] bg-gray-100 px-6 py-8 text-body3 text-gray-700"
      aria-live="polite"
    >
      Loading lesson content…
    </section>
    <MaterialRenderer
      v-else
      :blocks="materialBlocks"
      :video-enrollment-id="videoEnrollmentId"
      :video-material-id="videoMaterialId"
      :video-initial-resume-seconds="videoInitialResumeSeconds"
    />
    <AssignmentSection
      v-model="assignmentText"
      :status="assignmentStatus"
      :submitted="assignmentSubmitted || Boolean(activeAssignment?.submitted)"
      :title="activeAssignment?.title"
      :prompt="activeAssignment?.description"
      :loading="assignmentsLoading"
      :error="assignmentSubmitError || assignmentsError"
      :submitting="assignmentSubmitting"
      :submitted-answer="submittedAnswerText || assignmentText"
      @submit="submitActiveAssignment"
    />
  </div>
</template>
