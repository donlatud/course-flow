<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { watchDebounced } from "@vueuse/core";
import { Search } from "lucide-vue-next";
import Modal from "@/components/base/modal/Modal.vue";
import { appToast } from "@/components/base/toast";
import { useRouter } from "vue-router";
import Table from "@/components/admin/AssignmentTable.vue";
import { api } from "@/lib/api";
import type {
  AssignmentItem,
  AssignmentSortDir,
  AssignmentSortKey,
} from "@/types/admin-assignment";
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

const assignments = ref<AssignmentItem[]>([]);
const totalElements = ref(0);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);
const searchText = ref("");
const sortBy = ref<AssignmentSortKey>("createdAt");
const sortDir = ref<AssignmentSortDir>("desc");

// Modal states
const showDeleteModal = ref(false);
const assignmentToDelete = ref<string | null>(null);

watchDebounced(
  searchText,
  (v) => {
    debouncedSearch.value = v.trim();
    currentPage.value = 1;
    console.log("Search changed:", debouncedSearch.value);
  },
  { debounce: 350 },
);

watch([currentPage, debouncedSearch, sortBy, sortDir], () => {
  fetchAssignments();
}, { immediate: true });

const rowOffset = computed(() => (currentPage.value - 1) * PAGE_SIZE);

const totalPages = computed(() =>
  Math.max(1, Math.ceil(totalElements.value / PAGE_SIZE)),
);

const assignmentTableEmptyMessage = computed(() => {
  if (totalElements.value > 0) return "";
  if (debouncedSearch.value) {
    return "No assignments match your search.";
  }
  return "No assignments yet.";
});

function onSortColumn(key: AssignmentSortKey) {
  if (sortBy.value === key) {
    sortDir.value = sortDir.value === "asc" ? "desc" : "asc";
  } else {
    sortBy.value = key;
    sortDir.value = "desc";
  }
  currentPage.value = 1;
}

function mapApiToAssignmentItem(apiItem: any): AssignmentItem {
  return {
    id: apiItem.id,
    title: apiItem.title,
    description: apiItem.description ?? null,
    courseName: apiItem.courseTitle ?? "-",
    moduleName: apiItem.moduleTitle ?? "-",
    subLessonName: apiItem.materialTitle ?? "-",
    dueDate: apiItem.endDate ? new Date(apiItem.endDate).toLocaleDateString() : "-",
    status: "ACTIVE",
    statusLabel: "Active",
    createdAt: apiItem.createdAt ?? new Date().toISOString(),
    updatedAt: apiItem.endDate ?? new Date().toISOString(),
  };
}

async function fetchAssignments() {
  try {
    isLoading.value = true;
    errorMessage.value = null;
    const params: any = {
      page: currentPage.value - 1, // API uses 0-based pagination
      size: PAGE_SIZE,
    };
    if (debouncedSearch.value) {
      params.search = debouncedSearch.value;
    }
    if (sortBy.value) {
      // Map frontend sort keys to backend sort keys
      const sortByMap: Record<string, string> = {
        courseName: "course.title",
        moduleName: "module.title",
        subLessonName: "material.title",
        createdAt: "createdAt",
      };
      const backendSortKey = sortByMap[sortBy.value] || "createdAt";
      // Skip sorting for moduleName and subLessonName as they cause backend 500 errors
      // Backend doesn't support nested field sorting properly yet
      if (sortBy.value !== "moduleName" && sortBy.value !== "subLessonName") {
        params.sort = `${backendSortKey},${sortDir.value}`;
      }
    }
    const response = await api.get("/api/admin/assignments", { params });
    // API returns paginated response with content array
    const data = response.data as any;
    assignments.value = (data.content ?? []).map((item: any) =>
      mapApiToAssignmentItem(item),
    );
    totalElements.value = data.totalElements ?? 0;
    // Update current page from API response
    if (data.number !== undefined) {
      currentPage.value = data.number + 1; // Convert 0-based to 1-based
    }
  } catch (error: any) {
    console.error("Full error:", error);
    console.error("Error response:", error?.response);
    console.error("Error response data:", error?.response?.data);
    errorMessage.value =
      error?.response?.data?.message ?? error?.response?.data ?? "Failed to fetch assignments.";
  } finally {
    isLoading.value = false;
  }
}

function goToAssignmentCreate() {
  router.push({ name: "admin-assignment-create" });
}

function goToAssignmentEdit(assignmentId: string) {
  router.push({ name: "admin-assignment-edit", params: { assignmentId } });
}

function openDeleteModal(assignmentId: string) {
  assignmentToDelete.value = assignmentId;
  showDeleteModal.value = true;
}

function cancelDelete() {
  showDeleteModal.value = false;
  assignmentToDelete.value = null;
}

async function confirmDelete() {
  if (!assignmentToDelete.value) return;
  showDeleteModal.value = false;
  try {
    await api.delete(`/api/admin/assignments/${assignmentToDelete.value}`);
    appToast.success("Deleted", "Assignment has been deleted successfully.");
    await fetchAssignments();
  } catch (error: any) {
    console.error("Full error:", error);
    console.error("Error response:", error?.response);
    console.error("Error response data:", error?.response?.data);
    appToast.error("Error", error?.response?.data?.message ?? "Failed to delete assignment.");
  } finally {
    assignmentToDelete.value = null;
  }
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
        <h1 class="text-headline3 text-gray-900">Assignment</h1>

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
            class="cursor-pointer h-[60px] w-[209px] rounded-[12px] bg-blue-500 px-7 text-[16px] font-bold text-white transition-colors hover:bg-blue-400 active:bg-blue-700"
            @click="goToAssignmentCreate"
          >
            + Add Assignment
          </button>
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-10 pt-12">
        <div class="mx-auto w-full">
          <div
            v-if="isLoading"
            class="py-10 text-center text-body3 text-gray-500"
          >
            Loading assignments...
          </div>
          <div
            v-else-if="errorMessage"
            class="py-10 text-center text-body3 text-gray-500"
          >
            {{ errorMessage }}
          </div>
          <Table
            v-else
            :assignments="assignments"
            :row-offset="rowOffset"
            :empty-message="assignmentTableEmptyMessage"
            :sort-by="sortBy"
            :sort-dir="sortDir"
            @edit="goToAssignmentEdit"
            @delete="openDeleteModal"
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

    <!-- Delete Confirmation Modal -->
    <Modal
      v-model:open="showDeleteModal"
      title="Confirmation"
      message="Are you sure you want to delete this assignment?"
      left-text="No, Keep it"
      right-text="Yes, I want to delete this assignment"
      type="primary"
      variant="danger"
      right-button-class="w-[310px]"
      left-button-class="w-[147px]"
      @left-click="cancelDelete"
      @right-click="confirmDelete"
    />
  </div>
</template>
