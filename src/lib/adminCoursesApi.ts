/**
 * Normalizes GET /api/admin/courses responses:
 * - Spring Data {@code Page}: {@code { content: T[], totalElements, ... }}
 * - Plain JSON array (legacy / proxy): {@code T[]}
 */
export function extractCourseRowsFromAdminListPayload(raw: unknown): unknown[] {
  if (Array.isArray(raw)) {
    return raw;
  }
  if (raw && typeof raw === "object" && "content" in raw) {
    const content = (raw as { content?: unknown }).content;
    return Array.isArray(content) ? content : [];
  }
  return [];
}
