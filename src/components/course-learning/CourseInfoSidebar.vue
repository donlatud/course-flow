<script setup lang="ts">
import SidebarHeader from "./sidebar/SidebarHeader.vue"
import SidebarProgress from "./sidebar/SidebarProgress.vue"
import SideBarModule from "./sidebar/SideBarModule.vue"
import { useCourseLearning } from "@/composables/useCourseLearning"

defineProps<{
  courseId?: string
}>()

const { error, loading } = useCourseLearning()
</script>

<template>
  <aside
    class="flex w-full flex-col gap-4 rounded-[8px] bg-white p-4 shadow-1 md:w-[320px] lg:h-[1085px] lg:w-[357px] md:overflow-hidden"
    aria-label="Course sidebar"
    :aria-busy="loading ? 'true' : 'false'"
  >
    <section
      v-if="error"
      class="rounded-[8px] bg-gray-100 px-3 py-2 text-body4 text-gray-900"
      role="alert"
    >
      {{ error }}
    </section>
    <SidebarHeader />
    <SidebarProgress />
    <section class="scrollbar-hide min-h-0 flex-1 overflow-y-auto">
      <SideBarModule />
    </section>
  </aside>
</template>