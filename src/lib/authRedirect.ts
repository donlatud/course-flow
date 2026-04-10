/**
 * ช่วยตรวจค่า path ที่จะใช้หลัง login สำเร็จ (เช่น จาก query ?redirect=/courses/...)
 *
 * ทำไมต้องมี:
 * - หน้า login รับค่า redirect จาก URL ได้ ถ้าไม่กรอง ผู้ไม่หวังดีอาจส่งลิงก์ไปเว็บอื่น (open redirect)
 * - อนุญาตเฉพาะ path ภายในแอป: ขึ้นต้นด้วย "/" ไม่ใช่ "//" และไม่มี scheme เช่น https://
 *
 * คืนค่า path ที่ปลอดภัย หรือ null ถ้าไม่ควรใช้ (ให้ fallback ไปหน้าแรกแทน)
 */
export function sanitizeInternalRedirect(raw: unknown): string | null {
  // Vue Router บางครั้งส่ง query เป็น array
  if (Array.isArray(raw)) return sanitizeInternalRedirect(raw[0])
  if (typeof raw !== "string") return null
  const t = raw.trim()
  if (!t) return null
  try {
    const decoded = decodeURIComponent(t)
    if (!decoded.startsWith("/") || decoded.startsWith("//")) return null
    if (decoded.includes("://")) return null
    return decoded
  } catch {
    return null
  }
}
