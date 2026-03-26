<script setup lang="ts">
import type { HTMLAttributes } from "vue"
import { Loader2 } from "lucide-vue-next"
import { cn } from "@/lib/utils"

interface Props {
  class?: HTMLAttributes["class"]
  size?: number
}

withDefaults(defineProps<Props>(), {
  size: 16,
})
</script>

<template>
  <Loader2
    aria-hidden="true"
    :size="size"
    :class="cn('animate-spin', $props.class)"
  />
</template>

