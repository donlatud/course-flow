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

const secondaryButtonClass = computed(() =>
  cn(
    "shadow-1 bg-white border border-orange-500 text-orange-500 text-[16px] font-bold w-[149px] h-[60px] rounded-[12px] py-[18px] px-8",
    "enabled:transition-all enabled:duration-300 enabled:ease-in-out",
    "enabled:hover:border-orange-100 enabled:hover:bg-white enabled:hover:text-orange-100 enabled:active:bg-gray-100",
    "disabled:bg-white disabled:border-gray-500 disabled:text-gray-500 disabled:cursor-not-allowed",
    props.class,
    (attrs as Record<string, unknown>).class as HTMLAttributes["class"],
  ),
)
</script>

<template>
  <Button v-bind="forwardedAttrs" :disabled="isDisabled" :class="secondaryButtonClass">
    <slot />
  </Button>
</template>