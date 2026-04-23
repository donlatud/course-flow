<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
import { Search } from "lucide-vue-next";
import { useRouter } from "vue-router";
import Table from "@/components/admin/CourseTable.vue";
import { api } from "@/lib/api";
import { deleteCourse } from "@/lib/adminCoursesApi";
import { appToast } from "@/components/base/toast";
import Modal from "@/components/base/modal/Modal.vue";
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
const deleteConfirmOpen = ref(false);
const deleteConfirmCourseId = ref<string | null>(null);
const deleteConfirmCourseName = ref("");
const isDeleting = ref(false);
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

/**
 * Spring Data `Page` → `{ content, totalElements }`.
 * Some proxies or older handlers return a bare array — paginate on the client.
 */
function normalizeAdminCoursesPayload(
  raw: unknown,
  page: number,
  size: number,
): { items: unknown[]; total: number } {
  if (Array.isArray(raw)) {
    const total = raw.length;
    const start = (page - 1) * size;
    const items = raw.slice(start, start + size);
    return { items, total };
  }
  if (raw && typeof raw === "object" && "content" in raw) {
    const o = raw as { content?: unknown[]; totalElements?: unknown };
    const content = Array.isArray(o.content) ? o.content : [];
    const total =
      typeof o.totalElements === "number" && Number.isFinite(o.totalElements)
        ? o.totalElements
        : content.length;
    return { items: content, total };
  }
  return { items: [], total: 0 };
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
    const { items, total } = normalizeAdminCoursesPayload(
      response.data,
      currentPage.value,
      PAGE_SIZE,
    );
    courses.value = items.map((item) => mapApiToCourseItem(item));
    totalElements.value = total;
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

function openDeleteConfirm(courseId: string) {
  const item = courses.value.find((c) => c.id === courseId);
  deleteConfirmCourseId.value = courseId;
  deleteConfirmCourseName.value = item?.name ?? courseId;
  deleteConfirmOpen.value = true;
}

async function confirmDelete() {
  const id = deleteConfirmCourseId.value;
  if (!id) return;
  isDeleting.value = true;
  try {
    await deleteCourse(id);
    deleteConfirmOpen.value = false;
    deleteConfirmCourseId.value = null;
    appToast.success("Course deleted", `"${deleteConfirmCourseName.value}" has been removed.`);
    await fetchCourses();
  } catch (err: unknown) {
    const message =
      err && typeof err === "object" && "response" in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : null;
    appToast.error("Delete failed", message ?? "Could not delete the course. It may have active enrollments.");
  } finally {
    isDeleting.value = false;
  }
}

function cancelDelete() {
  deleteConfirmOpen.value = false;
  deleteConfirmCourseId.value = null;
  deleteConfirmCourseName.value = "";
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
            class="overflow-hidden rounded-xl border border-gray-100 bg-white shadow-sm"
          >
            <div class="grid grid-cols-[80px_1.6fr_0.8fr_0.8fr_0.9fr_0.8fr] border-b border-gray-100 bg-gray-300 px-6 py-4">
              <div
                v-for="n in 6"
                :key="`head-skeleton-${n}`"
                class="h-4 w-24 animate-pulse rounded bg-gray-200"
              />
            </div>
            <div
              v-for="row in 8"
              :key="`row-skeleton-${row}`"
              class="grid grid-cols-[80px_1.6fr_0.8fr_0.8fr_0.9fr_0.8fr] items-center border-b border-gray-50 px-6 py-5 last:border-b-0"
            >
              <div class="h-5 w-6 animate-pulse rounded bg-gray-200" />
              <div class="flex items-center gap-3">
                <div class="h-9 w-14 animate-pulse rounded-md bg-gray-200" />
                <div class="h-4 w-48 animate-pulse rounded bg-gray-200" />
              </div>
              <div class="h-4 w-24 animate-pulse rounded bg-gray-200" />
              <div class="h-4 w-20 animate-pulse rounded bg-gray-200" />
              <div class="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
              <div class="h-4 w-14 animate-pulse rounded bg-gray-200" />
            </div>
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
            @delete="openDeleteConfirm"
          />

          <Modal
            v-model:open="deleteConfirmOpen"
            title="Confirmation"
            message="Are you sure you want to delete this course?"
            left-text="No, Keep it"
            right-text="Yes, I want to delete this course"
            type="primary"
            variant="danger"
            right-button-class="w-[310px]"
            left-button-class="w-[147px]"
            @left-click="cancelDelete"
            @right-click="confirmDelete"
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
