<script setup lang="ts">
import type { DateValue } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { computed } from "vue"
import { useDateFormatter } from "reka-ui"
import { toDate } from "reka-ui/date"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

interface Props {
  modelValue?: DateValue
  placeholder?: string
  class?: HTMLAttributes["class"]
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: undefined,
  placeholder: "Pick a date",
  disabled: false,
})

const emit = defineEmits<{
  (e: "update:modelValue", value: DateValue | undefined): void
}>()

const formatter = useDateFormatter("en")

const label = computed(() => {
  if (!props.modelValue) return props.placeholder
  return formatter.custom(toDate(props.modelValue), { dateStyle: "medium" })
})
</script>

<template>
  <Popover>
    <PopoverTrigger as-child>
      <Button
        variant="outline"
        :disabled="disabled"
        :class="cn('w-full justify-start text-left font-normal', !modelValue && 'text-muted-foreground', props.class)"
      >
        {{ label }}
      </Button>
    </PopoverTrigger>
    <PopoverContent class="w-auto p-0" align="start">
      <Calendar
        :model-value="modelValue"
        initial-focus
        @update:model-value="(value) => emit('update:modelValue', value)"
      />
    </PopoverContent>
  </Popover>
</template>

