<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
import { Search } from "lucide-vue-next";
import { useRouter } from "vue-router";
import Table from "@/components/admin/CourseTable.vue";
import { api } from "@/lib/api";
import type {
  CourseItem,
  CourseSortDir,
  CourseSortKey,
  CourseStatus,
} from "@/types/admin-course";

function mapApiStatus(raw: unknown): { status: CourseStatus; statusLabel: string } {
  const s = typeof raw === "string" ? raw.toUpperCase() : "";
  if (s === "PUBLISHED" || s === "ARCHIVED" || s === "DRAFT") {
    const labels: Record<CourseStatus, string> = {
      DRAFT: "Draft",
      PUBLISHED: "Published",
      ARCHIVED: "Archived",
    };
    return { status: s, statusLabel: labels[s] };
  }
  return { status: "DRAFT", statusLabel: "Draft" };
}
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
/** Synced from search after debounce; drives API `search` param. */
const debouncedSearch = ref("");

const courses = ref<CourseItem[]>([]);
const totalElements = ref(0);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const searchText = ref("");
const sortBy = ref<CourseSortKey>("createdAt");
const sortDir = ref<CourseSortDir>("desc");

watchDebounced(
  searchText,
  (v) => {
    debouncedSearch.value = v.trim();
    currentPage.value = 1;
  },
  { debounce: 350 },
);

watch([currentPage, debouncedSearch, sortBy, sortDir], () => {
  fetchCourses();
}, { immediate: true });

const rowOffset = computed(() => (currentPage.value - 1) * PAGE_SIZE);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalElements.value / PAGE_SIZE)),
);

const courseTableEmptyMessage = computed(() => {
  if (totalElements.value > 0) return "";
  if (debouncedSearch.value) {
    return "No courses match your search.";
  }
  return "No courses yet.";
});

function onSortColumn(key: CourseSortKey) {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = key;
    sortDir.value = "desc";
  }
  currentPage.value = 1;
}

function mapApiToCourseItem(apiItem: any): CourseItem {
  const { status, statusLabel } = mapApiStatus(apiItem.status);
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
    status,
    statusLabel,
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
    const response = await api.get("/api/admin/courses", {
      params: {
        page: currentPage.value - 1,
        size: PAGE_SIZE,
        sortBy: sortBy.value,
        sortDir: sortDir.value,
        ...(debouncedSearch.value
          ? { search: debouncedSearch.value }
          : {}),
      },
    });
    const data = response.data as {
      content?: unknown[];
      totalElements?: number;
    };
    courses.value = (data.content ?? []).map((item) =>
      mapApiToCourseItem(item),
    );
    totalElements.value = data.totalElements ?? 0;
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
            :sort-by="sortBy"
            :sort-dir="sortDir"
            @edit="goToCourseEdit"
            @sort="onSortColumn"
          />

          <div
            v-if="!isLoading && !errorMessage && totalPages > 1"
            class="mt-8 flex w-full  flex-wrap items-center justify-center gap-2   px-4 py-3 pb-10 "
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
                    class="cursor-pointer"
                    v-if="item.type === 'page'"
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
