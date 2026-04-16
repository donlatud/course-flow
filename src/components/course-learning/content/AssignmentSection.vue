<script setup lang="ts">
import { computed } from "vue"
import PrimaryButton from "@/components/base/button/PrimaryButton.vue"
import Textarea from "@/components/ui/textarea/Textarea.vue"
import StatusTag from "@/components/base/status/StatusTag.vue"
import type { StatusTagVariant } from "@/components/base/status/StatusTag.vue"

const props = defineProps<{
  modelValue: string
  status: StatusTagVariant
  submitted: boolean
  title?: string
  prompt?: string | null
  solution?: string | null
  loading?: boolean
  submitting?: boolean
  error?: string | null
  submittedAnswer?: string
}>()

const emit = defineEmits<{
  "update:modelValue": [value: string]
  submit: []
}>()

const submittedAnswer = computed(() => props.submittedAnswer ?? props.modelValue)

function onSubmit() {
  emit("submit")
}
</script>

<template>
  <section class="flex flex-col gap-4 rounded-[8px] bg-blue-100 p-4 md:gap-5 md:p-5 lg:mt-[47px] lg:gap-[25px] lg:p-6">
    <header class="flex items-center justify-between">
      <div class="text-body1 text-black">
        {{ title || "Assignment" }}
      </div>
      <StatusTag :variant="status" />
    </header>

    <div class="flex flex-col gap-2">
      <div class="text-body2 text-black">
        {{ prompt || "Answer the question below." }}
      </div>

      <Textarea
        v-if="!submitted"
        :model-value="modelValue"
        placeholder="Answer..."
        class="min-h-[96px] resize-none rounded-[8px] border border-gray-400 bg-white px-4 py-3 text-body2 text-gray-900 placeholder:text-gray-500 shadow-none ring-0 focus-visible:border-orange-500 focus-visible:ring-2 focus-visible:ring-orange-500/20"
        :disabled="Boolean(loading) || Boolean(submitting)"
        @update:model-value="(v) => emit('update:modelValue', String(v))"
      />

      <pre
        v-else
        class="whitespace-pre-wrap text-body3 text-gray-700"
      >{{ submittedAnswer }}</pre>
    </div>

    <details
      v-if="solution && solution.trim().length > 0"
      :open="submitted"
      class="rounded-[8px] bg-white px-4 py-3"
    >
      <summary class="cursor-pointer select-none text-body2 text-gray-900">
        Solution
        <span v-if="!submitted" class="text-body4 text-gray-600">
          (submit to view)
        </span>
      </summary>
      <div class="mt-3">
        <pre
          class="whitespace-pre-wrap text-body3 text-gray-700"
          aria-label="Solution"
        >{{ submitted ? solution : "" }}</pre>
      </div>
    </details>

    <p
      v-if="error"
      class="text-body4 text-gray-900"
      role="alert"
    >
      {{ error }}
    </p>

    <div
      v-if="!submitted"
      class="flex flex-col gap-2 lg:flex-row lg:gap-0 lg:justify-between lg:items-center lg:h-15"
    >
      <PrimaryButton
        type="button"
        class="h-15 w-full lg:w-[203px]"
        :disabled="Boolean(loading) || Boolean(submitting) || modelValue.trim().length === 0"
        @click="onSubmit"
      >
        {{ submitting ? "Sending…" : "Send Assignment" }}
      </PrimaryButton>
      <div class="text-body3 text-gray-700">
        {{ loading ? "Loading assignment…" : "Due date available in details" }}
      </div>
    </div>
  </section>
</template>