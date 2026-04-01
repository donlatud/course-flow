<script setup lang="ts">
import type { ProgressRootProps } from "reka-ui"
import type { HTMLAttributes } from "vue"
import { reactiveOmit } from "@vueuse/core"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

const props = withDefaults(
  defineProps<ProgressRootProps & { class?: HTMLAttributes["class"] }>(),
  {
    modelValue: 0,
  },
)

const delegatedProps = reactiveOmit(props, "class")
</script>

<template>
  <Progress
    v-bind="delegatedProps"
    :class="
      cn(
        'h-2 w-full border-0 shadow-none bg-gray-200 **:data-[slot=progress-indicator]:bg-gradient-linear-2',
        props.class,
      )
    "
  />
</template>
