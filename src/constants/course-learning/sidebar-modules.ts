import type { CourseModule } from "@/types/course-learning/sidebar-module"

/** Placeholder until course learning API provides modules + lessons. */
export const MOCK_SIDEBAR_MODULES: CourseModule[] = [
  {
    id: "m01",
    indexLabel: "01",
    title: "Introduction",
    lessons: [
      { id: "l01-1", title: "Welcome to the Course", status: "completed" },
      { id: "l01-2", title: "Course Overview", status: "completed" },
      { id: "l01-3", title: "Getting to Know You", status: "completed" },
      { id: "l01-4", title: "What is Service Design?", status: "completed" },
      {
        id: "l01-5",
        title: "Service Design vs. UX vs. UI vs. Design Thinking",
        status: "completed",
      },
      {
        id: "l01-6",
        title: "4 Levels of Service Design in an Organization",
        status: "in_progress",
      },
      { id: "l01-7", title: "Scope of Service Design", status: "not_started" },
      {
        id: "l01-8",
        title: "Develop an Entirely New Service - U Drink I Drive",
        status: "not_started",
      },
      {
        id: "l01-9",
        title: "Improving Existing Services - Credit Cards",
        status: "not_started",
      },
      {
        id: "l01-10",
        title: "Improving Existing Services - MK Levels of Impact",
        status: "not_started",
      },
    ],
  },
  {
    id: "m02",
    indexLabel: "02",
    title: "Service Design Theories and Principles",
    lessons: [],
  },
  {
    id: "m03",
    indexLabel: "03",
    title: "Understanding Users and Finding Opportunities",
    lessons: [],
  },
  {
    id: "m04",
    indexLabel: "04",
    title: "Identifying and Validating Opportunities for Design",
    lessons: [],
  },
  { id: "m05", indexLabel: "05", title: "Prototyping", lessons: [] },
  { id: "m06", indexLabel: "06", title: "Course Summary", lessons: [] },
]
