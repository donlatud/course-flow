<template>
  <div class="bg-white  py-6">
    <div class="flex items-center justify-between mb-6">
      <h2 class="text-2xl font-bold text-gray-900">Module Samples</h2>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-12">
      <div class="text-gray-600">Loading course content...</div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="flex justify-center items-center py-12">
      <div class="text-red-600">{{ error }}</div>
    </div>

    <!-- Course Content -->
    <div v-else-if="courseContent" class="">
      <div
        v-for="module in courseContent.modules"
        :key="module.id"
        class=" overflow-hidden "
      >
        <!-- Module Header -->
        <div
          class="flex items-center justify-between py-4  cursor-pointer  transition-colors border-b  "
          @click="toggleModule(module.id)"
        >
          <div class="flex items-center justify-around gap-6 pb-2">
              <span class="text-body1  text-gray-700">{{ module.order }}</span>
            <div>
              <h3 class="text-body1 max-w-[246px]">{{ module.title }}</h3>
            </div>
          </div>
          <div class="flex items-center gap-3">
            <img
            src="@/assets/icon-arrow-down.svg"
              class="w-[10px] h-[5px] text-gray-400 transform transition-transform duration-200"
              :class="{ 'rotate-180': expandedModules.includes(module.id) }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M19 9l-7 7-7-7"
              />
            </img>
          </div>
        </div>

        <!-- Module Lessons -->
        <div
          v-show="expandedModules.includes(module.id)"
          class="border-t border-gray-200 pt-4"
        >
          <div
            v-for="lesson in module.lessons"
            :key="lesson.id"
            class="flex items-center gap-3 py-2 px-10 hover:bg-gray-50 transition-colors cursor-pointer"
            @click="selectLesson(lesson)"
          >
            <div class="w-2 h-2 bg-gray-700 rounded-full"></div>
            <span class="text-body2 text-gray-700">{{ lesson.title }}</span>
          </div>
        </div>
      </div>
    </div>
    

    <!-- Empty State -->
    <div v-else class="text-center py-12">
      <div class="text-gray-600">No course content available</div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { CourseContent, Lesson } from '@/types/course'
import { courseService } from '@/services/courseService'

interface Props {
  courseId: number
}

const props = defineProps<Props>()
const emit = defineEmits<{
  lessonSelected: [lesson: Lesson]
}>()

const courseContent = ref<CourseContent | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const expandedModules = ref<number[]>([1]) // Expand first module by default

const toggleModule = (moduleId: number) => {
  const index = expandedModules.value.indexOf(moduleId)
  if (index > -1) {
    expandedModules.value.splice(index, 1)
  } else {
    expandedModules.value.push(moduleId)
  }
}

const selectLesson = (lesson: Lesson) => {
  emit('lessonSelected', lesson)
}

onMounted(async () => {
  try {
    loading.value = true
    const content = await courseService.getCourseContent(props.courseId)
    if (content) {
      courseContent.value = content
    } else {
      error.value = 'Course content not found'
    }
  } catch (err) {
    error.value = 'Failed to load course content'
    console.error('Error loading course content:', err)
  } finally {
    loading.value = false
  }
})
</script>
