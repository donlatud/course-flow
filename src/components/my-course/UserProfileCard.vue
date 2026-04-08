<script setup lang="ts">
defineProps<{
  name: string;
  profileImage?: string;
  courseInprogress: number;
  courseComplete: number;
  variant?: "desktop" | "mobile";
}>();
</script>

<template>
  <!-- ================= DESKTOP ================= -->
  <div
    v-if="variant !== 'mobile'"
    class="flex flex-col items-center gap-6 rounded-[16px] bg-white p-8 px-6 w-[357px]"
    style="box-shadow: 4px 4px 24px rgba(0, 0, 0, 0.08)"
  >
    <div class="w-30 h-30 rounded-full overflow-hidden">
      <img
        v-if="profileImage"
        :src="profileImage"
        class="w-full h-full object-cover"
      />
    </div>

    <p class="text-headline3 text-blue-800 font-medium">
      {{ name }}
    </p>

    <div class="flex gap-6 w-full">
      <div
        class="flex-1 flex flex-col gap-6 rounded-[8px] bg-gray-200 p-4 h-[134px]"
      >
        <p class="text-body3 text-gray-600">Course Inprogress</p>
        <p class="text-headline3">{{ courseInprogress }}</p>
      </div>

      <div
        class="flex-1 flex flex-col gap-6 rounded-[8px] bg-gray-200 p-4 h-[134px]"
      >
        <p class="text-body3 text-gray-600">Course Complete</p>
        <p class="text-headline3">{{ courseComplete }}</p>
      </div>
    </div>
  </div>

  <!-- ================= MOBILE FIXED BAR ================= -->
  <div
  v-else
  class="xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white px-6 py-4 gap-2 flex flex-col justify-between"
  style="
    height: 118px;
    border-top-left-radius: 16px;
    border-top-right-radius: 16px;
    box-shadow: 0px -4px 24px 0px rgba(0, 0, 0, 0.08);
  "
>
  <div class="flex items-center gap-3">
    <div class="w-10 h-10 rounded-full overflow-hidden shrink-0">
      <img
        v-if="profileImage"
        :src="profileImage"
        class="w-full h-full object-cover"
      />
    </div>
    <p class="text-body2 font-medium text-gray-800">
      {{ name }}
    </p>
  </div>

  <div class="flex gap-3 w-full h-[38px]">
    <div class="flex-1 bg-gray-200 rounded-lg px-4 py-2 flex justify-between items-center">
      <span class="text-body4 text-gray-700">Course Inprogress</span>
      <span class="text-body1 font-semibold text-black">{{ courseInprogress }}</span>
    </div>

    <div class="flex-1 bg-gray-200 rounded-lg px-4 py-2 flex justify-between items-center">
      <span class="text-body4 text-gray-700">Course Complete</span>
      <span class="text-body1 font-semibold text-black">{{ courseComplete }}</span>
    </div>
  </div>
</div>
</template>
