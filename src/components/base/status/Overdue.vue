<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, useAttrs } from "vue"
import { cn } from "@/lib/utils"

interface Props {
  label?: string
  class?: HTMLAttributes["class"]
}

defineOptions({ inheritAttrs: false })

const props = withDefaults(defineProps<Props>(), {
  label: "Overdue",
})

const attrs = useAttrs()

const overdueClass = computed(() =>
  cn(
    "w-[74px] h-[29px] rounded-[4px] px-2 py-1 text-[14px] font-medium text-center",
    "bg-[#FAE7F4] text-[#9B2FAC]",
    props.class,
    (attrs as Record<string, unknown>).class as HTMLAttributes["class"],
  ),
)
</script>

<template>
  <section v-bind="attrs" :class="overdueClass">
    <slot>{{ props.label }}</slot>
  </section>
</template>
