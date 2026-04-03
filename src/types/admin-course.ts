/** Row shape for the admin course list table (mapped from GET /api/admin/courses). */
export interface CourseItem {
  id: string;
  name: string;
  lessons: string;
  price: string;
  createdAt: string;
  updatedAt: string;
  image: string;
}
