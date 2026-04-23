<script setup lang="ts">
import iconEdit from "@/assets/icon-edit.svg";
import iconDelete from "@/assets/icon-delete.svg";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-vue-next";

export type PromoSortKey = "minimumPurchaseAmount" | "discountType" | "createdAt" | "coursesIncludedLength";
export type PromoSortDir = "asc" | "desc";

type PromoRow = {
  id: string;
  code: string;
  minimumPurchase: number;
  discountType: string;
  coursesIncluded: string;
  createdDate: string;
};

const props = withDefaults(
  defineProps<{
    promos: PromoRow[];
    sortBy: PromoSortKey;
    sortDir: PromoSortDir;
  }>(),
  {
    sortBy: "createdAt",
    sortDir: "desc",
  },
);

const emit = defineEmits<{
  edit: [promoId: string];
  delete: [promoId: string];
  sort: [key: PromoSortKey];
}>();

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function ariaSortFor(key: PromoSortKey): "ascending" | "descending" | "none" {
  if (props.sortBy !== key) return "none";
  return props.sortDir === "asc" ? "ascending" : "descending";
}
</script>

<template>
  <div class="w-full overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
    <table class="w-full border-collapse text-left">
      <thead>
        <tr class="border-b border-gray-100 bg-gray-300">
          <th class="px-6 py-4 text-body3 text-gray-800"></th>
          <th class="px-6 py-4 text-body3 text-gray-800">Promo code</th>
          <th
            class="px-6 py-4 text-body3 text-gray-800"
            scope="col"
            :aria-sort="ariaSortFor('minimumPurchaseAmount')"
          >
            <button
              type="button"
              class="group inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left font-medium text-gray-800 hover:text-gray-950"
              @click="emit('sort', 'minimumPurchaseAmount')"
            >
              Minimum purchase (THB)
              <ArrowUpDown
                v-if="props.sortBy !== 'minimumPurchaseAmount'"
                class="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-80"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowUp
                v-else-if="props.sortDir === 'asc'"
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowDown
                v-else
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
            </button>
          </th>
          <th
            class="px-6 py-4 text-body3 text-gray-800"
            scope="col"
            :aria-sort="ariaSortFor('discountType')"
          >
            <button
              type="button"
              class="group inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left font-medium text-gray-800 hover:text-gray-950"
              @click="emit('sort', 'discountType')"
            >
              Discount type
              <ArrowUpDown
                v-if="props.sortBy !== 'discountType'"
                class="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-80"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowUp
                v-else-if="props.sortDir === 'asc'"
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowDown
                v-else
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
            </button>
          </th>
          <th
            class="px-6 py-4 text-body3 text-gray-800"
            scope="col"
            :aria-sort="ariaSortFor('coursesIncludedLength')"
          >
            <button
              type="button"
              class="group inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left font-medium text-gray-800 hover:text-gray-950"
              @click="emit('sort', 'coursesIncludedLength')"
            >
              Courses Included
              <ArrowUpDown
                v-if="props.sortBy !== 'coursesIncludedLength'"
                class="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-80"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowUp
                v-else-if="props.sortDir === 'asc'"
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowDown
                v-else
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
            </button>
          </th>
          <th
            class="px-6 py-4 text-body3 text-gray-800"
            scope="col"
            :aria-sort="ariaSortFor('createdAt')"
          >
            <button
              type="button"
              class="group inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left font-medium text-gray-800 hover:text-gray-950"
              @click="emit('sort', 'createdAt')"
            >
              Created date
              <ArrowUpDown
                v-if="props.sortBy !== 'createdAt'"
                class="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-80"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowUp
                v-else-if="props.sortDir === 'asc'"
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowDown
                v-else
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
            </button>
          </th>
          <th class="px-6 py-4 text-center text-body3 text-gray-800">Action</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-50">
        <tr
          v-for="(promo, index) in promos"
          :key="promo.id"
          :class="[
            'h-[88px] transition-colors hover:bg-slate-100',
            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60',
          ]"
        >
          <td class="px-6 py-4 text-sm text-slate-600">
            {{ index + 1 }}
          </td>
          <td class="px-6 py-4 font-medium text-slate-700">
            {{ promo.code }}
          </td>
          <td class="px-6 py-4 text-sm text-slate-600">
            {{ formatNumber(promo.minimumPurchase) }}
          </td>
          <td class="px-6 py-4 text-sm text-slate-600">
            {{ promo.discountType }}
          </td>
          <td
            class="max-w-[220px] truncate px-6 py-4 text-sm text-slate-600"
            :title="promo.coursesIncluded"
          >
            {{ promo.coursesIncluded }}
          </td>
          <td class="px-6 py-4 text-sm text-slate-500">
            {{ promo.createdDate }}
          </td>
          <td class="px-6 py-4 text-center">
            <div class="flex justify-center gap-3">
              <button
                type="button"
                class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 transition hover:bg-red-50 hover:opacity-90 active:opacity-100"
                aria-label="Delete promo code"
                @click="emit('delete', promo.id)"
              >
                <img
                  :src="iconDelete"
                  alt=""
                  class="pointer-events-none h-5 w-5"
                  width="20"
                  height="20"
                />
              </button>
              <button
                type="button"
                class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 transition hover:bg-yellow-50 hover:opacity-90 active:opacity-100"
                aria-label="Edit promo code"
                @click="emit('edit', promo.id)"
              >
                <img
                  :src="iconEdit"
                  alt=""
                  class="pointer-events-none h-5 w-5"
                  width="20"
                  height="20"
                />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
