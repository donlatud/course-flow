import type { AssignmentDto, CourseLearningDto } from "@/types/course-learning/course-learning-api"

/** Stable id so mock navigation / local resume behaves predictably */
export const MOCK_COURSE_LEARNING_ENROLLMENT_ID = "aaaaaaaa-bbbb-4ccc-dddd-eeeeeeeeeeee"

/**
 * Full UI demo for course learning (progress, modules, materials, prev/next).
 * Enable with `VITE_MOCK_COURSE_LEARNING=true` in `.env` / `.env.local`.
 */
export function buildMockCourseLearningDto(courseId: string): CourseLearningDto {
  return {
    enrollmentId: MOCK_COURSE_LEARNING_ENROLLMENT_ID,
    courseId,
    courseTitle: "Demo: Course Learning (mock)",
    courseDescription:
      "ข้อมูลจำลองสำหรับรีวิว — มี progress, โมดูล, บทเรียน, วิดีโอ/รูป และปุ่ม Previous / Next",
    totalMaterials: 4,
    completedMaterials: 1,
    inProgressMaterials: 1,
    progressPercentage: 33.33,
    modules: [
      {
        moduleId: "bbbbbbbb-1111-4111-8111-111111111111",
        title: "Getting started",
        description: "Orientation and welcome",
        orderIndex: 1,
        completed: false,
        materials: [
          {
            materialId: "cccccccc-1111-4111-8111-111111111111",
            title: "Welcome to the course",
            orderIndex: 1,
            fileUrl:
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
            fileType: "VIDEO",
            duration: 596,
            status: "COMPLETED",
            lastPosition: 596,
            completed: true,
          },
          {
            materialId: "cccccccc-2222-4222-8222-222222222222",
            title: "How this course works",
            orderIndex: 2,
            fileUrl:
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
            fileType: "VIDEO",
            duration: 15,
            status: "IN_PROGRESS",
            lastPosition: 8,
            completed: false,
          },
        ],
      },
      {
        moduleId: "bbbbbbbb-2222-4222-8222-222222222222",
        title: "Core concepts",
        description: "Key ideas and practice",
        orderIndex: 2,
        completed: false,
        materials: [
          {
            materialId: "cccccccc-3333-4333-8333-333333333333",
            title: "Concept overview",
            orderIndex: 1,
            fileUrl:
              "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
            fileType: "VIDEO",
            duration: 15,
            status: "NOT_STARTED",
            lastPosition: null,
            completed: false,
          },
          {
            materialId: "cccccccc-4444-4444-8444-444444444444",
            title: "Reference diagram",
            orderIndex: 2,
            fileUrl: "https://picsum.photos/id/180/1200/800",
            fileType: "IMAGE",
            duration: null,
            status: "NOT_STARTED",
            lastPosition: null,
            completed: false,
          },
        ],
      },
    ],
  }
}

export function buildMockAssignments(): AssignmentDto[] {
  return [
    {
      assignmentId: "dddddddd-1111-4111-8111-111111111111",
      title: "Mock assignment: reflect on module 1",
      description: "เขียนสั้นๆ 1–2 ประโยค (โหมด mock — ส่งแล้วจะแสดงในหน้าจอเท่านั้น)",
      startDate: null,
      endDate: null,
      submitted: false,
      submissionId: null,
      submissionStatus: null,
      submittedAt: null,
    },
  ]
}
