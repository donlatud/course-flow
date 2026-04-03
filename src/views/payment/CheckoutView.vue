<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import Navbar from "@/components/shared/Navbar.vue"
import AppFooter from "@/components/shared/AppFooter.vue"
import PrimaryButton from "@/components/base/button/PrimaryButton.vue"
import GhostButton from "@/components/base/button/GhostButton.vue"
import CustomInput from "@/components/base/input/CustomInput.vue"
import { courseService } from "@/services/courseService"
import type { Course } from "@/types/course"
import visaCard from "@/assets/icon-card-visa.svg"
import masterCard from "@/assets/icon-card-mastercard.svg"

const route = useRoute()
const router = useRouter()
const course = ref<Course | null>(null)
const loading = ref(false)
const cardNumber = ref("")
const nameOnCard = ref("")
const expiryDate = ref("")
const cvv = ref("")
const promoCode = ref("")
const selectedPaymentMethod = ref<"card" | "qr">("card")
const isPromoApplied = ref(false)
// Mock promo codes for the initial frontend flow; replace with API-driven validation later.
const mockPromoDiscounts: Record<string, number> = {
  NEWYEAR200: 200,
  EARLYBIRD150: 150,
  COURSEFLOW300: 300,
  SUMMERSALE50: 50,
}

const courseId = computed(() =>
  typeof route.params.courseId === "string"
    ? route.params.courseId
    : "",
)

const courseTitle = computed(() => course.value?.title ?? "Selected Course")
const subtotalAmount = computed(() => course.value?.price ?? 0)
const paymentMethodLabel = computed(() =>
  selectedPaymentMethod.value === "card"
    ? "Credit card / Debit card"
    : "QR Payment",
)
const normalizedPromoCode = computed(() => promoCode.value.trim().toUpperCase())
const matchedPromoDiscount = computed(() => mockPromoDiscounts[normalizedPromoCode.value] ?? 0)
const discountAmount = computed(() => (isPromoApplied.value ? matchedPromoDiscount.value : 0))
const totalAmount = computed(() => Math.max(subtotalAmount.value - discountAmount.value, 0))
const formattedSubtotal = computed(() =>
  subtotalAmount.value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
)
const formattedDiscount = computed(() =>
  discountAmount.value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
)
const formattedTotal = computed(() =>
  totalAmount.value.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }),
)
const isPromoCodeValid = computed(() => matchedPromoDiscount.value > 0)

const loadCourse = async (id: string) => {
  if (!id) return

  loading.value = true

  try {
    course.value = await courseService.getCourseById(id)
  } finally {
    loading.value = false
  }
}

watch(courseId, (id) => {
  loadCourse(id)
}, { immediate: true })

const goBack = () => {
  router.back()
}

const selectPaymentMethod = (method: "card" | "qr") => {
  selectedPaymentMethod.value = method
}

const applyPromoCode = () => {
  isPromoApplied.value = isPromoCodeValid.value
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <Navbar />

    <main class="flex-1 pt-6 pb-10 lg:px-10 lg:pt-12 lg:pb-60 xl:px-40">
      <div class="mx-auto w-full max-w-[375px] px-4 lg:max-w-[1120px] lg:px-0">
        <GhostButton class="mb-4 w-auto! h-auto! inline-flex items-center gap-2 cursor-pointer py-1 px-2" @click="goBack">
            <span aria-hidden="true">&larr;</span>
            <span>Back</span>
        </GhostButton>

        <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div class="flex flex-col gap-8 lg:w-[739px] lg:flex-none lg:gap-12">
            <div class="max-w-[739px]">
              <h1 class="text-headline3 lg:text-headline2 text-utility-black">
                Enter payment info to start <br> your subscription
              </h1>
            </div>

            <section>
              <p class="mb-4 text-body3 text-gray-700">Select payment method</p>

              <div
                :class="[
                  'rounded-[8px] p-4 lg:p-8',
                  selectedPaymentMethod === 'card' ? 'bg-gray-200' : 'bg-transparent',
                ]"
              >
                <button
                  type="button"
                  class="mb-6 flex items-center gap-3 text-body2 text-gray-900 cursor-pointer"
                  @click="selectPaymentMethod('card')"
                >
                  <span
                    :class="[
                      'flex h-5 w-5 items-center justify-center rounded-full border-2',
                      selectedPaymentMethod === 'card' ? 'border-blue-500' : 'border-black',
                    ]"
                  >
                    <span
                      v-if="selectedPaymentMethod === 'card'"
                      class="h-2.5 w-2.5 rounded-full bg-blue-500"
                    />
                  </span>
                  <span>Credit card / Debit card</span>
                </button>

                <div class="space-y-5 lg:pl-8">
                  <div class="lg:max-w-[611px] lg:flex lg:flex-row lg:gap-4">
                    <div class="lg:max-w-[453px] lg:flex lg:flex-col">
                    <p class="mb-2 text-body2 text-black">Card number</p>
                    <CustomInput
                      v-model="cardNumber"
                      placeholder="Card number"
                      class="lg:w-[453px]"
                    />
                    </div>
                    <div class="lg:mt-8 flex items-center gap-2">
                      <img :src="visaCard" alt="Visa" class="h-12 w-12 object-contain" />
                      <img
                        :src="masterCard"
                        alt="Mastercard"
                        class="h-12 w-12 object-contain"
                      />
                    </div>
                  </div>

                  <div>
                    <p class="mb-2 text-body2 text-black">Name on card</p>
                    <CustomInput
                      v-model="nameOnCard"
                      placeholder="Name on card"
                      class="lg:w-[453px]"
                    />
                  </div>

                  <div class="grid grid-cols-2 gap-4 lg:w-[453px]">
                    <div>
                      <p class="mb-2 text-body2 text-black">Expiry date</p>
                      <CustomInput
                        v-model="expiryDate"
                        placeholder="MM/YY"
                      />
                    </div>

                    <div>
                      <p class="mb-2 text-body2 text-black">CVV</p>
                      <CustomInput
                        v-model="cvv"
                        placeholder="CVV"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="button"
                :class="[
                  'mt-6 flex w-full items-center gap-3 rounded-[8px] px-4 py-4 text-left text-body2 text-gray-900 cursor-pointer lg:px-8',
                  selectedPaymentMethod === 'qr' ? 'bg-gray-200' : 'bg-transparent',
                ]"
                @click="selectPaymentMethod('qr')"
              >
                <span
                  :class="[
                    'flex h-5 w-5 items-center justify-center rounded-full border-2',
                    selectedPaymentMethod === 'qr' ? 'border-blue-500' : 'border-black',
                  ]"
                >
                  <span
                    v-if="selectedPaymentMethod === 'qr'"
                    class="h-2.5 w-2.5 rounded-full bg-blue-500"
                  />
                </span>
                <span>QR Payment</span>
              </button>
            </section>
          </div>

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
                  v-model="promoCode"
                  placeholder="Promo code"
                  class="min-w-0 flex-1"
                />
                <PrimaryButton
                  class="h-12! w-22! rounded-3! px-4!"
                  :disabled="!isPromoCodeValid"
                  @click="applyPromoCode"
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

              <PrimaryButton class="h-14! w-full! rounded-[12px]!" :disabled="loading">
                Place order
              </PrimaryButton>
            </div>
          </aside>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
