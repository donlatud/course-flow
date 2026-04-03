<script setup lang="ts">
import type { SelectItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
// import { Check } from "lucide-vue-next"
import {
  SelectItem,
  SelectItemText,
  useForwardProps,
} from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<SelectItemProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <SelectItem
    v-bind="forwardedProps"
    :class="cn(
      // Match padding when checkmark is removed
      'relative flex w-full cursor-default items-center rounded-sm py-2 px-4 text-sm outline-none select-none transition-colors',
      
      // Focus
      'focus:bg-gray-100 focus:text-accent-foreground',
      
      // Selected (checked) background
      'data-[state=checked]:bg-gray-100 data-[state=checked]:font-medium', 
      
      props.class,
    )"
  >
    <SelectItemText>
      <slot />
    </SelectItemText>

    </SelectItem>
</template>
