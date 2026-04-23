import type { AxiosRequestConfig } from "axios";
import { api } from "@/lib/api";

export interface UploadUrlResponse {
  url: string;
  provider: string;
}

/** Ensures FormData gets multipart boundary (axios default is application/json). */
const multipartConfig: AxiosRequestConfig = {
  transformRequest: [
    (data, headers) => {
      if (data instanceof FormData) {
        const h = headers as Record<string, unknown>;
        delete h["Content-Type"];
        delete h["content-type"];
      }
      return data;
    },
  ],
};

export async function uploadCoverImage(
  file: File,
  courseFolderId: string,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("courseFolderId", courseFolderId);
  form.append("kind", "COVER");
  const { data } = await api.post<UploadUrlResponse>(
    "/api/admin/uploads/images",
    form,
    multipartConfig,
  );
  return data.url;
}

export async function uploadAttachFile(
  file: File,
  courseFolderId: string,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("courseFolderId", courseFolderId);
  const { data } = await api.post<UploadUrlResponse>(
    "/api/admin/uploads/files",
    form,
    multipartConfig,
  );
  return data.url;
}

export async function uploadSubLessonImage(
  file: File,
  lessonId: number,
  subLessonId: number,
  courseFolderId: string,
): Promise<string> {
  const form = new FormData();
  form.append("file", file);
  form.append("courseFolderId", courseFolderId);
  form.append("kind", "SUBLESSON");
  form.append("lessonId", String(lessonId));
  form.append("subLessonId", String(subLessonId));
  const { data } = await api.post<UploadUrlResponse>(
    "/api/admin/uploads/images",
    form,
    multipartConfig,
  );
  return data.url;
}

/**
 * Same signature as the old Cloudinary helper: {@code folder} is e.g.
 * {@code courses/{courseFolderId}/trailer} or
 * {@code courses/{courseFolderId}/lesson/{lessonId}/sublesson/{subLessonId}}.
 */
export async function uploadVideoToCloudinary(
  file: File,
  folder: string,
): Promise<string> {
  const segments = folder.split("/").filter((s) => s.length > 0);
  if (segments[0] !== "courses" || segments.length < 3) {
    throw new Error(`Invalid video folder path: ${folder}`);
  }
  const courseFolderId = segments[1]!;
  const form = new FormData();
  form.append("file", file);
  form.append("courseFolderId", courseFolderId);

  if (segments[2] === "trailer") {
    form.append("kind", "TRAILER");
  } else if (
    segments[2] === "lesson"
    && segments[4] === "sublesson"
    && segments[3] !== undefined
    && segments[5] !== undefined
  ) {
    form.append("kind", "SUBLESSON");
    form.append("lessonId", segments[3]);
    form.append("subLessonId", segments[5]);
  } else {
    throw new Error(`Invalid video folder path: ${folder}`);
  }

  const { data } = await api.post<UploadUrlResponse>(
    "/api/admin/uploads/videos",
    form,
    multipartConfig,
  );
  return data.url;
}
