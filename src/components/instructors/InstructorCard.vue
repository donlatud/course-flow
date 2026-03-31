<template>
    <div class="flex flex-col items-center gap-2 md:gap-6">
        <img :src="image" class=" rounded-xl md:w-89.25 md:h-105" />
        <div class="text-center md:gap-2 md:flex md:flex-col">
            <p class="text-body1 md:text-headline3">{{ name }}</p>
            <p class="text-body2 md:text-body2 text-blue-400">{{ title }}</p>
        </div>
    </div>
</template>

<script setup lang="ts">
interface InstructorCardProps {
  image: string;
  name: string;
  title: string;
}
defineProps<InstructorCardProps>();
</script>