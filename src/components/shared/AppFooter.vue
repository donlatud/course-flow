<template>
  <footer class="bg-blue-700 text-white py-8">
    <div class="max-w-8xl mx-auto px-4 md:px-[160px]">
      <!-- Desktop Layout -->
      <div class="hidden md:flex justify-between items-center md:h-60 h-68">
        <!-- Logo -->
        <div class="flex items-center">
          <img
            src="@/assets/icon-courseflow.svg"
            alt="CourseFlow"
            class="h-[16px] w-[140px]"
          />
        </div>

        <!-- Links -->
        <div class="flex gap-8">
          <router-link to="/courses" class="hover:text-blue-200 transition-colors text-gray-500 text-body2">
            All Courses
          </router-link>
          <router-link to="/bundles" class="hover:text-blue-200 transition-colors text-gray-500 text-body2">
            Bundle Package
          </router-link>
        </div>

        <!-- Social Media -->
        <div class="flex gap-4">
          <a href="#" class="hover:text-blue-200 transition-colors">
            <img
              src="@/assets/icon-facebook.svg"
              alt="Facebook"
              class="h-12 w-12"
            />
          </a>
          <a href="#" class="hover:text-blue-200 transition-colors">
            <img
              src="@/assets/icon-ig.svg"
              alt="Instagram"
              class="h-12 w-12"
            />
          </a>
          <a href="#" class="hover:text-blue-200 transition-colors">
            <img
              src="@/assets/icon-twitter.svg"
              alt="Twitter"
              class="h-12 w-12"
            />
          </a>
        </div>
      </div>

      <!-- Mobile Layout -->
      <div class="md:hidden flex flex-col items-start space-y-6">
        <!-- Logo -->
        <div class="flex items-center">
          <img
            src="@/assets/icon-courseflow.svg"
            alt="CourseFlow"
            class="h-[32px] w-[140px]"
          />
        </div>

        <!-- Links -->
        <div class="flex flex-col items-start gap-3">
          <router-link to="/courses" class="hover:text-blue-200 transition-colors text-gray-500 text-body2">
            All Courses
          </router-link>
          <router-link to="/bundles" class="hover:text-blue-200 transition-colors text-gray-500 text-body2">
            Bundle Package
          </router-link>
        </div>

        <!-- Social Media -->
        <div class="flex gap-4">
          <a href="#" class="hover:text-blue-200 transition-colors">
            <img
              src="@/assets/icon-facebook.svg"
              alt="Facebook"
              class="h-12 w-12"
            />
          </a>
          <a href="#" class="hover:text-blue-200 transition-colors">
            <img
              src="@/assets/icon-ig.svg"
              alt="Instagram"
              class="h-12 w-12"
            />
          </a>
          <a href="#" class="hover:text-blue-200 transition-colors">
            <img
              src="@/assets/icon-twitter.svg"
              alt="Twitter"
              class="h-12 w-12"
            />
          </a>
        </div>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
// No script logic needed for this static footer
</script>
