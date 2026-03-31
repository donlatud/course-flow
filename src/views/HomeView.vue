<template>
  <div class="flex flex-col min-h-screen">
    <Navbar />
    <main class="flex-1">
      <HeroSection />
      <FeatureSection />
      <InstructorSection />
      <GraduateSection />
      <CTASection />
    </main>
    <AppFooter />
  </div>
</template>

<script setup lang="ts">
import Navbar from "@/components/shared/Navbar.vue";
import AppFooter from "@/components/shared/AppFooter.vue";
import HeroSection from "@/components/landing/HeroSection.vue";
import FeatureSection from "@/components/landing/FeatureSection.vue";
import InstructorSection from "@/components/landing/InstructorSection.vue";
import GraduateSection from "@/components/landing/GraduateSection.vue";
import CTASection from "@/components/landing/CTASection.vue";
</script>
