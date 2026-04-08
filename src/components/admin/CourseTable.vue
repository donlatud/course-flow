<script setup lang="ts">
import type {
  CourseItem,
  CourseSortDir,
  CourseSortKey,
  CourseStatus,
} from "@/types/admin-course";
import iconEdit from "@/assets/icon-edit.svg";
import iconDelete from "@/assets/icon-delete.svg";
import { format, isValid, parseISO } from "date-fns";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-vue-next";

/** e.g. 12/02/2022 10:30PM */
function formatTableDateTime(value: string): string {
  if (!value?.trim()) return "—";
  const fromIso = parseISO(value);
  const date = isValid(fromIso) ? fromIso : new Date(value);
  if (!isValid(date)) return value;
  return format(date, "dd/MM/yyyy h:mma");
}

function statusBadgeClass(status: CourseStatus): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-emerald-100 text-emerald-800 ring-emerald-200/60";
    case "ARCHIVED":
      return "bg-amber-100 text-amber-900 ring-amber-200/60";
    default:
      return "bg-yellow-100 text-yellow-800 ring-yellow-200/60";
  }
}

const props = withDefaults(
  defineProps<{
    courses: CourseItem[];
    /** Shown when there are no rows (header is hidden). */
    emptyMessage?: string;
    /** Global index before first row (e.g. (page − 1) × pageSize → page 2 starts at 11). */
    rowOffset?: number;
    sortBy: CourseSortKey;
    sortDir: CourseSortDir;
  }>(),
  {
    emptyMessage: "No courses yet.",
    rowOffset: 0,
  },
);

const emit = defineEmits<{
  edit: [courseId: string];
  sort: [key: CourseSortKey];
}>();

function ariaSortFor(key: CourseSortKey): "ascending" | "descending" | "none" {
  if (props.sortBy !== key) return "none";
  return props.sortDir === "asc" ? "ascending" : "descending";
}
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
          <th class="px-6 py-4 text-body3 text-gray-800" scope="col">
            Course name
          </th>
          <th
            class="px-6 py-4 text-body3 text-gray-800"
            scope="col"
            :aria-sort="ariaSortFor('status')"
          >
            <button
              type="button"
              class="group inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left font-medium text-gray-800 hover:text-gray-950"
              @click="emit('sort', 'status')"
            >
              Status
              <ArrowUpDown
                v-if="props.sortBy !== 'status'"
                class="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-80"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowUp
                v-else-if="props.sortDir === 'asc'"
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowDown
                v-else
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
            </button>
          </th>
          <th
            class="px-6 py-4 text-body3 text-gray-800"
            scope="col"
            :aria-sort="ariaSortFor('lessonCount')"
          >
            <button
              type="button"
              class="group inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left font-medium text-gray-800 hover:text-gray-950"
              @click="emit('sort', 'lessonCount')"
            >
              Lesson
              <ArrowUpDown
                v-if="props.sortBy !== 'lessonCount'"
                class="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-80"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowUp
                v-else-if="props.sortDir === 'asc'"
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowDown
                v-else
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
            </button>
          </th>
          <th
            class="px-6 py-4 text-body3 text-gray-800"
            scope="col"
            :aria-sort="ariaSortFor('price')"
          >
            <button
              type="button"
              class="group inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left font-medium text-gray-800 hover:text-gray-950"
              @click="emit('sort', 'price')"
            >
              Price
              <ArrowUpDown
                v-if="props.sortBy !== 'price'"
                class="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-80"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowUp
                v-else-if="props.sortDir === 'asc'"
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowDown
                v-else
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
            </button>
          </th>
          <th
            class="px-6 py-4 text-body3 text-gray-800"
            scope="col"
            :aria-sort="ariaSortFor('createdAt')"
          >
            <button
              type="button"
              class="group inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left font-medium text-gray-800 hover:text-gray-950"
              @click="emit('sort', 'createdAt')"
            >
              Created date
              <ArrowUpDown
                v-if="props.sortBy !== 'createdAt'"
                class="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-80"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowUp
                v-else-if="props.sortDir === 'asc'"
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowDown
                v-else
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
            </button>
          </th>
          <th
            class="px-6 py-4 text-body3 text-gray-800"
            scope="col"
            :aria-sort="ariaSortFor('updatedAt')"
          >
            <button
              type="button"
              class="group inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left font-medium text-gray-800 hover:text-gray-950"
              @click="emit('sort', 'updatedAt')"
            >
              Updated date
              <ArrowUpDown
                v-if="props.sortBy !== 'updatedAt'"
                class="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-80"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowUp
                v-else-if="props.sortDir === 'asc'"
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
              <ArrowDown
                v-else
                class="h-4 w-4 shrink-0 text-blue-600"
                :stroke-width="2"
                aria-hidden="true"
              />
            </button>
          </th>
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
          <td class="px-4 py-4 text-sm tabular-nums text-slate-600">
            {{ rowOffset + index + 1 }}
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
          <td class="px-6 py-4">
            <span
              class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset"
              :class="statusBadgeClass(course.status)"
            >
              {{ course.statusLabel }}
            </span>
          </td>
          <td class="px-6 py-4 text-sm text-slate-600">
            {{ course.lessons }}
          </td>
          <td class="px-6 py-4 font-medium text-slate-700">
            {{ course.price }}
          </td>
          <td class="px-6 py-4 text-sm text-slate-500">
            {{ formatTableDateTime(course.createdAt) }}
          </td>
          <td class="px-6 py-4 text-sm text-slate-500">
            {{ formatTableDateTime(course.updatedAt) }}
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
