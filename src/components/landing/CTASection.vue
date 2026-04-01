<template>
    <section class="bg-linear-to-r from-[#2558DD] to-[#5697FF] h-full w-full flex flex-col 
    md:flex-row items-center justify-center md:justify-between pt-15 pb-10 md:pb-0 gap-7 relative px-4 md:px-[140px]">
        <div class="flex flex-col items-center justify-center md:items-start h-28.5 gap-6 md:self-start md:mt-20 md:gap-11">
            <h1 class="text-headline3 md:text-headline2 md:font-medium text-white">Want to start learning?</h1>
            <SecondaryButton @click="goToRegister">Register here</SecondaryButton>
        </div>
        <img :src="CtaImageMobile" alt="CTA Image" class="w-82 h-74.5 block md:hidden" />
        <img :src="CtaImageDesktop" alt="CTA Image" class="w-148 h-112 hidden md:block md:self-end" />
        <img :src="VectorTriangleWhite" alt="Vector Triangle White" class="hidden md:block absolute top-32 left-339 w-8 h-8 2xl:left-445" />
        <img :src="VectorBigCircleGreen" alt="Vector Big Circle Green" class="hidden md:block absolute top-100.75 left-141.75 w-6.5 h-6.5 2xl:left-242.5" />
    </section>
</template>

<script setup lang="ts">
import SecondaryButton from '../base/button/SecondaryButton.vue';
import CtaImageMobile from '../../assets/images/image_cta_mobile.svg';
import CtaImageDesktop from '../../assets/images/image_cta_desktop.svg';
import VectorTriangleWhite from '../../assets/vectors/vector_triangle_white.svg';
import VectorBigCircleGreen from '../../assets/vectors/vector_big_circle_green.svg';


import { useRouter } from 'vue-router'

const router = useRouter()

const goToRegister = () => {
  router.push('/register')
}
</script>
