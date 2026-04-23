<script setup lang="ts">
import { computed, onMounted, ref, watch } from "vue";
import { onBeforeRouteLeave, useRoute, useRouter } from "vue-router";
import type { NavigationGuardNext } from "vue-router";
import CustomInput from "@/components/base/input/CustomInput.vue";
import NumberInput from "@/components/base/input/NumberInput.vue";
import AttachFileInput from "@/components/base/input/AttachFileInput.vue";
import MediaInput from "@/components/base/input/MediaInput.vue";
import PromoCard from "@/components/admin/PromoCard.vue";
import LessonTable from "@/components/admin/LessonTable.vue";
import Modal from "@/components/base/modal/Modal.vue";
import SubmitProgressOverlay from "@/components/base/SubmitProgressOverlay.vue";
import { Textarea } from "@/components/ui/textarea";
import { appToast } from "@/components/base/toast";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-vue-next";
import { api } from "@/lib/api";
import {
  uploadAttachFile,
  uploadCoverImage,
  uploadSubLessonImage,
  uploadVideoToCloudinary,
} from "@/lib/upload-api";
import type { DraftSubLesson } from "@/views/admin/course-create.state";
import {
  courseDraftState,
  deleteDraftLesson,
  resetCourseDraft,
  toLessonTableItems,
} from "@/views/admin/course-create.state";

const textareaBaseClass = cn(
  "w-full resize-y rounded-[10px] border border-gray-300 bg-white px-4 py-3",
  "text-body2 text-gray-900 placeholder:text-gray-500 shadow-none",
  "transition-all duration-200 outline-none",
  "focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20",
);

const route = useRoute();
const router = useRouter();
const courseId = route.params.courseId as string;

const courseNameError = ref(false);
const courseNameErrorMessage = ref("");
const showCancelModal = ref(false);
const showStatusModal = ref(false);
const isSubmitting = ref(false);
const isLoading = ref(true);
const loadError = ref(false);
let skipLeaveGuard = false;
let guardNext: NavigationGuardNext | null = null;
/** JSON snapshot after load; leave without modal when unchanged */
let baselineSnapshot = "";

function buildCourseEditSnapshot(): string {
  const s = courseDraftState;
  const modules = s.lessons.map((lesson) => ({
    name: lesson.name.trim(),
    subLessons: lesson.subLessons.map((sub) => ({
      name: sub.name.trim(),
      fileType: sub.fileType,
      detail: sub.detail.trim(),
      uploadedUrl: sub.uploadedUrl ?? null,
    })),
  }));
  return JSON.stringify({
    courseStorageFolderId: s.courseStorageFolderId,
    courseName: s.courseName.trim(),
    coursePrice: s.coursePrice.trim(),
    totalLearningTime: s.totalLearningTime.trim(),
    courseSummary: s.courseSummary.trim(),
    courseDetail: s.courseDetail.trim(),
    coverImageUrl: s.coverImageUrl ?? null,
    hasCoverFile: s.coverImageFile !== null,
    hasTrailerFile: s.trailerVideoFile !== null,
    hasAttachFile: s.attachmentFile !== null,
    promoEnabled: s.promoEnabled,
    promoCode: s.promoCode.trim(),
    promoMinPurchase: s.promoMinPurchase.trim(),
    promoDiscountType: s.promoDiscountType,
    promoDiscountThb: s.promoDiscountThb.trim(),
    promoDiscountPercent: s.promoDiscountPercent.trim(),
    promoValidFrom: s.promoValidFrom.trim(),
    promoValidUntil: s.promoValidUntil.trim(),
    modules,
  });
}

// persisted across lesson sub-navigations (not reset on early-return)
const originalCourseName = ref(localStorage.getItem(`edit_originalName_${route.params.courseId}`) ?? "");
const existingCoverImageUrl = ref<string | null>(localStorage.getItem(`edit_coverUrl_${route.params.courseId}`) ?? null);
const existingTrailerVideoUrl = ref<string | null>(localStorage.getItem(`edit_trailerUrl_${route.params.courseId}`) ?? null);
const existingAttachmentUrl = ref<string | null>(localStorage.getItem(`edit_attachUrl_${route.params.courseId}`) ?? null);

const courseEditFlowRoutes = new Set([
  "admin-course-edit",
  "admin-course-create-lesson",
  "admin-course-create-lesson-edit",
]);

