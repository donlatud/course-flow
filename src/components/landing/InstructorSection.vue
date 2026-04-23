<template>
  <section class="relative overflow-hidden py-16 flex flex-col gap-16 md:h-205.75 md:justify-center">
    <h2 class="text-headline3 md:text-headline2 font-medium text-center">
      Our Professional Instructors
    </h2>
    <div class="flex flex-col md:flex-row md:justify-between md:px-40 gap-8">
    <InstructorCard
      v-for="(item, i) in items"
      :key="i"
      :image="item.image"
      :name="item.name"
      :title="item.title"
    />
    </div>
    <img src="@/assets/vectors/vector_triangle_yellow.svg" alt="vector_triangle_yellow" class="absolute top-0 left-14 md:top-210 md:left-15 w-12.5 h-12.5"/>
  </section>
</template>

<script setup lang="ts">
import InstructorCard from '../instructors/InstructorCard.vue'
import JaneCooper from '@/assets/images/instructors/jane-cooper.svg'
import EstherHoward from '@/assets/images/instructors/esther-howard.svg'
import BrooklynSimmons from '@/assets/images/instructors/brooklyn-simmons.svg'

interface Instructor {
  image: string;
  name: string;
  title: string;
}

const items: Instructor[] = [
  {
    image: JaneCooper,
    name: 'Jane Cooper',
    title: 'UX/UI Designer'
  },
  {
    image: EstherHoward,
    name: 'Esther Howard',
    title: 'Program Manager'
  },
  {
    image: BrooklynSimmons,
    name: 'Brooklyn Simmons',
    title: 'Software Engineer'
  }
]
</script>
