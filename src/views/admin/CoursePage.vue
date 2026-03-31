<script setup lang="ts">
import { onMounted, ref } from "vue";
import axios from "axios";
import { Search } from "lucide-vue-next";
import Table from "@/components/admin/CourseTable.vue";
import type { CourseItem } from "@/views/admin/course.mock";
import { useRouter } from "vue-router";

const router = useRouter();

const courses = ref<CourseItem[]>([]);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const searchText = ref("");

function mapApiToCourseItem(api: any): CourseItem {
  return {
    id: api.id,
    name: api.title,
    lessons: `${api.lessonCount ?? 0} Lessons`,
    price:
      api.price != null
        ? Number(api.price).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "0.00",
    createdAt: api.createdAt,
    updatedAt: api.updatedAt,
    image:
      api.coverImageUrl ??
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=300&q=80",
  };
}

async function fetchCourses() {
  try {
    isLoading.value = true;
    errorMessage.value = null;

    const response = await axios.get(
      "http://localhost:8080/api/admin/courses",
      {
        headers: {
          Authorization:
            "Bearer 22222222-2222-2222-2222-222222222222",
        },
      },
    );

    courses.value = (response.data as any[]).map((item) =>
      mapApiToCourseItem(item),
    );
  } catch (error: any) {
    console.error(error);
    errorMessage.value =
      error?.response?.data?.message ?? "Failed to load courses.";
  } finally {
    isLoading.value = false;
  }
}

function goToCourseCreate() {
  router.push({ name: "admin-course-create" });
}

onMounted(fetchCourses);
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
              v-model="searchText"
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
          <div
            v-if="isLoading"
            class="py-10 text-center text-body3 text-gray-500"
          >
            Loading courses...
          </div>
          <div
            v-else-if="errorMessage"
            class="py-10 text-center text-body3 text-red-500"
          >
            {{ errorMessage }}
          </div>
          <Table
            v-else
            :courses="
              courses.filter((course) =>
                course.name
                  .toLowerCase()
                  .includes(searchText.toLowerCase()),
              )
            "
          />
        </div>
      </div>
    </section>
  </div>
</template>
