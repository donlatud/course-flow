import type { Course, CourseContent } from '@/types/course'
import { mockCourseContents } from '@/data/mockCourseContent'

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
      const response = await fetch('/api/courses/published')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const courses = await response.json()
      return courses
    } catch (error) {
      throw new Error('Failed to load courses. Please check if the API server is running.')
    }
  }

  // Get course by ID
  async getCourseById(id: string): Promise<Course | null> {
    console.log("Fetching course with id:", id)
    try {
      const response = await fetch(`/api/courses/${id}`)
      console.log("Response status:", response.status)
      if (!response.ok) {
        if (response.status === 404) {
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const course = await response.json()
      return course
    } catch (error) {
      throw new Error('Failed to load course. Please check if the API server is running.')
    }
  }

  // Get courses by category
  async getCoursesByCategory(category: string): Promise<Course[]> {
    try {
      const response = await fetch(`/api/courses/published?category=${encodeURIComponent(category)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      throw new Error('Failed to load courses by category.')
    }
  }

  // Get courses by level
  async getCoursesByLevel(level: string): Promise<Course[]> {
    try {
      const response = await fetch(`/api/courses/published?level=${encodeURIComponent(level)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      throw new Error('Failed to load courses by level.')
    }
  }

  // Search courses
  async searchCourses(query: string): Promise<Course[]> {
    try {
      const response = await fetch(`/api/courses/published?search=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      throw new Error('Failed to search courses.')
    }
  }

  // Get featured courses (top rated)
  async getFeaturedCourses(limit: number = 6): Promise<Course[]> {
    try {
      const response = await fetch(`/api/courses/published?featured=true&limit=${limit}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      throw new Error('Failed to load featured courses.')
    }
  }

  // Get course categories
  async getCategories(): Promise<string[]> {
    try {
      const response = await fetch('/api/courses/categories')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      throw new Error('Failed to load categories.')
    }
  }

  // Get course levels
  async getLevels(): Promise<string[]> {
    try {
      const response = await fetch('/api/courses/levels')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      throw new Error('Failed to load levels.')
    }
  }

  // Get course content (modules and lessons)
  async getCourseContent(courseId: number): Promise<CourseContent | null> {
    try {
      const response = await fetch(`/api/courses/${courseId}/content`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      // Fallback to mock data for course content
      return mockCourseContents[courseId] || null
    }
  }

  // Get all course contents
  async getAllCourseContents(): Promise<CourseContent[]> {
    try {
      const response = await fetch('/api/courses/contents')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      return await response.json()
    } catch (error) {
      throw new Error('Failed to load all course contents.')
    }
  }
}

export const courseService = CourseService.getInstance()
