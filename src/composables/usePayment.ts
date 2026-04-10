/**
 * usePayment Composable
 * 
 * Composable หลักสำหรับจัดการ Payment Flow ทั้งหมด
 * รวม paymentService และ useOmise เข้าด้วยกันเพื่อให้ใช้งานง่าย
 * 
 * Features:
 * - สร้าง Order
 * - Validate Promo Code
 * - Process Credit Card Payment (สร้าง token + charge)
 * - Handle 3DS redirect
 * - Poll order status หลัง redirect กลับมา
 * 
 * @example
 * ```typescript
 * const {
 *   isProcessing,
 *   error,
 *   createOrder,
 *   validatePromoCode,
 *   processCardPayment,
 * } = usePayment(courseId)
 * 
 * // 1. สร้าง order
 * const order = await createOrder("PROMO20")
 * 
 * // 2. Process payment
 * await processCardPayment(order.orderId, {
 *   cardNumber: "4242424242424242",
 *   nameOnCard: "John Doe",
 *   expiryDate: "12/25",
 *   cvv: "123"
 * })
 * // จะ redirect ไป 3DS หรือ success/failed page อัตโนมัติ
 * ```
 */

import { ref, computed } from "vue"
import type { ComputedRef, Ref } from "vue"
import { useRouter } from "vue-router"
import { paymentService } from "@/services/paymentService"
import { useOmise } from "@/composables/useOmise"
import type {
  OrderResponse,
  ValidatePromoCodeResponse,
  PaymentResponse,
} from "@/services/paymentService"

/** ใช้ร่วมกับ CheckoutView ตอน resume หลัง 3DS */
export const PENDING_ORDER_STORAGE_KEY = "pending_order_id"
export const PENDING_PAYMENT_COURSE_STORAGE_KEY = "pending_payment_course_id"

const LS_PENDING_ORDER = PENDING_ORDER_STORAGE_KEY
const LS_PENDING_COURSE = PENDING_PAYMENT_COURSE_STORAGE_KEY

function clearPendingPaymentMarkers(): void {
  try {
    localStorage.removeItem(LS_PENDING_ORDER)
    localStorage.removeItem(LS_PENDING_COURSE)
  } catch {
    /* ignore */
  }
}

function setPendingPaymentMarkers(orderId: string, courseId: string): void {
  try {
    localStorage.setItem(LS_PENDING_ORDER, orderId)
    localStorage.setItem(LS_PENDING_COURSE, courseId)
  } catch {
    /* ignore */
  }
}

/** ผลหลังเช็กสถานะตอนกลับจาก 3DS (ใช้ strip query / fallback ใน CheckoutView) */
export type OrderStatusResumeResult = "redirected" | "polling" | "error"

/**
 * courseId จาก route เป็น computed — รับได้ทั้ง string หรือ ref/computed
 * เพื่อให้ resolveCourseId() ได้ค่าล่าสุดเวลาเรียก API / redirect
 */
type CourseIdSource = string | Ref<string> | ComputedRef<string>

const resolveCourseId = (courseId: CourseIdSource): string =>
  typeof courseId === "string" ? courseId : courseId.value

