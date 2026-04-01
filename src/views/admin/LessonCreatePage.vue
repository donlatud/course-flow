<script setup lang="ts">
import { computed, nextTick, ref, watch } from "vue";
import { onBeforeRouteLeave, useRouter } from "vue-router";
import type { NavigationGuardNext } from "vue-router";
import { ArrowLeft, GripVertical } from "lucide-vue-next";
import iconDelete from "@/assets/icon-delete.svg";
import CustomInput from "@/components/base/input/CustomInput.vue";
import MediaInput from "@/components/base/input/MediaInput.vue";
import Modal from "@/components/base/modal/Modal.vue";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { appToast } from "@/components/base/toast";
import {
  addDraftLesson,
  courseDraftState,
  createEmptySubLesson,
  type DraftSubLesson,
} from "@/views/admin/course-create.state";

const router = useRouter();

const lessonName = ref("");
const lessonNameError = ref(false);
const subLessons = ref<DraftSubLesson[]>([createEmptySubLesson()]);
/** IDs of sub-lessons with empty name after failed validation */
const subLessonNameErrorIds = ref<Set<number>>(new Set());
const isSubmitting = ref(false);

/** When user picks a file, store it for upload at submit time and clear any stale URL. */
function handleMediaChange(subLesson: DraftSubLesson, file: File | null) {
  subLesson.uploadedUrl = null;
  if (!file) {
    subLesson.videoFile = null;
  }
}

function subLessonNameHasError(id: number) {
  return subLessonNameErrorIds.value.has(id);
}
const showCancelModal = ref(false);
const showCreateModal = ref(false);
let guardNext: NavigationGuardNext | null = null;

const courseTitle = computed(() =>
  courseDraftState.courseName.trim() || "Untitled Course",
);

watch(lessonName, (value) => {
  if (value.trim()) {
    lessonNameError.value = false;
  }
});

watch(
  () => subLessons.value.map((s) => ({ id: s.id, name: s.name })),
  () => {
    const next = new Set(subLessonNameErrorIds.value);
    for (const id of [...next]) {
      const sub = subLessons.value.find((s) => s.id === id);
      if (sub?.name.trim()) {
        next.delete(id);
      }
    }
    subLessonNameErrorIds.value = next;
  },
  { deep: true },
);

function isLessonFormEmpty() {
  if (lessonName.value.trim()) return false;
  return subLessons.value.every(
    (s) => !s.name.trim() && !s.detail.trim() && !s.videoFile,
  );
}

onBeforeRouteLeave((_to, _from, next) => {
  if (isLessonFormEmpty() || isSubmitting.value) {
    next();
    return;
  }

  guardNext = next;
  showCancelModal.value = true;
});

function confirmCancel() {
  showCancelModal.value = false;
  lessonName.value = "";
  lessonNameError.value = false;
  subLessonNameErrorIds.value = new Set();
  subLessons.value = [createEmptySubLesson()];
  guardNext?.();
  guardNext = null;
}

function keepEditing() {
  showCancelModal.value = false;
  guardNext?.(false);
  guardNext = null;
}

function addSubLesson() {
  subLessons.value.push(createEmptySubLesson());
}

function removeSubLesson(id: number) {
  if (subLessons.value.length === 1) return;
  subLessons.value = subLessons.value.filter((item) => item.id !== id);
  const next = new Set(subLessonNameErrorIds.value);
  next.delete(id);
  subLessonNameErrorIds.value = next;
}

