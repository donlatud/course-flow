<script setup lang="ts">
import { computed, onMounted, ref } from "vue"
import { useAuth } from "@/composables/useAuth"
import Navbar from "@/components/shared/Navbar.vue"
import CustomTabs from "@/components/base/input/CustomTabs.vue"
import AppFooter from "@/components/shared/AppFooter.vue"
import UserProfileCard from "@/components/my-course/UserProfileCard.vue"
import CourseCard from "@/components/courses/CourseCard.vue"
import type { MyAssignmentCourseDto } from "@/types/my-assignments"
import { getMyAssignmentCourses } from "@/services/myAssignmentsApi"

const { userProfile } = useAuth()

const activeTab = ref("all")
const courses = ref<MyAssignmentCourseDto[]>([])
const isLoading = ref(true)
const loadError = ref<string | null>(null)

const tabs = [
  { value: "all", label: "All Courses" },
  { value: "inprogress", label: "In Progress" },
  { value: "completed", label: "Completed" },
]

const filteredCourses = computed(() => {
  if (activeTab.value === "all") return courses.value
  const statusMap: Record<string, string> = {
    inprogress: "IN_PROGRESS",
    completed: "COMPLETED",
  }
  return courses.value.filter((c) => c.assignmentStatus === statusMap[activeTab.value])
})

const inProgressCount = computed(
  () => courses.value.filter((c) => c.assignmentStatus === "IN_PROGRESS").length,
)
const completedCount = computed(
  () => courses.value.filter((c) => c.assignmentStatus === "COMPLETED").length,
)

const displayName = computed(() => userProfile.value?.fullName ?? "")
const profilePic = computed(() => userProfile.value?.profilePictureUrl ?? undefined)

onMounted(async () => {
  isLoading.value = true
  try {
    loadError.value = null
    courses.value = await getMyAssignmentCourses()
  } catch (e) {
    loadError.value = e instanceof Error ? e.message : "Could not load assignments"
    courses.value = []
  } finally {
    isLoading.value = false
  }
})
</script>

<template>
  <div class="relative min-h-screen w-full bg-white flex flex-col">
    <!-- Decorative background (shared with My Courses) -->
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <img
        src="@/assets/images/background-courses-mobile.svg"
        alt=""
        class="absolute w-full block xl:hidden top-[116px]"
      />
      <img
        src="@/assets/images/background-courses.svg"
        alt=""
        class="absolute 2xl:w-full hidden xl:block top-[196px] left-[43px]"
      />
    </div>

    <Navbar />

    <main class="relative z-10 flex-1 flex flex-col items-center px-4 pt-10 pb-12 lg:pt-25">
      <div class="w-full max-w-[1200px] flex flex-col">
        <h1 class="lg:text-headline2 text-headline3 text-gray-900 text-center lg:mb-14 mb-6">
          My Assignments
        </h1>

        <CustomTabs v-model="activeTab" :tabs="tabs" class="mb-12" />

        <div class="flex flex-col lg:flex-row gap-10 items-start">
          <!-- Desktop: sticky sidebar -->
          <aside class="hidden xl:block sticky top-30 shrink-0">
            <UserProfileCard
              variant="desktop"
              :name="displayName"
              :profile-image="profilePic"
              :course-inprogress="inProgressCount"
              :course-complete="completedCount"
              in-progress-label="Assignment Inprogress"
              complete-label="Assignment Complete"
            />
          </aside>

          <!-- Course grid -->
          <section class="flex-1">
            <section
              v-if="loadError"
              class="mb-6 rounded-[8px] border border-red-200 bg-red-50 px-4 py-3 text-red-700"
              role="alert"
              aria-label="Load assignments error"
            >
              <p class="text-body3">
                {{ loadError }}
              </p>
            </section>

            <section
              v-if="isLoading"
              class="grid grid-cols-1 md:grid-cols-2 gap-8"
              aria-label="Loading assignments"
            >
              <article
                v-for="i in 4"
                :key="i"
                class="flex flex-col rounded-lg w-full mx-auto shadow-1 h-full bg-white overflow-hidden"
              >
                <div class="w-full h-60 bg-gray-200 animate-pulse shrink-0" />
                <div class="flex flex-col gap-3 p-6 grow">
                  <div class="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                  <div class="h-6 w-3/4 bg-gray-200 rounded animate-pulse" />
                  <div class="h-4 w-full bg-gray-200 rounded animate-pulse" />
                  <div class="h-4 w-5/6 bg-gray-200 rounded animate-pulse" />
                </div>
                <div class="h-px bg-gray-100" />
                <div class="flex gap-4 p-6 h-14 shrink-0">
                  <div class="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                  <div class="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                </div>
              </article>
            </section>

            <div
              v-else-if="filteredCourses.length > 0"
              class="grid grid-cols-1 md:grid-cols-2 gap-8"
            >
              <CourseCard
                v-for="course in filteredCourses"
                :key="course.courseId"
                :image="course.coverImageUrl ?? ''"
                :title="course.courseTitle"
                :description="course.courseDescription ?? ''"
                :lesson="course.lessonCount ?? 0"
                :duration="`${course.totalHours ?? 0} Hours`"
                :to="`/my-assignments/${course.courseId}`"
                :submitted-assignments="course.submittedAssignments ?? 0"
                :total-assignments="course.totalAssignments ?? 0"
              />
            </div>

            <div
              v-else
              class="flex flex-col items-center justify-center py-20 text-gray-400"
            >
              <p class="text-body2">No assignments found in this category.</p>
            </div>
          </section>
        </div>

        <!-- Mobile: profile card after course list -->
        <div class="xl:hidden mt-10 flex justify-center">
          <UserProfileCard
            variant="mobile"
            :name="displayName"
            :profile-image="profilePic"
            :course-inprogress="inProgressCount"
            :course-complete="completedCount"
            in-progress-label="Assignment Inprogress"
            complete-label="Assignment Complete"
          />
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
