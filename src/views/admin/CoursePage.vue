<script setup lang="ts">
import { Search } from "lucide-vue-next";
import { courseMock as courses } from "@/views/admin/course.mock";
import Table from "@/components/admin/CourseTable.vue";
import { useRouter } from "vue-router";
const router = useRouter();
function goToCourseCreate() {
  router.push({ name: "admin-course-create" });
}
</script>

<template>
  <div class="flex justify-center ">
    <section
      class="w-full max-w-[1920px] flex min-h-screen flex-col bg-gray-100"
    >
      <div
        class="mx-auto flex h-[92px] w-full shrink-0 items-center justify-between gap-6 border-b border-gray-200 bg-white px-8"
      >
        <h1 class="text-headline3 text-gray-900">Course</h1>

        <div class="ml-auto flex items-center gap-4">
          <label
            class="flex h-[48px] w-[320px] items-center gap-2 rounded-[8px] border border-gray-300 bg-white px-3"
          >
            <Search :size="18" class="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              class="w-full border-0 bg-transparent text-body3 text-gray-800 placeholder:text-gray-500 focus:outline-none"
            />
          </label>

          <button
            type="button"
            @click="goToCourseCreate"
            class="h-[60px] w-[172px] rounded-[12px] bg-blue-500 px-7 text-[16px] font-bold text-white transition-colors hover:bg-blue-400 active:bg-blue-700"
          >
            + Add Course
          </button>
        </div>
      </div>
      <div class="min-h-0 flex-1 overflow-y-auto px-10 pt-12">
        <div class="mx-auto w-full">
          <Table :courses="courses" />
        </div>
      </div>
    </section>
  </div>
</template>