const lessons = computed(() => toLessonTableItems(courseDraftState.lessons));

watch(
  () => courseDraftState.courseName,
  (value) => {
    if (value.trim()) {
      courseNameError.value = false;
      courseNameErrorMessage.value = "";
    }
  },
);

onBeforeRouteLeave((to, _from, next) => {
  if (skipLeaveGuard) {
    next();
    return;
  }
  const targetRouteName = typeof to.name === "string" ? to.name : "";
  if (courseEditFlowRoutes.has(targetRouteName)) {
    next();
    return;
  }
  if (
    baselineSnapshot &&
    buildCourseEditSnapshot() === baselineSnapshot
  ) {
    next();
    return;
  }
  guardNext = next;
  showCancelModal.value = true;
});

function clearEditCache() {
  localStorage.removeItem(`edit_originalName_${courseId}`);
  localStorage.removeItem(`edit_coverUrl_${courseId}`);
  localStorage.removeItem(`edit_trailerUrl_${courseId}`);
  localStorage.removeItem(`edit_attachUrl_${courseId}`);
}

function confirmCancel() {
  showCancelModal.value = false;
  resetCourseDraft();
  clearEditCache();
  guardNext?.();
  guardNext = null;
}

function keepEditing() {
  showCancelModal.value = false;
  guardNext?.(false);
  guardNext = null;
}

function scrollToError(selector: string) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function loadCourse() {
  // ถ้า state มีข้อมูลอยู่แล้ว (เช่น กลับมาจากหน้า lesson create/edit)
  // ไม่ต้องโหลดจาก backend ซ้ำ ป้องกันการทับ draft ปัจจุบัน
  if (
    courseDraftState.courseName.trim() ||
    courseDraftState.lessons.length > 0
  ) {
    isLoading.value = false;
    loadError.value = false;
    if (!baselineSnapshot) {
      baselineSnapshot = buildCourseEditSnapshot();
    }
    return;
  }

  isLoading.value = true;
  loadError.value = false;
  try {
    const { data } = await api.get(`/api/admin/courses/${courseId}`);

    resetCourseDraft();

    courseDraftState.courseName = data.title ?? "";
    courseDraftState.coursePrice = data.price != null ? String(data.price) : "";
    courseDraftState.totalLearningTime =
      data.totalLearningTime != null ? String(data.totalLearningTime) : "";
    courseDraftState.courseSummary = data.description ?? "";
    courseDraftState.courseDetail = data.detail ?? "";
    courseDraftState.coverImageUrl = data.coverImageUrl ?? null;

    originalCourseName.value = data.title ?? "";
    existingCoverImageUrl.value = data.coverImageUrl ?? null;
    existingTrailerVideoUrl.value = data.trailerVideoUrl ?? null;
    existingAttachmentUrl.value = data.attachmentUrl ?? null;

    // persist so these survive sub-navigation (LessonCreate / LessonEdit) without refetch
    localStorage.setItem(`edit_originalName_${courseId}`, originalCourseName.value);
    if (existingCoverImageUrl.value) localStorage.setItem(`edit_coverUrl_${courseId}`, existingCoverImageUrl.value);
    if (existingTrailerVideoUrl.value) localStorage.setItem(`edit_trailerUrl_${courseId}`, existingTrailerVideoUrl.value);
    if (existingAttachmentUrl.value) localStorage.setItem(`edit_attachUrl_${courseId}`, existingAttachmentUrl.value);

    let nextSubId = 1;
    (data.modules ?? []).forEach((module: any, idx: number) => {
      const subLessons: DraftSubLesson[] = (module.subLessons ?? []).map(
        (sub: any) => ({
          id: nextSubId++,
          name: sub.title ?? "",
          videoFile: null,
          fileType: (sub.fileType ?? "VIDEO") as "VIDEO" | "IMAGE",
          detail: sub.detail ?? "",
          uploadedUrl: sub.fileUrl ?? null,
        }),
      );
      courseDraftState.lessons.push({
        id: idx + 1,
        name: module.title ?? "",
        subLessons,
      });
    });
    courseDraftState.nextLessonId = (data.modules?.length ?? 0) + 1;
    courseDraftState.nextSubLessonId = nextSubId;

    baselineSnapshot = buildCourseEditSnapshot();
  } catch {
    loadError.value = true;
  } finally {
    isLoading.value = false;
  }
}

