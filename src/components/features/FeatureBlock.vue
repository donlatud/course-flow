<template>
  <div class=" flex md:flex-row md:px-40 px-4 md:px-0 flex-col items-center justify-center md:justify-between " :class="{ 'md:flex-row-reverse': layout === 'reverse' }">
    <img :src="image" class="rounded-xl  h-82.5" />


    <div class="flex flex-col gap-6 md:w-136.75 md:h-82.5">
      <h2 class="text-headline3 md:text-headline2 font-medium">
        {{ title }}
      </h2>
      <FeatureItem
        v-for="(item, i) in items"
        :key="i"
        :icon="item.icon"
        :title="item.title"
        :desc="item.desc"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import FeatureItem from './FeatureItem.vue'

interface FeatureItemData {
  icon: string;
  title: string;
  desc: string;
}

interface FeatureBlockProps {
  image: string;
  title: string;
  items: FeatureItemData[];
  layout?: 'normal' | 'reverse';
}

defineProps<FeatureBlockProps>();
</script>