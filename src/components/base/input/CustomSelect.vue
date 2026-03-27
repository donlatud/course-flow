<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { useVModel } from "@vueuse/core";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const props = defineProps<{
  modelValue?: string;
  defaultValue?: string;
  class?: HTMLAttributes["class"];
  placeholder?: string;
  label?: string;
  options: { label: string; value: string }[];
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
}>();

const emits = defineEmits<{
  (e: "update:modelValue", payload: string): void;
}>();

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
});
</script>

<template>
  <div :class="cn('flex flex-col gap-1 w-full', props.class)">
    <label v-if="label" class="text-body3 font-medium text-gray-800">
      {{ label }}
    </label>

    <Select v-model="modelValue" :disabled="disabled">
      <SelectTrigger
        :class="
          cn(
            'h-12! w-full rounded-[10px]! border bg-white px-4 cursor-pointer',
            'text-body2 text-gray-900 shadow-none transition-all duration-200',
            'border-gray-300 outline-none',
            'data-[state=open]:border-orange-500 data-[state=open]:ring-2 data-[state=open]:ring-orange-500/20',
            error &&
              'border-(--color-purple) ring-2 ring-(--color-purple)/20 focus:border-(--color-purple) focus:ring-(--color-purple)/20',
            disabled &&
              'bg-gray-200 border-gray-400 text-gray-600 cursor-not-allowed opacity-100',
          )
        "
      >
        <SelectValue :placeholder="placeholder ?? 'select'" />
      </SelectTrigger>

      <SelectContent
        class="bg-white rounded-[10px] border border-gray-300 shadow-2 z-99"
      >
        <SelectGroup>
          <SelectItem
            v-for="item in options"
            :key="item.value"
            :value="item.value"
            class="text-body2 py-2 px-4 focus:bg-gray-100 cursor-pointer transition-colors"
          >
            {{ item.label }}
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>

    <p v-if="error && errorMessage" class="text-body4 text-purple mt-0.5">
      {{ errorMessage }}
    </p>
  </div>
</template>
