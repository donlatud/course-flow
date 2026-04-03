<template>
    <div class="flex flex-col min-h-screen">
        <Navbar />
        <main class="flex-1 pb-12 ">
            <div class="flex flex-col items-center gap-8 md:gap-15 pt-10 py-12 md:py-25 relative overflow-clip">
                <h1 class="text-headline2 font-medium text-center">Our Courses</h1>
                
                <!-- Search Bar -->
                <SearchBar 
                    v-model="searchQuery"
                    placeholder="Search..."
                    class="w-full py-3 max-w-85.75"
                    @search="handleSearch"
                    @clear="handleClearSearch"
                />
                <img :src="VectorYellowTriangle" alt="Vector Yellow Triangle" class="absolute top-17.25 left-80 w-9 h-9 object-cover
                md:top-[154px] md:left-[1253px] md:w-10 md:h-10
                2xl:left-[1790px]" />
                <img :src="VectorGreenCross" alt="Vector Green Cross" class="absolute top-51.25 left-12.5 w-5 h-5 object-cover
                md:top-[260px] md:left-[220px] md:w-5 md:h-5" />
                <img :src="VectorBlueSmallCircle" alt="Vector Blue Small Circle" class="absolute top-26.25 -left-2 w-5 h-5 object-cover
                md:top-[187px] md:left-[43px] " />
                <img :src="VectorBlueSmallCircle" alt="Vector Blue Small Circle" class="absolute top-48.75 left-87 w-9 h-9 object-cover
                md:top-[200px] md:left-[1400px] md:w-[74px] md:h-[74px]
                2xl:left-[1940px]" />
                <img :src="VectorSmallCircleDarkBlue" alt="Vector Small Circle Dark Blue" class="absolute top-10 left-7.5 w-2.5 h-2.5 object-cover
                md:top-[128px] md:left-[102px]" />
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
                        :lesson="course.lesson || 0"
                        :duration="course.duration || 'N/A'"
                        :course-id="Number(course.id)"
                    />
                </div>
                
                <!-- Desktop Version: Grid 3 Columns -->
                <div class="hidden md:grid md:grid-cols-3 2xl:grid-cols-4 md:gap-6 mx-[140px]">
                    <CourseCard 
                        v-for="course in filteredCourses"
                        :key="course.id"
                        :image="course.coverImageUrl"
                        :title="course.title"
                        :description="course.description"   
                        :lesson="course.lesson || 0"
                        :duration="course.duration || 'N/A'"
                        :course-id="Number(course.id)"
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
        <CTASection />
        <AppFooter />
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import Navbar from '@/components/shared/Navbar.vue';
import AppFooter from '@/components/shared/AppFooter.vue';
import CTASection from '@/components/landing/CTASection.vue';
import CourseCard from '@/components/courses/CourseCard.vue';
import SearchBar from '@/components/base/input/SearchBar.vue';
import Pagination from '@/components/base/pagination/Pagination.vue';
import { courseService } from '@/services/courseService'
import type { Course } from '@/types/course'

import VectorYellowTriangle from '@/assets/vectors/vector_triangle_yellow.svg'
import VectorGreenCross from '@/assets/vectors/vector_cross_green.svg'
import VectorBlueSmallCircle from '@/assets/vectors/vector_small_circle_blue.svg'
import VectorSmallCircleDarkBlue from '@/assets/vectors/vector_small_circle_dark_blue.svg'

const courses = ref<Course[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')
const searchResults = ref<Course[]>([])
const currentPage = ref(1)

const filteredCourses = computed(() => {
  let coursesToShow = searchQuery.value.trim() ? searchResults.value : courses.value
  
  // Pagination based on screen size
  const isMobile = window.innerWidth < 768
  const limit = isMobile ? 6 : window.innerWidth >= 1536 ? 8 : 9
  
  const startIndex = (currentPage.value - 1) * limit
  const endIndex = startIndex + limit
  
  return coursesToShow.slice(startIndex, endIndex)
})

const totalPages = computed(() => {
  let coursesToShow = searchQuery.value.trim() ? searchResults.value : courses.value
  
  const isMobile = window.innerWidth < 768
  const limit = isMobile ? 6 : window.innerWidth >= 1536 ? 8 : 9
  
  return Math.ceil(coursesToShow.length / limit)
})

const handleSearch = async (query: string) => {
  try {
    if (query.trim()) {
      searchResults.value = await courseService.searchCourses(query)
    } else {
      searchResults.value = []
    }
    
    // Reset to first page when searching
    currentPage.value = 1
  } catch (err) {
    console.error('Error searching courses:', err)
    searchResults.value = []
  }
}

const handleClearSearch = () => {
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
    console.log('Fetching courses from API...')
    const data = await courseService.getAllCourses()
    console.log('Courses data received:', data)
    courses.value = data
  } catch (err) {
    error.value = 'Failed to load courses'
    console.error('Error loading courses:', err)
  } finally {
    loading.value = false
  }
})
</script>
