<script setup lang="ts">
import { computed } from "vue"
import { cn } from "@/lib/utils"
import { Input as BaseInput } from "@/components/ui/input"
import { Search, X } from "lucide-vue-next"

const props = defineProps<{
  modelValue?: string
  placeholder?: string
  class?: string
  disabled?: boolean
}>()

const emits = defineEmits<{
  (e: "update:modelValue", payload: string): void
  (e: "search", payload: string): void
  (e: "clear"): void
}>()

const modelValue = computed({
  get: () => props.modelValue || "",
  set: (value: string) => emits("update:modelValue", value)
})

const hasValue = computed(() => modelValue.value.length > 0)

const handleSearch = () => {
  if (modelValue.value.trim()) {
    emits("search", modelValue.value.trim())
  }
}

const handleClear = () => {
  modelValue.value = ""
  emits("clear")
}

const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === "Enter") {
    handleSearch()
  }
}
</script>

<template>
  <div :class="cn('relative w-full max-w-md', props.class)">
    <div class="relative">
      <BaseInput
        v-model="modelValue"
        :placeholder="placeholder ?? 'Search courses...'"
        :disabled="disabled"
        @keydown="handleKeydown"
        :class="cn(
          'h-12 w-full rounded-[10px] border bg-white pl-12 pr-12',
          'text-body2 text-gray-900 placeholder:text-gray-500',
          'shadow-none ring-0',
          'transition-all duration-200',
          'border-gray-300',
          'focus-visible:border-[#2F5FAC] focus-visible:ring-2 focus-visible:ring-[#2F5FAC]/20',
          'disabled:bg-gray-200 disabled:border-gray-400 disabled:text-gray-600 disabled:cursor-not-allowed',
        )"
      />

      <!-- Search Icon (Clickable) -->
      <button
        type="button"
        @click="handleSearch"
        class="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center cursor-pointer hover:opacity-70 transition-opacity"
      >
        <Search 
          class="w-5 h-5 text-gray-700"
          :class="{ 'text-gray-600': hasValue }"
        />
      </button>

      <!-- Clear Button -->
      <button
        v-if="hasValue && !disabled"
        type="button"
        @click="handleClear"
        class="absolute right-4 top-1/2 -translate-y-1/2
               flex items-center justify-center
               text-gray-400 hover:text-gray-600
               transition-colors duration-200 cursor-pointer z-10"
      >
        <X class="w-4 h-4" />
      </button>
    </div>
  </div>
</template>
