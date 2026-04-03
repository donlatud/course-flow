<script setup lang="ts">
import { computed } from "vue";
import { RouterView, useRoute } from "vue-router";
import Sidebar from "@/components/layout/Sidebar.vue";
import { Toaster } from "@/components/base/toast";

const route = useRoute();
const isAdmin = computed(
  () => route.path.startsWith("/admin") && route.path !== "/admin/login",
);
</script>

<template>
  <!-- Admin layout: centered container with sticky sidebar -->
  <div v-if="isAdmin" class="min-h-screen bg-white">
    <div class="mx-auto flex max-w-[1920px]">
      <Sidebar />
      <main class="flex-1 min-h-screen">
        <RouterView />
      </main>
    </div>
  </div>

  <!-- Public layout: no sidebar -->
  <div v-else>
    <RouterView />
  </div>

  <Toaster position="bottom-right" :offset="{ bottom: 16, right: 16 }" />
</template>

