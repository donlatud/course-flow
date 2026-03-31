<script setup lang="ts">
import { computed, ref, watch } from "vue";
import axios from "axios";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import type { NavigationGuardNext } from "vue-router";
import CustomInput from "@/components/base/input/CustomInput.vue";
import NumberInput from "@/components/base/input/NumberInput.vue";
import AttachFileInput from "@/components/base/input/AttachFileInput.vue";
import MediaInput from "@/components/base/input/MediaInput.vue";
import PromoCard from "@/components/admin/PromoCard.vue";
import LessonTable from "@/components/admin/LessonTable.vue";
import Modal from "@/components/base/modal/Modal.vue";
import { Textarea } from "@/components/ui/textarea";
import { appToast } from "@/components/base/toast";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-vue-next";
import {
  courseDraftState,
  isCourseDraftEmpty,
  resetCourseDraft,
  toLessonTableItems,
} from "@/views/admin/course-create.state";

const textareaBaseClass = cn(
  "w-full resize-y rounded-[10px] border border-gray-300 bg-white px-4 py-3",
  "text-body2 text-gray-900 placeholder:text-gray-500 shadow-none",
  "transition-all duration-200 outline-none",
  "focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20"
);

const router = useRouter();
const courseNameError = ref(false);
const showCancelModal = ref(false);
const isSubmitting = ref(false);
let guardNext: NavigationGuardNext | null = null;
const courseCreateFlowRoutes = new Set([
  "admin-course-create",
  "admin-course-create-lesson",
]);

const lessons = computed(() => toLessonTableItems(courseDraftState.lessons));

watch(
  () => courseDraftState.courseName,
  (value) => {
    if (value.trim()) {
      courseNameError.value = false;
    }
  },
);

onBeforeRouteLeave((to, _from, next) => {
  const targetRouteName = typeof to.name === "string" ? to.name : "";
  if (courseCreateFlowRoutes.has(targetRouteName)) {
    next();
    return;
  }

  if (isCourseDraftEmpty()) {
    next();
    return;
  }

  guardNext = next;
  showCancelModal.value = true;
});

