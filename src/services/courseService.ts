import type { Course, CourseContent } from '@/types/course'
import { mockCourseContents } from '@/data/mockCourseContent'

// Mock API service for courses
export class CourseService {
  private static instance: CourseService
  private courses: Course[] = [
    {
      id: 1,
      image: '/src/assets/images/image_course_1.svg',
      title: "Introduction to Web Development",
      desc: "Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites from scratch.",
      lesson: 8,
      duration: "12 Hours",
      price: 49.99,
      rating: 4.5,
      students: 1234,
      level: "Beginner",
      category: "Web Development"
    },
    {
      id: 2,
      image: '/src/assets/images/image_course_1.svg',
      title: "Advanced React Development",
      desc: "Master React concepts including hooks, state management, and modern development patterns.",
      lesson: 12,
      duration: "18 Hours",
      price: 79.99,
      rating: 4.8,
      students: 892,
      level: "Advanced",
      category: "Frontend"
    },
    {
      id: 3,
      image: '/src/assets/images/image_course_1.svg',
      title: "Vue.js Complete Guide",
      desc: "Build dynamic web applications with Vue.js, including Vue Router and Vuex for state management.",
      lesson: 10,
      duration: "15 Hours",
      price: 69.99,
      rating: 4.6,
      students: 756,
      level: "Intermediate",
      category: "Frontend"
    },
    {
      id: 4,
      image: '/src/assets/images/image_course_1.svg',
      title: "Node.js Backend Development",
      desc: "Create powerful server-side applications with Node.js, Express, and MongoDB.",
      lesson: 9,
      duration: "14 Hours",
      price: 74.99,
      rating: 4.7,
      students: 623,
      level: "Intermediate",
      category: "Backend"
    },
    {
      id: 5,
      image: '/src/assets/images/image_course_1.svg',
      title: "Python for Data Science",
      desc: "Learn Python programming with focus on data analysis, visualization, and machine learning basics.",
      lesson: 11,
      duration: "20 Hours",
      price: 89.99,
      rating: 4.9,
      students: 1456,
      level: "Intermediate",
      category: "Data Science"
    },
    {
      id: 6,
      image: '/src/assets/images/image_course_1.svg',
      title: "Mobile App Development",
      desc: "Build cross-platform mobile applications using React Native and modern development tools.",
      lesson: 7,
      duration: "16 Hours",
      price: 84.99,
      rating: 4.4,
      students: 445,
      level: "Intermediate",
      category: "Mobile"
    },
    {
      id: 7,
      image: '/src/assets/images/image_course_1.svg',
      title: "UI/UX Design Principles",
      desc: "Master user interface and user experience design with modern tools and best practices.",
      lesson: 6,
      duration: "10 Hours",
      price: 54.99,
      rating: 4.6,
      students: 892,
      level: "Beginner",
      category: "Design"
    },
    {
      id: 8,
      image: '/src/assets/images/image_course_1.svg',
      title: "Database Management",
      desc: "Learn SQL and NoSQL database design, optimization, and management techniques.",
      lesson: 8,
      duration: "12 Hours",
      price: 64.99,
      rating: 4.5,
      students: 334,
      level: "Intermediate",
      category: "Database"
    },
    {
      id: 9,
      image: '/src/assets/images/image_course_1.svg',
      title: "Cloud Computing Basics",
      desc: "Introduction to cloud services, deployment, and infrastructure management with AWS.",
      lesson: 5,
      duration: "8 Hours",
      price: 44.99,
      rating: 4.3,
      students: 567,
      level: "Beginner",
      category: "Cloud"
    }
  ]

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
      console.log('Attempting to fetch from: /api/courses/published (via proxy)')
      const response = await fetch('/api/courses/published')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const courses = await response.json()
      console.log('✅ Successfully fetched courses from API:', courses)
      return courses
    } catch (error) {
      console.error('❌ Failed to fetch courses from API:', error)
      console.log('🔄 Falling back to mock data...')
      // Fallback to mock data if API fails
      return [...this.courses]
    }
  }

  // Get course by ID
  async getCourseById(id: string): Promise<Course | null> {
    try {
      console.log(`Attempting to fetch course ${id} from: /api/courses/${id} (via proxy)`)
      const response = await fetch(`/api/courses/${id}`)
      if (!response.ok) {
        if (response.status === 404) {
          console.log(`Course ${id} not found`)
          return null
        }
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const course = await response.json()
      console.log(`✅ Successfully fetched course ${id} from API:`, course)
      return course
    } catch (error) {
      console.error(`❌ Failed to fetch course ${id} from API:`, error)
      console.log(`🔄 Falling back to mock data for course ${id}...`)
      // Fallback to mock data if API fails
      return this.courses.find(course => String(course.id) === id) || null
    }
  }

  // Get courses by category
  async getCoursesByCategory(category: string): Promise<Course[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return this.courses.filter(course => course.category === category)
  }

  // Get courses by level
  async getCoursesByLevel(level: string): Promise<Course[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return this.courses.filter(course => course.level === level)
  }

  // Search courses
  async searchCourses(query: string): Promise<Course[]> {
    try {
      const response = await fetch(`/api/courses/published?search=${encodeURIComponent(query)}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const courses = await response.json()
      return courses
    } catch (error) {
      console.error('Failed to search courses from API:', error)
      // Fallback to local search from mock data if API fails
      const lowercaseQuery = query.toLowerCase()
      return this.courses.filter(course => 
        course.title.toLowerCase().includes(lowercaseQuery) ||
        course.desc.toLowerCase().includes(lowercaseQuery) ||
        course.category.toLowerCase().includes(lowercaseQuery)
      )
    }
  }

  // Get featured courses (top rated)
  async getFeaturedCourses(limit: number = 6): Promise<Course[]> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return [...this.courses]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, limit)
  }

  // Get course categories
  async getCategories(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const categories = [...new Set(this.courses.map(course => course.category))]
    return categories.sort()
  }

  // Get course levels
  async getLevels(): Promise<string[]> {
    await new Promise(resolve => setTimeout(resolve, 200))
    const levels = [...new Set(this.courses.map(course => course.level))]
    return levels.sort()
  }

  // Get course content (modules and lessons)
  async getCourseContent(courseId: number): Promise<CourseContent | null> {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockCourseContents[courseId] || null
  }

  // Get all course contents
  async getAllCourseContents(): Promise<CourseContent[]> {
    await new Promise(resolve => setTimeout(resolve, 600))
    return Object.values(mockCourseContents)
  }
}

export const courseService = CourseService.getInstance()
