<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { ref, computed } from "vue"
import { useVModel } from "@vueuse/core"
import { cn } from "@/lib/utils"
import { Input as BaseInput } from "@/components/ui/input"
import { Eye, EyeOff } from "lucide-vue-next"

const props = defineProps<{
  defaultValue?: string | number
  modelValue?: string | number
  class?: HTMLAttributes["class"] 
  placeholder?: string
  type?: string
  disabled?: boolean
  disabledLabel?: string
  error?: boolean
  errorMessage?: string
  label?: string
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string | number): void
}>()

const modelValue = useVModel(props, "modelValue", emits, {
  passive: true,
  defaultValue: props.defaultValue,
})

const showPassword = ref(false)
const isPassword = computed(() => props.type === "password")

const inputType = computed(() => {
  if (isPassword.value) return showPassword.value ? "text" : "password"
  return props.type ?? "text"
})

const paddingRight = computed(() => {
  if (isPassword.value || (props.error && !props.disabled)) return "pr-12"
  return ""
})
</script>

<template>
  <div :class="cn('flex flex-col gap-1 w-full', props.class)">
    
    <label v-if="label" class="text-body3 font-medium text-gray-800">
      {{ label }}
    </label>

    <span v-if="disabled && disabledLabel" class="text-body3 text-gray-600">
      {{ disabledLabel }}
    </span>

    <div class="relative w-full">
      <BaseInput
        v-model="modelValue"
        :type="inputType"
        :placeholder="placeholder ?? 'Place Holder'"
        :disabled="disabled"
        :aria-invalid="error || undefined"
        :class="cn(
          'h-12 w-full rounded-[10px] border bg-white px-4',
          'text-body2 text-gray-900 placeholder:text-gray-500',
          'shadow-none ring-0',
          'transition-all duration-200',
          'border-gray-300',
          'focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20',
          'aria-invalid:border-(--color-purple) aria-invalid:ring-2 aria-invalid:ring-(--color-purple)/20',
          'disabled:bg-gray-200 disabled:border-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed',
          paddingRight,
        )"
      />

      <button
        v-if="isPassword && !disabled"
        type="button"
        class="absolute right-4 top-1/2 -translate-y-1/2
               flex items-center justify-center
               text-gray-500 hover:text-gray-800
               disabled:cursor-not-allowed disabled:opacity-50
               transition-colors duration-200 cursor-pointer z-10"
        @click="showPassword = !showPassword"
      >
        <EyeOff v-if="showPassword" class="w-5 h-5" />
        <Eye v-else class="w-5 h-5" />
      </button>

      <span
        v-if="error && !disabled && !isPassword"
        class="absolute right-4 top-1/2 -translate-y-1/2
               flex items-center justify-center
               w-6 h-6 rounded-full bg-(--color-purple)
               text-white text-[14px] font-bold select-none pointer-events-none z-10"
      >
        !
      </span>
    </div>

    <p v-if="error && errorMessage" class="text-body4 text-(--color-purple) mt-0.5">
      {{ errorMessage }}
    </p>
  </div>
</template>