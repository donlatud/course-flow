import type { Course, CourseContent } from '@/types/course'
import { mockCourseContents } from '@/data/mockCourseContent'
import { api } from '@/lib/api'

// API service for courses
export class CourseService {
  private static instance: CourseService

  private constructor() {}

  static getInstance(): CourseService {
    if (!CourseService.instance) {
      CourseService.instance = new CourseService()
    }
    return CourseService.instance
  }

  // Get all courses
  async getAllCourses(): Promise<Course[]> {
    try {
      const { data } = await api.get<Course[]>('/api/courses/published')
      return data
    } catch (error) {
      throw new Error('Failed to load courses. Please check if the API server is running.')
    }
  }

  // Get course by ID
  async getCourseById(id: string): Promise<Course | null> {
    try {
      const { data } = await api.get<Course>(`/api/courses/${id}`)
      return data
    } catch (error: unknown) {
      const status = (error as { response?: { status?: number } }).response?.status
      if (status === 404) return null
      throw new Error('Failed to load course. Please check if the API server is running.')
    }
  }

  // Get courses by category
  async getCoursesByCategory(category: string): Promise<Course[]> {
    try {
      const { data } = await api.get<Course[]>('/api/courses/published', {
        params: { category },
      })
      return data
    } catch (error) {
      throw new Error('Failed to load courses by category.')
    }
  }

  // Get courses by level
  async getCoursesByLevel(level: string): Promise<Course[]> {
    try {
      const { data } = await api.get<Course[]>('/api/courses/published', {
        params: { level },
      })
      return data
    } catch (error) {
      throw new Error('Failed to load courses by level.')
    }
  }

  // Search courses
  async searchCourses(query: string): Promise<Course[]> {
    try {
      const { data } = await api.get<Course[]>('/api/courses/published', {
        params: { search: query },
      })
      return data
    } catch (error) {
      throw new Error('Failed to search courses.')
    }
  }

  // Get featured courses (top rated)
  async getFeaturedCourses(limit: number = 6): Promise<Course[]> {
    try {
      const { data } = await api.get<Course[]>('/api/courses/published', {
        params: { featured: true, limit },
      })
      return data
    } catch (error) {
      throw new Error('Failed to load featured courses.')
    }
  }

  // Get course categories
  async getCategories(): Promise<string[]> {
    try {
      const { data } = await api.get<string[]>('/api/courses/categories')
      return data
    } catch (error) {
      throw new Error('Failed to load categories.')
    }
  }

  // Get course levels
  async getLevels(): Promise<string[]> {
    try {
      const { data } = await api.get<string[]>('/api/courses/levels')
      return data
    } catch (error) {
      throw new Error('Failed to load levels.')
    }
  }

  // Get course content (modules and lessons)
  async getCourseContent(courseId: number): Promise<CourseContent | null> {
    try {
      const { data } = await api.get<CourseContent>(`/api/courses/${courseId}/content`)
      return data
    } catch (error) {
      // Fallback to mock data for course content
      return mockCourseContents[courseId] || null
    }
  }

  // Get all course contents
  async getAllCourseContents(): Promise<CourseContent[]> {
    try {
      const { data } = await api.get<CourseContent[]>('/api/courses/contents')
      return data
    } catch (error) {
      throw new Error('Failed to load all course contents.')
    }
  }
}

export const courseService = CourseService.getInstance()
