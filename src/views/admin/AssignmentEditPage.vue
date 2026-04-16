<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "@/lib/api";
import { ArrowLeft } from "lucide-vue-next";
import Modal from "@/components/base/modal/Modal.vue";
import { appToast } from "@/components/base/toast";
import CustomSelect from "@/components/base/input/CustomSelect.vue";
import CustomInput from "@/components/base/input/CustomInput.vue";

const route = useRoute();
const router = useRouter();

const assignmentId = route.params.assignmentId as string;

const assignment = ref<any>(null);
const isLoading = ref(true);
const errorMessage = ref<string | null>(null);

// Field error states
const titleError = ref<string | null>(null);
const courseError = ref<string | null>(null);
const lessonError = ref<string | null>(null);
const materialError = ref<string | null>(null);

// Modal states
const showDeleteModal = ref(false);

// Flag to prevent reset during initial data load
const isInitialLoad = ref(true);

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
  await fetchAssignment();
  await fetchCourses();
});

// Watch for course selection to load lessons
watch(selectedCourseId, (courseId) => {
  if (courseId) {
    fetchLessons(courseId);
  }
  // Only reset lesson and sub-lesson when course changes (not during initial load)
  if (!isInitialLoad.value) {
    lessons.value = [];
    subLessons.value = [];
    selectedLessonId.value = "";
    selectedSubLessonId.value = "";
  }
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

async function fetchAssignment() {
  try {
    isLoading.value = true;
    const response = await api.get(`/api/admin/assignments/${assignmentId}`);
    assignment.value = response.data;
    
    // Populate form from API data
    assignmentTitle.value = response.data.title;
    assignmentDescription.value = response.data.description || "";
    selectedCourseId.value = response.data.courseId || "";

    // Add course from API to courses list if not already present
    // (so dropdown can display the course name even if not in fetched list)
    const apiCourseId = response.data.courseId;
    const apiCourseTitle = response.data.courseTitle;
    if (apiCourseId && apiCourseTitle && !courses.value.find(c => c.id === apiCourseId)) {
      courses.value.push({ id: apiCourseId, title: apiCourseTitle });
    }

    // Populate lesson and sub-lesson if API returns them
    selectedLessonId.value = response.data.moduleId || "";
    selectedSubLessonId.value = response.data.materialId || "";

    // If courseId is set, fetch lessons for that course
    if (apiCourseId) {
      await fetchLessons(apiCourseId);
    }

    // If moduleId is set, fetch sub-lessons for that module
    if (response.data.moduleId) {
      await fetchSubLessons(response.data.moduleId);
    }

    // Initial load complete, allow resets on user changes
    isInitialLoad.value = false;
  } catch (error: any) {
    console.error(error);
    errorMessage.value = error?.response?.data?.message || "Failed to load assignment";
  } finally {
    isLoading.value = false;
  }
}

async function fetchCourses() {
  try {
    const response = await api.get("/api/admin/courses/all");
    courses.value = response.data || [];
  } catch (error: any) {
    console.error("Full error:", error);
    console.error("Error response:", error?.response);
    console.error("Error response data:", error?.response?.data);
  }
}


function openDeleteModal() {
  showDeleteModal.value = true;
}

async function confirmDelete() {
  showDeleteModal.value = false;
  try {
    await api.delete(`/api/admin/assignments/${assignmentId}`);
    appToast.success("Deleted", "Assignment has been deleted successfully.");
    router.push({ name: "admin-assignment" });
  } catch (error: any) {
    console.error(error);
    appToast.error("Error", error?.response?.data?.message || "Failed to delete assignment");
  }
}

function cancelDelete() {
  showDeleteModal.value = false;
}

async function saveAssignment() {
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
    const payload = {
      title: assignmentTitle.value,
      description: assignmentDescription.value,
      courseId: selectedCourseId.value,
      moduleId: selectedLessonId.value,
      materialId: selectedSubLessonId.value,
    };
    await api.put(`/api/admin/assignments/${assignmentId}`, payload);
    appToast.success("Saved", "Assignment has been saved successfully.");
    router.push({ name: "admin-assignment" });
  } catch (error: any) {
    console.error("Full error:", error);
    console.error("Error response:", error?.response);
    console.error("Error response data:", error?.response?.data);
    appToast.error("Error", error?.response?.data?.message || "Failed to save assignment");
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
            <span class="text-headline3 font-medium text-gray-600">Assignment</span>
          </button>
          <h2 class="text-headline3 font-medium text-gray-900">
            {{ assignment?.title || "Edit Assignment" }}
          </h2>
        </div>
        <div class="flex items-center gap-3">
          <button
            class="w-[103px] h-[60px] px-4 py-2 text-[16px] font-medium text-orange-500 border border-orange-500 rounded-lg hover:bg-orange-50 cursor-pointer"
            @click="goBack"
          >
            Cancel
          </button>
          <button
            class="w-[103px] h-[60px] px-4 py-2 text-[16px] font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 cursor-pointer"
            @click="saveAssignment"
          >
            Save
          </button>
        </div>
      </header>

      <!-- Form -->
      <div class="px-10 pt-12">
        <div v-if="isLoading" class="text-center py-10">
          Loading...
        </div>
        <div v-else-if="errorMessage" class="text-center py-10 text-red-500">
          {{ errorMessage }}
        </div>
        <div v-else class="mx-auto w-full bg-white rounded-xl shadow-sm px-25 pt-10 pb-[60px]">
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
        <!-- Delete Button -->
          <div class="flex justify-end mt-8">
            <button
              class="text-sm text-blue-600 hover:text-blue-800 font-medium cursor-pointer"
              @click="openDeleteModal"
            >
              Delete Assignment
            </button>
          </div>
      </div>
    </main>
  </div>

  <!-- Delete Confirmation Modal -->

    <Modal
      v-model:open="showDeleteModal"
      title="Confirmation"
      message="Are you sure you want to delete this assignment?"
      left-text="No, Keep it"
      right-text="Yes, I want to delete this assignment"
      type="primary"
      variant="danger"
      right-button-class="w-[310px]"
      left-button-class="w-[147px]"
      @left-click="cancelDelete"
      @right-click="confirmDelete"
    />


</template>
