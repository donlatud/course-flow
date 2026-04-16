/**
 * Payment Service
 * 
 * Service สำหรับจัดการ Payment APIs ทั้งหมด
 * ใช้สำหรับ:
 * - สร้างและจัดการ Order
 * - Validate Promo Code
 * - Process Credit Card Payment
 * - ตรวจสอบสถานะ Order (สำหรับ polling หลัง 3DS/QR)
 *
 * Checkout: createOrder, validatePromoCode, processCardPayment; หลัง 3DS ใช้ getOrder (hydrate) + getOrderStatus (resume/poll)
 */

import { api } from "@/lib/api"

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Request สำหรับสร้าง Order ใหม่
 */
export interface CreateOrderRequest {
  courseId: string
  promoCode?: string  // Optional: ถ้ามี promo code
}

/**
 * Response จาก API เมื่อสร้าง Order สำเร็จ
 */
export interface OrderResponse {
  orderId: string
  courseId: string
  courseName: string
  subtotal: number      // ราคาเต็มก่อนหักส่วนลด
  discount: number      // จำนวนส่วนลด
  total: number         // ราคาสุทธิหลังหักส่วนลด
  promoCode?: {
    code: string
    discountType: "PERCENTAGE" | "FIXED_AMOUNT"
    discountValue: number
  }
  /** ตรงกับ backend Order.Status */
  status: "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED"
  createdAt: string
  /** หมดเวลาชำระ pending (ถ้า backend ส่งมา) */
  expiresAt?: string
}

/**
 * Request สำหรับ validate promo code
 */
export interface ValidatePromoCodeRequest {
  code: string
  courseId: string
  originalPrice: number  // ราคาเต็มของ course เพื่อคำนวณส่วนลด
}

/**
 * Response จาก API เมื่อ validate promo code
 */
export interface ValidatePromoCodeResponse {
  valid: boolean
  code: string
  discountType?: "PERCENTAGE" | "FIXED_AMOUNT"
  discountValue?: number
  discountAmount?: number  // จำนวนเงินที่ลด (คำนวณแล้ว)
  finalPrice?: number      // ราคาสุทธิหลังหักส่วนลด
  /** ตรงกับ backend PromoCodeValidationResponse.Reason */
  reason?: "EXPIRED" | "NOT_FOUND" | "USAGE_LIMIT_REACHED" | "ALREADY_USED" | "INVALID" | "COURSE_PRICE_TOO_LOW" | "FINAL_PRICE_TOO_LOW"
}

/**
 * Request สำหรับ process credit card payment
 * token มาจาก Omise.js หลังจาก tokenize card
 */
export interface ProcessCardPaymentRequest {
  orderId: string
  token: string  // Omise token (tokn_test_xxx)
}

/**
 * Response จาก API หลัง process payment
 */
export interface PaymentResponse {
  paymentId: string
  orderId: string
  chargeId: string           // Omise charge ID (chrg_test_xxx)
  /** ตรงกับ backend Payment.Status */
  status: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
  authorizeUri?: string      // URL สำหรับ 3DS authentication (ถ้าต้องการ)
  returnUri?: string         // URL ที่จะ redirect กลับหลัง 3DS
  amount?: number
  paidAt?: string
  reason?: string            // เหตุผลถ้า failed
}

/**
 * Response สำหรับ polling order status
 * ใช้หลัง 3DS redirect หรือ QR payment
 */
export interface OrderStatusResponse {
  orderId: string
  /** ตรงกับ backend Order.Status */
  status: "PENDING" | "COMPLETED" | "FAILED" | "EXPIRED"
  paymentStatus?: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED"
  expiresAt?: string
}

// ============================================================================
// Payment Service Class
// ============================================================================

/**
 * PaymentService - Singleton class สำหรับจัดการ Payment APIs
 * 
 * ใช้ Singleton pattern เพื่อให้มี instance เดียวทั้ง app
 * ทุก method ใช้ axios instance จาก lib/api.ts ซึ่งมี:
 * - Base URL configuration
 * - Authorization header (Bearer token)
 */
