<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { computed, useAttrs } from "vue"
import { cn } from "@/lib/utils"

export type StatusTagVariant =
  | "pending"
  | "in_progress"
  | "submitted"
  | "overdue"

interface Props {
  variant: StatusTagVariant
  /** Override the default label for a variant. */
  label?: string
  class?: HTMLAttributes["class"]
}

defineOptions({ inheritAttrs: false })

const props = defineProps<Props>()
const attrs = useAttrs()

const DEFAULT_LABEL: Record<StatusTagVariant, string> = {
  pending: "Pending",
  in_progress: "In Progress",
  submitted: "Submitted",
  overdue: "Overdue",
}

const VARIANT_CLASS: Record<StatusTagVariant, string> = {
  pending: "w-[79px] h-[32px] text-[16px] bg-[#FFFBDB] text-[#996500]",
  in_progress: "w-[103px] h-[32px] text-[16px] bg-[#EBF0FF] text-[#3557CF]",
  submitted: "w-[86px] h-[28px] text-[14px] bg-[#DDF9EF] text-[#0A7B60]",
  overdue: "w-[74px] h-[29px] text-[14px] bg-[#FAE7F4] text-[#9B2FAC]",
}

const tagClass = computed(() =>
  cn(
    "inline-flex items-center justify-center rounded-[4px] px-2 py-1 font-medium text-center",
    VARIANT_CLASS[props.variant],
    props.class,
    (attrs as Record<string, unknown>).class as HTMLAttributes["class"],
  ),
)

const resolvedLabel = computed(() => props.label ?? DEFAULT_LABEL[props.variant])
</script>

<template>
  <section v-bind="attrs" :class="tagClass">
    <slot>{{ resolvedLabel }}</slot>
  </section>
</template>

