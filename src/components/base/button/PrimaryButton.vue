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

const primaryButtonClass = computed(() =>
  cn(
    "shadow-1 bg-blue-500 text-white text-[16px] font-bold w-[126px] h-[60px] rounded-[12px] py-[18px] px-8",
    "enabled:transition-all enabled:duration-300 enabled:ease-in-out",
    "enabled:hover:bg-blue-400 enabled:active:bg-blue-700",
    "disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer",
    props.class,
    (attrs as Record<string, unknown>).class as HTMLAttributes["class"],
  ),
)
</script>

<template>
  <Button v-bind="forwardedAttrs" :disabled="isDisabled" :class="primaryButtonClass">
    <slot />
  </Button>
</template>