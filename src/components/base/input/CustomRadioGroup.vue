<script setup lang="ts">
import { RadioGroup } from '@/components/ui/radio-group'
import RadioGroupItem from '@/components/ui/radio-group/RadioGroupItem.vue'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

interface Option {
  id: string | number
  label: string
}

const props = defineProps<{
  options: Option[]
  modelValue: string | number | undefined
  class?: string
}>()

const emit = defineEmits(['update:modelValue'])
</script>

<template>
  <RadioGroup
    :model-value="String(modelValue)"
    @update:model-value="(val) => emit('update:modelValue', val)"
    :class="cn('flex flex-col gap-1 w-73.75', props.class)"
  >
    <div 
      v-for="option in options" 
      :key="option.id"
      class="flex items-center space-x-3 rounded-md px-3 py-3 transition-colors hover:bg-gray-100 cursor-pointer group"
      @click="emit('update:modelValue', option.id)"
    >
      <RadioGroupItem 
        :key="`${option.id}-${modelValue === option.id}`"
        :id="String(option.id)" 
        :value="String(option.id)"
        class="pointer-events-none" 
      />
      
      <Label 
        :for="String(option.id)"
        class="flex-1 cursor-pointer text-[15px] font-medium text-slate-600 group-hover:text-slate-900 transition-colors"
        @click.stop
      >
        {{ option.label }}
      </Label>
    </div>
  </RadioGroup>
</template>