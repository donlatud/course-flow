<script setup lang="ts">
import type { Component } from "vue";
import { cn } from "@/lib/utils";

/**
 * Toast.vue = presentational UI only.
 * - Style tokens are injected from `base/toast/index.ts` presets.
 * - Do not call `toast.*` here; use `appToast` wrapper instead.
 */

/** Visual tokens passed from `appToast` presets */
export interface ToastPreset {
  trackClass: string;
  trackStroke?: string;
  progressClass: string;
  bgClass: string;
  borderClass: string;
  iconBgClass: string;
  iconColorClass: string;
  titleClass: string;
  descriptionClass: string;
  closeColorClass: string;
  closeHoverClass: string;
}

interface Props extends ToastPreset {
  title: string;
  description?: string;
  /** Image URL or Vue component */
  icon?: string | Component;
  /** Injected by vue-sonner for custom toast content */
  onCloseToast?: () => void;
}

const props = defineProps<Props>();
</script>

<template>
  <!-- Root container: update sizing/spacing/shape here. -->
  <div
    :class="
      cn(
        'relative flex w-[calc(100vw-32px)] items-center gap-3 overflow-hidden rounded-[8px] border px-[18px] py-[14px] sm:w-[360px]',
        'animate-in slide-in-from-right-4 duration-300',
        'shadow-2',
        props.bgClass,
        props.borderClass,
      )
    "
  >
    <!-- Icon container with countdown ring. -->
    <div class="relative size-10 shrink-0">
      <svg
        class="pointer-events-none absolute inset-0 size-10 -rotate-90"
        viewBox="0 0 40 40"
        aria-hidden="true"
      >
        <circle
          cx="20"
          cy="20"
          r="17"
          :stroke="props.trackStroke"
          :class="cn('fill-none stroke-3', props.trackClass)"
        />
        <circle
          cx="20"
          cy="20"
          r="17"
          class="fill-none stroke-current stroke-3 [stroke-linecap:round] animate-app-toast-progress"
          pathLength="100"
          stroke-dasharray="100"
          :class="props.progressClass"
        />
      </svg>
      <div
        :class="
          cn(
            'absolute left-1/2 top-1/2 z-1 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full [&_svg]:size-10',
            props.iconBgClass,
            props.iconColorClass,
          )
        "
      >
        <img
          v-if="typeof props.icon === 'string'"
          :src="props.icon"
          alt=""
          class="size-10"
        />
        <component
          :is="props.icon"
          v-else-if="props.icon"
          :class="props.iconColorClass"
        />
      </div>
    </div>

    <!-- Text block: title + optional description. -->
    <div class="min-w-0 flex-1">
      <p :class="cn('leading-snug tracking-tight', props.titleClass)">
        {{ props.title }}
      </p>
      <p
        v-if="props.description"
        :class="cn('mt-0.5 leading-snug', props.descriptionClass)"
      >
        {{ props.description }}
      </p>
    </div>

    <!-- Close action injected by vue-sonner (`onCloseToast`). -->
    <button
      type="button"
      :class="
        cn(
          'flex size-[22px] shrink-0 cursor-pointer items-center justify-center rounded-full text-[11px] font-bold transition-all duration-150',
          props.iconBgClass,
          props.closeColorClass,
          props.closeHoverClass,
        )
      "
      aria-label="Close"
      @click="props.onCloseToast?.()"
    >
      ✕
    </button>
  </div>
</template>
