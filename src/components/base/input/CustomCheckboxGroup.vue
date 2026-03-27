<script setup lang="ts">
import Checkbox from '@/components/ui/checkbox/Checkbox.vue'
import { cn } from '@/lib/utils'

interface Option {
  id: string | number
  label: string
}

const props = defineProps<{
  options: Option[]
  modelValue: (string | number)[]
  class?: string
}>()

const emit = defineEmits(['update:modelValue'])

const handleToggle = (id: string | number) => {
  const currentSelection = [...props.modelValue]
  const index = currentSelection.indexOf(id)

  if (index > -1) {
    currentSelection.splice(index, 1)
  } else {
    currentSelection.push(id)
  }
  emit('update:modelValue', currentSelection)
}
</script>

<template>
  <div :class="cn('w-73.75', props.class)">
    <div class="flex flex-col gap-0.5">
      <div 
        v-for="option in options" 
        :key="option.id"
        class="flex items-center space-x-3 rounded-md px-3 py-2.5 transition-colors hover:bg-gray-100 cursor-pointer group"
        @click="handleToggle(option.id)"
      >
        <Checkbox 
          :key="`${option.id}-${modelValue.includes(option.id)}`"
          :model-value="modelValue.includes(option.id)"
          class="pointer-events-none" 
        />
        
        <span class="flex-1 select-none text-[15px] font-medium text-slate-500 group-hover:text-slate-900 transition-colors">
          {{ option.label }}
        </span>
      </div>
    </div>
  </div>
</template>