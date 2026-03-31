<script setup lang="ts">
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import quoteOpen from "@/assets/icon-quot-open.svg";
import quoteClose from "@/assets/icon-quote-close.svg";
import student0 from "@/assets/images/students/image-student0.png";
import student1 from "@/assets/images/students/image-student1.svg";
import student2 from "@/assets/images/students/image-student2.svg";
import vectorCircleDarkBlue from "@/assets/vectors/vector_circle_dark_blue.svg";
import vectorCircleLightBlue from "@/assets/vectors/vector_circle_light_blue.svg";
import vectorCrossGreen from "@/assets/vectors/vector_cross_green.svg";

const instructors = [
  {
    name: "Saiful Islam",
    image: student0,
    description:
      "Start with something simple and small, then expand over time. If people call it a 'toy' you're definitely onto something.<br>If you're waiting for encouragement from others, you're doing it wrong. By the time people think an idea is good, it's probably too late.",
  },
  {
    name: "Saiful Islam",
    image: student1,
    description:
      "Start with something simple and small, then expand over time. If people call it a 'toy' you're definitely onto something.<br>If you're waiting for encouragement from others, you're doing it wrong. By the time people think an idea is good, it's probably too late.",
  },
  {
    name: "Saiful Islam",
    image: student2,
    description:
      "Start with something simple and small, then expand over time. If people call it a 'toy' you're definitely onto something.<br>If you're waiting for encouragement from others, you're doing it wrong. By the time people think an idea is good, it's probably too late.",
  },
];
</script>

<template>
  <section class="h-179 relative overflow-hidden md:overflow-visible py-16">
    <!-- Background Vectors -->
    <img 
      :src="vectorCircleDarkBlue" 
      alt="background circle" 
      class="absolute top-3 left-87.5 w-8.5 h-8.5 z-0 rotate-90 md:w-18.25 md:h-18.25 md:top-0 md:left-342 2xl:left-479"
    />
    <img 
      :src="vectorCircleLightBlue" 
      alt="background circle light" 
      class="absolute top-13.25 left-83 w-4 h-4 z-0 md:w-7 md:h-7 md:top-20.75 md:left-334 2xl:left-470"
    />
    <img 
      :src="vectorCrossGreen" 
      alt="background cross green" 
      class="absolute top-174 left-6.75 w-5 h-5 z-0 md:top-152.25 md:left-22.75 "
    />
    
    <h1 class="text-headline3 md:text-headline2 font-medium text-center relative z-10">Our Graduates</h1>

    <!-- Mobile Version -->
    <div class="md:hidden py-8">
      <Swiper
        :slides-per-view="1.2"
        :centered-slides="true"
        :space-between="15"
        :loop="false"
        :initial-slide="1"
        class="px-4"
      >
        <SwiperSlide v-for="(ins, i) in instructors" :key="i" class="">
          <div
            class="flex h-full justify-center overflow-visible  w-78 h-145.5 mx-auto pb-8"
          >
            <div
              class="px-6 w-78 h-145.5 rounded-lg shadow-lg text-left gap-[18px] flex flex-col relative z-10 mt-8 bg-white"
            >
              <img
                :src="ins.image"
                class="w-62 h-74.5 object-cover rounded-lg z-10"
              />
              <h1 class="text-body1 text-[#2F5FAC]">{{ ins.name }}</h1>
              <div class="relative w-[248px]">
                <span
                  class="text-body3 text-gray-800 z-10"
                  v-html="ins.description"
                ></span>
                <img
                  :src="quoteClose"
                  alt="quote-close"
                  class="absolute -bottom-4 -right-3 w-10 h-7.5 z-10 text-gray"
                />
              </div>
              <img
                :src="quoteOpen"
                alt="quote-open"
                class="absolute -top-6 left-12 w-16 h-16 z-10"
              />
              <div
                class="absolute top-10 right-2 w-74 h-135.75 bg-blue-100 rounded-xl z-[-1]"
              ></div>
            </div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>

    <!-- Desktop Version -->
    <div class="hidden md:block py-15">
      <Swiper
        :slides-per-view="2"
        :centered-slides="true"
        :space-between="20"
        :loop="false"
        :initial-slide="1"
        class="px-8 py-15 relative z-10"
      >
        <SwiperSlide v-for="(ins, i) in instructors" :key="i" class="">
          <div 
            class="w-184.5 h-77.75 o  p-6 relative flex items-center gap-7"
          >
            <!-- Quote Open Icon -->
            <img
              :src="quoteOpen"
              alt="quote-open"
              class="absolute top-0 left-6 w-20 h-14.25 z-20"
            />
            
            <!-- Student Image -->
            <div class="flex justify-center mb-4">
              <img
                :src="ins.image"
                class="w-50 h-60 object-cover rounded-xl z-10"
              />
            </div>
            <div class="flex flex-col gap-6 z-10 w-[520px] h-[174px]">
            <!-- Name -->
            <h3 class="text-headline3 text-[#2F5FAC] text-left font-medium mb-3">{{ ins.name }}</h3>
            
            <!-- Description -->
            <div class="relative">
              <p 
                class="text-body2 text-gray-700 text-left "
                v-html="ins.description"
              ></p>
              <!-- Quote Close Icon -->
              <img
                :src="quoteClose"
                alt="quote-close"
                class="absolute -bottom-10 right-0 w-13 h-9.25 "
              />
            </div>
            </div>
            <!-- Background decoration -->
            <div class="absolute top-0 right-2 w-144.5 h-77.5 bg-blue-100 z-1 rounded-xl"></div>
          </div>
        </SwiperSlide>
      </Swiper>
    </div>
  </section>
</template>

<style scoped>
.quote-description {
  position: relative;
  padding: 0 2rem;
}
</style>
