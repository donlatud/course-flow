<script setup lang="ts">
import type { HTMLAttributes } from "vue";
import { cn, fileNameFromAttachmentUrl } from "@/lib/utils";
import { FileText, Plus, X } from "lucide-vue-next";
import { ref } from "vue";

const props = defineProps<{
  title: string;
  subtitle: string;
  uploadtext: string;
  class?: HTMLAttributes["class"];
  /** e.g. PDF, Word — not images/videos */
  accept?: string;
  disabled?: boolean;
  modelValue?: File | null;
  /** Existing uploaded URL — shown when modelValue is null (for edit forms) */
  existingUrl?: string;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", file: File | null): void;
  (e: "change", file: File | null): void;
}>();

const inputRef = ref<HTMLInputElement | null>(null);

function openPicker() {
  if (props.disabled) return;
  inputRef.value?.click();
}

function onFileChange(ev: Event) {
  const input = ev.target as HTMLInputElement;
  const file = input.files?.[0] ?? null;
  emit("update:modelValue", file);
  emit("change", file);
  input.value = "";
}

function clearFile(ev: Event) {
  ev.stopPropagation();
  if (props.disabled) return;
  emit("update:modelValue", null);
  emit("change", null);
}

const defaultAccept =
  ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document";

const boxClass =
  "relative h-[160px] w-[160px] shrink-0 flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-gray-200 bg-[#F5F7FB] p-3";
</script>

<template>
  <div class="flex w-full flex-col gap-2">
    <div class="flex flex-col gap-1">
      <span class="text-body3 font-medium text-gray-800">{{ title }}</span>
      <p class="text-body4 text-gray-500">{{ subtitle }}</p>
    </div>

    <!-- Selected: file name only; click area to pick another file -->
    <div
      v-if="modelValue"
      role="button"
      tabindex="0"
      :class="
        cn(
          'relative cursor-pointer transition-colors hover:border-blue-300 hover:bg-[#EEF2FA]',
          boxClass,
          props.class,
        )
      "
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
    >
      <FileText
        class="h-8 w-8 shrink-0 text-blue-400"
        :stroke-width="1.5"
        aria-hidden="true"
      />
      <p
        class="line-clamp-3 w-full break-all text-center text-[11px] leading-snug text-gray-800"
      >
        {{ modelValue.name }}
      </p>
      <button
        type="button"
        class="absolute right-2 top-2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow-md transition-colors hover:bg-white disabled:opacity-50"
        :disabled="disabled"
        aria-label="Remove file"
        @click="clearFile"
      >
        <X class="h-4 w-4" :stroke-width="2" />
      </button>
    </div>

    <!-- Existing file URL (edit mode) -->
    <div
      v-else-if="!modelValue && existingUrl"
      role="button"
      tabindex="0"
      :class="
        cn(
          'relative cursor-pointer transition-colors hover:border-blue-300 hover:bg-[#EEF2FA]',
          boxClass,
          props.class,
        )
      "
      @click="openPicker"
      @keydown.enter.prevent="openPicker"
    >
      <FileText
        class="h-8 w-8 shrink-0 text-blue-400"
        :stroke-width="1.5"
        aria-hidden="true"
      />
      <p
        class="line-clamp-3 w-full break-all text-center text-[11px] leading-snug text-gray-800"
      >
        {{ existingUrl.split("/").pop() ?? "Attached file" }}
      </p>
      <span class="text-[10px] text-blue-500">Click to replace</span>
    </div>

    <!-- Empty -->
    <button
      v-else
      type="button"
      :class="
        cn(
          'group cursor-pointer transition-colors hover:border-blue-300 hover:bg-[#EEF2FA] disabled:cursor-not-allowed disabled:opacity-50',
          boxClass,
          props.class,
        )
      "
      :disabled="disabled"
      @click="openPicker"
    >
      <Plus
        class="h-6 w-6 text-blue-400 transition-colors group-hover:text-blue-600"
        :stroke-width="2"
        aria-hidden="true"
      />
      <span class="text-body3 font-medium text-blue-400 group-hover:text-blue-600">
        {{ uploadtext }}
      </span>
    </button>

    <input
      ref="inputRef"
      type="file"
      class="sr-only"
      tabindex="-1"
      :accept="accept ?? defaultAccept"
      :disabled="disabled"
      @change="onFileChange"
    >
  </div>
</template>
