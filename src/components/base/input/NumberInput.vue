<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { computed, ref, watch } from "vue";
import { useVModel } from "@vueuse/core";
import { cn } from "@/lib/utils";
import { Input as BaseInput } from "@/components/ui/input";

const props = defineProps<{
  modelValue?: string | number;
  defaultValue?: string | number;
  class?: HTMLAttributes["class"];
  label?: string;
  placeholder?: string;
  supportingText?: string;
  step?: number;
  min?: number;
  max?: number;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", payload: string | number): void;
  (e: "change", payload: string | number): void;
}>();

const internalValue = useVModel(props, "modelValue", emit, {
  passive: false,
  defaultValue: props.defaultValue ?? "",
});

const isFocused = ref(false);

function toCleanedNumericString(raw: unknown): string {
  // Vue may pass a number from <input type="number">; never call .replace on a number.
  return String(raw ?? "").replace(/[^\d.]/g, "");
}

const numericString = computed<string>({
  get() {
    return String(internalValue.value ?? "");
  },
  set(raw) {
    internalValue.value = toCleanedNumericString(raw);
  },
});

watch(
  () => internalValue.value,
  (val) => {
    const cleaned = toCleanedNumericString(val);
    if (cleaned !== String(val ?? "")) {
      internalValue.value = cleaned;
    }
  },
);
</script>

<template>
  <div :class=" cn('flex w-full flex-col gap-1 ', props.class)">
    <label v-if="label" class="text-body3 font-medium text-gray-800">
      {{ label }}
    </label>

    <div class="relative w-full ">
      <BaseInput
        v-model="numericString"
        type="number"
        inputmode="decimal"
        autocomplete="off"
        :placeholder="placeholder ?? '0'"
        :disabled="disabled"
        class="h-12 w-full rounded-[10px] border bg-white px-4
               text-body2 text-gray-900 placeholder:text-gray-500
               shadow-none ring-0 transition-all duration-200
               border-gray-300
               focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20
               disabled:bg-gray-200 disabled:border-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed"
        @focus="isFocused = true"
        @blur="isFocused = false"
      />

    </div>

    <p
      v-if="supportingText && isFocused"
      class="text-body4 text-orange-500"
    >
      {{ supportingText }}
    </p>
  </div>
</template>