function confirmCancel() {
  showCancelModal.value = false;
  resetCourseDraft();
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

function goToAddLesson() {
  if (!courseDraftState.courseName.trim()) {
    courseNameError.value = true;
    scrollToError("#course-name-field");
    appToast.error(
      "Course name is required",
      "Please enter the course name before adding a lesson.",
    );
    return;
  }

  router.push({ name: "admin-course-create-lesson" });
}

function validateCreatePayload() {
  if (!courseDraftState.courseName.trim()) {
    courseNameError.value = true;
    scrollToError("#course-name-field");
    appToast.error("Course name is required", "Please enter the course name.");
    return false;
  }

  if (!courseDraftState.totalLearningTime.trim()) {
    appToast.error(
      "Total learning time is required",
      "Please enter total learning time in hours.",
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

  return true;
}

async function handleCreateCourse() {
  if (isSubmitting.value) return;
  if (!validateCreatePayload()) return;

  try {
    isSubmitting.value = true;

    const priceNumber = courseDraftState.coursePrice
      ? Number(courseDraftState.coursePrice)
      : 0;
    const totalLearningTimeNumber = Number(
      courseDraftState.totalLearningTime || "0",
    );

    const promoCode =
      courseDraftState.promoEnabled && courseDraftState.promoCode.trim()
        ? {
            code: courseDraftState.promoCode.trim(),
            discountType: "PERCENTAGE",
            discountValue: courseDraftState.promoDiscount
              ? Number(courseDraftState.promoDiscount)
              : 0,
            validFrom: courseDraftState.promoValidFrom || null,
            validUntil: courseDraftState.promoValidUntil || null,
          }
        : null;

    const modules = courseDraftState.lessons.map((lesson) => ({
      title: lesson.name.trim(),
      subLessons: lesson.subLessons.map((sub) => ({
        title: sub.name.trim(),
        fileType: sub.fileType,
        detail: sub.detail.trim(),
      })),
    }));

    const payload = {
      title: courseDraftState.courseName.trim(),
      description: courseDraftState.courseSummary.trim(),
      detail: courseDraftState.courseDetail.trim(),
      price: priceNumber,
      totalLearningTime: totalLearningTimeNumber,
      promoCode,
      modules,
    };

    await axios.post("http://localhost:8080/api/admin/courses", payload, {
      headers: {
        Authorization:
          "Bearer 22222222-2222-2222-2222-222222222222",
      },
    });

    appToast.success(
      "Course created",
      "The course has been created successfully.",
    );
    resetCourseDraft();
    router.push({ name: "admin-course" });
  } catch (error: any) {
    const message =
      error?.response?.data?.message ??
      "Failed to create course. Please try again.";
    appToast.error("Create course failed", message);
  } finally {
    isSubmitting.value = false;
  }
}
</script>

<template>
  <section class="flex min-h-screen flex-col bg-gray-100">
    <div
      class="mx-auto flex w-full max-w-[1920px] items-center justify-between gap-6 border-b border-gray-200 bg-white px-8 h-[92px]"
    >
          <div class="flex min-w-0 flex-1 items-center gap-4">
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100"
              aria-label="Back to course list"
              @click="router.push({ name: 'admin-course' })"
            >
              <ArrowLeft :size="22" stroke-width="2" />
            </button>
            <h1
              class="text-headline3 flex min-w-0 flex-wrap items-baseline gap-x-2"
            >
              <span class="shrink-0 text-gray-900">Course</span>
              
            </h1>
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
              @click="handleCreateCourse"
            >
              Create
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
                  error-message="Please enter the course name before adding a lesson."
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
                  supporting-text="Total learning time in hours"
                  :step="1"
                  :min="0"
                />
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-3">
                  <input
                    id="promo-checkbox"
                    v-model="courseDraftState.promoEnabled"
                    type="checkbox"
                    class="h-5 w-5 shrink-0 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30"
                  />
                  <label
                    for="promo-checkbox"
                    class="cursor-pointer text-body3 text-gray-800"
                  >
                    Promo Code
                  </label>
                </div>

                <PromoCard
                  v-if="courseDraftState.promoEnabled"
                  v-model:promo-code="courseDraftState.promoCode"
                  v-model:discount="courseDraftState.promoDiscount"
                  v-model:valid-from="courseDraftState.promoValidFrom"
                  v-model:valid-until="courseDraftState.promoValidUntil"
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
                title="Cover image *"
                subtitle="Supported file types: .jpg, .png, .jpeg. Max file size: 5 MB"
                uploadtext="Upload Image"
                class="w-[240px] h-[240px]"
              />

              <MediaInput
                v-model="courseDraftState.trailerVideoFile"
                title="Video trailer *"
                subtitle="Supported file types: .mp4, .mov, .avi. Max file size: 20 MB"
                uploadtext="Upload Video"
                class="w-[240px] h-[240px]"
                accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
              />

              <AttachFileInput
                v-model="courseDraftState.attachmentFile"
                title="Attach File (Optional)"
                subtitle="Supported file types: .pdf, .doc, .docx. Max file size: 10 MB"
                uploadtext="Upload file"
              />
            </div>
          </div>
          <div class="py-15 space-y-6">
            <div class="flex items-center justify-between">
              <div class="flex min-w-0 flex-1 items-center gap-4">
                <h1
                  class="text-headline3 flex min-w-0 flex-wrap items-baseline gap-x-2"
                >
                  <span class="shrink-0 text-gray-900">Lesson</span>
                </h1>
              </div>

              <div class="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  class="h-15 w-fit min-w-[120px] rounded-xl bg-blue-500 px-6 text-[16px] font-bold text-white transition-colors hover:bg-blue-400 active:bg-blue-700"
                  @click="goToAddLesson"
                >
                  + Add Lesson
                </button>
              </div>
            </div>

            <LessonTable :lessons="lessons" />
          </div>
        </div>
  </section>

  <Modal
    v-model:open="showCancelModal"
    title="Cancel Course Creation"
    message="Are you sure you want to cancel? All information you have entered will be lost."
    left-text="Keep editing"
    right-text="Yes, cancel"
    type="secondary"
    @left-click="keepEditing"
    @right-click="confirmCancel"
  />
</template>
