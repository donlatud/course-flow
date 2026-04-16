<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-vue-next";
import { appToast } from "@/components/base/toast";
import CustomSelect from "@/components/base/input/CustomSelect.vue";
import CustomInput from "@/components/base/input/CustomInput.vue";

const router = useRouter();

const isLoading = ref(false);
const errorMessage = ref<string | null>(null);

// Field error states
const titleError = ref<string | null>(null);
const courseError = ref<string | null>(null);
const lessonError = ref<string | null>(null);
const materialError = ref<string | null>(null);

const courses = ref<any[]>([]);
const lessons = ref<any[]>([]);
const subLessons = ref<any[]>([]);

// Computed options for CustomSelect
const courseOptions = computed(() =>
  courses.value.map((c) => ({ label: c.title, value: c.id }))
);
const lessonOptions = computed(() =>
  lessons.value.map((l) => ({ label: l.title, value: l.id }))
);
const subLessonOptions = computed(() =>
  subLessons.value.map((s) => ({ label: s.title, value: s.id }))
);

// Form state
const selectedCourseId = ref("");
const selectedLessonId = ref("");
const selectedSubLessonId = ref("");
const assignmentTitle = ref("");
const assignmentDescription = ref("");

onMounted(async () => {
  await fetchCourses();
});

// Watch for course selection to load lessons
watch(selectedCourseId, (courseId) => {
  if (courseId) {
    fetchLessons(courseId);
  }
  // Always reset lesson and sub-lesson when course changes
  lessons.value = [];
  subLessons.value = [];
  selectedLessonId.value = "";
  selectedSubLessonId.value = "";
});

// Watch for lesson selection to load sub-lessons
watch(selectedLessonId, (lessonId) => {
  if (lessonId) {
    fetchSubLessons(lessonId);
  } else {
    subLessons.value = [];
    selectedSubLessonId.value = "";
  }
});

async function fetchLessons(courseId: string) {
  try {
    const response = await api.get(`/api/admin/courses/${courseId}/modules`);
    lessons.value = response.data.content || response.data || [];
  } catch (error) {
    console.error("Failed to fetch lessons", error);
    lessons.value = [];
  }
}

async function fetchSubLessons(moduleId: string) {
  try {
    const response = await api.get(`/api/admin/modules/${moduleId}/sub-lessons`);
    subLessons.value = response.data.content || response.data || [];
  } catch (error) {
    console.error("Failed to fetch sub-lessons", error);
    subLessons.value = [];
  }
}

async function fetchCourses() {
  try {
    const response = await api.get("/api/admin/courses/all");
    // Handle both paginated response (with content) and flat array
    courses.value = response.data || [];
  } catch (error) {
    console.error("Failed to fetch courses", error);
    courses.value = [];
  }
}

async function createAssignment() {
  // Reset errors
  titleError.value = null;
  courseError.value = null;
  lessonError.value = null;
  materialError.value = null;
  errorMessage.value = null;

  if (!assignmentTitle.value) {
    titleError.value = "Please enter assignment title";
    appToast.error("Error", "Please enter assignment title");
    return;
  }

  if (!selectedCourseId.value) {
    courseError.value = "Please select course";
    appToast.error("Error", "Please select course");
    return;
  }

  if (!selectedLessonId.value) {
    lessonError.value = "Please select lesson";
    appToast.error("Error", "Please select lesson");
    return;
  }

  if (!selectedSubLessonId.value) {
    materialError.value = "Please select sub-lesson";
    appToast.error("Error", "Please select sub-lesson");
    return;
  }
  
  try {
    isLoading.value = true;
    errorMessage.value = null;
    
    const payload = {
      title: assignmentTitle.value,
      description: assignmentDescription.value,
      courseId: selectedCourseId.value,
      moduleId: selectedLessonId.value,
      materialId: selectedSubLessonId.value,
    };
    await api.post("/api/admin/assignments", payload);
    appToast.success("Created", "Assignment has been created successfully.");
    router.push({ name: "admin-assignment" });
  } catch (error: any) {
    console.error(error);
    appToast.error("Error", error?.response?.data?.message || "Failed to create assignment");
  } finally {
    isLoading.value = false;
  }
}

function goBack() {
  router.push({ name: "admin-assignment" });
}
</script>

<template>
  <div class="flex min-h-screen bg-gray-50">
    <!-- Main Content -->
    <main class="flex-1">
      <!-- Header -->
      <header class="flex items-center justify-between px-8 py-4 bg-white border-b border-gray-200 h-[92px]">
        <div class="flex items-center gap-4">
          <button
            class="flex items-center gap-2 text-gray-600 hover:text-gray-900 cursor-pointer"
            @click="goBack"
          >
            <ArrowLeft class="w-5 h-5" />
          </button>
          <h2 class="text-headline3 font-medium text-gray-900">
            Add Assignment
          </h2>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="h-[60px] w-[103px] px-4 py-2 text-sm font-medium text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 cursor-pointer"
            @click="goBack"
          >
            Cancel
          </button>
          <button
            class="h-[60px] w-[103px] px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
            @click="createAssignment"
          >
            Create
          </button>
        </div>
      </header>

      <!-- Form -->
      <div class="px-10 pt-12">
        <div class="mx-auto w-full bg-white rounded-xl shadow-sm px-25 pt-10 pb-15">
          <!-- Course Selection -->
          <CustomSelect
            v-model="selectedCourseId"
            label="Course"
            placeholder="Select a course"
            :options="courseOptions"
            :error="!!courseError"
            :error-message="courseError || undefined"
            class="mb-6"
          />

          <!-- Lesson & Sub-lesson -->
          <div class="grid grid-cols-2 gap-6 mb-6">
            <CustomSelect
              v-model="selectedLessonId"
              label="Lesson"
              placeholder="Select a lesson"
              :options="lessonOptions"
              :error="!!lessonError"
              :error-message="lessonError || undefined"
            />
            <CustomSelect
              v-model="selectedSubLessonId"
              label="Sub-lesson"
              placeholder="Select a sub-lesson"
              :options="subLessonOptions"
              :error="!!materialError"
              :error-message="materialError || undefined"
            />
          </div>

          <hr class="my-6 border-gray-200" />

          <!-- Assignment Detail -->
          <h3 class="text-lg font-medium text-gray-900 mb-4">Assignment detail</h3>
          
          <CustomInput
            v-model="assignmentTitle"
            label="Assignment *"
            placeholder="Enter assignment title"
            :error="!!titleError"
            :error-message="titleError || undefined"
            class="mb-6"
          />
        </div>
      </div>
    </main>
  </div>
</template>
