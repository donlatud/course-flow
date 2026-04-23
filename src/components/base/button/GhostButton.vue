<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, useAttrs } from "vue"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface Props {
  disabled?: boolean
  class?: HTMLAttributes["class"]
}

defineOptions({ inheritAttrs: false })

const props = defineProps<Props>()
const attrs = useAttrs()

const isDisabled = computed(() => props.disabled ?? Boolean((attrs as Record<string, unknown>).disabled))

const forwardedAttrs = computed(() => {
  const { class: _class, disabled: _disabled, ...rest } = attrs as Record<string, unknown>
  return rest
})

const ghostButtonClass = computed(() =>
  cn(
    "bg-white text-blue-500 text-[16px] font-bold w-[82px] h-[32px] py-1 px-2",
    "enabled:transition-all enabled:duration-300 enabled:ease-in-out",
    "enabled:hover:bg-white enabled:hover:text-blue-400 enabled:active:text-blue-600",
    "disabled:bg-white disabled:text-gray-500 disabled:cursor-not-allowed cursor-pointer",
    props.class,
    (attrs as Record<string, unknown>).class as HTMLAttributes["class"],
  ),
)
</script>

<template>
  <Button v-bind="forwardedAttrs" :disabled="isDisabled" :class="ghostButtonClass">
    <slot />
  </Button>
</template>