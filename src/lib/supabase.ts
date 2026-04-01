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
 *
 * Note: videos (trailer, sub-lesson VIDEO) are uploaded to Cloudinary.
 */
function getFileExtension(file: File, fallback = "bin"): string {
  return file.name.split(".").pop()?.toLowerCase() ?? fallback;
}

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
  const ext = getFileExtension(file, "jpg");
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
  const ext = getFileExtension(file);
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
 */
export async function uploadSubLessonImage(
  file: File,
  lessonId: number,
  subLessonId: number,
  courseFolderId: string,
): Promise<string> {
  const ext = getFileExtension(file, "jpg");
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
