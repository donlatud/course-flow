<template>
    <div 
        @click="handleCardClick"
        class="flex flex-col rounded-lg md:w-89.25 w-85.75 mx-auto shadow-1 cursor-pointer h-full "
    >
        <!-- Course Image -->
        <img :src="image" :alt="title" class="w-full h-60 rounded-t-lg object-cover shrink-0" />
        
        <!-- Course Content -->
        <div class="flex flex-col gap-1 p-6 grow">
            <span class="text-body4 text-orange-500">Course</span>
            <h1 class="text-body1">{{ title }}</h1>
            <p class="text-body3 text-gray-700">{{ description }}</p>
        </div> 
        <hr class="shrink-0"/>
        <!-- Course Meta -->
        <div class="flex gap-4 p-6 h-14 shrink-0">
            <p class="text-body3 text-gray-700 flex items-center gap-2">
                <img src="@/assets/icon-book.svg" alt="book" class="w-3.75 h-3.75" style="filter: brightness(0) saturate(100%) invert(59%) sepia(99%) saturate(377%) hue-rotate(187deg) brightness(101%) contrast(91%);" />
                {{ lesson }} lessons
            </p>
            <p class="text-body3 text-gray-700 flex items-center gap-2">
                <img src="@/assets/icon-clock.svg" alt="clock" class="w-3.75 h-3.75" style="filter: brightness(0) saturate(100%) invert(59%) sepia(99%) saturate(377%) hue-rotate(187deg) brightness(101%) contrast(91%);" />
                {{ duration }}
            </p>
        </div>
    </div>
</template>

<script setup lang="ts">

interface CourseCardProps {
  image: string;
  title: string;
  description: string;
  lesson: number;
  duration: string;
  courseId?: number;
}

const props = defineProps<CourseCardProps>();

const handleCardClick = () => {
    if (props.courseId) {
        window.location.href = `/courses/${props.courseId}`;
    }
}
</script>

<!--
USAGE EXAMPLE:

<template>
  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    <CourseCard
      v-for="course in courses"
      :key="course.id"
      :image="course.image"
      :title="course.title"
      :description="course.description"
      :lesson="course.lesson"
      :duration="course.duration"
      :course-id="course.id"
    />
  </div>
</template>

<script setup lang="ts">
import CourseCard from '@/components/courses/CourseCard.vue'

// Your courses data
const courses = ref([
  {
    id: 1,
    image: '/path/to/image.jpg',
    title: 'Course Title',
    description: 'Course description here...',
    lesson: 8,
    duration: '2h 30m'
  }
])
</script>



<!--
USAGE EXAMPLE:

<template>
  <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
    <CourseCard
      v-for="course in courses"
      :key="course.id"
      :cover_image_url="course.cover_image_url"
      :title="course.title"
      :description="course.description"
      :lesson="course.lesson"
      :duration="course.duration"
      :course-id="course.id"
    />
  </div>
</template>

<script setup lang="ts">
import CourseCard from '@/components/courses/CourseCard.vue'

// Your courses data
const courses = ref([
  {
    id: 1,
    cover_image_url: '/path/to/image.jpg',
    title: 'Course Title',
    description: 'Course description here...',
    lesson: 8,
    duration: '2h 30m'
  }
])
</script>
-->
