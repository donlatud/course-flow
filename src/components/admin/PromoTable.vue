<script setup lang="ts">
import iconEdit from "@/assets/icon-edit.svg";
import iconDelete from "@/assets/icon-delete.svg";

type PromoRow = {
  id: string;
  code: string;
  minimumPurchase: number;
  discountType: string;
  coursesIncluded: string;
  createdDate: string;
};

defineProps<{
  promos: PromoRow[];
}>();

const emit = defineEmits<{
  edit: [promoId: string];
  delete: [promoId: string];
}>();

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}
</script>

<template>
  <div class="w-full overflow-x-auto rounded-xl border border-gray-100 bg-white shadow-sm">
    <table class="w-full border-collapse text-left">
      <thead>
        <tr class="border-b border-gray-100 bg-gray-300">
          <th class="px-6 py-4 text-body3 text-gray-800"></th>
          <th class="px-6 py-4 text-body3 text-gray-800">Promo code</th>
          <th class="px-6 py-4 text-body3 text-gray-800">
            Minimum purchase (THB)
          </th>
          <th class="px-6 py-4 text-body3 text-gray-800">Discount type</th>
          <th class="px-6 py-4 text-body3 text-gray-800">Courses Included</th>
          <th class="px-6 py-4 text-body3 text-gray-800">Created date</th>
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
                class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 opacity-50"
                aria-label="Delete promo code"
                disabled
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
