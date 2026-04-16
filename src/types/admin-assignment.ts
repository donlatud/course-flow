/** Assignment lifecycle on the server (`Assignment.Status`). */
export type AssignmentStatus = "DRAFT" | "ACTIVE" | "INACTIVE";

/** Sortable columns for GET /api/admin/assignments (matches backend `sortBy`). */
export type AssignmentSortKey =
  | "title"
  | "courseName"
  | "moduleName"
  | "subLessonName"
  | "dueDate"
  | "status"
  | "createdAt"
  | "updatedAt";

export type AssignmentSortDir = "asc" | "desc";

/** Row shape for the admin assignment list table (mapped from GET /api/admin/assignments). */
export interface AssignmentItem {
  id: string;
  title: string;
  description: string | null;
  courseName: string;
  moduleName: string;
  subLessonName: string;
  dueDate: string;
  /** Display label for the status column. */
  statusLabel: string;
  status: AssignmentStatus;
  createdAt: string;
  updatedAt: string;
}
