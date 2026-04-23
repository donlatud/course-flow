<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useRoute } from "vue-router"
import Navbar from "@/components/shared/Navbar.vue"
import CustomTabs from "@/components/base/input/CustomTabs.vue"
import AppFooter from "@/components/shared/AppFooter.vue"
import AssignmentCard from "@/components/my-assignments/AssignmentCard.vue"
import type { CourseAssignmentDto } from "@/types/my-assignments"
import { computeAssignmentDisplayStatus } from "@/types/my-assignments"
import { submitAssignment } from "@/services/courseLearningApi"
import { getCourseAssignments } from "@/services/myAssignmentsApi"

type TabValue = "all" | "inprogress" | "submitted"

const route = useRoute()
const courseId = computed(() => String(route.params.courseId ?? ""))

const activeTab = ref<TabValue>("all")
const assignments = ref<CourseAssignmentDto[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)
const submittingId = ref<string | null>(null)

const tabs = [
  { value: "all", label: "All" },
  { value: "inprogress", label: "In Progress" },
  { value: "submitted", label: "Submitted" },
]

const filteredAssignments = computed(() => {
  if (activeTab.value === "all") return assignments.value

  return assignments.value.filter((a) => {
    const status = computeAssignmentDisplayStatus(a)
    if (activeTab.value === "submitted") return status === "submitted"
    if (activeTab.value === "inprogress") return status !== "submitted"
    return true
  })
})

async function fetchAssignments() {
  const cid = courseId.value
  if (!cid.trim()) return
  isLoading.value = true
  try {
    loadError.value = null
    assignments.value = await getCourseAssignments(cid)
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : "Could not load assignments"
    assignments.value = []
  } finally {
    isLoading.value = false
  }
}

async function handleSubmit(assignmentId: string, answer: string) {
  if (submittingId.value === assignmentId) return
  submittingId.value = assignmentId
  try {
    loadError.value = null
    await submitAssignment(assignmentId, { submissionText: answer })
    const idx = assignments.value.findIndex((a) => a.assignmentId === assignmentId)
    if (idx !== -1) {
      assignments.value[idx] = {
        ...assignments.value[idx],
        submitted: true,
        submissionStatus: "SUBMITTED",
        submittedAnswer: answer,
        submittedAt: new Date().toISOString(),
      }
    }
  } catch {
    loadError.value = "Could not submit assignment. Please try again."
  } finally {
    submittingId.value = null
  }
}

onMounted(fetchAssignments)
</script>

<template>
  <div class="relative min-h-screen w-full bg-gray-50 flex flex-col">
    <Navbar />

    <main class="relative z-10 flex-1 flex flex-col items-center px-4 pt-10 pb-12 lg:pt-25">
      <section class="w-full max-w-[780px] flex flex-col">
        <header class="flex flex-col gap-6 mb-8">
          <h1 class="lg:text-headline2 text-headline3 text-gray-900 text-center">
            My Assignments
          </h1>

          <CustomTabs v-model="activeTab" :tabs="tabs" />
        </header>

        <section
          v-if="loadError"
          class="mb-6 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-red-700"
          role="alert"
          aria-label="Assignments error"
        >
          <p class="text-body3">
            {{ loadError }}
          </p>
        </section>

        <section
          v-if="isLoading"
          class="flex flex-col gap-5"
          aria-label="Loading assignments"
        >
          <article
            v-for="i in 3"
            :key="i"
            class="flex flex-col gap-4 rounded-[8px] bg-blue-100 p-5 lg:p-6"
          >
            <header class="flex flex-col gap-4">
              <div class="flex items-start justify-between gap-3">
                <div class="flex flex-col gap-2 w-full">
                  <div class="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
                  <div class="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                </div>
                <div class="hidden sm:block h-6 w-20 bg-gray-200 rounded animate-pulse shrink-0" />
              </div>
              <div class="sm:hidden h-6 w-20 bg-gray-200 rounded animate-pulse" />
            </header>

            <section class="flex flex-col gap-4 bg-white border border-gray-400 rounded-[8px] p-4">
              <div class="h-5 w-5/6 bg-gray-200 rounded animate-pulse" />
              <div class="h-[96px] w-full bg-gray-200 rounded animate-pulse" />
              <div class="h-12 w-full sm:w-[126px] bg-gray-200 rounded animate-pulse self-end sm:self-auto" />
              <div class="h-8 w-28 bg-gray-200 rounded animate-pulse self-center" />
            </section>
          </article>
        </section>

        <ul
          v-else-if="filteredAssignments.length > 0"
          class="flex flex-col gap-5"
          aria-label="Assignment list"
        >
          <li v-for="assignment in filteredAssignments" :key="assignment.assignmentId">
            <AssignmentCard
              :assignment="assignment"
              :submitting="submittingId === assignment.assignmentId"
              @submit="handleSubmit"
            />
          </li>
        </ul>

        <div
          v-else
          class="flex flex-col items-center justify-center py-20 text-gray-400"
        >
          <p class="text-body2">No assignments found in this category.</p>
        </div>
      </section>
    </main>

    <AppFooter />
  </div>
</template>
