import axios from "axios"

/**
 * แปลง error จาก axios / backend เป็นข้อความและสัญญาณที่ UI หรือ composable ใช้ต่อได้
 *
 * หน้าที่หลัก:
 * - อ่าน body รูปแบบ `ApiErrorResponse` จาก Spring (`message`, `code`, `status`, …)
 * - แยกเคสเครือข่าย (ไม่มี response) ออกจาก error ที่มีข้อความจาก API
 * - คืนข้อความให้ผู้ใช้ (`getUserFacingApiMessage`) และเช็กเคสพิเศษ เช่น order หมดอายุ (`isOrderExpiredApiError`)
 *
 * ตอนนี้ถูก import จาก `usePayment` (flow checkout / order / promo / ชำระเงิน) เป็นหลัก
 * — ไฟล์นี้ไม่ผูกกับ payment โดยเฉพาะ; API อื่นที่ใช้ axios กับ backend เดียวกันสามารถ reuse ได้
 *
 * หมายเหตุ: การ redirect เมื่อ 401 อยู่ที่ `lib/api.ts` (interceptor) ไม่ได้อยู่ในไฟล์นี้
 */

/**
 * รูปแบบ body จาก backend `ApiErrorResponse` (GlobalExceptionHandler)
 */
export type ApiErrorBody = {
  timestamp?: string
  status?: number
  code?: string
  message?: string
  path?: string
}

export function getApiErrorBody(data: unknown): ApiErrorBody | null {
  if (!data || typeof data !== "object") return null
  const o = data as Record<string, unknown>
  return {
    timestamp: typeof o.timestamp === "string" ? o.timestamp : undefined,
    status: typeof o.status === "number" ? o.status : undefined,
    code: typeof o.code === "string" ? o.code : undefined,
    message: typeof o.message === "string" ? o.message : undefined,
    path: typeof o.path === "string" ? o.path : undefined,
  }
}

export function getHttpStatus(err: unknown): number | undefined {
  if (axios.isAxiosError(err)) {
    return err.response?.status
  }
  return undefined
}

/** ไม่มี response (offline, CORS, server down, DNS) */
export function isNetworkOrUnreachableError(err: unknown): boolean {
  if (axios.isAxiosError(err) && !err.response) {
    return true
  }
  if (err instanceof TypeError && err.message === "Failed to fetch") {
    return true
  }
  return false
}

const NETWORK_USER_MESSAGE =
  "We could not reach the server. Check your internet connection and try again."

/** ข้อความจาก `response.data.message` หรือ fallback (รวมเคส network) */
export function getApiErrorMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  if (isNetworkOrUnreachableError(err)) {
    return NETWORK_USER_MESSAGE
  }

  if (axios.isAxiosError(err)) {
    const body = getApiErrorBody(err.response?.data)
    if (body?.message && body.message.trim() !== "") {
      return body.message
    }
    const m = err.message
    if (m && m !== "Network Error") {
      return m
    }
    return fallback
  }

  if (err instanceof Error && err.message) {
    return err.message
  }

  return fallback
}

const CODE_FALLBACK: Record<string, string> = {
  DUPLICATE_ENTRY: "This record already exists. Please refresh and try again.",
}

// ใช้เป็น machine-readable contract ถ้า backend ส่ง code มาด้วย
export const ORDER_EXPIRED_BACKEND_CODE = "ORDER_EXPIRED"

/**
 * ข้อความให้ผู้ใช้ — ใช้ message จาก API เป็นหลัก; ถ้าไม่มีแต่มี code ที่รู้จัก ใช้คำอธิบายสั้นๆ
 */
export function getUserFacingApiMessage(
  err: unknown,
  fallback = "Something went wrong. Please try again.",
): string {
  const msg = getApiErrorMessage(err, fallback)
  if (axios.isAxiosError(err)) {
    const body = getApiErrorBody(err.response?.data)
    if (
      body?.code &&
      CODE_FALLBACK[body.code] &&
      (!body.message || body.message.trim() === "")
    ) {
      return CODE_FALLBACK[body.code]
    }
  }
  return msg
}

/** ตรงกับข้อความ error เดิมจาก backend; คงไว้เป็น fallback เพื่อ backward compatibility */
export const ORDER_EXPIRED_BACKEND_MESSAGE = "Order has expired"

export function isOrderExpiredApiError(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false
  const body = getApiErrorBody(err.response?.data)
  if (body?.code === ORDER_EXPIRED_BACKEND_CODE) {
    return true
  }
  const msg = body?.message?.trim() ?? ""
  if (!msg) return false
  return (
    msg === ORDER_EXPIRED_BACKEND_MESSAGE ||
    msg.toLowerCase().includes("order has expired")
  )
}
