const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string;
const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string;

function assertCloudinaryEnv() {
  if (!cloudName?.trim()) {
    throw new Error("Missing VITE_CLOUDINARY_CLOUD_NAME");
  }
  if (!uploadPreset?.trim()) {
    throw new Error("Missing VITE_CLOUDINARY_UPLOAD_PRESET");
  }
}

/**
 * Upload a video file to Cloudinary and return the hosted URL.
 *
 * @param file Video file from input
 * @param folder Cloudinary folder path, e.g. courses/{courseId}/trailer
 * @returns secure_url
 */
export async function uploadVideoToCloudinary(
  file: File,
  folder: string,
): Promise<string> {
  assertCloudinaryEnv();

  const targetFolder = folder.trim();
  if (!targetFolder) {
    throw new Error("Cloudinary folder is required");
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", uploadPreset);
  formData.append("folder", targetFolder);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/video/upload`,
    {
      method: "POST",
      body: formData,
    },
  );

  const payload = await response.json();
  if (!response.ok) {
    const message =
      payload?.error?.message ?? "Cloudinary video upload failed";
    throw new Error(message);
  }

  const secureUrl = payload?.secure_url as string | undefined;
  if (!secureUrl) {
    throw new Error("Cloudinary response missing secure_url");
  }

  return secureUrl;
}