function scrollToError(selector: string) {
  const target = document.querySelector(selector);
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function focusLessonNameInput() {
  await nextTick();
  const input = document.querySelector<HTMLInputElement>(
    "#lesson-name-field input",
  );
  input?.focus();
}

async function focusSubLessonNameInput(id: number) {
  await nextTick();
  const input = document.querySelector<HTMLInputElement>(
    `#sub-lesson-name-${id} input`,
  );
  input?.focus();
}

function validateLessonForm() {
  if (!lessonName.value.trim()) {
    subLessonNameErrorIds.value = new Set();
    lessonNameError.value = true;
    scrollToError("#lesson-name-field");
    void focusLessonNameInput();
    appToast.error("Lesson name is required", "Please enter the lesson name.");
    return false;
  }

  const hasEmptySubLessonName = subLessons.value.some(
    (item) => !item.name.trim(),
  );
  if (hasEmptySubLessonName) {
    subLessonNameErrorIds.value = new Set(
      subLessons.value.filter((s) => !s.name.trim()).map((s) => s.id),
    );
    const firstInvalid = subLessons.value.find((item) => !item.name.trim());
    if (firstInvalid) {
      scrollToError(`#sub-lesson-name-${firstInvalid.id}`);
      void focusSubLessonNameInput(firstInvalid.id);
    }
    appToast.error(
      "Sub-lesson name is required",
      "Please enter a name for every sub-lesson.",
    );
    return false;
  }

  subLessonNameErrorIds.value = new Set();
  return true;
}

function requestCreateLesson() {
  if (!validateLessonForm()) return;
  showCreateModal.value = true;
}

function confirmCreateLesson() {
  showCreateModal.value = false;

  isSubmitting.value = true;
  addDraftLesson({
    name: lessonName.value.trim(),
    subLessons: subLessons.value.map((item) => ({
      ...item,
      name: item.name.trim(),
      detail: item.detail.trim(),
    })),
  });

  appToast.success("Lesson added", "The lesson was added to this course.");
  router.push({ name: "admin-course-create" });
}
</script>

<template>
  <section class="flex min-h-screen flex-col bg-gray-100 max-w-[1920px]">
    <div
      class="mx-auto flex h-[92px] w-full  shrink-0 items-center justify-between gap-6 border-b border-gray-200 bg-white px-8"
    >
      <div class="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100"
          aria-label="Back to course create"
          @click="router.push({ name: 'admin-course-create' })"
        >
          <ArrowLeft :size="22" stroke-width="2" />
        </button>
        <div class="min-w-0">
          <p class="text-body4 text-gray-500">
            Course
            <span class="font-medium text-gray-700">'{{ courseTitle }}'</span>
          </p>
          <h1 class="text-headline3 text-gray-900">Add Lesson</h1>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-3">
        <button
          type="button"
          class="h-15 min-w-[100px] rounded-xl border-2 border-orange-500 bg-white px-6 text-[16px] font-semibold text-orange-500 transition-colors hover:bg-orange-50 active:bg-orange-100"
          @click="router.push({ name: 'admin-course-create' })"
        >
          Cancel
        </button>
        <button
          type="button"
          class="h-15 min-w-[100px] rounded-xl bg-blue-500 px-6 text-[16px] font-bold text-white transition-colors hover:bg-blue-400 active:bg-blue-700"
          @click="requestCreateLesson"
        >
          Create
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto px-8 py-10">
      <div class="mx-auto w-full max-w-[1920px] rounded-3xl border border-[#E8E3F5] bg-white py-10 px-25 shadow-sm">
        <div class="mx-auto flex w-full max-w-[920px] flex-col gap-10">
          <div id="lesson-name-field">
            <CustomInput
              v-model="lessonName"
              label="Lesson name"
              placeholder="Place Holder"
              :error="lessonNameError"
              error-message="Please enter the lesson name."
            />
          </div>

          <div class="h-px w-full bg-gray-200" />

          <div class="space-y-6">
            <div class="space-y-2">
              <h2 class="text-headline4 text-gray-700">Sub-Lesson</h2>
              <p class="text-body4 text-gray-500">
                Note: Add as many sub-lessons as needed. At least one sub-lesson
                is required and the last one cannot be deleted.
              </p>
            </div>

            <div
              v-for="subLesson in subLessons"
              :key="subLesson.id"
              class="rounded-2xl border border-[#E7EAF5] bg-[#F6F7FC] px-5 py-5"
            >
              <div class="flex items-start gap-4">
                <div class="pt-11 text-gray-300">
                  <GripVertical :size="18" />
                </div>

                <div class="min-w-0 flex-1 space-y-6">
                  <div class="flex flex-col gap-4 md:flex-row md:items-start">
                    <div class="min-w-0 flex-1 space-y-4">
                      <div :id="`sub-lesson-name-${subLesson.id}`">
                        <CustomInput
                          v-model="subLesson.name"
                          class="min-w-0 flex-1"
                          label="Sub-lesson name"
                          placeholder="Place Holder"
                          :error="subLessonNameHasError(subLesson.id)"
                          error-message="Please enter a name for this sub-lesson."
                        />
                      </div>

                      <div class="flex flex-wrap items-center gap-3">
                        <span class="text-body3 font-medium text-gray-800">
                          Media type
                        </span>
                        <button
                          type="button"
                          class="rounded-full border px-3 py-1 text-body4 transition-colors"
                          :class="
                            subLesson.fileType === 'VIDEO'
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          "
                          @click="subLesson.fileType = 'VIDEO'"
                        >
                          Video
                        </button>
                        <button
                          type="button"
                          class="rounded-full border px-3 py-1 text-body4 transition-colors"
                          :class="
                            subLesson.fileType === 'IMAGE'
                              ? 'border-blue-500 bg-blue-50 text-blue-600'
                              : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'
                          "
                          @click="subLesson.fileType = 'IMAGE'"
                        >
                          Image
                        </button>
                      </div>
                      <MediaInput
                        v-model="subLesson.videoFile"
                        :title="subLesson.fileType === 'VIDEO' ? 'Video *' : 'Image *'"
                        subtitle=""
                        :uploadtext="
                          subLesson.fileType === 'VIDEO'
                            ? 'Upload Video'
                            : 'Upload Image'
                        "
                        class="h-[136px] w-[136px] bg-gray-200"
                        :accept="
                          subLesson.fileType === 'VIDEO'
                            ? 'video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi'
                            : 'image/jpeg,image/png,image/jpg,.jpg,.jpeg,.png'
                        "
                        @change="handleMediaChange(subLesson, $event)"
                      />
                      <div class="flex flex-col gap-1">
                        <label
                          class="text-body3 font-medium text-gray-800"
                          :for="`sub-detail-${subLesson.id}`"
                        >
                          Detail
                        </label>
                        <Textarea
                          :id="`sub-detail-${subLesson.id}`"
                          v-model="subLesson.detail"
                          placeholder="Optional description for this sub-lesson"
                          :class="cn(
                            'w-full resize-y rounded-[10px] border border-gray-300 bg-white px-4 py-3',
                            'text-body2 text-gray-900 placeholder:text-gray-500 shadow-none',
                            'transition-all duration-200 outline-none',
                            'focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20',
                            'min-h-[100px]',
                          )"
                        />
                      </div>
                    </div>

                    <div class="flex flex-col items-end gap-4">
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-md px-1 py-0.5 text-body3 font-medium transition-colors"
                        :class="
                          subLessons.length === 1
                            ? 'cursor-not-allowed text-gray-300'
                            : 'cursor-pointer text-red-400 hover:bg-red-50 hover:text-red-600 active:bg-red-100/80'
                        "
                        :disabled="subLessons.length === 1"
                        @click="removeSubLesson(subLesson.id)"
                      >
                        <img
                          :src="iconDelete"
                          alt=""
                          class="pointer-events-none h-4 w-4 shrink-0"
                          width="16"
                          height="16"
                        />
                        Delete
                      </button>

                      
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              class="h-15 w-fit rounded-xl border-2 border-orange-500 bg-white px-6 text-[16px] font-semibold text-orange-500 transition-colors hover:bg-orange-50 active:bg-orange-100"
              @click="addSubLesson"
            >
              + Add Sub-lesson
            </button>
          </div>
        </div>
      </div>
    </div>
  </section>

  <Modal
    v-model:open="showCancelModal"
    title="Cancel Lesson Creation"
    message="Are you sure you want to cancel? All information you have entered for this lesson will be lost."
    left-text="Keep editing"
    right-text="Yes, cancel"
    type="secondary"
    @left-click="keepEditing"
    @right-click="confirmCancel"
  />

  <Modal
    v-model:open="showCreateModal"
    title="Confirm Lesson Creation"
    message="Are you sure you want to create this lesson? The lesson will be added to the course."
    left-text="No, keep editing"
    right-text="Yes, create"
    type="secondary"
    @left-click="showCreateModal = false"
    @right-click="confirmCreateLesson"
  />
</template>
