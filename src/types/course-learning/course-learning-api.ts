export type ApiAuth =
  | { type: "x-user-id"; userId: string }
  | { type: "bearer"; userId: string }
  | { type: "none" }

/** DTO for `GET /api/courses/{id}/learning` (matches backend `CourseLearningResponse`) */
export type MaterialFileType = "PDF" | "IMAGE" | "VIDEO"

export type MaterialLearningDto = {
  materialId: string
  title: string
  orderIndex: number | null
  fileUrl: string | null
  fileType: MaterialFileType
  duration: number | null
  status: MaterialProgressStatus
  lastPosition: number | null
  completed: boolean
}

export type ModuleLearningDto = {
  moduleId: string
  title: string
  description: string | null
  orderIndex: number | null
  completed: boolean
  materials: MaterialLearningDto[]
}

export type CourseLearningDto = {
  enrollmentId: string
  courseId: string
  courseTitle: string
  courseDescription: string | null
  totalMaterials: number
  completedMaterials: number
  inProgressMaterials: number
  progressPercentage: number | string
  modules: ModuleLearningDto[]
}

export type CourseLearningResponse = CourseLearningDto

export type MaterialProgressStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"

export type CreateMaterialProgressRequest = {
  enrollmentId: string
  materialId: string
}

export type UpdateMaterialProgressRequest = {
  status?: MaterialProgressStatus
  lastPosition?: number
  completedAt?: string
}

export type MaterialProgressResponse = {
  id: string
  enrollmentId: string
  materialId: string
  status: MaterialProgressStatus
  lastPosition: number | null
  completedAt: string | null
  updatedAt: string | null
  moduleCompleted: boolean | null
  enrollmentProgressPercentage: string | number | null
}

export type AssignmentSubmissionStatus = "IN_PROGRESS" | "SUBMITTED"

/** DTO item from `GET /api/courses/{courseId}/assignments` */
export type AssignmentDto = {
  assignmentId: string
  title: string
  description: string | null
  startDate: string | null
  endDate: string | null
  submitted: boolean
  submissionId: string | null
  submissionStatus: AssignmentSubmissionStatus | null
  submittedAt: string | null
}

export type AssignmentListResponse = AssignmentDto[]

export type SubmitAssignmentRequest = {
  submissionText: string
  fileUrl?: string
}

export type SubmitAssignmentResponse = {
  submissionId: string
  assignmentId: string
  userId: string
  status: AssignmentSubmissionStatus
  submissionText: string | null
  fileUrl: string | null
  submittedAt: string | null
}

