<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { useVModel } from "@vueuse/core";
import { format, subYears, startOfDay } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-vue-next";
import { cn } from "@/lib/utils";

import type { DateValue } from "reka-ui";
import { CalendarDate, today, getLocalTimeZone } from "@internationalized/date";

import { Button } from "@/components/ui/button";

import Calendar from "@/components/ui/calendar/Calendar.vue";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const props = defineProps<{
  modelValue?: Date;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  class?: string;
}>();

const emits = defineEmits<{
  (e: "update:modelValue", payload: Date | undefined): void;
}>();
const date = useVModel(props, "modelValue", emits, { passive: true });

const maxSelectableDate = computed(() =>
  today(getLocalTimeZone()).subtract({ years: 12 }),
);
const minSelectableDate = computed(() =>
  today(getLocalTimeZone()).subtract({ years: 100 }),
);
const calendarPlaceholder = ref<DateValue>(maxSelectableDate.value as any);

const isDateDisabled = (dateVal: DateValue) => {
  const jsDate = new Date(dateVal.year, dateVal.month - 1, dateVal.day);
  const todayDate = new Date();
  return (
    jsDate > subYears(startOfDay(todayDate), 12) ||
    jsDate < subYears(startOfDay(todayDate), 100)
  );
};

const handleDateSelect = (val: DateValue | undefined) => {
  date.value = val ? new Date(val.year, val.month - 1, val.day) : undefined;
};

const calendarValue = computed<DateValue | undefined>(() => {
  if (!date.value) return undefined;
  return new CalendarDate(
    date.value.getFullYear(),
    date.value.getMonth() + 1,
    date.value.getDate(),
  ) as any;
});

const formattedDate = computed(() =>
  date.value ? format(date.value, "dd/MM/yyyy") : "",
);

watch(
  date,
  (newVal) => {
    if (newVal)
      calendarPlaceholder.value = new CalendarDate(
        newVal.getFullYear(),
        newVal.getMonth() + 1,
        newVal.getDate(),
      ) as any;
  },
  { immediate: true },
);
</script>

<template>
  <div :class="cn('flex flex-col gap-1 w-full', props.class)">
    <label v-if="label" class="text-body3 font-medium text-gray-800">{{
      label
    }}</label>

    <Popover>
      <PopoverTrigger as-child>
        <Button
          variant="outline"
          :disabled="disabled"
          :class="cn(
            'h-12! w-full justify-between rounded-[10px]! border bg-white px-4 text-left font-normal shadow-none transition-all duration-200 cursor-pointer',
            'border-gray-300 hover:bg-white outline-none!',
            !date && 'text-gray-500',
            'data-[state=open]:border-orange-500! data-[state=open]:ring-2! data-[state=open]:ring-orange-500/20!',
            error && 'border-purple! ring-2! ring-purple/20!',
            disabled && 'bg-gray-200! border-gray-400! text-gray-600! cursor-not-allowed!'
          )"
        >
          <span
            :class="cn('text-body2', date ? 'text-gray-900' : 'text-gray-500')"
          >
            {{ formattedDate || placeholder || "dd/MM/yyyy" }}
          </span>
          <CalendarIcon class="h-5 w-5 text-gray-400" />
        </Button>
      </PopoverTrigger>

      <PopoverContent 
        :class="cn(
          'p-0 rounded-[10px] border border-gray-300 shadow-2 z-100',
          'w-[calc(100vw-32px)] sm:w-87.5' // Mobile: near full width / Desktop: fixed width
        )" 
        align="center" 
        :side-offset="8"
      >
        <Calendar
          :model-value="calendarValue"
          @update:model-value="handleDateSelect"
          v-model:placeholder="calendarPlaceholder as any"
          :is-date-disabled="isDateDisabled"
          :max-value="maxSelectableDate"
          :min-value="minSelectableDate"
          initial-focus
        />
      </PopoverContent>
    </Popover>
    
    <p v-if="error && errorMessage" class="text-body4 text-purple mt-0.5">{{ errorMessage }}</p>
  </div>
</template>
