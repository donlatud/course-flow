<script setup lang="ts">
import { ref, onMounted } from "vue"
import { RouterLink } from "vue-router"
import Navbar from "@/components/shared/Navbar.vue"
import AppFooter from "@/components/shared/AppFooter.vue"
import CourseCard from "@/components/courses/CourseCard.vue"
import PrimaryButton from "@/components/base/button/PrimaryButton.vue"
import { api } from "@/lib/api"

const wishlists = ref<any[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

onMounted(async () => {
  try {
    loading.value = true
    const response = await api.get("/api/wishlists/my")
    wishlists.value = response.data
  } catch (err) {
    error.value = "Failed to load wishlist"
  } finally {
    loading.value = false
  }
})
</script>
<template>
  <div class="relative min-h-screen w-full bg-white flex flex-col">
    <div class="absolute inset-0 pointer-events-none z-0 overflow-hidden">
      <img
        src="@/assets/images/background-courses-mobile.svg"
        class="absolute w-full block xl:hidden"
        style="top: 116px"
      />
      <img
        src="@/assets/images/background-courses.svg"
        class="absolute 2xl:w-full hidden xl:block"
        style="top: 196px; left: 43px"
      />
    </div>

    <Navbar />

    <main class="relative z-10 flex-1 flex flex-col items-center px-4 lg:pt-25 pt-10 pb-12">
      <div class="w-full max-w-[1123px]">
        <h1 class="lg:text-headline2 text-headline3 text-black text-center lg:mb-16 mb-8">
          My Wishlist
        </h1>

        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="flex justify-center items-center py-12">
          <div class="text-body1 text-red-600">{{ error }}</div>
        </div>

        <!-- Empty State -->
        <div v-else-if="wishlists.length === 0" class="flex flex-col justify-center items-center py-20 gap-4">
          <p class="text-body1 text-gray-600 text-center">You haven't added any courses to your wishlist yet.</p>
          <RouterLink to="/courses">
            <PrimaryButton>Browse Courses</PrimaryButton>
          </RouterLink>
        </div>

        <!-- Wishlist Grid -->
        <template v-else>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <CourseCard
              v-for="item in wishlists"
              :key="item.wishlistId"
              :image="item.coverImageUrl"
              :title="item.courseTitle"
              :description="item.courseDescription"
              :lesson="0"
              :duration="item.totalLearningTime || 'N/A'"
              :course-id="item.courseId"
            />
          </div>
        </template>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

