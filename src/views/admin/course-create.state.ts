import { reactive, watch } from "vue";

const PERSIST_DEBOUNCE_MS = 500;
let persistTimer: ReturnType<typeof setTimeout> | null = null;

function schedulePersist() {
  if (persistTimer !== null) clearTimeout(persistTimer);
  persistTimer = setTimeout(persistState, PERSIST_DEBOUNCE_MS);
}

const STORAGE_KEY = "courseDraftState";

export interface DraftSubLesson {
  id: number;
  name: string;
  videoFile: File | null;
  fileType: "VIDEO" | "IMAGE";
  detail: string;
  uploadedUrl: string | null;
}

export interface DraftLesson {
  id: number;
  name: string;
  subLessons: DraftSubLesson[];
}

export interface LessonTableItem {
  id: number;
  name: string;
  subLesson: number;
}

interface PersistedSubLesson {
  id: number;
  name: string;
  fileType: "VIDEO" | "IMAGE";
  detail: string;
  uploadedUrl: string | null;
}

interface PersistedLesson {
  id: number;
  name: string;
  subLessons: PersistedSubLesson[];
}

interface PersistedCourseDraft {
  /** UUID folder segment under `courses/` in Supabase Storage for this draft */
  courseStorageFolderId: string;
  courseName: string;
  coursePrice: string;
  totalLearningTime: string;
  courseSummary: string;
  courseDetail: string;
  promoEnabled: boolean;
  promoCode: string;
  promoDiscount: string;
  promoValidFrom: string;
  promoValidUntil: string;
  lessons: PersistedLesson[];
  nextLessonId: number;
  nextSubLessonId: number;
}

function newCourseStorageFolderId(): string {
  return crypto.randomUUID();
}

function createDefaultPersistedState(): PersistedCourseDraft {
  return {
    courseStorageFolderId: newCourseStorageFolderId(),
    courseName: "",
    coursePrice: "",
    totalLearningTime: "",
    courseSummary: "",
    courseDetail: "",
    promoEnabled: false,
    promoCode: "",
    promoDiscount: "",
    promoValidFrom: "",
    promoValidUntil: "",
    lessons: [],
    nextLessonId: 1,
    nextSubLessonId: 1,
  };
}

function loadPersistedState(): PersistedCourseDraft {
  if (typeof window === "undefined") {
    return createDefaultPersistedState();
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultPersistedState();
    const parsed = JSON.parse(raw) as PersistedCourseDraft;
    if (!parsed || typeof parsed !== "object") {
      return createDefaultPersistedState();
    }
    return {
      ...createDefaultPersistedState(),
      ...parsed,
      lessons: parsed.lessons ?? [],
      courseStorageFolderId:
        typeof parsed.courseStorageFolderId === "string" &&
        parsed.courseStorageFolderId.length > 0
          ? parsed.courseStorageFolderId
          : newCourseStorageFolderId(),
    };
  } catch {
    return createDefaultPersistedState();
  }
}

const initial = loadPersistedState();

export const courseDraftState = reactive({
  courseStorageFolderId: initial.courseStorageFolderId,
  courseName: initial.courseName,
  coursePrice: initial.coursePrice,
  totalLearningTime: initial.totalLearningTime,
  courseSummary: initial.courseSummary,
  courseDetail: initial.courseDetail,
  coverImageFile: null as File | null,
  coverImageUrl: null as string | null,
  trailerVideoFile: null as File | null,
  attachmentFile: null as File | null,
  promoEnabled: initial.promoEnabled,
  promoCode: initial.promoCode,
  promoDiscount: initial.promoDiscount,
  promoValidFrom: initial.promoValidFrom,
  promoValidUntil: initial.promoValidUntil,
  lessons: (initial.lessons ?? []).map((lesson) => ({
    id: lesson.id,
    name: lesson.name,
    subLessons: lesson.subLessons.map((sub) => ({
      id: sub.id,
      name: sub.name,
      videoFile: null,
      fileType: sub.fileType,
      detail: sub.detail,
      uploadedUrl: sub.uploadedUrl ?? null,
    })),
  })) as DraftLesson[],
  nextLessonId: initial.nextLessonId,
  nextSubLessonId: initial.nextSubLessonId,
});

export function createEmptySubLesson(): DraftSubLesson {
  const subLesson = {
    id: courseDraftState.nextSubLessonId,
    name: "",
    videoFile: null,
    fileType: "VIDEO" as const,
    detail: "",
    uploadedUrl: null,
  };
  courseDraftState.nextSubLessonId += 1;
  return subLesson;
}

