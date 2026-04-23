<template>
  <div class="sticky top-8 space-y-6">
    <div class="bg-white rounded-lg border border-gray-200 shadow-sm px-6 py-8 gap-6 flex flex-col">
      <span class="text-sm text-orange-500">Course</span>
      <h1 class="text-headline3 text-black">{{ course?.title }}</h1>
      
      <span class="text-body2 font-medium text-gray-700">{{ course?.description }} course</span>

      <div v-if="!isPurchased" class="text-headline3 text-gray-700">
        THB {{ course?.price }}
      </div>  

      <hr />
      
      <div class="flex flex-col gap-4 pt-6">
        <template v-if="isPurchased">
          <PrimaryButton class="w-full" @click="emit('start-learning')">
            Start Learning
          </PrimaryButton>
        </template>
        
        <template v-else>
          <SecondaryButton
            v-if="!isInWishlist"
            class="w-full"
            type="button"
            @click="emit('wishlist')"
          >
            Add to Wishlist
          </SecondaryButton>
          <PrimaryButton class="w-full" type="button" @click="emit('subscribe')">
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
  isInWishlist?: boolean
}

defineProps<CourseSidebarProps>()

const emit = defineEmits<{
  subscribe: []
  "start-learning": []
  wishlist: []
}>()
</script>