export type LessonStatus = "completed" | "in_progress" | "not_started"

export type Lesson = {
  id: string
  title: string
  status: LessonStatus
}

export type CourseModule = {
  id: string
  indexLabel: string
  title: string
  lessons: Lesson[]
}
