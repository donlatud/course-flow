<script lang="ts" setup>
import type { CalendarCellTriggerProps } from "reka-ui";
import type { HTMLAttributes } from "vue";
import { reactiveOmit } from "@vueuse/core";
import { CalendarCellTrigger, useForwardProps } from "reka-ui";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const props = withDefaults(
  defineProps<CalendarCellTriggerProps & { class?: HTMLAttributes["class"] }>(),
  {
    as: "button",
  },
);

const delegatedProps = reactiveOmit(props, "class");

const forwardedProps = useForwardProps(delegatedProps);
</script>

<template>
  <CalendarCellTrigger
    data-slot="calendar-cell-trigger"
    :class="
      cn(
        buttonVariants({ variant: 'ghost' }),
        'size-9 p-0 font-normal aria-selected:opacity-100 cursor-pointer rounded-full!',

        // ปรับให้เป็นสีเทาอ่อน (Gray-300 หรือ Gray-400) และลด Opacity
        'data-[outside-view]:text-gray-300! data-[outside-view]:opacity-50! data-[outside-view]:pointer-events-none',

        // วันปัจจุบัน (Today)
        '[&[data-today]:not([data-selected])]:bg-gray-100! [&[data-today]:not([data-selected])]:text-gray-900!',

        // สีตอนเลือก (Selected)
        'data-[selected]:bg-blue-500! data-[selected]:text-white! data-[selected]:opacity-100!',

        // สถานะ Disabled (อายุ < 12 หรือ > 100)
        'data-[disabled]:text-gray-200! data-[disabled]:opacity-30!',

        props.class,
      )
    "
    v-bind="forwardedProps"
  >
    <slot />
  </CalendarCellTrigger>
</template>
