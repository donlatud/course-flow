<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from "vue";
import { onBeforeRouteLeave, useRouter, useRoute } from "vue-router";
import type { NavigationGuardNext } from "vue-router";
import { ArrowLeft, GripVertical } from "lucide-vue-next";
import CustomInput from "@/components/base/input/CustomInput.vue";
import MediaInput from "@/components/base/input/MediaInput.vue";
import Modal from "@/components/base/modal/Modal.vue";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { appToast } from "@/components/base/toast";
import {
  courseDraftState,
  createEmptySubLesson,
  updateDraftLesson,
  type DraftSubLesson,
} from "@/views/admin/course-create.state";

const router = useRouter();
const route = useRoute();

const lessonId = computed(() => Number(route.params.lessonId));
const fromEditCourseId = computed(
  () => (route.query.courseId as string | undefined) || undefined,
);

const lessonName = ref("");
const lessonNameError = ref(false);
const lessonNameErrorMessage = ref("Please enter the lesson name.");
const subLessons = ref<DraftSubLesson[]>([]);
const subLessonNameErrorIds = ref<Set<number>>(new Set());
const subLessonNameErrorMessageById = ref<Record<number, string>>({});
const isSubmitting = ref(false);
const notFound = ref(false);

const showCancelModal = ref(false);
const showSaveModal = ref(false);
const showDeleteSubLessonModal = ref(false);
const showReplaceMediaModal = ref(false);
const pendingReplaceMedia = ref<{ sub: DraftSubLesson; file: File } | null>(
  null,
);
const pendingDeleteSubLessonId = ref<number | null>(null);
let guardNext: NavigationGuardNext | null = null;

const courseTitle = computed(() =>
  courseDraftState.courseName.trim() || "Untitled Course",
);

onMounted(() => {
  const lesson = courseDraftState.lessons.find((l) => l.id === lessonId.value);
  if (!lesson) {
    notFound.value = true;
    return;
  }
  lessonName.value = lesson.name;
  subLessons.value = lesson.subLessons.map((sub) => ({ ...sub }));
});

watch(lessonName, (value) => {
  if (value.trim()) {
    lessonNameError.value = false;
    lessonNameErrorMessage.value = "Please enter the lesson name.";
  }
});

watch(
  () => subLessons.value.map((s) => ({ id: s.id, name: s.name })),
  () => {
    const next = new Set(subLessonNameErrorIds.value);
    const nextMessages = { ...subLessonNameErrorMessageById.value };
    for (const id of [...next]) {
      const sub = subLessons.value.find((s) => s.id === id);
      if (sub?.name.trim()) {
        next.delete(id);
        delete nextMessages[id];
      }
    }
    subLessonNameErrorIds.value = next;
    subLessonNameErrorMessageById.value = nextMessages;
  },
  { deep: true },
);

function isFormDirty() {
  const original = courseDraftState.lessons.find(
    (l) => l.id === lessonId.value,
  );
  if (!original) return false;
  if (lessonName.value !== original.name) return true;
  if (subLessons.value.length !== original.subLessons.length) return true;
  return subLessons.value.some((sub, i) => {
    const orig = original.subLessons[i];
    if (!orig) return true;
    return (
      sub.name !== orig.name ||
      sub.detail !== orig.detail ||
      sub.fileType !== orig.fileType ||
      sub.videoFile !== orig.videoFile ||
      sub.uploadedUrl !== orig.uploadedUrl
    );
  });
}

onBeforeRouteLeave((_to, _from, next) => {
  if (!isFormDirty() || isSubmitting.value) {
    next();
    return;
  }
  guardNext = next;
  showCancelModal.value = true;
});

function confirmCancel() {
  showCancelModal.value = false;
  guardNext?.();
  guardNext = null;
}

function keepEditing() {
  showCancelModal.value = false;
  guardNext?.(false);
  guardNext = null;
}

function handleMediaChange(subLesson: DraftSubLesson, file: File | null) {
  subLesson.uploadedUrl = null;
  if (!file) {
    subLesson.videoFile = null;
  }
}

function requestReplaceSubLessonMedia(sub: DraftSubLesson, file: File) {
  pendingReplaceMedia.value = { sub, file };
  showReplaceMediaModal.value = true;
}

