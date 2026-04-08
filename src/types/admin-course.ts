/** Course lifecycle on the server (`Course.Status`). */
export type CourseStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

/** Sortable columns for GET /api/admin/courses (matches backend `sortBy`). */
export type CourseSortKey =
  | "title"
  | "status"
  | "lessonCount"
  | "price"
  | "createdAt"
  | "updatedAt";

export type CourseSortDir = "asc" | "desc";

/** Row shape for the admin course list table (mapped from GET /api/admin/courses). */
export interface CourseItem {
  id: string;
  name: string;
  lessons: string;
  price: string;
  /** Display label for the status column. */
  statusLabel: string;
  status: CourseStatus;
  createdAt: string;
  updatedAt: string;
  image: string;
}
