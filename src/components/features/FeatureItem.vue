<template>
  <div class="flex gap-4">
    
      <img :src="icon" class="w-9 h-9" />
    

    <div class="flex flex-col gap-2.5">
      <p class="text-body1 md:text-headline3 text-black">{{ title }}</p>
      <p class="text-body3 md:text-body2 text-gray-700">{{ desc }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
interface FeatureItemProps {
  icon: string;
  title: string;
  desc: string;
}

defineProps<FeatureItemProps>();
</script>