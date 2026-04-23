<template>
    <div class="flex flex-col min-h-screen">
        <Navbar />
        <main class="flex-1 pb-12 ">
            <div class="flex flex-col items-center gap-8 md:gap-15 pt-10 py-12 md:py-25 relative overflow-clip min-h-[198px]">
                <h1 class="md:text-headline2 text-headline3 font-medium text-center z-10">Our Courses</h1>
                
                <!-- Search Bar -->
                <SearchBar 
                    v-model="searchQuery"
                    placeholder="Search..."
                    class="w-full py-3 max-w-85.75 z-10"
                    @search="handleSearch"
                    @clear="handleClearSearch"
                />
                <!-- Mobile Background -->
                <img :src="VectorBackgroundMobile" alt="Background" class="absolute inset-0 w-full h-full object-contain md:hidden z-0 " />
                <!-- Desktop Background -->
                <img :src="VectorBackgroundDesktop" alt="Background" class="absolute inset-0 w-full h-full object-contain hidden md:block z-0" />
            </div>
            
            <!-- Loading State -->
            <div v-if="loading" class="flex justify-center items-center py-12">
                <div class="text-body1 text-gray-600">Loading courses...</div>
            </div>
            
            <!-- Error State -->
            <div v-else-if="error" class="flex justify-center items-center py-12">
                <div class="text-body1 text-red-600">{{ error }}</div>
            </div>
            
            <!-- No Results -->
            <div v-else-if="filteredCourses.length === 0" class="flex justify-center items-center py-12">
                <div class="text-body1 text-gray-600 text-center">
                    {{ searchQuery ? `No courses found for "${searchQuery}"` : 'No courses available' }}
                </div>
            </div>
            
            <!-- Courses List -->
            <template v-else>
                <!-- Mobile Version: Flex Column -->
                <div class="md:hidden flex flex-col gap-8">
                    <CourseCard 
                        v-for="course in filteredCourses"
                        :key="course.id"
                        :image="course.coverImageUrl"
                        :title="course.title"
                        :description="course.description"
                        :lesson="course.lessonCount || 0"
                        :duration="course.totalLearningTime || 'N/A'"
                        :course-id="course.id"
                    />
                </div>
                
                <!-- Desktop Version: Grid 3 Columns -->
                <div class="hidden md:grid md:grid-cols-3  md:gap-6 mx-[140px]">
                    <CourseCard 
                        v-for="course in filteredCourses"
                        :key="course.id"
                        :image="course.coverImageUrl"
                        :title="course.title"
                        :description="course.description"   
                        :lesson="course.lessonCount || 0"
                        :duration="course.totalLearningTime || 'N/A'"
                        :course-id="course.id"
                    />
                </div>
                
                <!-- Pagination -->
                <Pagination 
                    v-if="totalPages > 1"
                    :current-page="currentPage"
                    :total-pages="totalPages"
                    @page-change="handlePageChange"
                />
            </template>
        </main>
        <CTASection v-if="!isLoggedIn" />
        <AppFooter />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import Navbar from '@/components/shared/Navbar.vue';
import AppFooter from '@/components/shared/AppFooter.vue';
import CTASection from '@/components/landing/CTASection.vue';
import CourseCard from '@/components/courses/CourseCard.vue';
import SearchBar from '@/components/base/input/SearchBar.vue';
import Pagination from '@/components/base/pagination/Pagination.vue';
import { courseService } from '@/services/courseService'
import type { Course } from '@/types/course'
import { useAuth } from '@/composables/useAuth'

import VectorBackgroundMobile from '@/assets/vector_background_mobile.svg'
import VectorBackgroundDesktop from '@/assets/vector_background_desktop.svg'

const courses = ref<Course[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const searchResults = ref<Course[]>([])
const currentPage = ref(1)

const { user, isReady } = useAuth()
const isLoggedIn = computed(() => isReady.value && !!user.value)

const filteredCourses = computed(() => {
  let coursesToShow = searchQuery.value.trim() ? searchResults.value : courses.value
  
  // Pagination based on screen size
  const isMobile = window.innerWidth < 768
  const limit = isMobile ? 6 : 9
  
  const startIndex = (currentPage.value - 1) * limit
  const endIndex = startIndex + limit
  
  return coursesToShow.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  let coursesToShow = searchQuery.value.trim() ? searchResults.value : courses.value
  
  const isMobile = window.innerWidth < 768
  const limit = isMobile ? 6 : 9
  
  return Math.ceil(coursesToShow.length / limit)
})

// Real-time client-side search on every keystroke
watch(searchQuery, (newQuery) => {
  if (newQuery.trim()) {
    const query = newQuery.toLowerCase()
    searchResults.value = courses.value.filter(course => 
      course.title.toLowerCase().includes(query) ||
      course.description.toLowerCase().includes(query)
    )
  } else {
    searchResults.value = []
  }
  // Reset to first page when searching
  currentPage.value = 1
}, { immediate: false })

// Keep for compatibility with SearchBar (real-time search via watch)
const handleSearch = (_query: string) => {
  // Search is handled automatically by watch on searchQuery
}

const handleClearSearch = () => {
  searchQuery.value = ''
  searchResults.value = []
  currentPage.value = 1
}

const handlePageChange = (page: number) => {
  currentPage.value = page
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(async () => {
  try {
    loading.value = true
    const data = await courseService.getAllCourses()
    courses.value = data
  } catch (err) {
    error.value = 'Failed to load courses'
  } finally {
    loading.value = false
  }
})
</script>
