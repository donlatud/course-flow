import type { CourseLearningDto, MaterialLearningDto } from "@/types/course-learning/course-learning-api"
import type { CourseModule, Lesson, LessonStatus } from "@/types/course-learning/sidebar-module"

function lessonStatusFromMaterial(m: MaterialLearningDto): LessonStatus {
  if (m.completed) return "completed"
  if (m.status === "IN_PROGRESS") return "in_progress"
  return "not_started"
}

function formatModuleIndexLabel(orderIndex: number | null, fallbackIndex: number): string {
  const n = orderIndex ?? fallbackIndex
  return String(Math.max(1, n)).padStart(2, "0")
}

export function mapCourseLearningDtoToModules(dto: CourseLearningDto): CourseModule[] {
  const modules = Array.isArray(dto.modules) ? dto.modules : []
  return modules.map((mod, idx) => ({
    id: mod.moduleId,
    indexLabel: formatModuleIndexLabel(mod.orderIndex, idx + 1),
    title: mod.title,
    lessons: [...(Array.isArray(mod.materials) ? mod.materials : [])]
      .sort((a, b) => (a.orderIndex ?? 0) - (b.orderIndex ?? 0))
      .map(
        (mat): Lesson => ({
          id: mat.materialId,
          title: mat.title,
          status: lessonStatusFromMaterial(mat),
        }),
      ),
  }))
}

export function indexMaterialsById(dto: CourseLearningDto): Record<string, MaterialLearningDto> {
  const map: Record<string, MaterialLearningDto> = {}
  const modules = Array.isArray(dto.modules) ? dto.modules : []
  for (const mod of modules) {
    const materials = Array.isArray(mod.materials) ? mod.materials : []
    for (const mat of materials) {
      map[mat.materialId] = mat
    }
  }
  return map
}

export function progressModelValueFromDto(dto: CourseLearningDto): number {
  const pct = dto.progressPercentage
  if (typeof pct === "number" && Number.isFinite(pct)) {
    return Math.min(100, Math.max(0, Math.round(pct)))
  }
  const parsed = parseFloat(String(pct))
  if (Number.isFinite(parsed)) {
    return Math.min(100, Math.max(0, Math.round(parsed)))
  }
  return 0
}
