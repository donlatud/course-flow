<script setup lang="ts">
import { ref } from "vue"
import Navbar from "@/components/shared/Navbar.vue"
import CustomTabs from "@/components/base/input/CustomTabs.vue"

const activeTab = ref("all")

const tabs = [
  { value: "all", label: "All Courses" },
  { value: "inprogress", label: "Inprogress" },
  { value: "completed", label: "Completed" },
]
</script>

<template>
  <div class="relative min-h-screen w-full bg-white overflow-hidden flex flex-col">

    <div class="absolute inset-0 pointer-events-none z-0">
      <!-- Mobile -->
      <img
        src="@/assets/images/background-courses-mobile.svg"
        alt=""
        class="absolute w-full block xl:hidden"
        style="top: 116px"
      />
      <!-- Desktop -->
      <img
        src="@/assets/images/background-courses.svg"
        alt=""
        class="absolute 2xl:w-full hidden xl:block"
        style="top: 196px; left: 43px"
      />
    </div>

    <div class="relative z-10">
      <Navbar />
    </div>

    <main class="relative z-10 flex-1 flex flex-col items-center px-4 lg:pt-25 pt-10 pb-12">
      <div class="w-82.5 flex flex-col">

        <!-- Heading -->
        <h1 class="lg:text-headline2 text-headline3 text-gray-900 text-center lg:mb-14 mb-6">
          My Courses
        </h1>

        <!-- Tabs -->
        <CustomTabs
          v-model="activeTab"
          :tabs="tabs"
          class="mb-6"
        />

        <!-- Content per tab -->
        <div v-if="activeTab === 'all'">
          <!-- TODO: all courses list -->
           1
        </div>
        <div v-else-if="activeTab === 'inprogress'">
          <!-- TODO: inprogress courses list -->
           2
        </div>
        <div v-else-if="activeTab === 'completed'">
          <!-- TODO: completed courses list -->
           3
        </div>

      </div>
    </main>
  </div>
</template>