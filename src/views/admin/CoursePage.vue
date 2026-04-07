<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { Search } from "lucide-vue-next";
import { useRouter } from "vue-router";
import Table from "@/components/admin/CourseTable.vue";
import { api } from "@/lib/api";
import type { CourseItem } from "@/types/admin-course";
import { resetCourseDraft } from "@/views/admin/course-create.state";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

const router = useRouter();

const PAGE_SIZE = 10;
const currentPage = ref(1);

const courses = ref<CourseItem[]>([]);
const totalElements = ref(0);
console.log(courses);
const serverTotalPages = ref(0);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const searchText = ref("");

watch(
  searchText,
  () => {
    currentPage.value = 1;
  },
  { flush: "sync" },
);

watch(
  [currentPage, searchText],
  () => {
    void fetchCourses();
  },
  { immediate: true },
);

const rowOffset = computed(() => (currentPage.value - 1) * PAGE_SIZE);

const showPagination = computed(
  () => !isLoading.value && !errorMessage.value && serverTotalPages.value > 1,
);

const courseTableEmptyMessage = computed(() => {
  if (courses.value.length > 0) return "";
  if (searchText.value.trim()) {
    return "No courses match your search.";
  }
  return "No courses yet.";
});

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
    const pageZeroBased = currentPage.value - 1;
    const params: Record<string, string | number> = {
      page: pageZeroBased,
      size: PAGE_SIZE,
    };
    const q = searchText.value.trim();
    if (q) {
      params.title = q;
    }
    const { data } = await api.get("/api/admin/courses", { params });
    const body = data as {
      content: any[];
      totalElements: number;
      totalPages: number;
    };
    const tp = body.totalPages ?? 0;
    const te = body.totalElements ?? 0;
    serverTotalPages.value = tp;
    totalElements.value = te;

    if (tp > 0 && currentPage.value > tp) {
      currentPage.value = tp;
    }

    courses.value = (body.content ?? []).map(mapApiToCourseItem);
  } catch (error: unknown) {
    console.error(error);
    const err = error as { response?: { data?: { message?: string } } };
    errorMessage.value =
      err?.response?.data?.message ?? "Failed to load courses.";
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
            :courses="courses"
            :row-offset="rowOffset"
            :empty-message="courseTableEmptyMessage"
            @edit="goToCourseEdit"
          />

          <div
            v-if="showPagination"
            class="mt-8 flex w-full flex-wrap items-center justify-center gap-2 px-4 py-3 pb-10"
          >
            <Pagination
              v-model:page="currentPage"
              :total="totalElements"
              :items-per-page="PAGE_SIZE"
              :sibling-count="1"
              :show-edges="true"
              class="justify-center"
            >
              <PaginationContent v-slot="{ items }" class="flex-wrap justify-center">
                <PaginationPrevious class="shrink-0 cursor-pointer" />

                <template
                  v-for="(item, idx) in items"
                  :key="
                    item.type === 'page'
                      ? item.value
                      : `ellipsis-${idx}`
                  "
                >
                  <PaginationItem
                    v-if="item.type === 'page'"
                    class="cursor-pointer"
                    :value="item.value"
                    :is-active="item.value === currentPage"
                  >
                    {{ item.value }}
                  </PaginationItem>
                  <PaginationEllipsis
                    v-else-if="item.type === 'ellipsis'"
                    class="shrink-0 cursor-pointer"
                  />
                </template>

                <PaginationNext class="shrink-0 cursor-pointer" />
              </PaginationContent>
            </Pagination>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
