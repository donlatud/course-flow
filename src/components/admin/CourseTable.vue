<script setup lang="ts">
import type { CourseItem } from "@/views/admin/course.mock";

defineProps<{
  courses: CourseItem[]
}>()
</script>

<template>
  <div class="overflow-x-auto w-full rounded-xl border border-gray-100 bg-white shadow-sm">
    <table class="w-full border-collapse text-left">
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
                class="text-blue-500 transition-colors hover:text-blue-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                type="button"
                class="text-red-400 transition-colors hover:text-red-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