export function addDraftLesson(payload: {
  name: string;
  subLessons: DraftSubLesson[];
}) {
  courseDraftState.lessons.push({
    id: courseDraftState.nextLessonId,
    name: payload.name,
    subLessons: payload.subLessons,
  });
  courseDraftState.nextLessonId += 1;
}

export function toLessonTableItems(lessons: DraftLesson[]): LessonTableItem[] {
  return lessons.map((lesson) => ({
    id: lesson.id,
    name: lesson.name,
    subLesson: lesson.subLessons.length,
  }));
}

/** True when no course fields, files, lessons, or promo data have been entered. */
export function isCourseDraftEmpty(): boolean {
  const s = courseDraftState;
  const noText =
    !s.courseName.trim() &&
    !s.coursePrice.trim() &&
    !s.totalLearningTime.trim() &&
    !s.courseSummary.trim() &&
    !s.courseDetail.trim();
  if (!noText) return false;
  if (s.promoEnabled) return false;
  if (
    s.promoCode.trim() ||
    s.promoDiscount.trim() ||
    s.promoValidFrom.trim() ||
    s.promoValidUntil.trim()
  ) {
    return false;
  }
  if (s.coverImageFile || s.trailerVideoFile || s.attachmentFile) return false;
  if (s.lessons.length > 0) return false;
  return true;
}

export function resetCourseDraft() {
  courseDraftState.courseStorageFolderId = newCourseStorageFolderId();
  courseDraftState.courseName = "";
  courseDraftState.coursePrice = "";
  courseDraftState.totalLearningTime = "";
  courseDraftState.courseSummary = "";
  courseDraftState.courseDetail = "";
  courseDraftState.coverImageFile = null;
  courseDraftState.coverImageUrl = null;
  courseDraftState.trailerVideoFile = null;
  courseDraftState.attachmentFile = null;
  courseDraftState.promoEnabled = false;
  courseDraftState.promoCode = "";
  courseDraftState.promoDiscount = "";
  courseDraftState.promoValidFrom = "";
  courseDraftState.promoValidUntil = "";
  courseDraftState.lessons = [];
  courseDraftState.nextLessonId = 1;
  courseDraftState.nextSubLessonId = 1;

  if (typeof window !== "undefined") {
    window.localStorage.removeItem(STORAGE_KEY);
  }
}

function persistState() {
  if (typeof window === "undefined") return;

  const snapshot: PersistedCourseDraft = {
    courseStorageFolderId: courseDraftState.courseStorageFolderId,
    courseName: courseDraftState.courseName,
    coursePrice: courseDraftState.coursePrice,
    totalLearningTime: courseDraftState.totalLearningTime,
    courseSummary: courseDraftState.courseSummary,
    courseDetail: courseDraftState.courseDetail,
    promoEnabled: courseDraftState.promoEnabled,
    promoCode: courseDraftState.promoCode,
    promoDiscount: courseDraftState.promoDiscount,
    promoValidFrom: courseDraftState.promoValidFrom,
    promoValidUntil: courseDraftState.promoValidUntil,
    lessons: courseDraftState.lessons.map((lesson) => ({
      id: lesson.id,
      name: lesson.name,
      subLessons: lesson.subLessons.map((sub) => ({
        id: sub.id,
        name: sub.name,
        fileType: sub.fileType,
        detail: sub.detail,
        uploadedUrl: sub.uploadedUrl,
      })),
    })),
    nextLessonId: courseDraftState.nextLessonId,
    nextSubLessonId: courseDraftState.nextSubLessonId,
  };

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
  } catch {
    // ignore storage errors
  }
}

watch(
  () => ({
    courseStorageFolderId: courseDraftState.courseStorageFolderId,
    courseName: courseDraftState.courseName,
    coursePrice: courseDraftState.coursePrice,
    totalLearningTime: courseDraftState.totalLearningTime,
    courseSummary: courseDraftState.courseSummary,
    courseDetail: courseDraftState.courseDetail,
    promoEnabled: courseDraftState.promoEnabled,
    promoCode: courseDraftState.promoCode,
    promoDiscount: courseDraftState.promoDiscount,
    promoValidFrom: courseDraftState.promoValidFrom,
    promoValidUntil: courseDraftState.promoValidUntil,
    lessons: courseDraftState.lessons.map((lesson) => ({
      id: lesson.id,
      name: lesson.name,
      subLessons: lesson.subLessons.map((sub) => ({
        id: sub.id,
        name: sub.name,
        fileType: sub.fileType,
        detail: sub.detail,
        uploadedUrl: sub.uploadedUrl,
      })),
    })),
    nextLessonId: courseDraftState.nextLessonId,
    nextSubLessonId: courseDraftState.nextSubLessonId,
  }),
  () => {
    schedulePersist();
  },
  { deep: true },
);