onMounted(loadCourse);

function goToAddLesson() {
  if (!courseDraftState.courseName.trim()) {
    courseNameError.value = true;
    courseNameErrorMessage.value =
      "Please enter the course name before adding a lesson.";
    scrollToError("#course-name-field");
    appToast.error(
      "Course name is required",
      "Please enter the course name before adding a lesson.",
    );
    return;
  }
  router.push({
    name: "admin-course-create-lesson",
    query: { courseId },
  });
}

function goToEditLesson(lessonId: number) {
  router.push({
    name: "admin-course-create-lesson-edit",
    params: { lessonId },
    query: { courseId },
  });
}

function handleDeleteLesson(lessonId: number) {
  deleteDraftLesson(lessonId);
}

function validatePayload() {
  if (!courseDraftState.courseName.trim()) {
    courseNameError.value = true;
    courseNameErrorMessage.value = "Please enter the course name.";
    scrollToError("#course-name-field");
    appToast.error("Course name is required", "Please enter the course name.");
    return false;
  }

  const totalLearningStr = String(
    courseDraftState.totalLearningTime ?? "",
  ).trim();
  if (!totalLearningStr || !Number.isFinite(Number(totalLearningStr))) {
    appToast.error(
      "Total learning time is required",
      "Please enter total learning time in hours.",
    );
    return false;
  }
  if (Number(totalLearningStr) < 1) {
    appToast.error(
      "Total learning time",
      "Enter at least 1 hour.",
    );
    return false;
  }

  if (!courseDraftState.courseSummary.trim()) {
    appToast.error(
      "Course summary is required",
      "Please enter a short summary of the course.",
    );
    return false;
  }

  if (!courseDraftState.courseDetail.trim()) {
    appToast.error(
      "Course detail is required",
      "Please enter the full course detail.",
    );
    return false;
  }

  const seen = new Set<string>();
  for (const lesson of courseDraftState.lessons) {
    const key = lesson.name.trim().toLowerCase();
    if (seen.has(key)) {
      appToast.error(
        "Lesson name already exists",
        "Lesson names must be unique within a course.",
      );
      return false;
    }
    seen.add(key);
  }

  return true;
}

type SaveStatus = "DRAFT" | "PUBLISHED";

async function submitUpdateCourse(status: SaveStatus) {
  if (isSubmitting.value) return;

  isSubmitting.value = true;
  try {
    const folderId = courseDraftState.courseStorageFolderId;

    // Keep existing URLs unless user uploads a new file
    let coverImageUrl = existingCoverImageUrl.value;
    if (courseDraftState.coverImageFile) {
      coverImageUrl = await uploadCoverImage(
        courseDraftState.coverImageFile,
        folderId,
      );
    }

    let attachmentUrl = existingAttachmentUrl.value;
    if (courseDraftState.attachmentFile) {
      attachmentUrl = await uploadAttachFile(
        courseDraftState.attachmentFile,
        folderId,
      );
    }

    let trailerVideoUrl = existingTrailerVideoUrl.value;
    if (courseDraftState.trailerVideoFile) {
      trailerVideoUrl = await uploadVideoToCloudinary(
        courseDraftState.trailerVideoFile,
        `courses/${folderId}/trailer`,
      );
    }

    const modules = await Promise.all(
      courseDraftState.lessons.map(async (lesson) => ({
        title: lesson.name.trim(),
        subLessons: await Promise.all(
          lesson.subLessons.map(async (sub) => {
            let mediaUrl: string | null = sub.uploadedUrl ?? null;
            if (sub.fileType === "IMAGE" && sub.videoFile) {
              mediaUrl = await uploadSubLessonImage(
                sub.videoFile,
                lesson.id,
                sub.id,
                folderId,
              );
            } else if (sub.fileType === "VIDEO" && sub.videoFile) {
              mediaUrl = await uploadVideoToCloudinary(
                sub.videoFile,
                `courses/${folderId}/lesson/${lesson.id}/sublesson/${sub.id}`,
              );
            }
            return {
              title: sub.name.trim(),
              fileType: sub.fileType,
              detail: sub.detail.trim(),
              mediaUrl,
            };
          }),
        ),
      })),
    );

    const priceNumber = courseDraftState.coursePrice
      ? Number(courseDraftState.coursePrice)
      : 0;
    const totalLearningTimeNumber = Number(
      courseDraftState.totalLearningTime || "0",
    );

    const isPct = courseDraftState.promoDiscountType === "%";
    const discountValueStr = isPct
      ? courseDraftState.promoDiscountPercent
      : courseDraftState.promoDiscountThb;
    const promoCode =
      courseDraftState.promoEnabled && courseDraftState.promoCode.trim()
        ? {
            code: courseDraftState.promoCode.trim(),
            discountType: isPct ? "PERCENTAGE" : "FIXED_AMOUNT",
            discountValue: discountValueStr
              ? Number(discountValueStr)
              : 0,
            validFrom: courseDraftState.promoValidFrom || null,
            validUntil: courseDraftState.promoValidUntil || null,
          }
        : null;

    const payload = {
      title: courseDraftState.courseName.trim(),
      description: courseDraftState.courseSummary.trim(),
      detail: courseDraftState.courseDetail.trim(),
      price: priceNumber,
      totalLearningTime: totalLearningTimeNumber,
      coverImageUrl,
      trailerVideoUrl,
      attachmentUrl,
      status,
      promoCode,
      modules,
    };

    await api.put(`/api/admin/courses/${courseId}`, payload);

    appToast.success(
      "Course updated",
      "The course has been updated successfully.",
    );
    skipLeaveGuard = true;
    resetCourseDraft();
    clearEditCache();
    router.push({ name: "admin-course" });
  } catch (error: any) {
    const message =
      error?.response?.data?.message ??
      "Failed to update course. Please try again.";
    appToast.error("Update course failed", message);
  } finally {
    isSubmitting.value = false;
  }
}

