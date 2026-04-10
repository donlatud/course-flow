<script setup lang="ts">
import { computed, ref } from "vue";
import type { HTMLAttributes } from "vue";
import { ChevronDown, X } from "lucide-vue-next";
import { cn } from "@/lib/utils";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export interface CourseMultiOption {
  id: string;
  title: string;
  /** แถวใน dropdown เช่น "ชื่อคอร์ส (1,299 THB)" */
  listLabel: string;
}

const props = withDefaults(
  defineProps<{
    modelValue?: string[];
    options: CourseMultiOption[];
    label?: string;
    placeholder?: string;
    disabled?: boolean;
    class?: HTMLAttributes["class"];
  }>(),
  {
    modelValue: () => [],
    placeholder: "Select courses",
  },
);

const emit = defineEmits<{
  (e: "update:modelValue", payload: string[]): void;
}>();

const open = ref(false);

const selectedIds = computed({
  get: () => props.modelValue ?? [],
  set: (v) => emit("update:modelValue", v),
});

const optionById = computed(() => {
  const m = new Map<string, CourseMultiOption>();
  for (const o of props.options) m.set(o.id, o);
  return m;
});

const selectedChips = computed(() => {
  return selectedIds.value
    .map((id) => optionById.value.get(id))
    .filter((o): o is CourseMultiOption => o != null);
});

const visibleSelectedCount = computed(() => {
  const allow = new Set(props.options.map((o) => o.id));
  return selectedIds.value.filter((id) => allow.has(id)).length;
});

// "All courses" should be checked only when every visible course is selected.
const allCheckboxModel = computed<boolean>(() => {
  const n = props.options.length;
  if (n === 0) return false;
  const c = visibleSelectedCount.value;
  return c === n;
});

function isSelected(id: string) {
  return selectedIds.value.includes(id);
}

function setSelected(id: string, checked: boolean) {
  const cur = [...selectedIds.value];
  const i = cur.indexOf(id);
  if (checked) {
    if (i < 0) cur.push(id);
  } else if (i >= 0) {
    cur.splice(i, 1);
  }
  selectedIds.value = cur;
}

function removeChip(id: string, e: MouseEvent) {
  e.stopPropagation();
  setSelected(id, false);
}

function onAllUpdate(v: boolean | "indeterminate") {
  if (props.options.length === 0) return;
  if (v === true) {
    selectedIds.value = props.options.map((o) => o.id);
  } else {
    selectedIds.value = [];
  }
}

function toggleAllFromRow() {
  if (props.options.length === 0) return;
  if (visibleSelectedCount.value === props.options.length) {
    selectedIds.value = [];
  } else {
    selectedIds.value = props.options.map((o) => o.id);
  }
}

function onRowClick(id: string) {
  setSelected(id, !isSelected(id));
}
</script>

<template>
  <div :class="cn('flex w-full flex-col gap-1', props.class)">
    <label
      v-if="label"
      class="text-body3 font-medium text-gray-700"
    >
      {{ label }}
    </label>

    <Popover v-model:open="open">
      <PopoverTrigger as="div" as-child>
        <div
          role="button"
          :tabindex="disabled ? -1 : 0"
          :class="
            cn(
              'flex min-h-12 w-full cursor-pointer items-start gap-2 rounded-[10px] border bg-white px-3 py-2 text-left shadow-none outline-none transition-all duration-200',
              'border-[#9AA1B9] hover:border-[#9AA1B9]',
              'focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20',
              'data-[state=open]:border-orange-500 data-[state=open]:ring-2 data-[state=open]:ring-orange-500/20',
              disabled &&
                'pointer-events-none cursor-not-allowed border-gray-600 bg-blue-100 text-gray-700 opacity-100',
            )
          "
        >
          <div
            class="flex min-h-[28px] min-w-0 flex-1 flex-wrap items-center gap-2"
          >
            <template v-if="selectedChips.length">
              <span
                v-for="chip in selectedChips"
                :key="chip.id"
                class="inline-flex max-w-full items-center gap-1 rounded-[8px] border border-blue-300 bg-blue-100 px-2.5 py-0.5 text-body2 text-gray-900"
              >
                <span class="truncate">{{ chip.title }}</span>
                <button
                  type="button"
                  class="inline-flex shrink-0 cursor-pointer rounded p-0.5 text-blue-500 hover:bg-blue-100 hover:text-blue-500"
                  @click.stop="removeChip(chip.id, $event)"
                >
                  <X class="h-3.5 w-3.5" stroke-width="2.5" />
                </button>
              </span>
            </template>
            <span
              v-else
              class="text-body2 text-gray-700"
            >{{ placeholder }}</span>
          </div>
          <ChevronDown
            class="mt-0.5 h-5 w-5 shrink-0 text-gray-700 transition-transform duration-200"
            :class="{ '-rotate-180': open }"
          />
        </div>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        :side-offset="8"
        :class="
          cn(
            'z-100 max-h-[min(18rem,70vh)] w-(--reka-popover-trigger-width) overflow-hidden rounded-[10px] border border-gray-600 bg-white p-0 shadow-2',
          )
        "
      >
        <div class="max-h-[min(18rem,70vh)] overflow-y-auto py-1">
          <div
            v-if="options.length === 0"
            class="px-4 py-3 text-body2 text-gray-700"
          >
            No courses match minimum purchase
          </div>

          <template v-else>
            <div
              class="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-body2 transition-colors hover:bg-blue-100"
              @click="toggleAllFromRow"
            >
              <Checkbox
                :model-value="allCheckboxModel"
                class="border-gray-600 data-[state=checked]:border-blue-500! data-[state=checked]:bg-blue-500!"
                @click.stop
                @update:model-value="onAllUpdate"
              />
              <span class="text-gray-700">All courses</span>
            </div>

            <div
              v-for="opt in options"
              :key="opt.id"
              class="flex w-full cursor-pointer items-center gap-3 px-3 py-2.5 text-left text-body2 transition-colors hover:bg-blue-100"
              @click="onRowClick(opt.id)"
            >
              <Checkbox
                :model-value="isSelected(opt.id)"
                class="border-gray-600 data-[state=checked]:border-blue-500! data-[state=checked]:bg-blue-500!"
                @click.stop
                @update:model-value="(v) => setSelected(opt.id, v === true)"
              />
              <span class="text-gray-700">{{ opt.listLabel }}</span>
            </div>
          </template>
        </div>
      </PopoverContent>
    </Popover>
  </div>
</template>