function confirmReplaceSubLessonMedia() {
  const p = pendingReplaceMedia.value;
  if (!p) return;
  p.sub.videoFile = p.file;
  p.sub.uploadedUrl = null;
  handleMediaChange(p.sub, p.file);
  pendingReplaceMedia.value = null;
  showReplaceMediaModal.value = false;
}

function cancelReplaceSubLessonMedia() {
  pendingReplaceMedia.value = null;
  showReplaceMediaModal.value = false;
}

function subLessonHasMedia(sub: DraftSubLesson): boolean {
  return Boolean(sub.videoFile || sub.uploadedUrl?.trim());
}

const showChangeMediaTypeModal = ref(false);
const pendingFileTypeChange = ref<{
  sub: DraftSubLesson;
  next: "VIDEO" | "IMAGE";
} | null>(null);

function requestFileTypeChange(sub: DraftSubLesson, next: "VIDEO" | "IMAGE") {
  if (sub.fileType === next) return;
  if (!subLessonHasMedia(sub)) {
    sub.fileType = next;
    return;
  }
  pendingFileTypeChange.value = { sub, next };
  showChangeMediaTypeModal.value = true;
}

function confirmFileTypeChange() {
  const p = pendingFileTypeChange.value;
  if (!p) return;
  p.sub.videoFile = null;
  p.sub.uploadedUrl = null;
  p.sub.fileType = p.next;
  pendingFileTypeChange.value = null;
  showChangeMediaTypeModal.value = false;
}

function cancelFileTypeChange() {
  pendingFileTypeChange.value = null;
  showChangeMediaTypeModal.value = false;
}

function subLessonNameHasError(id: number) {
  return subLessonNameErrorIds.value.has(id);
}

function getSubLessonNameErrorMessage(id: number) {
  return (
    subLessonNameErrorMessageById.value[id] ??
    "Please enter a name for this sub-lesson."
  );
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
  const nextMessages = { ...subLessonNameErrorMessageById.value };
  delete nextMessages[id];
  subLessonNameErrorMessageById.value = nextMessages;
}

function requestRemoveSubLesson(id: number) {
  if (subLessons.value.length === 1) return;
  pendingDeleteSubLessonId.value = id;
  showDeleteSubLessonModal.value = true;
}

function confirmRemoveSubLesson() {
  const id = pendingDeleteSubLessonId.value;
  if (id != null) {
    removeSubLesson(id);
  }
  showDeleteSubLessonModal.value = false;
  pendingDeleteSubLessonId.value = null;
}

function cancelRemoveSubLesson() {
  showDeleteSubLessonModal.value = false;
  pendingDeleteSubLessonId.value = null;
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
    lessonNameErrorMessage.value = "Please enter the lesson name.";
    scrollToError("#lesson-name-field");
    void focusLessonNameInput();
    appToast.error("Lesson name is required", "Please enter the lesson name.");
    return false;
  }

  const normalizedLessonName = lessonName.value.trim().toLowerCase();
  const hasDuplicateLessonName = courseDraftState.lessons.some(
    (lesson) =>
      lesson.id !== lessonId.value &&
      lesson.name.trim().toLowerCase() === normalizedLessonName,
  );
  if (hasDuplicateLessonName) {
    lessonNameError.value = true;
    lessonNameErrorMessage.value =
      "Lesson names must be unique within a course.";
    scrollToError("#lesson-name-field");
    void focusLessonNameInput();
    appToast.error(
      "Lesson name already exists",
      "Please use a different lesson name.",
    );
    return false;
  }

  const hasEmptySubLessonName = subLessons.value.some(
    (item) => !item.name.trim(),
  );
  if (hasEmptySubLessonName) {
    const missingNameIds = subLessons.value
      .filter((s) => !s.name.trim())
      .map((s) => s.id);
    subLessonNameErrorIds.value = new Set(missingNameIds);
    const nextMessages: Record<number, string> = {};
    for (const id of missingNameIds) {
      nextMessages[id] = "Please enter a name for this sub-lesson.";
    }
    subLessonNameErrorMessageById.value = nextMessages;
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

  const duplicateSubLessonName = (() => {
    const seen = new Set<string>();
    for (const item of subLessons.value) {
      const normalized = item.name.trim().toLowerCase();
      if (seen.has(normalized)) return item;
      seen.add(normalized);
    }
    return null;
  })();
  if (duplicateSubLessonName) {
    subLessonNameErrorIds.value = new Set([duplicateSubLessonName.id]);
    subLessonNameErrorMessageById.value = {
      [duplicateSubLessonName.id]:
        "Sub-lesson names must be unique within this lesson.",
    };
    scrollToError(`#sub-lesson-name-${duplicateSubLessonName.id}`);
    void focusSubLessonNameInput(duplicateSubLessonName.id);
    appToast.error(
      "Sub-lesson name already exists",
      "Sub-lesson names must be unique within a lesson.",
    );
    return false;
  }

  subLessonNameErrorIds.value = new Set();
  subLessonNameErrorMessageById.value = {};
  return true;
}

