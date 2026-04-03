<script setup lang="ts">
import { onMounted, ref } from "vue";
import { Search } from "lucide-vue-next";
import { useRouter } from "vue-router";
import Table from "@/components/admin/CourseTable.vue";
import { api } from "@/lib/api";
import type { CourseItem } from "@/views/admin/course.mock";
import { resetCourseDraft } from "@/views/admin/course-create.state";

const router = useRouter();

const courses = ref<CourseItem[]>([]);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const searchText = ref("");

function mapApiToCourseItem(apiItem: any): CourseItem {
  return {
    id: apiItem.id,
    name: apiItem.title,
    lessons: `${apiItem.lessonCount ?? 0} Lessons`,
    price:
      apiItem.price != null
        ? Number(apiItem.price).toLocaleString("en-US", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
        : "0.00",
    createdAt: apiItem.createdAt,
    updatedAt: apiItem.updatedAt,
    image:
      apiItem.coverImageUrl ??
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=300&q=80",
  };
}

async function fetchCourses() {
  try {
    isLoading.value = true;
    errorMessage.value = null;
    const response = await api.get("/api/admin/courses");
    courses.value = (response.data as any[]).map(mapApiToCourseItem);
  } catch (error: any) {
    console.error(error);
    errorMessage.value =
      error?.response?.data?.message ?? "Failed to load courses.";
  } finally {
    isLoading.value = false;
  }
}

function goToCourseCreate() {
  resetCourseDraft();
  router.push({ name: "admin-course-create" });
}

function goToCourseEdit(courseId: string) {
  resetCourseDraft();
  router.push({ name: "admin-course-edit", params: { courseId } });
}

onMounted(fetchCourses);
</script>

<template>
  <div class="flex justify-center">
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
            class="h-[60px] w-[172px] rounded-[12px] bg-blue-500 px-7 text-[16px] font-bold text-white transition-colors hover:bg-blue-400 active:bg-blue-700"
            @click="goToCourseCreate"
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
            class="py-10 text-center text-body3 text-gray-500"
          >
            {{ errorMessage }}
          </div>
          <Table
            v-else
            :courses="
              courses.filter((course) =>
                course.name.toLowerCase().includes(searchText.toLowerCase()),
              )
            "
            @edit="goToCourseEdit"
          />
        </div>
      </div>
    </section>
  </div>
</template>
