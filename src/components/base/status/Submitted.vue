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
  label: "Submitted",
})

const attrs = useAttrs()

const submittedClass = computed(() =>
  cn(
    "w-[86px] h-[28px] rounded-[4px] px-2 py-1 text-[14px] font-medium text-center",
    "bg-[#DDF9EF] text-[#0A7B60]",
    props.class,
    (attrs as Record<string, unknown>).class as HTMLAttributes["class"],
  ),
)
</script>

<template>
  <section v-bind="attrs" :class="submittedClass">
    <slot>{{ props.label }}</slot>
  </section>
</template>
