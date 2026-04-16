export type MyAssignmentsCourseStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED"

/**
 * Course summary item for the "My Assignments" overview page.
 * Planned for: `GET /api/assignments/my-courses`
 */
export type MyAssignmentCourseDto = {
  courseId: string
  courseTitle: string
  courseDescription: string | null
  coverImageUrl: string | null
  lessonCount: number | null
  totalHours: number | null
  totalAssignments: number
  submittedAssignments: number
  assignmentStatus: MyAssignmentsCourseStatus
}

export type MyAssignmentCourseListResponse = MyAssignmentCourseDto[]

/**
 * Enhanced assignment list item for "My Assignments" course detail page.
 * Current backend: `GET /api/courses/{courseId}/assignments` returns a simpler shape
 * (see `AssignmentDto` in `types/course-learning/course-learning-api.ts`).
 *
 * This type is for the planned enhanced shape (module/course context + submittedAnswer).
 */
export type CourseAssignmentDto = {
  assignmentId: string
  title: string
  description: string | null
  startDate: string | null
  endDate: string | null
  submitted: boolean
  submissionId: string | null
  submissionStatus: "IN_PROGRESS" | "SUBMITTED" | "GRADED" | null
  submittedAt: string | null
  submittedAnswer: string | null
  moduleId: string | null
  moduleName: string | null
  courseId: string
  courseTitle: string
}

export type CourseAssignmentListResponse = CourseAssignmentDto[]

export type AssignmentDisplayStatus = "pending" | "in_progress" | "submitted"

export function computeAssignmentDisplayStatus(
  assignment: CourseAssignmentDto,
): AssignmentDisplayStatus {
  if (assignment.submitted) return "submitted"
  if (assignment.submissionStatus === "IN_PROGRESS") return "in_progress"
  return "pending"
}

