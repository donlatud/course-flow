/**
 * useOmise Composable
 * 
 * Composable สำหรับ integrate กับ Omise.js
 * ใช้สำหรับ:
 * - โหลด Omise.js script dynamically
 * - สร้าง Token จาก credit card info
 * - Handle errors จาก Omise
 * 
 * Token ที่ได้จะส่งไป backend เพื่อสร้าง Charge
 * (ไม่ส่ง card info ตรงไป backend เพื่อความปลอดภัย - PCI compliance)
 *
 * ใน Phase A ถูกเรียกจาก usePayment.processCardPayment เท่านั้น (ไม่เรียกจาก view โดยตรง)
 * 
 * @example
 * ```typescript
 * const { createTokenFromForm, isLoading, error } = useOmise()
 * 
 * const token = await createTokenFromForm({
 *   cardNumber: "4242424242424242",
 *   nameOnCard: "John Doe",
 *   expiryDate: "12/25",
 *   cvv: "123"
 * })
 * // token = "tokn_test_xxx"
 * ```
 */

import { ref } from "vue"

// ============================================================================
// Type Definitions for Omise.js
// ============================================================================

/**
 * Declare global Omise objects ที่จะถูก inject จาก Omise.js script
 */
declare global {
  interface Window {
    Omise: OmiseJS
    OmiseCard: OmiseCardJS
  }
}

/**
 * Omise.js main object
 */
interface OmiseJS {
  setPublicKey(key: string): void
  createToken(
    type: "card",
    cardInfo: OmiseCardInfo,
    callback: (statusCode: number, response: OmiseTokenResponse) => void
  ): void
}

/**
 * OmiseCard.js สำหรับ popup form (ไม่ใช้ในตอนนี้)
 */
interface OmiseCardJS {
  configure(config: OmiseCardConfig): void
  open(config: OmiseCardOpenConfig): void
  attach(): void
}

/**
 * Card info สำหรับส่งไป Omise เพื่อสร้าง token
 */
interface OmiseCardInfo {
  name: string
  number: string
  expiration_month: number
  expiration_year: number
  security_code: string
}

interface OmiseCardConfig {
  publicKey: string
  currency?: string
  frameLabel?: string
  submitLabel?: string
  buttonLabel?: string
}

interface OmiseCardOpenConfig {
  amount: number
  currency?: string
  defaultPaymentMethod?: string
  onCreateTokenSuccess: (token: string) => void
  onFormClosed?: () => void
}

/**
 * Response จาก Omise เมื่อสร้าง token สำเร็จ
 */
interface OmiseTokenResponse {
  object: "token"
  id: string              // Token ID: tokn_test_xxx
  livemode: boolean
  used: boolean
  card: {
    object: "card"
    id: string
    brand: string         // Visa, Mastercard, etc.
    last_digits: string   // Last 4 digits
    name: string
    expiration_month: number
    expiration_year: number
  }
  created_at: string
}

/**
 * Response จาก Omise เมื่อเกิด error
 */
