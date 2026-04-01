import { computed, inject, provide, ref, watch } from "vue"
import type { InjectionKey } from "vue"
import type { CourseModule, Lesson } from "@/types/course-learning/sidebar-module"
import type {
  AssignmentDto,
  MaterialLearningDto,
  MaterialProgressStatus,
} from "@/types/course-learning/course-learning-api"
import {
  createMaterialProgress,
  getAssignments,
  getCourseLearning,
  updateMaterialProgress,
  submitAssignment,
} from "@/services/courseLearningApi"
import {
  indexMaterialsById,
  mapCourseLearningDtoToModules,
  progressModelValueFromDto,
} from "@/utils/course-learning/mapCourseLearningToSidebar"
import { toast } from "vue-sonner"

export type CourseLearningStore = ReturnType<typeof createCourseLearningStore>

const COURSE_LEARNING_KEY: InjectionKey<CourseLearningStore> = Symbol("course-learning")

export function createCourseLearningStore() {
  const modules = ref<CourseModule[]>([])
  const activeLessonId = ref("")
  const materialsById = ref<Record<string, MaterialLearningDto>>({})

  const enrollmentId = ref<string | null>(null)
  const courseTitle = ref("")
  const courseDescription = ref("")
  const currentCourseId = ref<string | null>(null)

  const loading = ref(false)
  const error = ref<string | null>(null)
  /** True while Next is saving PDF/IMAGE progress before navigation */
  const navigationPending = ref(false)

  const progressValue = ref(0)

  const assignments = ref<AssignmentDto[]>([])
  const assignmentsLoading = ref(false)
  const assignmentsError = ref<string | null>(null)
  const activeAssignmentId = ref<string>("")

  const assignmentText = ref("")
  const assignmentSubmitting = ref(false)
  const assignmentSubmitError = ref<string | null>(null)
  const assignmentSubmitted = ref(false)
  const submittedAnswerText = ref<string>("")

  const flatLessons = computed<Lesson[]>(() => modules.value.flatMap((m) => m.lessons))

  const activeLessonIndex = computed(() =>
    flatLessons.value.findIndex((l) => l.id === activeLessonId.value),
  )

  const activeLesson = computed<Lesson | null>(() => {
    const idx = activeLessonIndex.value
    return idx >= 0 ? flatLessons.value[idx] : null
  })

  const activeMaterial = computed<MaterialLearningDto | null>(() => {
    const id = activeLessonId.value
    if (!id) return null
    return materialsById.value[id] ?? null
  })

  const firstModuleId = computed(() => modules.value[0]?.id ?? "")

  const hasPrev = computed(() => activeLessonIndex.value > 0)
  const hasNext = computed(() => {
    const idx = activeLessonIndex.value
    return idx >= 0 && idx < flatLessons.value.length - 1
  })

  const completedModuleIds = ref<Set<string>>(new Set())

  watch(
    modules,
    (newModules) => {
      const currentCompleted = new Set<string>()
      newModules.forEach((m) => {
        const allCompleted = m.lessons.every((l) => l.status === "completed")
        if (allCompleted && m.lessons.length > 0) {
          currentCompleted.add(m.id)
        }
      })
      const newlyCompleted = [...currentCompleted].filter(
        (id) => !completedModuleIds.value.has(id),
      )
      if (newlyCompleted.length > 0) {
        const module = newModules.find((m) => m.id === newlyCompleted[0])
        if (module) {
          toast.success(`🎉 Module "${module.title}" completed!`, {
            duration: 5000,
          })
        }
      }
      completedModuleIds.value = currentCompleted
    },
    { deep: true },
  )

  function setActiveLessonId(id: string) {
    activeLessonId.value = id
    saveLastWatchedLesson(id)
  }

  function saveLastWatchedLesson(lessonId: string) {
    const cid = currentCourseId.value
    if (!cid || !lessonId) return
    try {
      localStorage.setItem(`course-learning:last-lesson:${cid}`, lessonId)
    } catch {
      // Ignore localStorage errors
    }
  }

  function loadLastWatchedLesson(): string | null {
    const cid = currentCourseId.value
    if (!cid) return null
    try {
      return localStorage.getItem(`course-learning:last-lesson:${cid}`)
    } catch {
      return null
    }
  }

  function recomputeProgressFromMaterials() {
    const materials = Object.values(materialsById.value)
    if (materials.length === 0) {
      progressValue.value = 0
      return
    }
    const completed = materials.filter((m) => m.completed).length
    progressValue.value = Math.round((completed / materials.length) * 100)
  }

  function patchMaterialInStore(
    materialId: string,
    patch: Partial<{
      completed: boolean
      status: MaterialProgressStatus
      lastPosition: number | null
    }>,
  ) {
    const prev = materialsById.value[materialId]
    if (!prev) return

    const next = { ...prev, ...patch }
    materialsById.value = { ...materialsById.value, [materialId]: next }

    const lessonStatus =
      next.completed || next.status === "COMPLETED"
        ? "completed"
        : next.status === "IN_PROGRESS"
          ? "in_progress"
          : "not_started"

    modules.value = modules.value.map((mod) => ({
      ...mod,
      lessons: mod.lessons.map((l) =>
        l.id === materialId ? { ...l, status: lessonStatus } : l,
      ),
    }))

    recomputeProgressFromMaterials()
  }

  /**
   * PDF/IMAGE: mark COMPLETED via API before leaving (Phase 4.5).
   * VIDEO completion is handled by useVideoProgress.
   */
  async function completeActiveNonVideoIfNeeded(): Promise<boolean> {
    const mat = activeMaterial.value
    const enr = enrollmentId.value
    if (!mat || !enr) return true

    if (mat.completed) return true
    if (mat.fileType !== "PDF" && mat.fileType !== "IMAGE") return true

    try {
      const created = await createMaterialProgress({
        enrollmentId: enr,
        materialId: mat.materialId,
      })
      const updated = await updateMaterialProgress(created.id, {
        status: "COMPLETED",
        completedAt: new Date().toISOString(),
      })
      patchMaterialInStore(mat.materialId, {
        completed: true,
        status: "COMPLETED",
        lastPosition: updated.lastPosition ?? mat.lastPosition ?? 0,
      })
      return true
    } catch (e) {
      error.value =
        e instanceof Error ? e.message : "Could not complete lesson before continuing"
      return false
    }
  }

  function goPrev() {
    if (!hasPrev.value || navigationPending.value) return
    const nextId = flatLessons.value[activeLessonIndex.value - 1].id
    activeLessonId.value = nextId
    saveLastWatchedLesson(nextId)
  }

  async function goNext() {
    if (!hasNext.value || navigationPending.value) return

    navigationPending.value = true
    try {
      const ok = await completeActiveNonVideoIfNeeded()
      if (!ok) return

      const idx = activeLessonIndex.value
      const nextLesson = flatLessons.value[idx + 1]
      if (nextLesson) {
        activeLessonId.value = nextLesson.id
        saveLastWatchedLesson(nextLesson.id)
      }
    } finally {
      navigationPending.value = false
    }
  }

  function pickInitialLessonId(nextModules: CourseModule[], previousId: string): string {
    const lastWatched = loadLastWatchedLesson()
    if (lastWatched && nextModules.some((m) => m.lessons.some((l) => l.id === lastWatched))) {
      return lastWatched
    }
    if (previousId && nextModules.some((m) => m.lessons.some((l) => l.id === previousId))) {
      return previousId
    }
    return nextModules[0]?.lessons[0]?.id ?? ""
  }

  async function fetchCourseLearning(courseId: string) {
    if (!courseId.trim()) {
      error.value = "Course ID is missing"
      modules.value = []
      materialsById.value = {}
      activeLessonId.value = ""
      assignments.value = []
      activeAssignmentId.value = ""
      return
    }

    loading.value = true
    error.value = null
    try {
      currentCourseId.value = courseId
      const data = await getCourseLearning(courseId)
      if (!data || !Array.isArray((data as any).modules)) {
        throw new Error("Invalid course learning response: missing `modules`")
      }
      enrollmentId.value = data.enrollmentId
      courseTitle.value = data.courseTitle
      courseDescription.value = data.courseDescription ?? ""
      progressValue.value = progressModelValueFromDto(data)

      const nextModules = mapCourseLearningDtoToModules(data)
      materialsById.value = indexMaterialsById(data)
      modules.value = nextModules

      activeLessonId.value = pickInitialLessonId(nextModules, activeLessonId.value)

      // Load assignments for this course (best-effort, non-blocking for main UI).
      void fetchAssignments(courseId)
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "Could not load course data"
      error.value = message
      modules.value = []
      materialsById.value = {}
      enrollmentId.value = null
      currentCourseId.value = null
      activeLessonId.value = ""
      assignments.value = []
      activeAssignmentId.value = ""
    } finally {
      loading.value = false
    }
  }

  async function fetchAssignments(id: string) {
    if (!id.trim()) return
    assignmentsLoading.value = true
    assignmentsError.value = null
    try {
      const list = await getAssignments(id)
      assignments.value = list
      activeAssignmentId.value = list[0]?.assignmentId ?? ""
    } catch (e) {
      assignmentsError.value =
        e instanceof Error ? e.message : "Could not load assignments"
      assignments.value = []
      activeAssignmentId.value = ""
    } finally {
      assignmentsLoading.value = false
    }
  }

  const activeAssignment = computed<AssignmentDto | null>(() => {
    if (!activeAssignmentId.value) return null
    return assignments.value.find((a) => a.assignmentId === activeAssignmentId.value) ?? null
  })

  const assignmentStatus = computed<"pending" | "in_progress" | "submitted">(() => {
    if (assignmentSubmitted.value || activeAssignment.value?.submitted) return "submitted"
    if (assignmentText.value.trim().length > 0) return "in_progress"
    return "pending"
  })

  async function submitActiveAssignment() {
    const a = activeAssignment.value
    if (!a) return
    if (assignmentSubmitting.value) return
    if (assignmentText.value.trim().length === 0) return

    assignmentSubmitting.value = true
    assignmentSubmitError.value = null
    try {
      const res = await submitAssignment(a.assignmentId, {
        submissionText: assignmentText.value,
      })

      assignmentSubmitted.value = true
      submittedAnswerText.value = res.submissionText ?? assignmentText.value

      assignments.value = assignments.value.map((x) =>
        x.assignmentId === a.assignmentId
          ? {
              ...x,
              submitted: true,
              submissionId: res.submissionId,
              submissionStatus: res.status,
              submittedAt: res.submittedAt,
            }
          : x,
      )
    } catch (e) {
      assignmentSubmitError.value =
        e instanceof Error ? e.message : "Could not submit assignment"
    } finally {
      assignmentSubmitting.value = false
    }
  }

  return {
    modules,
    materialsById,
    activeLessonId,
    activeLessonIndex,
    activeLesson,
    activeMaterial,
    firstModuleId,
    enrollmentId,
    courseTitle,
    courseDescription,
    progressValue,
    loading,
    error,
    navigationPending,
    hasPrev,
    hasNext,
    setActiveLessonId,
    goPrev,
    goNext,
    fetchCourseLearning,

    // assignments
    assignments,
    assignmentsLoading,
    assignmentsError,
    activeAssignment,
    activeAssignmentId,
    assignmentText,
    assignmentSubmitting,
    assignmentSubmitError,
    assignmentSubmitted,
    submittedAnswerText,
    assignmentStatus,
    fetchAssignments,
    submitActiveAssignment,
  }
}

export function provideCourseLearning(store?: CourseLearningStore) {
  const s = store ?? createCourseLearningStore()
  provide(COURSE_LEARNING_KEY, s)
  return s
}

export function useCourseLearning() {
  const store = inject(COURSE_LEARNING_KEY, null)
  if (!store) {
    throw new Error("useCourseLearning() must be used under provideCourseLearning()")
  }
  return store
}
