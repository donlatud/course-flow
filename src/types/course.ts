export interface Course {
  id: number
  image: string
  title: string
  desc: string
  lesson: number
  duration: string
  price: number
  rating: number
  students: number
  level: 'Beginner' | 'Intermediate' | 'Advanced'
  category: string
}

export interface CourseFilters {
  category?: string
  level?: string
  priceRange?: {
    min: number
    max: number
  }
  rating?: number
}

export interface CourseSearchParams {
  query?: string
  category?: string
  level?: string
  sortBy?: 'title' | 'price' | 'rating' | 'students'
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

export interface Lesson {
  id: number
  title: string
  duration: string
  videoUrl?: string
  completed: boolean
  order: number
}

export interface Module {
  id: number
  title: string
  description: string
  lessons: Lesson[]
  order: string | number
  totalDuration: string
}

export interface CourseContent {
  courseId: number
  modules: Module[]
  totalLessons: number
  totalDuration: string
}
