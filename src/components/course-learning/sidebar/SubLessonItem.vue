<script setup lang="ts">
import { Check } from "lucide-vue-next"
import { cn } from "@/lib/utils"
import type { Lesson } from "@/types/course-learning/sidebar-module"

defineProps<{
  lesson: Lesson
  isActive: boolean
}>()

const emit = defineEmits<{
  select: [lessonId: string]
}>()
</script>

<template>
  <li>
    <button
      type="button"
      class="flex w-full min-h-14 items-center gap-4 rounded-[12px] p-2 text-left transition-colors"
      :class="
        isActive ? 'bg-gray-100' : 'bg-transparent hover:bg-gray-100'
      "
      @click="emit('select', lesson.id)"
    >
      <span
        class="inline-flex size-[20px] shrink-0 items-center justify-center"
        aria-hidden="true"
      >
        <span
          v-if="lesson.status === 'completed'"
          class="inline-flex size-[20px] items-center justify-center rounded-full bg-green text-white"
        >
          <Check
            class="size-2.5"
            :stroke-width="3"
          />
        </span>
        <svg
          v-else-if="lesson.status === 'in_progress'"
          class="size-[20px] shrink-0 text-green"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          aria-hidden="true"
        >
          <circle
            cx="10"
            cy="10"
            r="9"
            fill="white"
            stroke="currentColor"
            stroke-width="2"
          />
          <path
            fill="currentColor"
            d="M10 1 A9 9 0 1 0 10 19 L10 10 Z"
          />
        </svg>
        <span
          v-else
          class="box-border inline-block size-[20px] shrink-0 rounded-full border-2 border-green bg-white"
        />
      </span>
      <span
        :class="
          cn(
            'min-w-0 flex-1 text-body3 text-gray-700',
            isActive && ' text-gray-900',
          )
        "
      >
        {{ lesson.title }}
      </span>
    </button>
  </li>
</template>
