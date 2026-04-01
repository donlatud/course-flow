import axios from "axios"
import type {
  AssignmentListResponse,
  CourseLearningDto,
  CreateMaterialProgressRequest,
  MaterialProgressResponse,
  SubmitAssignmentRequest,
  SubmitAssignmentResponse,
  UpdateMaterialProgressRequest,
} from "@/types/course-learning/course-learning-api"

/**
 * Base URL priority:
 * 1) VITE_API_BASE_URL (recommended)
 * 2) VITE_API_URL (legacy)
 * 2) window.location.origin (same-origin deployments)
 * 3) fallback http://localhost:8080 (local backend)
 */
const configuredBaseURL =
  import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_API_URL

// In dev, prefer same-origin + Vite proxy (avoids CORS).
const baseURL = import.meta.env.DEV
  ? ""
  : configuredBaseURL ||
    (typeof window !== "undefined" ? window.location.origin : "") ||
    "http://localhost:8080"

const AUTH_STORAGE_KEY = "mock_user_id"

export function setMockUserId(userId: string) {
  localStorage.setItem(AUTH_STORAGE_KEY, userId)
}

export function getMockUserId(): string | null {
  return localStorage.getItem(AUTH_STORAGE_KEY)
}

export function clearMockUserId() {
  localStorage.removeItem(AUTH_STORAGE_KEY)
}

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
})

api.interceptors.request.use((config) => {
  const userId = getMockUserId()
  if (!userId) return config

  // Default to MockAuthFilter-friendly header.
  config.headers = config.headers ?? {}
  config.headers["X-User-Id"] = userId
  return config
})

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