interface OmiseErrorResponse {
  object: "error"
  code: string
  message: string
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Omise Public Key จาก environment variable
 * ใช้ Public Key เท่านั้น (ไม่ใช่ Secret Key) ใน frontend
 *
 * ต้องเป็น mode เดียวกับ `OMISE_SECRET_KEY` บน backend (test คู่ test, live คู่ live)
 * มิฉะนั้น token ที่สร้างจะใช้ charge กับ secret อีกฝั่งไม่ได้
 */
const OMISE_PUBLIC_KEY = import.meta.env.VITE_OMISE_PUBLIC_KEY || ""

/**
 * URL ของ Omise.js script
 */
const OMISE_SCRIPT_URL = "https://cdn.omise.co/omise.js"

// ============================================================================
// Composable
// ============================================================================

export function useOmise() {
  // Reactive state
  const isLoading = ref(false)   // กำลังสร้าง token
  const isReady = ref(false)     // Script loaded และพร้อมใช้งาน
  const error = ref<string | null>(null)

  // --------------------------------------------------------------------------
  // Script Loading
  // --------------------------------------------------------------------------

  /**
   * โหลด Omise.js script dynamically
   * 
   * จะสร้าง <script> tag และ append เข้า <head>
   * เมื่อ script load เสร็จจะ set public key อัตโนมัติ
   * 
   * @returns Promise<void>
   */
  const loadOmiseScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // ถ้า script โหลดแล้ว ไม่ต้องโหลดซ้ำ
      if (window.Omise) {
        isReady.value = true
        resolve()
        return
      }

      // สร้าง script element
      const script = document.createElement("script")
      script.src = OMISE_SCRIPT_URL
      script.async = true

      // เมื่อ script load สำเร็จ
      script.onload = () => {
        if (window.Omise) {
          // Set public key ทันทีหลัง load
          window.Omise.setPublicKey(OMISE_PUBLIC_KEY)
          isReady.value = true
          resolve()
        } else {
          reject(
            new Error(
              "Payment form could not initialize. Please refresh the page and try again.",
            ),
          )
        }
      }

      // เมื่อ script load ไม่สำเร็จ
      script.onerror = () => {
        reject(
          new Error(
            "Could not load the card payment script. Check your connection, disable ad blockers, or try again.",
          ),
        )
      }

      // Append script to head
      document.head.appendChild(script)
    })
  }

  // --------------------------------------------------------------------------
  // Token Creation
  // --------------------------------------------------------------------------

  /**
   * สร้าง Omise Token จาก card info
   * 
   * Token เป็น single-use reference ไปยัง card data ที่เก็บใน Omise
   * ใช้ token แทน card info จริงเพื่อความปลอดภัย (PCI compliance)
   * 
   * @param cardInfo - Card information
   * @returns Promise<string> - Token ID (tokn_test_xxx)
   * @throws Error ถ้าสร้าง token ไม่สำเร็จ
   */
  const createToken = async (cardInfo: {
    name: string
    number: string
    expirationMonth: number
    expirationYear: number
    securityCode: string
  }): Promise<string> => {
    // ตรวจสอบว่า script พร้อมใช้งานหรือยัง
    if (!isReady.value) {
      await loadOmiseScript()
    }

    if (!OMISE_PUBLIC_KEY.trim()) {
      const msg =
        "Card payments are not configured on this environment (missing Omise public key)."
      error.value = msg
      return Promise.reject(new Error(msg))
    }

    isLoading.value = true
    error.value = null

    return new Promise((resolve, reject) => {
      // เรียก Omise.createToken
      window.Omise.createToken(
        "card",
        {
          name: cardInfo.name,
          number: cardInfo.number.replace(/\s/g, ""),  // ลบ space ออก
          expiration_month: cardInfo.expirationMonth,
          expiration_year: cardInfo.expirationYear,
          security_code: cardInfo.securityCode,
        },
        (statusCode, response) => {
          isLoading.value = false

          // Success: statusCode 200 และมี id
          if (statusCode === 200 && "id" in response) {
            resolve(response.id)
          } else {
            // Error
            const errorResponse = response as unknown as OmiseErrorResponse
            const errorMessage = errorResponse.message || "Failed to create token"
            error.value = errorMessage
            reject(new Error(errorMessage))
          }
        }
      )
    })
  }

  // --------------------------------------------------------------------------
  // Helper Functions
  // --------------------------------------------------------------------------

  /**
   * Parse expiry date จาก format MM/YY เป็น { month, year }
   * 
   * @param expiryDate - String format "MM/YY" (e.g., "12/25")
   * @returns { month: number, year: number } หรือ null ถ้า format ผิด
   */
  const parseExpiryDate = (expiryDate: string): { month: number; year: number } | null => {
    const match = expiryDate.match(/^(\d{2})\/(\d{2})$/)
    if (!match) return null

    const month = parseInt(match[1], 10)
    const year = 2000 + parseInt(match[2], 10)  // แปลง YY เป็น 20YY

    return { month, year }
  }

  /**
   * สร้าง Token จาก form data โดยตรง
   * 
   * Convenience function ที่รับ form data ตรงๆ จาก CheckoutView
   * แล้ว parse และเรียก createToken ให้อัตโนมัติ
   * 
   * @param formData - Form data จาก CheckoutView
   * @returns Promise<string> - Token ID
   * @throws Error ถ้า expiry date format ผิด หรือสร้าง token ไม่สำเร็จ
   * 
   * @example
   * ```typescript
   * const token = await createTokenFromForm({
   *   cardNumber: "4242 4242 4242 4242",
   *   nameOnCard: "John Doe",
   *   expiryDate: "12/25",
   *   cvv: "123"
   * })
   * ```
   */
  const createTokenFromForm = async (formData: {
    cardNumber: string
    nameOnCard: string
    expiryDate: string
    cvv: string
  }): Promise<string> => {
    // Parse expiry date
    const expiry = parseExpiryDate(formData.expiryDate)
    if (!expiry) {
      throw new Error("Invalid expiry date format")
    }

    // Create token
    return createToken({
      name: formData.nameOnCard,
      number: formData.cardNumber,
      expirationMonth: expiry.month,
      expirationYear: expiry.year,
      securityCode: formData.cvv,
    })
  }

  // --------------------------------------------------------------------------
  // Return
  // --------------------------------------------------------------------------

  return {
    // State
    isLoading,    // กำลังสร้าง token
    isReady,      // Script พร้อมใช้งาน
    error,        // Error message (ถ้ามี)

    // Methods
    loadOmiseScript,      // โหลด script manually (optional)
    createToken,          // สร้าง token จาก card info
    createTokenFromForm,  // สร้าง token จาก form data (recommended)
  }
}
