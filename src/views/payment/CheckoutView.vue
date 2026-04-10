<script setup lang="ts">
/**
 * Checkout (Phase A + B)
 *
 * อ้างอิง: `plans/payment-frontend-plan.md`, `plans/payment-integration-plan.md`,
 * `course-flow-server/plans/payment-backend-plan.md`.
 *
 * Flow หลัก:
 * 1) โหลดข้อมูลคอร์ส (GET course) เพื่อแสดงชื่อ/ราคาเบื้องต้น
 * 2) สร้าง order ผ่าน backend (POST /api/orders) — ราคา subtotal/discount/total ใช้จาก order จริง
 *    **ยกเว้น** กลับจาก 3DS (`?orderId=` ตาม return_uri ของ backend) — ห้ามเรียก createOrder ซ้ำเพราะจะ expire order เดิม
 * 3) Promo: validate แล้วสร้าง order ใหม่พร้อม promo
 * 4) จ่ายบัตร → 3DS ถ้ามี → กลับมาเช็กสถานะ + poll ถ้ายัง PENDING
 *
 * QR ปิดชั่วคราว (Phase A scope)
 */
import { computed, onUnmounted, ref, watch } from "vue"
import { useRoute, useRouter } from "vue-router"
import Navbar from "@/components/shared/Navbar.vue"
import AppFooter from "@/components/shared/AppFooter.vue"
import GhostButton from "@/components/base/button/GhostButton.vue"
import PaymentMethodSelector from "@/components/payment/PaymentMethodSelector.vue"
import OrderSummary from "@/components/payment/OrderSummary.vue"
import { courseService } from "@/services/courseService"
import {
  usePayment,
  type OrderStatusResumeResult,
  PENDING_ORDER_STORAGE_KEY,
  PENDING_PAYMENT_COURSE_STORAGE_KEY,
} from "@/composables/usePayment"
import type { Course } from "@/types/course"

const route = useRoute()
const router = useRouter()
const course = ref<Course | null>(null)
/** โหลดข้อมูลคอร์สจาก public API — แยกจาก loading ของ order/payment */
const loadingCourse = ref(false)
/** สร้าง order ใหม่หลังล้างช่อง promo (เอา discount ออก) */
const refreshingOrderWithoutPromo = ref(false)
const cardNumber = ref("")
const nameOnCard = ref("")
const expiryDate = ref("")
const cvv = ref("")
const promoCode = ref("")
const selectedPaymentMethod = ref<"card" | "qr">("card")
const submitted = ref(false)
/** ข้อความจาก validate promo (เช่น code ไม่พบ) */
const promoErrorMessage = ref("")
/** ข้อความ error ทั่วหน้า (โหลดคอร์ส, สร้าง order, จ่ายเงิน) */
const checkoutErrorMessage = ref("")
/** เช่น แจ้งเมื่อ order เดิมหมดอายุแล้วสร้างใหม่ */
const orderNoticeMessage = ref("")
/** หลังกลับจาก 3DS — รอผลครั้งแรกจาก GET /status */
const isVerifyingPaymentReturn = ref(false)

const courseId = computed(() =>
  typeof route.params.courseId === "string"
    ? route.params.courseId
    : "",
)

const courseTitle = computed(() => course.value?.title ?? "Selected Course")
const {
  order,
  isProcessing,
  isPolling,
  error,
  createOrder,
  validatePromoCode,
  processCardPayment,
  checkOrderStatusOnReturn,
  fetchOrderById,
  clearPendingPaymentMarkers,
  stopPolling,
} = usePayment(courseId)
/** ราคาแสดงใน Summary: ใช้จาก order หลังสร้างแล้ว; ก่อนมี order ใช้ราคาจาก course เป็นตัวเลขเริ่มต้น */
const subtotalAmount = computed(() => order.value?.subtotal ?? course.value?.price ?? 0)
const discountAmount = computed(() => order.value?.discount ?? 0)
const totalAmount = computed(() => order.value?.total ?? subtotalAmount.value)
/** Phase A รองรับแค่บัตร — ไม่สลับไป QR */
const paymentMethodLabel = computed(() => "Credit card / Debit card")
const normalizedPromoCode = computed(() => promoCode.value.trim().toUpperCase())
const isPromoApplied = computed(() => Boolean(order.value?.promoCode?.code))
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
/** มีตัวอักษรในช่อง promo ถึงจะกด Apply ได้ */
const canApplyPromo = computed(() => normalizedPromoCode.value.length > 0)
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
const loadCourse = async (id: string) => {
  if (!id) return

  loadingCourse.value = true

  try {
    course.value = await courseService.getCourseById(id)
  } catch {
    checkoutErrorMessage.value = "Failed to load course information"
  } finally {
    loadingCourse.value = false
  }
}

