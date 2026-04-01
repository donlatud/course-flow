<script lang="ts" setup>
import type { CalendarRootEmits, CalendarRootProps, DateValue } from "reka-ui";
import type { HTMLAttributes, Ref } from "vue";
import { getLocalTimeZone, today } from "@internationalized/date";
import { createReusableTemplate, reactiveOmit, useVModel } from "@vueuse/core";
import { CalendarRoot, useDateFormatter, useForwardPropsEmits } from "reka-ui";
import { createYear, createYearRange, toDate } from "reka-ui/date";
import { computed, toRaw } from "vue";
import { cn } from "@/lib/utils";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarNextButton,
  CalendarPrevButton,
} from ".";

const props = withDefaults(
  defineProps<
    CalendarRootProps & {
      class?: HTMLAttributes["class"];
      layout?: any;
      yearRange?: DateValue[];
    }
  >(),
  {
    modelValue: undefined,
    layout: "month-and-year",
  },
);
const emits = defineEmits<CalendarRootEmits>();

const delegatedProps = reactiveOmit(props, "class", "layout", "placeholder");

const placeholder = useVModel(props, "placeholder", emits, {
  passive: true,
  defaultValue: props.defaultPlaceholder ?? today(getLocalTimeZone()),
}) as Ref<DateValue>;

const formatter = useDateFormatter(props.locale ?? "en");

const yearRange = computed(() => {
  if (props.minValue && props.maxValue) {
    return createYearRange({ start: props.minValue, end: props.maxValue });
  }
  const baseDate =
    toRaw(placeholder.value) ||
    props.defaultPlaceholder ||
    today(getLocalTimeZone());
  return (
    props.yearRange ??
    createYearRange({
      start: props?.minValue ?? baseDate.cycle("year", -100),
      end: props?.maxValue ?? baseDate.cycle("year", 0),
    })
  );
});

const isMonthDisabled = (monthDate: DateValue) => {
  if (props.maxValue && monthDate.year === props.maxValue.year) {
    return monthDate.month > props.maxValue.month;
  }
  if (props.minValue && monthDate.year === props.minValue.year) {
    return monthDate.month < props.minValue.month;
  }
  return false;
};

const [DefineMonthTemplate, ReuseMonthTemplate] = createReusableTemplate<{
  date: DateValue;
}>();
const [DefineYearTemplate, ReuseYearTemplate] = createReusableTemplate<{
  date: DateValue;
}>();
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <DefineMonthTemplate v-slot="{ date }">
    <Select
      :model-value="date.month.toString()"
      @update:model-value="
        (v) => {
          placeholder = placeholder.set({ month: Number(v) });
        }
      "
    >
      <SelectTrigger
        class="h-8 w-[75px] sm:w-[110px] gap-1 border-none bg-transparent px-2 py-0 font-medium text-sm focus:ring-0 shadow-none hover:bg-gray-100 rounded-md cursor-pointer transition-all"
      >
        <SelectValue>
          <span class="sm:hidden">{{
            formatter.custom(toDate(date), { month: "short" })
          }}</span>
          <span class="hidden sm:inline">{{
            formatter.custom(toDate(date), { month: "long" })
          }}</span>
        </SelectValue>
      </SelectTrigger>
      <SelectContent class="z-[110]">
        <SelectItem
          v-for="month in createYear({ dateObj: date })"
          :key="month.toString()"
          :value="month.month.toString()"
          :disabled="isMonthDisabled(month)"
          class="cursor-pointer data-[disabled]:text-gray-300! data-[disabled]:opacity-50! data-[disabled]:pointer-events-none"
        >
          <span class="sm:hidden">{{
            formatter.custom(toDate(month), { month: "short" })
          }}</span>
          <span class="hidden sm:inline">{{
            formatter.custom(toDate(month), { month: "long" })
          }}</span>
        </SelectItem>
      </SelectContent>
    </Select>
  </DefineMonthTemplate>

  <DefineYearTemplate v-slot="{ date }">
    <Select
      :model-value="date.year.toString()"
      @update:model-value="
        (v) => {
          placeholder = placeholder.set({ year: Number(v) });
        }
      "
    >
      <SelectTrigger
        class="h-8 w-[75px] sm:w-[85px] gap-1 border-none bg-transparent px-2 py-0 font-medium text-sm focus:ring-0 shadow-none hover:bg-gray-100 rounded-md cursor-pointer transition-all"
      >
        <SelectValue />
      </SelectTrigger>
      <SelectContent class="z-[110] max-h-50">
        <SelectItem
          v-for="year in yearRange"
          :key="year.toString()"
          :value="year.year.toString()"
          class="cursor-pointer"
        >
          {{ formatter.custom(toDate(year), { year: "numeric" }) }}
        </SelectItem>
      </SelectContent>
    </Select>
  </DefineYearTemplate>

  <CalendarRoot
    v-slot="{ grid, weekDays, date }"
    v-bind="forwarded"
    :placeholder="placeholder"
    @update:placeholder="
      (v: any) => {
        placeholder = v;
      }
    "
    :class="
      cn(
        'p-3 bg-white w-full max-w-[320px] sm:max-w-none mx-auto rounded-[10px]',
        props.class,
      )
    "
  >
    <CalendarHeader class="relative flex items-center justify-between pt-1">
      <CalendarPrevButton
        class="bg-transparent hover:bg-gray-100 text-gray-900 border-none cursor-pointer rounded-full h-8 w-8"
      />
      <div class="flex items-center gap-0 sm:gap-1">
        <ReuseMonthTemplate :date="date" />
        <ReuseYearTemplate :date="date" />
      </div>
      <CalendarNextButton
        class="bg-transparent hover:bg-gray-100 text-gray-900 border-none cursor-pointer rounded-full h-8 w-8"
      />
    </CalendarHeader>

    <div class="mt-4 flex flex-col items-center">
      <CalendarGrid
        v-for="month in grid"
        :key="month.value.toString()"
        class="w-full"
      >
        <CalendarGridHead>
          <CalendarGridRow class="flex justify-between mb-1">
            <CalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              class="text-gray-400 font-normal text-[11px] sm:text-xs uppercase w-9 text-center"
            >
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow
            v-for="(weekDates, index) in month.rows"
            :key="index"
            class="mt-1 w-full flex justify-between"
          >
            <CalendarCell
              v-for="weekDate in weekDates"
              :key="weekDate.toString()"
              :date="weekDate"
              class="p-0 relative flex-1 flex justify-center"
            >
              <CalendarCellTrigger :day="weekDate" :month="month.value" />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>
