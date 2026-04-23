<script setup lang="ts">
import type { RadioGroupItemProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
// import { CircleIcon } from "lucide-vue-next"
import {
  RadioGroupIndicator,
  RadioGroupItem,
  useForwardProps,
} from "reka-ui"
import { cn } from "@/lib/utils"

const props = defineProps<RadioGroupItemProps & { class?: HTMLAttributes["class"] }>()

const delegatedProps = reactiveOmit(props, "class")

const forwardedProps = useForwardProps(delegatedProps)
</script>

<template>
  <RadioGroupItem
    v-bind="forwardedProps"
    :class="
      cn(
        'aspect-square h-5 w-5 rounded-full border border-slate-400 bg-white shadow-sm transition-all outline-none',
        'focus-visible:ring-2 focus-visible:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50',
        'data-[state=checked]:border-blue-500! data-[state=checked]:border-2',
        props.class,
      )
    "
  >
    <RadioGroupIndicator class="flex items-center justify-center">
      <div class="h-2.5 w-2.5 rounded-full bg-blue-500" />
    </RadioGroupIndicator>
  </RadioGroupItem>
</template>
