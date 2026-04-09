<script setup lang="ts">
import { computed, ref } from "vue";
import { Search } from "lucide-vue-next";
import { useRouter } from "vue-router";
import PromoTable from "@/components/admin/PromoTable.vue";

type PromoCodeRow = {
  id: string;
  code: string;
  minimumPurchase: number;
  discountType: "Percent" | "Fixed amount";
  coursesIncluded: string;
  createdDate: string;
};

const searchText = ref("");
const router = useRouter();

const promoCodes = ref<PromoCodeRow[]>([
  {
    id: "1",
    code: "NEWYEAR200",
    minimumPurchase: 0,
    discountType: "Fixed amount",
    coursesIncluded: "All",
    createdDate: "12/02/2022 10:30PM",
  },
  {
    id: "2",
    code: "MERRYX25",
    minimumPurchase: 1200,
    discountType: "Percent",
    coursesIncluded: "Service Design Essential",
    createdDate: "12/02/2022 10:30PM",
  },
  {
    id: "3",
    code: "BDAY2025",
    minimumPurchase: 0,
    discountType: "Fixed amount",
    coursesIncluded: "Service Design Essential",
    createdDate: "12/02/2022 10:30PM",
  },
  {
    id: "4",
    code: "NEWMEMBER",
    minimumPurchase: 3000,
    discountType: "Fixed amount",
    coursesIncluded: "All",
    createdDate: "12/02/2022 10:30PM",
  },
  {
    id: "5",
    code: "1212PKDS",
    minimumPurchase: 0,
    discountType: "Percent",
    coursesIncluded: "All",
    createdDate: "12/02/2022 10:30PM",
  },
]);

const filteredPromoCodes = computed(() =>
  promoCodes.value.filter((promo) =>
    promo.code.toLowerCase().includes(searchText.value.toLowerCase()),
  ),
);

function goToCreatePromoCode() {
  router.push({ name: "admin-promo-code-create" });
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
              placeholder="Search..."
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
          <PromoTable :promos="filteredPromoCodes" />

          <p
            v-if="filteredPromoCodes.length === 0"
            class="py-8 text-center text-body3 text-gray-500"
          >
            No promo codes found.
          </p>
        </div>
      </div>
    </section>
  </div>
</template>