/**
 * สร้างหรือรีเฟรช order ที่ backend (ราคาใน Summary มาจาก order นี้)
 * @param promo ส่งเมื่อผู้ใช้ apply promo สำเร็จแล้ว หรือหลังสร้าง order ครั้งแรกไม่มี promo
 */
const createOrRefreshOrder = async (promo?: string) => {
  if (!courseId.value) return

  orderNoticeMessage.value = ""
  checkoutErrorMessage.value = ""

  const created = await createOrder(promo)
  if (!created) {
    checkoutErrorMessage.value = error.value || "Failed to create order"
    return
  }

  /** ถ้า backend คืน EXPIRED ให้สร้าง order ใหม่อีกครั้งด้วย promo เดิม (ถ้ามี) */
  if (created.status === "EXPIRED") {
    orderNoticeMessage.value = "Your previous order expired. A new order has been created."
    const recreated = await createOrder(promo)
    if (!recreated) {
      checkoutErrorMessage.value = error.value || "Failed to refresh order"
    }
  }
}

/**
 * ระบุ order ที่กำลัง resume หลัง 3DS — `?orderId=` (จาก backend return_uri) หรือ localStorage คู่กับ courseId
 */
const resolvePendingOrderIdForResume = (currentCourseId: string): string | null => {
  const q = route.query.orderId
  if (typeof q === "string" && q.trim() !== "") return q.trim()
  const storedOrder = localStorage.getItem(PENDING_ORDER_STORAGE_KEY)
  const storedCourse = localStorage.getItem(PENDING_PAYMENT_COURSE_STORAGE_KEY)
  if (storedOrder && storedCourse === currentCourseId) return storedOrder
  return null
}

/** เข้าหน้า / เปลี่ยน course → โหลดคอร์ส; ถ้าไม่ใช่ resume หลัง 3DS ค่อยสร้าง order ใหม่ */
watch(
  courseId,
  async (id) => {
    if (!id) return

    await loadCourse(id)

    const pendingOrderId = resolvePendingOrderIdForResume(id)
    if (pendingOrderId) {
      const loaded = await fetchOrderById(pendingOrderId)
      if (!loaded) {
        checkoutErrorMessage.value =
          error.value || "Unable to resume this checkout. Starting a new order."
        clearPendingPaymentMarkers()
        if (route.query.orderId) {
          await router.replace({ name: "payment-checkout", params: { courseId: id }, query: {} })
        }
        await createOrRefreshOrder()
        return
      }

      /** จบแล้ว — ไม่เรียก status/poll (กัน loop จาก FailedView + ?orderId=) */
      if (loaded.status === "COMPLETED") {
        clearPendingPaymentMarkers()
        await router.replace({
          name: "payment-completed",
          params: { courseId: id },
          query: { orderId: pendingOrderId },
        })
        return
      }

      if (loaded.status === "FAILED" || loaded.status === "EXPIRED") {
        clearPendingPaymentMarkers()
        orderNoticeMessage.value =
          loaded.status === "EXPIRED"
            ? "This order has expired. A new checkout session has been started."
            : "Your last payment attempt did not complete. You can try again below."
        if (route.query.orderId) {
          await router.replace({ name: "payment-checkout", params: { courseId: id }, query: {} })
        }
        if (loaded.promoCode?.code) {
          promoCode.value = loaded.promoCode.code
        }
        await createOrRefreshOrder(loaded.promoCode?.code)
        return
      }

      /** PENDING — resume หลัง 3DS / รอ webhook */
      isVerifyingPaymentReturn.value = true
      let result: OrderStatusResumeResult = "error"
      try {
        result = await checkOrderStatusOnReturn(pendingOrderId)
      } finally {
        isVerifyingPaymentReturn.value = false
      }

      if (result === "polling" && route.query.orderId) {
        await router.replace({ name: "payment-checkout", params: { courseId: id }, query: {} })
      }

      if (result === "error") {
        checkoutErrorMessage.value =
          error.value || "Could not confirm payment status. You can try placing your order again."
        clearPendingPaymentMarkers()
        if (route.query.orderId) {
          await router.replace({ name: "payment-checkout", params: { courseId: id }, query: {} })
        }
        await createOrRefreshOrder()
        return
      }

      return
    }

    await createOrRefreshOrder()
  },
  { immediate: true },
)

onUnmounted(() => {
  stopPolling()
})

const goBack = () => {
  router.push({
    name: "course-detail",
    params: { id: courseId.value },
  })
}

const resetValidation = () => {
  submitted.value = false
}

