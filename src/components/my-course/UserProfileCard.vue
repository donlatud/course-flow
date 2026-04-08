<script setup lang="ts">
defineProps<{
  name: string;
  profileImage?: string;
  courseInprogress: number;
  courseComplete: number;
}>();
</script>

<template>
  <div
    class="flex flex-col items-center gap-6 rounded-[16px] bg-white p-8 px-6 w-[357px]"
    style="box-shadow: 4px 4px 24px 0px rgba(0, 0, 0, 0.08)"
  >
    <!-- Profile image -->
    <div class="w-30 h-30 rounded-full overflow-hidden shrink-0">
      <img
        v-if="profileImage"
        :src="profileImage"
        :alt="name"
        class="w-full h-full object-cover"
      />
      <div
        v-else
        class="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400 text-2xl"
      >
        ?
      </div>
    </div>

    <!-- Name -->
    <p class="text-headline3 text-blue-800 font-medium">{{ name }}</p>

    <!-- Stats -->
    <div class="flex gap-6 w-full">
      <!-- Course Inprogress -->
      <div
        class="flex-1 flex flex-col gap-6 rounded-[8px] bg-gray-200 p-4 h-[134px]"
      >
        <p class="text-body3 text-gray-600">Course Inprogress</p>
        <p class="text-headline3 text-gray-900">{{ courseInprogress }}</p>
      </div>

      <!-- Course Complete -->
      <div
        class="flex-1 flex flex-col gap-6 rounded-[8px] bg-gray-200 p-4 h-[134px]"
      >
        <p class="text-body3 text-gray-600">Course Complete</p>
        <p class="text-headline3 text-gray-900">{{ courseComplete }}</p>
      </div>
    </div>
  </div>
</template>
