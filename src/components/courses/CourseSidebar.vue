<template>
  <div class="sticky top-8 space-y-6">
    <!-- Course Title -->
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm px-6 py-8 gap-6 flex flex-col">
      <span class="text-sm text-orange-500">Course</span>
      <h1 class="text-xl font-bold text-gray-900">{{ course?.title }}</h1>
      
      <!-- Course Stats -->
      <span class="text-headline3 font-medium text-gray-700">{{ course?.description }} course</span>

      <!-- Price (only show if course not purchased) -->
      <div v-if="!isPurchased" class="text-2xl font-bold text-gray-900">
        THB {{ course?.price }}
      </div>  

      <hr />
      
      <!-- Action Buttons -->
      <div class="flex flex-col gap-4 pt-6">
        <!-- Purchased State -->
        <template v-if="isPurchased">
          <PrimaryButton class="w-full">
            Start Learning
          </PrimaryButton>
        </template>
        
        <!-- Not Purchased State -->
        <template v-else>
          <SecondaryButton class="w-full">
            Add to Wishlist
          </SecondaryButton>
          <PrimaryButton class="w-full">
            Subscribe This Course
          </PrimaryButton>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import PrimaryButton from '@/components/base/button/PrimaryButton.vue'
import SecondaryButton from '@/components/base/button/SecondaryButton.vue'
import type { Course } from '@/types/course'

interface CourseSidebarProps {
  course: Course | null
  isPurchased?: boolean
}

defineProps<CourseSidebarProps>()
</script>

<!-- 
USAGE EXAMPLE:

<template>
  <div class="flex flex-col lg:flex-row gap-8">

    <div class="flex-1">

    </div>
    

    <div class="hidden lg:block w-80 shrink-0">
      <CourseSidebar 
        :course="course"
        :is-purchased="isPurchased"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import CourseSidebar from '@/components/courses/CourseSidebar.vue'
import { ref } from 'vue'
import type { Course } from '@/types/course'

// Your course data
const course = ref<Course>({
  id: 1,
  title: 'Course Title',
  desc: 'Course description...',
  price: 999,
  category: 'Programming'
  // ... other course properties
})

// Purchase status - set to true if user has purchased this course
const isPurchased = ref(false)

// You can dynamically update purchase status
const handlePurchase = () => {
  isPurchased.value = true
}
</script>

PROPS:
- course: Course object containing course information
- isPurchased: Boolean (optional, defaults to false)
  * false: Shows "Add to Wishlist" + "Subscribe This Course" + Price
  * true: Shows only "Start Learning" button
 -->
