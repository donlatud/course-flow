<script setup lang="ts">
import iconDelete from "@/assets/icon-delete.svg";
import iconEdit from "@/assets/icon-edit.svg";

defineProps<{
  lessons: Array<{
    id: number;
    name: string;
    subLesson: number;
  }>;
}>();

const emit = defineEmits<{
  edit: [lessonId: number];
  delete: [lessonId: number];
}>();
</script>

<template>
  <div class="overflow-x-auto w-full rounded-xl border border-gray-100 bg-white shadow-sm">
    <table class="w-full border-collapse text-left">
      <thead>
        <tr class="border-b border-gray-100 bg-gray-300">
          <th class="w-[48px] px-4 py-4"></th>
          <th class="w-[48px] px-2 py-4 text-body3 text-gray-800"></th>
          <th class="px-6 py-4 text-body3 text-gray-800">Lesson name</th>
          <th class="px-6 py-4 text-body3 text-gray-800">Sub-lesson</th>
          <th class="px-6 py-4 text-center text-body3 text-gray-800">Action</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-50">
        <tr
          v-for="(lesson, index) in lessons"
          :key="lesson.id"
          :class="[
            'h-[80px] transition-colors hover:bg-slate-100',
            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60',
          ]"
        >
          <td class="px-4 py-4 text-gray-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <circle cx="6" cy="5" r="1.2" />
              <circle cx="6" cy="10" r="1.2" />
              <circle cx="6" cy="15" r="1.2" />
              <circle cx="12" cy="5" r="1.2" />
              <circle cx="12" cy="10" r="1.2" />
              <circle cx="12" cy="15" r="1.2" />
            </svg>
          </td>
          <td class="px-2 py-4 text-sm text-center text-slate-700">
            {{ index + 1 }}
          </td>
          <td class="px-6 py-4">
            <span class="font-medium text-slate-700">
              {{ lesson.name }}
            </span>
          </td>
          <td class="px-6 py-4 text-slate-700">
            {{ lesson.subLesson }}
          </td>
          <td class="px-6 py-4 text-center">
            <div class="flex justify-center gap-3">
              <button
                type="button"
                class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 transition hover:bg-red-50 hover:opacity-90 active:opacity-100"
                aria-label="Delete lesson"
                @click="emit('delete', lesson.id)"
              >
                <img
                  :src="iconDelete"
                  alt=""
                  class="pointer-events-none h-5 w-5"
                  width="20"
                  height="20"
                />
              </button>
              <button
                type="button"
                class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 transition hover:bg-blue-50 hover:opacity-90 active:opacity-100"
                aria-label="Edit lesson"
                @click="emit('edit', lesson.id)"
              >
                <img
                  :src="iconEdit"
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
