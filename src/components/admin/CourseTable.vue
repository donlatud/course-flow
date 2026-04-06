<script setup lang="ts">
import type { CourseItem } from "@/types/admin-course";
import iconEdit from "@/assets/icon-edit.svg";
import iconDelete from "@/assets/icon-delete.svg";

withDefaults(
  defineProps<{
    courses: CourseItem[];
    /** Shown when there are no rows (header is hidden). */
    emptyMessage?: string;
  }>(),
  {
    emptyMessage: "No courses yet.",
  },
);

const emit = defineEmits<{
  edit: [courseId: string];
}>();
</script>

<template>
  <div
    :class="[
      'w-full overflow-x-auto',
      courses.length === 0
        ? ''
        : 'rounded-xl border border-gray-100 bg-white shadow-sm',
    ]"
  >
    <div
      v-if="courses.length === 0"
      class="px-6 py-16 text-center text-body3 text-gray-500"
      role="status"
    >
      {{ emptyMessage }}
    </div>
    <table v-else class="w-full border-collapse text-left">
      <thead>
        <tr class="border-b border-gray-100 bg-gray-300">
          <th class="px-6 py-4 text-body3 text-gray-800"></th>
          <th class="px-6 py-4 text-body3 text-gray-800">Image</th>
          <th class="px-6 py-4 text-body3 text-gray-800">Course name</th>
          <th class="px-6 py-4 text-body3 text-gray-800">Lesson</th>
          <th class="px-6 py-4 text-body3 text-gray-800">Price</th>
          <th class="px-6 py-4 text-body3 text-gray-800">Created date</th>
          <th class="px-6 py-4 text-body3 text-gray-800">Updated date</th>
          <th class="px-6 py-4 text-center text-body3 text-gray-800">Action</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-50">
        <tr
          v-for="(course, index) in courses"
          :key="course.id"
          :class="[
            'h-[88px] transition-colors hover:bg-slate-100',
            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60',
          ]"
        >
          <td class="px-6 py-4 text-sm text-slate-600">
            {{ index + 1 }}
          </td>
          <td class="px-6 py-1">
            <img
              :src="course.image"
              alt="Course"
              class="h-16 w-24 rounded-md object-cover shadow-sm"
            >
          </td>
          <td class="px-6 py-4">
            <span class="font-medium text-slate-700">
              {{ course.name }}
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-slate-600">
            {{ course.lessons }}
          </td>
          <td class="px-6 py-4 font-medium text-slate-700">
            {{ course.price }}
          </td>
          <td class="px-6 py-4 text-sm text-slate-500">
            {{ course.createdAt }}
          </td>
          <td class="px-6 py-4 text-sm text-slate-500">
            {{ course.updatedAt }}
          </td>
          <td class="px-6 py-4 text-center">
            <div class="flex justify-center gap-3">
              <button
                type="button"
                class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 transition hover:bg-yellow-50 hover:opacity-90 active:opacity-100"
                aria-label="Edit course"
                @click="emit('edit', course.id)"
              >
                <img
                  :src="iconEdit"
                  alt=""
                  class="pointer-events-none h-5 w-5"
                  width="20"
                  height="20"
                />
              </button>
              <button
                type="button"
                class="inline-flex cursor-pointer  items-center justify-center rounded-md p-1 opacity-50"
                aria-label="Delete course"
                disabled
              >
                <img
                  :src="iconDelete"
                  alt=""
                  class="pointer-events-none h-5 w-5"
                  width="20"
                  height="20"
                />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
