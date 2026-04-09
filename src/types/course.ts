export interface Course {
  id: string
  coverImageUrl: string
  title: string
  description: string
  price: number
  category: string | null
  subject: string | null
  status: string
  adminId: string
  createdAt: string
  updatedAt: string
  trailerVideoUrl?: string
  attachmentUrl?: string
  // Frontend specific fields (computed or added)
  lessonCount?: number
  totalLearningTime?: string | number | null
  rating?: number
  students?: number
  level?: 'Beginner' | 'Intermediate' | 'Advanced'
  modules?: ModuleWithMaterials[]
}

export interface Material {
  id: string
  title: string
  orderIndex: number
  fileUrl: string
  detail: string | null
  fileType: string
  duration: number | null
}

export interface ModuleWithMaterials {
  id?: string  // Optional alias for moduleId
  moduleId: string
  title: string
  description: string | null
  orderIndex: number
  materials: Material[]
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
