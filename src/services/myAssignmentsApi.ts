import { api } from "@/lib/api"
import type {
  CourseAssignmentListResponse,
  MyAssignmentCourseListResponse,
} from "@/types/my-assignments"

/**
 * Planned endpoint for "My Assignments" overview page.
 * GET /api/assignments/my-courses
 */
export async function getMyAssignmentCourses() {
  const res = await api.get<MyAssignmentCourseListResponse>("/api/assignments/my-courses")
  return res.data
}

/**
 * Fetch assignments for a specific course.
 * Currently exists on backend: GET /api/courses/{courseId}/assignments
 *
 * Note: backend currently returns `AssignmentResponse[]` (see `AssignmentDto` in
 * `types/course-learning/course-learning-api.ts`). This function uses the planned
 * enhanced shape for the My Assignments pages.
 */
export async function getCourseAssignments(courseId: string) {
  const res = await api.get<CourseAssignmentListResponse>(`/api/courses/${courseId}/assignments`)
  return res.data
}

