<template>
  <div class="min-h-screen flex flex-col">
    <Navbar />
    
    <main class="flex-1 p-6 space-y-6">
      <h1 class="text-2xl font-bold">Component Test</h1>

      <!-- Test Footer -->
      <section>
        <h2 class="font-semibold mb-2">Footer</h2>
        <div class="border-2 border-dashed border-gray-300 p-4">
          <p class="text-sm text-gray-500 mb-2">Footer will appear at bottom of page</p>
        </div>
      </section>
    </main>
    
    <AppFooter />
  </div>
</template>

<script setup>
import Navbar from '@/components/shared/์Navbar.vue';
import AppFooter from '@/components/shared/AppFooter.vue';
</script>