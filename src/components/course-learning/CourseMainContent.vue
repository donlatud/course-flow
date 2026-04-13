<script setup lang="ts">
import { computed } from "vue"
import ContentHeader from "./content/ContentHeader.vue"
import MaterialRenderer from "./content/MaterialRenderer.vue"
import AssignmentSection from "./content/AssignmentSection.vue"
import SkeletonVideoPlayer from "./skeleton/SkeletonVideoPlayer.vue"
import SkeletonAssignment from "./skeleton/SkeletonAssignment.vue"
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
  modules,
} = useCourseLearning()

const isEmpty = computed(() => !loading.value && modules.value.length === 0)
const hasNoActiveMaterial = computed(() => !loading.value && !activeMaterial.value && modules.value.length > 0)

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
  <div class="flex flex-col gap-8 md:flex-1 lg:w-[739px] lg:gap-[33px]">
    <section
      v-if="error"
      class="rounded-[8px] bg-gray-100 px-4 py-3 text-body4 text-gray-900"
      role="alert"
    >
      {{ error }}
    </section>
    
    <!-- Empty State: No Content -->
    <section
      v-if="isEmpty"
      class="flex min-h-[400px] w-full flex-col items-center justify-center gap-6 rounded-[8px] bg-white px-6 py-12 text-center shadow-1"
      role="status"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-20 w-20 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
        />
      </svg>
      <div class="flex flex-col gap-3">
        <h2 class="text-h3 font-bold text-gray-900">
          No Lessons Available
        </h2>
        <p class="text-body2 text-gray-600 max-w-md">
          This course doesn't have any lessons yet. The instructor is still preparing the content. Please check back later!
        </p>
      </div>
    </section>

    <!-- Empty State: No Active Material -->
    <section
      v-else-if="hasNoActiveMaterial"
      class="flex min-h-[400px] w-full flex-col items-center justify-center gap-6 rounded-[8px] bg-white px-6 py-12 text-center shadow-1"
      role="status"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="h-20 w-20 text-blue-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122"
        />
      </svg>
      <div class="flex flex-col gap-3">
        <h2 class="text-h3 font-bold text-gray-900">
          Select a Lesson
        </h2>
        <p class="text-body2 text-gray-600 max-w-md">
          Choose a lesson from the sidebar to start learning
        </p>
      </div>
    </section>

    <!-- Normal Content -->
    <template v-else>
      <ContentHeader />
      
      <!-- Material Content: Video/PDF/Image -->
      <SkeletonVideoPlayer v-if="loading" />
      <MaterialRenderer
        v-else
        :blocks="materialBlocks"
        :video-enrollment-id="videoEnrollmentId"
        :video-material-id="videoMaterialId"
        :video-initial-resume-seconds="videoInitialResumeSeconds"
      />
      
      <!-- Assignment Section (only when an assignment exists; avoid a dummy form that ignores submit) -->
      <SkeletonAssignment v-if="assignmentsLoading && !activeAssignment" />
      <section
        v-else-if="assignmentsError"
        class="rounded-[8px] bg-gray-100 px-4 py-3 text-body4 text-gray-900 lg:mt-[47px]"
        role="alert"
      >
        {{ assignmentsError }}
      </section>
      <AssignmentSection
        v-else-if="activeAssignment"
        v-model="assignmentText"
        :status="assignmentStatus"
        :submitted="assignmentSubmitted || Boolean(activeAssignment.submitted)"
        :title="activeAssignment.title"
        :prompt="activeAssignment.description"
        :solution="activeAssignment.solution ?? null"
        :loading="assignmentsLoading"
        :error="assignmentSubmitError || assignmentsError"
        :submitting="assignmentSubmitting"
        :submitted-answer="submittedAnswerText || assignmentText"
        @submit="submitActiveAssignment"
      />
    </template>
  </div>
</template>
