<template>
  <section class=" relative overflow-hidden px-4 pb-16 pt-8 flex flex-col gap-8 md:h-277.75 md:justify-center">
    <FeatureBlock
      :image="hero1Image"
      title="Learning experience has been enhanced with new technologies"
      :items="items1"
      layout="normal"
    />

    <FeatureBlock
      :image="hero2Image"
      title="Interactions between the tutor and the learners"
      :items="items2"
      layout="reverse"
    />
    <img src="@/assets/vectors/vector_circle_dark_blue.svg" alt="hero3" class="absolute -top-3 left-6 w-12 h-12 md:w-18.25 md:h-18.25 md:left-35"/>
    <img src="@/assets/vectors/vector_cross_purple.svg" alt="hero4" class="absolute bottom-175 right-6 w-6 h-6 md:top-100 md:left-338"/>
    <img src="@/assets/vectors/vector_circle_light_blue.svg" alt="hero5" class="absolute bottom-5 right-5 w-12 h-12 md:w-21.25 md:h-21.25 md:top-266 md:left-308"/>
  </section>
</template>
<script setup lang="ts">
import FeatureBlock from '@/components/features/FeatureBlock.vue'
import verifiedIcon from '@/assets/icon-verified.svg'
import favoriteIcon from '@/assets/icon-favorite.svg'
import communityIcon from '@/assets/icon-community.svg'
import hero1Image from '@/assets/images/image_hero1.svg'
import hero2Image from '@/assets/images/image_hero2.svg'

const items1 = [
  {
    icon: verifiedIcon,
    title: "Secure & Easy",
    desc: "Duis aute irure dolor in reprehenderit in voluptate velit es se cillum dolore eu fugiat nulla pariatur. Excepteur sint."
  },
  {
    icon: favoriteIcon,
    title: "Supports All Students",
    desc: "Duis aute irure dolor in reprehenderit in voluptate velit es se cillum dolore eu fugiat nulla pariatur. Excepteur sint."
  }
];

const items2 = [
  {
    icon: communityIcon,
    title: "Purely Collaborative",
    desc: "Duis aute irure dolor in reprehenderit in voluptate velit es se cillum dolore eu fugiat nulla pariatur. Excepteur sint."
  },
  {
    icon: favoriteIcon,
    title: "Supports All Students",
    desc: "Duis aute irure dolor in reprehenderit in voluptate velit es se cillum dolore eu fugiat nulla pariatur. Excepteur sint."
  }
];
</script>