export function usePayment(courseId: CourseIdSource) {
  const router = useRouter()
  
  // ใช้ useOmise สำหรับสร้าง token
  const { createTokenFromForm, isLoading: isCreatingToken, error: tokenError } = useOmise()

  // --------------------------------------------------------------------------
  // State
  // --------------------------------------------------------------------------

  /** Order ที่สร้างแล้ว */
  const order = ref<OrderResponse | null>(null)
  
  /** ผลลัพธ์การ validate promo code */
  const promoValidation = ref<ValidatePromoCodeResponse | null>(null)
  
  /** ผลลัพธ์การ process payment */
  const paymentResult = ref<PaymentResponse | null>(null)

  /** กำลัง loading (API calls) */
  const isLoading = ref(false)
  
  /** Error message */
  const error = ref<string | null>(null)
  
  /** กำลัง polling order status */
  const isPolling = ref(false)

  /** กำลัง processing: API payment/order หรือสร้าง Omise token (กัน double-submit ใน handler) */
  const isProcessing = computed(() => isLoading.value || isCreatingToken.value)

  // --------------------------------------------------------------------------
  // Order Methods
  // --------------------------------------------------------------------------

  /**
   * สร้าง Order ใหม่
   * 
   * Flow:
   * 1. เรียก POST /api/orders
   * 2. Backend validate course, user, promo
   * 3. Backend สร้าง order และ order_item
   * 4. Return order พร้อม pricing
   * 
   * @param promoCode - Promo code (optional)
   * @returns OrderResponse หรือ null ถ้า error
   */
  const createOrder = async (promoCode?: string): Promise<OrderResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      order.value = await paymentService.createOrder({
        courseId: resolveCourseId(courseId),
        promoCode,
      })
      return order.value
    } catch (err: any) {
      // Extract error message จาก response หรือ error object
      error.value = err.response?.data?.message || err.message || "Failed to create order"
      return null
    } finally {
      isLoading.value = false
    }
  }

  // --------------------------------------------------------------------------
  // Promo Code Methods
  // --------------------------------------------------------------------------

  /**
   * Validate Promo Code
   * 
   * Flow:
   * 1. เรียก POST /api/promo-codes/validate
   * 2. Backend validate code และคำนวณส่วนลด
   * 3. Return validation result
   * 
   * @param code - Promo code
   * @param originalPrice - ราคาเต็มของ course
   * @returns ValidatePromoCodeResponse หรือ null ถ้า error
   */
  const validatePromoCode = async (
    code: string,
    originalPrice: number
  ): Promise<ValidatePromoCodeResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      promoValidation.value = await paymentService.validatePromoCode({
        code,
        courseId: resolveCourseId(courseId),
        originalPrice,
      })
      return promoValidation.value
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || "Failed to validate promo code"
      return null
    } finally {
      isLoading.value = false
    }
  }

  // --------------------------------------------------------------------------
  // Payment Methods
  // --------------------------------------------------------------------------

  /**
   * Process Credit Card Payment
   * 
   * Flow หลัก:
   * 1. สร้าง Omise Token จาก card data (ผ่าน useOmise)
   * 2. ส่ง token ไป backend (POST /api/payments/card)
   * 3. Backend สร้าง Omise Charge
   * 4. Handle response:
   *    - PENDING + authorizeUri: redirect ไป 3DS
   *    - SUCCESS: redirect ไป payment-completed
   *    - FAILED: redirect ไป payment-failed
   * 
   * @param orderId - Order ID ที่จะ process
   * @param cardData - Card form data
   * @returns PaymentResponse หรือ null ถ้า error
   */
  const processCardPayment = async (
    orderId: string,
    cardData: {
      cardNumber: string
      nameOnCard: string
      expiryDate: string
      cvv: string
    }
  ): Promise<PaymentResponse | null> => {
    isLoading.value = true
    error.value = null

    try {
      // Step 1: สร้าง Omise Token
      // Token จะถูกส่งไป Omise server โดยตรง (ไม่ผ่าน backend ของเรา)
      // เพื่อความปลอดภัย - PCI compliance
      const token = await createTokenFromForm(cardData)

      // Step 2: ส่ง token ไป backend เพื่อสร้าง Charge
      paymentResult.value = await paymentService.processCardPayment({
        orderId,
        token,
      })

      // Step 3: Handle response
      
      // Case 1: ต้องทำ 3DS - redirect ไปหน้า authentication
      if (paymentResult.value.status === "PENDING" && paymentResult.value.authorizeUri) {
        setPendingPaymentMarkers(orderId, resolveCourseId(courseId))

        // Redirect ไป 3DS page
        window.location.href = paymentResult.value.authorizeUri
        return paymentResult.value
      }

      // Case 2: Success - redirect ไป payment-completed
      if (paymentResult.value.status === "SUCCESS") {
        clearPendingPaymentMarkers()
        router.push({
          name: "payment-completed",
          params: { courseId: resolveCourseId(courseId) },
          query: { orderId },
        })
      }
      // Case 3: Failed - redirect ไป payment-failed
      else if (paymentResult.value.status === "FAILED") {
        clearPendingPaymentMarkers()
        const reason = paymentResult.value.reason || "FAILED"
        router.push({
          name: "payment-failed",
          params: { courseId: resolveCourseId(courseId) },
          query: { orderId, reason },
        })
      }

      return paymentResult.value
    } catch (err: any) {
      // Error อาจมาจาก useOmise (tokenError) หรือ API
      error.value =
        tokenError.value ||
        err.response?.data?.message ||
        err.message ||
        "Payment processing failed"
      return null
    } finally {
      isLoading.value = false
    }
  }

  // --------------------------------------------------------------------------
  // Polling Methods (สำหรับ 3DS และ QR Payment)
  // --------------------------------------------------------------------------

  /**
   * Poll Order Status
   * 
   * ใช้สำหรับ:
   * - หลัง 3DS redirect กลับมา
   * - หลังแสดง QR code (Phase 2)
   * 
   * จะ poll ทุก interval จนกว่าจะได้ COMPLETED หรือ FAILED
   * หรือจนกว่าจะครบ maxAttempts
   * 
   * @param orderId - Order ID ที่จะ poll
   * @param options - Configuration options
   */
  const pollOrderStatus = async (
    orderId: string,
    options: {
      interval?: number       // Polling interval (ms), default: 3000
      maxAttempts?: number    // Max attempts, default: 60 (3 นาที)
      onSuccess?: () => void  // Callback เมื่อ success
      onFailed?: () => void   // Callback เมื่อ failed
    } = {}
  ): Promise<void> => {
    const { interval = 3000, maxAttempts = 60, onSuccess, onFailed } = options

    isPolling.value = true
    let attempts = 0

    /**
     * Poll function - recursive
     */
    const poll = async () => {
      // Stop: manual stop หรือครบจำนวนครั้ง (หลัง 3DS ยัง PENDING เกิน ~3 นาที)
      if (!isPolling.value) {
        return
      }
      if (attempts >= maxAttempts) {
        isPolling.value = false
        clearPendingPaymentMarkers()
        router.push({
          name: "payment-failed",
          params: { courseId: resolveCourseId(courseId) },
          query: { orderId, reason: "PAYMENT_VERIFICATION_TIMEOUT" },
        })
        return
      }

      attempts++

      try {
        const status = await paymentService.getOrderStatus(orderId)

        // Success - stop polling และ redirect
        if (status.status === "COMPLETED") {
          isPolling.value = false
          clearPendingPaymentMarkers()
          onSuccess?.()
          router.push({
            name: "payment-completed",
            params: { courseId: resolveCourseId(courseId) },
            query: { orderId },
          })
          return
        }

        // Failed / หมดอายุ — หยุด poll (เดิมลืม EXPIRED ทำให้ spin จนครบ maxAttempts)
        if (status.status === "FAILED" || status.status === "EXPIRED") {
          isPolling.value = false
          clearPendingPaymentMarkers()
          onFailed?.()
          router.push({
            name: "payment-failed",
            params: { courseId: resolveCourseId(courseId) },
            query: { orderId, reason: status.status },
          })
          return
        }

        // Still pending - poll again after interval
        setTimeout(poll, interval)
      } catch (err) {
        // Error - log และ retry
        console.error("Failed to poll order status:", err)
        setTimeout(poll, interval)
      }
    }

    // Start polling
    poll()
  }

  /**
   * หยุด polling
   */
  const stopPolling = () => {
    isPolling.value = false
  }

  /**
   * โหลด order เข้า `order` (เช่น หลังกลับจาก 3DS — ห้ามเรียก `createOrder` เพราะ backend จะ expire pending เดิม)
   */
  const fetchOrderById = async (orderId: string): Promise<OrderResponse | null> => {
    error.value = null
    try {
      order.value = await paymentService.getOrder(orderId)
      return order.value
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || "Failed to load order"
      return null
    }
  }

  /**
   * เช็ค Order Status เมื่อ redirect กลับจาก 3DS
   *
   * Flow:
   * 1. เช็คสถานะ order
   * 2. ถ้า COMPLETED/FAILED/EXPIRED: เคลียร์ marker แล้ว redirect
   * 3. ถ้ายัง PENDING: เริ่ม polling (คง marker ไว้จนกว่าจะจบหรือสำเร็จ)
   */
  const checkOrderStatusOnReturn = async (
    orderId: string,
  ): Promise<OrderStatusResumeResult> => {
    isLoading.value = true
    error.value = null

    try {
      const status = await paymentService.getOrderStatus(orderId)

      if (status.status === "COMPLETED") {
        clearPendingPaymentMarkers()
        router.push({
          name: "payment-completed",
          params: { courseId: resolveCourseId(courseId) },
          query: { orderId },
        })
        return "redirected"
      }
      if (status.status === "FAILED" || status.status === "EXPIRED") {
        clearPendingPaymentMarkers()
        router.push({
          name: "payment-failed",
          params: { courseId: resolveCourseId(courseId) },
          query: { orderId, reason: status.status },
        })
        return "redirected"
      }

      pollOrderStatus(orderId)
      return "polling"
    } catch (err: any) {
      error.value = err.response?.data?.message || err.message || "Failed to check order status"
      return "error"
    } finally {
      isLoading.value = false
    }
  }

  // --------------------------------------------------------------------------
  // Return
  // --------------------------------------------------------------------------

  return {
    // State
    order,           // Order ที่สร้างแล้ว
    promoValidation, // ผลลัพธ์ validate promo
    paymentResult,   // ผลลัพธ์ payment
    isLoading,       // กำลัง loading
    isProcessing,    // กำลัง processing (รวม token creation)
    isPolling,       // กำลัง polling
    error,           // Error message

    // Order Methods
    createOrder,

    // Promo Code Methods
    validatePromoCode,

    // Payment Methods
    processCardPayment,

    // Polling Methods
    pollOrderStatus,
    stopPolling,
    checkOrderStatusOnReturn,
    fetchOrderById,
    clearPendingPaymentMarkers,
  }
}
