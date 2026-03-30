<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import CustomInput from "@/components/base/input/CustomInput.vue";
import AttachFileInput from "@/components/base/input/AttachFileInput.vue";
import MediaInput from "@/components/base/input/MediaInput.vue";
import PromoCard from "@/components/admin/PromoCard.vue";
import LessonTable from "@/components/admin/LessonTable.vue";
import { lessonMock as lessons } from "@/views/admin/lesson.mock";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ArrowLeft } from "lucide-vue-next";

const textareaBaseClass = cn(
  "w-full resize-y rounded-[10px] border border-gray-300 bg-white px-4 py-3",
  "text-body2 text-gray-900 placeholder:text-gray-500 shadow-none",
  "transition-all duration-200 outline-none",
  "focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20"
);


const router = useRouter();

const courseName = ref("");
const coursePrice = ref("");
const totalLearningTime = ref("");
const courseSummary = ref("");
const courseDetail = ref("");
const coverImageFile = ref<File | null>(null);
const trailerVideoFile = ref<File | null>(null);
const attachmentFile = ref<File | null>(null);

const promoEnabled = ref(false);
const promoCode = ref("");
const promoDiscount = ref("");
const promoValidFrom = ref("");
const promoValidUntil = ref("");

function goToCourseList() {
  router.push({ name: "admin-course" });
}
</script>

<template>
  <section class="flex min-h-screen flex-col">
    <div
      class="flex h-[92px] shrink-0 items-center justify-between gap-6 border-b border-gray-200 bg-white px-8"
    >
          <div class="flex min-w-0 flex-1 items-center gap-4">
            <button
              type="button"
              class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100"
              aria-label="Back to course list"
              @click="goToCourseList"
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
              @click="goToCourseList"
            >
              Cancel
            </button>
            <button
              type="button"
              class="h-15 w-[95px] min-w-[100px] rounded-xl bg-blue-500 px-6 text-[16px] font-bold text-white transition-colors hover:bg-blue-400 active:bg-blue-700"
            >
              Create
            </button>
          </div>
        </div>
        <div class="min-h-0 flex-1 overflow-y-auto px-10 pt-10">
          <div class="flex h-fit w-full flex-1 rounded-2xl bg-white">
            <div
              class="mx-auto flex h-fit w-full flex-col gap-10 px-8 pb-10 pt-10 sm:px-12 lg:px-25"
            >
              <CustomInput
                v-model="courseName"
                label="Course name"
                placeholder="e.g. Service Design Essentials"
              />
              <div
                class="flex w-full flex-col gap-6 md:flex-row md:items-start md:gap-10"
              >
                <CustomInput
                  v-model="coursePrice"
                  class="min-w-0 flex-1"
                  label="Price"
                  placeholder="0.00"
                />
                <CustomInput
                  v-model="totalLearningTime"
                  class="min-w-0 flex-1"
                  label="Total learning time"
                  placeholder="e.g. 6"
                />
              </div>
              <div class="flex flex-col gap-4">
                <div class="flex items-center gap-3">
                  <input
                    id="promo-checkbox"
                    v-model="promoEnabled"
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
                  v-if="promoEnabled"
                  v-model:promo-code="promoCode"
                  v-model:discount="promoDiscount"
                  v-model:valid-from="promoValidFrom"
                  v-model:valid-until="promoValidUntil"
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
                  v-model="courseSummary"
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
                  v-model="courseDetail"
                  required
                  placeholder="Place Holder"
                  :class="cn(textareaBaseClass, 'min-h-[220px]')"
                  aria-required="true"
                />
              </div>
              <MediaInput
                v-model="coverImageFile"
                title="Cover image *"
                subtitle="Supported file types: .jpg, .png, .jpeg. Max file size: 5 MB"
                uploadtext="Upload Image"
                class="w-[240px] h-[240px]"
              />

              <MediaInput
                v-model="trailerVideoFile"
                title="Video trailer *"
                subtitle="Supported file types: .mp4, .mov, .avi. Max file size: 20 MB"
                uploadtext="Upload Video"
                class="w-[240px] h-[240px]"
                accept="video/mp4,video/quicktime,video/x-msvideo,.mp4,.mov,.avi"
              />

              <AttachFileInput
                v-model="attachmentFile"
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
                >
                  + Add Lesson
                </button>
              </div>
            </div>

            <LessonTable :lessons="lessons" />
          </div>
        </div>
  </section>
</template>
