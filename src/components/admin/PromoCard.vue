<script setup lang="ts">
import CustomInput from "@/components/base/input/CustomInput.vue";
import { User } from "lucide-vue-next";

const promoCode = defineModel<string>("promoCode", { default: "" });
const discount = defineModel<string>("discount", { default: "" });
const validFrom = defineModel<string>("validFrom", { default: "" });
const validUntil = defineModel<string>("validUntil", { default: "" });
</script>

<template>
  <div
    class="w-full max-w-[920px] rounded-lg bg-[#F6F7FC] p-6 md:p-8"
    role="region"
    aria-label="Promo code settings"
  >
    <h2 class="mb-6 text-[20px] font-semibold leading-tight text-gray-900">
      Promo Code
    </h2>

    <div class="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
      <CustomInput
        v-model="promoCode"
        label="Promo code"
        placeholder="Enter code"
      />
      <CustomInput
        v-model="discount"
        label="Discount"
        placeholder="e.g. 20%"
      />
    </div>

    <div
      class="mt-6 flex flex-col gap-8 border-t border-[#D6D9E4]/60 pt-6 md:flex-row md:gap-10"
    >
      <div class="flex min-w-0 flex-1 gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#2F5FAC]/12"
        >
          <User
            class="h-5 w-5 text-[#2F5FAC]"
            :stroke-width="2"
          />
        </div>
        <div class="min-w-0 flex-1 space-y-3">
          <p class="text-body3 leading-snug text-[#424C6B]">
            Specify when this promotion becomes available to learners.
          </p>
          <CustomInput
            v-model="validFrom"
            label="Valid from"
            type="date"
          />
        </div>
      </div>

      <div class="flex min-w-0 flex-1 gap-3">
        <div
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#49454F]/10"
        >
          <User
            class="h-5 w-5 text-[#49454F]"
            :stroke-width="2"
          />
        </div>
        <div class="min-w-0 flex-1 space-y-3">
          <p class="text-body3 leading-snug text-[#424C6B]">
            Specify when this promotion stops applying.
          </p>
          <CustomInput
            v-model="validUntil"
            label="Valid until"
            type="date"
          />
        </div>
      </div>
    </div>
  </div>
</template>
