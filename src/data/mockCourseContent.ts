import type { CourseContent, Module, Lesson } from '@/types/course'

const createMockLessons = (moduleIndex: number): Lesson[] => {
  const lessonTemplates = [
    // Module 1 - Introduction
    [
      { title: 'Course Introduction', duration: '5:30' },
      { title: 'Setting Up Development Environment', duration: '12:45' },
      { title: 'Understanding the Course Structure', duration: '8:20' },
      { title: 'Prerequisites and Requirements', duration: '6:15' },
      { title: 'Download Course Resources', duration: '3:40' }
    ],
    // Module 2 - Fundamentals
    [
      { title: 'Basic Concepts Overview', duration: '15:20' },
      { title: 'Core Principles Explained', duration: '18:30' },
      { title: 'Hands-on Practice Exercise', duration: '22:10' },
      { title: 'Common Mistakes to Avoid', duration: '10:25' },
      { title: 'Module 2 Summary', duration: '7:15' },
      { title: 'Practice Quiz', duration: '12:00' }
    ],
    // Module 3 - Intermediate Topics
    [
      { title: 'Advanced Techniques Introduction', duration: '14:45' },
      { title: 'Working with Complex Data', duration: '20:30' },
      { title: 'Performance Optimization', duration: '16:20' },
      { title: 'Debugging Strategies', duration: '11:40' },
      { title: 'Real-world Project Setup', duration: '25:15' },
      { title: 'Code Review Best Practices', duration: '13:50' },
      { title: 'Module 3 Assessment', duration: '15:00' }
    ],
    // Module 4 - Advanced Features
    [
      { title: 'Advanced Patterns and Architecture', duration: '18:30' },
      { title: 'Security Considerations', duration: '16:45' },
      { title: 'Scalability Principles', duration: '21:20' },
      { title: 'Integration with External Services', duration: '19:10' },
      { title: 'Testing Strategies', duration: '14:55' },
      { title: 'Deployment and CI/CD', duration: '23:30' },
      { title: 'Monitoring and Maintenance', duration: '12:40' },
      { title: 'Final Project Overview', duration: '17:25' }
    ]
  ]

  return lessonTemplates[moduleIndex]?.map((lesson, index) => ({
    id: moduleIndex * 100 + index + 1,
    title: lesson.title,
    duration: lesson.duration,
    videoUrl: `https://example.com/video/${moduleIndex + 1}-${index + 1}`,
    completed: Math.random() > 0.7, // Random completion status
    order: index + 1
  })) || []
}

const createMockModules = (): Module[] => {
  const moduleTemplates = [
    {
      title: 'Module 1: Introduction to Web Development',
      description: 'Get started with the fundamentals of web development. Learn the essential concepts and set up your development environment.'
    },
    {
      title: 'Module 2: Core Concepts and Fundamentals',
      description: 'Deep dive into the core principles. Master the foundational concepts that will support your learning journey.'
    },
    {
      title: 'Module 3: Intermediate Techniques',
      description: 'Build upon your foundation with intermediate-level techniques and real-world applications.'
    },
    {
      title: 'Module 4: Advanced Topics and Best Practices',
      description: 'Explore advanced concepts, industry best practices, and prepare for professional development.'
    }
  ]

  return moduleTemplates.map((template, index) => {
    const lessons = createMockLessons(index)
    const totalMinutes = lessons.reduce((total, lesson) => {
      const [minutes, seconds] = lesson.duration.split(':').map(Number)
      return total + minutes + (seconds || 0) / 60
    }, 0)

    const hours = Math.floor(totalMinutes / 60)
    const minutes = Math.floor(totalMinutes % 60)

    return {
      id: index + 1,
      title: template.title,
      description: template.description,
      lessons,
      order: String(index + 1).padStart(2, '0'),
      totalDuration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
    }
  })
}

export const createMockCourseContent = (courseId: number): CourseContent => {
  const modules = createMockModules()
  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0)
  
  const totalMinutes = modules.reduce((total, module) => {
    const moduleMinutes = module.lessons.reduce((moduleTotal, lesson) => {
      const [minutes, seconds] = lesson.duration.split(':').map(Number)
      return moduleTotal + minutes + (seconds || 0) / 60
    }, 0)
    return total + moduleMinutes
  }, 0)

  const totalHours = Math.floor(totalMinutes / 60)
  const totalMinutesRemainder = Math.floor(totalMinutes % 60)

  return {
    courseId,
    modules,
    totalLessons,
    totalDuration: totalHours > 0 ? `${totalHours}h ${totalMinutesRemainder}m` : `${totalMinutesRemainder}m`
  }
}

// Pre-generated mock data for different courses
export const mockCourseContents: Record<number, CourseContent> = {
  1: createMockCourseContent(1),
  2: createMockCourseContent(2),
  3: createMockCourseContent(3),
  4: createMockCourseContent(4),
  5: createMockCourseContent(5)
}
