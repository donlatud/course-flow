import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

const BUCKET_IMAGE = "course_image";
const BUCKET_FILE = "course_file";

/**
 * Layout:
 *
 * course_image/{courseId}/cover_image/...          ← course cover
 * course_image/{courseId}/lesson/{lessonId}/sublesson/{sublessonId}/...  ← sub-lesson IMAGE
 *
 * course_file/{courseId}/file/...                  ← course attachment
 * course_file/{courseId}/lesson/{lessonId}/sublesson/{sublessonId}/...   ← sub-lesson VIDEO
 *
 * Note: videos (trailer, sub-lesson VIDEO) are NOT uploaded to Storage.
 */
function buildPath(courseFolderId: string, ...segments: string[]): string {
  const safe = courseFolderId.trim();
  if (!safe) throw new Error("courseFolderId is required");
  return [safe, ...segments].join("/");
}

async function uploadToBucket(
  bucket: string,
  path: string,
  file: File,
): Promise<string> {
  const { data, error } = await supabase.storage
    .from(bucket)
    .upload(path, file, { upsert: false, contentType: file.type || undefined });
  if (error) throw error;
  return supabase.storage.from(bucket).getPublicUrl(data.path).data.publicUrl;
}

/** Course cover image → course_image/{courseId}/cover_image/ */
export async function uploadCoverImage(
  file: File,
  courseFolderId: string,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = buildPath(
    courseFolderId,
    "cover_image",
    `${crypto.randomUUID()}.${ext}`,
  );
  return uploadToBucket(BUCKET_IMAGE, path, file);
}

/** Course attachment file → course_file/{courseId}/file/ */
export async function uploadAttachFile(
  file: File,
  courseFolderId: string,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "bin";
  const path = buildPath(
    courseFolderId,
    "file",
    `${crypto.randomUUID()}.${ext}`,
  );
  return uploadToBucket(BUCKET_FILE, path, file);
}

/**
 * Sub-lesson media (IMAGE only):
 * IMAGE → course_image/{courseId}/lesson/{lessonId}/sublesson/{sublessonId}/
 * VIDEO → not uploaded to Storage (skip)
 */
export async function uploadSubLessonImage(
  file: File,
  lessonId: number,
  subLessonId: number,
  courseFolderId: string,
): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = buildPath(
    courseFolderId,
    "lesson",
    String(lessonId),
    "sublesson",
    String(subLessonId),
    `${crypto.randomUUID()}.${ext}`,
  );
  return uploadToBucket(BUCKET_IMAGE, path, file);
}
