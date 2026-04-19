<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import axios from "axios";
import { Search } from "lucide-vue-next";
import { useRouter } from "vue-router";
import PromoTable from "@/components/admin/PromoTable.vue";
import { api } from "@/lib/api";

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

function totalCoursesFromAdminPagePayload(raw: unknown): number {
  if (raw && typeof raw === "object" && "totalElements" in raw) {
    const te = (raw as { totalElements?: unknown }).totalElements;
    if (typeof te === "number" && Number.isFinite(te)) {
      return te;
    }
  }
  return 0;
}

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

const searchText = ref("");
const router = useRouter();

const promoCodes = ref<PromoCodeRow[]>([]);
const isLoading = ref(false);
const loadError = ref<string | null>(null);

async function fetchPromoCodes() {
  loadError.value = null;
  isLoading.value = true;
  try {
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
      totalCoursesInDb = totalCoursesFromAdminPagePayload(pageData);
    } catch {
      totalCoursesInDb = 0;
    }

    const { data } = await api.get<AdminPromoCodeListItem[]>("/api/admin/courses/promo-codes");
    promoCodes.value = Array.isArray(data) ? data.map((row) => mapApiToRow(row, totalCoursesInDb)) : [];
  } catch (error) {
    console.error("Failed to load promo codes:", error);
    let detail = "Could not load promo codes.";
    if (axios.isAxiosError(error) && error.response?.data && typeof error.response.data === "object") {
      const m = (error.response.data as { message?: unknown }).message;
      if (typeof m === "string" && m.trim() !== "") {
        detail = m;
      }
    }
    loadError.value = detail;
    promoCodes.value = [];
  } finally {
    isLoading.value = false;
  }
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
          <p v-if="loadError" class="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-body3 text-red-800">
            {{ loadError }}
          </p>

          <p v-if="isLoading" class="py-8 text-center text-body3 text-gray-500">
            Loading…
          </p>

          <template v-else>
            <PromoTable :promos="filteredPromoCodes" @edit="goToEditPromoCode" />

            <p
              v-if="filteredPromoCodes.length === 0"
              class="py-8 text-center text-body3 text-gray-500"
            >
              No promo codes found.
            </p>
          </template>
        </div>
      </div>
    </section>
  </div>
</template>
