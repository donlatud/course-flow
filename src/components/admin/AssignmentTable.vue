<script setup lang="ts">
import type {
  AssignmentItem,
  AssignmentSortDir,
  AssignmentSortKey,
} from "@/types/admin-assignment";
import iconEdit from "@/assets/icon-edit.svg";
import iconDelete from "@/assets/icon-delete.svg";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-vue-next";
import { format, isValid, parseISO } from "date-fns";

/** e.g. 12/02/2022 10:30PM */
function formatTableDateTime(value: string): string {
  if (!value?.trim()) return "—";
  const fromIso = parseISO(value);
  const date = isValid(fromIso) ? fromIso : new Date(value);
  if (!isValid(date)) return value;
  return format(date, "dd/MM/yyyy h:mma");
}

const props = withDefaults(
  defineProps<{
    assignments: AssignmentItem[];
    /** Shown when there are no rows (header is hidden). */
    emptyMessage?: string;
    /** Global index before first row (e.g. (page − 1) × pageSize → page 2 starts at 11). */
    rowOffset?: number;
    sortBy: AssignmentSortKey;
    sortDir: AssignmentSortDir;
  }>(),
  {
    emptyMessage: "No assignments yet.",
    rowOffset: 0,
  },
);

const emit = defineEmits<{
  edit: [assignmentId: string];
  delete: [assignmentId: string];
  sort: [key: AssignmentSortKey];
}>();

function ariaSortFor(key: AssignmentSortKey): "ascending" | "descending" | "none" {
  if (props.sortBy !== key) return "none";
  return props.sortDir === "asc" ? "ascending" : "descending";
}
</script>

<template>
  <div
    :class="[
      'w-full overflow-x-auto',
      assignments.length === 0
        ? ''
        : 'rounded-xl border border-gray-100 bg-white shadow-sm',
    ]"
  >
    <div
      v-if="assignments.length === 0"
      class="px-6 py-16 text-center text-body3 text-gray-500"
      role="status"
    >
      {{ emptyMessage }}
    </div>
    <table v-else class="w-full border-collapse text-left">
      <thead>
        <tr class="border-b border-gray-100 bg-gray-300">
          <th class="px-6 py-4 text-body3 text-gray-800 w-50" scope="col">
            Assignment detail
          </th>
          <th
            class="px-6 py-4 text-body3 text-gray-800 w-50"
            scope="col"
            :aria-sort="ariaSortFor('courseName')"
          >
            <button
              type="button"
              class="group inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left font-medium text-gray-800 hover:text-gray-950"
              @click="emit('sort', 'courseName')"
            >
              Course
              <ArrowUpDown
                v-if="props.sortBy !== 'courseName'"
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
            class="px-6 py-4 text-body3 text-gray-800 w-50"
            scope="col"
            :aria-sort="ariaSortFor('moduleName')"
          >
            <button
              type="button"
              class="group inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left font-medium text-gray-800 hover:text-gray-950"
              @click="emit('sort', 'moduleName')"
            >
              Lesson
              <ArrowUpDown
                v-if="props.sortBy !== 'moduleName'"
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
            class="px-6 py-4 text-body3 text-gray-800 w-50"
            scope="col"
            :aria-sort="ariaSortFor('subLessonName')"
          >
            <button
              type="button"
              class="group inline-flex max-w-full cursor-pointer items-center gap-1.5 text-left font-medium text-gray-800 hover:text-gray-950"
              @click="emit('sort', 'subLessonName')"
            >
              Sub-lesson
              <ArrowUpDown
                v-if="props.sortBy !== 'subLessonName'"
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
            class="px-6 py-4 text-body3 text-gray-800 w-50"
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
          <th class="px-6 py-4 text-center text-body3 text-gray-800 w-30">Action</th>
        </tr>
      </thead>

      <tbody class="divide-y divide-gray-50">
        <tr
          v-for="(assignment, index) in assignments"
          :key="assignment.id"
          :class="[
            'h-[88px] transition-colors hover:bg-slate-100',
            index % 2 === 0 ? 'bg-white' : 'bg-gray-50/60',
          ]"
        >
          <td class="px-6 py-4">
            <div class="flex flex-col gap-1">
              <span class="font-medium text-slate-700">
                {{ assignment.title }}
              </span>
              <span
                v-if="assignment.description"
                class="text-xs text-slate-500 line-clamp-2"
              >
                {{ assignment.description }}
              </span>
            </div>
          </td>
          <td class="px-6 py-4 text-sm text-slate-600">
            {{ assignment.courseName }}
          </td>
          <td class="px-6 py-4 text-sm text-slate-600">
            {{ assignment.moduleName }}
          </td>
          <td class="px-6 py-4 text-sm text-slate-600">
            {{ assignment.subLessonName }}
          </td>
          <td class="px-6 py-4 text-sm text-slate-500">
            {{ formatTableDateTime(assignment.createdAt) }}
          </td>
          <td class="px-6 py-4 text-center">
            <div class="flex justify-center gap-3">
              <button
                type="button"
                class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 transition hover:bg-red-50 hover:opacity-90 active:opacity-100"
                aria-label="Delete assignment"
                @click="emit('delete', assignment.id)"
              >
                <img
                  :src="iconDelete"
                  alt=""
                  class="pointer-events-none h-6 w-6"
                  width="24"
                  height="24"
                />
              </button>
              <button
                type="button"
                class="inline-flex cursor-pointer items-center justify-center rounded-md p-1 transition hover:bg-yellow-50 hover:opacity-90 active:opacity-100"
                aria-label="Edit assignment"
                @click="emit('edit', assignment.id)"
              >
                <img
                  :src="iconEdit"
                  alt=""
                  class="pointer-events-none h-6 w-6"
                  width="24"
                  height="24"
                />
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
