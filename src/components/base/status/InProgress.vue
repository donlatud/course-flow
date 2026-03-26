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
  label: "In Progress",
})

const attrs = useAttrs()

const inProgressClass = computed(() =>
  cn(
    "w-[103px] h-[32px] rounded-[4px] px-2 py-1 text-[16px] font-medium text-center",
    "bg-[#EBF0FF] text-[#3557CF]",
    props.class,
    (attrs as Record<string, unknown>).class as HTMLAttributes["class"],
  ),
)
</script>

<template>
  <section v-bind="attrs" :class="inProgressClass">
    <slot>{{ props.label }}</slot>
  </section>
</template>