function requestSaveLesson() {
  if (!validateLessonForm()) return;
  showSaveModal.value = true;
}

function confirmSaveLesson() {
  showSaveModal.value = false;
  isSubmitting.value = true;

  updateDraftLesson(lessonId.value, {
    name: lessonName.value.trim(),
    subLessons: subLessons.value.map((item) => ({
      ...item,
      name: item.name.trim(),
      detail: item.detail.trim(),
    })),
  });

  appToast.success("Lesson updated", "The lesson changes have been saved.");
  if (fromEditCourseId.value) {
    router.push({
      name: "admin-course-edit",
      params: { courseId: fromEditCourseId.value },
    });
  } else {
    router.push({ name: "admin-course-create" });
  }
}
</script>

<template>
  <section class="flex min-h-screen flex-col bg-gray-100 max-w-[1920px]">
    <div
      class="mx-auto flex h-[92px] w-full shrink-0 items-center justify-between gap-6  bg-white px-8"
    >
      <div class="flex min-w-0 flex-1 items-center gap-4">
        <button
          type="button"
          class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100"
          aria-label="Back to course"
          @click="
            fromEditCourseId
              ? router.push({
                  name: 'admin-course-edit',
                  params: { courseId: fromEditCourseId },
                })
              : router.push({ name: 'admin-course-create' })
          "
        >
          <ArrowLeft :size="22" stroke-width="2" />
        </button>
        <div class="min-w-0">
          <p class="text-headline3 text-gray-500">
            Course
            <span class="font-medium text-gray-700">'{{ courseTitle }}'</span>
          </p>
        
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-3">
        <button
          type="button"
          class="h-15 min-w-[100px] rounded-xl border-2 border-orange-500 bg-white px-6 text-[16px] font-semibold text-orange-500 transition-colors hover:bg-orange-50 active:bg-orange-100"
          @click="
            fromEditCourseId
              ? router.push({
                  name: 'admin-course-edit',
                  params: { courseId: fromEditCourseId },
                })
              : router.push({ name: 'admin-course-create' })
          "
        >
          Cancel
        </button>
        <button
          type="button"
          class="h-15 min-w-[100px] rounded-xl bg-blue-500 px-6 text-[16px] font-bold text-white transition-colors hover:bg-blue-400 active:bg-blue-700"
          @click="requestSaveLesson"
        >
          Save
        </button>
      </div>
    </div>

    <div class="min-h-0 flex-1 overflow-y-auto px-8 py-10">
      <!-- Lesson not found state -->
      <div
        v-if="notFound"
        class="mx-auto flex w-full max-w-[1920px] flex-col items-center justify-center gap-4 bg-white py-20"
      >
        <p class="text-headline4 text-gray-500">Lesson not found.</p>
        <button
          type="button"
          class="rounded-xl bg-blue-500 px-6 py-3 text-[16px] font-bold text-white hover:bg-blue-400"
          @click="router.push({ name: 'admin-course-create' })"
        >
          Back to Course
        </button>
      </div>

      <div
        v-else
        class="mx-auto w-full max-w-[1920px] rounded-3xl bg-white py-10 px-25 "
      >
        <div class="mx-auto flex w-full max-w-[920px] flex-col gap-10">
          <div id="lesson-name-field">
            <CustomInput
              v-model="lessonName"
              label="Lesson name"
              placeholder="Place Holder"
              :error="lessonNameError"
              :error-message="lessonNameErrorMessage"
            />
          </div>

          <div class="h-px w-full bg-gray-200" />

          <div class="space-y-6">
            <div class="space-y-2">
              <h2 class="text-headline4 text-gray-700">Sub-Lesson</h2>
              <p class="text-body4 text-gray-500">
                Note: Add as many sub-lessons as needed. At least one
                sub-lesson is required and the last one cannot be deleted.
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
                          :error-message="
                            getSubLessonNameErrorMessage(subLesson.id)
                          "
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
                          @click="requestFileTypeChange(subLesson, 'VIDEO')"
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
                          @click="requestFileTypeChange(subLesson, 'IMAGE')"
                        >
                          Image
                        </button>
                      </div>

                      <MediaInput
                        v-model="subLesson.videoFile"
                        :existing-url="subLesson.uploadedUrl ?? undefined"
                        :title="
                          subLesson.fileType === 'VIDEO' ? 'Video *' : 'Image *'
                        "
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
                        :confirm-before-replace="
                          Boolean(subLesson.uploadedUrl || subLesson.videoFile)
                        "
                        @change="handleMediaChange(subLesson, $event)"
                        @replace-confirm="
                          requestReplaceSubLessonMedia(subLesson, $event)
                        "
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
                          :class="
                            cn(
                              'w-full resize-y rounded-[10px] border border-gray-300 bg-white px-4 py-3',
                              'text-body2 text-gray-900 placeholder:text-gray-500 shadow-none',
                              'transition-all duration-200 outline-none',
                              'focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20',
                              'min-h-[100px]',
                            )
                          "
                        />
                      </div>
                    </div>

                    <div class="flex flex-col">
                      <button
                        type="button"
                        class="inline-flex items-center gap-2 rounded-md px-1 text-body3 font-medium transition-colors"
                        :class="
                          subLessons.length === 1
                            ? 'cursor-not-allowed text-gray-300'
                            : 'cursor-pointer text-blue-400 hover:bg-blue-50 hover:text-blue-600 active:bg-red-100/80'
                        "
                        :disabled="subLessons.length === 1"
                        @click="requestRemoveSubLesson(subLesson.id)"
                      >
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
    title="Discard Changes"
    message="Are you sure you want to leave? All unsaved changes to this lesson will be lost."
    left-text="Keep editing"
    right-text="Yes, discard"
    type="secondary"
    @left-click="keepEditing"
    @right-click="confirmCancel"
  />

  <Modal
    v-model:open="showSaveModal"
    title="Save Lesson Changes"
    message="Are you sure you want to save the changes to this lesson?"
    left-text="No, keep editing"
    right-text="Yes, save"
    type="secondary"
    @left-click="showSaveModal = false"
    @right-click="confirmSaveLesson"
  />

  <Modal
    v-model:open="showDeleteSubLessonModal"
    title="Delete Sub-lesson"
    message="Are you sure you want to delete this sub-lesson?"
    left-text="Cancel"
    right-text="Yes, delete"
    type="secondary"
    @left-click="cancelRemoveSubLesson"
    @right-click="confirmRemoveSubLesson"
  />

  <Modal
    v-model:open="showReplaceMediaModal"
    title="Replace media?"
    message="A file is already selected or uploaded for this sub-lesson. Replace it with the new file? The previous media will be cleared from this draft until you save the lesson."
    left-text="Cancel"
    right-text="Replace"
    type="secondary"
    @close="cancelReplaceSubLessonMedia"
    @left-click="cancelReplaceSubLessonMedia"
    @right-click="confirmReplaceSubLessonMedia"
  />

  <Modal
    v-model:open="showChangeMediaTypeModal"
    title="Change media type?"
    message="Switching between Video and Image will remove the current file or uploaded media for this sub-lesson. Continue?"
    left-text="Cancel"
    right-text="Switch"
    type="secondary"
    @close="cancelFileTypeChange"
    @left-click="cancelFileTypeChange"
    @right-click="confirmFileTypeChange"
  />
</template>
