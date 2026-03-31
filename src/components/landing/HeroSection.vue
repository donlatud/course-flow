<template>
          <div class="bg-blue-100 h-175 relative z-0 overflow-hidden md:flex md:items-center ">
        <div class="flex flex-col gap-8 md:gap-15 w-85.75 mx-auto py-14 z-10 md:w-160.75 md:py-41.25 md:ml-auto">
          <h1 class="text-headline2 font-medium text-black z-10 md:text-headline1">Best Virtual Classroom Software</h1>
          <span class="text-body2 md:text-body1 text-gray-700 z-10">Welcome to Schooler! The one-stop online class management system that caters to all your educational needs! </span>
          <PrimaryButton class="w-48.25 z-10" @click="goToCourses">Explore Courses</PrimaryButton>
        </div>
        <img src="@/assets/images/books-desktop.svg" alt="books-desktop" class="hidden md:flex z-10 w-113 h-112 md:mr-auto" />
        <img src="@/assets/vectors/vector_triangle_yellow.svg" alt="polygon" class="absolute bottom-20 right-32 w-12.5 h-12.5 z-10 hidden md:block" />
        <img src="@/assets/vectors/vector_cross_green.svg" alt="group-5" class="absolute top-40 right-165 w-5 h-5  hidden md:block" />
        <img src="@/assets/vectors/vector_circle_blue.svg" alt="group-6" class="absolute top-135.75 left-147.25 w-7 h-7 z-10 hidden md:block" />
        <img src="@/assets/vectors/vector_circle_green.svg" alt="ellipse-7" class="absolute top-103.25 left-343.5 w-3.75 h-3.75 z-10 hidden md:block" />
        <img src="@/assets/images/Ellipse 5.svg" alt="ellipse" class="absolute top-18.5 -left-4.5 w-26 h-26 z-0" />
        <img src="@/assets/images/wave-mobile.svg" alt="wave-mobile" class="absolute -bottom-7 left-0 w-full h-auto md:w-354.75 md:h-281.75 z-1 md:left-93 md:-bottom-40 2xl:left-185" />
        <img src="@/assets/images/books-mobile.svg" alt="books-mobile" class="absolute bottom-0 left-0 w-87 h-80 z-1 md:hidden" />
      </div> 
</template>

<script setup lang="ts">
import PrimaryButton from '@/components/base/button/PrimaryButton.vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const goToCourses = () => {
  router.push('/courses')
}
</script>