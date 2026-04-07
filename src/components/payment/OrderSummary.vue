<script setup lang="ts">
import PrimaryButton from "@/components/base/button/PrimaryButton.vue"
import CustomInput from "@/components/base/input/CustomInput.vue"

defineProps<{
  courseTitle: string
  promoCode: string
  formattedSubtotal: string
  formattedDiscount: string
  formattedTotal: string
  paymentMethodLabel: string
  isPromoApplied: boolean
  isPromoCodeValid: boolean
  loading: boolean
}>()

const emit = defineEmits<{
  (e: "update:promoCode", value: string): void
  (e: "apply-promo"): void
  (e: "place-order"): void
}>()
</script>

<template>
  <aside class="w-full lg:mt-[175px] lg:max-w-[357px]">
    <div class="rounded-[8px] bg-white py-8 px-6 shadow-1">
      <p class="mb-4 text-body3 font-medium text-orange-500">Summary</p>
      <p class="mb-1 text-body4 lg:text-body2 text-gray-700">
        Subscription
      </p>
      <h2 class="mb-6 text-headline3 text-black">
        {{ courseTitle }}
      </h2>

      <div class="mb-5 flex items-center gap-2">
        <CustomInput
          :model-value="promoCode"
          placeholder="Promo code"
          class="min-w-0 flex-1"
          @update:model-value="emit('update:promoCode', String($event))"
        />
        <PrimaryButton
          class="h-12! w-22! rounded-3! px-4!"
          :disabled="!isPromoCodeValid"
          @click="emit('apply-promo')"
        >
          Apply
        </PrimaryButton>
      </div>

      <div class="space-y-3 text-body2 text-gray-900">
        <div class="flex items-start justify-between gap-2">
          <span>Subtotal</span>
          <span>{{ formattedSubtotal }}</span>
        </div>
        <div
          v-if="isPromoApplied"
          class="flex items-start justify-between gap-2"
        >
          <span>Discount</span>
          <span class="text-purple">-{{ formattedDiscount }}</span>
        </div>
        <div class="flex items-start justify-between gap-2">
          <span>Payment method</span>
          <span class="max-w-[145px] text-right text-gray-700">
            {{ paymentMethodLabel }}
          </span>
        </div>
      </div>

      <div class="mb-6 mt-4 flex items-end justify-between gap-2">
        <span class="text-body2 text-black">Total</span>
        <span class="text-headline3 text-gray-700">
          THB {{ formattedTotal }}
        </span>
      </div>

      <PrimaryButton
        class="h-14! w-full! rounded-[12px]!"
        :disabled="loading"
        @click="emit('place-order')"
      >
        Place order
      </PrimaryButton>
    </div>
  </aside>
</template>
