<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { Search } from "lucide-vue-next";
import { useRouter } from "vue-router";
import PromoTable from "@/components/admin/PromoTable.vue";
import { api } from "@/lib/api";
import Pagination from "@/components/ui/pagination/Pagination.vue";
import PaginationContent from "@/components/ui/pagination/PaginationContent.vue";
import PaginationItem from "@/components/ui/pagination/PaginationItem.vue";
import PaginationPrevious from "@/components/ui/pagination/PaginationPrevious.vue";
import PaginationNext from "@/components/ui/pagination/PaginationNext.vue";

type PromoCodeRow = {
  id: string;
  code: string;
  minimumPurchase: number;
  discountType: "Percent" | "Fixed amount";
  coursesIncluded: string;
  createdDate: string;
};

type AdminPromoCodeListItem = {
  id: string;
  code: string;
  minimumPurchaseAmount: number | string | null;
  discountType: "PERCENTAGE" | "FIXED_AMOUNT";
  /** From API; older servers may omit → treat as false. */
  allCourses?: boolean;
  courseTitles: string[];
  createdAt: string | null;
};

type PageData = {
  content: AdminPromoCodeListItem[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

function mapApiToRow(item: AdminPromoCodeListItem, totalCoursesInDb: number): PromoCodeRow {
  const minRaw = item.minimumPurchaseAmount;
  const minimumPurchase =
    minRaw == null
      ? 0
      : typeof minRaw === "number" && Number.isFinite(minRaw)
        ? minRaw
        : Number(String(minRaw).replace(/,/g, "").trim()) || 0;

  const discountType: PromoCodeRow["discountType"] =
    item.discountType === "PERCENTAGE" ? "Percent" : "Fixed amount";

  const titles = item.courseTitles ?? [];
  const linkedCount = titles.length;
  const coversAllCourses =
    item.allCourses === true ||
    (totalCoursesInDb > 0 && linkedCount === totalCoursesInDb);

  const coursesIncluded = coversAllCourses
    ? "ALL"
    : linkedCount === 0
      ? "—"
      : titles.join(", ");

  const createdDate = item.createdAt
    ? new Date(item.createdAt).toLocaleString("en-US", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      })
    : "—";

  return {
    id: item.id,
    code: item.code,
    minimumPurchase,
    discountType,
    coursesIncluded,
    createdDate,
  };
}

const PAGE_SIZE = 10;

const searchText = ref("");
const router = useRouter();
const debouncedSearch = ref("");

const promoCodes = ref<PromoCodeRow[]>([]);
const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

const currentPage = ref(1);
const totalElements = ref(0);
const totalPages = computed(() => Math.ceil(totalElements.value / PAGE_SIZE));

function getTotal(raw: unknown): number {
  if (raw && typeof raw === "object" && "totalElements" in raw) {
    const te = (raw as { totalElements?: unknown }).totalElements;
    if (typeof te === "number" && Number.isFinite(te)) {
      return te;
    }
  }
  return 0;
}

async function fetchPromoCodes() {
  const pageNum = currentPage.value - 1;
  try {
    isLoading.value = true;
    errorMessage.value = null;

    let totalCoursesInDb = 0;
    try {
      const { data: pageData } = await api.get("/api/admin/courses", {
        params: {
          page: 0,
          size: 1,
          sortBy: "createdAt",
          sortDir: "desc",
        },
      });
      totalCoursesInDb = getTotal(pageData);
    } catch {
      totalCoursesInDb = 0;
    }

    const { data } = await api.get<PageData>("/api/admin/courses/promo-codes", {
      params: {
        page: pageNum,
        size: PAGE_SIZE,
        sortBy: "createdAt",
        sortDir: "desc",
      },
    });

    if (data && Array.isArray(data.content)) {
      promoCodes.value = data.content.map((row) => mapApiToRow(row, totalCoursesInDb));
      totalElements.value = getTotal(data);
    } else {
      promoCodes.value = [];
      totalElements.value = 0;
    }
  } catch (error) {
    console.error(error);
    errorMessage.value = "Failed to load promo codes.";
  } finally {
    isLoading.value = false;
  }
}

const emptyMessage = computed(() => {
  if (totalElements.value > 0) return "";
  if (debouncedSearch.value) {
    return "No promo codes match your search.";
  }
  return "No promo codes yet.";
});

function onPageChange(page: number) {
  currentPage.value = page;
  void fetchPromoCodes();
}

onMounted(fetchPromoCodes);

const filteredPromoCodes = computed(() =>
  promoCodes.value.filter((promo) =>
    promo.code.toLowerCase().includes(searchText.value.toLowerCase()),
  ),
);

function goToCreatePromoCode() {
  router.push({ name: "admin-promo-code-create" });
}

function goToEditPromoCode(promoId: string) {
  router.push({ name: "admin-promo-code-edit", params: { promoId } });
}
</script>

<template>
  <div class="flex justify-center">
    <section class="w-full max-w-[1920px] flex min-h-screen flex-col bg-gray-100">
      <div
        class="mx-auto flex h-[92px] w-full shrink-0 items-center justify-between gap-6 border-b border-gray-200 bg-white px-8"
      >
        <h1 class="text-headline3 text-gray-900">Promo code</h1>

        <div class="ml-auto flex items-center gap-4">
          <label
            class="flex h-[48px] w-[320px] items-center gap-2 rounded-[8px] border border-gray-300 bg-white px-3"
          >
            <Search :size="18" class="text-gray-500" />
            <input
              v-model="searchText"
              type="text"
              placeholder="Search by promo code..."
              class="w-full border-0 bg-transparent text-body3 text-gray-800 placeholder:text-gray-500 focus:outline-none"
            />
          </label>

          <button
            type="button"
            class="h-[60px] w-[200px] rounded-[12px] bg-blue-500 px-7 text-[16px] font-bold text-white transition-colors hover:bg-blue-400 active:bg-blue-700"
            @click="goToCreatePromoCode"
          >
            + Add Promo code
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
          <PromoTable
            v-else
            :promos="filteredPromoCodes"
            @edit="goToEditPromoCode"
          />

          <p
            v-if="!isLoading && !errorMessage && filteredPromoCodes.length === 0"
            class="py-8 text-center text-body3 text-gray-500"
          >
            {{ emptyMessage }}
          </p>
        </div>
      </div>

      <div
        v-if="totalPages > 1"
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
                class="cursor-pointer"
                v-if="item.type === 'page'"
                :value="item.value"
                :is-active="item.value === currentPage"
                @click="onPageChange(item.value)"
              >
                {{ item.value }}
              </PaginationItem>
              <span v-else class="px-2">...</span>
            </template>

            <PaginationNext class="shrink-0 cursor-pointer" />
          </PaginationContent>
        </Pagination>
      </div>
    </section>
  </div>
</template>
