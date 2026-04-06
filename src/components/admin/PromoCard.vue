<script setup lang="ts">
import CustomInput from "@/components/base/input/CustomInput.vue";
import NumberInput from "@/components/base/input/NumberInput.vue";
import { User } from "lucide-vue-next";

const promoCode = defineModel<string>("promoCode", { default: "" });
const minPurchase = defineModel<string>("minPurchase", { default: "" });
const discountType = defineModel<"THB" | "%">("discountType", {
  default: "THB",
});
const discountThb = defineModel<string>("discountThb", { default: "" });
const discountPercent = defineModel<string>("discountPercent", {
  default: "",
});
const validFrom = defineModel<string>("validFrom", { default: "" });
const validUntil = defineModel<string>("validUntil", { default: "" });
</script>

<template>
  <div
    class="w-full rounded-lg bg-[#F6F7FC] pt-6 pb-8 px-8"
    role="region"
    aria-label="Promo code settings"
  >
    <h2 class="mb-6 text-[20px] font-semibold leading-tight text-gray-900">
      Promo Code
    </h2>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      <CustomInput
        v-model="promoCode"
        label="Set promo code*"
        placeholder="Enter promo code"
      />
      <NumberInput
        v-model="minPurchase"
        label="Minimum purchase amount (THB)*"
        placeholder="0"
        supporting-text="Please enter numbers only"
        :min="0"
        :step="1"
        class="h-12"
      />
    </div>

    <div class="mt-6">
      <p class="mb-3 text-body3 font-medium text-gray-800">
        Select discount type*
      </p>
      <div class="flex flex-col gap-10 sm:flex-row sm:flex-wrap sm:items-center sm:gap-8">
        <div class="flex flex-wrap items-center gap-3">
          <input
            id="promo-discount-thb"
            v-model="discountType"
            type="radio"
            value="THB"
            class="h-5 w-5 shrink-0 cursor-pointer accent-[#2F5FAC]"
          />
          <label
            for="promo-discount-thb"
            :class="[
              'cursor-pointer text-body2 font-medium transition-colors',
              discountType === 'THB'
                ? 'text-[#2F5FAC]'
                : 'text-gray-500',
            ]"
          >
            Discount (THB)
          </label>
          <NumberInput
            v-model="discountThb"
            placeholder="0"
            supporting-text="Please enter numbers only"
            :min="0"
            :step="0.01"
            :disabled="discountType !== 'THB'"
            class="w-[255px] h-12 shrink-0"
          />
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <input
            id="promo-discount-pct"
            v-model="discountType"
            type="radio"
            value="%"
            class="h-5 w-5 shrink-0 cursor-pointer accent-[#2F5FAC]"
          />
          <label
            for="promo-discount-pct"
            :class="[
              'cursor-pointer text-body2 font-medium transition-colors',
              discountType === '%'
                ? 'text-[#2F5FAC]'
                : 'text-gray-500',
            ]"
          >
            Discount (%)
          </label>
          <NumberInput
            v-model="discountPercent"
            placeholder="0"
            supporting-text="Please enter numbers only"
            :min="0"
            :max="100"
            :step="0.01"
            :disabled="discountType !== '%'"
            class="w-[255px]  h-12 shrink-0"
          />
        </div>
      </div>
    </div>

    <div
      class="mt-6 flex flex-col gap-8 border-t border-[#D6D9E4]/60 pt-6 md:flex-row md:gap-10"
    >
      <div class="flex min-w-0 flex-1 gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2F5FAC]/12"
        >
          <User class="h-5 w-5 text-[#2F5FAC]" :stroke-width="2" />
        </div>
        <div class="min-w-0 flex-1 space-y-3">
          <p class="text-body3 leading-snug text-[#424C6B]">
            Specify when this promotion becomes available to learners.
          </p>
          <CustomInput v-model="validFrom" label="Valid from" type="date" />
        </div>
      </div>

      <div class="flex min-w-0 flex-1 gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#49454F]/10"
        >
          <User class="h-5 w-5 text-[#49454F]" :stroke-width="2" />
        </div>
        <div class="min-w-0 flex-1 space-y-3">
          <p class="text-body3 leading-snug text-[#424C6B]">
            Specify when this promotion stops applying.
          </p>
          <CustomInput v-model="validUntil" label="Valid until" type="date" />
        </div>
      </div>
    </div>
  </div>
</template>
