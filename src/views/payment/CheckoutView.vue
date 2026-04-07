<script setup lang="ts">
import { computed, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import Navbar from "@/components/shared/Navbar.vue"
import AppFooter from "@/components/shared/AppFooter.vue"
import GhostButton from "@/components/base/button/GhostButton.vue"
import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector.vue"
import OrderSummary from "@/components/payment/OrderSummary.vue"
import { courseService } from "@/services/courseService"
import type { Course } from "@/types/course"

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
const submitted = ref(false)
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
const normalizedCardNumber = computed(() => cardNumber.value.replace(/\D/g, ""))
const normalizedNameOnCard = computed(() => nameOnCard.value.trim().replace(/\s+/g, " "))
const normalizedCvv = computed(() => cvv.value.replace(/\D/g, ""))
const isCardNumberValid = computed(() => {
  const digits = normalizedCardNumber.value

  return digits.length >= 13 && digits.length <= 19
})
const isNameOnCardValid = computed(() => {
  const name = normalizedNameOnCard.value

  return name.length >= 2 && /^[A-Za-z]+(?:[ '.-][A-Za-z]+)*$/.test(name)
})
const isExpiryDateValid = computed(() => {
  const match = expiryDate.value.match(/^(\d{2})\/(\d{2})$/)

  if (!match) return false

  const month = Number(match[1])
  const year = Number(match[2])

  if (month < 1 || month > 12) return false

  const now = new Date()
  const currentYear = now.getFullYear() % 100
  const currentMonth = now.getMonth() + 1

  return year > currentYear || (year === currentYear && month >= currentMonth)
})
const isCvvValid = computed(() => /^\d{3,4}$/.test(normalizedCvv.value))
const shouldShowCardErrors = computed(
  () => selectedPaymentMethod.value === "card" && submitted.value,
)
const hasCardNumberError = computed(
  () => shouldShowCardErrors.value && (!normalizedCardNumber.value || !isCardNumberValid.value),
)
const hasNameOnCardError = computed(
  () => shouldShowCardErrors.value && (!normalizedNameOnCard.value || !isNameOnCardValid.value),
)
const hasExpiryDateError = computed(
  () => shouldShowCardErrors.value && (!expiryDate.value || !isExpiryDateValid.value),
)
const hasCvvError = computed(
  () => shouldShowCardErrors.value && (!normalizedCvv.value || !isCvvValid.value),
)
const cardNumberErrorMessage = computed(() => {
  if (!hasCardNumberError.value) return ""
  if (!normalizedCardNumber.value) return "Please enter your card number"
  return "Please enter a valid card number"
})
const nameOnCardErrorMessage = computed(() => {
  if (!hasNameOnCardError.value) return ""
  if (!normalizedNameOnCard.value) return "Please enter your name on card"
  return "Please enter the name shown on your card"
})
const expiryDateErrorMessage = computed(() => {
  if (!hasExpiryDateError.value) return ""
  if (!expiryDate.value) return "Please enter your expiry date"
  return "Please enter a valid expiry date"
})
const cvvErrorMessage = computed(() => {
  if (!hasCvvError.value) return ""
  if (!normalizedCvv.value) return "Please enter your CVV"
  return "Please enter a valid CVV"
})
const isCardFormValid = computed(() =>
  isCardNumberValid.value &&
  isNameOnCardValid.value &&
  isExpiryDateValid.value &&
  isCvvValid.value,
)
const isPlaceOrderDisabled = computed(() =>
  loading.value || (selectedPaymentMethod.value === "card" && !isCardFormValid.value),
)

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

const resetValidation = () => {
  submitted.value = false
}

const selectPaymentMethod = (method: "card" | "qr") => {
  resetValidation()
  selectedPaymentMethod.value = method
}

const updateCardNumber = (value: string) => {
  resetValidation()
  const digits = value.replace(/\D/g, "").slice(0, 19)
  const groupedDigits = digits.match(/.{1,4}/g)

  cardNumber.value = groupedDigits?.join(" ") ?? ""
}

const updateNameOnCard = (value: string) => {
  resetValidation()
  nameOnCard.value = value
}

const updateExpiryDate = (value: string) => {
  resetValidation()
  const digits = value.replace(/\D/g, "").slice(0, 4)

  expiryDate.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits
}

const updateCvv = (value: string) => {
  resetValidation()
  cvv.value = value.replace(/\D/g, "").slice(0, 4)
}

const applyPromoCode = () => {
  isPromoApplied.value = isPromoCodeValid.value
}

const attemptPlaceOrder = () => {
  submitted.value = true
}

const placeOrder = () => {
  submitted.value = true

  if (isPlaceOrderDisabled.value) return

  // Mock checkout outcome for the current frontend-only flow.
  const targetRoute =
    selectedPaymentMethod.value === "card" ? "payment-completed" : "payment-failed"

  router.push({
    name: targetRoute,
    params: { courseId: courseId.value },
  })
}
</script>

<template>
  <div class="min-h-screen bg-white flex flex-col">
    <Navbar />

    <main class="flex-1 pt-6 pb-10 lg:px-10 lg:pt-12 lg:pb-60 xl:px-40">
      <div class="mx-auto w-full max-w-[375px] px-4 lg:max-w-[1120px] lg:px-0">
        <GhostButton class="mb-4 w-auto! h-auto! inline-flex items-center gap-2 cursor-pointer py-1 px-2"
          @click="goBack">
          <span aria-hidden="true">&larr;</span>
          <span>Back</span>
        </GhostButton>

        <div class="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-10">
          <div class="flex flex-col gap-8 lg:w-[739px] lg:flex-none lg:gap-12">
            <div class="max-w-[739px]">
              <h1 class="text-headline3 lg:text-headline2 text-black">
                Enter payment info to start <br> your subscription
              </h1>
            </div>

            <PaymentMethodSelector
              :card-number="cardNumber"
              :name-on-card="nameOnCard"
              :expiry-date="expiryDate"
              :cvv="cvv"
              :card-number-error="hasCardNumberError"
              :card-number-error-message="cardNumberErrorMessage"
              :name-on-card-error="hasNameOnCardError"
              :name-on-card-error-message="nameOnCardErrorMessage"
              :expiry-date-error="hasExpiryDateError"
              :expiry-date-error-message="expiryDateErrorMessage"
              :cvv-error="hasCvvError"
              :cvv-error-message="cvvErrorMessage"
              :selected-payment-method="selectedPaymentMethod"
              @update:card-number="updateCardNumber"
              @update:name-on-card="updateNameOnCard"
              @update:expiry-date="updateExpiryDate"
              @update:cvv="updateCvv"
              @select-payment-method="selectPaymentMethod"
            />
          </div>

          <OrderSummary
            :course-title="courseTitle"
            :promo-code="promoCode"
            :formatted-subtotal="formattedSubtotal"
            :formatted-discount="formattedDiscount"
            :formatted-total="formattedTotal"
            :payment-method-label="paymentMethodLabel"
            :is-promo-applied="isPromoApplied"
            :is-promo-code-valid="isPromoCodeValid"
            :loading="loading"
            :place-order-disabled="isPlaceOrderDisabled"
            @update:promo-code="promoCode = $event"
            @apply-promo="applyPromoCode"
            @attempt-place-order="attemptPlaceOrder"
            @place-order="placeOrder"
          />
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
