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
  <!-- Admin layout: max-width centered; sidebar follows container (not viewport edge) -->
  <div v-if="isAdmin" class="min-h-screen w-full bg-white">
    <div
      class="mx-auto flex w-full max-w-[1920px]"
    >
      <Sidebar />
      <main class="min-h-screen min-w-0 flex-1">
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

