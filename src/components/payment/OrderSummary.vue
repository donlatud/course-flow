<script setup lang="ts">
/**
 * สรุปยอด + ช่อง promo + ปุ่ม Place order (Phase A)
 * ราคาเป็น string ที่ format แล้วจาก parent — ตัวเลขจริงมาจาก order ที่ backend
 *
 * ตาม payment-frontend-plan.md: ปุ่ม Place order `disabled` เฉพาะตอน `loading`;
 * validation / ไม่มี order / ชำระไม่ได้ → จัดการใน parent (`place-order`) ไม่ disable ปุ่มจากเงื่อนไขเหล่านั้น
 */
import PrimaryButton from "@/components/base/button/PrimaryButton.vue"
import CustomInput from "@/components/base/input/CustomInput.vue"

const props = defineProps<{
  courseTitle: string
  promoCode: string
  formattedSubtotal: string
  formattedDiscount: string
  formattedTotal: string
  paymentMethodLabel: string
  isPromoApplied: boolean
  canApplyPromo: boolean
  promoErrorMessage: string
  /** true ตอนโหลดคอร์ส — ใช้กับ Apply และ Place order (`disabled` เฉพาะตอนนี้) */
  loading: boolean
  /** แสดงข้อความ "Processing..." บนปุ่ม Place order */
  isProcessing: boolean
}>()

const emit = defineEmits<{
  (e: "update:promoCode", value: string): void
  /** ช่อง promo ถูกล้างขณะที่ order มีส่วนลดจาก promo อยู่ — parent ต้องสร้าง order ใหม่ไม่มี promo */
  (e: "remove-applied-promo"): void
  (e: "apply-promo"): void
  (e: "place-order"): void
}>()

const onPromoCodeInput = (raw: string | number) => {
  const value = String(raw)
  emit("update:promoCode", value)
  /** ลบโค้ดออกจากช่อง → เอา discount ออกทันที; ต้องกรอกครบ + กด Apply อีกครั้งถึงจะใช้ promo ได้ */
  if (value.trim() === "" && props.isPromoApplied) {
    emit("remove-applied-promo")
  }
}
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
          @update:model-value="onPromoCodeInput"
        />
        <PrimaryButton
          class="h-12! w-22! rounded-3! px-4!"
          :disabled="!canApplyPromo || loading"
          @click="emit('apply-promo')"
        >
          {{ loading ? "Applying..." : "Apply" }}
        </PrimaryButton>
      </div>
      <p v-if="promoErrorMessage" class="mb-4 text-body4 text-purple">
        {{ promoErrorMessage }}
      </p>

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
        {{ isProcessing ? "Processing..." : "Place order" }}
      </PrimaryButton>
    </div>
  </aside>
</template>
