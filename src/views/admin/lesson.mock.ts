export interface LessonItem {
  id: number
  name: string
  subLesson: number
}

export const lessonMock: LessonItem[] = [
  { id: 1, name: "Introduction", subLesson: 10 },
  { id: 2, name: "Service Design Theories and Principles", subLesson: 10 },
  { id: 3, name: "Understanding Users and Finding Opportunities", subLesson: 10 },
  { id: 4, name: "Identifying and Validating Opportunities for Design", subLesson: 10 },
  { id: 5, name: "Prototyping", subLesson: 10 },
  { id: 6, name: "Course Summary", subLesson: 10 },
]