/** QR ปิดใน Phase A — ไม่เปลี่ยน state ถ้าเลือก QR */
const selectPaymentMethod = (method: "card" | "qr") => {
  if (method === "qr") return
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

/** ล้างช่อง promo ขณะมีส่วนลดจาก order → สร้าง order ใหม่ไม่มี promo (ต้องกรอก + Apply อีกครั้งถึงจะใช้โค้ดได้) */
const removeAppliedPromo = async () => {
  if (!order.value?.promoCode?.code || refreshingOrderWithoutPromo.value) return

  promoErrorMessage.value = ""
  refreshingOrderWithoutPromo.value = true
  try {
    await createOrRefreshOrder()
  } finally {
    refreshingOrderWithoutPromo.value = false
  }
}

/** Apply → validate ที่ backend แล้วสร้าง order ใหม่ให้ราคาสอดคล้อง promo */
const applyPromoCode = async () => {
  promoErrorMessage.value = ""
  checkoutErrorMessage.value = ""

  if (!canApplyPromo.value) return

  const promoValidation = await validatePromoCode(normalizedPromoCode.value, subtotalAmount.value)
  if (!promoValidation) {
    promoErrorMessage.value = error.value || "Unable to validate promo code"
    return
  }

  if (!promoValidation.valid) {
    /** reason จาก API — แปลเป็นข้อความให้ผู้ใช้ */
    const reasonMap: Record<string, string> = {
      NOT_FOUND: "Promo code not found",
      EXPIRED: "Promo code expired",
      USAGE_LIMIT_REACHED: "Promo code usage limit reached",
      ALREADY_USED: "You already used this promo code",
      INVALID: "Promo code is invalid",
    }
    promoErrorMessage.value =
      reasonMap[promoValidation.reason || "INVALID"] || "Promo code is invalid"
    return
  }

  promoCode.value = promoValidation.code
  await createOrRefreshOrder(promoValidation.code)
}

/**
 * Place order: tokenize บัตร (Omise) → charge ที่ backend
 * สำเร็จ/ล้มเหลว/3DS จัดการใน usePayment (รวม redirect หน้า completed/failed)
 *
 * Guards อยู่ที่นี่ (ไม่ disable ปุ่มจากสถานะเหล่านี้ — ตาม payment-frontend-plan.md)
 */
const placeOrder = async () => {
  if (loadingCourse.value) return
  if (refreshingOrderWithoutPromo.value) return
  if (isProcessing.value) return
  if (isPolling.value) return

  submitted.value = true
  checkoutErrorMessage.value = ""

  if (!order.value?.orderId) {
    await createOrRefreshOrder(isPromoApplied.value ? normalizedPromoCode.value : undefined)
  }
  if (!order.value?.orderId) return

  if (order.value.status === "EXPIRED") {
    await createOrRefreshOrder(isPromoApplied.value ? normalizedPromoCode.value : undefined)
    if (!order.value?.orderId) return
  }

  if (selectedPaymentMethod.value !== "card") return

  if (!isCardFormValid.value) return

  const paymentResponse = await processCardPayment(order.value.orderId, {
    cardNumber: cardNumber.value,
    nameOnCard: nameOnCard.value,
    expiryDate: expiryDate.value,
    cvv: cvv.value,
  })

  /** กรณี token หรือ API error แต่ไม่ redirect (เช่น network) */
  if (!paymentResponse && error.value) {
    checkoutErrorMessage.value = error.value
  }
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
              <p v-if="orderNoticeMessage" class="mt-2 text-body4 text-black">
                {{ orderNoticeMessage }}
              </p>
              <p v-if="checkoutErrorMessage" class="mt-2 text-body4 text-purple">
                {{ checkoutErrorMessage }}
              </p>
              <p
                v-if="isPolling"
                class="mt-3 flex items-center gap-2 text-body4 text-gray-700"
                role="status"
                aria-live="polite"
              >
                <span
                  class="inline-block h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-gray-400 border-t-transparent"
                  aria-hidden="true"
                />
                Verifying payment with your bank… This may take a moment.
              </p>
              <p
                v-else-if="isVerifyingPaymentReturn"
                class="mt-3 text-body4 text-gray-700"
                role="status"
                aria-live="polite"
              >
                Confirming payment…
              </p>
            </div>

            <!-- Phase A: qr-enabled=false ปิด QR จนกว่าจะรองรับ flow จริง -->
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
              :qr-enabled="false"
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
            :can-apply-promo="canApplyPromo"
            :promo-error-message="promoErrorMessage"
            :loading="loadingCourse || refreshingOrderWithoutPromo"
            :is-processing="isProcessing"
            @update:promo-code="promoCode = $event"
            @remove-applied-promo="removeAppliedPromo"
            @apply-promo="applyPromoCode"
            @place-order="placeOrder"
          />
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>
