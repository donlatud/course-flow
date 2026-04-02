import api from "@/lib/api"
import type {
  AssignmentListResponse,
  CourseLearningDto,
  CreateMaterialProgressRequest,
  MaterialProgressResponse,
  SubmitAssignmentRequest,
  SubmitAssignmentResponse,
  UpdateMaterialProgressRequest,
} from "@/types/course-learning/course-learning-api"

export async function getCourseLearning(courseId: string) {
  const res = await api.get<CourseLearningDto>(`/api/courses/${courseId}/learning`)
  return res.data
}

export async function createMaterialProgress(payload: CreateMaterialProgressRequest) {
  const res = await api.post<MaterialProgressResponse>("/api/material-progress", payload)
  return res.data
}

export async function updateMaterialProgress(
  materialProgressId: string,
  payload: UpdateMaterialProgressRequest,
) {
  const res = await api.put<MaterialProgressResponse>(
    `/api/material-progress/${materialProgressId}`,
    payload,
  )
  return res.data
}

export async function getAssignments(courseId: string) {
  const res = await api.get<AssignmentListResponse>(`/api/courses/${courseId}/assignments`)
  return res.data
}

export async function submitAssignment(assignmentId: string, payload: SubmitAssignmentRequest) {
  const res = await api.post<SubmitAssignmentResponse>(
    `/api/assignments/${assignmentId}/submissions`,
    payload,
  )
  return res.data
}