class PaymentService {
  private static instance: PaymentService

  private constructor() {}

  /**
   * Get singleton instance
   */
  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService()
    }
    return PaymentService.instance
  }

  // --------------------------------------------------------------------------
  // Order APIs
  // --------------------------------------------------------------------------

  /**
   * สร้าง Order ใหม่
   * 
   * Flow:
   * 1. Frontend ส่ง courseId และ promoCode (optional)
   * 2. Backend validate course, user, promo code
   * 3. Backend คำนวณราคาและสร้าง order
   * 4. Return order details พร้อม pricing
   * 
   * @param request - courseId และ promoCode (optional)
   * @returns OrderResponse พร้อม pricing details
   */
  async createOrder(request: CreateOrderRequest): Promise<OrderResponse> {
    const response = await api.post<OrderResponse>("/api/orders", request)
    return response.data
  }

  /**
   * ดึงข้อมูล Order
   * 
   * @param orderId - UUID ของ order
   * @returns OrderResponse
   */
  async getOrder(orderId: string): Promise<OrderResponse> {
    const response = await api.get<OrderResponse>(`/api/orders/${orderId}`)
    return response.data
  }

  /**
   * ดึงสถานะ Order (สำหรับ polling)
   * 
   * ใช้สำหรับ:
   * - Polling หลัง 3DS redirect กลับมา
   * - Polling หลังแสดง QR code (Phase 2)
   * 
   * Frontend ควร poll ทุก 3-5 วินาที จนกว่าจะได้ COMPLETED หรือ FAILED
   * 
   * @param orderId - UUID ของ order
   * @returns OrderStatusResponse
   */
  async getOrderStatus(orderId: string): Promise<OrderStatusResponse> {
    const response = await api.get<OrderStatusResponse>(`/api/orders/${orderId}/status`)
    return response.data
  }

  // --------------------------------------------------------------------------
  // Promo Code APIs
  // --------------------------------------------------------------------------

  /**
   * Validate Promo Code และคำนวณส่วนลด
   * 
   * Flow:
   * 1. Frontend ส่ง code, courseId, originalPrice
   * 2. Backend validate:
   *    - code exists
   *    - ยังไม่หมดอายุ
   *    - ยังไม่เกิน usage limit
   * 3. Backend คำนวณ discountAmount และ finalPrice
   * 4. Return validation result
   * 
   * @param request - code, courseId, originalPrice
   * @returns ValidatePromoCodeResponse
   */
  async validatePromoCode(request: ValidatePromoCodeRequest): Promise<ValidatePromoCodeResponse> {
    const response = await api.post<ValidatePromoCodeResponse>("/api/promo-codes/validate", request)
    return response.data
  }

  // --------------------------------------------------------------------------
  // Payment APIs
  // --------------------------------------------------------------------------

  /**
   * Process Credit Card Payment
   * 
   * Flow:
   * 1. Frontend สร้าง Omise token จาก card info (ผ่าน useOmise)
   * 2. Frontend ส่ง orderId และ token มา
   * 3. Backend สร้าง Omise Charge ด้วย token
   * 4. ถ้าต้อง 3DS: return authorizeUri ให้ frontend redirect
   * 5. ถ้าไม่ต้อง 3DS: return SUCCESS/FAILED ทันที
   * 
   * หลัง 3DS:
   * - Omise redirect กลับมาที่ returnUri
   * - Frontend poll getOrderStatus() เพื่อเช็คผลลัพธ์
   * - Backend ได้รับ webhook แล้ว update order status
   * 
   * @param request - orderId และ Omise token
   * @returns PaymentResponse
   */
  async processCardPayment(request: ProcessCardPaymentRequest): Promise<PaymentResponse> {
    const response = await api.post<PaymentResponse>("/api/payments/card", request)
    return response.data
  }
}

// Export singleton instance
export const paymentService = PaymentService.getInstance()