function handleSaveClick() {
  if (isSubmitting.value) return;
  if (!validatePayload()) return;
  showStatusModal.value = true;
}

function handleUpdateAsDraft() {
  showStatusModal.value = false;
  void submitUpdateCourse("DRAFT");
}

function handleUpdateAsPublic() {
  showStatusModal.value = false;
  void submitUpdateCourse("PUBLISHED");
}
</script>

<template>
  <section class="flex min-h-screen flex-col bg-gray-100">
    <!-- Loading state -->
    <div
      v-if="isLoading"
      class="flex min-h-screen items-center justify-center text-body3 text-gray-500"
    >
      Loading course...
    </div>

    <!-- Error state -->
    <div
      v-else-if="loadError"
      class="flex min-h-screen items-center justify-center text-body3 text-gray-500"
    >
      Failed to load course.
    </div>

    <!-- Edit form -->
    <template v-else>
      <div
        class="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-6 border-b border-gray-200 bg-white px-8 h-[92px]"
      >
        <div class="flex min-w-0 flex-1 items-center gap-4">
          <button
            type="button"
            class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-600 transition-colors hover:bg-gray-100"
            aria-label="Back to course list"
            @click="router.push({ name: 'admin-course' })"
          >
            <ArrowLeft :size="22" stroke-width="2" />
          </button>
          <div class="flex min-w-0 flex-col">
            <p class="text-headline3 text-gray-600">
              Course
              <span class="font-medium text-black">
                '{{ originalCourseName || courseDraftState.courseName || "Untitled Course" }}'
              </span>
            </p>
           
          </div>
        </div>

        <div class="flex shrink-0 items-center gap-3">
          <button
            type="button"
            class="h-15 w-[119px] min-w-[100px] rounded-xl border-2 border-orange-500 bg-white px-6 text-[16px] font-semibold text-orange-500 transition-colors hover:bg-orange-50 active:bg-orange-100"
            @click="router.push({ name: 'admin-course' })"
          >
            Cancel
          </button>
          <button
            type="button"
            class="h-15 w-[95px] min-w-[100px] rounded-xl bg-blue-500 px-6 text-[16px] font-bold text-white transition-colors hover:bg-blue-400 active:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
            :disabled="isSubmitting"
            @click="handleSaveClick"
          >
            Save
          </button>
        </div>
      </div>

      <div class="min-h-0 flex-1 overflow-y-auto px-10 pt-10">
        <div class="mx-auto flex h-fit w-full max-w-[1920px] flex-1 rounded-2xl bg-white">
          <div
            class="mx-auto flex h-fit w-full flex-col gap-10 px-8 pb-10 pt-10 sm:px-12 lg:px-25"
          >
            <div id="course-name-field">
              <CustomInput
                v-model="courseDraftState.courseName"
                label="Course name"
                placeholder="e.g. Service Design Essentials"
                :error="courseNameError"
                :error-message="courseNameErrorMessage"
              />
            </div>

            <div
              class="flex w-full flex-col gap-6 md:flex-row md:items-start md:gap-10"
            >
              <NumberInput
                v-model="courseDraftState.coursePrice"
                class="min-w-0 flex-1"
                label="Price *"
                placeholder="0.00"
                supporting-text="Please enter numbers only"
                :step="1"
                :min="0"
              />
              <NumberInput
                v-model="courseDraftState.totalLearningTime"
                class="min-w-0 flex-1"
                label="Total learning time *"
                placeholder="e.g. 6"
                supporting-text="Please enter numbers only"
                :step="1"
                :min="0"
              />
            </div>

            

            <div class="flex w-full flex-col gap-1">
              <label
                for="course-summary"
                class="text-body3 font-medium text-gray-800"
              >
                Course summary
                <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <Textarea
                id="course-summary"
                v-model="courseDraftState.courseSummary"
                required
                placeholder="Place Holder"
                :class="cn(textareaBaseClass, 'min-h-[100px]')"
                aria-required="true"
              />
            </div>

            <div class="flex w-full flex-col gap-1">
              <label
                for="course-detail"
                class="text-body3 font-medium text-gray-800"
              >
                Course detail
                <span class="text-red-500" aria-hidden="true">*</span>
              </label>
              <Textarea
                id="course-detail"
                v-model="courseDraftState.courseDetail"
                required
                placeholder="Place Holder"
                :class="cn(textareaBaseClass, 'min-h-[220px]')"
                aria-required="true"
              />
            </div>

            <MediaInput
              v-model="courseDraftState.coverImageFile"
              :existing-url="existingCoverImageUrl ?? undefined"
              title="Cover image *"
              subtitle="Supported file types: .jpg, .png, .jpeg. Max file size: 5 MB"
              uploadtext="Upload Image"
              class="w-[240px] h-[240px]"
              accept="image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png"
            />

            <MediaInput
              v-model="courseDraftState.trailerVideoFile"
              :existing-url="existingTrailerVideoUrl ?? undefined"
              title="Video trailer *"
              subtitle="Supported file types: .mp4, .mov, .avi. Max file size: 20 MB"
              uploadtext="Upload Video"
              class="w-[240px] h-[240px]"
              accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
            />

            <AttachFileInput
              v-model="courseDraftState.attachmentFile"
              :existing-url="existingAttachmentUrl ?? undefined"
              title="Attach File (Optional)"
              subtitle="Supported file types: .pdf, .doc, .docx. Max file size: 50 MB"
              uploadtext="Upload file"
            />
          </div>
        </div>

        <div class="py-15 space-y-6">
          <div class="flex items-center justify-between">
            <h1 class="text-headline3 text-gray-900">Lesson</h1>
            <button
              type="button"
              class="h-15 w-fit min-w-[120px] rounded-xl bg-blue-500 px-6 text-[16px] font-bold text-white transition-colors hover:bg-blue-400 active:bg-blue-700"
              @click="goToAddLesson"
            >
              + Add Lesson
            </button>
          </div>

          <LessonTable
            :lessons="lessons"
            @edit="goToEditLesson"
            @delete="handleDeleteLesson"
          />
        </div>
      </div>
    </template>
  </section>

  <SubmitProgressOverlay
    :visible="isSubmitting"
    title="Saving course"
    description="Uploading files and updating your course. This may take a moment."
  />

  <Modal
    v-model:open="showCancelModal"
    title="Cancel Editing"
    message="Are you sure you want to cancel? All unsaved changes will be lost."
    left-text="Keep editing"
    right-text="Yes, cancel"
    type="secondary"
    @left-click="keepEditing"
    @right-click="confirmCancel"
  />

  <Modal
    v-model:open="showStatusModal"
    title="Select course status"
    message="Choose whether to save as draft or publish this course."
    left-text="Draft"
    right-text="Public"
    type="secondary"
    @left-click="handleUpdateAsDraft"
    @right-click="handleUpdateAsPublic"
  />
</template>
